"""Two-band Chern-insulator and SSH-model calculations.

The Qi--Wu--Zhang convention used throughout this visualization is

    d(k) = (A sin(kx), -lambda sin(ky), m + cos(kx) + cos(ky)).

The reported Chern number belongs to the negative-energy band.  With
``A * lambda > 0``, its sequence as ``m`` increases is ``0, +1, -1, 0``.
This sign uses ``A_i = -i <u|partial_i u>`` and hence
``Omega_- = -dhat dot (partial_x dhat cross partial_y dhat) / 2``.
The SSH chain starts and ends with the intracell ``t1`` bond.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

Array = np.ndarray
EPSILON = 1.0e-11


def _finite(*values: float) -> None:
    if not all(math.isfinite(value) for value in values):
        raise ValueError("model parameters must be finite")


def qwz_d(
    kx: Array | float,
    ky: Array | float,
    *,
    mass: float = -1.0,
    hopping: float = 1.0,
    tr_breaking: float = 1.0,
) -> Array:
    """Return the coefficient vector of the two-band QWZ Hamiltonian."""

    _finite(mass, hopping, tr_breaking)
    kx_array, ky_array = np.broadcast_arrays(
        np.asarray(kx, dtype=float), np.asarray(ky, dtype=float)
    )
    if np.any(~np.isfinite(kx_array)) or np.any(~np.isfinite(ky_array)):
        raise ValueError("momenta must be finite")
    return np.stack(
        (
            hopping * np.sin(kx_array),
            -tr_breaking * np.sin(ky_array),
            mass + np.cos(kx_array) + np.cos(ky_array),
        )
    )


def qwz_energy(
    kx: Array | float,
    ky: Array | float,
    *,
    mass: float = -1.0,
    hopping: float = 1.0,
    tr_breaking: float = 1.0,
) -> Array | float:
    """Return the positive energy ``|d|``; the two bands are ``+/-|d|``."""

    energy = np.linalg.norm(
        qwz_d(
            kx,
            ky,
            mass=mass,
            hopping=hopping,
            tr_breaking=tr_breaking,
        ),
        axis=0,
    )
    return float(energy) if energy.ndim == 0 else energy


def qwz_unit_d(
    kx: Array | float,
    ky: Array | float,
    *,
    mass: float = -1.0,
    hopping: float = 1.0,
    tr_breaking: float = 1.0,
) -> Array:
    """Return the normalized ``d`` vector, with ``nan`` at a band touching."""

    vector = qwz_d(
        kx,
        ky,
        mass=mass,
        hopping=hopping,
        tr_breaking=tr_breaking,
    )
    length = np.linalg.norm(vector, axis=0)
    return np.divide(
        vector,
        length,
        out=np.full_like(vector, np.nan, dtype=float),
        where=length > EPSILON,
    )


def qwz_berry_curvature(
    kx: Array | float,
    ky: Array | float,
    *,
    mass: float = -1.0,
    hopping: float = 1.0,
    tr_breaking: float = 1.0,
) -> Array | float:
    """Return occupied-band Berry curvature ``Omega_-(kx, ky)``."""

    kx_array, ky_array = np.broadcast_arrays(
        np.asarray(kx, dtype=float), np.asarray(ky, dtype=float)
    )
    vector = qwz_d(
        kx_array,
        ky_array,
        mass=mass,
        hopping=hopping,
        tr_breaking=tr_breaking,
    )
    derivative_x = np.stack(
        (
            hopping * np.cos(kx_array),
            np.zeros_like(kx_array),
            -np.sin(kx_array),
        )
    )
    derivative_y = np.stack(
        (
            np.zeros_like(ky_array),
            -tr_breaking * np.cos(ky_array),
            -np.sin(ky_array),
        )
    )
    cross_product = np.cross(derivative_x, derivative_y, axisa=0, axisb=0, axisc=0)
    numerator = -0.5 * np.sum(vector * cross_product, axis=0)
    length = np.linalg.norm(vector, axis=0)
    curvature = np.divide(
        numerator,
        length**3,
        out=np.full_like(length, np.nan, dtype=float),
        where=length > EPSILON,
    )
    return float(curvature) if curvature.ndim == 0 else curvature


def qwz_chern_number(
    *, mass: float = -1.0, hopping: float = 1.0, tr_breaking: float = 1.0
) -> int | None:
    """Return the exact occupied-band phase label, or ``None`` if gapless."""

    _finite(mass, hopping, tr_breaking)
    if any(abs(mass - critical) < EPSILON for critical in (-2.0, 0.0, 2.0)):
        return None
    if (abs(hopping) < EPSILON or abs(tr_breaking) < EPSILON) and abs(mass) < 2.0:
        return None
    if abs(mass) > 2.0 or abs(hopping) < EPSILON or abs(tr_breaking) < EPSILON:
        return 0
    orientation = 1 if hopping * tr_breaking > 0 else -1
    return orientation if mass < 0.0 else -orientation


def _solid_angle(a: Array, b: Array, c: Array) -> float:
    numerator = float(np.dot(a, np.cross(b, c)))
    denominator = 1.0 + float(np.dot(a, b) + np.dot(b, c) + np.dot(c, a))
    return 2.0 * math.atan2(numerator, denominator)


def numerical_qwz_chern(
    *,
    mass: float = -1.0,
    hopping: float = 1.0,
    tr_breaking: float = 1.0,
    resolution: int = 45,
) -> float | None:
    """Estimate the occupied Chern number by oriented spherical areas."""

    if not isinstance(resolution, int) or resolution < 4:
        raise ValueError("resolution must be an integer greater than or equal to 4")
    momenta = -math.pi + 2.0 * math.pi * np.arange(resolution) / resolution
    kx, ky = np.meshgrid(momenta, momenta, indexing="ij")
    points = qwz_unit_d(
        kx,
        ky,
        mass=mass,
        hopping=hopping,
        tr_breaking=tr_breaking,
    )
    if np.any(~np.isfinite(points)):
        return None

    solid_angle = 0.0
    for ix in range(resolution):
        for iy in range(resolution):
            a = points[:, ix, iy]
            b = points[:, (ix + 1) % resolution, iy]
            c = points[:, (ix + 1) % resolution, (iy + 1) % resolution]
            d = points[:, ix, (iy + 1) % resolution]
            solid_angle += _solid_angle(a, b, c) + _solid_angle(a, c, d)
    return -solid_angle / (4.0 * math.pi)


def qwz_band_gap(
    *,
    mass: float = -1.0,
    hopping: float = 1.0,
    tr_breaking: float = 1.0,
    resolution: int = 181,
) -> float:
    """Return a grid estimate of the full bulk gap, exact at known closings."""

    _finite(mass, hopping, tr_breaking)
    if resolution < 5:
        raise ValueError("resolution must be at least 5")
    if any(abs(mass - critical) < EPSILON for critical in (-2.0, 0.0, 2.0)):
        return 0.0
    if (abs(hopping) < EPSILON or abs(tr_breaking) < EPSILON) and abs(mass) <= 2.0:
        return 0.0
    momenta = np.linspace(-math.pi, math.pi, resolution)
    kx, ky = np.meshgrid(momenta, momenta, indexing="ij")
    return 2.0 * float(
        np.min(
            qwz_energy(
                kx,
                ky,
                mass=mass,
                hopping=hopping,
                tr_breaking=tr_breaking,
            )
        )
    )


def ssh_d(k: Array | float, *, t1: float = 0.65, t2: float = 1.0) -> Array:
    """Return the SSH Bloch vector ``(t1+t2 cos k, t2 sin k, 0)``."""

    _finite(t1, t2)
    momentum = np.asarray(k, dtype=float)
    if np.any(~np.isfinite(momentum)):
        raise ValueError("momentum must be finite")
    return np.stack(
        (
            t1 + t2 * np.cos(momentum),
            t2 * np.sin(momentum),
            np.zeros_like(momentum),
        )
    )


def ssh_energy(k: Array | float, *, t1: float = 0.65, t2: float = 1.0) -> Array | float:
    """Return the positive SSH energy; the bands are ``+/-|d|``."""

    energy = np.linalg.norm(ssh_d(k, t1=t1, t2=t2), axis=0)
    return float(energy) if energy.ndim == 0 else energy


def ssh_band_gap(*, t1: float = 0.65, t2: float = 1.0) -> float:
    """Return the exact SSH bulk gap."""

    _finite(t1, t2)
    return 2.0 * abs(abs(t1) - abs(t2))


def ssh_winding_number(*, t1: float = 0.65, t2: float = 1.0) -> int | None:
    """Return the SSH winding for the declared unit cell, or ``None`` at closure."""

    _finite(t1, t2)
    if abs(abs(t1) - abs(t2)) < EPSILON:
        return None
    return int(abs(t1) < abs(t2))


def ssh_finite_hamiltonian(cells: int = 18, *, t1: float = 0.65, t2: float = 1.0) -> Array:
    """Return an open SSH chain beginning and ending with an intracell bond."""

    if not isinstance(cells, int) or cells < 2:
        raise ValueError("cells must be an integer greater than or equal to 2")
    _finite(t1, t2)
    matrix = np.zeros((2 * cells, 2 * cells), dtype=float)
    hoppings = np.where(np.arange(2 * cells - 1) % 2 == 0, t1, t2)
    indices = np.arange(2 * cells - 1)
    matrix[indices, indices + 1] = hoppings
    matrix[indices + 1, indices] = hoppings
    return matrix


@dataclass(frozen=True, slots=True)
class SSHFiniteSpectrum:
    """Finite-chain eigensystem and diagnostics for the two central states."""

    energies: Array
    eigenvectors: Array
    central_indices: Array
    central_energies: Array
    density: Array
    edge_weight: float
    inverse_participation: float


def ssh_finite_spectrum(cells: int = 18, *, t1: float = 0.65, t2: float = 1.0) -> SSHFiniteSpectrum:
    """Diagonalize the finite chain and average its two most central densities."""

    energies, eigenvectors = np.linalg.eigh(ssh_finite_hamiltonian(cells, t1=t1, t2=t2))
    central_indices = np.argsort(np.abs(energies), kind="stable")[:2]
    density = np.mean(np.abs(eigenvectors[:, central_indices]) ** 2, axis=1)
    edge_weight = float(np.sum(density[[0, 1, -2, -1]]))
    return SSHFiniteSpectrum(
        energies=energies,
        eigenvectors=eigenvectors,
        central_indices=central_indices,
        central_energies=np.sort(energies[central_indices]),
        density=density,
        edge_weight=edge_weight,
        inverse_participation=float(np.sum(density**2)),
    )
