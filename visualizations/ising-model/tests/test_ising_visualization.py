from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path


def test_static_build_stages_worker_assets_and_localized_application(
    tmp_path, visualization
) -> None:
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert "__APPLICATION_DATA__" not in html
    assert "__APPLICATION_CSS__" not in html
    assert 'type="module" src="app-v1.mjs"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "runtime" / "ising-compute-worker-v1.mjs").is_file()
    assert (tmp_path / "runtime" / "ising-worker-provider-v1.mjs").is_file()
    assert (tmp_path / "runtime" / "ising-kernel-v1.mjs").is_file()
    assert 'new Worker(url, {type: "module"})' in (
        tmp_path / "runtime" / "ising-worker-provider-v1.mjs"
    ).read_text(encoding="utf-8")
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")
    assert "COMPUTATIONAL STATISTICAL PHYSICS" not in html
    assert "計算統計物理学" not in application
    assert "RELAXATION" not in html
    assert "THERMODYNAMIC LIMIT" not in html
    assert "color-scheme: light" in html
    assert "--bg: #fbfcfb" in html
    assert "--spin-up: #72b58a" in html
    assert "--spin-down: #c4cbc7" in html
    assert "image.data[offset] = up ? 114 : 196" in application
    assert 'color: "#2f7eb5"' in application
    assert 'color: "#d1783f"' in application
    assert 'color: "#8a63b8"' in application
    assert "(T<T_c)" in application
    assert "thermoFormula.replaceChildren" in application
    assert "paragraph.textContent = formula" in application
    assert "thermoFormula.innerHTML = formulas[dimension]" not in application
    assert "Pyodide" not in html
    assert "Wasm" not in html


def test_build_payload_has_shared_scientific_curves_and_hard_limits(
    tmp_path, visualization
) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    match = re.search(
        r'<script id="application-data" type="application/json">(.*?)</script>',
        html,
        flags=re.DOTALL,
    )
    assert match is not None
    payload = json.loads(match.group(1))

    assert payload["protocol"] == "physics-atlas.ising.v1"
    assert payload["criticalTemperatures"]["1"] is None
    assert payload["criticalTemperatures"]["2"] == 2 / __import__("math").log(1 + 2**0.5)
    assert payload["thermodynamics"]["3"] is None
    assert len(payload["thermodynamics"]["1"]["temperature"]) == 280
    assert payload["limits"]["maxSnapshotBytes"] == 9216


def test_application_implements_same_origin_height_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert 'type: "physics-atlas:frame-height"' in html
    assert "Math.max(contentBottom, document.body.getBoundingClientRect().height)" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert "main.scrollHeight" not in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert 'window.location.protocol === "file:"' not in html
    assert (
        'postMessage({type: "physics-atlas:frame-height", height: frameHeight}, '
        "PARENT_TARGET_ORIGIN)" in html
    )
    assert html.index('type: "physics-atlas:frame-height"') < html.index('id="application-data"')


def test_node_provider_lifecycle_suite() -> None:
    node = shutil.which("node")
    if node is None:
        return
    test_file = Path(__file__).with_name("provider-v1.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_bilingual_pages_align_equations_and_embedding() -> None:
    root = Path(__file__).resolve().parents[3]
    english = (root / "docs" / "statistical-physics" / "ising-model" / "index.md").read_text(
        encoding="utf-8"
    )
    japanese = (root / "docs_ja" / "statistical-physics" / "ising-model" / "index.md").read_text(
        encoding="utf-8"
    )

    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)
    assert english_math == japanese_math
    for source, locale in ((english, "en"), (japanese, "ja")):
        assert f"app/index.html?lang={locale}" in source
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "height: 2450px" in source
        assert "min-height: 1500px" in source
        assert 'loading="eager"' in source
        assert "<iframe\n" not in source
        assert "\x08" not in source
        assert "$\\beta=1/T$" in source
    assert "## What to notice" in english
    assert "## 注目する点" in japanese
    assert "Checks performed" not in english
    assert "## 実施したチェック" not in japanese
