r"""Liénard–Wiechert fields used by the moving-charge visualization.

The module uses dimensionless units.  ``propagation_speed`` represents
:math:`c`, and ``coulomb_constant`` represents :math:`1/(4\pi\epsilon_0)`.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass, replace

Vector3 = tuple[float, float, float]
EPSILON = 1e-12


@dataclass(frozen=True, slots=True)
class SourceState:
    """Position, velocity, and acceleration of the source charge."""

    t: float
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    ax: float = 0.0
    ay: float = 0.0
    z: float = 0.0
    vz: float = 0.0
    az: float = 0.0


@dataclass(frozen=True, slots=True)
class FieldSample:
    """Decomposed electric and magnetic fields at an observation event."""

    electric: Vector3
    magnetic: Vector3
    velocity_electric: Vector3
    radiation_electric: Vector3
    velocity_magnetic: Vector3
    radiation_magnetic: Vector3
    source: SourceState
    retarded_time: float
    distance: float


def _lerp(left: float, right: float, amount: float) -> float:
    return left + (right - left) * amount


def _cross(left: Vector3, right: Vector3) -> Vector3:
    return (
        left[1] * right[2] - left[2] * right[1],
        left[2] * right[0] - left[0] * right[2],
        left[0] * right[1] - left[1] * right[0],
    )


def _scale(vector: Vector3, factor: float) -> Vector3:
    return vector[0] * factor, vector[1] * factor, vector[2] * factor


def _add(left: Vector3, right: Vector3) -> Vector3:
    return left[0] + right[0], left[1] + right[1], left[2] + right[2]


def state_at_time(history: Sequence[SourceState], time: float) -> SourceState:
    """Interpolate a trajectory with cubic Hermite positions."""

    if not history:
        raise ValueError("trajectory history must not be empty")
    first, last = history[0], history[-1]
    if time <= first.t:
        return replace(first, t=time, vx=0.0, vy=0.0, vz=0.0, ax=0.0, ay=0.0, az=0.0)
    if time >= last.t:
        return replace(last, t=time)

    lower, upper = 0, len(history) - 1
    while upper - lower > 1:
        middle = (lower + upper) // 2
        if history[middle].t <= time:
            lower = middle
        else:
            upper = middle

    left, right = history[lower], history[upper]
    duration = right.t - left.t
    amount = (time - left.t) / duration if duration > EPSILON else 0.0
    amount2, amount3 = amount**2, amount**3
    h00 = 2 * amount3 - 3 * amount2 + 1
    h10 = amount3 - 2 * amount2 + amount
    h01 = -2 * amount3 + 3 * amount2
    h11 = amount3 - amount2

    def position(name: str, velocity_name: str) -> float:
        return (
            h00 * getattr(left, name)
            + h10 * duration * getattr(left, velocity_name)
            + h01 * getattr(right, name)
            + h11 * duration * getattr(right, velocity_name)
        )

    return SourceState(
        t=time,
        x=position("x", "vx"),
        y=position("y", "vy"),
        z=position("z", "vz"),
        vx=_lerp(left.vx, right.vx, amount),
        vy=_lerp(left.vy, right.vy, amount),
        vz=_lerp(left.vz, right.vz, amount),
        ax=_lerp(left.ax, right.ax, amount),
        ay=_lerp(left.ay, right.ay, amount),
        az=_lerp(left.az, right.az, amount),
    )


def _arrival_residual(
    point: Vector3,
    observation_time: float,
    history: Sequence[SourceState],
    propagation_speed: float,
    emission_time: float,
) -> float:
    source = state_at_time(history, emission_time)
    distance = math.dist(point, (source.x, source.y, source.z))
    return emission_time + distance / propagation_speed - observation_time


def retarded_state(
    point: Vector3,
    observation_time: float,
    history: Sequence[SourceState],
    propagation_speed: float,
) -> SourceState:
    """Return the source state on the observation event's past light cone."""

    if propagation_speed <= 0:
        raise ValueError("propagation speed must be positive")
    if not history:
        raise ValueError("trajectory history must not be empty")

    first, last = history[0], history[-1]
    if _arrival_residual(point, observation_time, history, propagation_speed, first.t) >= 0:
        distance = math.dist(point, (first.x, first.y, first.z))
        return replace(
            first,
            t=observation_time - distance / propagation_speed,
            vx=0.0,
            vy=0.0,
            vz=0.0,
            ax=0.0,
            ay=0.0,
            az=0.0,
        )
    if _arrival_residual(point, observation_time, history, propagation_speed, last.t) <= 0:
        distance = math.dist(point, (last.x, last.y, last.z))
        return replace(
            last,
            t=observation_time - distance / propagation_speed,
            vx=0.0,
            vy=0.0,
            vz=0.0,
            ax=0.0,
            ay=0.0,
            az=0.0,
        )

    lower, upper = first.t, last.t
    for _ in range(48):
        middle = (lower + upper) / 2
        residual = _arrival_residual(point, observation_time, history, propagation_speed, middle)
        if residual > 0:
            upper = middle
        else:
            lower = middle
    return state_at_time(history, (lower + upper) / 2)


def lienard_wiechert_field(
    point: Vector3,
    observation_time: float,
    history: Sequence[SourceState],
    *,
    propagation_speed: float = 3.0,
    charge: float = 1.0,
    coulomb_constant: float = 1.0,
    softening: float = 0.12,
) -> FieldSample:
    """Evaluate velocity and radiation terms of the retarded fields."""

    source = retarded_state(point, observation_time, history, propagation_speed)
    displacement = (
        point[0] - source.x,
        point[1] - source.y,
        point[2] - source.z,
    )
    geometric_distance = math.sqrt(sum(component**2 for component in displacement))
    zero = (0.0, 0.0, 0.0)
    if geometric_distance < EPSILON:
        return FieldSample(zero, zero, zero, zero, zero, zero, source, source.t, 0.0)

    distance = max(softening, geometric_distance)
    direction = _scale(displacement, 1 / geometric_distance)
    beta = (
        source.vx / propagation_speed,
        source.vy / propagation_speed,
        source.vz / propagation_speed,
    )
    beta_squared = min(0.98, sum(component**2 for component in beta))
    beta_dot = (
        source.ax / propagation_speed,
        source.ay / propagation_speed,
        source.az / propagation_speed,
    )
    kappa = max(0.035, 1 - sum(a * b for a, b in zip(direction, beta, strict=True)))
    n_minus_beta: Vector3 = (
        direction[0] - beta[0],
        direction[1] - beta[1],
        direction[2] - beta[2],
    )
    velocity_factor = charge * coulomb_constant * (1 - beta_squared) / (kappa**3 * distance**2)
    velocity_electric = _scale(n_minus_beta, velocity_factor)

    n_dot_beta_dot = sum(a * b for a, b in zip(direction, beta_dot, strict=True))
    n_dot_n_minus_beta = sum(a * b for a, b in zip(direction, n_minus_beta, strict=True))
    radiation_numerator: Vector3 = (
        n_minus_beta[0] * n_dot_beta_dot - beta_dot[0] * n_dot_n_minus_beta,
        n_minus_beta[1] * n_dot_beta_dot - beta_dot[1] * n_dot_n_minus_beta,
        n_minus_beta[2] * n_dot_beta_dot - beta_dot[2] * n_dot_n_minus_beta,
    )
    radiation_factor = charge * coulomb_constant / (propagation_speed * kappa**3 * distance)
    radiation_electric = _scale(radiation_numerator, radiation_factor)
    electric = _add(velocity_electric, radiation_electric)
    velocity_magnetic = _scale(_cross(direction, velocity_electric), 1 / propagation_speed)
    radiation_magnetic = _scale(_cross(direction, radiation_electric), 1 / propagation_speed)
    magnetic = _add(velocity_magnetic, radiation_magnetic)
    return FieldSample(
        electric,
        magnetic,
        velocity_electric,
        radiation_electric,
        velocity_magnetic,
        radiation_magnetic,
        source,
        source.t,
        geometric_distance,
    )


def field_magnitude(vector: Vector3) -> float:
    """Return a three-vector's Euclidean norm."""

    return math.sqrt(sum(component**2 for component in vector))


def larmor_power(charge: float, acceleration: Vector3, propagation_speed: float) -> float:
    """Return the nonrelativistic Larmor power in the chosen units."""

    if propagation_speed <= 0:
        raise ValueError("propagation speed must be positive")
    return (
        2 * charge**2 * sum(component**2 for component in acceleration) / (3 * propagation_speed**3)
    )
