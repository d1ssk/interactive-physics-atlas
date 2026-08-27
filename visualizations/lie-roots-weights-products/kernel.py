"""Versioned computation boundary used by native Python and Pyodide."""

from __future__ import annotations

import json
from collections.abc import Mapping

from .domain import weight_diagram_domain
from .physics import get_root_system, representation_weights
from .protocol import (
    COMPUTE_PROTOCOL_SCHEMA,
    HARD_MAX_CANDIDATES,
    HARD_MAX_ELAPSED_MS,
    HARD_MAX_RESULT_WEIGHTS,
    KERNEL_VERSION,
    MAX_DYNKIN_LABEL,
    WEIGHT_OPERATION,
)


class KernelRequestError(ValueError):
    """A request failure with a stable, language-neutral error code."""

    def __init__(self, code: str, detail: str):
        super().__init__(detail)
        self.code = code


def _response_base(request: object) -> dict[str, object]:
    request_mapping = request if isinstance(request, Mapping) else {}
    request_id = request_mapping.get("requestId")
    operation = request_mapping.get("operation")
    return {
        "protocol": COMPUTE_PROTOCOL_SCHEMA,
        "requestId": request_id if isinstance(request_id, str) else "",
        "kernelVersion": KERNEL_VERSION,
        "operation": operation if isinstance(operation, str) else "",
    }


def _bounded_integer(limits: Mapping[str, object], name: str, hard_maximum: int) -> int:
    value = limits.get(name)
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise KernelRequestError("INVALID_REQUEST", f"{name} must be a positive integer")
    if value > hard_maximum:
        raise KernelRequestError("LIMIT_EXCEEDED", f"{name} exceeds the kernel maximum")
    return value


def _validate_request(request: object) -> tuple[str, tuple[int, ...], int, int]:
    if not isinstance(request, Mapping):
        raise KernelRequestError("INVALID_REQUEST", "request must be an object")
    if request.get("protocol") != COMPUTE_PROTOCOL_SCHEMA:
        raise KernelRequestError("PROTOCOL_MISMATCH", "unsupported compute protocol")
    request_id = request.get("requestId")
    if not isinstance(request_id, str) or not request_id or len(request_id) > 128:
        raise KernelRequestError("INVALID_REQUEST", "requestId must be a short nonempty string")
    if request.get("kernelVersion") != KERNEL_VERSION:
        raise KernelRequestError("KERNEL_MISMATCH", "unsupported kernel version")
    if request.get("operation") != WEIGHT_OPERATION:
        raise KernelRequestError("UNSUPPORTED_OPERATION", "unsupported operation")

    input_data = request.get("input")
    if not isinstance(input_data, Mapping):
        raise KernelRequestError("INVALID_INPUT", "input must be an object")
    system = input_data.get("system")
    if not isinstance(system, str):
        raise KernelRequestError("INVALID_INPUT", "system must be a string")
    try:
        root_system = get_root_system(system)
    except ValueError as exc:
        raise KernelRequestError("INVALID_INPUT", "unsupported root system") from exc

    labels_value = input_data.get("highestDynkin")
    if not isinstance(labels_value, list) or len(labels_value) != root_system.rank:
        raise KernelRequestError("INVALID_INPUT", "Dynkin labels have the wrong rank")
    if any(isinstance(value, bool) or not isinstance(value, int) for value in labels_value):
        raise KernelRequestError("INVALID_INPUT", "Dynkin labels must be integers")
    labels = tuple(labels_value)
    if any(value < 0 for value in labels):
        raise KernelRequestError("INVALID_INPUT", "Dynkin labels must be non-negative")
    if any(value > MAX_DYNKIN_LABEL for value in labels):
        raise KernelRequestError("LIMIT_EXCEEDED", "Dynkin label exceeds the kernel maximum")

    limits = request.get("limits")
    if not isinstance(limits, Mapping):
        raise KernelRequestError("INVALID_REQUEST", "limits must be an object")
    max_candidates = _bounded_integer(limits, "maxCandidates", HARD_MAX_CANDIDATES)
    max_result_weights = _bounded_integer(
        limits,
        "maxResultWeights",
        HARD_MAX_RESULT_WEIGHTS,
    )
    _bounded_integer(limits, "maxElapsedMs", HARD_MAX_ELAPSED_MS)
    return root_system.key, labels, max_candidates, max_result_weights


def handle_request(request: object) -> dict[str, object]:
    """Execute one request and return a structured success or error response."""

    response = _response_base(request)
    try:
        system, labels, max_candidates, max_result_weights = _validate_request(request)
        try:
            diagram = representation_weights(system, labels, max_candidates=max_candidates)
        except ValueError as exc:
            if "exceeding max_candidates" in str(exc):
                raise KernelRequestError(
                    "LIMIT_EXCEEDED", "candidate lattice limit exceeded"
                ) from exc
            raise KernelRequestError("INVALID_INPUT", "invalid weight request") from exc
        except ArithmeticError as exc:
            raise KernelRequestError("INVARIANT_FAILED", "weight invariant failed") from exc
        try:
            result = weight_diagram_domain(diagram)
        except ArithmeticError as exc:
            raise KernelRequestError("INVARIANT_FAILED", "weight invariant failed") from exc
        if len(result["displayWeights"]) > max_result_weights:
            raise KernelRequestError("LIMIT_EXCEEDED", "result weight limit exceeded")
        return {**response, "ok": True, "result": result}
    except KernelRequestError as exc:
        return {**response, "ok": False, "error": {"code": exc.code}}
    except Exception:
        return {**response, "ok": False, "error": {"code": "CALCULATION_FAILED"}}


def handle_request_json(request_json: str) -> str:
    """JSON adapter used by the language-neutral Worker boundary."""

    try:
        request = json.loads(request_json)
    except (TypeError, json.JSONDecodeError):
        request = None
    return json.dumps(handle_request(request), separators=(",", ":"))
