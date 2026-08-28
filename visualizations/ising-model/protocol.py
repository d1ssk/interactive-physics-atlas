"""Language-neutral protocol and resource limits for the Ising Worker."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

PROTOCOL_VERSION = "physics-atlas.ising.v1"
OPERATIONS = (
    "ising.initialize.v1",
    "ising.advance.v1",
    "ising.configure.v1",
    "ising.reset.v1",
)
LIMITS = {
    "dimensions": (1, 2, 3),
    "sizes": {
        1: (128, 256, 512),
        2: (32, 48, 64, 96),
        3: (10, 14, 18, 20),
    },
    "maxSites": 96**2,
    "maxSweepsPerBatch": 8,
    "maxDisplayHz": 20,
    "historyLength": 240,
    "maxSnapshotBytes": 96**2,
}


def validate_request(request: Mapping[str, Any]) -> None:
    """Validate the shared envelope fields and declared operation."""

    if request.get("protocol") != PROTOCOL_VERSION:
        raise ValueError("unsupported protocol")
    if request.get("operation") not in OPERATIONS:
        raise ValueError("unsupported operation")
    if not isinstance(request.get("requestId"), int) or request["requestId"] < 0:
        raise ValueError("invalid request ID")
    if not isinstance(request.get("generationId"), int) or request["generationId"] < 0:
        raise ValueError("invalid generation ID")
    if not isinstance(request.get("input"), Mapping):
        raise ValueError("input must be an object")


def validate_lattice(dimension: int, size: int) -> None:
    """Validate a published lattice shape against explicit resource limits."""

    if dimension not in LIMITS["dimensions"]:
        raise ValueError("unsupported dimension")
    sizes = LIMITS["sizes"]
    assert isinstance(sizes, dict)
    if size not in sizes[dimension]:
        raise ValueError("unsupported lattice size")
    if size**dimension > LIMITS["maxSites"]:
        raise ValueError("lattice exceeds site limit")
