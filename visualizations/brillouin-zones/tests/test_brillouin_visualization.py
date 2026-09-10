from __future__ import annotations

import json
import re
from pathlib import Path

from physics_atlas.assets import PLOTLY_GL3D_ASSET_NAME

ROOT = Path(__file__).resolve().parents[3]
STATIC_DIR = ROOT / "visualizations" / "brillouin-zones" / "static"


def test_build_stages_assets_and_generated_geometry(tmp_path, visualization):
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    for name in (
        "index.html",
        "style.css",
        "app.js",
        "data.js",
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
    ):
        assert (tmp_path / name).is_file()
    assert PLOTLY_GL3D_ASSET_NAME in html
    assert "__PLOTLY_ASSET__" not in html
    data_source = (tmp_path / "data.js").read_text(encoding="utf-8")
    payload = json.loads(data_source.removeprefix("window.BRILLOUIN_DATA = ").removesuffix(";\n"))
    assert set(payload) == {"sc", "bcc", "fcc", "hexagonal"}
    assert len(payload["fcc"]["zoneVertices"]) == 24


def test_application_is_bilingual_and_keeps_plot_internal_text_shared():
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    app = (STATIC_DIR / "app.js").read_text(encoding="utf-8")
    assert 'get("lang") === "ja"' in html
    assert 'get("lang") === "ja"' in app
    assert "Crystal lattices and first Brillouin zones" in app
    assert "結晶格子と第一 Brillouin zone" in app
    assert "ブリルアン" not in app
    assert "const plotNames" in app
    assert "Real space:" in app
    assert "Reciprocal:" in app
    assert 'dragmode: "turntable"' in app


def test_frame_height_and_shared_theme_contracts_are_present():
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    style = (STATIC_DIR / "style.css").read_text(encoding="utf-8")
    for expected in (
        'href="visualization-theme.css"',
        'src="visualization-theme.js"',
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
    assert "--zone-face" in style
    assert "background: var(--atlas-viz-background)" in style
    assert "background: var(--atlas-viz-panel)" in style


def test_bilingual_articles_are_aligned_and_embedded():
    english = (ROOT / "docs/condensed-matter-physics/brillouin-zones/index.md").read_text(
        encoding="utf-8"
    )
    japanese = (ROOT / "docs_ja/condensed-matter-physics/brillouin-zones/index.md").read_text(
        encoding="utf-8"
    )

    def extract_math(source):
        return re.findall(r"\$\$\s*(.*?)\s*\$\$", source, re.DOTALL)

    assert extract_math(english) == extract_math(japanese)
    assert 'src="app/index.html?lang=en"' in english
    assert 'src="app/index.html?lang=ja"' in japanese
    assert "ブリアン" not in japanese
    for source in (english, japanese):
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "min-height: 780px" in source


def test_condensed_matter_indexes_link_the_article():
    english = (ROOT / "docs/condensed-matter-physics/index.md").read_text(encoding="utf-8")
    japanese = (ROOT / "docs_ja/condensed-matter-physics/index.md").read_text(encoding="utf-8")
    assert "[Crystal Lattices and First Brillouin Zones](brillouin-zones/)" in english
    assert "[結晶格子と第一 Brillouin zone](brillouin-zones/)" in japanese
    assert "ブリルアン" not in japanese
