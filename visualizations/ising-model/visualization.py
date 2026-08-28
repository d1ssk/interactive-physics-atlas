"""Static browser application builder for the Ising model visualization."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np

from physics_atlas.assets import copy_mathjax_assets

from .physics import CRITICAL_TEMPERATURES, KERNEL_VERSION, exact_thermodynamics
from .protocol import LIMITS, PROTOCOL_VERSION

SOURCE_DIR = Path(__file__).resolve().parent
STATIC_DIR = SOURCE_DIR / "static"
RUNTIME_DIR = STATIC_DIR / "runtime"


def _curve_payload(dimension: int) -> dict[str, list[float]] | None:
    temperatures = np.linspace(0.5, 6.0, 280)
    result = exact_thermodynamics(dimension, temperatures)
    if result is None:
        return None
    return {key: [round(float(item), 8) for item in values] for key, values in result.items()}


def application_data() -> dict[str, object]:
    """Return compact immutable scientific data used by both locales."""

    return {
        "protocol": PROTOCOL_VERSION,
        "kernelVersion": KERNEL_VERSION,
        "snapshotSchema": "physics-atlas.ising-snapshot.v1",
        "limits": LIMITS,
        "criticalTemperatures": {str(key): value for key, value in CRITICAL_TEMPERATURES.items()},
        "criticalAboveFraction": 0.01,
        "thermodynamics": {
            "1": _curve_payload(1),
            "2": _curve_payload(2),
            "3": None,
        },
    }


def build(output_dir: Path) -> None:
    """Build the complete same-origin module-Worker application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    payload = json.dumps(application_data(), separators=(",", ":")).replace("</", "<\\/")
    html = (
        (STATIC_DIR / "index.html")
        .read_text(encoding="utf-8")
        .replace(
            "__APPLICATION_CSS__",
            (STATIC_DIR / "style.css").read_text(encoding="utf-8"),
        )
        .replace("__APPLICATION_DATA__", payload)
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")
    shutil.copy2(STATIC_DIR / "app-v1.mjs", output_dir / "app-v1.mjs")
    output_runtime = output_dir / "runtime"
    output_runtime.mkdir(parents=True, exist_ok=True)
    for source in sorted(RUNTIME_DIR.glob("*.mjs")):
        shutil.copy2(source, output_runtime / source.name)
