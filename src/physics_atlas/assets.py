"""Paths and staging helpers for shared, vendored browser assets."""

import shutil
from pathlib import Path

VENDOR_DIR = Path(__file__).resolve().parent / "vendor"
MATHJAX_SVG_PATH = VENDOR_DIR / "mathjax" / "tex-svg.js"
MATHJAX_LICENSE_PATH = VENDOR_DIR / "mathjax" / "LICENSE"
PLOTLY_GL3D_VERSION = "3.7.0"
PLOTLY_GL3D_ASSET_NAME = f"plotly-gl3d-{PLOTLY_GL3D_VERSION}.min.js"
PLOTLY_LICENSE_ASSET_NAME = f"plotly-{PLOTLY_GL3D_VERSION}-LICENSE.txt"
PLOTLY_GL3D_PATH = VENDOR_DIR / "plotly" / PLOTLY_GL3D_ASSET_NAME
PLOTLY_LICENSE_PATH = VENDOR_DIR / "plotly" / "LICENSE"
PLOTLY_GL3D_SHA256 = "fa6ebaf365ea5ad46a9843ea98fb2635c998558b9d876578aa12f765f823cc3d"


def copy_mathjax_assets(output_dir: Path) -> None:
    """Copy the local MathJax bundle and license into a static app directory."""

    shutil.copy2(MATHJAX_SVG_PATH, output_dir / "mathjax-tex-svg.js")
    shutil.copy2(MATHJAX_LICENSE_PATH, output_dir / "mathjax-LICENSE.txt")


def copy_shared_plotly_assets(docs_dir: Path) -> None:
    """Stage the pinned Plotly partial bundle once at the site root."""

    javascript_dir = docs_dir / "javascripts"
    javascript_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PLOTLY_GL3D_PATH, javascript_dir / PLOTLY_GL3D_ASSET_NAME)
    shutil.copy2(PLOTLY_LICENSE_PATH, javascript_dir / PLOTLY_LICENSE_ASSET_NAME)
