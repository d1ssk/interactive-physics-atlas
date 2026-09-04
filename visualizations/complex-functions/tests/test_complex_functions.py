from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest


def test_continued_square_root_changes_sign_after_one_circuit(physics):
    angles = np.linspace(0.0, 2.0 * np.pi, 513)
    values = physics.continued_square_root(np.exp(1j * angles))

    assert np.allclose(values[0], 1.0)
    assert np.allclose(values[-1], -1.0)


def test_residue_contour_integral_is_two_pi_i(physics):
    angles = np.linspace(0.0, 2.0 * np.pi, 4097)
    circle = np.exp(1j * angles)
    integral = physics.contour_integral(circle, lambda z: 1.0 / z)

    assert np.isclose(integral.real, 0.0, atol=1e-10)
    assert np.isclose(integral.imag, 2.0 * np.pi, rtol=1e-6)


def test_static_build_contract(tmp_path, visualization):
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.mjs").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")

    for name in (
        "index.html",
        "style.css",
        "physics.mjs",
        "app.mjs",
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
    ):
        assert (tmp_path / name).is_file()
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert 'src="app.mjs"' in html
    assert 'from "./physics.mjs"' in app
    assert "const STRINGS" in app
    assert "Complex Function Explorer" in app
    assert "複素関数エクスプローラ" in app
    assert 'rel="icon" href="../../assets/images/favicon.svg"' in html
    assert "physics-atlas:frame-height" not in html
    assert "linear-gradient" not in style.replace(
        "linear-gradient(90deg, #d94343, #d3d83b, #3fc977, #3eb8d0, #5962d5, #bd43c8, #d94343)",
        "",
    ).replace("linear-gradient(90deg, #155887, #f2eee2 50%, #c32f50)", "")
    assert ".integral-primary" in style
    assert "height: 54px" in style
    assert "grid-template-columns: minmax(0, 840px) 340px" in style
    assert "width: min(100%, 720px)" in style
    assert ".diagnostics {\n    display: contents;" in style
    assert ".probe-card {\n    order: 1;" in style
    assert ".plot-card {\n    order: 2;" in style
    assert ".integral-card {\n    order: 3;" in style


def test_browser_physics_invariants():
    node = shutil.which("node")
    if node is None:
        if os.environ.get("CI"):
            pytest.fail("Node.js is required for browser physics tests in CI")
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)
