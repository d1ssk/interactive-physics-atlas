from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def physics():
    source = Path(__file__).resolve().parents[1] / "physics.py"
    spec = importlib.util.spec_from_file_location("material_fields_physics", source)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def visualization():
    source = Path(__file__).resolve().parents[1] / "visualization.py"
    spec = importlib.util.spec_from_file_location("material_fields_visualization", source)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module
