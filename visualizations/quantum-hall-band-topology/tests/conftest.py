from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest


def _load(name: str, filename: str):
    source = Path(__file__).resolve().parents[1] / filename
    spec = importlib.util.spec_from_file_location(name, source)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def physics():
    return _load("quantum_hall_band_topology_physics", "physics.py")


@pytest.fixture(scope="session")
def visualization():
    return _load("quantum_hall_band_topology_visualization", "visualization.py")
