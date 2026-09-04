from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

import pytest


def css_declarations(source: str, selector: str) -> dict[str, str]:
    """Parse the declarations from one simple CSS selector."""

    match = re.search(rf"(?m)^{re.escape(selector)}\s*\{{(?P<body>[^}}]*)\}}", source)
    assert match is not None
    return {
        name.strip(): value.strip()
        for declaration in match.group("body").split(";")
        if ":" in declaration
        for name, value in [declaration.split(":", 1)]
    }


def test_static_build_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.js").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")

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
    assert 'src="app.js"' in html
    assert 'from "./physics.js"' in app
    assert "const TRANSLATIONS" in app
    assert 'get("lang") === "ja"' in app
    assert "運動する電荷の遅延場と電磁場放射" in app
    assert "Retarded fields and radiation from a moving charge" in app
    assert "#247a58" in app
    assert "#c76520" in app
    assert "--paper: var(--atlas-viz-background)" in style
    page_header = css_declarations(style, ".page-header")
    assert "grid-template-columns" not in page_header
    assert "width" not in page_header
    assert "grid-template-columns: 280px 1fr" not in style
    for selector in (".viewer-status", ".drag-hint", ".readout dt"):
        assert css_declarations(style, selector)["color"] == "var(--muted)"
    assert "state.history = [];" in app
    assert "t: state.time - MAX_HISTORY_SECONDS" not in app
    assert "https://" not in html
    assert "http://" not in html


def test_frame_height_contract_is_same_origin_and_content_based(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert 'type: "physics-atlas:frame-height"' in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "Math.max(contentBottom, document.body.getBoundingClientRect().height)" in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html
    assert 'window.location.protocol === "file:"' not in html


def test_browser_physics_invariants() -> None:
    node = shutil.which("node")
    if node is None:
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run(
        [node, "--experimental-default-type=module", "--test", str(test_file)],
        check=True,
    )
