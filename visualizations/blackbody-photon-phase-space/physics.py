r"""Blackbody photon distributions in frequency-direction phase space.

The spectral densities include two photon polarizations. Quantities are
expressed per physical volume and per solid angle before angular integration.
"""

from __future__ import annotations

import math

PLANCK_CONSTANT = 6.62607015e-34
BOLTZMANN_CONSTANT = 1.380649e-23
LIGHT_SPEED = 299_792_458.0
ASTRONOMICAL_UNIT = 149_597_870_700.0
NOMINAL_SOLAR_RADIUS = 6.957e8
APERY_CONSTANT = 1.202056903159594


def occupation_number(frequency_hz: float, temperature_k: float) -> float:
    """Return the Bose--Einstein occupation number for one photon mode."""

    if frequency_hz <= 0 or temperature_k <= 0:
        return 0.0
    exponent = PLANCK_CONSTANT * frequency_hz / (BOLTZMANN_CONSTANT * temperature_k)
    if exponent > 709:
        return 0.0
    return 1.0 / math.expm1(exponent)


def photon_number_per_log_frequency_solid_angle(
    frequency_hz: float,
    temperature_k: float,
) -> float:
    r"""Return :math:`\mathrm dN/(\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu)`."""

    coefficient = 2.0 * frequency_hz**3 / LIGHT_SPEED**3
    return coefficient * occupation_number(frequency_hz, temperature_k)


def energy_per_log_frequency_solid_angle(
    frequency_hz: float,
    temperature_k: float,
) -> float:
    r"""Return :math:`\mathrm dE/(\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu)`."""

    return (
        PLANCK_CONSTANT
        * frequency_hz
        * photon_number_per_log_frequency_solid_angle(frequency_hz, temperature_k)
    )


def circular_cone_solid_angle(angular_radius_rad: float) -> float:
    """Return the solid angle of a circular cone with the given half-angle."""

    return 2.0 * math.pi * (1.0 - math.cos(angular_radius_rad))


def solar_angular_radius(distance_m: float = ASTRONOMICAL_UNIT) -> float:
    """Return the angular radius of the nominal Sun at ``distance_m``."""

    if distance_m < NOMINAL_SOLAR_RADIUS:
        raise ValueError("distance must not be smaller than the solar radius")
    return math.asin(NOMINAL_SOLAR_RADIUS / distance_m)


def photon_density_in_solid_angle(temperature_k: float, solid_angle_sr: float) -> float:
    """Integrate blackbody photon number density over all frequencies."""

    if temperature_k <= 0 or solid_angle_sr <= 0:
        return 0.0
    thermal_frequency = BOLTZMANN_CONSTANT * temperature_k / PLANCK_CONSTANT
    return solid_angle_sr * 4.0 * APERY_CONSTANT * thermal_frequency**3 / LIGHT_SPEED**3


def photon_density_in_frequency_band(
    temperature_k: float,
    solid_angle_sr: float,
    minimum_frequency_hz: float,
    maximum_frequency_hz: float,
    *,
    steps: int = 4096,
) -> float:
    """Numerically integrate photon density over a logarithmic frequency band."""

    if (
        temperature_k <= 0
        or solid_angle_sr <= 0
        or minimum_frequency_hz <= 0
        or maximum_frequency_hz <= minimum_frequency_hz
    ):
        return 0.0
    count = max(32, int(steps))
    log_minimum = math.log(minimum_frequency_hz)
    interval = (math.log(maximum_frequency_hz) - log_minimum) / count
    integral = 0.0
    previous = photon_number_per_log_frequency_solid_angle(minimum_frequency_hz, temperature_k)
    for index in range(1, count + 1):
        frequency = math.exp(log_minimum + index * interval)
        current = photon_number_per_log_frequency_solid_angle(frequency, temperature_k)
        integral += 0.5 * (previous + current) * interval
        previous = current
    return solid_angle_sr * integral


def energy_density_in_solid_angle(temperature_k: float, solid_angle_sr: float) -> float:
    """Integrate blackbody energy density over all frequencies."""

    if temperature_k <= 0 or solid_angle_sr <= 0:
        return 0.0
    numerator = solid_angle_sr * 2.0 * math.pi**4 * BOLTZMANN_CONSTANT**4 * temperature_k**4
    denominator = 15.0 * PLANCK_CONSTANT**3 * LIGHT_SPEED**3
    return numerator / denominator


def entropy_density_in_solid_angle(temperature_k: float, solid_angle_sr: float) -> float:
    """Return equilibrium blackbody entropy density in the selected solid angle."""

    if temperature_k <= 0 or solid_angle_sr <= 0:
        return 0.0
    return (
        4.0 * energy_density_in_solid_angle(temperature_k, solid_angle_sr) / (3.0 * temperature_k)
    )


def frequency_for_photon_log_peak(temperature_k: float) -> float:
    r"""Return the peak of photon number per :math:`\mathrm d\ln\nu`."""

    if temperature_k <= 0:
        return 0.0
    dimensionless_peak = 2.8214393721220787
    return dimensionless_peak * BOLTZMANN_CONSTANT * temperature_k / PLANCK_CONSTANT
