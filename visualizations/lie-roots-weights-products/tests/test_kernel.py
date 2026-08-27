from __future__ import annotations

import copy
import json
import zipfile
from pathlib import Path

import numpy as np
import pytest


def test_nonpreset_a2_weight_request_matches_native_domain_data(
    physics,
    domain,
    kernel,
    protocol,
):
    request = protocol.weight_compute_request("a2-4-0", "A2", [4, 0])

    response = kernel.handle_request(request)
    native = domain.weight_diagram_domain(physics.representation_weights("A2", (4, 0)))

    assert response == {
        "protocol": protocol.COMPUTE_PROTOCOL_SCHEMA,
        "requestId": "a2-4-0",
        "kernelVersion": protocol.KERNEL_VERSION,
        "operation": protocol.WEIGHT_OPERATION,
        "ok": True,
        "result": native,
    }
    assert response["result"]["dimension"] == 15
    assert response["result"]["kernelVersion"] == protocol.KERNEL_VERSION


@pytest.mark.parametrize(
    ("mutation", "error_code"),
    [
        (lambda request: request.update(protocol="wrong"), "PROTOCOL_MISMATCH"),
        (lambda request: request.update(kernelVersion="wrong"), "KERNEL_MISMATCH"),
        (lambda request: request.update(operation="wrong"), "UNSUPPORTED_OPERATION"),
        (lambda request: request["input"].update(highestDynkin=[4]), "INVALID_INPUT"),
        (lambda request: request["input"].update(highestDynkin=[-1, 0]), "INVALID_INPUT"),
        (lambda request: request["input"].update(highestDynkin=[9, 0]), "LIMIT_EXCEEDED"),
        (lambda request: request["limits"].update(maxCandidates=250_001), "LIMIT_EXCEEDED"),
    ],
)
def test_kernel_returns_stable_error_codes(kernel, protocol, mutation, error_code):
    request = protocol.weight_compute_request("invalid", "A2", [4, 0])
    mutation(request)

    response = kernel.handle_request(request)

    assert response["ok"] is False
    assert response["error"] == {"code": error_code}
    assert error_code in protocol.ERROR_CODES


def test_kernel_json_boundary_is_plain_json(kernel, protocol):
    request = protocol.weight_compute_request("json", "A2", [4, 0])

    response = json.loads(kernel.handle_request_json(json.dumps(request)))

    assert response["ok"] is True
    assert response["result"]["schema"] == "physics-atlas.weight-diagram.v1"
    assert "data" not in response["result"]
    assert "layout" not in response["result"]


def test_domain_validator_rejects_dimension_mismatch(physics, domain):
    result = domain.weight_diagram_domain(physics.representation_weights("A2", (4, 0)))
    invalid = copy.deepcopy(result)
    invalid["multiplicities"][0] += 1

    with pytest.raises(ArithmeticError, match="sum to the dimension"):
        domain.validate_weight_diagram_domain(invalid)


def test_display_coordinates_are_canonical_across_runtime_roundoff(domain):
    left = np.asarray([[1.6329931618554518, 3.174735941798659e-18]])
    right = np.asarray([[1.6329931618554516, 1.8503717077085938e-17]])

    assert (
        domain._display_coordinates(left)
        == domain._display_coordinates(right)
        == [[1.632993161855, 0]]
    )


def test_generated_kernel_wheel_contains_authoritative_sources(
    tmp_path,
    runtime_build,
    protocol,
):
    source_dir = Path(runtime_build.__file__).parent
    first = tmp_path / "first.whl"
    second = tmp_path / "second.whl"

    runtime_build.build_kernel_wheel(source_dir, first)
    runtime_build.build_kernel_wheel(source_dir, second)

    assert first.read_bytes() == second.read_bytes()
    assert first.stat().st_size <= 32_768
    with zipfile.ZipFile(first) as wheel:
        for source_name in runtime_build.KERNEL_SOURCE_NAMES:
            archived = f"{runtime_build.KERNEL_DISTRIBUTION}/{source_name}"
            assert wheel.read(archived) == (source_dir / source_name).read_bytes()
        metadata = wheel.read(
            f"{runtime_build.KERNEL_DISTRIBUTION}-{protocol.KERNEL_VERSION}.dist-info/METADATA"
        ).decode()
    assert f"Version: {protocol.KERNEL_VERSION}" in metadata
    assert "Requires-Dist: numpy" in metadata
