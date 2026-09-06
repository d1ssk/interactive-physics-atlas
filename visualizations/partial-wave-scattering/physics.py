"""Authoritative physics for plane-wave expansion and central-potential scattering.

Lengths in the plane-wave panel are measured in wavelengths.  The scattering
panel uses units with hbar**2 / (2 mu) = 1, so the incident energy is E = k**2.
The incident wave propagates in the +z direction.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True, slots=True)
class PotentialParameters:
    """Parameters of a Gaussian well/barrier with an optional repulsive core."""

    strength: float
    range: float
    core: float = 0.0


def central_potential(
    radius: np.ndarray | float,
    parameters: PotentialParameters,
) -> np.ndarray:
    """Return the central potential U(r)."""

    if parameters.range <= 0:
        raise ValueError("range must be positive")
    radius_values = np.asarray(radius, dtype=float)
    core_range = max(0.12, 0.34 * parameters.range)
    return parameters.strength * np.exp(-((radius_values / parameters.range) ** 2)) + (
        parameters.core * np.exp(-((radius_values / core_range) ** 4))
    )


def legendre_polynomial(ell: int, argument: np.ndarray | float) -> np.ndarray:
    """Evaluate P_ell with the stable three-term recurrence."""

    if ell < 0:
        raise ValueError("ell must be non-negative")
    x = np.asarray(argument, dtype=float)
    if ell == 0:
        return np.ones_like(x)
    previous = np.ones_like(x)
    current = x.copy()
    for order in range(1, ell):
        following = ((2 * order + 1) * x * current - order * previous) / (order + 1)
        previous, current = current, following
    return current


def _odd_double_factorial(value: int) -> float:
    result = 1.0
    for factor in range(value, 0, -2):
        result *= factor
    return result


def _spherical_jn_series(ell: int, argument: np.ndarray) -> np.ndarray:
    term = argument**ell / _odd_double_factorial(2 * ell + 1)
    result = term.copy()
    for index in range(1, 80):
        term *= -(argument**2) / (2 * index * (2 * ell + 2 * index + 1))
        result += term
        if np.all(np.abs(term) <= 2e-15 * np.maximum(1.0, np.abs(result))):
            break
    return result


def spherical_jn(ell: int, argument: np.ndarray | float) -> np.ndarray:
    """Evaluate the spherical Bessel function j_ell without a SciPy runtime."""

    if ell < 0:
        raise ValueError("ell must be non-negative")
    x = np.asarray(argument, dtype=float)
    absolute = np.abs(x)
    safe = np.where(absolute > 1e-12, x, 1.0)
    j_zero = np.sin(safe) / safe
    if ell == 0:
        return np.where(absolute > 1e-12, j_zero, 1.0)
    j_one = np.sin(safe) / safe**2 - np.cos(safe) / safe
    if ell == 1:
        return np.where(absolute > 1e-5, j_one, _spherical_jn_series(1, x))
    previous, current = j_zero, j_one
    for order in range(1, ell):
        previous, current = current, (2 * order + 1) * current / safe - previous
    use_series = absolute < max(0.5, 0.8 * ell)
    return np.where(use_series, _spherical_jn_series(ell, x), current)


def _scalar_spherical_jn_sequence(maximum_ell: int, argument: float) -> np.ndarray:
    """Return j_0 through j_max using downward recurrence and normalization."""

    if argument <= 0:
        raise ValueError("argument must be positive")
    top = max(maximum_ell + 28, int(argument) + 28)
    values = np.zeros(top + 2)
    values[top] = 1.0
    for order in range(top, 0, -1):
        values[order - 1] = (2 * order + 1) * values[order] / argument - values[order + 1]
        if abs(values[order - 1]) > 1e100:
            values[order - 1 :] *= 1e-100
    direct_zero = np.sin(argument) / argument
    direct_one = np.sin(argument) / argument**2 - np.cos(argument) / argument
    if abs(direct_zero) >= abs(direct_one):
        values *= direct_zero / values[0]
    else:
        values *= direct_one / values[1]
    return values[: maximum_ell + 1]


def _scalar_spherical_yn_sequence(maximum_ell: int, argument: float) -> np.ndarray:
    values = np.empty(maximum_ell + 1)
    values[0] = -np.cos(argument) / argument
    if maximum_ell == 0:
        return values
    values[1] = -np.cos(argument) / argument**2 - np.sin(argument) / argument
    for order in range(1, maximum_ell):
        values[order + 1] = (2 * order + 1) * values[order] / argument - values[order - 1]
    return values


def plane_wave_component(
    ell: int,
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    wave_number: float = 2 * np.pi,
) -> np.ndarray:
    """Return one angular-momentum term of exp(i k z)."""

    radius = np.sqrt(x**2 + y**2 + z**2)
    cosine = np.divide(z, radius, out=np.ones_like(radius), where=radius > 1e-14)
    return (
        (1j**ell)
        * (2 * ell + 1)
        * spherical_jn(ell, wave_number * radius)
        * legendre_polynomial(ell, cosine)
    )


def plane_wave_partial_sum(
    maximum_ell: int,
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    wave_number: float = 2 * np.pi,
) -> np.ndarray:
    """Return the partial-wave expansion through maximum_ell."""

    if maximum_ell < 0:
        raise ValueError("maximum_ell must be non-negative")
    result = np.zeros_like(x, dtype=np.complex128)
    for ell in range(maximum_ell + 1):
        result += plane_wave_component(ell, x, y, z, wave_number)
    return result


def radial_solution(
    ell: int,
    energy: float,
    parameters: PotentialParameters,
    *,
    step: float = 0.008,
    match_radius: float | None = None,
) -> tuple[np.ndarray, np.ndarray, float]:
    """Integrate the reduced radial equation with Numerov and match its phase."""

    if ell < 0:
        raise ValueError("ell must be non-negative")
    if energy <= 0:
        raise ValueError("energy must be positive")
    if step <= 0:
        raise ValueError("step must be positive")
    outer_radius = match_radius or max(7.0, 5.5 * parameters.range + 2.0)
    point_count = max(240, int(np.ceil(outer_radius / step)))
    radii = np.linspace(0.0, outer_radius, point_count + 1)
    h = float(radii[1])
    values = np.zeros_like(radii)
    centrifugal = np.zeros_like(radii)
    centrifugal[1:] = ell * (ell + 1) / radii[1:] ** 2
    q = energy - central_potential(radii, parameters) - centrifugal
    values[1] = 1.0
    values[2] = 2.0 ** (ell + 1)
    h_squared = h**2
    for index in range(2, point_count):
        values[index + 1] = (
            2 * (1 - 5 * h_squared * q[index] / 12) * values[index]
            - (1 + h_squared * q[index - 1] / 12) * values[index - 1]
        ) / (1 + h_squared * q[index + 1] / 12)

    derivative = (3 * values[-1] - 4 * values[-2] + values[-3]) / (2 * h)
    logarithmic_derivative = derivative / values[-1]
    wave_number = float(np.sqrt(energy))
    argument = wave_number * outer_radius
    j_values = _scalar_spherical_jn_sequence(ell, argument)
    y_values = _scalar_spherical_yn_sequence(ell, argument)
    j_hat = argument * j_values[ell]
    y_hat = argument * y_values[ell]
    j_hat_derivative = (
        np.cos(argument) if ell == 0 else argument * j_values[ell - 1] - ell * j_values[ell]
    )
    y_hat_derivative = (
        np.sin(argument) if ell == 0 else argument * y_values[ell - 1] - ell * y_values[ell]
    )
    raw_phase = np.arctan2(
        wave_number * j_hat_derivative - logarithmic_derivative * j_hat,
        wave_number * y_hat_derivative - logarithmic_derivative * y_hat,
    )
    phase = float(raw_phase - np.round(raw_phase / np.pi) * np.pi)
    exterior_value = np.cos(phase) * j_hat - np.sin(phase) * y_hat
    exterior_derivative = wave_number * (
        np.cos(phase) * j_hat_derivative - np.sin(phase) * y_hat_derivative
    )
    normalization = (
        values[-1] / exterior_value
        if abs(exterior_value) >= abs(exterior_derivative / wave_number)
        else derivative / exterior_derivative
    )
    return radii, values / normalization, phase


def phase_shifts(
    maximum_ell: int,
    energy: float,
    parameters: PotentialParameters,
    *,
    step: float = 0.008,
) -> np.ndarray:
    """Return elastic phase shifts delta_ell through maximum_ell."""

    return np.asarray(
        [radial_solution(ell, energy, parameters, step=step)[2] for ell in range(maximum_ell + 1)]
    )


def unwrap_modulo_pi(phases: np.ndarray) -> np.ndarray:
    """Choose a continuous branch for phases defined modulo pi."""

    values = np.asarray(phases, dtype=float).copy()
    if values.size == 0:
        return values
    values[0] -= np.round(values[0] / np.pi) * np.pi
    for index in range(1, values.size):
        while values[index] - values[index - 1] > np.pi / 2:
            values[index] -= np.pi
        while values[index] - values[index - 1] < -np.pi / 2:
            values[index] += np.pi
    return values


def scattering_amplitude(
    theta: np.ndarray,
    wave_number: float,
    phases: np.ndarray,
    maximum_ell: int | None = None,
) -> np.ndarray:
    """Return the elastic partial-wave scattering amplitude."""

    selected = len(phases) - 1 if maximum_ell is None else maximum_ell
    cosine = np.cos(theta)
    result = np.zeros_like(theta, dtype=np.complex128)
    for ell in range(selected + 1):
        result += (
            (2 * ell + 1)
            * np.exp(1j * phases[ell])
            * np.sin(phases[ell])
            * legendre_polynomial(ell, cosine)
            / wave_number
        )
    return result


def scattered_partial_field(
    x: np.ndarray,
    z: np.ndarray,
    wave_number: float,
    phase: float,
    ell: int,
) -> np.ndarray:
    """Return the outgoing asymptotic field from one partial wave."""

    radius = np.hypot(x, z)
    safe_radius = np.where(radius > 0, radius, 1.0)
    cosine = np.clip(z / safe_radius, -1.0, 1.0)
    amplitude = (
        (2 * ell + 1)
        * np.exp(1j * phase)
        * np.sin(phase)
        * legendre_polynomial(ell, cosine)
        / wave_number
    )
    return amplitude * np.exp(1j * wave_number * radius) / safe_radius


def asymptotic_fields(
    x: np.ndarray,
    z: np.ndarray,
    wave_number: float,
    phases: np.ndarray,
    maximum_ell: int,
    exclusion_radius: float,
) -> tuple[np.ndarray, np.ndarray]:
    """Return total and scattered exterior fields on the y=0 plane."""

    radius = np.hypot(x, z)
    safe_radius = np.where(radius > 0, radius, 1.0)
    theta = np.arccos(np.clip(z / safe_radius, -1.0, 1.0))
    amplitude = scattering_amplitude(theta, wave_number, phases, maximum_ell)
    scattered = amplitude * np.exp(1j * wave_number * radius) / safe_radius
    total = np.exp(1j * wave_number * z) + scattered
    mask = radius < exclusion_radius
    invalid = np.nan + 1j * np.nan
    return np.where(mask, invalid, total), np.where(mask, invalid, scattered)


def total_cross_section(wave_number: float, phases: np.ndarray) -> float:
    """Return the elastic total cross section."""

    ell = np.arange(len(phases))
    return float(4 * np.pi * np.sum((2 * ell + 1) * np.sin(phases) ** 2) / wave_number**2)
