"""FLRW background and causal scales for the cosmic causal-structure atlas."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from scipy.integrate import cumulative_trapezoid

Array = np.ndarray

SPEED_OF_LIGHT_KM_S = 299_792.458
MPC_IN_KM = 3.085677581491367e19
SECONDS_PER_GYR = 365.25 * 24.0 * 3600.0 * 1.0e9


@dataclass(frozen=True, slots=True)
class FlatLambdaCDM:
    """Spatially flat radiation + matter + cosmological-constant background."""

    hubble_constant_km_s_mpc: float = 67.4
    omega_radiation: float = 9.2e-5
    omega_matter: float = 0.315

    def __post_init__(self) -> None:
        values = (
            self.hubble_constant_km_s_mpc,
            self.omega_radiation,
            self.omega_matter,
        )
        if not all(np.isfinite(values)):
            raise ValueError("Cosmological parameters must be finite")
        if self.hubble_constant_km_s_mpc <= 0:
            raise ValueError("H0 must be positive")
        if self.omega_radiation <= 0 or self.omega_matter <= 0:
            raise ValueError("Radiation and matter densities must be positive")
        if self.omega_lambda <= 0:
            raise ValueError("Flatness requires positive Omega_Lambda")

    @property
    def omega_lambda(self) -> float:
        return 1.0 - self.omega_radiation - self.omega_matter

    @property
    def hubble_constant_gyr_inverse(self) -> float:
        return self.hubble_constant_km_s_mpc * SECONDS_PER_GYR / MPC_IN_KM

    @property
    def hubble_distance_gpc(self) -> float:
        return SPEED_OF_LIGHT_KM_S / self.hubble_constant_km_s_mpc / 1000.0

    def expansion_rate(self, scale_factor: Array | float) -> Array:
        """Return the dimensionless expansion rate ``E(a) = H(a)/H0``."""

        a = np.asarray(scale_factor, dtype=float)
        if np.any(~np.isfinite(a)) or np.any(a <= 0):
            raise ValueError("Scale factors must be finite and positive")
        return np.sqrt(self.omega_radiation / a**4 + self.omega_matter / a**3 + self.omega_lambda)


@dataclass(frozen=True, slots=True)
class CosmicHistory:
    """Sampled post-inflationary background and radial horizon scales."""

    scale_factor: Array
    cosmic_time_gyr: Array
    eta_gpc: Array
    event_horizon_comoving_gpc: Array
    hubble_radius_comoving_gpc: Array
    cosmology: FlatLambdaCDM

    def at(self, values: Array, scale_factor: float) -> float:
        """Interpolate a sampled quantity logarithmically in scale factor."""

        value = float(scale_factor)
        if value < self.scale_factor[0] or value > self.scale_factor[-1]:
            raise ValueError("Requested scale factor lies outside the sampled history")
        return float(np.interp(np.log(value), np.log(self.scale_factor), values))

    @property
    def present_eta_gpc(self) -> float:
        return self.at(self.eta_gpc, 1.0)

    @property
    def present_age_gyr(self) -> float:
        return self.at(self.cosmic_time_gyr, 1.0)

    def past_light_cone_comoving_gpc(self) -> Array:
        """Return the positive branch of the light cone received now."""

        return self.present_eta_gpc - self.eta_gpc


def _scale_factor_grid(
    minimum: float,
    maximum: float,
    samples: int,
    required: tuple[float, ...],
) -> Array:
    if not (0 < minimum < 1 < maximum):
        raise ValueError("Require 0 < minimum < 1 < maximum")
    if samples < 100:
        raise ValueError("At least 100 samples are required")
    base = np.geomspace(minimum, maximum, samples)
    extras = np.asarray([value for value in required if minimum <= value <= maximum])
    return np.unique(np.concatenate((base, extras)))


def compute_history(
    cosmology: FlatLambdaCDM | None = None,
    *,
    minimum_scale_factor: float = 1.0e-28,
    maximum_scale_factor: float = 1.0e4,
    samples: int = 8000,
) -> CosmicHistory:
    """Integrate cosmic time, conformal time, and the standard horizon scales."""

    model = cosmology or FlatLambdaCDM()
    a = _scale_factor_grid(
        minimum_scale_factor,
        maximum_scale_factor,
        samples,
        required=(1.0 / 1100.0, 1.0),
    )
    expansion = model.expansion_rate(a)
    time_integrand = 1.0 / (a * model.hubble_constant_gyr_inverse * expansion)
    conformal_integrand = model.hubble_distance_gpc / (a**2 * expansion)

    initial_time = minimum_scale_factor**2 / (
        2.0 * model.hubble_constant_gyr_inverse * np.sqrt(model.omega_radiation)
    )
    initial_eta = model.hubble_distance_gpc * minimum_scale_factor / np.sqrt(model.omega_radiation)
    cosmic_time = initial_time + cumulative_trapezoid(time_integrand, a, initial=0.0)
    eta = initial_eta + cumulative_trapezoid(conformal_integrand, a, initial=0.0)

    future_tail = model.hubble_distance_gpc / (np.sqrt(model.omega_lambda) * maximum_scale_factor)
    eta_infinity = eta[-1] + future_tail
    return CosmicHistory(
        scale_factor=a,
        cosmic_time_gyr=cosmic_time,
        eta_gpc=eta,
        event_horizon_comoving_gpc=eta_infinity - eta,
        hubble_radius_comoving_gpc=model.hubble_distance_gpc / (a * expansion),
        cosmology=model,
    )


@dataclass(frozen=True, slots=True)
class InflationStage:
    """Finite constant-H inflation joined continuously in H at reheating."""

    history: CosmicHistory
    a_reheat: float = 1.0e-28
    e_folds: float = 62.0

    def __post_init__(self) -> None:
        if self.e_folds <= 0 or not np.isfinite(self.e_folds):
            raise ValueError("The inflationary e-fold count must be finite and positive")
        if not self.history.scale_factor[0] <= self.a_reheat <= 1.0:
            raise ValueError("a_reheat must lie inside the sampled pre-present history")

    @property
    def expansion_rate_during_inflation(self) -> float:
        return float(self.history.cosmology.expansion_rate(self.a_reheat))

    @property
    def comoving_hubble_radius_at_end_gpc(self) -> float:
        model = self.history.cosmology
        return model.hubble_distance_gpc / (self.a_reheat * self.expansion_rate_during_inflation)

    @property
    def eta_at_end_gpc(self) -> float:
        return self.history.at(self.history.eta_gpc, self.a_reheat)

    @property
    def eta_at_start_gpc(self) -> float:
        span = self.comoving_hubble_radius_at_end_gpc * np.expm1(self.e_folds)
        return self.eta_at_end_gpc - span

    def sample(self, samples: int = 800) -> tuple[Array, Array, Array, Array, Array]:
        """Return e-fold, scale factor, cosmic time, conformal time, and Hubble radius."""

        if samples < 2:
            raise ValueError("At least two inflation samples are required")
        e_fold = np.linspace(-self.e_folds, 0.0, samples)
        a = self.a_reheat * np.exp(e_fold)
        radius_end = self.comoving_hubble_radius_at_end_gpc
        radius = radius_end * np.exp(-e_fold)
        eta = self.eta_at_end_gpc - radius_end * (np.exp(-e_fold) - 1.0)
        hubble_gyr_inverse = (
            self.history.cosmology.hubble_constant_gyr_inverse
            * self.expansion_rate_during_inflation
        )
        cosmic_time = (e_fold + self.e_folds) / hubble_gyr_inverse
        return e_fold, a, cosmic_time, eta, radius


@dataclass(frozen=True, slots=True)
class CoordinateHistory:
    """Finite history used by all four coordinate representations."""

    scale_factor: Array
    cosmic_time_gyr: Array
    eta_gpc: Array
    past_light_cone_comoving_gpc: Array
    particle_horizon_comoving_gpc: Array
    event_horizon_comoving_gpc: Array
    hubble_radius_comoving_gpc: Array
    inflation_mask: Array
    eta_start_gpc: float
    eta_reheating_gpc: float | None
    time_reheating_gyr: float | None

    def at_eta(self, values: Array, eta_gpc: float) -> float:
        """Interpolate a sampled value at conformal time ``c eta``."""

        eta = float(eta_gpc)
        if eta < self.eta_gpc[0] or eta > self.eta_gpc[-1]:
            raise ValueError("Requested conformal time lies outside the sampled history")
        return float(np.interp(eta, self.eta_gpc, values))


def hot_big_bang_coordinate_history(history: CosmicHistory) -> CoordinateHistory:
    """Restrict the post-inflationary solution to reheating through the present."""

    mask = history.scale_factor <= 1.0
    a = history.scale_factor[mask]
    eta = history.eta_gpc[mask]
    time = history.cosmic_time_gyr[mask]
    return CoordinateHistory(
        scale_factor=a,
        cosmic_time_gyr=time,
        eta_gpc=eta,
        past_light_cone_comoving_gpc=history.present_eta_gpc - eta,
        particle_horizon_comoving_gpc=eta,
        event_horizon_comoving_gpc=history.event_horizon_comoving_gpc[mask],
        hubble_radius_comoving_gpc=history.hubble_radius_comoving_gpc[mask],
        inflation_mask=np.zeros_like(a, dtype=bool),
        eta_start_gpc=float(eta[0]),
        eta_reheating_gpc=None,
        time_reheating_gyr=None,
    )


def combine_inflation_and_hot_big_bang(
    history: CosmicHistory,
    inflation: InflationStage,
    *,
    inflation_samples: int = 800,
) -> CoordinateHistory:
    """Join finite de Sitter inflation to the post-reheating history."""

    if inflation.history is not history:
        raise ValueError("InflationStage must reference the supplied CosmicHistory")
    _, a_inflation, time_inflation, eta_inflation, radius_inflation = inflation.sample(
        inflation_samples
    )
    post_mask = (history.scale_factor > inflation.a_reheat) & (history.scale_factor <= 1.0)
    time_at_reheating = history.at(history.cosmic_time_gyr, inflation.a_reheat)
    time_post = time_inflation[-1] + history.cosmic_time_gyr[post_mask] - time_at_reheating
    a = np.concatenate((a_inflation, history.scale_factor[post_mask]))
    time = np.concatenate((time_inflation, time_post))
    eta = np.concatenate((eta_inflation, history.eta_gpc[post_mask]))
    hubble_radius = np.concatenate(
        (radius_inflation, history.hubble_radius_comoving_gpc[post_mask])
    )
    eta_infinity = float(history.eta_gpc[-1] + history.event_horizon_comoving_gpc[-1])
    eta_start = float(eta_inflation[0])
    return CoordinateHistory(
        scale_factor=a,
        cosmic_time_gyr=time,
        eta_gpc=eta,
        past_light_cone_comoving_gpc=history.present_eta_gpc - eta,
        particle_horizon_comoving_gpc=eta - eta_start,
        event_horizon_comoving_gpc=eta_infinity - eta,
        hubble_radius_comoving_gpc=hubble_radius,
        inflation_mask=np.concatenate(
            (
                np.ones_like(a_inflation, dtype=bool),
                np.zeros(np.count_nonzero(post_mask), dtype=bool),
            )
        ),
        eta_start_gpc=eta_start,
        eta_reheating_gpc=inflation.eta_at_end_gpc,
        time_reheating_gyr=float(time_inflation[-1]),
    )


@dataclass(frozen=True, slots=True)
class CausalSummary:
    """CMB last-scattering scales used in the causal-overlap construction."""

    a_recombination: float
    eta_recombination_gpc: float
    time_recombination_gyr: float
    chi_last_scattering_gpc: float
    past_cone_intersection_eta_gpc: float
    inflation_start_eta_gpc: float
    inflation_contains_intersection: bool


def causal_summary(
    history: CosmicHistory,
    inflation: InflationStage,
    *,
    redshift_recombination: float = 1099.0,
) -> CausalSummary:
    """Return the geometry of opposite points on the last-scattering sphere."""

    a_recombination = 1.0 / (1.0 + redshift_recombination)
    eta_recombination = history.at(history.eta_gpc, a_recombination)
    chi_last_scattering = history.present_eta_gpc - eta_recombination
    intersection = eta_recombination - chi_last_scattering
    return CausalSummary(
        a_recombination=a_recombination,
        eta_recombination_gpc=eta_recombination,
        time_recombination_gyr=history.at(history.cosmic_time_gyr, a_recombination),
        chi_last_scattering_gpc=chi_last_scattering,
        past_cone_intersection_eta_gpc=intersection,
        inflation_start_eta_gpc=inflation.eta_at_start_gpc,
        inflation_contains_intersection=inflation.eta_at_start_gpc < intersection,
    )


def cmb_past_light_rays(
    *,
    eta_start_gpc: float,
    eta_recombination_gpc: float,
    chi_last_scattering_gpc: float,
    samples: int = 600,
) -> tuple[Array, Array, Array]:
    """Return the inward past-directed null rays from opposite CMB points."""

    if not eta_start_gpc < eta_recombination_gpc:
        raise ValueError("eta_start must precede recombination")
    if chi_last_scattering_gpc <= 0:
        raise ValueError("chi_last_scattering must be positive")
    if samples < 2:
        raise ValueError("At least two ray samples are required")
    eta = np.linspace(eta_start_gpc, eta_recombination_gpc, samples)
    elapsed = eta_recombination_gpc - eta
    right = chi_last_scattering_gpc - elapsed
    left = -chi_last_scattering_gpc + elapsed
    return eta, right, left


def proper_distance(scale_factor: Array | float, comoving_distance_gpc: Array | float) -> Array:
    """Return FLRW proper distance on a constant-cosmic-time slice."""

    a = np.asarray(scale_factor, dtype=float)
    chi = np.asarray(comoving_distance_gpc, dtype=float)
    if np.any(~np.isfinite(a)) or np.any(a < 0) or np.any(~np.isfinite(chi)):
        raise ValueError("Scale factors and distances must be finite, with a non-negative")
    return a * chi
