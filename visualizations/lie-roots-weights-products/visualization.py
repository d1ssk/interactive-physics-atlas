"""Domain-data and browser application builder for Lie-algebra structures."""

# ruff: noqa: E501 -- embedded HTML/CSS/JavaScript is kept readable in its native syntax.

from __future__ import annotations

import json
from pathlib import Path

from physics_atlas.assets import PLOTLY_GL3D_ASSET_NAME, copy_mathjax_assets

from .domain import (
    APPLICATION_SCHEMA,
    root_system_domain,
    tensor_product_domain,
    weight_diagram_domain,
    weight_diagram_key,
)
from .physics import (
    RANK2_SYSTEMS,
    RANK3_SYSTEMS,
    REPRESENTATION_PRESETS,
    get_root_system,
    representation_weights,
    tensor_product_many,
)
from .protocol import KERNEL_VERSION
from .runtime_build import build_runtime_assets, runtime_manifest

PRODUCT_CASES = {
    "A2": (
        ("3 x 3", ((1, 0), (1, 0))),
        ("3 x 3bar", ((1, 0), (0, 1))),
        ("8 x 8", ((1, 1), (1, 1))),
        ("3 x 3 x 3", ((1, 0), (1, 0), (1, 0))),
    ),
    "B2": (
        ("vector 5 x vector 5", ((1, 0), (1, 0))),
        ("spinor 4 x spinor 4", ((0, 1), (0, 1))),
    ),
    "C2": (
        ("defining 4 x defining 4", ((1, 0), (1, 0))),
        ("defining 4 x fundamental 5", ((1, 0), (0, 1))),
    ),
    "D2": (
        ("half-spinor 2+ x half-spinor 2-", ((1, 0), (0, 1))),
        ("vector 4 x vector 4", ((1, 1), (1, 1))),
    ),
    "G2": (
        ("fundamental 7 x fundamental 7", ((1, 0), (1, 0))),
        ("fundamental 7 x fundamental 7 x fundamental 7", ((1, 0),) * 3),
    ),
    "A3": (
        ("fundamental 4 x fundamental 4", ((1, 0, 0), (1, 0, 0))),
        ("fundamental 4 x antifundamental 4bar", ((1, 0, 0), (0, 0, 1))),
        ("fundamental 4 x fundamental 4 x fundamental 4", ((1, 0, 0),) * 3),
    ),
    "B3": (
        ("spinor 8 x spinor 8", ((0, 0, 1), (0, 0, 1))),
        ("vector 7 x vector 7", ((1, 0, 0), (1, 0, 0))),
    ),
    "C3": (
        ("defining 6 x defining 6", ((1, 0, 0), (1, 0, 0))),
        ("defining 6 x fundamental 14", ((1, 0, 0), (0, 1, 0))),
    ),
    "D3": (
        ("half-spinor 4+ x half-spinor 4-", ((0, 1, 0), (0, 0, 1))),
        ("vector 6 x vector 6", ((1, 0, 0), (1, 0, 0))),
    ),
}


def _build_application_data() -> dict[str, object]:
    systems = (*RANK2_SYSTEMS, *RANK3_SYSTEMS)
    system_catalog: dict[str, object] = {}
    root_catalog: dict[str, object] = {}
    weight_catalog: dict[str, object] = {}
    product_catalog: dict[str, object] = {}

    def register_weight(system_key: str, labels: tuple[int, ...]) -> str:
        key = weight_diagram_key(system_key, labels)
        if key not in weight_catalog:
            weight_catalog[key] = weight_diagram_domain(representation_weights(system_key, labels))
        return key

    for system_key in systems:
        system = get_root_system(system_key)
        presets = []
        for name, labels in REPRESENTATION_PRESETS[system_key].items():
            labels_tuple = tuple(labels)
            presets.append(
                {
                    "name": name,
                    "labels": list(labels_tuple),
                    "weightKey": register_weight(system_key, labels_tuple),
                }
            )
        system_catalog[system_key] = {
            "rank": system.rank,
            "groups": system.groups,
            "note": system.note,
            "cartan": system.cartan_matrix.tolist(),
            "presets": presets,
        }
        root_catalog[system_key] = root_system_domain(system)

        product_cases = []
        for case_index, (name, factors) in enumerate(PRODUCT_CASES[system_key]):
            product = tensor_product_many(system_key, factors)
            for labels in product.factor_highest:
                register_weight(system_key, tuple(labels))
            for component in product.components:
                register_weight(system_key, component.highest_dynkin)
            product_cases.append(
                {
                    "id": str(case_index),
                    "name": name,
                    **tensor_product_domain(product),
                }
            )
        product_catalog[system_key] = product_cases
    return {
        "schema": APPLICATION_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "runtime": runtime_manifest(),
        "systems": system_catalog,
        "roots": root_catalog,
        "weights": weight_catalog,
        "products": product_catalog,
    }


def build(output_dir: Path) -> None:
    """Build the static browser application with compact domain data."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    build_runtime_assets(output_dir, Path(__file__).resolve().parent)
    payload = json.dumps(_build_application_data(), separators=(",", ":")).replace("</", "<\\/")
    html = _APPLICATION_HTML.replace("__PLOTLY_ASSET__", PLOTLY_GL3D_ASSET_NAME).replace(
        "__APPLICATION_DATA__", payload
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")


_APPLICATION_HTML = r"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lie Roots, Weights, and Tensor Products</title>
  <style>
    :root { color-scheme: light; --ink:#263238; --muted:#687078; --line:#dde2e6;
      --blue:#3b6fb6; --paper:#fcfcfd; --gold:#c69214; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--paper); color:var(--ink);
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { max-width:1480px; margin:0 auto; padding:20px; }
    h1 { margin:0 0 8px; font-size:clamp(1.5rem,3vw,2.35rem); }
    .lede { margin:0 0 18px; color:var(--muted); max-width:76ch; line-height:1.5; }
    .tabs { display:flex; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--line); }
    .tab { appearance:none; border:1px solid var(--line); border-bottom:0; border-radius:8px 8px 0 0;
      padding:10px 16px; background:#f2f5f7; color:var(--ink); cursor:pointer; font-weight:650; }
    .tab[aria-selected="true"] { background:white; color:var(--blue); }
    .panel { display:none; background:white; border:1px solid var(--line); border-top:0;
      padding:16px; min-height:790px; }
    .panel.active { display:block; }
    .panel[hidden] { display:none; }
    .controls { display:flex; flex-wrap:wrap; align-items:end; gap:12px; padding:12px;
      border:1px solid var(--line); border-radius:8px; background:#f7f9fa; }
    .custom-weight { display:flex; flex-wrap:wrap; align-items:end; gap:8px; margin:0; padding:7px 10px;
      border:1px solid var(--line); border-radius:6px; }
    .custom-weight legend { padding:0 5px; color:var(--muted); font-size:.82rem; font-weight:650; }
    .dynkin-inputs { display:flex; gap:6px; }
    .dynkin-inputs label { display:grid; grid-template-columns:auto 4.5rem; align-items:center; gap:4px; }
    .dynkin-inputs input { width:4.5rem; padding:7px; border:1px solid #bac3c9; border-radius:5px; }
    button.compute { padding:8px 12px; border:0; border-radius:5px; background:var(--blue); color:white;
      cursor:pointer; font-weight:700; }
    button.compute:disabled { cursor:wait; opacity:.65; }
    label { display:grid; gap:5px; color:var(--muted); font-size:.82rem; font-weight:650; }
    label.inline { display:flex; align-items:center; gap:7px; padding-bottom:8px; }
    select, input[type="range"] { min-width:150px; }
    select { padding:7px 9px; border:1px solid #bac3c9; border-radius:5px; background:white; }
    .plot { width:100%; min-height:700px; }
    .product-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(380px,.85fr); gap:12px; }
    .status { white-space:pre-wrap; margin:12px 0 0; padding:10px 12px; border-left:3px solid var(--gold);
      background:#fffaf0; line-height:1.45; }
    .error { margin:0 0 12px; padding:10px 12px; border-left:3px solid #a33; background:#fff1f1; }
    .hint { color:var(--muted); font-size:.9rem; margin:10px 0 0; }
    @media (max-width:960px) { .product-grid { grid-template-columns:1fr; } main { padding:10px; }
      .panel { padding:10px; } }
  </style>
  <script>
    window.MathJax = {
      tex: {inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]]},
      startup: {
        ready() {
          MathJax.startup.defaultReady();
          MathJax.startup.promise.then(() => {
            window.dispatchEvent(new Event("physics-atlas:mathjax-ready"));
          });
        },
      },
    };
  </script>
  <script defer src="mathjax-tex-svg.js"></script>
  <script>
    window.physicsAtlasPlotlyReady = new Promise((resolve, reject) => {
      const locale = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
      const siteRoot = locale === "ja" ? "../../../../" : "../../../";
      const script = document.createElement("script");
      script.src = new URL(`${siteRoot}javascripts/__PLOTLY_ASSET__`, window.location.href);
      script.addEventListener("load", resolve, {once:true});
      script.addEventListener("error", () => reject(new Error("Plotly asset failed to load")), {once:true});
      document.head.append(script);
    });
  </script>
</head>
<body>
<main>
  <h1 data-i18n="title">Lie Roots, Weights, and Tensor Products</h1>
  <p class="lede" data-i18n="lede">Explore rank-2 and rank-3 root systems, irreducible highest-weight
    characters, and the stepwise extraction of tensor-product summands.</p>
  <p id="application-error" class="error" role="alert" hidden></p>
  <nav class="tabs" role="tablist" aria-label="Explorer sections">
    <button id="roots-tab" class="tab" role="tab" data-i18n="rootsTab" data-panel="roots-panel" aria-controls="roots-panel" aria-selected="true" tabindex="0">1. Root systems</button>
    <button id="weights-tab" class="tab" role="tab" data-i18n="weightsTab" data-panel="weights-panel" aria-controls="weights-panel" aria-selected="false" tabindex="-1">2. Representation weights</button>
    <button id="products-tab" class="tab" role="tab" data-i18n="productsTab" data-panel="products-panel" aria-controls="products-panel" aria-selected="false" tabindex="-1">3. Tensor products</button>
  </nav>

  <section id="roots-panel" class="panel active" role="tabpanel" aria-labelledby="roots-tab">
    <div class="controls">
      <label><span data-i18n="cartanType">Cartan type</span> <select id="root-system"></select></label>
      <label class="inline"><input id="root-fundamental" type="checkbox"> <span data-i18n="showFundamental">Show fundamental weights</span></label>
    </div>
    <p id="root-note" class="hint"></p>
    <div id="root-plot" class="plot" role="img" aria-label="Root-system diagram"></div>
  </section>

  <section id="weights-panel" class="panel" role="tabpanel" aria-labelledby="weights-tab" hidden>
    <div class="controls">
      <label><span data-i18n="cartanType">Cartan type</span> <select id="weight-system"></select></label>
      <label><span data-i18n="preset">Preset</span> <select id="weight-preset"></select></label>
      <fieldset class="custom-weight">
        <legend data-i18n="customHighestWeight">Custom highest weight</legend>
        <div id="weight-custom-labels" class="dynkin-inputs"></div>
        <button id="weight-compute" class="compute" type="button" data-i18n="calculateWeight">Calculate in browser</button>
      </fieldset>
    </div>
    <p class="hint" data-i18n="runtimeHint">Try the non-preset highest weight \(A_2\), \((4,0)\). Pyodide loads only when requested.</p>
    <p id="weight-runtime-status" class="hint" aria-live="polite"></p>
    <p id="weight-status" class="hint"></p>
    <div id="weight-plot" class="plot" role="img" aria-label="Weight diagram"></div>
  </section>

  <section id="products-panel" class="panel" role="tabpanel" aria-labelledby="products-tab" hidden>
    <div class="controls">
      <label><span data-i18n="cartanType">Cartan type</span> <select id="product-system"></select></label>
      <label><span data-i18n="product">Product</span> <select id="product-case"></select></label>
      <label><span data-i18n="extractionStep">Extraction step</span> <input id="product-step" type="range" min="0" value="0"><output id="product-step-value">0</output></label>
      <label><span data-i18n="inspectSummand">Inspect summand</span> <select id="product-component"></select></label>
      <label class="inline"><input id="product-factors" type="checkbox" checked> <span data-i18n="showFactors">Show factor weights</span></label>
    </div>
    <div id="product-status" class="status"></div>
    <div class="product-grid">
      <div id="product-plot" class="plot" role="img" aria-label="Residual tensor-product character"></div>
      <div id="component-plot" class="plot" role="img" aria-label="Irreducible summand weight diagram"></div>
    </div>
  </section>
</main>
<script>
  (() => {
    if (window.parent === window) return;
    const PARENT_TARGET_ORIGIN = window.location.origin;
    function report() {
      const main = document.querySelector("main");
      const contentBottom = main ? main.getBoundingClientRect().bottom : 0;
      const contentHeight = Math.max(contentBottom, document.body.getBoundingClientRect().height);
      const frameHeight = Math.ceil(contentHeight);
      if (window.frameElement) {
        window.frameElement.style.minHeight = "0";
        window.frameElement.style.height = `${frameHeight}px`;
        window.frameElement.setAttribute("scrolling", "no");
        window.frameElement.style.overflow = "hidden";
      }
      window.parent.postMessage(
        {type:"physics-atlas:frame-height", height:frameHeight},
        PARENT_TARGET_ORIGIN,
      );
    }
    window.addEventListener("load", report);
    window.addEventListener("resize", report);
    window.addEventListener("physics-atlas:mathjax-ready", report);
    window.addEventListener("message", event => {
      const expectedParent = event.source === window.parent;
      const expectedOrigin = event.origin === PARENT_TARGET_ORIGIN;
      if (expectedParent && expectedOrigin && event.data?.type === "physics-atlas:request-frame-height") {
        report();
      }
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(report);
      observer.observe(document.body);
      const main = document.querySelector("main");
      if (main) observer.observe(main);
      window.addEventListener("pagehide", () => observer.disconnect(), {once: true});
    }
    document.fonts?.ready.then(report);
    report();
  })();
</script>
<script id="application-data" type="application/json">__APPLICATION_DATA__</script>
<script>
  (async () => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("application-data").textContent);
  const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
  const MESSAGES = {
    en: {
      rootNote:"{groups}; {note}. Cartan matrix: \\(A={cartan}\\).",
      weightStatus:"\\({system}\\) highest weight \\(({labels})\\); published preset.",
      customHighestWeight:"Custom highest weight", calculateWeight:"Calculate in browser",
      calculatingButton:"Calculating…",
      dynkinLabelAria:"Dynkin label {index}",
      runtimeHint:"Try the non-preset highest weight \\(A_2\\), \\((4,0)\\). Pyodide loads only when requested.",
      phaseRuntimeLoading:"Loading the Pyodide runtime…", phaseKernelLoading:"Loading the Atlas Lie kernel…",
      phaseCalculating:"Calculating the weight diagram in a Worker…", phaseValidating:"Validating mathematical invariants…",
      phaseRendering:"Rendering the validated result…",
      runtimeResult:"Computed \\({system}\\) highest weight \\(({labels})\\) with Pyodide {pyodide}, Python {python}, and NumPy {numpy}.",
      staticResult:"This weight is already available as static domain data; the runtime was not loaded.",
      errorPROTOCOL_MISMATCH:"The compute protocol version is not supported.",
      errorKERNEL_MISMATCH:"The Lie kernel version is not supported.",
      errorUNSUPPORTED_OPERATION:"The requested calculation is not supported.",
      errorINVALID_REQUEST:"The calculation request is malformed.",
      errorINVALID_INPUT:"Enter non-negative integer Dynkin labels with the correct rank.",
      errorLIMIT_EXCEEDED:"This input exceeds the current browser calculation limits.",
      errorCALCULATION_FAILED:"The browser calculation failed.",
      errorINVARIANT_FAILED:"The calculated result failed a mathematical invariant.",
      errorRUNTIME_LOAD_FAILED:"The local Pyodide runtime could not be loaded. Check the HTTP connection and deployed assets.",
      productStatus:"\\({summary}\\)<br>{count} distinct weights; dimension invariant: \\({dimension}={decompositionDimension}\\).",
    },
    ja: {
      title:"リー代数のルート・ウェイト・テンソル積",
      lede:"階数2・3のルート系、既約最高ウェイト指標、テンソル積成分を段階的に取り出す過程。",
      rootsTab:"1. ルート系", weightsTab:"2. 表現のウェイト", productsTab:"3. テンソル積",
      cartanType:"カルタン型", showFundamental:"基本ウェイトを表示", preset:"プリセット",
      customHighestWeight:"任意の最高ウェイト", calculateWeight:"ブラウザで計算", calculatingButton:"計算中…",
      dynkinLabelAria:"ディンキンラベル {index}",
      product:"テンソル積", extractionStep:"抽出ステップ", inspectSummand:"既約成分を確認",
      showFactors:"因子のウェイトを表示",
      rootNote:"{groups}；{note}。カルタン行列：\\(A={cartan}\\)。",
      weightStatus:"\\({system}\\) の最高ウェイト \\(({labels})\\)；公開プリセット。",
      runtimeHint:"プリセットにない最高ウェイト \\(A_2\\)、\\((4,0)\\) を試せます。Pyodideは計算を要求したときだけ読み込みます。",
      phaseRuntimeLoading:"Pyodideランタイムを読み込んでいます…", phaseKernelLoading:"Atlasのリー代数カーネルを読み込んでいます…",
      phaseCalculating:"Worker内でウェイト図を計算しています…", phaseValidating:"数学的不変量を検証しています…",
      phaseRendering:"検証済みの結果を描画しています…",
      runtimeResult:"Pyodide {pyodide}、Python {python}、NumPy {numpy}により、\\({system}\\) の最高ウェイト \\(({labels})\\) を計算しました。",
      staticResult:"このウェイトは静的な数理データとして収録済みです。ランタイムは読み込んでいません。",
      errorPROTOCOL_MISMATCH:"計算プロトコルの版に対応していません。",
      errorKERNEL_MISMATCH:"リー代数カーネルの版に対応していません。",
      errorUNSUPPORTED_OPERATION:"要求された計算には対応していません。",
      errorINVALID_REQUEST:"計算要求の形式が正しくありません。",
      errorINVALID_INPUT:"階数に合う非負整数のディンキンラベルを入力してください。",
      errorLIMIT_EXCEEDED:"この入力は現在のブラウザ計算上限を超えています。",
      errorCALCULATION_FAILED:"ブラウザ内の計算に失敗しました。",
      errorINVARIANT_FAILED:"計算結果が数学的不変量の検証に失敗しました。",
      errorRUNTIME_LOAD_FAILED:"ローカルのPyodideランタイムを読み込めませんでした。HTTP接続と配信ファイルを確認してください。",
      productStatus:"\\({summary}\\)<br>異なるウェイトは{count}個；次元の不変量：\\({dimension}={decompositionDimension}\\)。",
    },
  };
  const t = (key, values={}) => Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, value),
    MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key,
  );
  const NOTE_JA = {
    "simple, simply laced":"単純、単純結合型",
    "isomorphic to C2; the long/short convention is dual":"C2と同型；長・短ルートの規約は双対",
    "isomorphic to B2; the long/short convention is dual":"B2と同型；長・短ルートの規約は双対",
    "A1 x A1":"A1 × A1", exceptional:"例外型", "isomorphic to D3":"D3と同型",
    "odd orthogonal":"奇数次元直交型", "compact symplectic":"コンパクトシンプレクティック型",
    "isomorphic to A3":"A3と同型",
  };
  const LABEL_REPLACEMENTS = [
    ["traceless antisymmetric", "無跡反対称"], ["third fundamental", "第3基本表現"],
    ["positive half-spinor", "正半スピノル"], ["negative half-spinor", "負半スピノル"],
    ["half-spinor", "半スピノル"], ["antifundamental", "反基本表現"],
    ["fundamental", "基本表現"], ["antisymmetric", "反対称表現"], ["symmetric", "対称表現"],
    ["defining", "定義表現"], ["adjoint", "随伴表現"], ["spinor", "スピノル"],
    ["vector", "ベクトル表現"], [" plus", "+"], [" minus", "−"], [" x ", " × "],
  ];
  function localizedLabel(value) {
    if (LOCALE !== "ja") return value;
    return LABEL_REPLACEMENTS.reduce((label, [source, replacement]) => label.replaceAll(source, replacement), value);
  }
  const systemLatex = system => system.replace(/^([A-Z])(\d+)$/, "$1_{$2}");
  const matrixLatex = matrix => `\\begin{pmatrix}${matrix.map(row => row.join(" & ")).join(" \\\\ ")}\\end{pmatrix}`;
  const decompositionLatex = value => value
    .replaceAll("⊗", "\\otimes").replaceAll("⊕", "\\oplus").replaceAll("·", "\\,");
  const pendingMathTargets = new Set();
  let mathFlushScheduled = false;
  function typeset(target) {
    pendingMathTargets.add(target);
    flushMath();
  }
  function flushMath() {
    const startup = window.MathJax?.startup?.promise;
    if (!startup || mathFlushScheduled) return;
    mathFlushScheduled = true;
    startup.then(() => {
      mathFlushScheduled = false;
      const targets = [...pendingMathTargets];
      pendingMathTargets.clear();
      if (!targets.length) return;
      window.MathJax.typesetClear(targets);
      window.MathJax.typesetPromise(targets);
    });
  }
  window.addEventListener("physics-atlas:mathjax-ready", flushMath);
  function localizeStaticContent() {
    document.documentElement.lang = LOCALE;
    if (LOCALE !== "ja") return;
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
    const aria = {
      ".tabs":"エクスプローラーのセクション", "#root-plot":"ルート系の図",
      "#weight-plot":"ウェイト図", "#product-plot":"テンソル積の残余指標",
      "#component-plot":"既約成分のウェイト図",
    };
    Object.entries(aria).forEach(([selector, label]) => document.querySelector(selector)?.setAttribute("aria-label", label));
  }
  localizeStaticContent();
  await window.physicsAtlasPlotlyReady;
  const CONFIG = {scrollZoom:true, displaylogo:false, responsive:true};
  const PALETTE = {
    blue:"#3B6FB6", blueLight:"#83A6D6", blueDark:"#244A73", gold:"#C69214",
    violet:"#6A4C93", ink:"#263238", muted:"#687078", grid:"#DDE2E6", background:"#FCFCFD",
  };
  const systemKeys = Object.keys(DATA.systems);
  const byId = id => document.getElementById(id);
  const fillSystems = select => {
    select.replaceChildren(...systemKeys.map(key => new Option(`${key} — ${DATA.systems[key].groups}`, key)));
  };
  [byId("root-system"), byId("weight-system"), byId("product-system")].forEach(fillSystems);
  const draw = (target, figure) => Plotly.react(target, figure.data, figure.layout, CONFIG);
  const tupleText = values => `(${values.join(", ")})`;
  const zeroPoint = rank => Array.from({length:rank}, () => 0);
  function coordinateTrace(rank, points, attributes) {
    const trace = {
      ...attributes,
      type:rank === 2 ? "scatter" : "scatter3d",
      x:points.map(point => point === null ? null : point[0]),
      y:points.map(point => point === null ? null : point[1]),
    };
    if (rank === 3) trace.z = points.map(point => point === null ? null : point[2]);
    return trace;
  }
  function axisStyle(title, threeDimensional=false) {
    return {
      title, gridcolor:PALETTE.grid, zerolinecolor:PALETTE.muted, showspikes:false,
      ...(threeDimensional ? {showbackground:false} : {automargin:true}),
    };
  }
  function figureLayout(rank, title) {
    const layout = {
      template:null,
      title:{text:title, x:0.01, xanchor:"left", y:0.98, yanchor:"top", font:{size:18}},
      paper_bgcolor:PALETTE.background, plot_bgcolor:PALETTE.background,
      font:{family:"Arial, sans-serif", color:PALETTE.ink},
      legend:{orientation:"h", yanchor:"top", y:-0.1, xanchor:"left", x:0},
      margin:{l:55, r:25, b:125, t:90}, height:700,
    };
    if (rank === 2) {
      layout.dragmode = "pan";
      layout.xaxis = {...axisStyle("v1"), scaleanchor:"y", scaleratio:1};
      layout.yaxis = axisStyle("v2");
    } else {
      layout.scene = {
        xaxis:axisStyle("v1", true), yaxis:axisStyle("v2", true), zaxis:axisStyle("v3", true),
        aspectmode:"data", camera:{eye:{x:1.55, y:1.45, z:1.15}}, dragmode:"turntable",
      };
    }
    return layout;
  }
  function rootFigure(root, info, showFundamental) {
    const traces = [];
    for (let classIndex = 0; classIndex < root.rootLengthClassCount; classIndex += 1) {
      const indices = root.rootLengthClasses
        .map((value, index) => value === classIndex ? index : -1)
        .filter(index => index >= 0);
      const points = indices.map(index => root.displayRoots[index]);
      const segments = points.flatMap(point => [zeroPoint(root.rank), point, null]);
      const singleLength = root.rootLengthClassCount === 1;
      const name = singleLength ? "roots" : (classIndex === 0 ? "short roots" : "long roots");
      const color = singleLength ? PALETTE.blue : (classIndex === 0 ? PALETTE.blueLight : PALETTE.blueDark);
      traces.push(coordinateTrace(root.rank, segments, {
        mode:"lines", line:{color, width:root.rank === 2 ? 2 : 4}, name, hoverinfo:"skip",
      }));
      const hover = indices.map(index => {
        const point = root.displayRoots[index];
        const firstNonzero = point.find(value => Math.abs(value) > 1e-9);
        const sign = firstNonzero > 0 ? "positive" : "negative";
        const vector = point.map(value => Number(value.toFixed(4)));
        return `v = ${tupleText(vector)}<br>${sign} root<br>coroot coordinates: ${tupleText(root.rootDynkinCoordinates[index])}`;
      });
      traces.push(coordinateTrace(root.rank, points, {
        mode:"markers", marker:{size:root.rank === 2 ? 7 : 2, color}, text:hover,
        hovertemplate:"%{text}<extra></extra>", showlegend:false,
      }));
    }
    root.displaySimpleRoots.forEach((point, index) => {
      traces.push(coordinateTrace(root.rank, [zeroPoint(root.rank), point], {
        mode:"lines+markers", line:{color:PALETTE.gold, width:7},
        marker:{size:root.rank === 2 ? 8 : 3, color:PALETTE.gold},
        name:`simple root alpha${index + 1}`, hovertemplate:`alpha${index + 1}<extra></extra>`,
      }));
    });
    if (showFundamental) {
      root.displayFundamentalWeights.forEach((point, index) => {
        const labels = Array.from({length:root.rank}, (_, position) => position === index ? 1 : 0);
        traces.push(coordinateTrace(root.rank, [zeroPoint(root.rank), point], {
          mode:"lines+markers", line:{color:PALETTE.violet, width:5, dash:"dot"},
          marker:{size:root.rank === 2 ? 9 : 3, color:PALETTE.violet},
          name:`fundamental weight omega${index + 1}`,
          hovertemplate:`omega${index + 1}<br>Dynkin coordinates: ${tupleText(labels)}<extra></extra>`,
        }));
      });
    }
    return {
      data:traces,
      layout:figureLayout(root.rank, `${root.system}: ${info.groups} — ${root.displayRoots.length} roots`),
    };
  }
  function edgeSegments(diagram) {
    return diagram.edges.flatMap(([source, target]) => [
      diagram.displayWeights[source], diagram.displayWeights[target], null,
    ]);
  }
  function highestPoint(diagram) {
    const highestLevel = Math.min(...diagram.levels);
    return diagram.displayWeights[diagram.levels.indexOf(highestLevel)];
  }
  function weightFigure(diagram) {
    const rank = DATA.systems[diagram.system].rank;
    const traces = [coordinateTrace(rank, edgeSegments(diagram), {
      mode:"lines", line:{color:PALETTE.grid, width:2}, hoverinfo:"skip", name:"simple-root steps",
    })];
    const hover = diagram.dynkinCoordinates.map((labels, index) =>
      `Dynkin: ${tupleText(labels)}<br>multiplicity: ${diagram.multiplicities[index]}<br>level: ${diagram.levels[index]}`
    );
    traces.push(coordinateTrace(rank, diagram.displayWeights, {
      mode:"markers",
      marker:{
        size:diagram.multiplicities.map(value => 8 + 3 * Math.sqrt(value)),
        color:diagram.multiplicities, colorscale:[[0, PALETTE.blueLight], [1, PALETTE.blueDark]],
        line:{color:PALETTE.ink, width:1}, colorbar:{title:"multiplicity", thickness:14},
        showscale:Math.max(...diagram.multiplicities) > 1,
      },
      text:hover, hovertemplate:"%{text}<extra></extra>", name:"weights",
    }));
    traces.push(coordinateTrace(rank, [highestPoint(diagram)], {
      mode:"markers", marker:{size:14, symbol:"diamond-open", color:PALETTE.gold},
      name:"highest weight",
      hovertemplate:`highest weight ${tupleText(diagram.highestDynkin)}<extra></extra>`,
    }));
    return {
      data:traces,
      layout:figureLayout(
        rank,
        `${diagram.system} weights: highest ${tupleText(diagram.highestDynkin)} — dim ${diagram.dimension}`,
      ),
    };
  }
  function productFigure(product, stepIndex, showFactors) {
    const rank = DATA.systems[product.system].rank;
    const residual = product.steps[stepIndex];
    const traces = [];
    if (residual.displayWeights.length) {
      const hover = residual.dynkinCoordinates.map((labels, index) =>
        `Dynkin: ${tupleText(labels)}<br>residual multiplicity: ${residual.multiplicities[index]}`
      );
      traces.push(coordinateTrace(rank, residual.displayWeights, {
        mode:"markers",
        marker:{
          size:residual.multiplicities.map(value => 8 + 2.5 * Math.sqrt(value)),
          color:residual.multiplicities, colorscale:[[0, PALETTE.blueLight], [1, PALETTE.blueDark]],
          line:{color:PALETTE.ink, width:1}, colorbar:{title:"multiplicity", thickness:14},
        },
        text:hover, hovertemplate:"%{text}<extra></extra>", name:"residual weights",
      }));
    }
    if (showFactors) {
      const colors = ["#2A9D8F", "#E76F51", "#8F5DA2"];
      const symbols = ["circle-open", "square-open", "diamond-open"];
      product.factorWeightKeys.forEach((key, factorIndex) => {
        const diagram = DATA.weights[key];
        const highest = product.factors[factorIndex];
        const hover = diagram.dynkinCoordinates.map((labels, index) =>
          `factor ${factorIndex + 1}: V${tupleText(highest)}<br>Dynkin: ${tupleText(labels)}<br>multiplicity: ${diagram.multiplicities[index]}`
        );
        traces.push(coordinateTrace(rank, diagram.displayWeights, {
          mode:"markers",
          marker:{
            size:7, symbol:symbols[factorIndex], color:colors[factorIndex],
            line:{color:colors[factorIndex], width:2},
          },
          text:hover, hovertemplate:"%{text}<extra></extra>",
          name:`factor ${factorIndex + 1} weights: V${tupleText(highest)}`,
        }));
      });
    }
    const component = product.components[stepIndex];
    if (component) {
      const diagram = DATA.weights[component.weightKey];
      traces.push(coordinateTrace(rank, [highestPoint(diagram)], {
        mode:"markers", marker:{size:14, symbol:"diamond-open", color:PALETTE.gold},
        text:[`highest: ${tupleText(component.highestDynkin)}<br>dim: ${component.dimension}<br>copies: ${component.multiplicity}`],
        hovertemplate:"%{text}<extra></extra>", name:"next highest weight",
      }));
    }
    const factors = product.factors.map(tupleText).map(labels => `V${labels}`).join(" ⊗ ");
    const layout = figureLayout(
      rank,
      `${product.system}: ${factors}<br><sup>dimension ${product.dimension}; extraction step ${stepIndex}/${product.components.length}</sup>`,
    );
    if (!component && !residual.displayWeights.length) {
      layout.annotations = [{
        text:"Residual character is zero: decomposition complete", x:0.5, y:0.5,
        xref:"paper", yref:"paper", showarrow:false, font:{size:16, color:PALETTE.ink},
      }];
    }
    return {data:traces, layout};
  }

  const tabs = [...document.querySelectorAll(".tab")];
  const panels = [...document.querySelectorAll(".panel")];
  function activateTab(tab, moveFocus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.setAttribute("tabindex", active ? "0" : "-1");
    });
    panels.forEach(panel => {
      const active = panel.id === tab.dataset.panel;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    if (moveFocus) tab.focus();
    window.setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", event => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  function renderRoots() {
    const system = byId("root-system").value;
    const info = DATA.systems[system];
    draw("root-plot", rootFigure(DATA.roots[system], info, byId("root-fundamental").checked));
    byId("root-note").innerHTML = t("rootNote", {
      groups:info.groups, note:LOCALE === "ja" ? (NOTE_JA[info.note] ?? info.note) : info.note,
      cartan:matrixLatex(info.cartan),
    });
    typeset(byId("root-note"));
  }
  byId("root-system").addEventListener("change", renderRoots);
  byId("root-fundamental").addEventListener("change", renderRoots);

  function configureWeightControls() {
    const system = byId("weight-system").value;
    const info = DATA.systems[system];
    const preset = byId("weight-preset");
    preset.replaceChildren(...info.presets.map((item, i) =>
      new Option(`${localizedLabel(item.name)} — (${item.labels.join(", ")})`, i)
    ));
    configureCustomWeightInputs();
    renderWeights();
  }
  function configureCustomWeightInputs() {
    const system = byId("weight-system").value;
    const rank = DATA.systems[system].rank;
    const container = byId("weight-custom-labels");
    const labels = Array.from({length:rank}, (_, index) => {
      const label = document.createElement("label");
      const symbol = document.createElement("span");
      symbol.textContent = `\\(a_{${index + 1}}\\)`;
      const input = document.createElement("input");
      input.type = "number"; input.min = "0"; input.max = String(DATA.runtime.limits.maxDynkinLabel);
      input.step = "1"; input.value = index === 0 ? "4" : "0";
      input.setAttribute("aria-label", t("dynkinLabelAria", {index:index + 1}));
      label.append(symbol, input);
      return label;
    });
    container.replaceChildren(...labels);
    typeset(container);
    byId("weight-runtime-status").textContent = "";
  }
  function renderWeights() {
    const system = byId("weight-system").value;
    const item = DATA.systems[system].presets[Number(byId("weight-preset").value)];
    draw("weight-plot", weightFigure(DATA.weights[item.weightKey]));
    byId("weight-status").innerHTML = t("weightStatus", {
      system:systemLatex(system), labels:item.labels.join(", "),
    });
    typeset(byId("weight-status"));
  }
  byId("weight-system").addEventListener("change", configureWeightControls);
  byId("weight-preset").addEventListener("change", renderWeights);

  let requestSequence = 0;
  let computeProviderPromise = null;
  function runtimeBaseUrl() {
    const siteRoot = LOCALE === "ja" ? "../../../../" : "../../../";
    return new URL(
      `${siteRoot}mathematics-for-physics/lie-roots-weights-products/app/runtime/`,
      window.location.href,
    );
  }
  function getComputeProvider() {
    if (!computeProviderPromise) {
      const base = runtimeBaseUrl();
      computeProviderPromise = import(new URL(DATA.runtime.providerAsset, base)).then(module =>
        new module.PyodideComputeProvider({workerUrl:new URL(DATA.runtime.workerAsset, base)})
      );
    }
    return computeProviderPromise;
  }
  function setRuntimeStatus(message) {
    const target = byId("weight-runtime-status");
    target.textContent = message;
    typeset(target);
  }
  const PHASE_MESSAGES = {
    "runtime-loading":"phaseRuntimeLoading", "kernel-loading":"phaseKernelLoading",
    calculating:"phaseCalculating", validating:"phaseValidating", rendering:"phaseRendering",
  };
  function customLabels() {
    const values = [...byId("weight-custom-labels").querySelectorAll("input")].map(input => Number(input.value));
    const maximum = DATA.runtime.limits.maxDynkinLabel;
    if (values.some(value => !Number.isInteger(value) || value < 0 || value > maximum)) return null;
    return values;
  }
  async function calculateCustomWeight() {
    const button = byId("weight-compute");
    const system = byId("weight-system").value;
    const labels = customLabels();
    if (!labels) {
      setRuntimeStatus(t("errorINVALID_INPUT"));
      return;
    }
    const key = `${system}|${labels.join(",")}`;
    if (DATA.weights[key]) {
      draw("weight-plot", weightFigure(DATA.weights[key]));
      byId("weight-status").textContent = "";
      setRuntimeStatus(t("staticResult"));
      return;
    }
    button.disabled = true; button.textContent = t("calculatingButton");
    const request = {
      protocol:DATA.runtime.protocol,
      requestId:`weight-${Date.now()}-${++requestSequence}`,
      kernelVersion:DATA.runtime.kernelVersion,
      operation:DATA.runtime.operation,
      input:{system, highestDynkin:labels},
      limits:{
        maxCandidates:DATA.runtime.limits.maxCandidates,
        maxResultWeights:DATA.runtime.limits.maxResultWeights,
      },
    };
    try {
      const provider = await getComputeProvider();
      const response = await provider.compute(request, {onPhase:phase => {
        const key = PHASE_MESSAGES[phase];
        if (key) setRuntimeStatus(t(key));
      }});
      if (!response.ok) {
        setRuntimeStatus(t(`error${response.error?.code ?? "CALCULATION_FAILED"}`));
        return;
      }
      setRuntimeStatus(t("phaseRendering"));
      draw("weight-plot", weightFigure(response.result));
      byId("weight-status").textContent = "";
      setRuntimeStatus(t("runtimeResult", {
        system:systemLatex(system), labels:labels.join(", "), pyodide:response.runtime.version,
        python:response.runtime.pythonVersion, numpy:response.runtime.numpyVersion,
      }));
    } catch (error) {
      console.error(error);
      setRuntimeStatus(t("errorRUNTIME_LOAD_FAILED"));
    } finally {
      button.disabled = false; button.textContent = t("calculateWeight");
    }
  }
  byId("weight-compute").addEventListener("click", calculateCustomWeight);

  function currentProduct() {
    return DATA.products[byId("product-system").value][Number(byId("product-case").value)];
  }
  function configureProductCases() {
    const cases = DATA.products[byId("product-system").value];
    byId("product-case").replaceChildren(...cases.map((item, i) => new Option(localizedLabel(item.name), i)));
    configureProductState();
  }
  function configureProductState() {
    const product = currentProduct();
    const step = byId("product-step");
    step.max = product.steps.length - 1; step.value = 0;
    const component = byId("product-component");
    component.replaceChildren(...product.components.map((item, i) => new Option(
      LOCALE === "ja" ? item.name.replace("dim", "次元").replace(" x ", " × ") : item.name, i
    )));
    renderProduct(); renderComponent();
  }
  function renderProduct() {
    const product = currentProduct();
    const step = Number(byId("product-step").value);
    byId("product-step-value").textContent = `${step} / ${product.steps.length - 1}`;
    draw("product-plot", productFigure(product, step, byId("product-factors").checked));
    byId("product-status").innerHTML = t("productStatus", {
      summary:decompositionLatex(product.summary), count:product.distinctWeights, dimension:product.dimension,
      decompositionDimension:product.decompositionDimension,
    });
    typeset(byId("product-status"));
  }
  function renderComponent() {
    const product = currentProduct();
    const component = product.components[Number(byId("product-component").value)];
    draw("component-plot", weightFigure(DATA.weights[component.weightKey]));
  }
  byId("product-system").addEventListener("change", configureProductCases);
  byId("product-case").addEventListener("change", configureProductState);
  byId("product-step").addEventListener("input", renderProduct);
  byId("product-component").addEventListener("change", renderComponent);
  byId("product-factors").addEventListener("change", renderProduct);

  renderRoots();
  configureWeightControls();
  configureProductCases();
  })().catch(error => {
    console.error(error);
    const japanese = new URLSearchParams(window.location.search).get("lang") === "ja";
    const target = document.getElementById("application-error");
    target.textContent = japanese
      ? "可視化の描画ライブラリを読み込めませんでした。HTTP接続と配信ファイルを確認してください。"
      : "The visualization library could not be loaded. Check the HTTP connection and deployed assets.";
    target.hidden = false;
    window.dispatchEvent(new Event("resize"));
  });
</script>
</body>
</html>
"""
