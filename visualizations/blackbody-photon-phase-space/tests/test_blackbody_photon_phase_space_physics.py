import math

import pytest


def relative_error(actual: float, expected: float) -> float:
    return abs(actual - expected) / abs(expected)


def test_occupation_decreases_with_frequency_and_increases_with_temperature(physics):
    assert physics.occupation_number(10e12, 275) > physics.occupation_number(20e12, 275)
    assert physics.occupation_number(10e12, 5800) > physics.occupation_number(10e12, 275)


def test_one_au_solar_disk_has_expected_angle_and_solid_angle(physics):
    radius = physics.solar_angular_radius()
    assert math.degrees(radius) == pytest.approx(0.26645, abs=0.001)
    assert physics.circular_cone_solid_angle(radius) == pytest.approx(6.80e-5, abs=0.02e-5)


def test_integrated_photon_density_obeys_temperature_cubed_and_solid_angle(physics):
    full_sky = 4 * math.pi
    base = physics.photon_density_in_solid_angle(300, full_sky)
    hotter = physics.photon_density_in_solid_angle(600, full_sky)
    hemisphere = physics.photon_density_in_solid_angle(300, 2 * math.pi)
    assert hotter / base == pytest.approx(8)
    assert hemisphere / base == pytest.approx(0.5)


def test_band_integration_approaches_analytic_all_frequency_result(physics):
    full_sky = 4 * math.pi
    analytic = physics.photon_density_in_solid_angle(300, full_sky)
    numerical = physics.photon_density_in_frequency_band(300, full_sky, 1e8, 1e17)
    assert relative_error(numerical, analytic) < 2e-6


def test_energy_density_obeys_stefan_boltzmann_scaling(physics):
    full_sky = 4 * math.pi
    ratio = physics.energy_density_in_solid_angle(550, full_sky) / (
        physics.energy_density_in_solid_angle(275, full_sky)
    )
    assert ratio == pytest.approx(16)


def test_blackbody_entropy_energy_ratio_is_four_over_three_t(physics):
    temperature = 300
    energy = physics.energy_density_in_solid_angle(temperature, 1.7)
    entropy = physics.entropy_density_in_solid_angle(temperature, 1.7)
    assert entropy / energy == pytest.approx(4 / (3 * temperature))


def test_default_sun_and_earth_energy_densities_are_comparable(physics):
    solar_solid_angle = physics.circular_cone_solid_angle(physics.solar_angular_radius())
    solar = physics.energy_density_in_solid_angle(5800, solar_solid_angle)
    earth = physics.energy_density_in_solid_angle(275, 4 * math.pi)
    assert 0.9 < solar / earth < 1.2


def test_reported_photon_log_peak_is_locally_maximal(physics):
    peak = physics.frequency_for_photon_log_peak(275)
    at_peak = physics.photon_number_per_log_frequency_solid_angle(peak, 275)
    assert at_peak > physics.photon_number_per_log_frequency_solid_angle(peak * 0.99, 275)
    assert at_peak > physics.photon_number_per_log_frequency_solid_angle(peak * 1.01, 275)
