from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

from physics_atlas.assets import PLOTLY_GL3D_ASSET_NAME, PYODIDE_NUMPY_WHEEL


def test_compute_provider_lifecycle_contract():
    node = shutil.which("node")
    if node is None:
        import pytest

        pytest.skip("Node.js is unavailable")
    test_file = Path(__file__).with_name("provider-v3.test.mjs")

    completed = subprocess.run(
        [node, "--test", str(test_file)],
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert completed.returncode == 0, completed.stdout + completed.stderr


def _contains_plotly_figure_key(value) -> bool:
    if isinstance(value, dict):
        if "figure" in value or ({"data", "layout"} <= value.keys()):
            return True
        return any(_contains_plotly_figure_key(item) for item in value.values())
    if isinstance(value, list):
        return any(_contains_plotly_figure_key(item) for item in value)
    return False


def test_application_data_uses_versioned_domain_schemas(
    physics,
    domain,
    protocol,
    visualization,
):
    application = visualization._build_application_data()

    assert application["schema"] == domain.APPLICATION_SCHEMA
    assert application["kernelVersion"] == protocol.KERNEL_VERSION
    assert application["runtime"]["protocol"] == protocol.COMPUTE_PROTOCOL_SCHEMA
    assert application["runtime"]["operations"]["weight"] == {
        "name": protocol.WEIGHT_OPERATION,
        "resultSchema": protocol.WEIGHT_RESULT_SCHEMA,
    }
    assert application["runtime"]["operations"]["tensorProduct"] == {
        "name": protocol.TENSOR_PRODUCT_OPERATION,
        "resultSchema": protocol.TENSOR_PRODUCT_RESULT_SCHEMA,
    }
    assert application["runtime"]["resultSchemas"] == protocol.RESULT_SCHEMAS
    assert application["runtime"]["limits"]["maxElapsedMs"] == protocol.DEFAULT_MAX_ELAPSED_MS
    assert (
        application["runtime"]["limits"]["memoryCacheEntries"] == protocol.MEMORY_CACHE_MAX_ENTRIES
    )
    assert application["runtime"]["limits"]["maxWeightPairs"] == protocol.DEFAULT_MAX_WEIGHT_PAIRS
    assert set(application["systems"]) == {
        *physics.RANK2_SYSTEMS,
        *physics.RANK3_SYSTEMS,
    }
    assert all(
        root["schema"] == domain.ROOT_SYSTEM_SCHEMA
        and root["kernelVersion"] == protocol.KERNEL_VERSION
        for root in application["roots"].values()
    )
    assert all(
        diagram["schema"] == domain.WEIGHT_DIAGRAM_SCHEMA
        and diagram["kernelVersion"] == protocol.KERNEL_VERSION
        for diagram in application["weights"].values()
    )
    assert all(
        product["schema"] == domain.TENSOR_PRODUCT_SCHEMA
        for cases in application["products"].values()
        for product in cases
    )
    assert all(
        step["schema"] == domain.CHARACTER_SCHEMA
        for cases in application["products"].values()
        for product in cases
        for step in product["steps"]
    )
    assert not _contains_plotly_figure_key(application)

    published_keys = {
        item["weightKey"]
        for system in application["systems"].values()
        for item in system["presets"]
    }
    expected_keys = {
        domain.weight_diagram_key(system, tuple(labels))
        for system, presets in physics.REPRESENTATION_PRESETS.items()
        for labels in presets.values()
    }
    assert published_keys == expected_keys


def test_domain_results_preserve_scientific_invariants(physics, domain):
    diagram = physics.representation_weights("A2", (2, 1))
    weight_data = domain.weight_diagram_domain(diagram)

    assert sum(weight_data["multiplicities"]) == weight_data["dimension"]
    assert weight_data["dimension"] == weight_data["weylDimension"]
    assert weight_data["highestDynkin"] in weight_data["dynkinCoordinates"]
    assert len(weight_data["displayWeights"]) == len(weight_data["multiplicities"])
    assert all(
        0 <= source < len(weight_data["displayWeights"]) for source, _ in weight_data["edges"]
    )
    assert all(
        0 <= target < len(weight_data["displayWeights"]) for _, target in weight_data["edges"]
    )

    product = physics.tensor_product("A2", (1, 0), (0, 1))
    product_data = domain.tensor_product_domain(product)
    dependencies = domain.tensor_product_weight_dependencies(product)
    domain.validate_tensor_product_domain(product_data, dependencies)
    steps = [
        domain.residual_character_domain(product, step)
        for step in range(len(product.components) + 1)
    ]
    assert sum(steps[0]["multiplicities"]) == product.dimension
    assert steps[-1]["multiplicities"] == []
    assert steps[-1]["displayWeights"] == []


def test_static_build_contract(
    tmp_path,
    monkeypatch,
    domain,
    protocol,
    runtime_build,
    visualization,
):
    monkeypatch.setattr(
        visualization,
        "_build_application_data",
        lambda: {
            "schema": domain.APPLICATION_SCHEMA,
            "kernelVersion": protocol.KERNEL_VERSION,
            "runtime": runtime_build.runtime_manifest(),
            "systems": {},
            "roots": {},
            "weights": {},
            "products": {},
        },
    )

    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    assert "__APPLICATION_DATA__" not in html
    assert "__PLOTLY_ASSET__" not in html
    assert PLOTLY_GL3D_ASSET_NAME in html
    assert "plotly.js v3.7.0" not in html
    assert '"schema":"physics-atlas.lie-application.v1"' in html
    assert "function rootFigure(" in html
    assert "function weightFigure(" in html
    assert "function productFigure(" in html
    assert "Plotly.react(target, figure.data, figure.layout, CONFIG)" in html
    assert "physicsAtlasPlotlyReady" in html
    assert 'siteRoot = locale === "ja" ? "../../../../" : "../../../"' in html
    assert "2. Representation weights" in html
    assert "Lie代数のルート・ウェイト・テンソル積" in html
    assert "Cartan型" in html
    assert "Dynkinラベル" in html
    assert "--panel:#f1f3f1" in html
    assert 'const LOCALE = new URLSearchParams(window.location.search).get("lang")' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "mathjax-LICENSE.txt").is_file()
    runtime_dir = tmp_path / runtime_build.RUNTIME_DIRECTORY_NAME
    assert (runtime_dir / runtime_build.PROVIDER_ASSET_NAME).is_file()
    assert (runtime_dir / runtime_build.WORKER_ASSET_NAME).is_file()
    assert (runtime_dir / runtime_build.KERNEL_WHEEL_NAME).is_file()
    assert (runtime_dir / "pyodide" / "pyodide.asm.wasm").is_file()
    assert (runtime_dir / "pyodide" / PYODIDE_NUMPY_WHEEL).is_file()
    worker = (runtime_dir / runtime_build.WORKER_ASSET_NAME).read_text(encoding="utf-8")
    provider = (runtime_dir / runtime_build.PROVIDER_ASSET_NAME).read_text(encoding="utf-8")
    assert "__COMPUTE_PROTOCOL__" not in worker
    assert protocol.COMPUTE_PROTOCOL_SCHEMA in worker
    assert domain.CHARACTER_SCHEMA in worker
    assert protocol.TENSOR_PRODUCT_OPERATION in worker
    assert protocol.TENSOR_PRODUCT_RESULT_SCHEMA in worker
    assert runtime_build.KERNEL_WHEEL_NAME in worker
    assert "from physics_atlas_lie_kernel.kernel import handle_request_json" in worker
    assert "import plotly" not in worker.lower()
    assert worker.index("const pyodide = await ensureRuntime(requestId)") < worker.index(
        'loading = false;\n    reportPhase(requestId, "calculating")'
    )
    assert "#worker = null" in provider
    assert 'this.#stopActive("SUPERSEDED")' in provider
    assert 'this.#stopActive("TIMEOUT")' in provider
    assert 'return this.#stopActive("CANCELLED")' in provider
    assert "#cache = new Map()" in provider
    assert "#resultSchemas" in provider
    assert 'new Worker(url, {type:"module"' in provider
    assert (runtime_dir / runtime_build.PROVIDER_ASSET_NAME).stat().st_size <= 24_576
    assert (runtime_dir / runtime_build.WORKER_ASSET_NAME).stat().st_size <= 12_288
    assert "MathJax.loader" not in html
    assert 'src="https://cdn.jsdelivr.net/npm/mathjax' not in html
    assert 'new Event("physics-atlas:mathjax-ready")' in html
    assert "pendingMathTargets" in html
    assert "startup.then" in html
    assert "pyodide.asm.wasm" not in html
    assert 'src="runtime/' not in html
    assert "getComputeProvider()" in html
    assert "import(new URL(DATA.runtime.providerAsset, base))" in html
    assert "new module.PyodideComputeProvider({" in html
    assert "maximumTimeoutMs:DATA.runtime.limits.hardMaxElapsedMs" in html
    assert 'id="weight-cancel"' in html
    assert 'id="product-compute"' in html
    assert 'id="product-cancel"' in html
    assert 'input.value === "" ? NaN : Number(input.value)' in html
    assert "if (activeWeightRequestId !== request.requestId) return;" in html
    assert "if (activeProductRequestId !== request.requestId) return;" in html
    assert "const requestId = activeWeightRequestId;" in html
    assert "if (activeWeightRequestId === requestId) provider.cancel(requestId);" in html
    assert "const requestId = activeProductRequestId;" in html
    assert "if (activeProductRequestId === requestId) provider.cancel(requestId);" in html
    assert 'customTwoFactorProduct:"Custom two-factor product"' in html
    assert 'customTwoFactorProduct:"任意の2因子テンソル積"' in html
    assert 'calculateWeight:"Calculate"' in html
    assert 'calculateWeight:"計算"' in html
    for removed_message in (
        "runtimeHint",
        "runtimeResult",
        "cachedResult",
        "staticResult",
        "productRuntimeResult",
        "productCachedResult",
        "productStaticResult",
    ):
        assert removed_message not in html
    assert 'className = "decomposition-equation"' in html
    assert 'className = "decomposition-chunk"' in html
    assert 'factors.join("\\\\otimes ")' in html
    assert 'operator = index > 0 ? "\\\\oplus " : ""' in html
    assert "Try the non-preset highest weight" not in html
    assert "プリセットにない最高ウェイト" not in html
    assert 'aria-live="polite"' in html
    assert html.index("if (!labels)") < html.index("const provider = await getComputeProvider()")
    for error_code in protocol.ERROR_CODES:
        assert html.count(f"error{error_code}:") == 2
    assert "ipywidgets" not in html.lower()
    assert 'type:"physics-atlas:frame-height"' in html
    assert "window.frameElement.style.height" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert "Math.max(contentBottom" in html
    assert "main.scrollHeight" not in html
    assert "report();" in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert "PARENT_TARGET_ORIGIN," in html
    assert 'window.addEventListener("load", report)' in html
    assert 'window.addEventListener("resize", report)' in html
    assert 'window.addEventListener("physics-atlas:mathjax-ready", report)' in html
    assert "new ResizeObserver(report)" in html
    assert 'window.location.protocol === "file:"' not in html
    assert 'event.origin === "null"' not in html
    assert "new MutationObserver" not in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html
    assert html.index('type:"physics-atlas:frame-height"') < html.index('id="application-data"')
    assert 'role="tablist"' in html
    assert html.count('role="tab"') == 3
    assert html.count('role="tabpanel"') == 3
    assert 'aria-controls="roots-panel"' in html
    assert 'aria-labelledby="roots-tab"' in html
    assert 'id="weights-panel" class="panel" role="tabpanel"' in html
    assert "panel.hidden = !active" in html
    assert 'event.key === "ArrowRight"' in html
    assert 'event.key === "ArrowLeft"' in html


def test_built_html_stays_within_initial_payload_budget(tmp_path, visualization):
    visualization.build(tmp_path)

    html_path = tmp_path / "index.html"
    html = html_path.read_text(encoding="utf-8")
    payload = json.loads(
        html.split('<script id="application-data" type="application/json">', 1)[1].split(
            "</script>", 1
        )[0]
    )
    source = Path(visualization.__file__).read_text(encoding="utf-8")

    assert html_path.stat().st_size <= 1_048_576
    assert not _contains_plotly_figure_key(payload)
    assert "itertools.product(range(4)" not in source
    assert "get_plotlyjs" not in source
    assert "PlotlyJSONEncoder" not in source
    assert b"WebAssembly" not in html_path.read_bytes()
