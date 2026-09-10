"""Versioned Python computation boundary used natively and in Pyodide."""

from __future__ import annotations

import json
from collections.abc import Mapping

from .domain import vacuum_sample_domain
from .protocol import (
    COMPUTE_PROTOCOL_SCHEMA,
    HARD_MAX_ELAPSED_MS,
    KERNEL_VERSION,
    MAX_CUTOFF_FRACTION,
    MAX_MASS,
    MAX_SEED,
    MIN_CUTOFF_FRACTION,
    MIN_MASS,
    SAMPLE_OPERATION,
)


class KernelRequestError(ValueError):
    """A request failure carrying a stable language-neutral code."""

    def __init__(self, code: str, detail: str):
        super().__init__(detail)
        self.code = code


def _base(request: object) -> dict[str, object]:
    value = request if isinstance(request, Mapping) else {}
    return {
        "protocol": COMPUTE_PROTOCOL_SCHEMA,
        "requestId": value.get("requestId") if isinstance(value.get("requestId"), str) else "",
        "kernelVersion": KERNEL_VERSION,
        "operation": value.get("operation") if isinstance(value.get("operation"), str) else "",
    }


def _number(value: object, name: str, minimum: float, maximum: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise KernelRequestError("INVALID_INPUT", f"{name} must be numeric")
    result = float(value)
    if not minimum <= result <= maximum:
        raise KernelRequestError("LIMIT_EXCEEDED", f"{name} is outside its allowed range")
    return result


def _integer(value: object, name: str, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise KernelRequestError("INVALID_INPUT", f"{name} must be an integer")
    if not minimum <= value <= maximum:
        raise KernelRequestError("LIMIT_EXCEEDED", f"{name} is outside its allowed range")
    return value


def _validate(request: object) -> Mapping[str, object]:
    if not isinstance(request, Mapping):
        raise KernelRequestError("INVALID_REQUEST", "request must be an object")
    if request.get("protocol") != COMPUTE_PROTOCOL_SCHEMA:
        raise KernelRequestError("PROTOCOL_MISMATCH", "unsupported protocol")
    if request.get("kernelVersion") != KERNEL_VERSION:
        raise KernelRequestError("KERNEL_MISMATCH", "unsupported kernel")
    request_id = request.get("requestId")
    if not isinstance(request_id, str) or not request_id or len(request_id) > 128:
        raise KernelRequestError("INVALID_REQUEST", "requestId is invalid")
    if request.get("operation") != SAMPLE_OPERATION:
        raise KernelRequestError("UNSUPPORTED_OPERATION", "unsupported operation")
    limits = request.get("limits")
    if not isinstance(limits, Mapping):
        raise KernelRequestError("INVALID_REQUEST", "limits are missing")
    _integer(limits.get("maxElapsedMs"), "maxElapsedMs", 1, HARD_MAX_ELAPSED_MS)
    inputs = request.get("input")
    if not isinstance(inputs, Mapping):
        raise KernelRequestError("INVALID_INPUT", "input must be an object")
    return inputs


def handle_request(request: object) -> dict[str, object]:
    """Execute one bounded request and return a versioned response."""

    response = _base(request)
    try:
        inputs = _validate(request)
        mass = _number(inputs.get("mass"), "mass", MIN_MASS, MAX_MASS)
        cutoff_fraction = _number(
            inputs.get("cutoffFraction"),
            "cutoffFraction",
            MIN_CUTOFF_FRACTION,
            MAX_CUTOFF_FRACTION,
        )
        seed = _integer(inputs.get("seed"), "seed", 0, MAX_SEED)
        return {
            **response,
            "ok": True,
            "result": vacuum_sample_domain(mass, cutoff_fraction, seed),
        }
    except KernelRequestError as exc:
        return {**response, "ok": False, "error": {"code": exc.code}}
    except (ArithmeticError, FloatingPointError):
        return {**response, "ok": False, "error": {"code": "INVARIANT_FAILED"}}
    except Exception:
        return {**response, "ok": False, "error": {"code": "CALCULATION_FAILED"}}


def handle_request_json(request_json: str) -> str:
    """Return a compact JSON response for the Worker boundary."""

    try:
        request = json.loads(request_json)
    except (TypeError, json.JSONDecodeError):
        request = None
    return json.dumps(handle_request(request), separators=(",", ":"))
