from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "mass_scale_physics", VISUALIZATION_DIR / "physics.py"
)
assert SPEC is not None and SPEC.loader is not None
physics = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = physics
SPEC.loader.exec_module(physics)
