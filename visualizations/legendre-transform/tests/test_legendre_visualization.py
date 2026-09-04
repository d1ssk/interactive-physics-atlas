from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
STATIC_DIR = ROOT / "visualizations" / "legendre-transform" / "static"


def test_application_payload_covers_visible_ranges_and_localizes_names(visualization):
    functions = visualization.application_data()["functions"]
    for key, item in functions.items():
        assert item["names"]["en"]
        assert item["names"]["ja"]
        assert item["x"][0] < -visualization.AXIS_LIMIT
        assert item["x"][-1] > visualization.AXIS_LIMIT
        assert item["doubleX"][0] < -visualization.AXIS_LIMIT
        assert item["doubleX"][-1] > visualization.AXIS_LIMIT
        assert item["p"][-1] > visualization.AXIS_LIMIT
        assert max(abs(value) for value in item["firstContacts"]["x"]) <= visualization.AXIS_LIMIT
        assert max(abs(value) for value in item["secondContacts"]["p"]) <= visualization.AXIS_LIMIT
        if key == "exponential":
            assert min(item["secondContacts"]["p"]) > 0.0
        else:
            assert item["p"][0] < -visualization.AXIS_LIMIT


def test_build_stages_shared_assets_and_static_application(tmp_path, visualization):
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert 'href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert "plotly-gl3d-3.7.0.min.js" in html
    assert 'src="mathjax-tex-svg.js"' in html
    assert 'src="app.js"' in html
    assert 'id="application-data"' in html
    for name in (
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
        "style.css",
        "app.js",
    ):
        assert (tmp_path / name).is_file()


def test_responsive_layout_keeps_only_the_active_pair_below_desktop_width():
    css = (STATIC_DIR / "style.css").read_text(encoding="utf-8")

    assert "grid-template-columns: repeat(3, minmax(0, 1fr))" in css
    assert "body.mode-first #double-card" in css
    assert "body.mode-second #function-card" in css
    assert "position: fixed" in css
    assert "env(safe-area-inset-bottom)" in css
    assert "body.detail-view .plot-card.expanded" in css


def test_ui_contains_bilingual_definition_conventions_and_thermodynamic_context():
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")

    assert r"f^*(p)=\\sup_{x\\in\\mathbb R}\\{px-f(x)\\}" in source
    assert "Its slope is" in source
    assert "その傾き" in source
    assert "sign conventions" in source
    assert "符号の規約" in source
    assert "phase coexistence" in source
    assert "相共存" in source
    assert "nondifferentiable point" in source
    assert "微分不可能な点" in source


def test_plot_internal_text_remains_english_for_the_shared_figure():
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")

    assert 'plotLayout("1. Original function  f"' in source
    assert 'plotLayout("2. Convex conjugate  f*"' in source
    assert 'plotLayout("3. Biconjugate  f** = f"' in source
    assert "1. 元の関数" not in source


def test_modes_keep_independent_sliders_and_one_to_one_axis_scale():
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    source = (STATIC_DIR / "app.js").read_text(encoding="utf-8")

    assert 'id="first-slider"' in html
    assert 'id="second-slider"' in html
    assert 'scaleanchor: "x"' in source
    assert 'const slider = mode === "first" ? firstSlider : secondSlider' in source
