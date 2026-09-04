"""Convex-analysis calculations for the one-dimensional Legendre transform."""

from collections.abc import Callable
from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


@dataclass(frozen=True, slots=True)
class ConvexFunction:
    """A convex function together with the endpoints of its subdifferential."""

    key: str
    name: str
    name_ja: str
    formula_latex: str
    x_min: float
    x_max: float
    value: Callable[[Array], Array]
    left_derivative: Callable[[Array], Array]
    right_derivative: Callable[[Array], Array]
    knots: tuple[float, ...] = ()


def _quadratic_derivative(x: Array) -> Array:
    return x


def _quartic_derivative(x: Array) -> Array:
    return x**3 + x


def _corner_left_derivative(x: Array) -> Array:
    return x + np.where(x <= 0.0, -1.0, 1.0)


def _corner_right_derivative(x: Array) -> Array:
    return x + np.where(x < 0.0, -1.0, 1.0)


def _linear_section_value(x: Array) -> Array:
    return 0.5 * x + 0.5 * np.maximum(np.abs(x) - 1.0, 0.0) ** 2


def _linear_section_derivative(x: Array) -> Array:
    return 0.5 + np.sign(x) * np.maximum(np.abs(x) - 1.0, 0.0)


FUNCTIONS = {
    "quadratic": ConvexFunction(
        key="quadratic",
        name="Quadratic",
        name_ja="二次関数",
        formula_latex=r"f(x)=\frac{1}{2}x^2",
        x_min=-6.0,
        x_max=6.0,
        value=lambda x: 0.5 * x**2,
        left_derivative=_quadratic_derivative,
        right_derivative=_quadratic_derivative,
    ),
    "quartic": ConvexFunction(
        key="quartic",
        name="Quartic",
        name_ja="四次関数",
        formula_latex=r"f(x)=\frac{1}{4}x^4+\frac{1}{2}x^2",
        x_min=-6.0,
        x_max=6.0,
        value=lambda x: 0.25 * x**4 + 0.5 * x**2,
        left_derivative=_quartic_derivative,
        right_derivative=_quartic_derivative,
    ),
    "exponential": ConvexFunction(
        key="exponential",
        name="Exponential",
        name_ja="指数関数",
        formula_latex=r"f(x)=e^x",
        x_min=-6.0,
        x_max=6.0,
        value=np.exp,
        left_derivative=np.exp,
        right_derivative=np.exp,
    ),
    "linear-section": ConvexFunction(
        key="linear-section",
        name="Function with a linear segment",
        name_ja="直線区間をもつ関数",
        formula_latex=r"f(x)=\frac{x}{2}+\frac{1}{2}\bigl(\max\{|x|-1,0\}\bigr)^2",
        x_min=-6.0,
        x_max=6.0,
        value=_linear_section_value,
        left_derivative=_linear_section_derivative,
        right_derivative=_linear_section_derivative,
        knots=(-1.0, 1.0),
    ),
    "corner": ConvexFunction(
        key="corner",
        name="Function with a corner",
        name_ja="微分不可能な点をもつ関数",
        formula_latex=r"f(x)=\frac{1}{2}x^2+|x|",
        x_min=-6.0,
        x_max=6.0,
        value=lambda x: 0.5 * x**2 + np.abs(x),
        left_derivative=_corner_left_derivative,
        right_derivative=_corner_right_derivative,
        knots=(0.0,),
    ),
}


def _sample_x(function: ConvexFunction, samples: int) -> Array:
    """Sample the display interval while retaining every nonsmooth knot."""

    regular = np.linspace(function.x_min, function.x_max, samples)
    return np.unique(np.concatenate((regular, np.asarray(function.knots, dtype=float))))


def sample_transform(
    function: ConvexFunction, samples: int = 481, corner_samples: int = 41
) -> dict[str, Array]:
    """Sample a function, its convex conjugate, and its biconjugate.

    Every pair ``(contact_x, p)`` lies on the subgradient graph ``p in partial f(x)``.
    Fenchel--Young equality then gives both conjugates without assuming differentiability.
    """

    if samples < 2:
        raise ValueError("samples must be at least 2")
    if corner_samples < 2:
        raise ValueError("corner_samples must be at least 2")

    x = _sample_x(function, samples)
    f = np.asarray(function.value(x), dtype=float)
    p_left = np.asarray(function.left_derivative(x), dtype=float)
    p_right = np.asarray(function.right_derivative(x), dtype=float)
    if np.any(p_left > p_right):
        raise ValueError("left derivative must not exceed right derivative")
    if np.any(np.diff(p_left) < -1e-12) or np.any(np.diff(p_right) < -1e-12):
        raise ValueError("subgradient endpoints must be nondecreasing")

    contact_x_parts: list[Array] = []
    p_parts: list[Array] = []
    for x0, left, right in zip(x, p_left, p_right, strict=True):
        count = corner_samples if right - left > 1e-12 else 1
        contact_x_parts.append(np.full(count, x0, dtype=float))
        p_parts.append(np.linspace(left, right, count))

    contact_x = np.concatenate(contact_x_parts)
    p = np.concatenate(p_parts)
    contact_f = np.asarray(function.value(contact_x), dtype=float)
    f_star = p * contact_x - contact_f

    double_x, first_indices = np.unique(contact_x, return_index=True)
    f_double = (contact_x * p - f_star)[first_indices]

    return {
        "x": x,
        "f": f,
        "contact_x": contact_x,
        "p": p,
        "f_star": f_star,
        "double_x": double_x,
        "f_double": f_double,
    }


def supporting_line(
    function: ConvexFunction, x0: float, x: Array, slope: float | None = None
) -> Array:
    """Evaluate a supporting line to ``function`` at ``x0``."""

    x0_array = np.asarray([x0], dtype=float)
    f0 = float(function.value(x0_array)[0])
    left = float(function.left_derivative(x0_array)[0])
    right = float(function.right_derivative(x0_array)[0])
    if slope is None:
        slope = 0.5 * (left + right)
    if not left - 1e-12 <= slope <= right + 1e-12:
        raise ValueError("slope must belong to the subdifferential at x0")
    return f0 + slope * (x - x0)
