from __future__ import annotations

import numpy as np


def test_free_evolution_conserves_the_sampled_lattice_hamiltonian(physics) -> None:
    state = physics.sample_vacuum(
        n=8,
        dimension=2,
        length=10.0,
        mass=0.7,
        cutoff_fraction=0.5,
        seed=1234,
    )
    initial = physics.spectral_energy(state)
    for time in (-3.2, -0.4, 1.7, 8.1):
        assert np.isclose(physics.spectral_energy(state, time), initial, rtol=2e-14)


def test_local_quadratic_form_sums_to_the_spectral_hamiltonian(physics) -> None:
    state = physics.sample_vacuum(
        n=8,
        dimension=3,
        length=9.0,
        mass=0.6,
        cutoff_fraction=0.54,
        seed=21,
    )
    field, momentum = physics.configuration_at(state, 1.4)
    local_energy = np.sum(physics.local_quadratic_density(field, momentum, state))
    assert np.isclose(local_energy, physics.spectral_energy(state, 1.4), rtol=2e-13)


def test_ensemble_matches_the_regulated_vacuum_variance(physics) -> None:
    options = {
        "n": 8,
        "dimension": 2,
        "length": 8.0,
        "mass": 0.65,
        "cutoff_fraction": 0.5,
    }
    reference = physics.sample_vacuum(**options, seed=1)
    predicted = physics.expected_field_variance(reference)
    measured = np.mean(
        [
            np.mean(physics.configuration_at(physics.sample_vacuum(**options, seed=seed))[0] ** 2)
            for seed in range(1, 181)
        ]
    )
    assert np.isclose(measured, predicted, rtol=0.06)


def test_mass_shortens_the_normalized_two_dimensional_correlation(physics) -> None:
    light = physics.sample_vacuum(n=32, dimension=2, mass=0.2, seed=1)
    heavy = physics.sample_vacuum(n=32, dimension=2, mass=1.6, seed=1)
    assert (
        physics.theoretical_axis_correlation(light)[6]
        > (physics.theoretical_axis_correlation(heavy)[6])
    )


def test_cutoff_is_declared_relative_to_the_nyquist_wave_number(physics) -> None:
    state = physics.sample_vacuum(n=12, dimension=2, length=9.0, cutoff_fraction=0.42)
    assert np.isclose(state.cutoff, 0.42 * np.pi / state.spacing)
    assert np.isclose(physics.theoretical_axis_correlation(state)[0], 1.0)


def test_monte_carlo_correlation_reports_a_standard_error(physics) -> None:
    state = physics.sample_vacuum(
        n=8,
        dimension=3,
        length=8.0,
        mass=0.55,
        cutoff_fraction=0.48,
        seed=4,
    )
    mean, standard_error = physics.estimate_vacuum_axis_correlation(
        state,
        sample_count=160,
        seed=9182,
    )
    expected = physics.theoretical_axis_correlation(state)
    assert np.all(standard_error > 0.0)
    assert np.all(np.abs(mean - expected) < 4.0 * standard_error)
