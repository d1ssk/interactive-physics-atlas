"""Versioned renderer-independent data for the Ising visualization."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

SNAPSHOT_SCHEMA = "physics-atlas.ising-snapshot.v1"


def snapshot_payload(
    *,
    dimension: int,
    size: int,
    temperature: float,
    sweeps: int,
    magnetization_total: int,
    energy_total: int,
    acceptance_rate: float,
    snapshot_id: int,
) -> dict[str, int | float | str | list[int]]:
    """Create and validate JSON metadata accompanying a typed spin buffer."""

    site_count = size**dimension
    payload: dict[str, int | float | str | list[int]] = {
        "schema": SNAPSHOT_SCHEMA,
        "dimension": dimension,
        "shape": [size] * dimension,
        "siteCount": site_count,
        "temperature": temperature,
        "sweeps": sweeps,
        "magnetizationTotal": magnetization_total,
        "magnetization": magnetization_total / site_count,
        "energyTotal": energy_total,
        "energyPerSpin": energy_total / site_count,
        "acceptanceRate": acceptance_rate,
        "snapshotId": snapshot_id,
    }
    validate_snapshot_metadata(payload)
    return payload


def validate_snapshot_metadata(payload: Mapping[str, Any]) -> None:
    """Reject malformed or physically impossible snapshot metadata."""

    if payload.get("schema") != SNAPSHOT_SCHEMA:
        raise ValueError("unsupported snapshot schema")
    dimension = payload.get("dimension")
    if dimension not in {1, 2, 3}:
        raise ValueError("invalid dimension")
    shape = payload.get("shape")
    if not isinstance(shape, Sequence) or len(shape) != dimension:
        raise ValueError("invalid lattice shape")
    if any(not isinstance(item, int) or item < 2 for item in shape):
        raise ValueError("invalid lattice extent")
    site_count = payload.get("siteCount")
    expected_count = 1
    for item in shape:
        expected_count *= item
    if site_count != expected_count:
        raise ValueError("site count does not match shape")
    if not isinstance(payload.get("sweeps"), int) or payload["sweeps"] < 0:
        raise ValueError("invalid sweep count")
    if not isinstance(payload.get("snapshotId"), int) or payload["snapshotId"] < 0:
        raise ValueError("invalid snapshot identity")
    if not isinstance(payload.get("temperature"), (int, float)) or payload["temperature"] <= 0:
        raise ValueError("invalid temperature")
    if not isinstance(payload.get("acceptanceRate"), (int, float)) or not (
        0 <= payload["acceptanceRate"] <= 1
    ):
        raise ValueError("invalid acceptance rate")
    magnetization = payload.get("magnetizationTotal")
    if not isinstance(magnetization, int) or abs(magnetization) > site_count:
        raise ValueError("invalid magnetization")
    if (magnetization - site_count) % 2:
        raise ValueError("magnetization parity is inconsistent")
    energy = payload.get("energyTotal")
    if not isinstance(energy, int) or abs(energy) > dimension * site_count:
        raise ValueError("invalid energy")
