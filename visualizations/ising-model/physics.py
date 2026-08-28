"""Authoritative physics for periodic hypercubic Ising models.

The browser Worker mirrors the update kernel in this module.  Seeded parity
tests make that duplication explicit and prevent the two implementations from
silently acquiring different scientific conventions.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import exp, log, sqrt, tanh

import numpy as np
from scipy.special import ellipk

KERNEL_VERSION = "1.0.0"
UINT32_SCALE = 2**32
ZERO_SEED_REPLACEMENT = 0x6D2B79F5
CRITICAL_TEMPERATURES = {
    1: None,
    2: 2 / log(1 + sqrt(2)),
    3: 4.511524,
}


class XorShift32:
    """Small reproducible PRNG with identical Python and JavaScript semantics."""

    def __init__(self, seed: int):
        state = int(seed) & 0xFFFFFFFF
        self.state = state or ZERO_SEED_REPLACEMENT

    def next_uint32(self) -> int:
        """Return the next unsigned 32-bit integer."""

        value = self.state
        value ^= (value << 13) & 0xFFFFFFFF
        value ^= value >> 17
        value ^= (value << 5) & 0xFFFFFFFF
        self.state = value & 0xFFFFFFFF
        return self.state

    def random(self) -> float:
        """Return a value in the half-open interval ``[0, 1)``."""

        return self.next_uint32() / UINT32_SCALE

    def randbelow(self, upper: int) -> int:
        """Return an integer in ``range(upper)`` using the browser convention."""

        if upper <= 0:
            raise ValueError("upper must be positive")
        return (self.next_uint32() * upper) // UINT32_SCALE


@dataclass(frozen=True, slots=True)
class FlipResult:
    """Exact changes produced by one accepted or rejected proposal."""

    index: int
    delta_energy: int
    old_spin: int
    accepted: bool


class IsingModel:
    """Random-sequential Metropolis model on a periodic hypercubic lattice."""

    def __init__(
        self,
        dimension: int,
        size: int,
        temperature: float,
        seed: int,
        initial_state: str = "random",
    ) -> None:
        if dimension not in {1, 2, 3}:
            raise ValueError("dimension must be 1, 2, or 3")
        if size < 2:
            raise ValueError("size must be at least 2")
        if not temperature > 0:
            raise ValueError("temperature must be positive")
        if initial_state not in {"random", "aligned-up", "aligned-down"}:
            raise ValueError("unsupported initial state")

        self.dimension = dimension
        self.size = size
        self.site_count = size**dimension
        self.temperature = float(temperature)
        self.rng = XorShift32(seed)
        self.spins = np.empty(self.site_count, dtype=np.int8)
        if initial_state == "random":
            for index in range(self.site_count):
                self.spins[index] = -1 if self.rng.random() < 0.5 else 1
        else:
            self.spins.fill(1 if initial_state == "aligned-up" else -1)
        self.magnetization_total = int(np.sum(self.spins, dtype=np.int64))
        self.energy_total = self.compute_total_energy()
        self.sweeps = 0
        self.acceptance_rate = 0.0

    def set_temperature(self, temperature: float) -> None:
        """Change the bath temperature without changing the state."""

        if not temperature > 0:
            raise ValueError("temperature must be positive")
        self.temperature = float(temperature)

    def neighbor_indices(self, index: int) -> tuple[int, ...]:
        """Return negative and positive neighbors along every periodic axis."""

        if not 0 <= index < self.site_count:
            raise IndexError(index)
        neighbors: list[int] = []
        stride = 1
        for _axis in range(self.dimension):
            coordinate = (index // stride) % self.size
            negative = index + (self.size - 1) * stride if coordinate == 0 else index - stride
            positive = (
                index - (self.size - 1) * stride if coordinate == self.size - 1 else index + stride
            )
            neighbors.extend((negative, positive))
            stride *= self.size
        return tuple(neighbors)

    def neighbor_sum(self, index: int) -> int:
        """Return the sum of the ``2d`` nearest-neighbor spins."""

        return sum(int(self.spins[neighbor]) for neighbor in self.neighbor_indices(index))

    def delta_energy(self, index: int) -> int:
        """Return ``E_after - E_before`` for flipping one spin."""

        return 2 * int(self.spins[index]) * self.neighbor_sum(index)

    def attempt_flip(self) -> FlipResult:
        """Perform one seeded random-site Metropolis proposal."""

        index = self.rng.randbelow(self.site_count)
        old_spin = int(self.spins[index])
        delta_energy = self.delta_energy(index)
        accepted = delta_energy <= 0 or self.rng.random() < exp(-delta_energy / self.temperature)
        if accepted:
            self.spins[index] = -old_spin
            self.magnetization_total -= 2 * old_spin
            self.energy_total += delta_energy
        return FlipResult(index, delta_energy, old_spin, accepted)

    def metropolis_sweep(self) -> float:
        """Attempt ``N`` random flips, allowing repeated site selection."""

        accepted = sum(self.attempt_flip().accepted for _ in range(self.site_count))
        self.sweeps += 1
        self.acceptance_rate = accepted / self.site_count
        return self.acceptance_rate

    def advance(self, sweeps: int) -> None:
        """Advance by a positive, bounded number of sweeps."""

        if sweeps < 1:
            raise ValueError("sweeps must be positive")
        for _ in range(sweeps):
            self.metropolis_sweep()

    def compute_total_energy(self) -> int:
        """Evaluate ``-sum_<ij> s_i s_j`` with every bond counted once."""

        energy = 0
        for index in range(self.site_count):
            stride = 1
            for _axis in range(self.dimension):
                coordinate = (index // stride) % self.size
                positive = (
                    index - (self.size - 1) * stride
                    if coordinate == self.size - 1
                    else index + stride
                )
                energy -= int(self.spins[index]) * int(self.spins[positive])
                stride *= self.size
        return energy

    @property
    def magnetization(self) -> float:
        return self.magnetization_total / self.site_count

    @property
    def energy_per_spin(self) -> float:
        return self.energy_total / self.site_count

    def invariant_report(self) -> dict[str, bool]:
        """Recompute the exact state invariants used by regression tests."""

        return {
            "spins_valid": bool(np.all((self.spins == -1) | (self.spins == 1))),
            "magnetization_consistent": (
                int(np.sum(self.spins, dtype=np.int64)) == self.magnetization_total
            ),
            "energy_consistent": self.compute_total_energy() == self.energy_total,
        }


def exact_thermodynamics(dimension: int, temperatures: np.ndarray) -> dict[str, np.ndarray] | None:
    """Return exact zero-field thermodynamic-limit curves where known.

    The 1D result is exact for every positive temperature.  For the 2D square
    lattice, magnetization and internal energy use the Onsager--Yang solution;
    heat capacity is the numerical derivative of that exact energy curve.  No
    corresponding closed-form solution is known for the 3D cubic lattice.
    """

    values = np.asarray(temperatures, dtype=float)
    if values.ndim != 1 or np.any(values <= 0):
        raise ValueError("temperatures must be a one-dimensional positive array")

    if dimension == 1:
        inverse = 1 / values
        energy = -np.tanh(inverse)
        heat_capacity = (1 / np.cosh(inverse) ** 2) / values**2
        magnetization = np.zeros_like(values)
    elif dimension == 2:
        inverse = 1 / values
        twice_inverse = 2 * inverse
        hyperbolic_sine = np.sinh(twice_inverse)
        hyperbolic_cosine = np.cosh(twice_inverse)
        modulus = 2 * hyperbolic_sine / hyperbolic_cosine**2
        factor = 2 * np.tanh(twice_inverse) ** 2 - 1
        energy = -(hyperbolic_cosine / hyperbolic_sine) * (
            1 + (2 / np.pi) * factor * ellipk(np.clip(modulus**2, 0, 1))
        )
        critical = CRITICAL_TEMPERATURES[2]
        assert critical is not None
        near_critical = np.isclose(values, critical, rtol=0, atol=1e-12)
        energy[near_critical] = -sqrt(2)
        ordered = values < critical
        magnetization = np.zeros_like(values)
        magnetization[ordered] = (1 - np.sinh(2 / values[ordered]) ** -4) ** (1 / 8)
        edge_order = 2 if len(values) > 2 else 1
        heat_capacity = np.gradient(energy, values, edge_order=edge_order)
    elif dimension == 3:
        return None
    else:
        raise ValueError("dimension must be 1, 2, or 3")

    return {
        "temperature": values,
        "magnetization": magnetization,
        "energy": energy,
        "heat_capacity": heat_capacity,
    }


def one_dimensional_free_energy(temperature: float) -> float:
    """Return the exact 1D zero-field free energy per spin."""

    if temperature <= 0:
        raise ValueError("temperature must be positive")
    return -temperature * log(2 * np.cosh(1 / temperature))


def critical_temperature(dimension: int) -> float | None:
    """Return the thermodynamic-limit critical temperature, if finite."""

    if dimension not in CRITICAL_TEMPERATURES:
        raise ValueError("dimension must be 1, 2, or 3")
    return CRITICAL_TEMPERATURES[dimension]


def critical_temperature_above(dimension: int, relative_offset: float = 0.01) -> float | None:
    """Return a temperature one percent above the transition by default."""

    value = critical_temperature(dimension)
    return None if value is None else value * (1 + relative_offset)


def possible_delta_energies(dimension: int) -> tuple[int, ...]:
    """Return all single-flip energy changes on a hypercubic lattice."""

    if dimension not in {1, 2, 3}:
        raise ValueError("dimension must be 1, 2, or 3")
    return tuple(range(-4 * dimension, 4 * dimension + 1, 4))


def reference_trajectory(
    dimension: int, size: int, temperature: float, seed: int, sweeps: int
) -> dict[str, object]:
    """Build a compact deterministic vector for cross-runtime parity tests."""

    model = IsingModel(dimension, size, temperature, seed)
    initial = model.spins.tolist()
    states: list[dict[str, object]] = []
    for _ in range(sweeps):
        model.metropolis_sweep()
        states.append(
            {
                "spins": model.spins.tolist(),
                "energyTotal": model.energy_total,
                "magnetizationTotal": model.magnetization_total,
                "sweeps": model.sweeps,
                "acceptanceRate": model.acceptance_rate,
                "rngState": model.rng.state,
            }
        )
    return {"initial": initial, "states": states}


__all__ = [
    "CRITICAL_TEMPERATURES",
    "KERNEL_VERSION",
    "FlipResult",
    "IsingModel",
    "XorShift32",
    "critical_temperature",
    "critical_temperature_above",
    "exact_thermodynamics",
    "one_dimensional_free_energy",
    "possible_delta_energies",
    "reference_trajectory",
    "tanh",
]
