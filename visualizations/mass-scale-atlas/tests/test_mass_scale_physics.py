from __future__ import annotations

import math

import pytest
from conftest import physics


def test_natural_length_and_time_are_related_by_speed_of_light() -> None:
    for energy_ev in (1e-33, 1.0, 1e9, 1.220890e28):
        ratio = physics.reduced_length_meters(energy_ev) / physics.quantum_time_seconds(energy_ev)
        assert ratio == pytest.approx(physics.SPEED_OF_LIGHT_M_PER_S)


def test_temperature_conversion_recovers_cmb_temperature() -> None:
    assert physics.temperature_kelvin(2.34865e-4) == pytest.approx(2.7255, abs=0.001)


def test_hubble_and_vacuum_energy_scales_are_distinct() -> None:
    hubble = physics.hubble_energy_ev(67.4)
    vacuum = physics.vacuum_energy_scale_ev(67.4, 0.685)
    assert hubble == pytest.approx(1.438e-33, rel=0.002)
    assert vacuum == pytest.approx(2.24e-3, rel=0.01)
    assert 29 < math.log10(vacuum / hubble) < 31


def test_radiation_era_estimate_and_domain() -> None:
    assert physics.radiation_era_age_seconds(1e6) == pytest.approx(0.738, abs=0.01)
    assert physics.radiation_era_age_seconds(1e5) is None
    assert physics.radiation_era_age_seconds(1e26) is not None
    assert physics.radiation_era_age_seconds(1e27) is None


@pytest.mark.parametrize("energy_ev", [0.0, -1.0])
def test_natural_scales_require_positive_energy(energy_ev: float) -> None:
    with pytest.raises(ValueError):
        physics.log_energy(energy_ev)
    with pytest.raises(ValueError):
        physics.reduced_length_meters(energy_ev)
    with pytest.raises(ValueError):
        physics.quantum_time_seconds(energy_ev)
