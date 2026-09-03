"""Pure mathematics for the 2D conformal-transformation visualization.

The complex coordinate is ``z = x + i y``.  A real-differentiable map has

    delta w = A delta z + B delta conjugate(z),

where ``A = partial_z f`` and ``B = partial_conjugate(z) f``.  Holomorphic
conformal maps have ``B=0`` and ``A != 0``; antiholomorphic maps have ``A=0``
and ``B != 0`` and reverse orientation.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

Array = np.ndarray


def complex_map(name: str, z: Array | complex, *, mixing: complex = 0.4) -> Array:
    """Evaluate one of the pedagogical local complex maps."""

    z = np.asarray(z, dtype=complex)
    if name == "identity":
        return z
    if name == "square":
        return z**2
    if name == "conjugate":
        return np.conjugate(z)
    if name == "mixed":
        return z + mixing * np.conjugate(z)
    if name == "exponential":
        return np.exp(z)
    if name == "special-conformal":
        return z / (1.0 + mixing * z)
    raise ValueError(f"Unknown complex map: {name!r}")


def analytic_wirtinger(
    name: str, z: Array | complex, *, mixing: complex = 0.4
) -> tuple[Array, Array]:
    """Return the analytic Wirtinger coefficients ``(partial_z f, partial_zbar f)``."""

    z = np.asarray(z, dtype=complex)
    zeros = np.zeros_like(z)
    ones = np.ones_like(z)
    if name == "identity":
        return ones, zeros
    if name == "square":
        return 2.0 * z, zeros
    if name == "conjugate":
        return zeros, ones
    if name == "mixed":
        return ones, np.full_like(z, mixing)
    if name == "exponential":
        return np.exp(z), zeros
    if name == "special-conformal":
        return 1.0 / (1.0 + mixing * z) ** 2, zeros
    raise ValueError(f"Unknown complex map: {name!r}")


def numerical_wirtinger(function, z: complex, step: float = 1e-6) -> tuple[complex, complex]:
    """Estimate Wirtinger derivatives from centered real-coordinate differences."""

    if step <= 0:
        raise ValueError("step must be positive")
    derivative_x = (function(z + step) - function(z - step)) / (2.0 * step)
    derivative_y = (function(z + 1j * step) - function(z - 1j * step)) / (2.0 * step)
    partial_z = 0.5 * (derivative_x - 1j * derivative_y)
    partial_zbar = 0.5 * (derivative_x + 1j * derivative_y)
    return complex(partial_z), complex(partial_zbar)


def jacobian_from_wirtinger(partial_z: complex, partial_zbar: complex) -> Array:
    """Return the 2x2 real Jacobian associated with ``A dz + B dzbar``."""

    derivative_x = partial_z + partial_zbar
    derivative_y = 1j * (partial_z - partial_zbar)
    return np.asarray(
        [
            [np.real(derivative_x), np.real(derivative_y)],
            [np.imag(derivative_x), np.imag(derivative_y)],
        ],
        dtype=float,
    )


def conformal_diagnostics(partial_z: complex, partial_zbar: complex) -> dict[str, float | str]:
    """Return singular values, Jacobian determinant, and orientation of a local map."""

    magnitude_z = abs(partial_z)
    magnitude_zbar = abs(partial_zbar)
    singular_max = magnitude_z + magnitude_zbar
    singular_min = abs(magnitude_z - magnitude_zbar)
    determinant = magnitude_z**2 - magnitude_zbar**2
    if np.isclose(determinant, 0.0, atol=1e-12):
        orientation = "degenerate"
    elif determinant > 0:
        orientation = "preserving"
    else:
        orientation = "reversing"
    distortion = np.inf if singular_min < 1e-14 else singular_max / singular_min
    return {
        "sigma_max": float(singular_max),
        "sigma_min": float(singular_min),
        "distortion": float(distortion),
        "determinant": float(determinant),
        "orientation": orientation,
    }


def differential_circle(
    center: complex,
    radius: float,
    partial_z: complex,
    partial_zbar: complex,
    samples: int = 241,
) -> Array:
    """Return the first-order image of a small circle under a real-linear differential."""

    angle = np.linspace(0.0, 2.0 * np.pi, samples)
    displacement = radius * np.exp(1j * angle)
    return center + partial_z * displacement + partial_zbar * np.conjugate(displacement)


def directional_difference_quotient(function, z: complex, radius: float, angles: Array) -> Array:
    """Evaluate the complex difference quotient along directions ``angles``."""

    if radius <= 0:
        raise ValueError("radius must be positive")
    angles = np.asarray(angles, dtype=float)
    displacement = radius * np.exp(1j * angles)
    return (function(z + displacement) - function(z)) / displacement


@dataclass(frozen=True, slots=True)
class MobiusTransformation:
    """A nonsingular 2x2 complex matrix acting projectively on CP1."""

    a: complex = 1.0
    b: complex = 0.0
    c: complex = 0.0
    d: complex = 1.0

    def __post_init__(self) -> None:
        if abs(self.determinant) < 1e-12:
            raise ValueError("A Mobius transformation requires ad-bc != 0")

    @property
    def matrix(self) -> Array:
        return np.asarray([[self.a, self.b], [self.c, self.d]], dtype=complex)

    @property
    def determinant(self) -> complex:
        return self.a * self.d - self.b * self.c

    def normalized_matrix(self) -> Array:
        """Return an SL(2,C) representative of the same projective map."""

        return self.matrix / np.sqrt(self.determinant)

    def __call__(self, z: Array | complex) -> Array:
        z = np.asarray(z, dtype=complex)
        with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
            return (self.a * z + self.b) / (self.c * z + self.d)

    def derivative(self, z: Array | complex) -> Array:
        z = np.asarray(z, dtype=complex)
        with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
            return self.determinant / (self.c * z + self.d) ** 2

    def transform_homogeneous(self, spinors: Array) -> Array:
        """Act on homogeneous coordinates shaped ``(2, ...)``."""

        spinors = np.asarray(spinors, dtype=complex)
        if spinors.ndim < 1 or spinors.shape[0] != 2:
            raise ValueError("homogeneous coordinates must have shape (2, ...)")
        shape = spinors.shape
        return (self.matrix @ spinors.reshape(2, -1)).reshape(shape)

    def fixed_point_spinors(self) -> Array:
        """Return the distinct fixed eigenlines on CP1.

        A scalar matrix fixes every projective point, so an empty array denotes
        that there is no discrete fixed-point set to mark.
        """

        matrix = self.matrix
        if np.allclose(matrix, matrix[0, 0] * np.eye(2), rtol=1e-10, atol=1e-12):
            return np.empty((2, 0), dtype=complex)

        _, eigenvectors = np.linalg.eig(matrix)
        distinct: list[Array] = []
        for eigenvector in eigenvectors.T:
            eigenvector = eigenvector / np.linalg.norm(eigenvector)
            if all(
                abs(existing[0] * eigenvector[1] - existing[1] * eigenvector[0]) > 1e-10
                for existing in distinct
            ):
                distinct.append(eigenvector)
        return np.column_stack(distinct)


def su2_euler(alpha: float, beta: float, gamma: float) -> Array:
    """Return the SU(2) matrix for Z-Y-Z Euler angles."""

    rotation_a = np.diag([np.exp(0.5j * alpha), np.exp(-0.5j * alpha)])
    rotation_b = np.asarray(
        [
            [np.cos(beta / 2.0), -np.sin(beta / 2.0)],
            [np.sin(beta / 2.0), np.cos(beta / 2.0)],
        ],
        dtype=complex,
    )
    rotation_g = np.diag([np.exp(0.5j * gamma), np.exp(-0.5j * gamma)])
    return rotation_a @ rotation_b @ rotation_g


def mobius_iwasawa(
    *,
    alpha: float = 0.0,
    beta: float = 0.0,
    gamma: float = 0.0,
    rho: float = 0.0,
    translation: complex = 0.0,
) -> MobiusTransformation:
    """Construct ``M=KAN`` in SL(2,C), giving six nonredundant real parameters."""

    compact = su2_euler(alpha, beta, gamma)
    dilation = np.diag([np.exp(rho / 2.0), np.exp(-rho / 2.0)])
    shift = np.asarray([[1.0, translation], [0.0, 1.0]], dtype=complex)
    matrix = compact @ dilation @ shift
    return MobiusTransformation(*matrix.ravel())


def sphere_spinor(theta: Array | float, phi: Array | float) -> Array:
    """Map spherical coordinates to normalized homogeneous CP1 coordinates."""

    theta, phi = np.broadcast_arrays(np.asarray(theta, float), np.asarray(phi, float))
    upper = np.cos(theta / 2.0) * np.exp(1j * phi)
    lower = np.sin(theta / 2.0).astype(complex)
    return np.stack([upper, lower], axis=0)


def complex_to_spinor(z: Array | complex) -> Array:
    """Map finite complex values ``z`` to normalized homogeneous points ``[z:1]``."""

    z = np.asarray(z, dtype=complex)
    normalization = np.sqrt(1.0 + np.abs(z) ** 2)
    return np.stack([z / normalization, 1.0 / normalization], axis=0)


def spinor_to_sphere(spinors: Array) -> Array:
    """Apply the Hopf/Bloch map from CP1 homogeneous coordinates to S2."""

    spinors = np.asarray(spinors, dtype=complex)
    if spinors.ndim < 1 or spinors.shape[0] != 2:
        raise ValueError("homogeneous coordinates must have shape (2, ...)")
    upper, lower = spinors
    norm = np.abs(upper) ** 2 + np.abs(lower) ** 2
    if np.any(norm == 0):
        raise ValueError("the zero spinor does not define a point of CP1")
    cross = upper * np.conjugate(lower)
    return np.stack(
        [
            2.0 * np.real(cross) / norm,
            2.0 * np.imag(cross) / norm,
            (np.abs(upper) ** 2 - np.abs(lower) ** 2) / norm,
        ],
        axis=0,
    )


def cross_ratio(z1: complex, z2: complex, z3: complex, z4: complex) -> complex:
    """Return the ordered cross ratio (z1-z3)(z2-z4)/((z1-z4)(z2-z3))."""

    return (z1 - z3) * (z2 - z4) / ((z1 - z4) * (z2 - z3))


def witt_vector_field(mode: int, z: Array | complex) -> Array:
    """Return the holomorphic Witt vector field ell_m(z) = -z^(m+1)."""

    z = np.asarray(z, dtype=complex)
    with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
        return -(z ** (int(mode) + 1))


def witt_flow(z: Array | complex, mode: int, epsilon: complex) -> Array:
    """Return a local finite flow of ``ell_m=-z^(m+1) partial_z``.

    For modes outside -1, 0, 1 the principal complex-power branch is used;
    this is only a local chart of the flow and is not a global sphere map.
    """

    z = np.asarray(z, dtype=complex)
    mode = int(mode)
    if epsilon == 0:
        return z
    if mode == -1:
        return z - epsilon
    if mode == 0:
        return np.exp(-epsilon) * z
    with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
        return z / (1.0 + mode * epsilon * z**mode) ** (1.0 / mode)


def witt_bracket_coefficient(mode_m: int, mode_n: int) -> tuple[int, int]:
    """Encode [ell_m,ell_n]=(m-n)ell_(m+n) as ``(coefficient, mode)``."""

    return int(mode_m) - int(mode_n), int(mode_m) + int(mode_n)
