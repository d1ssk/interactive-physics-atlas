from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import pytest


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
    assert "Torque-free rotation of an asymmetric rigid body" in app
    assert "非対称剛体の自由回転" in app
    assert 'momentumSphere: "角運動量球面"' in app
    assert 'data-i18n="axisOne"' in html
    assert 'data-i18n="momentumSphere"' in html
    assert 'id="torque-canvas"' in html
    assert 'id="torque-stop"' in html
    assert 'id="torque-reset"' in html
    assert 'data-i18n="handsOnTitle"' in html
    assert "applySpaceRotation" in app
    assert "rotationVectorBetween" in app
    assert "const GRIP_POINTS" in app
    assert "torqueModel.playing = false" in app
    assert 'handsOnTitle: "Give the body a spin"' in app
    assert 'handsOnTitle: "自分の手で剛体を回す"' in app
    assert 'torqueDragHint: "点をつかむ：振って離す · それ以外：視点移動"' in app
    assert 'releaseRule: "離した瞬間の角速度を引き継ぎます。重心は固定されています。"' in app
    assert "離した瞬間の角速度を保って自由回転へ移ります。" in app
    assert "不安定方向の回転でも、回転軸をaxis 2 に近くできれば、長時間定常を保てます。" in app
    assert "把持点" not in app
    assert "boldsymbol" not in html
    assert ".torque-view canvas" in style
    assert "--paper: var(--atlas-viz-background)" in style
    assert "Current components" not in html
    assert "現在の成分" not in app
    assert "border-radius: 5px" in style
    assert "gradient" not in style
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


def test_browser_physics_invariants() -> None:
    node = shutil.which("node")
    if node is None:
        if os.environ.get("CI"):
            pytest.fail("Node.js is required for browser physics tests in CI")
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run(
        [node, "--experimental-default-type=module", "--test", str(test_file)],
        check=True,
    )
