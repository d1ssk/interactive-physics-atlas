"""Reference mathematics for analytic continuation and contour integration.

The browser runtime keeps an equivalent DOM-independent implementation in
``static/physics.mjs``.  This Python module states the numerical conventions
and provides independently testable reference calculations.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence

import numpy as np

ComplexFunction = Callable[[complex], complex]


def continued_arguments(values: Sequence[complex], branch_index: int = 0) -> np.ndarray:
    """Unwrap arguments continuously from the selected initial branch.

    Consecutive samples are joined by the argument change in ``(-pi, pi]``.
    This is the same local continuation convention used while a path is drawn
    in the browser.
    """

    array = np.asarray(values, dtype=complex)
    if array.ndim != 1 or array.size == 0:
        raise ValueError("values must be a nonempty one-dimensional sequence")
    return np.unwrap(np.angle(array)) + branch_index * 2.0 * np.pi


def continued_square_root(values: Sequence[complex], branch_index: int = 0) -> np.ndarray:
    """Evaluate the square root continued along a sampled path."""

    array = np.asarray(values, dtype=complex)
    arguments = continued_arguments(array, branch_index)
    return np.sqrt(np.abs(array)) * np.exp(0.5j * arguments)


def contour_integral(points: Sequence[complex], function: ComplexFunction) -> complex:
    """Integrate along a sampled polyline with the complex trapezoidal rule."""

    path = np.asarray(points, dtype=complex)
    if path.ndim != 1 or path.size < 2:
        raise ValueError("points must contain at least two path samples")
    values = np.asarray([function(complex(point)) for point in path], dtype=complex)
    return complex(np.sum(0.5 * (values[:-1] + values[1:]) * np.diff(path)))
