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
    assert "invalidReason(matrix)" in html
    assert 'type: "physics-atlas:frame-height"' in html
    assert "window.frameElement.style.height" in html
    assert "new ResizeObserver(scheduleReport).observe(document.body)" in html
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
