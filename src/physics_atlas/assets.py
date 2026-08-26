"""Paths and loaders for shared, vendored browser assets."""

from functools import lru_cache
from pathlib import Path

VENDOR_DIR = Path(__file__).resolve().parent / "vendor"
MATHJAX_SVG_PATH = VENDOR_DIR / "mathjax" / "tex-svg.js"
MATHJAX_LICENSE_PATH = VENDOR_DIR / "mathjax" / "LICENSE"


@lru_cache(maxsize=1)
def mathjax_svg_js() -> str:
    """Return the self-contained MathJax TeX-to-SVG browser bundle."""

    return MATHJAX_SVG_PATH.read_text(encoding="utf-8")
