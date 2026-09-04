"""Torque-free dynamics of an asymmetric rigid body.

The principal moments satisfy ``0 < I1 < I2 < I3``. Quaternions map
body-frame components to inertial-space components, and angular momentum is
normalised to unit magnitude only when constructing the visualization presets.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

Vector3 = tuple[float, float, float]
Quaternion = tuple[float, float, float, float]
Inertia = tuple[float, float, float]

DEFAULT_INERTIA: Inertia = (1.0, 1.7, 2.4)
EPSILON = 1e-12


@dataclass(frozen=True, slots=True)
class RigidBodyState:
    """Angular velocity and body-to-space attitude at one time."""

    omega: Vector3
    quaternion: Quaternion = (1.0, 0.0, 0.0, 0.0)
    time: float = 0.0


def validate_inertia(inertia: Inertia) -> None:
    """Require three positive, strictly ordered principal moments."""

    if len(inertia) != 3 or not all(math.isfinite(value) for value in inertia):
        raise ValueError("inertia must contain three finite principal moments")
    if not 0 < inertia[0] < inertia[1] < inertia[2]:
        raise ValueError("principal moments must satisfy 0 < I1 < I2 < I3")


def norm(vector: tuple[float, ...]) -> float:
    """Return the Euclidean norm."""

    return math.sqrt(sum(component * component for component in vector))


def angular_momentum(omega: Vector3, inertia: Inertia = DEFAULT_INERTIA) -> Vector3:
    """Return body-frame angular momentum ``L = I omega``."""

    validate_inertia(inertia)
    return tuple(moment * component for moment, component in zip(inertia, omega, strict=True))


def angular_velocity(momentum: Vector3, inertia: Inertia = DEFAULT_INERTIA) -> Vector3:
    """Return body-frame angular velocity ``omega = I^-1 L``."""

    validate_inertia(inertia)
    return tuple(component / moment for component, moment in zip(momentum, inertia, strict=True))


def momentum_derivative(omega: Vector3, inertia: Inertia = DEFAULT_INERTIA) -> Vector3:
    """Return the body-frame Euler vector ``dL/dt = L cross omega``."""

    l1, l2, l3 = angular_momentum(omega, inertia)
    w1, w2, w3 = omega
    return l2 * w3 - l3 * w2, l3 * w1 - l1 * w3, l1 * w2 - l2 * w1


def euler_derivative(omega: Vector3, inertia: Inertia = DEFAULT_INERTIA) -> Vector3:
    """Return ``d omega/dt`` from the torque-free Euler equations."""

    validate_inertia(inertia)
    i1, i2, i3 = inertia
    w1, w2, w3 = omega
    return (
        (i2 - i3) * w2 * w3 / i1,
        (i3 - i1) * w3 * w1 / i2,
        (i1 - i2) * w1 * w2 / i3,
    )


def rotational_energy_from_omega(omega: Vector3, inertia: Inertia = DEFAULT_INERTIA) -> float:
    """Return ``E = omega dot I omega / 2``."""

    validate_inertia(inertia)
    return 0.5 * sum(
        moment * component * component for moment, component in zip(inertia, omega, strict=True)
    )


def rotational_energy_from_momentum(momentum: Vector3, inertia: Inertia = DEFAULT_INERTIA) -> float:
    """Return ``E = sum(L_i^2 / (2 I_i))``."""

    validate_inertia(inertia)
    return 0.5 * sum(
        component * component / moment for component, moment in zip(momentum, inertia, strict=True)
    )


def axis_stability(axis: int, inertia: Inertia = DEFAULT_INERTIA) -> str:
    """Classify the linear stability of rotation about a principal axis."""

    validate_inertia(inertia)
    if axis not in (0, 1, 2):
        raise ValueError("axis must be 0, 1, or 2")
    i1, i2, i3 = inertia
    growth_squared = (
        (i3 - i1) * (i1 - i2) / (i2 * i3),
        (i2 - i3) * (i1 - i2) / (i1 * i3),
        (i2 - i3) * (i3 - i1) / (i1 * i2),
    )[axis]
    return "unstable" if growth_squared > 0 else "stable"


def quaternion_multiply(left: Quaternion, right: Quaternion) -> Quaternion:
    """Return the Hamilton product of two scalar-first quaternions."""

    aw, ax, ay, az = left
    bw, bx, by, bz = right
    return (
        aw * bw - ax * bx - ay * by - az * bz,
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
    )


def quaternion_conjugate(quaternion: Quaternion) -> Quaternion:
    """Return the conjugate of a scalar-first quaternion."""

    w, x, y, z = quaternion
    return w, -x, -y, -z


def _normalise(values: tuple[float, ...]) -> tuple[float, ...]:
    length = norm(values)
    if length <= EPSILON:
        raise ValueError("cannot normalise a zero vector")
    return tuple(value / length for value in values)


def rotate_vector(quaternion: Quaternion, vector: Vector3) -> Vector3:
    """Rotate a body-frame vector into inertial space."""

    w, x, y, z = _normalise(quaternion)
    vx, vy, vz = vector
    tx, ty, tz = 2 * (y * vz - z * vy), 2 * (z * vx - x * vz), 2 * (x * vy - y * vx)
    return (
        vx + w * tx + y * tz - z * ty,
        vy + w * ty + z * tx - x * tz,
        vz + w * tz + x * ty - y * tx,
    )


def inverse_rotate_vector(quaternion: Quaternion, vector: Vector3) -> Vector3:
    """Rotate an inertial-space vector into body-frame coordinates."""

    return rotate_vector(quaternion_conjugate(_normalise(quaternion)), vector)


def _cross(left: Vector3, right: Vector3) -> Vector3:
    return (
        left[1] * right[2] - left[2] * right[1],
        left[2] * right[0] - left[0] * right[2],
        left[0] * right[1] - left[1] * right[0],
    )


def apply_impulse_at_body_point(
    state: RigidBodyState,
    application_point_body: Vector3,
    impulse_space: Vector3,
    inertia: Inertia = DEFAULT_INERTIA,
) -> RigidBodyState:
    """Apply the rotational part of an impulse at a body-fixed point.

    The centre of mass is constrained, so translational momentum is omitted and
    the space-frame angular momentum changes by ``r cross J`` only.
    """

    validate_inertia(inertia)
    if not all(math.isfinite(value) for value in (*application_point_body, *impulse_space)):
        raise ValueError("application point and impulse must be finite")
    point_space = rotate_vector(state.quaternion, application_point_body)
    momentum_space = rotate_vector(state.quaternion, angular_momentum(state.omega, inertia))
    angular_impulse_space = _cross(point_space, impulse_space)
    updated_momentum_space = tuple(
        component + delta
        for component, delta in zip(momentum_space, angular_impulse_space, strict=True)
    )
    updated_momentum_body = inverse_rotate_vector(state.quaternion, updated_momentum_space)
    return RigidBodyState(
        angular_velocity(updated_momentum_body, inertia),
        _normalise(state.quaternion),
        state.time,
    )


def _derivative(state: RigidBodyState, inertia: Inertia) -> tuple[Vector3, Quaternion]:
    omega_quaternion: Quaternion = (0.0, *state.omega)
    quaternion_dot = tuple(
        0.5 * value for value in quaternion_multiply(state.quaternion, omega_quaternion)
    )
    return euler_derivative(state.omega, inertia), quaternion_dot


def _offset(
    state: RigidBodyState, derivative: tuple[Vector3, Quaternion], amount: float
) -> RigidBodyState:
    return RigidBodyState(
        omega=tuple(
            value + amount * delta for value, delta in zip(state.omega, derivative[0], strict=True)
        ),
        quaternion=tuple(
            value + amount * delta
            for value, delta in zip(state.quaternion, derivative[1], strict=True)
        ),
        time=state.time,
    )


def rk4_step(
    state: RigidBodyState, dt: float, inertia: Inertia = DEFAULT_INERTIA
) -> RigidBodyState:
    """Advance angular velocity and attitude by one fourth-order Runge--Kutta step."""

    if not math.isfinite(dt) or dt == 0:
        raise ValueError("dt must be finite and non-zero")
    k1 = _derivative(state, inertia)
    k2 = _derivative(_offset(state, k1, dt / 2), inertia)
    k3 = _derivative(_offset(state, k2, dt / 2), inertia)
    k4 = _derivative(_offset(state, k3, dt), inertia)

    def combine(values: tuple[float, ...], index: int) -> tuple[float, ...]:
        return tuple(
            value
            + dt
            * (
                k1[index][component]
                + 2 * k2[index][component]
                + 2 * k3[index][component]
                + k4[index][component]
            )
            / 6
            for component, value in enumerate(values)
        )

    quaternion = _normalise(combine(state.quaternion, 1))
    return RigidBodyState(combine(state.omega, 0), quaternion, state.time + dt)


def initial_state(
    axis: int = 1, tilt_degrees: float = 6.0, inertia: Inertia = DEFAULT_INERTIA
) -> RigidBodyState:
    """Construct a near-principal-axis state on the unit angular-momentum sphere."""

    if axis not in (0, 1, 2):
        raise ValueError("axis must be 0, 1, or 2")
    if not 0 <= tilt_degrees < 90:
        raise ValueError("tilt must lie in [0, 90) degrees")
    tilt = math.radians(tilt_degrees)
    phase = 0.63
    direction = [0.0, 0.0, 0.0]
    direction[axis] = math.cos(tilt)
    direction[(axis + 1) % 3] = math.cos(phase) * math.sin(tilt)
    direction[(axis + 2) % 3] = math.sin(phase) * math.sin(tilt)
    scale = 1 / norm(angular_momentum(tuple(direction), inertia))
    return RigidBodyState(tuple(component * scale for component in direction))
