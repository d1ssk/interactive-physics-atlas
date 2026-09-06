"""Versioned Python computation boundary used natively and in Pyodide."""

from __future__ import annotations

import json
from collections.abc import Mapping

from .domain import plane_wave_domain, scattering_domain
from .physics import PotentialParameters
from .protocol import (
    COMPUTE_PROTOCOL_SCHEMA,
    HARD_MAX_ELAPSED_MS,
    KERNEL_VERSION,
    MAX_ELL,
    MAX_SCATTER_ELL,
    PLANE_OPERATION,
    SCATTER_OPERATION,
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


def _validate(request: object) -> tuple[str, Mapping[str, object]]:
    if not isinstance(request, Mapping):
        raise KernelRequestError("INVALID_REQUEST", "request must be an object")
    if request.get("protocol") != COMPUTE_PROTOCOL_SCHEMA:
        raise KernelRequestError("PROTOCOL_MISMATCH", "unsupported protocol")
    if request.get("kernelVersion") != KERNEL_VERSION:
        raise KernelRequestError("KERNEL_MISMATCH", "unsupported kernel")
    request_id = request.get("requestId")
    if not isinstance(request_id, str) or not request_id or len(request_id) > 128:
        raise KernelRequestError("INVALID_REQUEST", "requestId is invalid")
    operation = request.get("operation")
    if operation not in (PLANE_OPERATION, SCATTER_OPERATION):
        raise KernelRequestError("UNSUPPORTED_OPERATION", "unsupported operation")
    limits = request.get("limits")
    if not isinstance(limits, Mapping):
        raise KernelRequestError("INVALID_REQUEST", "limits are missing")
    elapsed = _integer(limits.get("maxElapsedMs"), "maxElapsedMs", 1, HARD_MAX_ELAPSED_MS)
    if elapsed > HARD_MAX_ELAPSED_MS:
        raise KernelRequestError("LIMIT_EXCEEDED", "time budget is too large")
    inputs = request.get("input")
    if not isinstance(inputs, Mapping):
        raise KernelRequestError("INVALID_INPUT", "input must be an object")
    return operation, inputs


def handle_request(request: object) -> dict[str, object]:
    """Execute one bounded request and return a versioned response."""

    response = _base(request)
    try:
        operation, inputs = _validate(request)
        if operation == PLANE_OPERATION:
            maximum_ell = _integer(inputs.get("maximumEll"), "maximumEll", 0, MAX_ELL)
            result = plane_wave_domain(maximum_ell)
        else:
            parameters = PotentialParameters(
                _number(inputs.get("strength"), "strength", -18.0, 18.0),
                _number(inputs.get("range"), "range", 0.55, 1.8),
                _number(inputs.get("core"), "core", 0.0, 24.0),
            )
            energy = _number(inputs.get("energy"), "energy", 0.5, 16.0)
            maximum_ell = _integer(inputs.get("maximumEll"), "maximumEll", 0, MAX_SCATTER_ELL)
            resonance_ell = _integer(inputs.get("resonanceEll"), "resonanceEll", 0, MAX_SCATTER_ELL)
            field_mode = inputs.get("fieldMode")
            if field_mode not in ("total", "scattered"):
                raise KernelRequestError("INVALID_INPUT", "fieldMode is invalid")
            result = scattering_domain(
                parameters,
                energy,
                maximum_ell,
                field_mode,
                resonance_ell,
            )
        return {**response, "ok": True, "result": result}
    except KernelRequestError as exc:
        return {**response, "ok": False, "error": {"code": exc.code}}
    except (ArithmeticError, FloatingPointError):
        return {**response, "ok": False, "error": {"code": "INVARIANT_FAILED"}}
    except Exception:
        return {**response, "ok": False, "error": {"code": "CALCULATION_FAILED"}}


def handle_request_json(request_json: str) -> str:
    """Compact JSON adapter used by the Worker boundary."""

    try:
        request = json.loads(request_json)
    except (TypeError, json.JSONDecodeError):
        request = None
    return json.dumps(handle_request(request), separators=(",", ":"))
