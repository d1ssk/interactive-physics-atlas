from __future__ import annotations

import re
from pathlib import Path

import plotly.graph_objects as go


def test_standard_2d_figures_start_in_pan_mode(visualization):
    local = visualization.local_map_figure("mixed")
    witt = visualization.witt_flow_figure(1)

    assert isinstance(local, go.Figure)
    assert local.layout.dragmode == "pan"
    assert witt.layout.dragmode == "pan"


def test_slider_parameters_change_precomputed_figures(visualization):
    weak_mixing = visualization.local_map_figure("mixed", mixing=0.1)
    strong_mixing = visualization.local_map_figure("mixed", mixing=0.7)
    backward_flow = visualization.witt_flow_figure(1, epsilon=-0.2)
    forward_flow = visualization.witt_flow_figure(1, epsilon=0.2)

    assert weak_mixing.layout.title.text != strong_mixing.layout.title.text
    assert tuple(backward_flow.data[1].x) != tuple(forward_flow.data[1].x)


def test_witt_field_uses_magnitude_scaled_arrows_with_arrowheads(visualization):
    figure = visualization.witt_flow_figure(1)
    arrows = figure.data[-2]
    magnitude_samples = figure.data[-1]

    assert arrows.mode == "lines"
    assert len(arrows.x) == 9 * len(magnitude_samples.x)
    assert max(magnitude_samples.marker.color) > min(magnitude_samples.marker.color)
    assert magnitude_samples.marker.colorbar.title.text == "|V_m(z)|"
    assert "|V_m(z)|" in magnitude_samples.hovertemplate


def test_riemann_sphere_starts_in_turntable_mode(physics, visualization):
    figure = visualization.mobius_sphere_figure(
        physics.MobiusTransformation(1.0, 0.2, 0.3, 1.0), "test"
    )
    assert isinstance(figure, go.Figure)
    assert figure.layout.scene.dragmode == "turntable"
    assert any(trace.name == "fixed points" for trace in figure.data)


def test_static_build_contract(tmp_path, monkeypatch, visualization):
    minimal = {
        "local": {},
        "localLabels": {},
        "localVariants": {},
        "mixingKeys": [],
        "mixingValues": [],
        "mobius": {},
        "witt": {},
        "epsilonKeys": [],
        "epsilonValues": [],
        "wittNotes": {},
    }
    monkeypatch.setattr(visualization, "_build_application_data", lambda: minimal)
    monkeypatch.setattr(visualization, "get_plotlyjs", lambda: "window.Plotly = {};")

    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert "__APPLICATION_DATA__" not in html
    assert "window.Plotly = {};" in html
    assert "ipywidgets" not in html.lower()
    assert "Two-Dimensional Conformal Transformations" in html
    assert "physics-atlas:frame-height" in html
    assert 'id="mixing" type="range"' in html
    assert 'id="epsilon" type="range"' in html
    assert 'id="quotient-plot"' not in html
    assert "Directional difference quotient" not in html


def test_build_stages_bilingual_math_and_shared_assets(tmp_path, monkeypatch, visualization):
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
    assert 'title: "Two-Dimensional Conformal Transformations"' in html
    assert 'title: "2次元共形変換"' in html
    assert 'data-i18n="mixingLabel"' in html
    assert "MathJax.typesetClear(targets)" in html
    assert "MathJax.typesetPromise(targets)" in html


def test_build_uses_same_origin_height_contract(tmp_path, monkeypatch, visualization):
    monkeypatch.setattr(visualization, "_build_application_data", lambda: {})
    monkeypatch.setattr(visualization, "get_plotlyjs", lambda: "window.Plotly = {};")

    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

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


def test_bilingual_articles_and_string_theory_listing_are_aligned():
    root = Path(__file__).resolve().parents[3]
    english = (root / "docs/string-theory/conformal-transformations-2d/index.md").read_text(
        encoding="utf-8"
    )
    japanese = (root / "docs_ja/string-theory/conformal-transformations-2d/index.md").read_text(
        encoding="utf-8"
    )
    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)

    assert english_math == japanese_math
    assert len(english_math) == 10
    for source, locale in ((english, "en"), (japanese, "ja")):
        assert f"app/index.html?lang={locale}" in source
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "height: 2550px" in source
        assert "min-height: 1500px" in source
        assert 'loading="eager"' in source
        assert "Checks performed" not in source
        assert "実施したチェック" not in source

    english_index = (root / "docs/string-theory/index.md").read_text(encoding="utf-8")
    japanese_index = (root / "docs_ja/string-theory/index.md").read_text(encoding="utf-8")
    assert (
        "[Two-Dimensional Conformal Transformations](conformal-transformations-2d/)"
        in english_index
    )
    assert "[2次元共形変換](conformal-transformations-2d/)" in japanese_index
