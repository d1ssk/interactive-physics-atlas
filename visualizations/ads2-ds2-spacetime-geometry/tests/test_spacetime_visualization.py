from __future__ import annotations

import re
from pathlib import Path

import numpy as np
import plotly.graph_objects as go


def test_penrose_diagrams_use_pan_and_encode_boundary_character(visualization):
    ads = visualization.penrose_figure("ads")
    ds = visualization.penrose_figure("ds")

    assert isinstance(ads, go.Figure)
    assert ads.layout.dragmode == "pan"
    assert ds.layout.dragmode == "pan"
    assert any(trace.name == "timelike conformal boundary" for trace in ads.data)
    assert any(trace.name == "spacelike conformal boundary" for trace in ds.data)
    assert any("static patch" in (trace.name or "") for trace in ds.data)


def test_coordinate_slider_payload_tracks_points_curves_and_frames(visualization):
    controls = visualization._coordinate_control_data("ads", "poincare", ("+0.0",))

    assert controls["points"].shape[-1] == 3
    assert len(controls["q1Curves"]) == len(controls["q2Values"])
    assert len(controls["q2Curves"]) == len(controls["q1Values"])
    assert controls["frames"]["+0.0"].shape[-3:] == (4, 2, 3)
    assert controls["q2Values"][controls["defaultQ2"]] == 1.0


def test_non_global_coordinate_curves_are_clipped_to_displayed_quadrics(visualization):
    cases = (
        ("ads", "poincare", 0, visualization.ADS_VISIBLE_X1_LIMIT),
        ("ds", "flat", 2, visualization.DS_VISIBLE_X0_LIMIT),
        ("ds", "static", 2, visualization.DS_VISIBLE_X0_LIMIT),
    )

    for kind, chart, displayed_axis, limit in cases:
        traces = (
            visualization._ads_chart_traces(chart)
            if kind == "ads"
            else visualization._ds_chart_traces(chart)
        )
        controls = visualization._coordinate_control_data(kind, chart, ("+0.0",))
        traces.extend(controls["q1Curves"])
        traces.extend(controls["q2Curves"])
        for trace in traces:
            coordinates = np.asarray((trace.x, trace.y, trace.z), dtype=float)[displayed_axis]
            finite = coordinates[np.isfinite(coordinates)]
            assert finite.size > 0
            assert np.max(np.abs(finite)) <= limit + 1e-9


def test_non_global_slider_points_stay_on_displayed_surface(visualization):
    cases = (
        ("ads", "poincare", 0, visualization.ADS_VISIBLE_X1_LIMIT),
        ("ds", "flat", 2, visualization.DS_VISIBLE_X0_LIMIT),
        ("ds", "static", 2, visualization.DS_VISIBLE_X0_LIMIT),
    )

    for kind, chart, displayed_axis, limit in cases:
        controls = visualization._coordinate_control_data(kind, chart, ("+0.0",))
        assert np.max(np.abs(controls["points"][..., displayed_axis])) <= limit + 1e-9


def test_static_build_contract(tmp_path, monkeypatch, visualization):
    minimal = {
        "surfaces": {},
        "charts": {},
        "geodesics": {},
        "coordinateControls": {},
        "boostKeys": [],
        "boostValues": [],
        "layouts": {},
        "penrose": {},
        "chartOptions": {},
        "notes": {},
    }
    monkeypatch.setattr(visualization, "_build_application_data", lambda: minimal)
    monkeypatch.setattr(visualization, "get_plotlyjs", lambda: "window.Plotly = {};")

    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert "__APPLICATION_DATA__" not in html
    assert "window.Plotly = {};" in html
    assert "ipywidgets" not in html.lower()
    assert "AdS₂ and dS₂" in html
    assert "physics-atlas:frame-height" in html
    assert 'id="q1" type="range"' in html
    assert 'id="boost" type="range"' in html
    assert 'title: "AdS₂ and dS₂ Spacetime Geometry"' in html
    assert 'title: "AdS₂ と dS₂ の時空幾何"' in html
    assert "Poincaré patch" in html
    assert "expanding flat patch" in html
    assert "static patch" in html


def test_embedding_disables_hover_spikes(visualization):
    layout = visualization._embedding_layout("ads")

    assert layout.hovermode is False
    assert layout.scene.xaxis.showspikes is False
    assert layout.scene.yaxis.showspikes is False
    assert layout.scene.zaxis.showspikes is False


def test_slider_render_preserves_user_selected_three_dimensional_camera(visualization):
    javascript = (visualization.SOURCE_DIR / "static" / "app.js").read_text(encoding="utf-8")

    assert "embeddingLayoutWithPreservedCamera" in javascript
    assert "savedEmbeddingCameras" in javascript
    assert 'plot.on("plotly_relayout"' in javascript
    assert 'event["scene.camera"]' in javascript
    assert "savedEmbeddingCameras.get(kind)" in javascript
    assert 'window.dispatchEvent(new Event("resize"))' not in javascript


def test_build_stages_mathjax_theme_and_same_origin_height_contract(
    tmp_path, monkeypatch, visualization
):
    monkeypatch.setattr(visualization, "_build_application_data", lambda: {})
    monkeypatch.setattr(visualization, "get_plotlyjs", lambda: "window.Plotly = {};")

    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert (tmp_path / "visualization-theme.css").is_file()
    assert (tmp_path / "visualization-theme.js").is_file()
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "mathjax-LICENSE.txt").is_file()
    assert 'src="https://' not in html
    assert "const LOCALE = new URLSearchParams(window.location.search)" in html
    assert 'data-i18n="boostLabel"' in html
    assert "MathJax.typesetClear(targets)" in html
    assert "MathJax.typesetPromise(targets)" in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "Math.max(contentBottom, document.body.getBoundingClientRect().height)" in html
    assert "main.scrollHeight" not in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html
    assert "PARENT_TARGET_ORIGIN,\n      );" in html


def test_bilingual_articles_share_equations_and_both_field_indexes_link_page():
    root = Path(__file__).resolve().parents[3]
    english = (root / "docs/relativity/ads2-ds2-spacetime-geometry/index.md").read_text(
        encoding="utf-8"
    )
    japanese = (root / "docs_ja/relativity/ads2-ds2-spacetime-geometry/index.md").read_text(
        encoding="utf-8"
    )
    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)

    assert english_math == japanese_math
    assert len(english_math) == 21
    for source, locale in ((english, "en"), (japanese, "ja")):
        assert f"app/index.html?lang={locale}" in source
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "height: 1900px" in source
        assert "min-height: 1250px" in source
        assert 'loading="eager"' in source
        assert "Checks performed" not in source
        assert "実施したチェック" not in source

    indexes = [
        (root / "docs/relativity/index.md").read_text(encoding="utf-8"),
        (root / "docs_ja/relativity/index.md").read_text(encoding="utf-8"),
        (root / "docs/string-theory/index.md").read_text(encoding="utf-8"),
        (root / "docs_ja/string-theory/index.md").read_text(encoding="utf-8"),
    ]
    assert "[AdS₂ and dS₂ Spacetime Geometry](ads2-ds2-spacetime-geometry/)" in indexes[0]
    assert "[AdS₂ と dS₂ の時空幾何](ads2-ds2-spacetime-geometry/)" in indexes[1]
    assert (
        "[AdS₂ and dS₂ Spacetime Geometry](../relativity/ads2-ds2-spacetime-geometry/)"
        in indexes[2]
    )
    assert "[AdS₂ と dS₂ の時空幾何](../relativity/ads2-ds2-spacetime-geometry/)" in indexes[3]
