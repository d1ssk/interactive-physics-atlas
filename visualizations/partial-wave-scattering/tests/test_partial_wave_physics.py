from __future__ import annotations

import numpy as np


def test_free_phase_shifts_vanish(physics) -> None:
    parameters = physics.PotentialParameters(0.0, 1.0, 0.0)
    shifts = physics.phase_shifts(7, 4.0, parameters)
    np.testing.assert_allclose(np.sin(shifts), 0.0, atol=5e-5)


def test_attraction_and_repulsion_give_opposite_weak_s_wave_shifts(physics) -> None:
    attractive = physics.radial_solution(0, 2.0, physics.PotentialParameters(-1, 1))[2]
    repulsive = physics.radial_solution(0, 2.0, physics.PotentialParameters(1, 1))[2]
    assert attractive > 0
    assert repulsive < 0


def test_plane_wave_partial_sum_converges(physics) -> None:
    axis = np.linspace(-1.0, 1.0, 25)
    x, z = np.meshgrid(axis, axis)
    y = np.zeros_like(x)
    actual = physics.plane_wave_partial_sum(12, x, y, z)
    expected = np.exp(2j * np.pi * z)
    assert np.mean(np.abs(actual - expected)) < 7e-4
    assert np.max(np.abs(actual - expected)) < 0.018


def test_zero_phase_shifts_leave_only_the_incident_wave(physics) -> None:
    axis = np.linspace(-4.0, 4.0, 17)
    x, z = np.meshgrid(axis, axis)
    total, scattered = physics.asymptotic_fields(x, z, 2.0, np.zeros(5), 4, 0.5)
    mask = np.isfinite(total)
    np.testing.assert_allclose(total[mask], np.exp(2j * z[mask]), atol=1e-14)
    np.testing.assert_allclose(scattered[mask], 0.0, atol=1e-14)


def test_elastic_optical_theorem(physics) -> None:
    wave_number = np.sqrt(5.0)
    phases = physics.phase_shifts(7, 5.0, physics.PotentialParameters(-8, 1.15))
    forward = physics.scattering_amplitude(np.asarray([0.0]), wave_number, phases)[0]
    optical = 4 * np.pi * np.imag(forward) / wave_number
    np.testing.assert_allclose(
        optical, physics.total_cross_section(wave_number, phases), rtol=1e-13
    )


def test_differential_cross_section_integrates_to_total(physics) -> None:
    wave_number = np.sqrt(5.0)
    phases = physics.phase_shifts(7, 5.0, physics.PotentialParameters(-8, 1.15))
    theta = np.linspace(0.0, np.pi, 20_001)
    differential = physics.differential_cross_section(theta, wave_number, phases)
    integrated = 2 * np.pi * np.trapezoid(differential * np.sin(theta), theta)

    assert np.all(differential >= 0)
    np.testing.assert_allclose(
        integrated,
        physics.total_cross_section(wave_number, phases),
        rtol=2e-7,
    )
