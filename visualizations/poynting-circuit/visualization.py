"""Static browser application builder for the Poynting-vector circuit."""

from __future__ import annotations

import shutil
from pathlib import Path

from physics_atlas.assets import copy_mathjax_assets, copy_visualization_theme_assets

SOURCE_DIR = Path(__file__).resolve().parent
STATIC_DIR = SOURCE_DIR / "static"


def build(output_dir: Path) -> None:
    """Build the standalone bilingual application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    for name in ("index.html", "style.css", "physics.js", "app.js"):
        shutil.copy2(STATIC_DIR / name, output_dir / name)
