from __future__ import annotations

import json
import re


def test_static_build_contract(tmp_path, visualization):
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert "__APPLICATION_DATA__" not in html
    assert "__APPLICATION_JS__" not in html
    assert "__APPLICATION_CSS__" not in html
    assert "Dynkin Diagram Builder" in html
    assert 'id="diagram"' in html
    assert 'id="group-label"' in html
    assert "When is a Dynkin diagram valid?" in html
    assert "ディンキン図形ビルダー" in html
    assert 'const LOCALE = new URLSearchParams(window.location.search).get("lang")' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "mathjax-LICENSE.txt").is_file()
    assert "MathJax.loader" not in html
    assert 'src="https://cdn.jsdelivr.net/npm/mathjax' not in html
    assert "\\begin{pmatrix}" in html
    assert 'new Event("physics-atlas:mathjax-ready")' in html
    assert "pendingMathTargets" in html
    assert "startup.then" in html
    assert "invalidReason(matrix)" in html
    assert 'type: "physics-atlas:frame-height"' in html
    assert "window.frameElement.style.height" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert "Math.max(contentBottom" in html
    assert "main.scrollHeight" not in html
    assert "report();" in html
    assert 'window.location.protocol === "file:" && event.origin === "null"' in html
    assert 'const parentTargetOrigin = window.location.protocol === "file:" ? "*"' in html
    assert "parentTargetOrigin," in html
    assert 'window.addEventListener("load", report)' in html
    assert 'window.addEventListener("resize", report)' in html
    assert 'window.addEventListener("physics-atlas:mathjax-ready", report)' in html
    assert "new ResizeObserver(report)" in html
    assert 'window.location.protocol === "file:" && "MutationObserver" in window' in html
    assert "new MutationObserver" in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html
    assert html.index('type: "physics-atlas:frame-height"') < html.index('id="application-data"')
    assert 't("bondAria"' in html
    assert 'group.setAttribute("tabindex", "0")' in html
    assert "selectEdge(edge, true)" in html
    assert ".edge:focus-visible .edge-line" in html
    assert ".edge:focus-visible .arrow" in html
    assert "Tab reaches nodes and bonds" in html
    assert "Tabでノードと辺へ移動" in html
    assert "Plotly" not in html
    assert "pyodide" not in html.lower()


def test_built_payload_contains_complete_rank_eight_catalog(tmp_path, visualization):
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    match = re.search(
        r'<script id="application-data" type="application/json">(.*?)</script>',
        html,
        re.DOTALL,
    )

    assert match is not None
    payload = json.loads(match.group(1))
    assert payload["maxRank"] == 8
    assert len(payload["diagrams"]) == 31
    assert {item["name"] for item in payload["diagrams"]} >= {"A8", "D8", "E8", "F4", "G2"}
    assert (
        next(item for item in payload["diagrams"] if item["name"] == "A8")["groupLabel"] == "SU(9)"
    )
