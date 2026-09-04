from __future__ import annotations

import math

import pytest


def static_history(physics):
    return [
        physics.SourceState(t=-20, x=0, y=0),
        physics.SourceState(t=20, x=0, y=0),
    ]


def test_stationary_charge_has_coulomb_field_and_no_magnetic_field(physics) -> None:
    field = physics.lienard_wiechert_field(
        (2, 0, 0),
        0,
        static_history(physics),
        propagation_speed=4,
        softening=0,
    )

    assert field.electric == pytest.approx((0.25, 0, 0))
    assert field.magnetic == pytest.approx((0, 0, 0))
    assert field.radiation_electric == pytest.approx((0, 0, 0))


def test_stationary_charge_is_radial_on_perpendicular_plane(physics) -> None:
    field = physics.lienard_wiechert_field(
        (0, 0, 2),
        0,
        static_history(physics),
        propagation_speed=4,
        softening=0,
    )

    assert field.electric == pytest.approx((0, 0, 0.25))
    assert field.magnetic == pytest.approx((0, 0, 0))


def test_retarded_source_lies_on_past_light_cone(physics) -> None:
    history = [
        physics.SourceState(t=-5, x=-0.5, y=0, vx=0.1),
        physics.SourceState(t=5, x=0.5, y=0, vx=0.1),
    ]
    point = (2, 1, 0)
    source = physics.retarded_state(point, 1.3, history, 3)
    distance = math.dist(point, (source.x, source.y, source.z))

    assert source.t + distance / 3 == pytest.approx(1.3, abs=2e-12)


def test_radiation_field_is_transverse_and_inverse_distance(physics) -> None:
    history = [
        physics.SourceState(t=-20, x=0, y=0, ax=1),
        physics.SourceState(t=20, x=0, y=0, ax=1),
    ]
    near = physics.lienard_wiechert_field((0, 2, 0), 0, history, propagation_speed=4, softening=0)
    far = physics.lienard_wiechert_field((0, 4, 0), 0, history, propagation_speed=4, softening=0)

    assert near.radiation_electric[1] == pytest.approx(0)
    assert far.radiation_electric[1] == pytest.approx(0)
    assert physics.field_magnitude(near.radiation_electric) / physics.field_magnitude(
        far.radiation_electric
    ) == pytest.approx(2)


def test_magnetic_field_obeys_n_cross_e_over_c(physics) -> None:
    history = [
        physics.SourceState(t=-20, x=0, y=0, vx=0.4, vy=0.1, ax=0.2, ay=-0.3),
        physics.SourceState(t=20, x=0, y=0, vx=0.4, vy=0.1, ax=0.2, ay=-0.3),
    ]
    point = (3, 4, 0)
    field = physics.lienard_wiechert_field(point, 0, history, propagation_speed=5, softening=0)
    direction = tuple(
        (coordinate - source_coordinate) / field.distance
        for coordinate, source_coordinate in zip(
            point, (field.source.x, field.source.y, field.source.z), strict=True
        )
    )
    expected_z = (direction[0] * field.electric[1] - direction[1] * field.electric[0]) / 5

    assert field.magnetic[2] == pytest.approx(expected_z)
