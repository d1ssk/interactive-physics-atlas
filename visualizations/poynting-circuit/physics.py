"""Reference physics for the quasistatic Poynting-vector circuit model."""

from __future__ import annotations

import cmath
import math
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass

VACUUM_PERMITTIVITY = 8.854_187_812_8e-12
VACUUM_PERMEABILITY = 1.256_637_062_12e-6


@dataclass(frozen=True, slots=True)
class Component:
    """An ideal series element, using ohms, millihenries, or microfarads."""

    kind: str
    value: float

    def impedance(self, frequency_hz: float, *, dc: bool = False) -> complex:
        """Return the element impedance under the application's idealized convention."""

        if not math.isfinite(self.value) or self.value <= 0:
            raise ValueError("component value must be finite and positive")
        if dc:
            if self.kind != "r":
                raise ValueError("the published DC mode supports resistors only")
            return complex(self.value)
        if not math.isfinite(frequency_hz) or frequency_hz <= 0:
            raise ValueError("frequency must be finite and positive")
        omega = 2 * math.pi * frequency_hz
        if self.kind == "r":
            return complex(self.value)
        if self.kind == "l":
            return 1j * omega * self.value * 1e-3
        if self.kind == "c":
            return 1 / (1j * omega * self.value * 1e-6)
        raise ValueError(f"unsupported component kind: {self.kind}")


@dataclass(frozen=True, slots=True)
class SeriesResponse:
    """Complex-amplitude response of ideal elements connected in series."""

    impedance: complex
    current: complex
    component_voltages: tuple[complex, ...]
    node_voltages: tuple[complex, ...]
    average_power: float


def series_response(
    components: Sequence[Component],
    frequency_hz: float,
    voltage_peak: float,
    *,
    dc: bool = False,
) -> SeriesResponse:
    """Solve the ideal series circuit using peak phasors (or DC values)."""

    if not components:
        raise ValueError("at least one component is required")
    if not math.isfinite(voltage_peak):
        raise ValueError("voltage must be finite")
    impedances = tuple(item.impedance(frequency_hz, dc=dc) for item in components)
    total = sum(impedances, start=0j)
    reactive_scale = sum(abs(impedance.imag) for impedance in impedances)
    undamped_resonance = total.real == 0.0 and math.isclose(
        total.imag,
        0.0,
        abs_tol=1e-12 * reactive_scale,
    )
    if undamped_resonance:
        raise ValueError("ideal undamped series resonance has undefined current")
    source = complex(voltage_peak)
    current = source / total
    component_voltages = tuple(current * impedance for impedance in impedances)
    nodes = [source]
    for voltage in component_voltages:
        nodes.append(nodes[-1] - voltage)
    rms_factor = 1.0 if dc else 0.5
    average_power = rms_factor * abs(current) ** 2 * total.real
    return SeriesResponse(
        impedance=total,
        current=current,
        component_voltages=component_voltages,
        node_voltages=tuple(nodes),
        average_power=average_power,
    )


def real_at_phase(value: complex, phase_radians: float) -> float:
    """Return ``Re(value exp(i phase))``."""

    return float((value * cmath.exp(1j * phase_radians)).real)


def poynting_vector(
    electric_x: float, electric_y: float, magnetic_h_z: float
) -> tuple[float, float]:
    """Return the in-plane components of ``E cross H`` for out-of-plane ``H``."""

    return electric_y * magnetic_h_z, -electric_x * magnetic_h_z


def instantaneous_poynting_vector(
    electric_x: complex,
    electric_y: complex,
    magnetic_h_per_amp: float,
    current: complex,
    phase_radians: float,
) -> tuple[float, float]:
    """Reconstruct real fields at one phase before forming their cross product."""

    magnetic_h = magnetic_h_per_amp * real_at_phase(current, phase_radians)
    return poynting_vector(
        real_at_phase(electric_x, phase_radians),
        real_at_phase(electric_y, phase_radians),
        magnetic_h,
    )


def magnetic_field_z(
    x: float,
    y: float,
    segments: Iterable[tuple[tuple[float, float], tuple[float, float]]],
    *,
    current: float = 1.0,
    softening: float = 0.018,
) -> float:
    """Evaluate the softened thin-wire Biot–Savart sum in normalized coordinates."""

    field = 0.0
    for start, end in segments:
        delta_x = end[0] - start[0]
        delta_y = end[1] - start[1]
        offset_x = x - 0.5 * (start[0] + end[0])
        offset_y = y - 0.5 * (start[1] + end[1])
        radius_squared = offset_x**2 + offset_y**2 + softening**2
        field += (delta_x * offset_y - delta_y * offset_x) / (4 * math.pi * radius_squared**1.5)
    return current * field


def rectangular_inward_flux(
    sample_poynting: Callable[[float, float], tuple[float, float]],
    center: tuple[float, float],
    half_width: float,
    half_height: float,
    *,
    samples: int = 24,
) -> float:
    """Integrate inward two-dimensional flux around a rectangular contour."""

    if samples < 1 or half_width <= 0 or half_height <= 0:
        raise ValueError("the contour and sampling count must be positive")
    outward_flux = 0.0
    for index in range(samples):
        fraction = (index + 0.5) / samples
        x = center[0] - half_width + 2 * half_width * fraction
        y = center[1] - half_height + 2 * half_height * fraction
        points = (
            (center[0] - half_width, y, -1, 0, 2 * half_height / samples),
            (center[0] + half_width, y, 1, 0, 2 * half_height / samples),
            (x, center[1] - half_height, 0, -1, 2 * half_width / samples),
            (x, center[1] + half_height, 0, 1, 2 * half_width / samples),
        )
        for sample_x, sample_y, normal_x, normal_y, length in points:
            vector_x, vector_y = sample_poynting(sample_x, sample_y)
            outward_flux += (vector_x * normal_x + vector_y * normal_y) * length
    return -outward_flux
