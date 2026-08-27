#!/usr/bin/env python3
"""Build the complete production site."""

import shutil
import subprocess
from pathlib import Path

from build_visualizations import build_all
from validate_metadata import validate_all

from physics_atlas.assets import (
    MATHJAX_LICENSE_PATH,
    MATHJAX_SVG_PATH,
    PLOTLY_GL3D_ASSET_NAME,
    PLOTLY_LICENSE_ASSET_NAME,
    copy_shared_plotly_assets,
)

ROOT = Path(__file__).resolve().parents[1]
ENGLISH_DOCS_DIR = ROOT / "docs"
JAPANESE_DOCS_DIR = ROOT / "docs_ja"
ENGLISH_BUILD_DOCS_DIR = ROOT / "build" / "docs-en"
JAPANESE_BUILD_DOCS_DIR = ROOT / "build" / "docs-ja"


def stage_english_docs() -> Path:
    """Copy public English sources and shared assets without developer instructions."""

    if ENGLISH_BUILD_DOCS_DIR.exists():
        shutil.rmtree(ENGLISH_BUILD_DOCS_DIR)
    shutil.copytree(
        ENGLISH_DOCS_DIR,
        ENGLISH_BUILD_DOCS_DIR,
        ignore=shutil.ignore_patterns("AGENTS.md", "app"),
    )
    javascript_dir = ENGLISH_BUILD_DOCS_DIR / "javascripts"
    javascript_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(MATHJAX_SVG_PATH, javascript_dir / "mathjax-tex-svg.js")
    shutil.copy2(MATHJAX_LICENSE_PATH, javascript_dir / "mathjax-LICENSE.txt")
    copy_shared_plotly_assets(ENGLISH_BUILD_DOCS_DIR)
    return ENGLISH_BUILD_DOCS_DIR


def stage_japanese_docs() -> Path:
    """Combine shared English-site assets with the complete Japanese page tree."""

    if JAPANESE_BUILD_DOCS_DIR.exists():
        shutil.rmtree(JAPANESE_BUILD_DOCS_DIR)
    shutil.copytree(ENGLISH_BUILD_DOCS_DIR, JAPANESE_BUILD_DOCS_DIR)
    shutil.copytree(JAPANESE_DOCS_DIR, JAPANESE_BUILD_DOCS_DIR, dirs_exist_ok=True)
    javascript_dir = JAPANESE_BUILD_DOCS_DIR / "javascripts"
    for shared_asset in (PLOTLY_GL3D_ASSET_NAME, PLOTLY_LICENSE_ASSET_NAME):
        (javascript_dir / shared_asset).unlink()
    return JAPANESE_BUILD_DOCS_DIR


def main() -> int:
    directories = validate_all()
    print(f"Metadata valid ({len(directories)} visualization(s)).")
    stage_english_docs()
    outputs = build_all(directories, ENGLISH_BUILD_DOCS_DIR)
    print(f"Visualization build complete ({len(outputs)} visualization(s)).")
    stage_japanese_docs()
    subprocess.run(["zensical", "build", "--clean"], cwd=ROOT, check=True)
    subprocess.run(
        ["zensical", "build", "--config-file", "zensical.ja.toml", "--clean"],
        cwd=ROOT,
        check=True,
    )
    print("Bilingual production site built at site/ (English root, Japanese under ja/).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
