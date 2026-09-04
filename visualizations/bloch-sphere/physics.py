"""Pure-state qubit calculations used by the Bloch-sphere application."""

from __future__ import annotations

import cmath
import math

Qubit = tuple[complex, complex]
Vector3 = tuple[float, float, float]
Matrix2 = tuple[tuple[complex, complex], tuple[complex, complex]]


def normalize(state: Qubit) -> Qubit:
    """Normalize a nonzero two-component complex state."""

    components = tuple(
        component for amplitude in state for component in (amplitude.real, amplitude.imag)
    )
    if not all(math.isfinite(component) for component in components):
        raise ValueError("state amplitudes must be finite")
    scale = max(abs(component) for component in components)
    if scale == 0:
        raise ValueError("a zero vector cannot be normalized")
    scaled_length = math.hypot(*(component / scale for component in components))
    if scale <= 1e-14 / scaled_length:
        raise ValueError("a zero vector cannot be normalized")
    return state[0] / scale / scaled_length, state[1] / scale / scaled_length


def state_from_angles(theta: float, phi: float) -> Qubit:
    """Return ``cos(theta/2)|0> + exp(i phi) sin(theta/2)|1>``."""

    if not math.isfinite(theta) or not math.isfinite(phi):
        raise ValueError("state angles must be finite")
    return math.cos(theta / 2.0), cmath.exp(1j * phi) * math.sin(theta / 2.0)


def bloch_vector(state: Qubit) -> Vector3:
    """Return the three Pauli expectation values of a pure state."""

    alpha, beta = normalize(state)
    overlap = alpha.conjugate() * beta
    return 2.0 * overlap.real, 2.0 * overlap.imag, abs(alpha) ** 2 - abs(beta) ** 2


def coherent_sum(left: Qubit, right: Qubit, relative_phase: float = 0.0) -> Qubit:
    """Add two kets with a relative phase and normalize the result."""

    phase = cmath.exp(1j * relative_phase)
    return normalize((left[0] + phase * right[0], left[1] + phase * right[1]))


def apply_unitary(matrix: Matrix2, state: Qubit) -> Qubit:
    """Apply a two-by-two matrix and normalize its result."""

    a, b = state
    return normalize((matrix[0][0] * a + matrix[0][1] * b, matrix[1][0] * a + matrix[1][1] * b))


PAULI_X: Matrix2 = ((0j, 1 + 0j), (1 + 0j, 0j))
PAULI_Y: Matrix2 = ((0j, -1j), (1j, 0j))
PAULI_Z: Matrix2 = ((1 + 0j, 0j), (0j, -1 + 0j))
HADAMARD: Matrix2 = (
    (1 / math.sqrt(2), 1 / math.sqrt(2)),
    (1 / math.sqrt(2), -1 / math.sqrt(2)),
)
