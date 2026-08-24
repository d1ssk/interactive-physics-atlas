from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import ModuleType

import pytest

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]
PACKAGE_NAME = "_lie_roots_weights_products_tests"


def _load_module(name: str):
    package = sys.modules.get(PACKAGE_NAME)
    if package is None:
        package = ModuleType(PACKAGE_NAME)
        package.__path__ = [str(VISUALIZATION_DIR)]  # type: ignore[attr-defined]
        sys.modules[PACKAGE_NAME] = package
    module_name = f"{PACKAGE_NAME}.{name}"
    spec = importlib.util.spec_from_file_location(module_name, VISUALIZATION_DIR / f"{name}.py")
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {name}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def physics():
    return _load_module("physics")


@pytest.fixture(scope="session")
def visualization(physics):
    return _load_module("visualization")
