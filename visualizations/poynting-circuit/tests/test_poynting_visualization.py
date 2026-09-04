from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import pytest


def test_static_build_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.js").read_text(encoding="utf-8")

    for name in (
        "style.css",
        "physics.js",
        "app.js",
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
    ):
        assert (tmp_path / name).is_file()
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert 'id="show-particles" type="checkbox"' in html
    assert 'id="show-particles" type="checkbox" checked' not in html
    assert 'id="ac-controls" class="ac-controls" aria-hidden="true" inert' in html
    assert 'class="panel-section readout" aria-live=' not in html
    assert "controls.inert = !alternating" in app
    assert 'class="solve-button"' in html
    assert "const TRANSLATIONS" in app
    assert 'get("lang") === "ja"' in app
    assert "場を再計算" in app
    assert "Recompute fields" in app


def test_frame_height_contract_is_same_origin_and_content_based(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert 'type: "physics-atlas:frame-height"' in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "Math.max(contentBottom, document.body.getBoundingClientRect().height)" in html
    assert "main.scrollHeight" not in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html
    assert 'window.location.protocol === "file:"' not in html


def test_browser_physics_invariants() -> None:
    node = shutil.which("node")
    if node is None:
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.js")
    subprocess.run([node, "--test", str(test_file)], check=True)
