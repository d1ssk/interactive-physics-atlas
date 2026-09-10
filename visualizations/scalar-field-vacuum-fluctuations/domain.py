"""Compact, Plotly-independent transfer data for scalar-vacuum samples."""

from __future__ import annotations

import numpy as np

from .physics import (
    configuration_at,
    coordinate_axis,
    expected_field_variance,
    sample_vacuum,
    theoretical_axis_correlation,
)
from .protocol import (
    BOX_LENGTH,
    GRID_SIZE,
    KERNEL_VERSION,
    SAMPLE_RESULT_SCHEMA,
    TIME_HALF_WIDTH,
    TIME_SLICES,
)

DISPLAY_DECIMALS = 6
SPATIAL_SEED_OFFSET = 1_000_003


def _values(array: np.ndarray) -> list[float]:
    rounded = np.round(np.asarray(array, dtype=float), DISPLAY_DECIMALS)
    rounded[np.abs(rounded) < 10 ** (-DISPLAY_DECIMALS)] = 0.0
    if not np.all(np.isfinite(rounded)):
        raise ArithmeticError("domain arrays must be finite")
    return [float(value) for value in rounded.ravel()]


def _sample_summary(state, field: np.ndarray) -> dict[str, float]:
    return {
        "sigma": round(float(np.sqrt(expected_field_variance(state))), DISPLAY_DECIMALS),
        "sampleRms": round(float(np.sqrt(np.mean(field**2))), DISPLAY_DECIMALS),
        "spacing": round(float(state.spacing), DISPLAY_DECIMALS),
        "cutoff": round(float(state.cutoff), DISPLAY_DECIMALS),
    }


def vacuum_sample_domain(mass: float, cutoff_fraction: float, seed: int) -> dict[str, object]:
    """Return one 2+1D history and one independent 3D equal-time draw.

    The two results use the same physical parameters but are draws from
    different-dimensional Gaussian measures.  The 3D seed is deterministically
    offset so the two pictures are reproducible without implying that one is a
    slice of the other.
    """

    spacetime_state = sample_vacuum(
        n=GRID_SIZE,
        dimension=2,
        length=BOX_LENGTH,
        mass=mass,
        cutoff_fraction=cutoff_fraction,
        seed=seed,
    )
    spatial_state = sample_vacuum(
        n=GRID_SIZE,
        dimension=3,
        length=BOX_LENGTH,
        mass=mass,
        cutoff_fraction=cutoff_fraction,
        seed=(seed + SPATIAL_SEED_OFFSET) % (2**32),
    )
    times = np.linspace(-TIME_HALF_WIDTH, TIME_HALF_WIDTH, TIME_SLICES)
    spacetime_field = np.stack(
        [configuration_at(spacetime_state, float(time))[0] for time in times]
    )
    spatial_field = configuration_at(spatial_state)[0]
    spacetime_center = spacetime_field[TIME_SLICES // 2]
    correlation_lags = np.arange(GRID_SIZE // 2 + 1) * spacetime_state.spacing

    result: dict[str, object] = {
        "schema": SAMPLE_RESULT_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "parameters": {
            "mass": round(float(mass), DISPLAY_DECIMALS),
            "cutoffFraction": round(float(cutoff_fraction), DISPLAY_DECIMALS),
            "seed": int(seed),
            "gridSize": GRID_SIZE,
            "boxLength": BOX_LENGTH,
            "timeSlices": TIME_SLICES,
        },
        "axis": _values(coordinate_axis(spacetime_state)),
        "times": _values(times),
        "spacetime": {
            "shape": [TIME_SLICES, GRID_SIZE, GRID_SIZE],
            "field": _values(spacetime_field),
            **_sample_summary(spacetime_state, spacetime_center),
        },
        "space3d": {
            "shape": [GRID_SIZE, GRID_SIZE, GRID_SIZE],
            "field": _values(spatial_field),
            **_sample_summary(spatial_state, spatial_field),
        },
        "correlation": {
            "distance": _values(correlation_lags),
            "dimension2": _values(theoretical_axis_correlation(spacetime_state)),
            "dimension3": _values(theoretical_axis_correlation(spatial_state)),
        },
    }
    validate_vacuum_domain(result)
    return result


def validate_vacuum_domain(result: object) -> None:
    """Validate the versioned DTO before serialization."""

    if not isinstance(result, dict) or result.get("schema") != SAMPLE_RESULT_SCHEMA:
        raise ArithmeticError("unexpected scalar-vacuum result schema")
    if result.get("kernelVersion") != KERNEL_VERSION:
        raise ArithmeticError("unexpected scalar-vacuum kernel version")
    axis = result.get("axis")
    times = result.get("times")
    spacetime = result.get("spacetime")
    spatial = result.get("space3d")
    correlation = result.get("correlation")
    if not isinstance(axis, list) or len(axis) != GRID_SIZE:
        raise ArithmeticError("invalid spatial axis")
    if not isinstance(times, list) or len(times) != TIME_SLICES:
        raise ArithmeticError("invalid time axis")
    if not isinstance(spacetime, dict) or spacetime.get("shape") != [
        TIME_SLICES,
        GRID_SIZE,
        GRID_SIZE,
    ]:
        raise ArithmeticError("invalid spacetime shape")
    if len(spacetime.get("field", [])) != TIME_SLICES * GRID_SIZE**2:
        raise ArithmeticError("invalid spacetime field")
    if not isinstance(spatial, dict) or spatial.get("shape") != [
        GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE,
    ]:
        raise ArithmeticError("invalid spatial shape")
    if len(spatial.get("field", [])) != GRID_SIZE**3:
        raise ArithmeticError("invalid spatial field")
    if not isinstance(correlation, dict):
        raise ArithmeticError("invalid correlation data")
    expected_length = GRID_SIZE // 2 + 1
    for key in ("distance", "dimension2", "dimension3"):
        values = correlation.get(key)
        if not isinstance(values, list) or len(values) != expected_length:
            raise ArithmeticError("invalid correlation curve")
    if correlation["dimension2"][0] != 1.0 or correlation["dimension3"][0] != 1.0:
        raise ArithmeticError("correlations must be normalized at zero separation")
    for summary in (spacetime, spatial):
        if summary.get("sigma", 0.0) <= 0.0 or summary.get("sampleRms", 0.0) <= 0.0:
            raise ArithmeticError("field scales must be positive")
