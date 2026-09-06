"use strict";

const DATA = JSON.parse(document.getElementById("runtime-manifest").textContent);
const byId = id => document.getElementById(id);
const LOCALE = new URLSearchParams(location.search).get("lang") === "ja" ? "ja" : "en";

const TEXT = {
  en: {
    siteNav:"Site navigation", field:"Quantum mechanics", title:"Partial-Wave Scattering",
    lede:"Construct a plane wave from angular-momentum channels, then see how a central potential changes their phases and the outgoing field.",
    loading:"Loading the Python calculation runtime…", runtimeLoading:"Loading Pyodide and NumPy…",
    kernelLoading:"Loading the partial-wave Python kernel…", calculating:"Calculating in Python…",
    validating:"Checking the calculation…", ready:"Python calculation complete.", cached:"Loaded the calculation from memory.",
    error:"The browser calculation failed. Reload the page and check the HTTP connection.",
    planeTitle:"Building a plane wave", planeText:"The same Python partial sum is shown as a three-dimensional isosurface and as three slices: the current sum, the next channel, and their sum.",
    back:"Back", add:"Add", threeD:"3-D partial sum", rotate:"Drag to rotate; wheel to zoom",
    addition:"Addition on the y = 0 plane", sameSnapshot:"Real part at the same phase",
    scatterTitle:"Scattering from a central potential", scatterText:"Changing a control runs the radial Schrödinger calculation in Python inside the browser. The phase shifts, field, and resonance diagnostics all come from that result.",
    presetsAria:"Potential presets", well:"Attractive well", barrier:"Repulsive barrier", coreWell:"Core and well",
    strength:"Gaussian strength \\(U_0\\)", range:"Range \\(a\\)", core:"Repulsive core \\(U_c\\)", energy:"Energy \\(E=k^2\\)",
    potentialPhase:"Potential and phase shifts", resonance:"Selected-channel resonance diagnostic",
    fieldModeAria:"Scattering field", total:"Incident + scattered", scattered:"Scattered only",
    channel:"Resonance channel", fieldComparison:"Scattering field on the y = 0 plane",
    maskNote:"The gray disk masks the potential interior, where the asymptotic outgoing-wave expression is not used.",
    convention:"Convention: \\(\\hbar^2/(2\\mu)=1\\). The Gaussian model is elastic and central; the displayed exterior field uses the asymptotic scattering form.",
    plane3dAria:"Three-dimensional plane-wave partial sum", plane2dAria:"Partial-wave addition on the y equals zero plane",
    current:"Current sum", next:"Next channel", after:"After addition", potential:"potential", phaseShifts:"phase shifts",
    phase:"phase", strengthCurve:"sin² phase", interacting:"interacting", free:"free", radial:"radial wave",
    crossSection:"total cross section", enhancement:"interior enhancement",
  },
  ja: {
    siteNav:"サイトナビゲーション", field:"量子力学", title:"部分波散乱",
    lede:"角運動量チャネルから平面波を構成し、中心力ポテンシャルが各チャネルの位相と外向き散乱場をどう変えるかを調べます。",
    loading:"Python計算ランタイムを読み込んでいます…", runtimeLoading:"PyodideとNumPyを読み込んでいます…",
    kernelLoading:"部分波Pythonカーネルを読み込んでいます…", calculating:"Pythonで計算しています…",
    validating:"計算結果を検証しています…", ready:"Python計算が完了しました。", cached:"計算結果をメモリから読み込みました。",
    error:"ブラウザ内計算に失敗しました。ページを再読み込みし、HTTP接続を確認してください。",
    planeTitle:"平面波を部分波から組み立てる", planeText:"同じPython部分和を、三次元等値面と三つの断面（現在の和、次のチャネル、加算後）で表示します。",
    back:"戻す", add:"加える", threeD:"三次元部分和", rotate:"ドラッグで回転、ホイールでズーム",
    addition:"\\(y=0\\) 平面での加算", sameSnapshot:"同じ位相における実部",
    scatterTitle:"中心力ポテンシャルによる散乱", scatterText:"操作を変えるたびに、ブラウザ内のPythonで動径Schrödinger方程式を計算します。位相シフト、散乱場、共鳴診断はすべてその結果に基づきます。",
    presetsAria:"ポテンシャルのプリセット", well:"引力井戸", barrier:"斥力障壁", coreWell:"芯と井戸",
    strength:"Gaussian強度 \\(U_0\\)", range:"到達距離 \\(a\\)", core:"短距離斥力 \\(U_c\\)", energy:"エネルギー \\(E=k^2\\)",
    potentialPhase:"ポテンシャルと位相シフト", resonance:"選択チャネルの共鳴診断",
    fieldModeAria:"散乱場", total:"入射波＋散乱波", scattered:"散乱波のみ",
    channel:"共鳴チャネル", fieldComparison:"\\(y=0\\) 平面上の散乱場",
    maskNote:"灰色の円内はポテンシャル内部として除外し、漸近的な外向き散乱波を適用しません。",
    convention:"規約：\\(\\hbar^2/(2\\mu)=1\\)。Gaussian模型は弾性的な中心力散乱で、外部場には漸近散乱形を用いています。",
    plane3dAria:"平面波部分和の三次元表示", plane2dAria:"y=0平面における部分波の加算",
    current:"現在の和", next:"次のチャネル", after:"加算後", potential:"ポテンシャル", phaseShifts:"位相シフト",
    phase:"位相", strengthCurve:"sin² 位相", interacting:"ポテンシャルあり", free:"自由波", radial:"動径波",
    crossSection:"全断面積", enhancement:"内部増幅率",
  },
};

const t = key => TEXT[LOCALE][key] ?? key;
const status = byId("runtime-status");
document.documentElement.lang = LOCALE;
document.title = `${t("title")} — Interactive Physics Atlas`;
byId("brand-home").href = LOCALE === "ja" ? "../../../ja/" : "../../";
byId("locale-link").href = LOCALE === "ja"
  ? "../../../quantum-mechanics/partial-wave-scattering/?lang=en"
  : "../../ja/quantum-mechanics/partial-wave-scattering/?lang=ja";
byId("locale-link").textContent = LOCALE === "ja" ? "English" : "日本語";
byId("locale-link").lang = LOCALE === "ja" ? "en" : "ja";
document.querySelectorAll("[data-i18n]").forEach(element => {
  element.textContent = t(element.dataset.i18n);
});
document.querySelectorAll("[data-i18n-aria]").forEach(element => {
  element.setAttribute("aria-label", t(element.dataset.i18nAria));
});
if (window.MathJax?.startup?.promise) {
  window.MathJax.startup.promise.then(() => {
    const targets = [...document.querySelectorAll("[data-i18n]")];
    window.MathJax.typesetClear?.(targets);
    return window.MathJax.typesetPromise?.(targets);
  });
}

await window.physicsAtlasPlotlyReady;

const root = LOCALE === "ja" ? "../../../" : "../../";
const runtimeBase = new URL(`${root}quantum-mechanics/partial-wave-scattering/runtime/`, location.href);
const providerModule = await import(new URL(DATA.providerAsset, runtimeBase));
const provider = new providerModule.PyodideComputeProvider({
  workerUrl:new URL(DATA.workerAsset, runtimeBase),
  resultSchemas:DATA.resultSchemas,
  runtime:{
    name:"pyodide", version:DATA.pyodideVersion,
    pythonVersion:DATA.pythonVersion, numpyVersion:DATA.numpyVersion,
  },
  cacheEntries:DATA.limits.memoryCacheEntries,
  maximumTimeoutMs:DATA.limits.hardMaxElapsedMs,
});

const CONFIG = {
  responsive:true,
  displaylogo:false,
  scrollZoom:true,
  modeBarButtonsToRemove:["lasso2d", "select2d"],
};
const theme = getComputedStyle(document.documentElement);
const themeColor = (name, fallback) => theme.getPropertyValue(name).trim() || fallback;
const COLORS = {
  blue:"#3B6FB6", orange:"#D9772B", violet:"#69558F", gold:"#B68516",
  ink:"#263238", muted:"#667078", grid:themeColor("--atlas-viz-border", "#DDE2E6"),
  panel:themeColor("--atlas-viz-panel", "#FCFCFD"), mask:"#D7DBDE",
};

function baseLayout(height) {
  return {
    template:null,
    height,
    margin:{l:55, r:24, t:38, b:52},
    paper_bgcolor:COLORS.panel,
    plot_bgcolor:COLORS.panel,
    font:{family:"Arial, sans-serif", color:COLORS.ink, size:11},
    hoverlabel:{font:{size:11}},
    dragmode:"pan",
  };
}

function axis(title) {
  return {title, gridcolor:COLORS.grid, zerolinecolor:COLORS.muted, automargin:true};
}

function setStatus(key, error = false) {
  status.textContent = t(key);
  status.classList.toggle("error", error);
}

const PHASE_STATUS = {
  "runtime-loading":"runtimeLoading",
  "kernel-loading":"kernelLoading",
  calculating:"calculating",
  validating:"validating",
  "cache-hit":"cached",
};

let sequence = 0;
let latestRequest = "";
async function compute(operation, input) {
  const request = {
    protocol:DATA.protocol,
    requestId:`partial-wave-${Date.now()}-${++sequence}`,
    kernelVersion:DATA.kernelVersion,
    operation,
    input,
    limits:{maxElapsedMs:DATA.limits.maxElapsedMs},
  };
  latestRequest = request.requestId;
  const response = await provider.compute(request, {
    onPhase:phase => {
      if (latestRequest === request.requestId) setStatus(PHASE_STATUS[phase] ?? "calculating");
    },
  });
  if (latestRequest !== request.requestId) return null;
  if (!response.ok) {
    if (["CANCELLED", "SUPERSEDED"].includes(response.error?.code)) return null;
    setStatus("error", true);
    return null;
  }
  setStatus(response.provider?.cacheHit ? "cached" : "ready");
  return response.result;
}

function meshCoordinates(values) {
  const x = [], y = [], z = [];
  for (const xValue of values) {
    for (const yValue of values) {
      for (const zValue of values) {
        x.push(xValue); y.push(yValue); z.push(zValue);
      }
    }
  }
  return {x, y, z};
}

function plane2dTrace(name, values, domainIndex) {
  const suffix = domainIndex === 1 ? "" : String(domainIndex);
  return {
    type:"heatmap", name, z:values, coloraxis:"coloraxis",
    xaxis:`x${suffix}`, yaxis:`y${suffix}`, hovertemplate:"x=%{x:.2f} λ<br>z=%{y:.2f} λ<br>Re ψ=%{z:.3f}<extra></extra>",
  };
}

async function renderPlane(result) {
  const coordinates = meshCoordinates(result.axis3d);
  const figure3d = [{
    type:"isosurface", ...coordinates, value:result.field3d,
    isomin:-.85, isomax:.85, surface:{count:7}, opacity:.62,
    colorscale:[[0, COLORS.blue], [.5, "#F7F8FA"], [1, COLORS.orange]],
    caps:{x:{show:false}, y:{show:false}, z:{show:false}},
    colorbar:{title:"Re ψ", thickness:13, len:.65},
    hovertemplate:"x=%{x:.2f} λ<br>y=%{y:.2f} λ<br>z=%{z:.2f} λ<br>Re ψ=%{value:.3f}<extra></extra>",
  }];
  const layout3d = {
    ...baseLayout(560), margin:{l:4, r:4, t:8, b:4}, dragmode:false,
    scene:{
      xaxis:axis("x / λ"), yaxis:axis("y / λ"), zaxis:axis("z / λ"),
      aspectmode:"cube", dragmode:"turntable", camera:{eye:{x:1.5, y:1.35, z:1.15}},
    },
  };
  const a = result.axis2d;
  const traces2d = [
    {...plane2dTrace(t("current"), result.current, 1), x:a, y:a},
    {...plane2dTrace(t("next"), result.next, 2), x:a, y:a},
    {...plane2dTrace(t("after"), result.after, 3), x:a, y:a},
  ];
  const layout2d = {
    ...baseLayout(560),
    margin:{l:54, r:70, t:58, b:52},
    coloraxis:{colorscale:[[0, COLORS.blue], [.5, "#F7F8FA"], [1, COLORS.orange]], cmin:-1.2, cmax:1.2, colorbar:{title:"Re ψ", thickness:12}},
    xaxis:{...axis("x / λ"), domain:[0, .29]}, yaxis:{...axis("z / λ"), scaleanchor:"x", scaleratio:1},
    xaxis2:{...axis("x / λ"), domain:[.355, .645]}, yaxis2:{...axis("z / λ"), scaleanchor:"x2", scaleratio:1},
    xaxis3:{...axis("x / λ"), domain:[.71, 1]}, yaxis3:{...axis("z / λ"), scaleanchor:"x3", scaleratio:1},
    annotations:[
      {text:t("current"), x:.145, y:1.08, xref:"paper", yref:"paper", showarrow:false},
      {text:`${t("next")} ℓ=${result.nextEll}`, x:.5, y:1.08, xref:"paper", yref:"paper", showarrow:false},
      {text:t("after"), x:.855, y:1.08, xref:"paper", yref:"paper", showarrow:false},
    ],
  };
  await Promise.all([
    Plotly.react("plane-3d", figure3d, layout3d, CONFIG),
    Plotly.react("plane-2d", traces2d, layout2d, CONFIG),
  ]);
}

const parameterIds = ["strength", "range", "core", "energy"];
function parameters() {
  return Object.fromEntries(parameterIds.map(id => [id, Number(byId(id).value)]));
}

function updateParameterOutputs() {
  const values = parameters();
  byId("strength-output").textContent = values.strength.toFixed(1).replace("-", "−");
  byId("range-output").textContent = values.range.toFixed(2);
  byId("core-output").textContent = values.core.toFixed(1);
  byId("energy-output").textContent = values.energy.toFixed(2);
}

const scatterState = {maximumEll:0, fieldMode:"total", resonanceEll:0};
function updateScatterControls() {
  byId("scatter-ell-output").textContent = scatterState.maximumEll;
  byId("scatter-next-output").textContent = Math.min(10, scatterState.maximumEll + 1);
  byId("scatter-back").disabled = scatterState.maximumEll === 0;
  byId("scatter-add").disabled = scatterState.maximumEll === 10;
}

function maskShapes(radius) {
  return ["", "2", "3"].map(suffix => ({
    type:"circle", xref:`x${suffix}`, yref:`y${suffix}`,
    x0:-radius, x1:radius, y0:-radius, y1:radius,
    fillcolor:COLORS.mask, line:{color:COLORS.muted, width:1}, layer:"below",
  }));
}

function scatteringHeatmap(name, z, index, axisValues) {
  const suffix = index === 1 ? "" : String(index);
  return {
    type:"heatmap", name, z, x:axisValues, y:axisValues, coloraxis:"coloraxis",
    xaxis:`x${suffix}`, yaxis:`y${suffix}`, connectgaps:false,
    hovertemplate:"x=%{x:.2f}<br>z=%{y:.2f}<br>Re ψ=%{z:.3f}<extra></extra>",
  };
}

async function renderScattering(result) {
  const potentialPhaseData = [
    {type:"scatter", mode:"lines", x:result.potential.radius, y:result.potential.value, name:t("potential"), line:{color:result.parameters.strength < 0 ? COLORS.blue : COLORS.orange, width:2.2}},
    {type:"scatter", mode:"lines", x:[0, 4.5], y:[result.parameters.energy, result.parameters.energy], name:"E", line:{color:COLORS.gold, width:1.4, dash:"dash"}},
    {type:"bar", x:result.phases.map((_, ell) => ell), y:result.phases, marker:{color:result.phaseStrengths, colorscale:[[0, "#C8D6E5"], [1, COLORS.violet]], cmin:0, cmax:1}, name:t("phaseShifts"), xaxis:"x2", yaxis:"y2", hovertemplate:"ℓ=%{x}<br>δ=%{y:.4f}<extra></extra>"},
  ];
  const potentialPhaseLayout = {
    ...baseLayout(390), showlegend:false, margin:{l:58, r:20, t:28, b:50},
    xaxis:{...axis("r"), domain:[0, .45]}, yaxis:axis("U(r), E"),
    xaxis2:{...axis("ℓ"), domain:[.57, 1], dtick:1}, yaxis2:{...axis("δℓ"), range:[-Math.PI / 2, Math.PI / 2], tickvals:[-Math.PI / 2, 0, Math.PI / 2], ticktext:["−π/2", "0", "+π/2"]},
  };

  const resonanceData = [
    {type:"scatter", mode:"lines", x:result.resonance.energy, y:result.resonance.phase, name:t("phase"), line:{color:COLORS.violet, width:2}, xaxis:"x", yaxis:"y"},
    {type:"scatter", mode:"lines", x:result.resonance.energy, y:result.resonance.strength, name:t("strengthCurve"), line:{color:COLORS.gold, width:1.5, dash:"dash"}, xaxis:"x", yaxis:"y2"},
    {type:"scatter", mode:"lines", x:result.resonance.radius, y:result.resonance.radial, name:t("interacting"), line:{color:COLORS.violet, width:2}, xaxis:"x3", yaxis:"y3"},
    {type:"scatter", mode:"lines", x:result.resonance.radius, y:result.resonance.freeRadial, name:t("free"), line:{color:COLORS.muted, width:1.3, dash:"dash"}, xaxis:"x3", yaxis:"y3"},
  ];
  const resonanceLayout = {
    ...baseLayout(390), margin:{l:58, r:52, t:28, b:50},
    legend:{orientation:"h", x:0, y:1.16, font:{size:10}},
    xaxis:{...axis("E"), domain:[0, .46]}, yaxis:axis("δℓ"),
    yaxis2:{overlaying:"y", side:"right", range:[0, 1], title:"sin²δ", showgrid:false},
    xaxis3:{...axis("r"), domain:[.59, 1]}, yaxis3:axis("uℓ(r)"),
  };

  const field = result.field;
  const fieldData = [
    scatteringHeatmap(t("current"), field.current, 1, field.axis),
    scatteringHeatmap(t("next"), field.next, 2, field.axis),
    scatteringHeatmap(t("after"), field.after, 3, field.axis),
  ];
  const fieldLayout = {
    ...baseLayout(500), margin:{l:54, r:72, t:55, b:52},
    coloraxis:{colorscale:[[0, COLORS.blue], [.5, "#F7F8FA"], [1, COLORS.orange]], cmid:0, colorbar:{title:"Re ψ", thickness:12}},
    xaxis:{...axis("x"), domain:[0, .29]}, yaxis:{...axis("z"), scaleanchor:"x", scaleratio:1},
    xaxis2:{...axis("x"), domain:[.355, .645]}, yaxis2:{...axis("z"), scaleanchor:"x2", scaleratio:1},
    xaxis3:{...axis("x"), domain:[.71, 1]}, yaxis3:{...axis("z"), scaleanchor:"x3", scaleratio:1},
    shapes:maskShapes(field.maskRadius),
    annotations:[
      {text:`${t("current")} ℓ≤${result.maximumEll}`, x:.145, y:1.08, xref:"paper", yref:"paper", showarrow:false},
      {text:`${t("next")} ℓ=${result.nextEll}`, x:.5, y:1.08, xref:"paper", yref:"paper", showarrow:false},
      {text:t("after"), x:.855, y:1.08, xref:"paper", yref:"paper", showarrow:false},
    ],
  };
  byId("cross-section").textContent = `${t("crossSection")} σ = ${result.crossSection.toFixed(3)} · ${t("enhancement")} = ${result.resonance.enhancement.toFixed(2)}`;
  await Promise.all([
    Plotly.react("potential-phase", potentialPhaseData, potentialPhaseLayout, CONFIG),
    Plotly.react("resonance", resonanceData, resonanceLayout, CONFIG),
    Plotly.react("scattering-field", fieldData, fieldLayout, CONFIG),
  ]);
}

let planeTimer = null;
async function requestPlane() {
  planeTimer = null;
  const maximumEll = Number(byId("plane-ell").value);
  byId("plane-ell-output").textContent = maximumEll;
  byId("plane-next-output").textContent = Math.min(12, maximumEll + 1);
  byId("plane-back").disabled = maximumEll === 0;
  byId("plane-add").disabled = maximumEll === 12;
  const result = await compute(DATA.operations.plane.name, {maximumEll});
  if (result) await renderPlane(result);
}

function schedulePlane() {
  clearTimeout(planeTimer);
  planeTimer = setTimeout(requestPlane, 160);
}

let scatterTimer = null;
async function requestScattering() {
  scatterTimer = null;
  updateParameterOutputs();
  updateScatterControls();
  const result = await compute(DATA.operations.scattering.name, {
    ...parameters(),
    maximumEll:scatterState.maximumEll,
    fieldMode:scatterState.fieldMode,
    resonanceEll:scatterState.resonanceEll,
  });
  if (result) await renderScattering(result);
}

function scheduleScattering() {
  clearTimeout(scatterTimer);
  scatterTimer = setTimeout(requestScattering, 260);
}

byId("plane-ell").addEventListener("input", event => {
  byId("plane-ell-output").textContent = event.target.value;
  byId("plane-next-output").textContent = Math.min(12, Number(event.target.value) + 1);
  schedulePlane();
});
byId("plane-back").addEventListener("click", () => {
  byId("plane-ell").value = Math.max(0, Number(byId("plane-ell").value) - 1);
  schedulePlane();
});
byId("plane-add").addEventListener("click", () => {
  byId("plane-ell").value = Math.min(12, Number(byId("plane-ell").value) + 1);
  schedulePlane();
});

parameterIds.forEach(id => byId(id).addEventListener("input", () => {
  document.querySelectorAll("[data-preset]").forEach(button => button.classList.remove("active"));
  updateParameterOutputs();
  scheduleScattering();
}));

const PRESETS = {
  well:{strength:-8, range:1.15, core:0},
  barrier:{strength:8, range:1.05, core:0},
  coreWell:{strength:-11, range:1.35, core:18},
};
document.querySelectorAll("[data-preset]").forEach(button => {
  button.addEventListener("click", () => {
    Object.entries(PRESETS[button.dataset.preset]).forEach(([id, value]) => { byId(id).value = value; });
    document.querySelectorAll("[data-preset]").forEach(item => item.classList.toggle("active", item === button));
    scatterState.maximumEll = 0;
    updateParameterOutputs();
    scheduleScattering();
  });
});

document.querySelectorAll("[data-field-mode]").forEach(button => {
  button.addEventListener("click", () => {
    scatterState.fieldMode = button.dataset.fieldMode;
    document.querySelectorAll("[data-field-mode]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    scheduleScattering();
  });
});
byId("scatter-back").addEventListener("click", () => {
  scatterState.maximumEll = Math.max(0, scatterState.maximumEll - 1);
  scheduleScattering();
});
byId("scatter-add").addEventListener("click", () => {
  scatterState.maximumEll = Math.min(10, scatterState.maximumEll + 1);
  scheduleScattering();
});

for (let ell = 0; ell <= 10; ell += 1) byId("resonance-ell").add(new Option(`ℓ = ${ell}`, String(ell)));
byId("resonance-ell").addEventListener("change", event => {
  scatterState.resonanceEll = Number(event.target.value);
  scheduleScattering();
});

window.addEventListener("pagehide", () => provider.dispose(), {once:true});
updateParameterOutputs();
updateScatterControls();
await requestPlane();
await requestScattering();
