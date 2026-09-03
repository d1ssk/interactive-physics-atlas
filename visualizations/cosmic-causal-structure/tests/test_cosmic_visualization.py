from __future__ import annotations

import json
import re


def test_application_payload_has_matching_hot_and_inflation_models(visualization) -> None:
    payload = visualization.application_payload()
    hot = payload["hotBigBang"]
    inflation = payload["inflation"]

    assert payload["schema"] == 1
    assert hot["hasInflation"] is False
    assert inflation["hasInflation"] is True
    assert len(hot["series"]) == len(inflation["series"]) == 4
    assert len(hot["main"]["a"]) >= 1700
    assert len(inflation["main"]["a"]) >= 2100
    assert set(hot["main"]["phase"]) == {"hot Big Bang"}
    assert set(inflation["main"]["phase"]) == {"inflation", "hot Big Bang"}
    assert hot["events"]["etaIntersection"] is None
    assert inflation["events"]["etaIntersection"] < 0
    assert inflation["events"]["timeIntersection"] > 0


def test_static_build_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    for placeholder in (
        "__PLOTLY_ASSET__",
        "__APPLICATION_CSS__",
        "__APPLICATION_DATA__",
        "__APPLICATION_JS__",
    ):
        assert placeholder not in html
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert (tmp_path / "visualization-theme.css").is_file()
    assert (tmp_path / "visualization-theme.js").is_file()
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "mathjax-LICENSE.txt").is_file()
    assert "plotly-gl3d-3.7.0.min.js" in html
    assert "plotly.js (gl3d" not in html
    assert 'id="time-log" type="checkbox"' in html
    assert 'id="include-inflation" type="checkbox"' in html
    assert "distance-log" not in html
    assert 'name="time-coordinate"' not in html
    assert 'name="distance-coordinate"' not in html
    assert html.count('time:"conformal"') == 2
    assert html.count('time:"cosmic"') == 2
    assert html.count('distance:"comoving"') == 2
    assert html.count('distance:"proper"') == 2
    assert '"Comoving radial coordinate χ [Gpc]"' in html
    assert '"Proper distance D = aχ [Gpc]"' in html
    assert '"Conformal time cη [Gpc]"' in html
    assert '"Cosmic time t [Gyr]"' in html
    assert "title: {text:distanceAxisTitle(panel.distance),standoff:12}" in html
    assert "title: {text:timeAxisTitle(panel.time),standoff:12}" in html
    assert "xref: `${panel.xaxis} domain`" in html
    assert "yref: `${panel.yaxis} domain`" in html
    assert 'xanchor: "center"' in html
    assert 'window.matchMedia("(max-width: 780px)")' in html
    assert "height: mobile ? 2300 : 1060" in html
    assert html.count("{xDomain:[0,1]") == 4
    assert 'MOBILE_LAYOUT.addEventListener("change"' in html
    assert "function renderWhenPlotlyReady()" in html
    assert ".catch(showPlotlyLoadError)" in html
    assert html.count("void renderWhenPlotlyReady()") == 2
    assert 'mode: "markers+text"' not in html
    assert "Math.max(1e-12,firstPositive(yPool))" in html
    assert "宇宙の因果構造" in html
    assert "時間を対数表示" in html
    assert "inflation を含める" in html
    assert "The same light cones" in html
    assert "const LOCALE = new URLSearchParams" in html


def test_built_payload_is_valid_json_and_shared_between_locales(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    match = re.search(
        r'<script id="application-data" type="application/json">(.*?)</script>',
        html,
        re.DOTALL,
    )
    assert match is not None
    payload = json.loads(match.group(1))
    assert payload["hotBigBang"]["hasInflation"] is False
    assert payload["inflation"]["hasInflation"] is True
    assert 'get("lang") === "ja"' in html


def test_frame_height_contract_is_same_origin_and_content_based(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert 'type: "physics-atlas:frame-height"' in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert "PARENT_TARGET_ORIGIN," in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "Math.max(contentBottom" in html
    assert "main.scrollHeight" not in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html
    assert 'window.location.protocol === "file:"' not in html
    assert 'event.origin === "null"' not in html
    assert html.index('type: "physics-atlas:frame-height"') < html.index('id="application-data"')
