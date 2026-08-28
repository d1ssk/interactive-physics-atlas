"""Validated Python protocol kernel used for deterministic reference results."""

from __future__ import annotations

from typing import Any

from .domain import snapshot_payload
from .physics import KERNEL_VERSION, IsingModel
from .protocol import LIMITS, PROTOCOL_VERSION, validate_lattice, validate_request


class IsingKernel:
    """Stateful reference implementation of the browser protocol."""

    def __init__(self) -> None:
        self.model: IsingModel | None = None
        self.generation_id = -1
        self.snapshot_id = 0

    def handle(self, request: dict[str, Any]) -> dict[str, Any]:
        """Validate and execute one request."""

        validate_request(request)
        if request.get("kernelVersion") != KERNEL_VERSION:
            raise ValueError("unsupported kernel version")
        operation = request["operation"]
        generation_id = request["generationId"]
        inputs = request["input"]
        if operation in {"ising.initialize.v1", "ising.reset.v1"}:
            dimension = inputs.get("dimension")
            size = inputs.get("size")
            validate_lattice(dimension, size)
            self.model = IsingModel(
                dimension,
                size,
                inputs.get("temperature"),
                inputs.get("seed"),
                inputs.get("initialState", "random"),
            )
            self.generation_id = generation_id
            self.snapshot_id = 0
        else:
            if self.model is None:
                raise ValueError("kernel is not initialized")
            if generation_id != self.generation_id:
                raise ValueError("stale generation")
            if operation == "ising.configure.v1":
                self.model.set_temperature(inputs.get("temperature"))
            elif operation == "ising.advance.v1":
                sweeps = inputs.get("sweeps")
                if not isinstance(sweeps, int) or not 1 <= sweeps <= LIMITS["maxSweepsPerBatch"]:
                    raise ValueError("invalid sweep batch")
                self.model.advance(sweeps)
                self.snapshot_id += 1

        assert self.model is not None
        metadata = snapshot_payload(
            dimension=self.model.dimension,
            size=self.model.size,
            temperature=self.model.temperature,
            sweeps=self.model.sweeps,
            magnetization_total=self.model.magnetization_total,
            energy_total=self.model.energy_total,
            acceptance_rate=self.model.acceptance_rate,
            snapshot_id=self.snapshot_id,
        )
        return {
            "protocol": PROTOCOL_VERSION,
            "kernelVersion": KERNEL_VERSION,
            "operation": operation,
            "requestId": request["requestId"],
            "generationId": self.generation_id,
            "ok": True,
            "snapshot": metadata,
            "spins": self.model.spins.copy(),
        }
