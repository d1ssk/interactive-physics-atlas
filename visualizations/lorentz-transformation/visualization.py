"""Static browser application builder for the Lorentz transformation visualization."""

from __future__ import annotations

import shutil
from pathlib import Path

from physics_atlas.assets import copy_mathjax_assets, copy_visualization_theme_assets

SOURCE_DIR = Path(__file__).resolve().parent
STATIC_DIR = SOURCE_DIR / "static"
RUNTIME_DIR = STATIC_DIR / "runtime"


def build(output_dir: Path) -> None:
    """Build the localized, same-origin static application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    html = (
        (STATIC_DIR / "index.html")
        .read_text(encoding="utf-8")
        .replace(
            "__APPLICATION_CSS__",
            (STATIC_DIR / "style.css").read_text(encoding="utf-8"),
        )
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")
    shutil.copy2(STATIC_DIR / "app-v1.mjs", output_dir / "app-v1.mjs")
    output_runtime = output_dir / "runtime"
    output_runtime.mkdir(parents=True, exist_ok=True)
    for source in sorted(RUNTIME_DIR.glob("*.mjs")):
        shutil.copy2(source, output_runtime / source.name)
