from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import ModuleType

import pytest

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]
PACKAGE_NAME = "_ising_model_test_package"


@pytest.fixture(scope="session")
def visualization_package() -> ModuleType:
    package = ModuleType(PACKAGE_NAME)
    package.__path__ = [str(VISUALIZATION_DIR)]  # type: ignore[attr-defined]
    sys.modules[PACKAGE_NAME] = package
    return package


def _load_module(name: str, visualization_package: ModuleType) -> ModuleType:
    qualified = f"{PACKAGE_NAME}.{name}"
    source = VISUALIZATION_DIR / f"{name}.py"
    spec = importlib.util.spec_from_file_location(qualified, source)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[qualified] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def physics(visualization_package: ModuleType) -> ModuleType:
    return _load_module("physics", visualization_package)


@pytest.fixture(scope="session")
def domain(visualization_package: ModuleType) -> ModuleType:
    return _load_module("domain", visualization_package)


@pytest.fixture(scope="session")
def protocol(visualization_package: ModuleType) -> ModuleType:
    return _load_module("protocol", visualization_package)


@pytest.fixture(scope="session")
def visualization(visualization_package: ModuleType) -> ModuleType:
    _load_module("physics", visualization_package)
    _load_module("protocol", visualization_package)
    return _load_module("visualization", visualization_package)
