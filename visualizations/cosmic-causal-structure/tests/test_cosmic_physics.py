from __future__ import annotations

import numpy as np
import pytest


def test_flat_density_budget_and_present_expansion_rate(physics) -> None:
    cosmology = physics.FlatLambdaCDM()
    total = cosmology.omega_radiation + cosmology.omega_matter + cosmology.omega_lambda
    assert np.isclose(total, 1.0)
    assert np.isclose(cosmology.expansion_rate(1.0), 1.0)


def test_present_age_and_horizon_scales_are_reasonable(physics) -> None:
    history = physics.compute_history(samples=6000)
    assert 13.7 < history.present_age_gyr < 13.9
    assert 14.0 < history.present_eta_gpc < 14.3
    assert 5.0 < history.at(history.event_horizon_comoving_gpc, 1.0) < 5.3
    assert np.isclose(
        history.at(history.hubble_radius_comoving_gpc, 1.0),
        history.cosmology.hubble_distance_gpc,
        rtol=2e-5,
    )


def test_present_past_light_cone_is_null_in_conformal_coordinates(physics) -> None:
    history = physics.compute_history(samples=3000)
    past_cone = history.past_light_cone_comoving_gpc()
    assert np.allclose(past_cone + history.eta_gpc, history.present_eta_gpc)
    assert np.isclose(history.at(past_cone, 1.0), 0.0, atol=1e-12)


def test_radiation_era_hubble_radius_scales_with_a(physics) -> None:
    history = physics.compute_history(samples=5000)
    a1, a2 = 1.0e-20, 1.0e-18
    radius1 = history.at(history.hubble_radius_comoving_gpc, a1)
    radius2 = history.at(history.hubble_radius_comoving_gpc, a2)
    assert np.isclose(radius2 / radius1, a2 / a1, rtol=2e-3)


def test_combined_history_is_continuous_and_monotonic(physics) -> None:
    history = physics.compute_history(samples=4000)
    inflation = physics.InflationStage(history)
    combined = physics.combine_inflation_and_hot_big_bang(history, inflation, inflation_samples=300)
    assert np.all(np.diff(combined.scale_factor) > 0)
    assert np.all(np.diff(combined.cosmic_time_gyr) > 0)
    assert np.all(np.diff(combined.eta_gpc) > 0)
    assert np.isclose(combined.eta_gpc[299], inflation.eta_at_end_gpc)
    assert np.isclose(combined.cosmic_time_gyr[0], 0.0)
    assert np.isclose(combined.scale_factor[-1], 1.0)


def test_de_sitter_comoving_hubble_radius_shrinks_by_exp_minus_n(physics) -> None:
    history = physics.compute_history(samples=3000)
    inflation = physics.InflationStage(history)
    _, _, _, _, radius = inflation.sample(samples=20)
    assert np.all(np.diff(radius) < 0)
    assert np.isclose(radius[-1] / radius[0], np.exp(-inflation.e_folds), rtol=1e-12)


def test_cmb_antipodes_need_inflation_for_shared_past(physics) -> None:
    history = physics.compute_history(samples=6000)
    inflation = physics.InflationStage(history)
    summary = physics.causal_summary(history, inflation)
    assert summary.past_cone_intersection_eta_gpc < 0
    assert summary.inflation_contains_intersection
    assert summary.inflation_start_eta_gpc < summary.past_cone_intersection_eta_gpc


def test_cmb_past_rays_are_null_and_intersect_at_summary_event(physics) -> None:
    history = physics.compute_history(samples=4000)
    inflation = physics.InflationStage(history)
    summary = physics.causal_summary(history, inflation)
    eta, right, left = physics.cmb_past_light_rays(
        eta_start_gpc=inflation.eta_at_start_gpc,
        eta_recombination_gpc=summary.eta_recombination_gpc,
        chi_last_scattering_gpc=summary.chi_last_scattering_gpc,
    )
    assert np.allclose(np.diff(right), np.diff(eta))
    assert np.allclose(np.diff(left), -np.diff(eta))
    right_at_intersection = np.interp(summary.past_cone_intersection_eta_gpc, eta, right)
    left_at_intersection = np.interp(summary.past_cone_intersection_eta_gpc, eta, left)
    assert np.isclose(right_at_intersection, 0.0, atol=1e-12)
    assert np.isclose(left_at_intersection, 0.0, atol=1e-12)


def test_proper_distance_is_scale_factor_times_comoving_distance(physics) -> None:
    scale_factor = np.array([0.25, 0.5, 1.0])
    comoving = np.array([-4.0, 2.0, 3.0])
    assert np.allclose(
        physics.proper_distance(scale_factor, comoving),
        np.array([-1.0, 1.0, 3.0]),
    )
    with pytest.raises(ValueError, match="non-negative"):
        physics.proper_distance(-1.0, 2.0)
