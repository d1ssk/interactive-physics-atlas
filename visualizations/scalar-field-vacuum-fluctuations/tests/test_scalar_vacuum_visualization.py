from __future__ import annotations

import json
import re
from pathlib import Path

from physics_atlas.assets import PLOTLY_GL3D_ASSET_NAME, PYODIDE_NUMPY_WHEEL

ROOT = Path(__file__).resolve().parents[3]


def test_static_build_stages_lazy_python_runtime_and_plotly_views(
    tmp_path,
    runtime_build,
    visualization,
) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.mjs").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")
    manifest_text = html.split('id="runtime-manifest" type="application/json">', 1)[1].split(
        "</script>", 1
    )[0]
    manifest = json.loads(manifest_text)

    assert PLOTLY_GL3D_ASSET_NAME in html
    assert manifest["operation"] == "scalar-vacuum.sample.v1"
    assert manifest["resultSchema"] == "physics-atlas.scalar-vacuum.sample.v2"
    assert len(manifest_text) < 2_000
    assert "PYTHON_PLOT_DATA" not in html
    assert "PlotlyJSONEncoder" not in html
    assert html.count('class="plot-pair"') == 2
    assert 'id="spacetime-points"' in html
    assert 'id="spacetime-surfaces"' in html
    assert 'id="space-points"' in html
    assert 'id="space-surfaces"' in html
    assert 'id="correlation"' in html
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert "physics-atlas:frame-height" in html
    assert "vacuum_sample_domain" not in app
    assert 'type:"scatter3d"' in app
    assert 'type:"isosurface"' in app
    assert 'type:"scatter"' in app
    assert app.count('mode:"markers"') >= 3
    assert "dimension2Error" in app
    assert "dimension3Error" in app
    assert 'mode:"lines+markers"' not in app
    assert 'dragmode:"turntable"' in app
    assert 'dragmode:"pan"' in app
    assert 'event["scene.camera"]' in app
    assert "JavaScript" not in app
    assert "ブラウザ内の Python" in app
    assert "質量、カットオフ、seed を変えると、二つの配位を新たに生成します。" in app
    assert "上の2+1次元配位の空間断面ではありません" not in app
    assert "点が粒子で満たされる" not in app
    assert "grid-template-columns: repeat(2, minmax(0, 1fr))" in style
    assert "@media (max-width: 760px)" in style
    assert "font-family: var(--body-font)" in style
    assert "button { appearance: none;" in style

    for name in (
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
        "style.css",
        "app.mjs",
    ):
        assert (tmp_path / name).is_file()
    runtime = tmp_path / "runtime"
    assert (runtime / runtime_build.PROVIDER_ASSET_NAME).is_file()
    assert (runtime / runtime_build.WORKER_ASSET_NAME).is_file()
    assert (runtime / runtime_build.KERNEL_WHEEL_NAME).is_file()
    assert (runtime / "pyodide" / PYODIDE_NUMPY_WHEEL).is_file()


def test_bilingual_articles_share_equations_and_visualization_structure() -> None:
    english = (
        ROOT / "docs/quantum-field-theory/scalar-field-vacuum-fluctuations/index.md"
    ).read_text(encoding="utf-8")
    japanese = (
        ROOT / "docs_ja/quantum-field-theory/scalar-field-vacuum-fluctuations/index.md"
    ).read_text(encoding="utf-8")

    assert 'src="app/index.html?lang=en"' in english
    assert 'src="app/index.html?lang=ja"' in japanese
    assert re.findall(r"\$\$\s*(.*?)\s*\$\$", english, re.DOTALL) == re.findall(
        r"\$\$\s*(.*?)\s*\$\$", japanese, re.DOTALL
    )
    assert "## Things to explore" in english
    assert "## 探索例" in japanese
    assert "not Lorentz invariant" in english
    assert "Lorentz 不変ではありません" in japanese
