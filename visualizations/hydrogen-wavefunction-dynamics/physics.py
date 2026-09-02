"""Hydrogen wavefunctions and exact field-free time evolution in atomic units.

Distances are measured in Bohr radii and times in atomic time units. Spherical harmonics include
the Condon--Shortley phase. For the real angular basis, positive ``m`` denotes the cosine
combination and negative ``m`` the sine combination of complex harmonics with ``|m|``.
"""

from __future__ import annotations

import cmath
import math
from collections.abc import Iterable, Mapping
from dataclasses import dataclass

BOHR_ENERGY_EV = 13.605693122994
HARTREE_ENERGY_EV = 2 * BOHR_ENERGY_EV
ATOMIC_TIME_AS = 24.188843265857


@dataclass(frozen=True, slots=True)
class BasisComponent:
    """One normalized coefficient multiplying a hydrogen basis state."""

    n: int
    ell: int
    m: int
    basis: str
    coefficient: complex

    @property
    def weight(self) -> float:
        """Return the basis-state probability weight."""

        return abs(self.coefficient) ** 2


def validate_quantum_numbers(n: int, ell: int, m: int) -> None:
    """Validate hydrogen quantum numbers."""

    if not isinstance(n, int) or isinstance(n, bool) or n < 1:
        raise ValueError("n must be a positive integer")
    if not isinstance(ell, int) or isinstance(ell, bool) or not 0 <= ell < n:
        raise ValueError("l must satisfy 0 <= l < n")
    if not isinstance(m, int) or isinstance(m, bool) or abs(m) > ell:
        raise ValueError("m must satisfy |m| <= l")


def generalized_laguerre(order: int, alpha: int, x: float) -> float:
    """Evaluate the generalized Laguerre polynomial by recurrence."""

    if order < 0:
        raise ValueError("order must be non-negative")
    if order == 0:
        return 1.0
    if order == 1:
        return 1.0 + alpha - x
    previous = 1.0
    current = 1.0 + alpha - x
    for k in range(2, order + 1):
        previous, current = (
            current,
            ((2 * k - 1 + alpha - x) * current - (k - 1 + alpha) * previous) / k,
        )
    return current


def associated_legendre(ell: int, m: int, x: float) -> float:
    """Evaluate an associated Legendre polynomial including the Condon--Shortley phase."""

    absolute_m = abs(m)
    if ell < 0 or absolute_m > ell:
        raise ValueError("associated Legendre polynomial requires l >= |m|")
    pmm = 1.0
    if absolute_m:
        root = math.sqrt(max(0.0, 1.0 - x * x))
        factor = 1
        for _ in range(absolute_m):
            pmm *= -factor * root
            factor += 2
    if ell == absolute_m:
        return pmm
    pmmp1 = x * (2 * absolute_m + 1) * pmm
    if ell == absolute_m + 1:
        return pmmp1
    for degree in range(absolute_m + 2, ell + 1):
        pmm, pmmp1 = (
            pmmp1,
            ((2 * degree - 1) * x * pmmp1 - (degree + absolute_m - 1) * pmm)
            / (degree - absolute_m),
        )
    return pmmp1


def radial_wavefunction(n: int, ell: int, radius: float) -> float:
    """Return the normalized hydrogen radial function in Bohr-radius units."""

    validate_quantum_numbers(n, ell, 0)
    if radius < 0:
        raise ValueError("radius must be non-negative")
    rho = 2.0 * radius / n
    normalization = (2.0 / n) ** 1.5 * math.sqrt(
        math.factorial(n - ell - 1) / (2 * n * math.factorial(n + ell))
    )
    return (
        normalization
        * math.exp(-rho / 2)
        * rho**ell
        * generalized_laguerre(n - ell - 1, 2 * ell + 1, rho)
    )


def complex_spherical_harmonic(ell: int, m: int, theta: float, phi: float) -> complex:
    """Return the normalized complex spherical harmonic ``Y_l^m``."""

    if ell < 0 or abs(m) > ell:
        raise ValueError("spherical harmonic requires l >= 0 and |m| <= l")
    absolute_m = abs(m)
    normalization = math.sqrt(
        (2 * ell + 1)
        / (4 * math.pi)
        * math.factorial(ell - absolute_m)
        / math.factorial(ell + absolute_m)
    )
    positive_m = (
        normalization
        * associated_legendre(ell, absolute_m, math.cos(theta))
        * cmath.exp(1j * absolute_m * phi)
    )
    if m >= 0:
        return positive_m
    return (-1) ** absolute_m * positive_m.conjugate()


def real_spherical_harmonic(ell: int, m: int, theta: float, phi: float) -> float:
    """Return the normalized real cosine/sine spherical-harmonic combination."""

    if m == 0:
        return complex_spherical_harmonic(ell, 0, theta, phi).real
    harmonic = complex_spherical_harmonic(ell, abs(m), theta, phi)
    return math.sqrt(2) * (harmonic.real if m > 0 else harmonic.imag)


def wavefunction_spherical(
    n: int,
    ell: int,
    m: int,
    radius: float,
    theta: float,
    phi: float,
    basis: str = "real",
) -> complex:
    """Evaluate one normalized hydrogen basis wavefunction."""

    validate_quantum_numbers(n, ell, m)
    radial = radial_wavefunction(n, ell, radius)
    if basis == "real":
        return radial * real_spherical_harmonic(ell, m, theta, phi)
    if basis == "complex":
        return radial * complex_spherical_harmonic(ell, m, theta, phi)
    raise ValueError('basis must be "real" or "complex"')


def energy_hartree(n: int) -> float:
    """Return the nonrelativistic bound-state energy in Hartree."""

    if not isinstance(n, int) or isinstance(n, bool) or n < 1:
        raise ValueError("n must be a positive integer")
    return -1.0 / (2 * n * n)


def energy_ev(n: int) -> float:
    """Return the nonrelativistic bound-state energy in electronvolts."""

    energy_hartree(n)
    return -BOHR_ENERGY_EV / (n * n)


def normalize_components(components: Iterable[Mapping[str, object]]) -> tuple[BasisComponent, ...]:
    """Combine duplicate basis states coherently and normalize their coefficients."""

    combined: dict[tuple[str, int, int, int], complex] = {}
    bases: set[str] = set()
    for item in components:
        n, ell, m = item["n"], item["l"], item["m"]
        if not all(isinstance(value, int) and not isinstance(value, bool) for value in (n, ell, m)):
            raise ValueError("quantum numbers must be integers")
        validate_quantum_numbers(n, ell, m)
        basis = str(item.get("basis", "real"))
        if basis not in {"real", "complex"}:
            raise ValueError('basis must be "real" or "complex"')
        bases.add(basis)
        amplitude = float(item["amplitude"])
        phase = float(item.get("phase", 0.0))
        if not math.isfinite(amplitude) or amplitude < 0:
            raise ValueError("component amplitude must be finite and non-negative")
        if not math.isfinite(phase):
            raise ValueError("component phase must be finite")
        if amplitude == 0:
            continue
        key = (basis, n, ell, m)
        combined[key] = combined.get(key, 0j) + amplitude * cmath.exp(1j * phase)
    if len(bases) > 1:
        raise ValueError("all components must use the same angular basis")
    combined = {key: value for key, value in combined.items() if abs(value) ** 2 > 1e-24}
    norm = math.sqrt(sum(abs(value) ** 2 for value in combined.values()))
    if not norm:
        raise ValueError("at least one non-zero component is required")
    return tuple(
        BasisComponent(n=n, ell=ell, m=m, basis=basis, coefficient=value / norm)
        for (basis, n, ell, m), value in combined.items()
    )


def evolved_coefficient(component: BasisComponent, time_au: float) -> complex:
    """Evolve one coefficient under the field-free hydrogen Hamiltonian."""

    if not math.isfinite(time_au):
        raise ValueError("time must be finite")
    return component.coefficient * cmath.exp(-1j * energy_hartree(component.n) * time_au)


def superposition_wavefunction(
    components: Iterable[BasisComponent],
    radius: float,
    theta: float,
    phi: float,
    time_au: float = 0.0,
) -> complex:
    """Evaluate a normalized coherent superposition at one point and time."""

    return sum(
        evolved_coefficient(component, time_au)
        * wavefunction_spherical(
            component.n,
            component.ell,
            component.m,
            radius,
            theta,
            phi,
            component.basis,
        )
        for component in components
    )


def radial_probability(
    components: Iterable[BasisComponent], radius: float, time_au: float = 0.0
) -> float:
    """Return the angle-integrated radial probability density ``P(r,t)``."""

    channels: dict[tuple[str, int, int], complex] = {}
    for component in components:
        key = (component.basis, component.ell, component.m)
        channels[key] = channels.get(key, 0j) + evolved_coefficient(
            component, time_au
        ) * radial_wavefunction(component.n, component.ell, radius)
    return radius * radius * sum(abs(value) ** 2 for value in channels.values())


def expectation_energy_hartree(components: Iterable[BasisComponent]) -> float:
    """Return the expectation value of energy in Hartree."""

    return sum(component.weight * energy_hartree(component.n) for component in components)


def energy_uncertainty_hartree(components: Iterable[BasisComponent]) -> float:
    """Return the energy standard deviation in Hartree."""

    values = tuple(components)
    mean = expectation_energy_hartree(values)
    mean_square = sum(component.weight * energy_hartree(component.n) ** 2 for component in values)
    variance = max(0.0, mean_square - mean * mean)
    if variance <= 16 * math.ulp(1.0) * max(1.0, mean_square):
        return 0.0
    return math.sqrt(variance)


def shortest_beat_period_au(components: Iterable[BasisComponent]) -> float:
    """Return the period associated with the largest pairwise energy gap."""

    energies = {energy_hartree(component.n) for component in components}
    maximum_difference = max(
        (abs(left - right) for left in energies for right in energies), default=0.0
    )
    return 2 * math.pi / maximum_difference if maximum_difference else math.inf


def radial_extent(n: int) -> float:
    """Return the finite sampling radius used by the browser renderer."""

    if not isinstance(n, int) or isinstance(n, bool) or n < 1:
        raise ValueError("n must be a positive integer")
    return float(4 * n * n + 2 * n)
