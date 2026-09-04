from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]


def _load(name: str):
    spec = importlib.util.spec_from_file_location(name, VISUALIZATION_DIR / f"{name}.py")
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def physics():
    return _load("physics")


@pytest.fixture(scope="session")
def visualization():
    physics_module = _load("physics")
    package_name = "legendre_transform_test_package"
    package_spec = importlib.util.spec_from_loader(package_name, loader=None, is_package=True)
    assert package_spec is not None
    package = importlib.util.module_from_spec(package_spec)
    package.__path__ = [str(VISUALIZATION_DIR)]
    sys.modules[package_name] = package
    sys.modules[f"{package_name}.physics"] = physics_module
    spec = importlib.util.spec_from_file_location(
        f"{package_name}.visualization",
        VISUALIZATION_DIR / "visualization.py",
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module
