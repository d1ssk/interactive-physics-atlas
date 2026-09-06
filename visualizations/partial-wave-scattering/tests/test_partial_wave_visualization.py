from __future__ import annotations

import json
import re
from pathlib import Path

from physics_atlas.assets import PLOTLY_GL3D_ASSET_NAME, PYODIDE_NUMPY_WHEEL

ROOT = Path(__file__).resolve().parents[3]


def test_static_build_has_no_precomputed_figure_payload(
    tmp_path, runtime_build, visualization
) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.mjs").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")

    assert PLOTLY_GL3D_ASSET_NAME in html
    assert "PYTHON_PLOT_DATA" not in html
    assert "PlotlyJSONEncoder" not in html
    assert 'id="runtime-manifest" type="application/json"' in html
    manifest_text = html.split('id="runtime-manifest" type="application/json">', 1)[1].split(
        "</script>", 1
    )[0]
    manifest = json.loads(manifest_text)
    assert set(manifest["operations"]) == {"plane", "scattering"}
    assert len(manifest_text) < 2_500
    assert html.count('class="visualization-panel"') == 2
    assert html.count('type="range" min="0" max="12"') == 2
    assert 'id="plane-ell-slices"' in html
    assert 'id="scatter-ell" type="range" min="0" max="10"' in html
    assert 'id="potential-profile"' in html
    assert 'id="phase-shifts"' in html
    assert 'id="differential-cross-section"' in html
    assert 'id="resonance-energy"' in html
    assert 'id="resonance-radial"' in html
    assert "<footer>" not in html
    assert "aspect-ratio: 1" in style
    assert ".scattering-heatmaps { height: auto; }" in style
    assert "linear-gradient" not in style
    assert "plane_wave_partial_sum" not in app
    assert "radial_solution" not in app
    assert "scattering_amplitude" not in app
    assert 'Plotly.react("plane-3d"' in app
    assert 'type:"heatmap"' not in app
    assert 'type:"bar"' not in app
    assert 'drawField(byId("plane-current")' in app
    assert 'drawField(byId("field-current")' in app
    for plot_id in (
        "potential-profile",
        "phase-shifts",
        "differential-cross-section",
        "resonance-energy",
        "resonance-radial",
    ):
        assert f'Plotly.react("{plot_id}"' in app
    assert "xaxis2" not in app
    assert "xaxis3" not in app
    assert "scattering angle θ [rad]" in app
    assert "dσ/dΩ [L² sr⁻¹]" in app
    assert "reduced radial wave uℓ(r) [arb. units]" in app
    assert "title:{text:title, standoff:8}" in app
    assert 'byId("scatter-ell").addEventListener("input"' in app
    assert 'const planeEllInputs = [byId("plane-ell"), byId("plane-ell-slices")];' in app
    assert "interior radial-weight ratio" in app
    assert "内部動径重み比" in app
    assert "部分波散乱" in app
    assert "ブラウザ内のPython" not in app
    assert "Calculating in Python" not in app
    assert "white-space: nowrap" in style
    assert "grid-template-columns: repeat(3, minmax(0, 1fr))" in style
    assert "grid-template-columns: repeat(2, minmax(0, 1fr))" in style
    assert "@media (max-width: 800px)" in style
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert "physics-atlas:frame-height" in html
    assert (
        'expectedParent.postMessage({type:"physics-atlas:frame-height", height}, expectedOrigin)'
        in html
    )
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
    assert (runtime / runtime_build.PROVIDER_ASSET_NAME).stat().st_size < 12_288
    assert (runtime / runtime_build.WORKER_ASSET_NAME).stat().st_size < 8_192


def test_bilingual_article_embeds_the_same_visualization_and_equations() -> None:
    english = (ROOT / "docs/quantum-mechanics/partial-wave-scattering/index.md").read_text(
        encoding="utf-8"
    )
    japanese = (ROOT / "docs_ja/quantum-mechanics/partial-wave-scattering/index.md").read_text(
        encoding="utf-8"
    )

    assert 'src="app/index.html?lang=en"' in english
    assert 'src="app/index.html?lang=ja"' in japanese
    assert re.findall(r"\$\$\s*(.*?)\s*\$\$", english, re.DOTALL) == re.findall(
        r"\$\$\s*(.*?)\s*\$\$", japanese, re.DOTALL
    )
    assert "## Suggested things to try" in english
    assert "## 試してみること" in japanese
