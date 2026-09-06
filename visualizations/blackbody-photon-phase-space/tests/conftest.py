from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]


def _load(module_name: str, file_name: str):
    spec = importlib.util.spec_from_file_location(module_name, VISUALIZATION_DIR / file_name)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def physics():
    return _load("blackbody_photon_phase_space_physics", "physics.py")


@pytest.fixture(scope="session")
def visualization():
    return _load("blackbody_photon_phase_space_visualization", "visualization.py")
