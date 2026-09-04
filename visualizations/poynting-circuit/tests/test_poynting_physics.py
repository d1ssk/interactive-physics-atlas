from __future__ import annotations

import cmath
import math

import pytest


def test_resistive_ac_power_and_phase(physics) -> None:
    response = physics.series_response(
        [physics.Component("r", 6)], frequency_hz=50, voltage_peak=12
    )
    assert response.current == pytest.approx(2 + 0j)
    assert response.average_power == pytest.approx(12)
    assert response.node_voltages[-1] == pytest.approx(0j)


def test_kirchhoff_voltage_law_for_reactive_series_loads(physics) -> None:
    response = physics.series_response(
        [physics.Component("r", 8), physics.Component("l", 80)],
        frequency_hz=60,
        voltage_peak=12,
    )
    assert sum(response.component_voltages) == pytest.approx(12 + 0j)
    assert response.node_voltages[-1] == pytest.approx(0j)
    assert response.current.imag < 0


def test_capacitive_current_leads_and_inductive_current_lags(physics) -> None:
    capacitive = physics.series_response(
        [physics.Component("r", 8), physics.Component("c", 220)], 60, 12
    )
    inductive = physics.series_response(
        [physics.Component("r", 8), physics.Component("l", 80)], 60, 12
    )
    assert cmath.phase(capacitive.current) > 0
    assert cmath.phase(inductive.current) < 0


def test_poynting_direction_between_circuit_rails(physics) -> None:
    assert physics.poynting_vector(0, -2, -3) == pytest.approx((6, 0))


def test_inward_flux_sign_for_radially_inward_field(physics) -> None:
    def inward(x: float, y: float) -> tuple[float, float]:
        return -x, -y

    flux = physics.rectangular_inward_flux(inward, (0, 0), 2, 1, samples=40)
    assert flux == pytest.approx(16)


def test_ideal_series_resonance_is_rejected(physics) -> None:
    frequency = 60
    inductance_mh = 80
    capacitance_uf = 1e9 / ((2 * math.pi * frequency) ** 2 * inductance_mh)
    with pytest.raises(ValueError, match="resonance"):
        physics.series_response(
            [
                physics.Component("l", inductance_mh),
                physics.Component("c", capacitance_uf),
            ],
            frequency,
            12,
        )
