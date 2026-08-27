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
PYODIDE_VERSION = "314.0.6"
PYODIDE_PYTHON_VERSION = "3.14.2"
PYODIDE_NUMPY_VERSION = "2.4.6"
PYODIDE_VENDOR_DIR = VENDOR_DIR / "pyodide"
PYODIDE_NUMPY_WHEEL = "numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl"
PYODIDE_RUNTIME_SHA256 = {
    "pyodide.mjs": "69e3f6ccec3e14b465df60be577ca62f536251406b9a00cce019eac5252a2495",
    "pyodide.asm.mjs": "2ac5eba365ec12839c75c03b39b3be1dd63b798852cc460b014b52238be042f7",
    "pyodide.asm.wasm": "3a0a00dfeaa348ac20f9ef09904233d32d33f644339662d4af368f8a2010f37a",
    "pyodide-lock.json": "3fdaef09e9e365c85e002737720f8d0ab8f278c1c244a2dde6a37663cf488ad4",
    "python_stdlib.zip": "80c5be6babfe03297069703410c3c29404dcf2525d2b128746bae5536f94831f",
    PYODIDE_NUMPY_WHEEL: "32959d4137cec8143d75016d029281df3d2e80a232896ed903c2b59e1c44ee9f",
}


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


def copy_pyodide_runtime_assets(output_dir: Path) -> None:
    """Copy only the pinned Pyodide core, NumPy wheel, and provenance files."""

    output_dir.mkdir(parents=True, exist_ok=True)
    for name in (*PYODIDE_RUNTIME_SHA256, "LICENSE", "NUMPY-LICENSE.txt"):
        shutil.copy2(PYODIDE_VENDOR_DIR / name, output_dir / name)
