from __future__ import annotations

import numpy as np
import pytest


@pytest.mark.parametrize("radius", [0.7, 1.0, 2.3])
def test_ads_coordinate_maps_stay_on_quadric(physics, radius):
    geometry = physics.AntiDeSitter2(radius)
    tau = np.linspace(-2.0, 2.0, 9)
    rho = np.linspace(-1.6, 1.6, 9)
    global_points = geometry.global_to_embedding(tau, rho)
    poincare_points = geometry.poincare_to_embedding(
        np.linspace(-1.5, 1.5, 9) * radius,
        np.geomspace(0.15, 3.0, 9) * radius,
    )

    assert np.allclose(geometry.embedding_dot(global_points, global_points), -(radius**2))
    assert np.allclose(geometry.embedding_dot(poincare_points, poincare_points), -(radius**2))


@pytest.mark.parametrize("chart,coordinates", [("global", (0.4, -0.7)), ("poincare", (0.3, 0.8))])
def test_ads_frames_are_orthonormal_for_any_boost(physics, chart, coordinates):
    geometry = physics.AntiDeSitter2(1.4)
    point, time, space, null_plus, null_minus = geometry.frame(chart, *coordinates, rapidity=0.83)

    assert np.isclose(geometry.embedding_dot(point, time), 0.0)
    assert np.isclose(geometry.embedding_dot(point, space), 0.0)
    assert np.isclose(geometry.embedding_dot(time, time), -1.0)
    assert np.isclose(geometry.embedding_dot(space, space), 1.0)
    assert np.isclose(geometry.embedding_dot(time, space), 0.0)
    assert np.isclose(geometry.embedding_dot(null_plus, null_plus), 0.0)
    assert np.isclose(geometry.embedding_dot(null_minus, null_minus), 0.0)


@pytest.mark.parametrize(
    "chart,coordinates",
    [
        ("global", (0.4, 1.2)),
        ("flat", (-0.3, 0.7)),
        ("static", (0.6, -0.5)),
    ],
)
def test_ds_coordinate_maps_and_frames(physics, chart, coordinates):
    geometry = physics.DeSitter2(1.7)
    point, time, space, null_plus, null_minus = geometry.frame(chart, *coordinates, rapidity=-0.51)

    assert np.isclose(geometry.embedding_dot(point, point), geometry.L**2)
    assert np.isclose(geometry.embedding_dot(point, time), 0.0)
    assert np.isclose(geometry.embedding_dot(point, space), 0.0)
    assert np.isclose(geometry.embedding_dot(time, time), -1.0)
    assert np.isclose(geometry.embedding_dot(space, space), 1.0)
    assert np.isclose(geometry.embedding_dot(time, space), 0.0)
    assert np.isclose(geometry.embedding_dot(null_plus, null_plus), 0.0)
    assert np.isclose(geometry.embedding_dot(null_minus, null_minus), 0.0)


@pytest.mark.parametrize("geometry_name", ["AntiDeSitter2", "DeSitter2"])
def test_all_geodesic_causal_types_remain_on_quadric(physics, geometry_name):
    geometry = getattr(physics, geometry_name)(1.3)
    point, time, space, null_plus, _ = geometry.global_frame(0.25, 0.4, rapidity=0.35)
    expected = -(geometry.L**2) if geometry_name == "AntiDeSitter2" else geometry.L**2

    for tangent in (time, space, null_plus):
        curve = geometry.geodesic(point, tangent, np.linspace(-0.8, 0.8, 41))
        assert np.allclose(geometry.embedding_dot(curve, curve), expected, rtol=1e-10, atol=1e-10)
        midpoint = len(curve) // 2
        assert np.allclose(curve[midpoint], point)


def test_conformal_coordinates_have_correct_ranges_and_inverse_relation(physics):
    ads = physics.AntiDeSitter2()
    ds = physics.DeSitter2(2.0)
    rho = np.linspace(-6.0, 6.0, 31)
    tau = np.linspace(-12.0, 12.0, 31)

    sigma = ads.global_to_conformal(rho)
    eta = ds.global_to_conformal(tau)
    assert np.all(np.abs(sigma) < np.pi / 2)
    assert np.all(np.abs(eta) < np.pi / 2)
    assert np.allclose(np.tan(sigma), np.sinh(rho))
    assert np.allclose(np.tan(eta), np.sinh(tau / ds.L))


def test_invalid_chart_domains_are_rejected(physics):
    with pytest.raises(ValueError, match="positive"):
        physics.AntiDeSitter2().poincare_to_embedding(0.0, 0.0)
    with pytest.raises(ValueError, match=r"\|r\| < L"):
        physics.DeSitter2().static_to_embedding(0.0, 1.0)
