from __future__ import annotations

import math

import pytest


def test_only_intermediate_axis_is_linearly_unstable(physics) -> None:
    assert [physics.axis_stability(axis) for axis in range(3)] == [
        "stable",
        "unstable",
        "stable",
    ]


def test_presets_share_the_unit_angular_momentum_sphere(physics) -> None:
    for axis in range(3):
        state = physics.initial_state(axis, 6)
        assert physics.norm(physics.angular_momentum(state.omega)) == pytest.approx(1.0)


def test_euler_vector_is_tangent_to_both_invariant_surfaces(physics) -> None:
    omega = (0.31, -0.48, 0.77)
    momentum = physics.angular_momentum(omega)
    derivative = physics.momentum_derivative(omega)
    assert sum(a * b for a, b in zip(momentum, derivative, strict=True)) == pytest.approx(0)
    assert sum(a * b for a, b in zip(omega, derivative, strict=True)) == pytest.approx(0)


def test_rk4_conserves_energy_and_space_angular_momentum(physics) -> None:
    state = physics.initial_state(1, 5)
    initial_energy = physics.rotational_energy_from_omega(state.omega)
    initial_space_momentum = physics.rotate_vector(
        state.quaternion, physics.angular_momentum(state.omega)
    )
    for _ in range(20_000):
        state = physics.rk4_step(state, 0.002)
    assert physics.rotational_energy_from_omega(state.omega) == pytest.approx(
        initial_energy, abs=2e-11
    )
    assert physics.norm(physics.angular_momentum(state.omega)) == pytest.approx(1, abs=2e-11)
    assert physics.rotate_vector(
        state.quaternion, physics.angular_momentum(state.omega)
    ) == pytest.approx(initial_space_momentum, abs=2e-10)


def test_space_rotation_maps_grabbed_direction_to_pointer_target(physics) -> None:
    start = (1.2, -0.4, 0.7)
    end = (-0.3, 0.9, 1.1)
    rotation = physics.rotation_vector_between(start, end)
    quaternion = physics.apply_space_rotation((1.0, 0.0, 0.0, 0.0), rotation)
    rotated = physics.rotate_vector(quaternion, start)
    assert tuple(value / physics.norm(rotated) for value in rotated) == pytest.approx(
        tuple(value / physics.norm(end) for value in end), abs=2e-15
    )


def test_space_rotation_premultiplies_existing_attitude(physics) -> None:
    attitude = (math.cos(0.31), 0.0, math.sin(0.31), 0.0)
    before = physics.rotate_vector(attitude, (1.0, 0.0, 0.0))
    rotation = (0.17, -0.23, 0.31)
    delta = physics.apply_space_rotation((1.0, 0.0, 0.0, 0.0), rotation)
    expected = physics.rotate_vector(delta, before)
    updated = physics.apply_space_rotation(attitude, rotation)
    assert physics.rotate_vector(updated, (1.0, 0.0, 0.0)) == pytest.approx(expected, abs=2e-15)


def test_small_perturbation_flips_only_intermediate_axis(physics) -> None:
    maximum_departures = []
    for axis in range(3):
        state = physics.initial_state(axis, 3)
        largest = 0.0
        for _ in range(20_000):
            state = physics.rk4_step(state, 0.003)
            momentum = physics.angular_momentum(state.omega)
            cosine = max(-1.0, min(1.0, momentum[axis] / physics.norm(momentum)))
            largest = max(largest, math.acos(cosine))
        maximum_departures.append(largest)
    assert maximum_departures[0] < math.radians(10)
    assert maximum_departures[1] > math.radians(170)
    assert maximum_departures[2] < math.radians(10)


def test_better_intermediate_axis_alignment_delays_first_complete_flip(physics) -> None:
    def first_flip_time(tilt: float) -> float | None:
        state = physics.initial_state(1, tilt)
        for _ in range(15_000):
            state = physics.rk4_step(state, 0.003)
            momentum = physics.angular_momentum(state.omega)
            if momentum[1] / physics.norm(momentum) <= -0.98:
                return state.time
        return None

    coarse = first_flip_time(8.0)
    fine = first_flip_time(2.0)
    assert coarse is not None
    assert fine is not None
    assert fine > coarse + 4.0
