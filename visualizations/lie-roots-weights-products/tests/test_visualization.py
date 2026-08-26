from __future__ import annotations

import plotly.graph_objects as go


def test_rank2_and_rank3_root_figures(visualization):
    rank2 = visualization.plot_root_system("G2")
    rank3 = visualization.plot_root_system("B3", show_fundamental_weights=True)

    assert isinstance(rank2, go.Figure)
    assert isinstance(rank3, go.Figure)
    assert rank2.layout.title.xanchor == "left"
    assert rank2.layout.dragmode == "pan"
    assert rank3.layout.scene.dragmode == "turntable"
    assert len(rank3.data) == len(visualization.plot_root_system("B3").data) + 3

    root_markers = [trace for trace in rank3.data if trace.mode == "markers"]
    simple_roots = [trace for trace in rank3.data if (trace.name or "").startswith("simple root")]
    fundamental_weights = [
        trace for trace in rank3.data if (trace.name or "").startswith("fundamental weight")
    ]
    assert all(trace.marker.size == 2 for trace in root_markers)
    assert all(trace.marker.size == 3 for trace in simple_roots)
    assert all(trace.marker.size == 3 for trace in fundamental_weights)


def test_weight_and_three_factor_figures(physics, visualization):
    diagram = physics.representation_weights("A2", (1, 1))
    product = physics.tensor_product_many("A2", [(1, 0), (1, 0), (1, 0)])

    assert isinstance(visualization.plot_weight_diagram(diagram), go.Figure)
    first = visualization.plot_tensor_product(product, extraction_step=0)
    complete = visualization.plot_tensor_product(
        product,
        extraction_step=len(product.components),
        show_factor_weights=False,
    )
    assert first.data[-1].name == "next highest weight"
    assert len(complete.data) == 0
    assert complete.layout.annotations[0].text.startswith("Residual character is zero")


def test_static_build_contract(tmp_path, monkeypatch, visualization):
    monkeypatch.setattr(visualization, "_build_application_data", lambda: {"systems": {}})
    monkeypatch.setattr(visualization, "get_plotlyjs", lambda: "window.Plotly = {};")

    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert "__APPLICATION_DATA__" not in html
    assert "window.Plotly = {};" in html
    assert '"systems":{}' in html
    assert "2. Representation weights" in html
    assert "リー代数のルート・ウェイト・テンソル積" in html
    assert 'const LOCALE = new URLSearchParams(window.location.search).get("lang")' in html
    assert "__MATHJAX_JS__" not in html
    assert "MathJax.loader" in html
    assert 'src="https://cdn.jsdelivr.net/npm/mathjax' not in html
    assert 'new Event("physics-atlas:mathjax-ready")' in html
    assert "pendingMathTargets" in html
    assert "startup.then" in html
    assert "Plotly.react(target, traces, figure.layout, CONFIG)" in html
    assert "Highlight simple root" not in html
    assert 'id="root-simple"' not in html
    assert "pyodide" not in html.lower()
    assert "ipywidgets" not in html.lower()
    assert 'type:"physics-atlas:frame-height"' in html
    assert "window.frameElement.style.height" in html
    assert "new ResizeObserver(scheduleReport).observe(resizeTarget)" in html
    assert "Math.max(contentBottom" not in html
    assert "Math.max(bounds.height, main.scrollHeight)" in html
