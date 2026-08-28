from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]
JS_KERNEL = VISUALIZATION_DIR / "static" / "runtime" / "ising-kernel-v1.mjs"


@pytest.mark.parametrize("dimension,size", [(1, 8), (2, 5), (3, 4)])
def test_periodic_neighbors_at_origin_and_far_corner(physics, dimension: int, size: int) -> None:
    model = physics.IsingModel(dimension, size, 2.0, seed=1, initial_state="aligned-up")

    origin = model.neighbor_indices(0)
    far_corner = model.neighbor_indices(model.site_count - 1)

    assert len(origin) == 2 * dimension
    assert len(set(origin)) == 2 * dimension
    assert origin[0:2] == (size - 1, 1)
    assert far_corner[0:2] == (model.site_count - 2, model.site_count - size)
    assert all(0 <= index < model.site_count for index in origin + far_corner)


@pytest.mark.parametrize("dimension,size", [(1, 17), (2, 8), (3, 5)])
def test_aligned_state_has_exact_energy_and_magnetization(
    physics, dimension: int, size: int
) -> None:
    model = physics.IsingModel(dimension, size, 1.5, seed=0, initial_state="aligned-up")

    assert model.energy_per_spin == -dimension
    assert model.magnetization == 1
    assert all(model.invariant_report().values())


@pytest.mark.parametrize("dimension", [1, 2, 3])
def test_single_accepted_flip_has_exact_increment(physics, dimension: int) -> None:
    model = physics.IsingModel(dimension, 5, 2.0, seed=9, initial_state="aligned-up")
    index = 0
    old_energy = model.energy_total
    old_magnetization = model.magnetization_total
    delta_energy = model.delta_energy(index)
    old_spin = int(model.spins[index])

    model.spins[index] = -old_spin
    model.energy_total += delta_energy
    model.magnetization_total -= 2 * old_spin

    assert model.energy_total - old_energy == 4 * dimension
    assert model.magnetization_total - old_magnetization == -2
    assert all(model.invariant_report().values())


@pytest.mark.parametrize("dimension", [1, 2, 3])
def test_seeded_sweeps_preserve_exact_state_invariants(physics, dimension: int) -> None:
    model = physics.IsingModel(dimension, 7, 2.3, seed=0xC0FFEE)
    model.advance(12)

    assert set(map(int, model.spins)) == {-1, 1}
    assert all(model.invariant_report().values())


@pytest.mark.parametrize(
    "dimension,expected", [(1, (-4, 0, 4)), (2, (-8, -4, 0, 4, 8)), (3, (-12, -8, -4, 0, 4, 8, 12))]
)
def test_possible_delta_energy_convention(
    physics, dimension: int, expected: tuple[int, ...]
) -> None:
    assert physics.possible_delta_energies(dimension) == expected


def test_fixed_seed_reproduces_initialization_and_trajectory(physics) -> None:
    left = physics.reference_trajectory(2, 8, 2.269, 123456789, 5)
    right = physics.reference_trajectory(2, 8, 2.269, 123456789, 5)
    different = physics.reference_trajectory(2, 8, 2.269, 123456790, 5)

    assert left == right
    assert left != different


def test_thermodynamic_functions_have_known_limits(physics) -> None:
    temperatures = np.array([0.5, 1.0, 3.0, 10.0])
    one_d = physics.exact_thermodynamics(1, temperatures)
    two_d = physics.exact_thermodynamics(2, temperatures)

    assert one_d is not None and two_d is not None
    assert one_d["magnetization"].tolist() == [0.0] * 4
    assert one_d["energy"][0] < -0.96
    assert one_d["energy"][-1] == pytest.approx(-0.1, abs=0.001)
    assert two_d["magnetization"][0] > 0.99
    assert two_d["magnetization"][-1] == 0
    assert two_d["energy"][0] == pytest.approx(-2, abs=1e-5)
    assert physics.exact_thermodynamics(3, temperatures) is None


def test_transition_conventions(physics) -> None:
    assert physics.critical_temperature(1) is None
    assert physics.critical_temperature(2) == pytest.approx(2.2691853142)
    assert physics.critical_temperature(3) == pytest.approx(4.511524)
    assert physics.critical_temperature_above(2) > physics.critical_temperature(2)


def test_seeded_high_and_low_temperature_behavior_is_bounded_and_plausible(physics) -> None:
    low = physics.IsingModel(2, 24, 0.8, seed=77, initial_state="aligned-up")
    high = physics.IsingModel(2, 24, 8.0, seed=77, initial_state="aligned-up")
    low.advance(20)
    high.advance(20)

    assert abs(low.magnetization) > abs(high.magnetization)
    assert low.energy_per_spin < high.energy_per_spin
    assert low.acceptance_rate < high.acceptance_rate
    assert all(low.invariant_report().values())
    assert all(high.invariant_report().values())


@pytest.mark.skipif(shutil.which("node") is None, reason="Node.js is required for Worker parity")
@pytest.mark.parametrize(
    "dimension,size,temperature,seed,sweeps",
    [(1, 128, 1.7, 0, 3), (2, 32, 2.269, 123456789, 2), (3, 10, 4.6, 0xC0FFEE, 1)],
)
def test_python_and_javascript_seeded_trajectories_match(
    physics, dimension: int, size: int, temperature: float, seed: int, sweeps: int
) -> None:
    script = """
      const {IsingModel} = await import(process.argv[1]);
      const [dimension,size,temperature,seed,sweeps] = JSON.parse(process.argv[2]);
      const model = new IsingModel({dimension,size,temperature,seed,initialState:"random"});
      const initial = [...model.spins];
      const states = [];
      for (let sweep = 0; sweep < sweeps; sweep += 1) {
        model.metropolisSweep();
        states.push({spins:[...model.spins], energyTotal:model.energyTotal,
          magnetizationTotal:model.magnetizationTotal, sweeps:model.sweeps,
          acceptanceRate:model.acceptanceRate, rngState:model.rng.state});
      }
      process.stdout.write(JSON.stringify({initial,states}));
    """
    arguments = json.dumps([dimension, size, temperature, seed, sweeps])
    result = subprocess.run(
        ["node", "--input-type=module", "--eval", script, JS_KERNEL.as_uri(), arguments],
        check=True,
        capture_output=True,
        text=True,
    )

    assert json.loads(result.stdout) == physics.reference_trajectory(
        dimension, size, temperature, seed, sweeps
    )
