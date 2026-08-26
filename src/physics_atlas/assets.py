"""Paths and staging helpers for shared, vendored browser assets."""

import shutil
from pathlib import Path

VENDOR_DIR = Path(__file__).resolve().parent / "vendor"
MATHJAX_SVG_PATH = VENDOR_DIR / "mathjax" / "tex-svg.js"
MATHJAX_LICENSE_PATH = VENDOR_DIR / "mathjax" / "LICENSE"


def copy_mathjax_assets(output_dir: Path) -> None:
    """Copy the local MathJax bundle and license into a static app directory."""

    shutil.copy2(MATHJAX_SVG_PATH, output_dir / "mathjax-tex-svg.js")
    shutil.copy2(MATHJAX_LICENSE_PATH, output_dir / "mathjax-LICENSE.txt")
