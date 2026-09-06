from __future__ import annotations

import json

from physics_atlas.assets import PLOTLY_GL3D_ASSET_NAME, PYODIDE_NUMPY_WHEEL


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
    assert "linear-gradient" not in style
    assert "plane_wave_partial_sum" not in app
    assert "radial_solution" not in app
    assert "scattering_amplitude" not in app
    assert 'Plotly.react("plane-3d"' in app
    assert 'Plotly.react("scattering-field"' in app
    assert "部分波散乱" in app
    assert "ブラウザ内のPython" in app
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
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
