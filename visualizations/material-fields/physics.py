"""Linear electrostatic and magnetostatic material-response relations.

The published browser solver handles arbitrary two-dimensional shapes.  This
module collects independently testable constitutive relations and the exact
transverse-field solution for an infinite circular cylinder.
"""

from __future__ import annotations

import math

VACUUM_PERMITTIVITY = 8.854_187_8128e-12


def _positive_relative_property(value: float, name: str) -> float:
    if not math.isfinite(value) or value <= 0:
        raise ValueError(f"{name} must be finite and positive")
    return value


def electric_susceptibility(relative_permittivity: float) -> float:
    """Return ``chi_e`` for a linear isotropic dielectric."""

    return _positive_relative_property(relative_permittivity, "relative_permittivity") - 1.0


def magnetic_susceptibility(relative_permeability: float) -> float:
    """Return ``chi_m`` for a linear isotropic magnetic material."""

    return _positive_relative_property(relative_permeability, "relative_permeability") - 1.0


def dielectric_cylinder_internal_field(
    relative_permittivity: float, applied_field: float = 1.0
) -> float:
    """Internal electric field of an infinite cylinder in a transverse uniform field."""

    epsilon_r = _positive_relative_property(relative_permittivity, "relative_permittivity")
    return 2.0 * applied_field / (epsilon_r + 1.0)


def dielectric_cylinder_surface_charge_amplitude(
    relative_permittivity: float, applied_field: float = 1.0
) -> float:
    """Amplitude of ``sigma_b(theta) = amplitude cos(theta)`` for the cylinder."""

    epsilon_r = _positive_relative_property(relative_permittivity, "relative_permittivity")
    internal_field = dielectric_cylinder_internal_field(epsilon_r, applied_field)
    return VACUUM_PERMITTIVITY * (epsilon_r - 1.0) * internal_field


def magnetic_cylinder_internal_flux_density(
    relative_permeability: float, applied_flux_density: float = 1.0
) -> float:
    """Internal ``B`` of an infinite cylinder in a transverse uniform applied ``B``."""

    mu_r = _positive_relative_property(relative_permeability, "relative_permeability")
    return 2.0 * mu_r * applied_flux_density / (mu_r + 1.0)
