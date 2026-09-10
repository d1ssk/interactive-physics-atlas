"""Authoritative free-scalar vacuum sampling on a periodic spatial lattice.

Units are hbar = c = 1.  Equal-time canonical data are sampled from the
positive Wigner function of the free vacuum.  Free evolution of those data
reproduces symmetrized (Hadamard) correlation functions; it is not a positive
probability representation of a Lorentzian path integral.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

FloatArray = NDArray[np.float64]
ComplexArray = NDArray[np.complex128]


@dataclass(frozen=True, slots=True)
class VacuumState:
    """Spectral canonical data for one regulated vacuum realization."""

    n: int
    dimension: int
    length: float
    mass: float
    cutoff_fraction: float
    seed: int
    spacing: float
    omega: FloatArray
    window: FloatArray
    wave_numbers: tuple[FloatArray, ...]
    field_modes: ComplexArray
    momentum_modes: ComplexArray

    @property
    def shape(self) -> tuple[int, ...]:
        """Return the equal-sided lattice shape."""

        return (self.n,) * self.dimension

    @property
    def site_count(self) -> int:
        """Return the number of spatial lattice sites."""

        return self.n**self.dimension

    @property
    def cutoff(self) -> float:
        """Return the radial continuum-wave-number display cutoff."""

        return self.cutoff_fraction * np.pi / self.spacing


def _validate_parameters(
    n: int,
    dimension: int,
    length: float,
    mass: float,
    cutoff_fraction: float,
) -> None:
    if n < 4:
        raise ValueError("n must be at least four")
    if dimension not in (1, 2, 3):
        raise ValueError("dimension must be one, two, or three")
    if length <= 0.0 or mass <= 0.0:
        raise ValueError("length and mass must be positive")
    if not 0.0 < cutoff_fraction <= 1.0:
        raise ValueError("cutoff_fraction must lie in (0, 1]")


def sample_vacuum(
    *,
    n: int,
    dimension: int,
    length: float = 12.0,
    mass: float = 0.4,
    cutoff_fraction: float = 0.46,
    seed: int = 42,
) -> VacuumState:
    """Sample canonical data from the UV-smoothed free-vacuum Wigner function.

    The lattice dispersion is

        omega(k)^2 = m^2 + sum_i [2 sin(k_i a / 2) / a]^2.

    Each displayed field mode is multiplied by the declared smooth window

        W(k) = exp[-(1/2) (|k| / Lambda)^8].

    Applying the same window to both canonical variables preserves the exact
    free time evolution of the displayed, coarse-grained realization.
    """

    _validate_parameters(n, dimension, length, mass, cutoff_fraction)
    spacing = length / n
    one_dimensional_k = 2.0 * np.pi * np.fft.fftfreq(n, d=spacing)
    wave_numbers = tuple(
        np.asarray(component, dtype=float)
        for component in np.meshgrid(
            *([one_dimensional_k] * dimension), indexing="ij", sparse=False
        )
    )
    lattice_k_squared = np.zeros((n,) * dimension, dtype=float)
    continuum_k_squared = np.zeros_like(lattice_k_squared)
    for component in wave_numbers:
        lattice_k_squared += (2.0 * np.sin(component * spacing / 2.0) / spacing) ** 2
        continuum_k_squared += component**2

    omega = np.sqrt(mass**2 + lattice_k_squared)
    cutoff = cutoff_fraction * np.pi / spacing
    window = np.exp(-0.5 * (np.sqrt(continuum_k_squared) / cutoff) ** 8)

    generator = np.random.default_rng(seed)
    field_noise = generator.standard_normal((n,) * dimension)
    momentum_noise = generator.standard_normal((n,) * dimension)
    field_modes = np.fft.fftn(field_noise) * window / np.sqrt(2.0 * omega)
    momentum_modes = np.fft.fftn(momentum_noise) * window * np.sqrt(omega / 2.0)
    return VacuumState(
        n=n,
        dimension=dimension,
        length=length,
        mass=mass,
        cutoff_fraction=cutoff_fraction,
        seed=seed,
        spacing=spacing,
        omega=omega,
        window=window,
        wave_numbers=wave_numbers,
        field_modes=field_modes,
        momentum_modes=momentum_modes,
    )


def configuration_at(state: VacuumState, time: float = 0.0) -> tuple[FloatArray, FloatArray]:
    """Return the real field and canonical momentum at ``time``."""

    cosine = np.cos(state.omega * time)
    sine = np.sin(state.omega * time)
    field_modes = state.field_modes * cosine + state.momentum_modes * sine / state.omega
    momentum_modes = state.momentum_modes * cosine - state.omega * state.field_modes * sine
    return np.fft.ifftn(field_modes).real, np.fft.ifftn(momentum_modes).real


def local_quadratic_density(
    field: FloatArray,
    momentum: FloatArray,
    state: VacuumState,
) -> FloatArray:
    """Return the positive lattice quadratic form at every site.

    Its spatial sum equals the sampled lattice Hamiltonian.  It is not a
    renormalized local quantum-energy observable.
    """

    if field.shape != state.shape or momentum.shape != state.shape:
        raise ValueError("field arrays must match the state lattice")
    gradient_squared = np.zeros(state.shape, dtype=float)
    for axis in range(state.dimension):
        derivative = (np.roll(field, -1, axis=axis) - field) / state.spacing
        gradient_squared += derivative**2
    return 0.5 * (momentum**2 + gradient_squared + state.mass**2 * field**2)


def spectral_energy(state: VacuumState, time: float = 0.0) -> float:
    """Return the conserved lattice Hamiltonian of one sampled trajectory."""

    cosine = np.cos(state.omega * time)
    sine = np.sin(state.omega * time)
    field_modes = state.field_modes * cosine + state.momentum_modes * sine / state.omega
    momentum_modes = state.momentum_modes * cosine - state.omega * state.field_modes * sine
    energy = np.abs(momentum_modes) ** 2 + state.omega**2 * np.abs(field_modes) ** 2
    return float(np.sum(energy) / (2.0 * state.site_count))


def expected_field_variance(state: VacuumState) -> float:
    """Return the ensemble variance of the displayed coarse-grained field."""

    return float(np.mean(state.window**2 / (2.0 * state.omega)))


def theoretical_axis_correlation(
    state: VacuumState,
    maximum_lag: int | None = None,
) -> FloatArray:
    """Return normalized equal-time ensemble correlation along one lattice axis."""

    maximum_lag = state.n // 2 if maximum_lag is None else maximum_lag
    if not 0 <= maximum_lag <= state.n // 2:
        raise ValueError("maximum_lag must lie inside the periodic half-box")
    mode_variance = state.window**2 / (2.0 * state.omega)
    correlations = np.array(
        [
            np.mean(mode_variance * np.cos(state.wave_numbers[0] * lag * state.spacing))
            for lag in range(maximum_lag + 1)
        ]
    )
    return correlations / correlations[0]


def axis_correlation_estimate(
    field: FloatArray,
    state: VacuumState,
    maximum_lag: int | None = None,
) -> FloatArray:
    """Estimate ``C(r) / C(0)`` from one equal-time configuration.

    Translations and all spatial axes are averaged at each lattice lag.  The
    denominator is the known regulated ensemble variance rather than the
    fluctuating sample variance, so the estimator is unbiased at every lag.
    """

    if field.shape != state.shape:
        raise ValueError("field must match the state lattice")
    maximum_lag = state.n // 2 if maximum_lag is None else maximum_lag
    if not 0 <= maximum_lag <= state.n // 2:
        raise ValueError("maximum_lag must lie inside the periodic half-box")
    correlations = np.array(
        [
            np.mean(
                [
                    np.mean(field * np.roll(field, -lag, axis=axis))
                    for axis in range(state.dimension)
                ]
            )
            for lag in range(maximum_lag + 1)
        ]
    )
    return correlations / expected_field_variance(state)


def estimate_vacuum_axis_correlation(
    state: VacuumState,
    *,
    sample_count: int,
    seed: int,
) -> tuple[FloatArray, FloatArray]:
    """Return a Monte Carlo mean and standard error for ``C(r) / C(0)``."""

    if sample_count < 2:
        raise ValueError("sample_count must be at least two")
    generator = np.random.default_rng(seed)
    estimates = np.empty((sample_count, state.n // 2 + 1), dtype=float)
    amplitude = state.window / np.sqrt(2.0 * state.omega)
    for index in range(sample_count):
        noise = generator.standard_normal(state.shape)
        field = np.fft.ifftn(np.fft.fftn(noise) * amplitude).real
        estimates[index] = axis_correlation_estimate(field, state)
    mean = np.mean(estimates, axis=0)
    standard_error = np.std(estimates, axis=0, ddof=1) / np.sqrt(sample_count)
    return mean, standard_error


def coordinate_axis(state: VacuumState) -> FloatArray:
    """Return centered periodic lattice coordinates."""

    return (np.arange(state.n) - state.n / 2.0) * state.spacing
