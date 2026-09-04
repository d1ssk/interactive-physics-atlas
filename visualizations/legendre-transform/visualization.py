"""Build the bilingual static Legendre-transform application."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from physics_atlas.assets import (
    PLOTLY_GL3D_ASSET_NAME,
    copy_mathjax_assets,
    copy_visualization_theme_assets,
)

from .physics import FUNCTIONS, sample_transform

SOURCE_DIR = Path(__file__).resolve().parent
STATIC_DIR = SOURCE_DIR / "static"
AXIS_LIMIT = 4.0


def application_data() -> dict[str, object]:
    """Return locale-independent curves and localized function names."""

    functions: dict[str, object] = {}
    for key, function in FUNCTIONS.items():
        sampled = sample_transform(function)
        contact_f = function.value(sampled["contact_x"])
        first_selectable = abs(sampled["contact_x"]) <= AXIS_LIMIT
        second_selectable = abs(sampled["p"]) <= AXIS_LIMIT
        functions[key] = {
            "names": {"en": function.name, "ja": function.name_ja},
            "formula": function.formula_latex,
            "x": sampled["x"].tolist(),
            "f": sampled["f"].tolist(),
            "firstContacts": {
                "x": sampled["contact_x"][first_selectable].tolist(),
                "f": contact_f[first_selectable].tolist(),
                "p": sampled["p"][first_selectable].tolist(),
                "fStar": sampled["f_star"][first_selectable].tolist(),
            },
            "secondContacts": {
                "x": sampled["contact_x"][second_selectable].tolist(),
                "f": contact_f[second_selectable].tolist(),
                "p": sampled["p"][second_selectable].tolist(),
                "fStar": sampled["f_star"][second_selectable].tolist(),
            },
            "p": sampled["p"].tolist(),
            "fStar": sampled["f_star"].tolist(),
            "doubleX": sampled["double_x"].tolist(),
            "fDouble": sampled["f_double"].tolist(),
            "axisLimit": AXIS_LIMIT,
        }
    return {"schema": 1, "functions": functions}


def build(output_dir: Path) -> None:
    """Build the standalone browser application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    payload = json.dumps(application_data(), ensure_ascii=False, separators=(",", ":")).replace(
        "</", "<\\/"
    )
    html = (
        (STATIC_DIR / "index.html")
        .read_text(encoding="utf-8")
        .replace("__PLOTLY_ASSET__", PLOTLY_GL3D_ASSET_NAME)
        .replace("__APPLICATION_DATA__", payload)
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")
    for name in ("style.css", "app.js"):
        shutil.copy2(STATIC_DIR / name, output_dir / name)
