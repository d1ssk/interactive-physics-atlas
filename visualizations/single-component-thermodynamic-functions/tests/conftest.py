from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest


@pytest.fixture
def physics():
    source = Path(__file__).parents[1] / "physics.py"
    spec = importlib.util.spec_from_file_location("thermodynamic_functions_physics", source)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def visualization():
    source = Path(__file__).parents[1] / "visualization.py"
    spec = importlib.util.spec_from_file_location("thermodynamic_functions_visualization", source)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module
