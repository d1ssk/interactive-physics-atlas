from __future__ import annotations

import numpy as np


def request(protocol, operation, inputs):
    return {
        "protocol": protocol.COMPUTE_PROTOCOL_SCHEMA,
        "requestId": "test-1",
        "kernelVersion": protocol.KERNEL_VERSION,
        "operation": operation,
        "input": inputs,
        "limits": {"maxElapsedMs": protocol.DEFAULT_MAX_ELAPSED_MS},
    }


def test_plane_result_is_bounded_domain_data(kernel, protocol) -> None:
    response = kernel.handle_request(request(protocol, protocol.PLANE_OPERATION, {"maximumEll": 4}))
    assert response["ok"] is True
    result = response["result"]
    assert result["schema"] == protocol.PLANE_RESULT_SCHEMA
    assert len(result["field3d"]) == 19**3
    assert np.linalg.matrix_rank(np.asarray(result["current"])) > 10
    assert np.linalg.matrix_rank(np.asarray(result["next"])) > 10
    assert "data" not in result and "layout" not in result and "frames" not in result


def test_scattering_result_preserves_requested_state(kernel, protocol) -> None:
    inputs = {
        "strength": -8,
        "range": 1.15,
        "core": 0,
        "energy": 5,
        "maximumEll": 2,
        "fieldMode": "total",
        "resonanceEll": 1,
    }
    response = kernel.handle_request(request(protocol, protocol.SCATTER_OPERATION, inputs))
    assert response["ok"] is True
    result = response["result"]
    assert result["schema"] == protocol.SCATTER_RESULT_SCHEMA
    assert result["maximumEll"] == 2
    assert result["resonanceEll"] == 1
    assert result["crossSection"] >= 0
    assert len(result["field"]["current"]) == len(result["field"]["axis"])
    assert (
        np.linalg.matrix_rank(np.nan_to_num(np.asarray(result["field"]["current"], dtype=float)))
        > 10
    )


def test_kernel_rejects_out_of_range_input(kernel, protocol) -> None:
    response = kernel.handle_request(
        request(protocol, protocol.PLANE_OPERATION, {"maximumEll": 13})
    )
    assert response["ok"] is False
    assert response["error"]["code"] == "LIMIT_EXCEEDED"
