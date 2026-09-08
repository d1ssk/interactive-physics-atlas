"""Reference thermodynamics for the one-component browser application.

All state variables use SI molar units.  The browser runtime contains an
equivalent DOM-independent implementation in ``static/physics.mjs``.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import log, pi

R = 8.31446261815324
T_TRIPLE = 273.16
P_TRIPLE = 611.657
AVOGADRO = 6.02214076e23
PLANCK = 6.62607015e-34
ARGON_MOLAR_MASS = 39.948e-3

HEAT_CAPACITIES = (37.0, 75.3, 34.0)
REFERENCE_VOLUMES = (19.65e-6, 18.02e-6)
COMPRESSIBILITIES = (1.2e-10, 4.5e-10)


def sackur_tetrode_entropy(internal_energy: float, volume: float) -> float:
    """Return the molar Sackur--Tetrode entropy of argon in J/(mol K)."""

    particle_mass = ARGON_MOLAR_MASS / AVOGADRO
    particle_energy = internal_energy / AVOGADRO
    particle_volume = volume / AVOGADRO
    argument = (
        particle_volume * (4.0 * pi * particle_mass * particle_energy / (3.0 * PLANCK**2)) ** 1.5
    )
    return R * (log(argument) + 2.5)


S_ICE_REFERENCE = 69.95 - HEAT_CAPACITIES[1] * log(298.15 / T_TRIPLE) - 6010.0 / T_TRIPLE
REFERENCE_ENTROPIES = (
    S_ICE_REFERENCE,
    S_ICE_REFERENCE + 6010.0 / T_TRIPLE,
    S_ICE_REFERENCE + 51010.0 / T_TRIPLE,
)


@dataclass(frozen=True, slots=True)
class State:
    """A one-mole equilibrium state in SI molar units."""

    temperature: float
    pressure: float
    volume: float
    entropy: float
    internal_energy: float
    helmholtz_energy: float
    enthalpy: float
    gibbs_energy: float


def _state(
    temperature: float,
    pressure: float,
    volume: float,
    entropy: float,
    enthalpy: float,
) -> State:
    internal_energy = enthalpy - pressure * volume
    return State(
        temperature=temperature,
        pressure=pressure,
        volume=volume,
        entropy=entropy,
        internal_energy=internal_energy,
        helmholtz_energy=internal_energy - temperature * entropy,
        enthalpy=enthalpy,
        gibbs_energy=enthalpy - temperature * entropy,
    )


def ideal_argon_state(temperature: float, pressure: float) -> State:
    """Return the monatomic ideal-gas state used by the application."""

    heat_capacity_v = 1.5 * R
    volume = R * temperature / pressure
    entropy = sackur_tetrode_entropy(heat_capacity_v * temperature, volume)
    return _state(
        temperature,
        pressure,
        volume,
        entropy,
        (heat_capacity_v + R) * temperature,
    )


def water_phase_state(temperature: float, pressure: float, phase_index: int) -> State:
    """Return one educational water phase: solid, liquid, or vapor."""

    if phase_index not in (0, 1, 2):
        raise ValueError("phase_index must be 0 (solid), 1 (liquid), or 2 (vapor)")
    heat_capacity = HEAT_CAPACITIES[phase_index]
    reference_entropy = REFERENCE_ENTROPIES[phase_index]
    gibbs = heat_capacity * (
        temperature - T_TRIPLE - temperature * log(temperature / T_TRIPLE)
    ) - reference_entropy * (temperature - T_TRIPLE)
    entropy = reference_entropy + heat_capacity * log(temperature / T_TRIPLE)
    if phase_index == 2:
        gibbs += R * temperature * log(pressure / P_TRIPLE)
        entropy -= R * log(pressure / P_TRIPLE)
        volume = R * temperature / pressure
    else:
        pressure_delta = pressure - P_TRIPLE
        reference_volume = REFERENCE_VOLUMES[phase_index]
        compressibility = COMPRESSIBILITIES[phase_index]
        volume = reference_volume * (1.0 - compressibility * pressure_delta)
        gibbs += reference_volume * (pressure_delta - 0.5 * compressibility * pressure_delta**2)
    return _state(
        temperature,
        pressure,
        volume,
        entropy,
        gibbs + temperature * entropy,
    )


def stable_water_state(temperature: float, pressure: float) -> State:
    """Return the stable phase on the lower Gibbs-energy envelope."""

    phases = [water_phase_state(temperature, pressure, index) for index in range(3)]
    return min(phases, key=lambda phase: phase.gibbs_energy)


def clapeyron_slope(first: State, second: State) -> float:
    """Return dP/dT = Δs/Δv for two coexisting phase endpoints."""

    return (second.entropy - first.entropy) / (second.volume - first.volume)
