"""Invariant checks for the Kelvin–Helmholtz visualization physics."""

import numpy as np
import pytest


def test_equal_densities_maximize_density_coupling(physics) -> None:
    equal = physics.KHParameters(density_ratio=1.0)
    light_top = physics.KHParameters(density_ratio=0.2)
    heavy_top = physics.KHParameters(density_ratio=5.0)

    assert physics.density_coupling(equal) == pytest.approx(0.25)
    assert physics.density_coupling(light_top) == pytest.approx(physics.density_coupling(heavy_top))
    assert physics.density_coupling(light_top) < physics.density_coupling(equal)


def test_surface_tension_cutoff_and_growth_maximum(physics) -> None:
    parameters = physics.KHParameters(
        velocity_difference=1.8,
        density_ratio=0.7,
        surface_tension=0.24,
    )
    cutoff = physics.critical_wavenumber(parameters)
    peak = physics.most_unstable_wavenumber(parameters)

    assert physics.growth_rate_squared(cutoff, parameters) == pytest.approx(0.0, abs=1.0e-12)
    assert peak == pytest.approx(2.0 * cutoff / 3.0)

    epsilon = 1.0e-5 * cutoff
    numerical_derivative = (
        physics.growth_rate_squared(peak + epsilon, parameters)
        - physics.growth_rate_squared(peak - epsilon, parameters)
    ) / (2.0 * epsilon)
    assert numerical_derivative == pytest.approx(0.0, abs=1.0e-8)


def test_surface_tension_stabilizes_short_waves(physics) -> None:
    parameters = physics.KHParameters(
        velocity_difference=1.4,
        density_ratio=1.0,
        surface_tension=0.4,
    )
    cutoff = physics.critical_wavenumber(parameters)

    assert float(physics.growth_rate(0.5 * cutoff, parameters)) > 0.0
    assert float(physics.growth_rate(1.5 * cutoff, parameters)) == 0.0
    assert float(physics.growth_rate_squared(1.5 * cutoff, parameters)) < 0.0


def test_phase_speed_is_density_weighted_mean(physics) -> None:
    parameters = physics.KHParameters(velocity_difference=2.0, density_ratio=3.0)
    expected = (
        parameters.top_density * parameters.top_velocity
        + parameters.bottom_density * parameters.bottom_velocity
    ) / parameters.density_sum
    assert physics.phase_speed(parameters) == pytest.approx(expected)


def test_stuart_velocity_is_incompressible_and_has_correct_far_field(physics) -> None:
    parameters = physics.KHParameters(velocity_difference=1.6, wavelength=4.0)
    x = 0.37 * parameters.wavelength
    y = 0.11 * parameters.wavelength
    step = 1.0e-5

    u_plus, _ = physics.stuart_velocity(x + step, y, 0.8, parameters, epsilon=0.55)
    u_minus, _ = physics.stuart_velocity(x - step, y, 0.8, parameters, epsilon=0.55)
    _, v_plus = physics.stuart_velocity(x, y + step, 0.8, parameters, epsilon=0.55)
    _, v_minus = physics.stuart_velocity(x, y - step, 0.8, parameters, epsilon=0.55)
    divergence = (u_plus - u_minus) / (2.0 * step) + (v_plus - v_minus) / (2.0 * step)
    assert float(divergence) == pytest.approx(0.0, abs=2.0e-9)

    far_top, _ = physics.stuart_velocity(x, 8.0 * parameters.wavelength, 0.0, parameters)
    far_bottom, _ = physics.stuart_velocity(x, -8.0 * parameters.wavelength, 0.0, parameters)
    assert float(far_top) == pytest.approx(parameters.top_velocity, rel=1.0e-8)
    assert float(far_bottom) == pytest.approx(parameters.bottom_velocity, rel=1.0e-8)


def test_dye_field_starts_on_the_sinusoidal_interface(physics) -> None:
    parameters = physics.KHParameters()
    x, y, field = physics.initial_dye_field(parameters, x_count=80, y_count=40)

    assert field.shape == (len(y), len(x))
    assert np.all(field[-1] > 0.0)
    assert np.all(field[0] < 0.0)
    assert np.all(np.isfinite(field))


def test_dye_viewport_stays_fixed_while_wavelength_changes(physics) -> None:
    short_wave = physics.KHParameters(wavelength=2.0)
    long_wave = physics.KHParameters(wavelength=8.0)
    short_x, short_y, _ = physics.initial_dye_field(short_wave, x_count=80, y_count=40)
    long_x, long_y, _ = physics.initial_dye_field(long_wave, x_count=80, y_count=40)

    assert np.array_equal(short_x, long_x)
    assert np.array_equal(short_y, long_y)
    assert short_x[-1] < physics.DOMAIN_WIDTH
    assert short_y[0] > -physics.DOMAIN_HALF_HEIGHT
    assert short_y[-1] < physics.DOMAIN_HALF_HEIGHT
    assert physics.DOMAIN_WIDTH / short_wave.wavelength == pytest.approx(4.0)
    assert physics.DOMAIN_WIDTH / long_wave.wavelength == pytest.approx(1.0)
    assert not np.allclose(
        physics.initial_interface(short_x, short_wave),
        physics.initial_interface(long_x, long_wave),
    )


def test_zero_velocity_leaves_dye_field_unchanged(physics) -> None:
    parameters = physics.KHParameters(velocity_difference=0.0)
    x, y, initial = physics.initial_dye_field(parameters, x_count=80, y_count=40)
    advected_x, advected_y, advected = physics.advect_dye_field(
        0.8,
        parameters,
        x_count=80,
        y_count=40,
    )

    assert np.array_equal(advected_x, x)
    assert np.array_equal(advected_y, y)
    assert np.allclose(advected, initial, atol=1.0e-12)


def test_symmetric_dye_advection_preserves_equal_color_areas(physics) -> None:
    parameters = physics.KHParameters(density_ratio=1.0)
    _, _, advected = physics.advect_dye_field(1.2, parameters, x_count=100, y_count=48)
    top_fraction = np.mean(advected >= 0.0)

    assert top_fraction == pytest.approx(0.5, abs=0.01)


def test_tracer_particles_are_optional_material_markers_in_fixed_domain(physics) -> None:
    parameters = physics.KHParameters(velocity_difference=0.0, wavelength=2.0)
    x, y, started_above = physics.seed_tracer_particles(parameters, columns=20, rows=10)
    advected_x, advected_y = physics.advect_tracer_particles(x, y, 0.8, parameters)

    assert len(x) == 200
    assert started_above.dtype == np.bool_
    assert np.all((x >= 0.0) & (x < physics.DOMAIN_WIDTH))
    assert np.all((y >= -physics.DOMAIN_HALF_HEIGHT) & (y <= physics.DOMAIN_HALF_HEIGHT))
    assert np.array_equal(advected_x, x)
    assert np.array_equal(advected_y, y)
