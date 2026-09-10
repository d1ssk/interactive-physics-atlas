from __future__ import annotations

import json

import numpy as np


def _request(protocol, inputs):
    return {
        "protocol": protocol.COMPUTE_PROTOCOL_SCHEMA,
        "requestId": "sample-1",
        "kernelVersion": protocol.KERNEL_VERSION,
        "operation": protocol.SAMPLE_OPERATION,
        "input": inputs,
        "limits": {"maxElapsedMs": protocol.DEFAULT_MAX_ELAPSED_MS},
    }


def test_domain_contains_two_encodings_of_each_bounded_realization(
    kernel,
    protocol,
) -> None:
    response = kernel.handle_request(
        _request(protocol, {"mass": 0.45, "cutoffFraction": 0.49, "seed": 240513})
    )
    assert response["ok"] is True
    result = response["result"]
    assert result["schema"] == protocol.SAMPLE_RESULT_SCHEMA
    assert result["spacetime"]["shape"] == [
        protocol.TIME_SLICES,
        protocol.GRID_SIZE,
        protocol.GRID_SIZE,
    ]
    assert result["space3d"]["shape"] == [
        protocol.GRID_SIZE,
        protocol.GRID_SIZE,
        protocol.GRID_SIZE,
    ]
    assert len(result["spacetime"]["field"]) == protocol.TIME_SLICES * protocol.GRID_SIZE**2
    assert len(result["space3d"]["field"]) == protocol.GRID_SIZE**3
    assert "data" not in result and "layout" not in result and "frames" not in result


def test_two_and_three_dimensional_vacuum_correlations_are_distinct(kernel, protocol) -> None:
    result = kernel.handle_request(
        _request(protocol, {"mass": 0.55, "cutoffFraction": 0.51, "seed": 4})
    )["result"]
    correlation = result["correlation"]
    assert correlation["dimension2"][0] == 1.0
    assert correlation["dimension3"][0] == 1.0
    assert not np.allclose(correlation["dimension2"][1:], correlation["dimension3"][1:])


def test_sample_is_reproducible_and_seed_changes_the_realization(kernel, protocol) -> None:
    common = {"mass": 0.6, "cutoffFraction": 0.47}
    first = kernel.handle_request(_request(protocol, {**common, "seed": 17}))["result"]
    repeated = kernel.handle_request(_request(protocol, {**common, "seed": 17}))["result"]
    changed = kernel.handle_request(_request(protocol, {**common, "seed": 18}))["result"]
    assert first["spacetime"]["field"] == repeated["spacetime"]["field"]
    assert first["space3d"]["field"] == repeated["space3d"]["field"]
    assert first["spacetime"]["field"] != changed["spacetime"]["field"]


def test_kernel_rejects_inputs_beyond_declared_limits(kernel, protocol) -> None:
    response = kernel.handle_request(
        _request(protocol, {"mass": 0.1, "cutoffFraction": 0.49, "seed": 1})
    )
    assert response["ok"] is False
    assert response["error"]["code"] == "LIMIT_EXCEEDED"


def test_json_boundary_returns_plain_versioned_data(kernel, protocol) -> None:
    response = json.loads(
        kernel.handle_request_json(
            json.dumps(_request(protocol, {"mass": 0.45, "cutoffFraction": 0.49, "seed": 8}))
        )
    )
    assert response["ok"] is True
    assert response["result"]["kernelVersion"] == protocol.KERNEL_VERSION
