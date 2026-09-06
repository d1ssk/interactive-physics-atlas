import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
STATIC_DIR = ROOT / "visualizations" / "blackbody-photon-phase-space" / "static"


def test_build_stages_shared_assets_and_static_application(tmp_path, visualization):
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert 'href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'src="mathjax-tex-svg.js"' in html
    for name in (
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
        "style.css",
        "physics.js",
        "app.js",
    ):
        assert (tmp_path / name).is_file()


def test_ui_is_density_only_and_uses_requested_controls():
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")
    css = (STATIC_DIR / "style.css").read_text(encoding="utf-8")

    assert 'value="linear" selected' in html
    earth_temperature_slider = (
        'id="earth-temperature" type="range" min="230" max="280" step="1" value="255"'
    )
    assert earth_temperature_slider in html
    assert 'id="bond-albedo" type="range" min="0" max="0.6" step="0.01" value="0.30"' in html
    assert 'id="bond-albedo-output">0.30</output>' in html
    assert set(_select_values(html, "solar-magnification")) == {"1", "10"}
    assert 'id="representation"' not in html
    assert 'id="spin-toggle"' not in html
    assert 'id="enter-earth"' not in html
    assert "createBrightnessGeometry" not in source
    assert "setSpinning" not in source
    assert "enterEarthRadiation" not in source
    assert 'class="notes"' not in html
    assert "PHOTON PHASE SPACE" not in html
    assert "SPECTRAL SLICE" not in html
    assert "box-shadow" not in css
    assert 'byId("bond-albedo").addEventListener("input", updateLabelsAndDiagnostics)' in source
    assert "absorbedEnergyDensityInSolidAngle" in source


def test_desktop_viewer_drag_uses_screen_relative_rotation_without_euler_angle_poles():
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")
    css = (STATIC_DIR / "style.css").read_text(encoding="utf-8")

    assert "state.yaw" not in source
    assert "state.pitch" not in source
    assert "rotationAroundScreenY(deltaX * DRAG_ROTATION_SPEED)" in source
    assert "rotationAroundScreenX(deltaY * DRAG_ROTATION_SPEED)" in source
    assert "multiplyRotations(horizontalRotation, state.viewRotation)" in source
    assert "clamp(500px, 58vw, 680px)" in css
    assert "Photon number per unit solid angle" in source
    assert "単位立体角あたりの光子数" in source
    assert "Frequency [Hz]" in source
    assert "dN/(dV dΩ dlnν) [m⁻³ sr⁻¹]" in source
    assert 't("spectrumAxisFrequency")' in source
    assert 't("spectrumAxisDensity")' in source
    assert "Photon number by direction" not in html


def test_application_localizes_all_reader_facing_ui_and_reports_frame_height():
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")

    assert "Blackbody photons in" in source
    assert "黒体光子の" in source
    assert 'data-i18n-aria-label="phaseSpaceLabel"' in html
    assert 'type: "physics-atlas:frame-height"' in html
    assert "PARENT_TARGET_ORIGIN = window.location.origin" in html
    message = (
        'postMessage(\n          {type: "physics-atlas:frame-height", height: frameHeight},'
        "\n          PARENT_TARGET_ORIGIN"
    )
    assert message in html
    assert "main.scrollHeight" not in html
    assert 'radiusLinearCaption: "リニア目盛り"' in source
    assert 'radiusLogCaption: "対数目盛り"' in source
    assert 't("radiusLinearCaption")' in source
    assert "nearest.point !== state.hoveredPoint" in source
    assert "if (typesetElements([tooltip])) state.hoveredPoint = nearest.point" in source
    assert "state.hoveredPoint = null" in source


def test_radial_ranges_keep_the_high_frequency_cloud_at_similar_outer_size():
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")

    assert "const FREQUENCY_MAX = 1.5e15" in source
    assert "linear: [0, 300e12, 600e12, 900e12, 1.2e15, 1.5e15]" in source
    assert "log: [1e12, 10e12, 100e12, 1e15, 1.5e15]" in source
    assert "Math.max(0, Math.min(1, fraction))" in source


def test_bilingual_articles_keep_equations_and_embeds_aligned():
    english_path = (
        ROOT / "docs" / "statistical-physics" / "blackbody-photon-phase-space" / "index.md"
    )
    japanese_path = (
        ROOT / "docs_ja" / "statistical-physics" / "blackbody-photon-phase-space" / "index.md"
    )
    english = english_path.read_text(encoding="utf-8")
    japanese = japanese_path.read_text(encoding="utf-8")

    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)
    assert english_math == japanese_math
    assert len(english_math) == 10
    assert 'src="app/index.html?lang=en"' in english
    assert 'src="app/index.html?lang=ja"' in japanese
    for source in (english, japanese):
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "exergy" in source.lower() or "エクセルギー" in source
        assert "[^energy-imbalance]" in source


def test_statistical_physics_indexes_link_the_bilingual_article():
    english = (ROOT / "docs" / "statistical-physics" / "index.md").read_text(encoding="utf-8")
    japanese = (ROOT / "docs_ja" / "statistical-physics" / "index.md").read_text(encoding="utf-8")

    english_link = "[Phase Space of Blackbody Radiation](blackbody-photon-phase-space/)"
    assert english_link in english
    assert "[黒体放射の位相空間](blackbody-photon-phase-space/)" in japanese
    assert ")**<br>\n  " in english
    assert ")**<br>\n  " in japanese
    assert "blackbody-photon-phase-space" not in (
        ROOT / "docs" / "thermodynamics" / "index.md"
    ).read_text(encoding="utf-8")
    assert "blackbody-photon-phase-space" not in (
        ROOT / "docs_ja" / "thermodynamics" / "index.md"
    ).read_text(encoding="utf-8")


def test_browser_physics_invariants():
    node = shutil.which("node")
    if node is None:
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.js")
    subprocess.run([node, "--test", str(test_file)], check=True)


def _select_values(html: str, select_id: str) -> list[str]:
    start = html.index(f'id="{select_id}"')
    end = html.index("</select>", start)
    fragment = html[start:end]
    values = []
    marker = 'value="'
    cursor = 0
    while (position := fragment.find(marker, cursor)) >= 0:
        position += len(marker)
        closing = fragment.index('"', position)
        values.append(fragment[position:closing])
        cursor = closing + 1
    return values
