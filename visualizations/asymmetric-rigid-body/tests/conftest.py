from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest


def _load(name: str, filename: str):
    source = Path(__file__).parents[1] / filename
    spec = importlib.util.spec_from_file_location(name, source)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def physics():
    return _load("asymmetric_rigid_body_physics", "physics.py")


@pytest.fixture(scope="session")
def visualization():
    return _load("asymmetric_rigid_body_visualization", "visualization.py")
