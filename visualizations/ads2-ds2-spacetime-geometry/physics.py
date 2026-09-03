"""Pure geometry for the AdS2/dS2 spacetime visualization.

Conventions
-----------
AdS2 is the quadric ``-X_{-1}^2-X_0^2+X_1^2=-L^2`` in R^(2,1).
AdS arrays store coordinates as ``(X_{-1}, X_1, X_0)``, giving the ambient
metric ``diag(-,+,-)``.  Its global time coordinate ``tau`` is dimensionless.
The displayed quadric has periodic time; the physical spacetime used in most
applications is its universal cover, obtained by unwrapping ``tau``.

dS2 is the quadric ``-X0^2 + X1^2 + X2^2 = L^2`` in R^(1,2).  Its global,
flat-slicing, and static-patch time coordinates have dimensions of length.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

Array = np.ndarray


def _positive_radius(radius: float) -> float:
    value = float(radius)
    if not np.isfinite(value) or value <= 0:
        raise ValueError("The curvature radius L must be finite and positive")
    return value


def _stack(*coordinates: Array | float) -> Array:
    arrays = np.broadcast_arrays(*(np.asarray(value, dtype=float) for value in coordinates))
    return np.stack(arrays, axis=-1)


def _require_finite(name: str, value: Array) -> None:
    if not np.all(np.isfinite(value)):
        raise ValueError(f"{name} must contain only finite values")


@dataclass(frozen=True, slots=True)
class AntiDeSitter2:
    """Two-dimensional anti-de Sitter geometry with radius ``L``."""

    L: float = 1.0

    def __post_init__(self) -> None:
        object.__setattr__(self, "L", _positive_radius(self.L))

    @property
    def scalar_curvature(self) -> float:
        """Return R = -2/L^2 for AdS2."""

        return -2.0 / self.L**2

    @staticmethod
    def embedding_dot(a: Array, b: Array) -> Array:
        """Ambient inner product with signature (-,+,-)."""

        a = np.asarray(a, dtype=float)
        b = np.asarray(b, dtype=float)
        return -a[..., 0] * b[..., 0] + a[..., 1] * b[..., 1] - a[..., 2] * b[..., 2]

    def global_to_embedding(self, tau: Array | float, rho: Array | float) -> Array:
        """Map dimensionless global coordinates ``(tau, rho)`` to the quadric."""

        tau, rho = np.broadcast_arrays(np.asarray(tau, float), np.asarray(rho, float))
        return _stack(
            self.L * np.cosh(rho) * np.cos(tau),
            self.L * np.sinh(rho),
            self.L * np.cosh(rho) * np.sin(tau),
        )

    def poincare_to_embedding(self, t: Array | float, z: Array | float) -> Array:
        """Map Poincare coordinates to AdS2; ``z`` must be strictly positive."""

        t, z = np.broadcast_arrays(np.asarray(t, float), np.asarray(z, float))
        _require_finite("t", t)
        if not np.all(np.isfinite(z) & (z > 0)):
            raise ValueError("Poincare radial coordinate z must be finite and positive")
        length = self.L
        return _stack(
            (length**2 + z**2 - t**2) / (2.0 * z),
            (length**2 - z**2 + t**2) / (2.0 * z),
            length * t / z,
        )

    def global_frame(
        self, tau: float, rho: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        """Return a boosted orthonormal/null frame at a global-coordinate point."""

        point = self.global_to_embedding(tau, rho)
        timelike = np.asarray([-np.sin(tau), 0.0, np.cos(tau)])
        spacelike = np.asarray(
            [np.sinh(rho) * np.cos(tau), np.cosh(rho), np.sinh(rho) * np.sin(tau)]
        )
        return self._boosted_frame(point, timelike, spacelike, rapidity)

    def poincare_frame(
        self, t: float, z: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        """Return a boosted orthonormal/null frame in the Poincare patch."""

        point = self.poincare_to_embedding(t, z)
        length = self.L
        timelike = np.asarray([-t / length, t / length, 1.0])
        spacelike = np.asarray(
            [
                (-(length**2) + z**2 + t**2) / (2.0 * length * z),
                -(length**2 + z**2 + t**2) / (2.0 * length * z),
                -t / z,
            ]
        )
        return self._boosted_frame(point, timelike, spacelike, rapidity)

    def frame(
        self, chart: str, q1: float, q2: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        """Return a local frame for ``chart`` (``global`` or ``poincare``)."""

        if chart == "global":
            return self.global_frame(q1, q2, rapidity)
        if chart == "poincare":
            return self.poincare_frame(q1, q2, rapidity)
        raise ValueError(f"Unknown AdS2 chart: {chart!r}")

    def _boosted_frame(
        self, point: Array, timelike: Array, spacelike: Array, rapidity: float
    ) -> tuple[Array, Array, Array, Array, Array]:
        chi = float(rapidity)
        boosted_time = np.cosh(chi) * timelike + np.sinh(chi) * spacelike
        boosted_space = np.sinh(chi) * timelike + np.cosh(chi) * spacelike
        return (
            point,
            boosted_time,
            boosted_space,
            boosted_time + boosted_space,
            boosted_time - boosted_space,
        )

    def geodesic(self, point: Array, tangent: Array, affine_parameter: Array) -> Array:
        """Return the geodesic determined by an ambient point and normalized tangent."""

        point, tangent = self._validate_initial_data(point, tangent)
        parameter = np.atleast_1d(np.asarray(affine_parameter, dtype=float))
        norm = float(self.embedding_dot(tangent, tangent))
        if np.isclose(norm, -1.0, atol=1e-8):
            return (
                np.cos(parameter / self.L)[:, None] * point
                + self.L * np.sin(parameter / self.L)[:, None] * tangent
            )
        if np.isclose(norm, 1.0, atol=1e-8):
            return (
                np.cosh(parameter / self.L)[:, None] * point
                + self.L * np.sinh(parameter / self.L)[:, None] * tangent
            )
        if np.isclose(norm, 0.0, atol=1e-8):
            return point + parameter[:, None] * tangent
        raise ValueError("The tangent must have ambient norm -1, 0, or +1")

    def _validate_initial_data(self, point: Array, tangent: Array) -> tuple[Array, Array]:
        point = np.asarray(point, dtype=float)
        tangent = np.asarray(tangent, dtype=float)
        if point.shape != (3,) or tangent.shape != (3,):
            raise ValueError("point and tangent must both have shape (3,)")
        if not np.isclose(self.embedding_dot(point, point), -(self.L**2), atol=1e-8):
            raise ValueError("point is not on the AdS2 quadric")
        if not np.isclose(self.embedding_dot(point, tangent), 0.0, atol=1e-8):
            raise ValueError("tangent is not tangent to the AdS2 quadric")
        return point, tangent

    @staticmethod
    def global_to_conformal(rho: Array | float) -> Array:
        """Return compact radial coordinate sigma with tan(sigma)=sinh(rho)."""

        return np.arctan(np.sinh(np.asarray(rho, dtype=float)))


@dataclass(frozen=True, slots=True)
class DeSitter2:
    """Two-dimensional de Sitter geometry with radius ``L``."""

    L: float = 1.0

    def __post_init__(self) -> None:
        object.__setattr__(self, "L", _positive_radius(self.L))

    @property
    def scalar_curvature(self) -> float:
        """Return R = +2/L^2 for dS2."""

        return 2.0 / self.L**2

    @staticmethod
    def embedding_dot(a: Array, b: Array) -> Array:
        """Ambient inner product with signature (-,+,+)."""

        a = np.asarray(a, dtype=float)
        b = np.asarray(b, dtype=float)
        return -a[..., 0] * b[..., 0] + a[..., 1] * b[..., 1] + a[..., 2] * b[..., 2]

    def global_to_embedding(self, tau: Array | float, theta: Array | float) -> Array:
        """Map global coordinates to the complete dS2 hyperboloid."""

        tau, theta = np.broadcast_arrays(np.asarray(tau, float), np.asarray(theta, float))
        scaled_time = tau / self.L
        return _stack(
            self.L * np.sinh(scaled_time),
            self.L * np.cosh(scaled_time) * np.cos(theta),
            self.L * np.cosh(scaled_time) * np.sin(theta),
        )

    def flat_to_embedding(self, t: Array | float, x: Array | float) -> Array:
        """Map the expanding flat patch with metric -dt^2+exp(2t/L)dx^2."""

        t, x = np.broadcast_arrays(np.asarray(t, float), np.asarray(x, float))
        scaled_time = t / self.L
        expansion = np.exp(scaled_time)
        correction = 0.5 * expansion * x**2 / self.L
        return _stack(
            self.L * np.sinh(scaled_time) + correction,
            self.L * np.cosh(scaled_time) - correction,
            expansion * x,
        )

    def static_to_embedding(self, time: Array | float, radius: Array | float) -> Array:
        """Map the static patch; requires ``abs(radius) < L``."""

        time, radius = np.broadcast_arrays(np.asarray(time, float), np.asarray(radius, float))
        if not np.all(np.isfinite(radius) & (np.abs(radius) < self.L)):
            raise ValueError("Static-patch radius must satisfy |r| < L")
        radial_factor = np.sqrt(self.L**2 - radius**2)
        return _stack(
            radial_factor * np.sinh(time / self.L),
            radial_factor * np.cosh(time / self.L),
            radius,
        )

    def global_frame(
        self, tau: float, theta: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        point = self.global_to_embedding(tau, theta)
        scaled_time = tau / self.L
        timelike = np.asarray(
            [
                np.cosh(scaled_time),
                np.sinh(scaled_time) * np.cos(theta),
                np.sinh(scaled_time) * np.sin(theta),
            ]
        )
        spacelike = np.asarray([0.0, -np.sin(theta), np.cos(theta)])
        return self._boosted_frame(point, timelike, spacelike, rapidity)

    def flat_frame(
        self, t: float, x: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        point = self.flat_to_embedding(t, x)
        scaled_time = t / self.L
        expansion = np.exp(scaled_time)
        timelike = np.asarray(
            [
                np.cosh(scaled_time) + 0.5 * expansion * x**2 / self.L**2,
                np.sinh(scaled_time) - 0.5 * expansion * x**2 / self.L**2,
                expansion * x / self.L,
            ]
        )
        spacelike = np.asarray([x / self.L, -x / self.L, 1.0])
        return self._boosted_frame(point, timelike, spacelike, rapidity)

    def static_frame(
        self, time: float, radius: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        point = self.static_to_embedding(time, radius)
        scaled_time = time / self.L
        lapse = np.sqrt(1.0 - (radius / self.L) ** 2)
        timelike = np.asarray([np.cosh(scaled_time), np.sinh(scaled_time), 0.0])
        spacelike = np.asarray(
            [
                -radius / self.L * np.sinh(scaled_time),
                -radius / self.L * np.cosh(scaled_time),
                lapse,
            ]
        )
        return self._boosted_frame(point, timelike, spacelike, rapidity)

    def frame(
        self, chart: str, q1: float, q2: float, rapidity: float = 0.0
    ) -> tuple[Array, Array, Array, Array, Array]:
        """Return a local frame for ``global``, ``flat``, or ``static`` coordinates."""

        methods = {
            "global": self.global_frame,
            "flat": self.flat_frame,
            "static": self.static_frame,
        }
        try:
            return methods[chart](q1, q2, rapidity)
        except KeyError as exc:
            raise ValueError(f"Unknown dS2 chart: {chart!r}") from exc

    def _boosted_frame(
        self, point: Array, timelike: Array, spacelike: Array, rapidity: float
    ) -> tuple[Array, Array, Array, Array, Array]:
        chi = float(rapidity)
        boosted_time = np.cosh(chi) * timelike + np.sinh(chi) * spacelike
        boosted_space = np.sinh(chi) * timelike + np.cosh(chi) * spacelike
        return (
            point,
            boosted_time,
            boosted_space,
            boosted_time + boosted_space,
            boosted_time - boosted_space,
        )

    def geodesic(self, point: Array, tangent: Array, affine_parameter: Array) -> Array:
        """Return the dS2 geodesic from normalized ambient initial data."""

        point, tangent = self._validate_initial_data(point, tangent)
        parameter = np.atleast_1d(np.asarray(affine_parameter, dtype=float))
        norm = float(self.embedding_dot(tangent, tangent))
        if np.isclose(norm, -1.0, atol=1e-8):
            return (
                np.cosh(parameter / self.L)[:, None] * point
                + self.L * np.sinh(parameter / self.L)[:, None] * tangent
            )
        if np.isclose(norm, 1.0, atol=1e-8):
            return (
                np.cos(parameter / self.L)[:, None] * point
                + self.L * np.sin(parameter / self.L)[:, None] * tangent
            )
        if np.isclose(norm, 0.0, atol=1e-8):
            return point + parameter[:, None] * tangent
        raise ValueError("The tangent must have ambient norm -1, 0, or +1")

    def _validate_initial_data(self, point: Array, tangent: Array) -> tuple[Array, Array]:
        point = np.asarray(point, dtype=float)
        tangent = np.asarray(tangent, dtype=float)
        if point.shape != (3,) or tangent.shape != (3,):
            raise ValueError("point and tangent must both have shape (3,)")
        if not np.isclose(self.embedding_dot(point, point), self.L**2, atol=1e-8):
            raise ValueError("point is not on the dS2 quadric")
        if not np.isclose(self.embedding_dot(point, tangent), 0.0, atol=1e-8):
            raise ValueError("tangent is not tangent to the dS2 quadric")
        return point, tangent

    def global_to_conformal(self, tau: Array | float) -> Array:
        """Return conformal time eta with tan(eta)=sinh(tau/L)."""

        return np.arctan(np.sinh(np.asarray(tau, dtype=float) / self.L))
