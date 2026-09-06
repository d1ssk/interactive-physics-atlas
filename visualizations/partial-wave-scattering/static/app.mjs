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
    plane3dAria:"Three-dimensional plane-wave partial sum", plane2dAria:"Partial-wave addition on the y equals zero plane",
    scatteringFieldAria:"Scattering field on the y equals zero plane",
    current:"Current sum", next:"Next channel", after:"After addition", potential:"potential", phaseShifts:"phase shifts",
    phase:"phase", strengthCurve:"sin² phase", interacting:"interacting", free:"free", radial:"radial wave",
    crossSection:"total cross section", enhancement:"interior radial-weight ratio",
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
    plane3dAria:"平面波部分和の三次元表示", plane2dAria:"y=0平面における部分波の加算",
    scatteringFieldAria:"y=0平面における散乱場",
    current:"現在の和", next:"次のチャネル", after:"加算後", potential:"ポテンシャル", phaseShifts:"位相シフト",
    phase:"位相", strengthCurve:"sin² 位相", interacting:"ポテンシャルあり", free:"自由波", radial:"動径波",
    crossSection:"全断面積", enhancement:"内部動径重み比",
  },
};

const t = key => TEXT[LOCALE][key] ?? key;
const status = byId("runtime-status");
document.documentElement.lang = LOCALE;
document.title = `${t("title")} — Interactive Physics Atlas`;
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

const root = LOCALE === "ja" ? "../../../../" : "../../../";
const runtimeBase = new URL(`${root}quantum-mechanics/partial-wave-scattering/app/runtime/`, location.href);
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
  panel:themeColor("--atlas-viz-panel", "#FCFCFD"),
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

function interpolate(left, right, fraction) {
  return left.map((value, index) => Math.round(value + (right[index] - value) * fraction));
}

function fieldColor(value, scale) {
  const normalized = Math.max(-1, Math.min(1, value / Math.max(scale, 1e-12)));
  return normalized < 0
    ? interpolate([247, 248, 250], [59, 111, 182], -normalized)
    : interpolate([247, 248, 250], [217, 119, 43], normalized);
}

function sharedScale(matrices) {
  const sample = matrices.flatMap(matrix => matrix.flat().filter(Number.isFinite).map(Math.abs));
  sample.sort((left, right) => left - right);
  return sample[Math.min(sample.length - 1, Math.floor(.985 * sample.length))] || 1;
}

function drawField(canvas, matrix, axisValues, scale) {
  const width = Math.max(120, canvas.clientWidth);
  const height = Math.max(160, canvas.clientHeight);
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);
  const margin = {left:30, right:8, top:8, bottom:26};
  const side = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
  const left = margin.left + Math.max(0, (width - margin.left - margin.right - side) / 2);
  const top = margin.top + Math.max(0, (height - margin.top - margin.bottom - side) / 2);
  const size = matrix.length;
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = size;
  imageCanvas.height = size;
  const imageContext = imageCanvas.getContext("2d");
  const image = imageContext.createImageData(size, size);
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const value = matrix[row][column];
      const pixel = 4 * ((size - row - 1) * size + column);
      const color = Number.isFinite(value) ? fieldColor(value, scale) : [211, 216, 220];
      image.data[pixel] = color[0];
      image.data[pixel + 1] = color[1];
      image.data[pixel + 2] = color[2];
      image.data[pixel + 3] = 255;
    }
  }
  imageContext.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = true;
  context.drawImage(imageCanvas, left, top, side, side);
  context.strokeStyle = COLORS.grid;
  context.strokeRect(left, top, side, side);
  context.fillStyle = COLORS.muted;
  context.font = "10px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("x", left + side / 2, top + side + 20);
  context.fillText(axisValues[0].toFixed(1), left, top + side + 20);
  context.fillText(axisValues.at(-1).toFixed(1), left + side, top + side + 20);
  context.save();
  context.translate(left - 20, top + side / 2);
  context.rotate(-Math.PI / 2);
  context.fillText("z", 0, 0);
  context.restore();
}

let lastPlaneResult = null;
let lastScatteringResult = null;

function drawPlaneSlices(result) {
  const matrices = [result.current, result.next, result.after];
  const scale = sharedScale(matrices);
  drawField(byId("plane-current"), result.current, result.axis2d, scale);
  drawField(byId("plane-next"), result.next, result.axis2d, scale);
  drawField(byId("plane-after"), result.after, result.axis2d, scale);
  byId("plane-next-label").textContent = `ℓ=${result.nextEll}`;
}

async function renderPlane(result) {
  lastPlaneResult = result;
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
  drawPlaneSlices(result);
  await Plotly.react("plane-3d", figure3d, layout3d, CONFIG);
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

async function renderScattering(result) {
  lastScatteringResult = result;
  const phaseLines = result.phases.flatMap((value, ell) => [
    {ell, value:0}, {ell, value}, {ell:null, value:null},
  ]);
  const potentialPhaseData = [
    {type:"scatter", mode:"lines", x:result.potential.radius, y:result.potential.value, name:t("potential"), line:{color:result.parameters.strength < 0 ? COLORS.blue : COLORS.orange, width:2.2}},
    {type:"scatter", mode:"lines", x:[0, 4.5], y:[result.parameters.energy, result.parameters.energy], name:"E", line:{color:COLORS.gold, width:1.4, dash:"dash"}},
    {type:"scatter", mode:"lines", x:phaseLines.map(point => point.ell), y:phaseLines.map(point => point.value), line:{color:COLORS.grid, width:5}, showlegend:false, hoverinfo:"skip", xaxis:"x2", yaxis:"y2"},
    {type:"scatter", mode:"markers", x:result.phases.map((_, ell) => ell), y:result.phases, marker:{size:9, color:result.phaseStrengths, colorscale:[[0, "#C8D6E5"], [1, COLORS.violet]], cmin:0, cmax:1}, name:t("phaseShifts"), xaxis:"x2", yaxis:"y2", hovertemplate:"ℓ=%{x}<br>δ=%{y:.4f}<extra></extra>"},
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
  const fieldScale = sharedScale([field.current, field.next, field.after]);
  drawField(byId("field-current"), field.current, field.axis, fieldScale);
  drawField(byId("field-next"), field.next, field.axis, fieldScale);
  drawField(byId("field-after"), field.after, field.axis, fieldScale);
  byId("field-current-label").textContent = `${t("current")} ℓ≤${result.maximumEll}`;
  byId("field-next-label").textContent = `${t("next")} ℓ=${result.nextEll}`;
  byId("cross-section").textContent = `${t("crossSection")} σ = ${result.crossSection.toFixed(3)} · ${t("enhancement")} (ℓ=${result.resonanceEll}) = ${result.resonance.enhancement.toFixed(2)}`;
  await Promise.all([
    Plotly.react("potential-phase", potentialPhaseData, potentialPhaseLayout, CONFIG),
    Plotly.react("resonance", resonanceData, resonanceLayout, CONFIG),
  ]);
}

let planeTimer = null;
const planeEllInputs = [byId("plane-ell"), byId("plane-ell-slices")];
const planeEllOutputs = [byId("plane-ell-output"), byId("plane-ell-slices-output")];

function setPlaneEll(value) {
  const maximumEll = Math.max(0, Math.min(12, Number(value)));
  planeEllInputs.forEach(input => { input.value = maximumEll; });
  planeEllOutputs.forEach(output => { output.textContent = maximumEll; });
  byId("plane-next-output").textContent = Math.min(12, maximumEll + 1);
  byId("plane-back").disabled = maximumEll === 0;
  byId("plane-add").disabled = maximumEll === 12;
}

async function requestPlane() {
  planeTimer = null;
  const maximumEll = Number(byId("plane-ell").value);
  setPlaneEll(maximumEll);
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

planeEllInputs.forEach(input => input.addEventListener("input", event => {
  setPlaneEll(event.target.value);
  schedulePlane();
}));
byId("plane-back").addEventListener("click", () => {
  setPlaneEll(Number(byId("plane-ell").value) - 1);
  schedulePlane();
});
byId("plane-add").addEventListener("click", () => {
  setPlaneEll(Number(byId("plane-ell").value) + 1);
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
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (lastPlaneResult) drawPlaneSlices(lastPlaneResult);
    if (lastScatteringResult) {
      const field = lastScatteringResult.field;
      const scale = sharedScale([field.current, field.next, field.after]);
      drawField(byId("field-current"), field.current, field.axis, scale);
      drawField(byId("field-next"), field.next, field.axis, scale);
      drawField(byId("field-after"), field.after, field.axis, scale);
    }
  }, 120);
});
updateParameterOutputs();
updateScatterControls();
await requestPlane();
await requestScattering();
