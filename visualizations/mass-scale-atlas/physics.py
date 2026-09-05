"""Physical conversions used by the Energy Scale Atlas."""

from __future__ import annotations

import math

K_B_EV_PER_K = 8.617333262e-5
HBAR_EV_S = 6.582119569e-16
SPEED_OF_LIGHT_M_PER_S = 299_792_458.0
HBAR_C_EV_M = HBAR_EV_S * SPEED_OF_LIGHT_M_PER_S
MPC_IN_METERS = 3.0856775814913673e22
REDUCED_PLANCK_MASS_EV = 2.435e27


def _require_positive(energy_ev: float) -> float:
    if energy_ev <= 0:
        raise ValueError("energy must be positive on a logarithmic axis")
    return energy_ev


def log_energy(energy_ev: float) -> float:
    """Return log10(E / eV) for a positive energy in electronvolts."""

    return math.log10(_require_positive(energy_ev))


def temperature_kelvin(energy_ev: float) -> float:
    """Convert energy to the natural temperature scale E/k_B."""

    return _require_positive(energy_ev) / K_B_EV_PER_K


def reduced_length_meters(energy_ev: float) -> float:
    """Return the reduced-Compton natural length scale hbar*c/E."""

    return HBAR_C_EV_M / _require_positive(energy_ev)


def quantum_time_seconds(energy_ev: float) -> float:
    """Return the natural time scale hbar/E."""

    return HBAR_EV_S / _require_positive(energy_ev)


def hubble_energy_ev(h0_km_per_second_per_mpc: float) -> float:
    """Convert a Hubble parameter to the energy scale hbar*H_0."""

    hubble_per_second = h0_km_per_second_per_mpc * 1_000 / MPC_IN_METERS
    return HBAR_EV_S * hubble_per_second


def vacuum_energy_scale_ev(h0_km_per_second_per_mpc: float, omega_lambda: float) -> float:
    """Return rho_Lambda**(1/4) for flat Lambda-CDM in reduced Planck units."""

    hbar_h0 = hubble_energy_ev(h0_km_per_second_per_mpc)
    rho_lambda_ev4 = 3 * omega_lambda * (hbar_h0 * REDUCED_PLANCK_MASS_EV) ** 2
    return rho_lambda_ev4**0.25


def effective_relativistic_degrees_of_freedom(temperature_mev: float) -> float:
    """Return the atlas's documented coarse step model for effective g*."""

    temperature_gev = temperature_mev / 1_000
    for threshold, degrees in (
        (300, 106.75),
        (80, 96.25),
        (4.2, 86.25),
        (1.3, 75.75),
        (0.2, 61.75),
        (0.1, 17.25),
    ):
        if temperature_gev >= threshold:
            return degrees
    return 10.75


def radiation_era_age_seconds(energy_ev: float) -> float | None:
    """Estimate cosmic age in radiation domination for 1 MeV <= T <= 1e20 GeV."""

    temperature_mev = energy_ev / 1e6
    if temperature_mev < 1 or energy_ev > 1e26:
        return None
    g_star = effective_relativistic_degrees_of_freedom(temperature_mev)
    return 2.42 / (math.sqrt(g_star) * temperature_mev**2)
