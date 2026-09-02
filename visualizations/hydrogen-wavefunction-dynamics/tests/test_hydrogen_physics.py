from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest


def _integrate_angular(physics, ell: int, m: int, basis: str) -> float:
    theta_steps = 180
    phi_steps = 270
    total = 0.0
    for theta_index in range(theta_steps):
        theta = math.pi * (theta_index + 0.5) / theta_steps
        for phi_index in range(phi_steps):
            phi = 2 * math.pi * (phi_index + 0.5) / phi_steps
            if basis == "real":
                value = physics.real_spherical_harmonic(ell, m, theta, phi)
            else:
                value = physics.complex_spherical_harmonic(ell, m, theta, phi)
            total += abs(value) ** 2 * math.sin(theta)
    return total * math.pi / theta_steps * 2 * math.pi / phi_steps


def _integrate_radial(physics, components, time_au: float, maximum: float = 100) -> float:
    radii = np.linspace(0, maximum, 30001)
    values = [physics.radial_probability(components, float(radius), time_au) for radius in radii]
    return float(np.trapezoid(values, radii))


def test_known_radial_values_and_energy_spectrum(physics) -> None:
    assert physics.radial_wavefunction(1, 0, 0) == pytest.approx(2)
    assert physics.radial_wavefunction(2, 0, 2) == pytest.approx(0, abs=1e-14)
    assert physics.energy_hartree(2) == -1 / 8
    assert physics.energy_ev(2) == pytest.approx(-13.605693122994 / 4)
    assert pytest.approx(27.211386245988) == physics.HARTREE_ENERGY_EV


def test_real_and_complex_angular_bases_are_normalized(physics) -> None:
    assert _integrate_angular(physics, 3, -2, "real") == pytest.approx(1, abs=6e-4)
    assert _integrate_angular(physics, 3, 2, "complex") == pytest.approx(1, abs=6e-4)


def test_radial_probability_is_normalized_for_stationary_and_beating_states(physics) -> None:
    stationary = physics.normalize_components(
        [
            {"n": 2, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
            {"n": 2, "l": 1, "m": 0, "basis": "real", "amplitude": 1},
        ]
    )
    beating = physics.normalize_components(
        [
            {"n": 1, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
            {"n": 2, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
        ]
    )
    assert _integrate_radial(physics, stationary, 8.3) == pytest.approx(1, abs=2e-9)
    assert _integrate_radial(physics, beating, 0) == pytest.approx(1, abs=2e-9)
    assert _integrate_radial(physics, beating, 7.1) == pytest.approx(1, abs=2e-9)


def test_degenerate_hybrid_density_is_stationary(physics) -> None:
    hybrid = physics.normalize_components(
        [
            {"n": 2, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
            {"n": 2, "l": 1, "m": 0, "basis": "real", "amplitude": 1},
        ]
    )
    initial = physics.superposition_wavefunction(hybrid, 3.1, 0.7, 1.2, 0)
    evolved = physics.superposition_wavefunction(hybrid, 3.1, 0.7, 1.2, 9.4)
    assert abs(evolved) ** 2 == pytest.approx(abs(initial) ** 2, abs=1e-15)
    assert physics.energy_uncertainty_hartree(hybrid) == 0
    assert physics.shortest_beat_period_au(hybrid) == math.inf


def test_one_s_two_s_density_repeats_at_the_beat_period(physics) -> None:
    components = physics.normalize_components(
        [
            {"n": 1, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
            {"n": 2, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
        ]
    )
    period = 16 * math.pi / 3
    assert physics.shortest_beat_period_au(components) == pytest.approx(period)
    initial = physics.superposition_wavefunction(components, 1.4, 0.8, 0.3, 0)
    repeated = physics.superposition_wavefunction(components, 1.4, 0.8, 0.3, period)
    assert abs(repeated) ** 2 == pytest.approx(abs(initial) ** 2, abs=1e-15)
    assert physics.energy_uncertainty_hartree(components) > 0


def test_browser_domain_matches_python_reference_vectors(physics) -> None:
    node = shutil.which("node")
    if node is None:
        pytest.skip("Node.js is unavailable")
    probe = Path(__file__).with_name("domain-probe-v1.mjs")
    result = subprocess.run([node, str(probe)], check=True, capture_output=True, text=True)
    browser = json.loads(result.stdout)

    harmonic = physics.complex_spherical_harmonic(3, -2, 0.7, 1.1)
    wavefunction = physics.wavefunction_spherical(4, 2, -1, 5.2, 0.9, 2.4, "real")
    components = physics.normalize_components(
        [
            {"n": 1, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
            {"n": 2, "l": 0, "m": 0, "basis": "real", "amplitude": 1},
        ]
    )
    superposition = physics.superposition_wavefunction(components, 1.4, 0.8, 0.3, 5.7)
    assert browser["radial3d"] == pytest.approx(
        physics.radial_wavefunction(3, 2, 4.2), rel=2e-13, abs=2e-15
    )
    assert browser["harmonic"] == pytest.approx(
        [harmonic.real, harmonic.imag], rel=2e-13, abs=2e-15
    )
    assert browser["wavefunction"] == pytest.approx(
        [wavefunction.real, wavefunction.imag], rel=2e-13, abs=2e-15
    )
    assert browser["superposition"] == pytest.approx(
        [superposition.real, superposition.imag], rel=2e-13, abs=2e-15
    )
    assert browser["radialProbability"] == pytest.approx(
        physics.radial_probability(components, 2.3, 5.7), rel=2e-13, abs=2e-15
    )
