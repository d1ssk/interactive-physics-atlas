"""Static embedded-app builder for browser-computed scalar-vacuum samples."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from physics_atlas.assets import (
    PLOTLY_GL3D_ASSET_NAME,
    copy_mathjax_assets,
    copy_visualization_theme_assets,
)

from .runtime_build import build_runtime_assets, runtime_manifest

SOURCE_DIR = Path(__file__).resolve().parent
STATIC_DIR = SOURCE_DIR / "static"


def build(output_dir: Path) -> None:
    """Build the HTML shell, renderer, and lazy self-hosted Python runtime."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    build_runtime_assets(output_dir, SOURCE_DIR)
    for name in ("style.css", "app.mjs"):
        shutil.copy2(STATIC_DIR / name, output_dir / name)
    manifest = json.dumps(runtime_manifest(), separators=(",", ":")).replace("</", "<\\/")
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    html = html.replace("__PLOTLY_ASSET__", PLOTLY_GL3D_ASSET_NAME)
    html = html.replace("__RUNTIME_MANIFEST__", manifest)
    if "__PLOTLY_ASSET__" in html or "__RUNTIME_MANIFEST__" in html:
        raise ValueError("unresolved scalar-vacuum application placeholder")
    (output_dir / "index.html").write_text(html, encoding="utf-8")
