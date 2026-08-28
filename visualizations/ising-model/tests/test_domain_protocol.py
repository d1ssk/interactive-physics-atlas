from __future__ import annotations

import pytest


def test_snapshot_metadata_round_trip(domain) -> None:
    payload = domain.snapshot_payload(
        dimension=2,
        size=32,
        temperature=2.4,
        sweeps=17,
        magnetization_total=64,
        energy_total=-1024,
        acceptance_rate=0.25,
        snapshot_id=8,
    )

    domain.validate_snapshot_metadata(payload)
    assert payload["shape"] == [32, 32]
    assert payload["magnetization"] == 0.0625
    assert payload["energyPerSpin"] == -1


@pytest.mark.parametrize(
    "field,value,message",
    [
        ("shape", [32], "shape"),
        ("magnetizationTotal", 1025, "magnetization"),
        ("energyTotal", -3000, "energy"),
        ("acceptanceRate", 1.1, "acceptance"),
    ],
)
def test_snapshot_validation_rejects_impossible_metadata(domain, field, value, message) -> None:
    payload = domain.snapshot_payload(
        dimension=2,
        size=32,
        temperature=2.4,
        sweeps=0,
        magnetization_total=0,
        energy_total=0,
        acceptance_rate=0,
        snapshot_id=0,
    )
    payload[field] = value

    with pytest.raises(ValueError, match=message):
        domain.validate_snapshot_metadata(payload)


@pytest.mark.parametrize("dimension,size", [(1, 128), (2, 96), (3, 20)])
def test_published_lattice_limits_accept_boundaries(protocol, dimension: int, size: int) -> None:
    protocol.validate_lattice(dimension, size)


@pytest.mark.parametrize("dimension,size", [(1, 1024), (2, 128), (3, 22)])
def test_published_lattice_limits_reject_larger_shapes(protocol, dimension: int, size: int) -> None:
    with pytest.raises(ValueError):
        protocol.validate_lattice(dimension, size)


def test_protocol_declares_bounded_transfers(protocol) -> None:
    assert protocol.LIMITS["maxSweepsPerBatch"] == 8
    assert protocol.LIMITS["maxDisplayHz"] == 20
    assert protocol.LIMITS["maxSnapshotBytes"] == 9216
    assert protocol.LIMITS["historyLength"] == 240


def test_python_kernel_rejects_runtime_version_mismatch(visualization_package) -> None:
    import importlib

    kernel_module = importlib.import_module(f"{visualization_package.__name__}.kernel")
    kernel = kernel_module.IsingKernel()
    request = {
        "protocol": "physics-atlas.ising.v1",
        "kernelVersion": "obsolete",
        "operation": "ising.initialize.v1",
        "requestId": 1,
        "generationId": 1,
        "input": {
            "dimension": 2,
            "size": 32,
            "temperature": 2.0,
            "seed": 1,
            "initialState": "random",
        },
    }

    with pytest.raises(ValueError, match="kernel version"):
        kernel.handle(request)


def initialization_request(**input_overrides):
    """Return a valid initialization request with selected input overrides."""

    inputs = {
        "dimension": 2,
        "size": 32,
        "temperature": 2.0,
        "seed": 1,
        "initialState": "random",
    }
    inputs.update(input_overrides)
    return {
        "protocol": "physics-atlas.ising.v1",
        "kernelVersion": "1.0.0",
        "operation": "ising.initialize.v1",
        "requestId": 1,
        "generationId": 1,
        "input": inputs,
    }


@pytest.mark.parametrize("temperature", [None, True, 0, -1, float("nan"), float("inf")])
def test_python_kernel_rejects_invalid_temperatures(visualization_package, temperature) -> None:
    import importlib

    kernel_module = importlib.import_module(f"{visualization_package.__name__}.kernel")

    with pytest.raises(ValueError, match="invalid temperature"):
        kernel_module.IsingKernel().handle(initialization_request(temperature=temperature))


@pytest.mark.parametrize("seed", [None, True, -1, 0x100000000])
def test_python_kernel_rejects_invalid_seeds(visualization_package, seed) -> None:
    import importlib

    kernel_module = importlib.import_module(f"{visualization_package.__name__}.kernel")

    with pytest.raises(ValueError, match="invalid seed"):
        kernel_module.IsingKernel().handle(initialization_request(seed=seed))


def test_python_kernel_validates_configured_temperature(visualization_package) -> None:
    import importlib

    kernel_module = importlib.import_module(f"{visualization_package.__name__}.kernel")
    kernel = kernel_module.IsingKernel()
    kernel.handle(initialization_request())
    configure = {
        "protocol": "physics-atlas.ising.v1",
        "kernelVersion": "1.0.0",
        "operation": "ising.configure.v1",
        "requestId": 2,
        "generationId": 1,
        "input": {"temperature": None},
    }

    with pytest.raises(ValueError, match="invalid temperature"):
        kernel.handle(configure)
