from __future__ import annotations

import math
import os
import re
import shutil
import subprocess
from pathlib import Path

import pytest


def test_vacuum_has_no_susceptibility(physics) -> None:
    assert physics.electric_susceptibility(1.0) == 0.0
    assert physics.magnetic_susceptibility(1.0) == 0.0


def test_dielectric_cylinder_limit_and_surface_charge(physics) -> None:
    assert physics.dielectric_cylinder_internal_field(1.0, 3.0) == pytest.approx(3.0)
    assert physics.dielectric_cylinder_surface_charge_amplitude(1.0, 3.0) == 0.0
    assert physics.dielectric_cylinder_internal_field(1e8, 1.0) < 3e-8
    expected = physics.VACUUM_PERMITTIVITY * 3 * 2 / 5
    assert physics.dielectric_cylinder_surface_charge_amplitude(4.0, 1.0) == pytest.approx(expected)


def test_magnetic_cylinder_response_has_expected_limits(physics) -> None:
    assert physics.magnetic_cylinder_internal_flux_density(1.0, 2.0) == pytest.approx(2.0)
    assert physics.magnetic_cylinder_internal_flux_density(1e8, 2.0) == pytest.approx(4.0)
    assert physics.magnetic_cylinder_internal_flux_density(1e-8, 2.0) == pytest.approx(
        0.0, abs=5e-8
    )


def test_invalid_relative_properties_are_rejected(physics) -> None:
    for value in (0.0, -1.0, math.inf, math.nan):
        with pytest.raises(ValueError):
            physics.electric_susceptibility(value)
        with pytest.raises(ValueError):
            physics.magnetic_susceptibility(value)


def test_browser_solver_invariants() -> None:
    node = shutil.which("node")
    if node is None:
        if os.environ.get("CI"):
            pytest.fail("Node.js is required for browser physics tests in CI")
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_static_build_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.mjs").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")
    for name in (
        "style.css",
        "physics.mjs",
        "app.mjs",
        "solver-worker.mjs",
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
    ):
        assert (tmp_path / name).is_file()
    assert 'href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert 'src="app.mjs"' in html
    assert 'from "./physics.mjs"' in app
    assert "const TRANSLATIONS" in app
    assert 'get("lang") === "ja"' in app
    assert "Electric field" in app
    assert "電場" in app
    assert 'title: "場と物質の応答"' in app
    assert 'magneticMaterialNote: "線形・等方な磁性体として扱います。"' in app
    assert 'iterations: "回"' in app
    assert 'workerError: "計算ワーカーエラー"' in app
    assert (
        "JavaScript is required for this visualization. / この可視化にはJavaScriptが必要です。"
        in html
    )
    physics_source = (tmp_path / "physics.mjs").read_text(encoding="utf-8")
    assert "LOCAL_BOUNDARY_RING_CACHE" in physics_source
    assert "--paper: var(--atlas-viz-background)" in style
    assert "grid-template-columns: 240px minmax(0, 1fr)" in style
    assert ".inspector { grid-column: 1; grid-row: 2" in style
    assert ".display-panel" in style
    assert "grid-column: 1 / -1" in style
    assert "grid-template-rows: auto 380px auto" in style
    assert "--accent: var(--atlas-viz-accent)" in style
    assert "grid-readout" not in html
    assert html.index('id="surface-layer-name"') < html.index('class="density-control"')


def test_frame_height_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    for expected in (
        'type: "physics-atlas:frame-height"',
        "const PARENT_TARGET_ORIGIN = window.location.origin",
        "event.source === window.parent",
        "event.origin === PARENT_TARGET_ORIGIN",
        'window.frameElement.style.minHeight = "0"',
        "Math.max(contentBottom, document.body.getBoundingClientRect().height)",
        "observer.observe(document.body)",
        "if (main) observer.observe(main)",
        'window.addEventListener("pagehide", () => observer.disconnect()',
    ):
        assert expected in html


def test_bilingual_articles_are_aligned_and_embedded() -> None:
    root = Path(__file__).resolve().parents[3]
    english = (root / "docs/electromagnetism/material-fields/index.md").read_text(encoding="utf-8")
    japanese = (root / "docs_ja/electromagnetism/material-fields/index.md").read_text(
        encoding="utf-8"
    )

    def extract_math(source: str) -> list[str]:
        return re.findall(r"\$\$\s*(.*?)\s*\$\$", source, re.DOTALL)

    assert extract_math(english) == extract_math(japanese)
    assert "app/index.html?lang=en" in english
    assert "app/index.html?lang=ja" in japanese
    for source in (english, japanese):
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "min-height: 780px" in source
        assert "Workbench" not in source

    english_index = (root / "docs/electromagnetism/index.md").read_text(encoding="utf-8")
    japanese_index = (root / "docs_ja/electromagnetism/index.md").read_text(encoding="utf-8")
    assert "[Electric and Magnetic Response of Materials](material-fields/)" in english_index
    assert "[物質の電場・磁場応答](material-fields/)" in japanese_index
