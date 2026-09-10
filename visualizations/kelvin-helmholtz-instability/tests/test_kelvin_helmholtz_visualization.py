from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def test_static_build_stages_bilingual_browser_application(tmp_path, visualization) -> None:
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    application = (tmp_path / "app.mjs").read_text(encoding="utf-8")
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
    assert 'type="module" src="app.mjs"' in html
    assert 'from "./physics.mjs"' in application
    assert "const TRANSLATIONS" in application
    assert 'get("lang") === "ja"' in application
    assert 'title: "Kelvin–Helmholtz instability"' in application
    assert 'title: "Kelvin–Helmholtz 不安定性"' in application
    assert 'growthChartHeading: "成長率"' in application
    assert 'growthChartTitle: "波数に対する Kelvin–Helmholtz 不安定性の線形成長率"' in application
    assert 'data-role="play-label" data-i18n="pause"' in html
    assert 'data-i18n="timeLabel"' in html
    assert 'data-i18n-aria-label="plotLegendLabel"' in html
    assert 'data-i18n="growthChartHeading"' in html
    assert 'data-i18n="growthChartTitle"' in html
    assert 'data-i18n="growthChartDescription"' in html
    assert 't("growthChartTitle")' in application
    assert 't("growthChartDescription")' in application
    # Plot-internal annotations and legend entries stay English in both locales.
    assert "TOP FLUID →" in html
    assert "optional tracer" in html
    assert "DIMENSIONLESS INTERFACE MODEL" not in application
    assert "無次元界面モデル" not in application
    assert 'modeSummary(state.parameters).status !== "unstable"' in application
    assert "isUnstable ? null : 0" in application
    assert "--paper: var(--atlas-viz-background)" in style
    assert "--card: var(--atlas-viz-panel)" in style
    assert "--line: var(--atlas-viz-border)" in style
    assert '.transport button,\n.particle-toggle {\n  font-family: "Atlas Source Serif 4"' in style
    assert 'html[lang="ja"] .transport button' in style
    assert 'font-family: "Atlas Japanese System", sans-serif' in style
    assert "http://" not in html
    assert "https://" not in html


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
        return
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_articles_put_observation_before_visualization_and_theory() -> None:
    english_path = ROOT / "docs/fluid-mechanics/kelvin-helmholtz-instability/index.md"
    japanese_path = ROOT / "docs_ja/fluid-mechanics/kelvin-helmholtz-instability/index.md"
    english = english_path.read_text(encoding="utf-8")
    japanese = japanese_path.read_text(encoding="utf-8")

    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)
    localized_text = re.compile(r"\\text\{[^{}]*\}")
    english_math_structure = [
        localized_text.sub(r"\\text{localized}", block) for block in english_math
    ]
    japanese_math_structure = [
        localized_text.sub(r"\\text{localized}", block) for block in japanese_math
    ]
    assert english_math_structure == japanese_math_structure
    assert len(english_math) == 29

    for source, locale, theory_heading in (
        (english, "en", "## Why does a small wave grow?"),
        (japanese, "ja", "## なぜ小さな波が成長するのか"),
    ):
        image_position = source.index("kelvin-helmholtz-hartford-clouds.jpg")
        saturn_position = source.index("kelvin-helmholtz-saturn.jpg")
        iframe_position = source.index("<iframe")
        theory_position = source.index(theory_heading)
        assert image_position < saturn_position < iframe_position < theory_position
        assert f"app/index.html?lang={locale}" in source
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert 'loading="eager"' in source
        assert "NASA/JPL/Space Science Institute" in source
        assert "https://science.nasa.gov/photojournal/rough-around-the-edges/" in source
        assert "Paul Danese" in source
        assert "https://creativecommons.org/publicdomain/zero/1.0/" in source
        assert "phenomenon-photo-grid" in source


def test_photo_assets_and_fluid_mechanics_indexes() -> None:
    for filename in (
        "kelvin-helmholtz-hartford-clouds.jpg",
        "kelvin-helmholtz-saturn.jpg",
    ):
        photo = ROOT / "docs/assets/images" / filename
        assert photo.read_bytes().startswith(b"\xff\xd8\xff")

    english_index = (ROOT / "docs/fluid-mechanics/index.md").read_text(encoding="utf-8")
    japanese_index = (ROOT / "docs_ja/fluid-mechanics/index.md").read_text(encoding="utf-8")
    assert "[Kelvin–Helmholtz Instability](kelvin-helmholtz-instability/)" in english_index
    assert "[Kelvin–Helmholtz 不安定性](kelvin-helmholtz-instability/)" in japanese_index
    assert ")**<br>\n  Interface roll-up" in english_index
    assert ")**<br>\n  二流体せん断層" in japanese_index
