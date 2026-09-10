"""Physics helpers for the Kelvin–Helmholtz instability visualization.

The linear dispersion relation is kept separate from the illustrative
Kelvin–Stuart roll-up bridge used by the visualizations.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from numpy.typing import ArrayLike, NDArray

DOMAIN_WIDTH = 8.0
DOMAIN_HALF_HEIGHT = 1.68
INITIAL_INTERFACE_AMPLITUDE = 0.072


@dataclass(frozen=True)
class KHParameters:
    """Dimensionless parameters for two semi-infinite inviscid fluids.

    The lower density is the reference density.  The far-field velocities are
    chosen symmetrically, so ``U_top = +delta_u / 2`` and
    ``U_bottom = -delta_u / 2``.
    """

    velocity_difference: float = 1.6
    density_ratio: float = 1.0
    surface_tension: float = 0.15
    wavelength: float = 4.0
    bottom_density: float = 1.0

    def __post_init__(self) -> None:
        values = (
            self.velocity_difference,
            self.density_ratio,
            self.surface_tension,
            self.wavelength,
            self.bottom_density,
        )
        if not all(np.isfinite(value) for value in values):
            raise ValueError("All parameters must be finite.")
        if self.velocity_difference < 0.0:
            raise ValueError("velocity_difference must be non-negative.")
        if self.density_ratio <= 0.0:
            raise ValueError("density_ratio must be positive.")
        if self.surface_tension < 0.0:
            raise ValueError("surface_tension must be non-negative.")
        if self.wavelength <= 0.0:
            raise ValueError("wavelength must be positive.")
        if self.bottom_density <= 0.0:
            raise ValueError("bottom_density must be positive.")

    @property
    def top_density(self) -> float:
        return self.density_ratio * self.bottom_density

    @property
    def density_sum(self) -> float:
        return self.top_density + self.bottom_density

    @property
    def top_velocity(self) -> float:
        return 0.5 * self.velocity_difference

    @property
    def bottom_velocity(self) -> float:
        return -0.5 * self.velocity_difference

    @property
    def wavenumber(self) -> float:
        return 2.0 * np.pi / self.wavelength


def density_coupling(parameters: KHParameters) -> float:
    """Return rho_1 rho_2 / (rho_1 + rho_2)^2."""

    return parameters.top_density * parameters.bottom_density / parameters.density_sum**2


def growth_rate_squared(wavenumber: ArrayLike, parameters: KHParameters) -> NDArray[np.float64]:
    r"""Return the signed linear Kelvin–Helmholtz discriminant.

    Positive values are :math:`\gamma^2`; negative values are minus the
    squared capillary-wave frequency.  Gravity is omitted.
    """

    k = np.asarray(wavenumber, dtype=float)
    if np.any(k < 0.0) or np.any(~np.isfinite(k)):
        raise ValueError("wavenumber must be finite and non-negative.")
    shear_term = density_coupling(parameters) * parameters.velocity_difference**2 * k**2
    capillary_term = parameters.surface_tension * k**3 / parameters.density_sum
    return shear_term - capillary_term


def growth_rate(wavenumber: ArrayLike, parameters: KHParameters) -> NDArray[np.float64]:
    """Return the non-negative exponential growth rate gamma(k)."""

    return np.sqrt(np.maximum(growth_rate_squared(wavenumber, parameters), 0.0))


def oscillation_frequency(wavenumber: ArrayLike, parameters: KHParameters) -> NDArray[np.float64]:
    """Return the capillary-wave frequency for linearly stable modes."""

    return np.sqrt(np.maximum(-growth_rate_squared(wavenumber, parameters), 0.0))


def phase_speed(parameters: KHParameters) -> float:
    """Return the density-weighted advection speed of the linear wave."""

    numerator = (
        parameters.top_density * parameters.top_velocity
        + parameters.bottom_density * parameters.bottom_velocity
    )
    return numerator / parameters.density_sum


def critical_wavenumber(parameters: KHParameters) -> float:
    """Return the surface-tension cutoff k_c.

    Modes satisfy 0 < k < k_c when the velocity difference is nonzero.
    With zero surface tension the cutoff is infinite.  With no shear there is
    no unstable interval and the returned cutoff is zero.
    """

    if parameters.velocity_difference == 0.0:
        return 0.0
    if parameters.surface_tension == 0.0:
        return float("inf")
    numerator = (
        parameters.top_density * parameters.bottom_density * parameters.velocity_difference**2
    )
    return numerator / (parameters.surface_tension * parameters.density_sum)


def most_unstable_wavenumber(parameters: KHParameters) -> float:
    """Return k_max = 2 k_c / 3 when surface tension bounds the spectrum."""

    cutoff = critical_wavenumber(parameters)
    if not np.isfinite(cutoff):
        return float("inf")
    return 2.0 * cutoff / 3.0


def mode_summary(parameters: KHParameters) -> dict[str, float | str]:
    """Return quantities displayed by both prototype surfaces."""

    k = parameters.wavenumber
    gamma = float(growth_rate(k, parameters))
    omega_capillary = float(oscillation_frequency(k, parameters))
    tolerance = 1.0e-12
    if gamma > tolerance:
        status = "unstable"
    elif omega_capillary > tolerance:
        status = "stable"
    else:
        status = "neutral"
    return {
        "wavenumber": k,
        "growth_rate": gamma,
        "oscillation_frequency": omega_capillary,
        "phase_speed": phase_speed(parameters),
        "critical_wavenumber": critical_wavenumber(parameters),
        "most_unstable_wavenumber": most_unstable_wavenumber(parameters),
        "status": status,
    }


def rollup_parameter(
    time: float,
    parameters: KHParameters,
    *,
    initial_amplitude: float = 0.035,
    maximum_amplitude: float = 0.92,
) -> float:
    """Map linear exponential growth into a bounded Stuart-vortex parameter.

    This mapping is a visualization bridge, not a nonlinear two-fluid time
    solution.  ``abs(epsilon) < 1`` keeps the Stuart field nonsingular.
    """

    if not np.isfinite(time) or time < 0.0:
        raise ValueError("time must be finite and non-negative.")
    if not (0.0 < initial_amplitude < maximum_amplitude < 1.0):
        raise ValueError("Require 0 < initial_amplitude < maximum_amplitude < 1.")
    gamma = float(growth_rate(parameters.wavenumber, parameters))
    return min(maximum_amplitude, initial_amplitude * np.exp(gamma * time))


def stuart_streamfunction(
    x: ArrayLike,
    y: ArrayLike,
    time: float,
    parameters: KHParameters,
    *,
    epsilon: float | None = None,
) -> NDArray[np.float64]:
    r"""Return a Kelvin–Stuart cat's-eye streamfunction snapshot.

    The adopted field is

    .. math::

       \psi = \frac{\Delta U\,\delta}{2}
       \log[\cosh(y/\delta)+\epsilon\cos(k(x-ct))],

    with ``delta = 1/k``.  Its far-field velocities are ``+/- delta_u/2``.
    """

    selected_epsilon = rollup_parameter(time, parameters) if epsilon is None else epsilon
    if not np.isfinite(selected_epsilon) or abs(selected_epsilon) >= 1.0:
        raise ValueError("epsilon must be finite and satisfy abs(epsilon) < 1.")
    x_array = np.asarray(x, dtype=float)
    y_array = np.asarray(y, dtype=float)
    k = parameters.wavenumber
    delta = 1.0 / k
    phase = k * (x_array - phase_speed(parameters) * time)
    denominator = np.cosh(y_array / delta) + selected_epsilon * np.cos(phase)
    return 0.5 * parameters.velocity_difference * delta * np.log(denominator)


def stuart_velocity(
    x: ArrayLike,
    y: ArrayLike,
    time: float,
    parameters: KHParameters,
    *,
    epsilon: float | None = None,
) -> tuple[NDArray[np.float64], NDArray[np.float64]]:
    """Return the divergence-free velocity field (u, v) of a Stuart snapshot."""

    selected_epsilon = rollup_parameter(time, parameters) if epsilon is None else epsilon
    if not np.isfinite(selected_epsilon) or abs(selected_epsilon) >= 1.0:
        raise ValueError("epsilon must be finite and satisfy abs(epsilon) < 1.")
    x_array = np.asarray(x, dtype=float)
    y_array = np.asarray(y, dtype=float)
    k = parameters.wavenumber
    delta = 1.0 / k
    phase = k * (x_array - phase_speed(parameters) * time)
    scaled_y = y_array / delta
    denominator = np.cosh(scaled_y) + selected_epsilon * np.cos(phase)
    velocity_scale = 0.5 * parameters.velocity_difference
    horizontal = velocity_scale * np.sinh(scaled_y) / denominator
    vertical = velocity_scale * selected_epsilon * np.sin(phase) / denominator
    return horizontal, vertical


def stuart_vorticity(
    x: ArrayLike,
    y: ArrayLike,
    time: float,
    parameters: KHParameters,
    *,
    epsilon: float | None = None,
) -> NDArray[np.float64]:
    """Return z-vorticity for the Kelvin–Stuart snapshot."""

    selected_epsilon = rollup_parameter(time, parameters) if epsilon is None else epsilon
    if not np.isfinite(selected_epsilon) or abs(selected_epsilon) >= 1.0:
        raise ValueError("epsilon must be finite and satisfy abs(epsilon) < 1.")
    x_array = np.asarray(x, dtype=float)
    y_array = np.asarray(y, dtype=float)
    k = parameters.wavenumber
    phase = k * (x_array - phase_speed(parameters) * time)
    scaled_y = k * y_array
    denominator = np.cosh(scaled_y) + selected_epsilon * np.cos(phase)
    velocity_scale = 0.5 * parameters.velocity_difference
    return -velocity_scale * k * (1.0 - selected_epsilon**2) / denominator**2


def initial_interface(x: ArrayLike, parameters: KHParameters) -> NDArray[np.float64]:
    """Return the initial sinusoidal interface in the fixed physical viewport."""

    x_array = np.asarray(x, dtype=float)
    return INITIAL_INTERFACE_AMPLITUDE * np.sin(parameters.wavenumber * x_array)


def initial_dye_field(
    parameters: KHParameters,
    *,
    x_count: int = 280,
    y_count: int = 132,
) -> tuple[NDArray[np.float64], NDArray[np.float64], NDArray[np.float64]]:
    """Return an initial signed material-coordinate field on a cell-centred grid.

    Positive values identify fluid that starts above the sinusoidal interface;
    negative values identify fluid that starts below it.  Advecting the full
    scalar field gives continuous color regions rather than marker particles.
    """

    if x_count < 2 or y_count < 2:
        raise ValueError("x_count and y_count must be at least two.")
    x = (np.arange(x_count) + 0.5) * DOMAIN_WIDTH / x_count
    y = -DOMAIN_HALF_HEIGHT + (np.arange(y_count) + 0.5) * 2.0 * DOMAIN_HALF_HEIGHT / y_count
    mesh_x, mesh_y = np.meshgrid(x, y)
    interface = initial_interface(mesh_x, parameters)
    return x, y, mesh_y - interface


def _sample_dye_field(
    field: NDArray[np.float64],
    x: NDArray[np.float64],
    y: NDArray[np.float64],
    parameters: KHParameters,
) -> NDArray[np.float64]:
    """Bilinearly sample a cell-centred field with periodic x and clamped y."""

    y_count, x_count = field.shape
    grid_x = np.mod(x / DOMAIN_WIDTH * x_count - 0.5, x_count)
    grid_y = np.clip(
        (y + DOMAIN_HALF_HEIGHT) / (2.0 * DOMAIN_HALF_HEIGHT) * y_count - 0.5,
        0,
        y_count - 1,
    )

    x0 = np.floor(grid_x).astype(int)
    y0 = np.floor(grid_y).astype(int)
    x1 = (x0 + 1) % x_count
    y1 = np.minimum(y0 + 1, y_count - 1)
    x_fraction = grid_x - x0
    y_fraction = grid_y - y0

    lower = field[y0, x0] * (1.0 - x_fraction) + field[y0, x1] * x_fraction
    upper = field[y1, x0] * (1.0 - x_fraction) + field[y1, x1] * x_fraction
    return lower * (1.0 - y_fraction) + upper * y_fraction


def advect_dye_field(
    duration: float,
    parameters: KHParameters,
    *,
    x_count: int = 280,
    y_count: int = 132,
    maximum_step: float = 0.035,
) -> tuple[NDArray[np.float64], NDArray[np.float64], NDArray[np.float64]]:
    """Advect the signed dye field with a midpoint semi-Lagrangian scheme.

    Horizontal boundaries are periodic.  Vertical departure points are
    clamped at the displayed far field, where the vertical velocity is small.
    The zero level separates the two color regions in the visualizations.
    """

    if not np.isfinite(duration) or duration < 0.0:
        raise ValueError("duration must be finite and non-negative.")
    if not np.isfinite(maximum_step) or maximum_step <= 0.0:
        raise ValueError("maximum_step must be finite and positive.")
    x, y, field = initial_dye_field(parameters, x_count=x_count, y_count=y_count)
    if duration == 0.0:
        return x, y, field

    steps = max(1, int(np.ceil(duration / maximum_step)))
    step = duration / steps
    mesh_x, mesh_y = np.meshgrid(x, y)
    time = 0.0
    for _ in range(steps):
        end_time = time + step
        u_end, v_end = stuart_velocity(mesh_x, mesh_y, end_time, parameters)
        x_midpoint = mesh_x - 0.5 * step * u_end
        y_midpoint = mesh_y - 0.5 * step * v_end
        u_midpoint, v_midpoint = stuart_velocity(
            x_midpoint,
            y_midpoint,
            time + 0.5 * step,
            parameters,
        )
        departure_x = mesh_x - step * u_midpoint
        departure_y = mesh_y - step * v_midpoint
        field = _sample_dye_field(field, departure_x, departure_y, parameters)
        time = end_time
    return x, y, field


def seed_tracer_particles(
    parameters: KHParameters,
    *,
    columns: int = 64,
    rows: int = 30,
    seed: int = 20260906,
) -> tuple[NDArray[np.float64], NDArray[np.float64], NDArray[np.bool_]]:
    """Seed deterministic, lightly jittered tracers across the fixed viewport."""

    if columns < 2 or rows < 2:
        raise ValueError("columns and rows must be at least two.")
    random = np.random.default_rng(seed)
    cell_width = DOMAIN_WIDTH / columns
    cell_height = 2.0 * DOMAIN_HALF_HEIGHT / rows
    base_x = (np.arange(columns) + 0.5) * cell_width
    base_y = -DOMAIN_HALF_HEIGHT + (np.arange(rows) + 0.5) * cell_height
    mesh_x, mesh_y = np.meshgrid(base_x, base_y)
    particle_x = np.mod(
        mesh_x + random.uniform(-0.34, 0.34, mesh_x.shape) * cell_width,
        DOMAIN_WIDTH,
    )
    particle_y = np.clip(
        mesh_y + random.uniform(-0.34, 0.34, mesh_y.shape) * cell_height,
        -DOMAIN_HALF_HEIGHT,
        DOMAIN_HALF_HEIGHT,
    )
    started_above = particle_y >= initial_interface(particle_x, parameters)
    return particle_x.ravel(), particle_y.ravel(), started_above.ravel()


def advect_tracer_particles(
    x: ArrayLike,
    y: ArrayLike,
    duration: float,
    parameters: KHParameters,
    *,
    start_time: float = 0.0,
    maximum_step: float = 0.025,
) -> tuple[NDArray[np.float64], NDArray[np.float64]]:
    """Advect tracer positions with midpoint integration and periodic x."""

    if not np.isfinite(start_time) or start_time < 0.0:
        raise ValueError("start_time must be finite and non-negative.")
    if not np.isfinite(duration) or duration < 0.0:
        raise ValueError("duration must be finite and non-negative.")
    if not np.isfinite(maximum_step) or maximum_step <= 0.0:
        raise ValueError("maximum_step must be finite and positive.")
    particle_x = np.asarray(x, dtype=float).copy()
    particle_y = np.asarray(y, dtype=float).copy()
    if particle_x.shape != particle_y.shape:
        raise ValueError("x and y must have matching shapes.")
    if duration == 0.0:
        return particle_x, particle_y

    steps = max(1, int(np.ceil(duration / maximum_step)))
    step = duration / steps
    time = start_time
    for _ in range(steps):
        velocity_x, velocity_y = stuart_velocity(particle_x, particle_y, time, parameters)
        midpoint_x = particle_x + 0.5 * step * velocity_x
        midpoint_y = particle_y + 0.5 * step * velocity_y
        midpoint_u, midpoint_v = stuart_velocity(
            midpoint_x,
            midpoint_y,
            time + 0.5 * step,
            parameters,
        )
        particle_x = np.mod(particle_x + step * midpoint_u, DOMAIN_WIDTH)
        particle_y = np.clip(
            particle_y + step * midpoint_v,
            -DOMAIN_HALF_HEIGHT,
            DOMAIN_HALF_HEIGHT,
        )
        time += step
    return particle_x, particle_y
