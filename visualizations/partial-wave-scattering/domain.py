"""Compact, Plotly-independent browser-transfer data for partial-wave scattering."""

from __future__ import annotations

from collections.abc import Mapping

import numpy as np

from .physics import (
    PotentialParameters,
    asymptotic_fields,
    central_potential,
    phase_shifts,
    plane_wave_component,
    plane_wave_partial_sum,
    radial_solution,
    scattered_partial_field,
    total_cross_section,
    unwrap_modulo_pi,
)
from .protocol import (
    KERNEL_VERSION,
    PLANE_RESULT_SCHEMA,
    SCATTER_RESULT_SCHEMA,
)

DISPLAY_DECIMALS = 6


def _values(array: np.ndarray, decimals: int = DISPLAY_DECIMALS) -> list[object]:
    rounded = np.round(np.asarray(array, dtype=float), decimals)
    rounded[np.abs(rounded) < 10 ** (-decimals)] = 0.0
    return [None if not np.isfinite(value) else float(value) for value in rounded.ravel()]


def _matrix(array: np.ndarray, decimals: int = DISPLAY_DECIMALS) -> list[list[object]]:
    shape = np.asarray(array).shape
    if len(shape) != 2:
        raise ValueError("matrix data must be two-dimensional")
    flat = _values(array, decimals)
    return [flat[index : index + shape[1]] for index in range(0, len(flat), shape[1])]


def plane_wave_domain(maximum_ell: int) -> dict[str, object]:
    """Calculate one plane-wave partial sum without precomputed Plotly frames."""

    wave_number = 2 * np.pi
    axis_3d = np.linspace(-1.45, 1.45, 19)
    x_3d, y_3d, z_3d = np.meshgrid(axis_3d, axis_3d, axis_3d, indexing="ij")
    cumulative_3d = plane_wave_partial_sum(maximum_ell, x_3d, y_3d, z_3d, wave_number)
    snapshot_3d = np.real(np.exp(-1j * np.pi / 4) * cumulative_3d)

    axis_2d = np.linspace(-1.6, 1.6, 73)
    x_2d, z_2d = np.meshgrid(axis_2d, axis_2d, indexing="xy")
    zeros = np.zeros_like(x_2d)
    current = plane_wave_partial_sum(maximum_ell, x_2d, zeros, z_2d, wave_number)
    next_ell = min(maximum_ell + 1, 12)
    next_component = (
        plane_wave_component(next_ell, x_2d, zeros, z_2d, wave_number)
        if maximum_ell < 12
        else np.zeros_like(current)
    )
    after = current + next_component
    rotation = np.exp(-1j * np.pi / 4)
    result = {
        "schema": PLANE_RESULT_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "maximumEll": maximum_ell,
        "nextEll": next_ell,
        "axis3d": _values(axis_3d),
        "field3d": _values(snapshot_3d),
        "axis2d": _values(axis_2d),
        "current": _matrix(np.real(rotation * current)),
        "next": _matrix(np.real(rotation * next_component)),
        "after": _matrix(np.real(rotation * after)),
    }
    validate_plane_wave_domain(result)
    return result


def _field_snapshot(field: np.ndarray) -> np.ndarray:
    return np.real(field)


def scattering_domain(
    parameters: PotentialParameters,
    energy: float,
    maximum_ell: int,
    field_mode: str,
    resonance_ell: int,
) -> dict[str, object]:
    """Calculate the complete interactive scattering-panel state in Python."""

    wave_number = float(np.sqrt(energy))
    phases = phase_shifts(10, energy, parameters, step=0.008)

    potential_radii = np.linspace(0.0, 4.5, 181)
    potential = central_potential(potential_radii, parameters)

    extent = 7.0
    field_axis = np.linspace(-extent, extent, 83)
    x_field, z_field = np.meshgrid(field_axis, field_axis, indexing="xy")
    exclusion_radius = max(1.15, 1.9 * parameters.range)
    total_current, scattered_current = asymptotic_fields(
        x_field,
        z_field,
        wave_number,
        phases,
        maximum_ell,
        exclusion_radius,
    )
    next_ell = min(maximum_ell + 1, 10)
    next_field = (
        scattered_partial_field(
            x_field,
            z_field,
            wave_number,
            phases[next_ell],
            next_ell,
        )
        if maximum_ell < 10
        else np.zeros_like(total_current)
    )
    next_field = np.where(np.hypot(x_field, z_field) < exclusion_radius, np.nan, next_field)
    total_after, scattered_after = asymptotic_fields(
        x_field,
        z_field,
        wave_number,
        phases,
        next_ell,
        exclusion_radius,
    )
    if field_mode == "total":
        current_field, after_field = total_current, total_after
    else:
        current_field, after_field = scattered_current, scattered_after

    energies = np.linspace(0.5, 16.0, 43)
    phase_scan = unwrap_modulo_pi(
        np.asarray(
            [
                radial_solution(resonance_ell, float(energy), parameters, step=0.014)[2]
                for energy in energies
            ]
        )
    )
    radii, radial, current_phase = radial_solution(
        resonance_ell,
        energy,
        parameters,
        step=0.008,
    )
    free_radii, free_radial, _ = radial_solution(
        resonance_ell,
        energy,
        PotentialParameters(0.0, parameters.range, 0.0),
        step=0.008,
    )
    radial_limit = min(5.5, float(radii[-1]) * 0.72)
    selected = np.flatnonzero(radii <= radial_limit)
    stride = max(1, int(np.ceil(len(selected) / 320)))
    selected = selected[::stride]
    free_selected = np.searchsorted(free_radii, radii[selected])
    inside = radii <= 2 * parameters.range
    free_inside = free_radii <= 2 * parameters.range
    interacting_norm = float(np.trapezoid(radial[inside] ** 2, radii[inside]))
    free_norm = float(np.trapezoid(free_radial[free_inside] ** 2, free_radii[free_inside]))
    enhancement = interacting_norm / free_norm if free_norm > 1e-14 else 1.0

    result = {
        "schema": SCATTER_RESULT_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "parameters": {
            "strength": parameters.strength,
            "range": parameters.range,
            "core": parameters.core,
            "energy": energy,
        },
        "maximumEll": maximum_ell,
        "nextEll": next_ell,
        "fieldMode": field_mode,
        "resonanceEll": resonance_ell,
        "potential": {
            "radius": _values(potential_radii),
            "value": _values(potential),
        },
        "phases": _values(phases),
        "phaseStrengths": _values(np.sin(phases) ** 2),
        "crossSection": round(total_cross_section(wave_number, phases), DISPLAY_DECIMALS),
        "field": {
            "axis": _values(field_axis),
            "extent": extent,
            "maskRadius": exclusion_radius,
            "current": _matrix(_field_snapshot(current_field)),
            "next": _matrix(_field_snapshot(next_field)),
            "after": _matrix(_field_snapshot(after_field)),
        },
        "resonance": {
            "energy": _values(energies),
            "phase": _values(phase_scan),
            "strength": _values(np.sin(phase_scan) ** 2),
            "currentPhase": round(current_phase, DISPLAY_DECIMALS),
            "enhancement": round(enhancement, DISPLAY_DECIMALS),
            "radius": _values(radii[selected]),
            "radial": _values(radial[selected]),
            "freeRadial": _values(free_radial[free_selected]),
        },
    }
    validate_scattering_domain(result)
    return result


def validate_plane_wave_domain(result: Mapping[str, object]) -> None:
    if result.get("schema") != PLANE_RESULT_SCHEMA or result.get("kernelVersion") != KERNEL_VERSION:
        raise ArithmeticError("unexpected plane-wave result schema")
    axis_3d = result.get("axis3d")
    axis_2d = result.get("axis2d")
    field_3d = result.get("field3d")
    if not all(isinstance(value, list) for value in (axis_3d, axis_2d, field_3d)):
        raise ArithmeticError("plane-wave arrays are missing")
    if len(field_3d) != len(axis_3d) ** 3:
        raise ArithmeticError("plane-wave 3-D grid is inconsistent")
    for name in ("current", "next", "after"):
        matrix = result.get(name)
        if not isinstance(matrix, list) or len(matrix) != len(axis_2d):
            raise ArithmeticError("plane-wave 2-D grid is inconsistent")
        if any(not isinstance(row, list) or len(row) != len(axis_2d) for row in matrix):
            raise ArithmeticError("plane-wave row is inconsistent")


def validate_scattering_domain(result: Mapping[str, object]) -> None:
    if (
        result.get("schema") != SCATTER_RESULT_SCHEMA
        or result.get("kernelVersion") != KERNEL_VERSION
    ):
        raise ArithmeticError("unexpected scattering result schema")
    phases = result.get("phases")
    strengths = result.get("phaseStrengths")
    field = result.get("field")
    resonance = result.get("resonance")
    if not isinstance(phases, list) or len(phases) != 11 or not isinstance(strengths, list):
        raise ArithmeticError("phase-shift arrays are inconsistent")
    if not isinstance(field, Mapping) or not isinstance(resonance, Mapping):
        raise ArithmeticError("scattering result sections are missing")
    axis = field.get("axis")
    if not isinstance(axis, list):
        raise ArithmeticError("scattering field axis is missing")
    for name in ("current", "next", "after"):
        matrix = field.get(name)
        if not isinstance(matrix, list) or len(matrix) != len(axis):
            raise ArithmeticError("scattering field is inconsistent")
        if any(not isinstance(row, list) or len(row) != len(axis) for row in matrix):
            raise ArithmeticError("scattering field row is inconsistent")
    energies = resonance.get("energy")
    scan = resonance.get("phase")
    if not isinstance(energies, list) or not isinstance(scan, list) or len(energies) != len(scan):
        raise ArithmeticError("resonance scan is inconsistent")
