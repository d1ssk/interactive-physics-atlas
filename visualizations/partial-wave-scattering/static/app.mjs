"use strict";

const DATA = JSON.parse(document.getElementById("runtime-manifest").textContent);
const byId = id => document.getElementById(id);
const LOCALE = new URLSearchParams(location.search).get("lang") === "ja" ? "ja" : "en";

const TEXT = {
  en: {
    siteNav:"Site navigation", field:"Quantum mechanics", title:"Partial-Wave Scattering",
    lede:"Construct a plane wave from angular-momentum channels, then see how a central potential changes their phases and the outgoing field.",
    loading:"Preparing the visualization…", runtimeLoading:"Preparing the numerical model…",
    kernelLoading:"Preparing the scattering model…", calculating:"Updating the fields…",
    validating:"Checking the result…", ready:"Ready.", cached:"Updated.",
    error:"The calculation failed. Reload the page and check the connection.",
    planeTitle:"Building a plane wave", planeText:"Compare the current partial sum, the next angular-momentum channel, and the sum obtained by adding that channel.",
    back:"Back", add:"Add", threeD:"3-D partial sum", rotate:"Drag to rotate; wheel to zoom",
    addition:"Addition on the y = 0 plane", sameSnapshot:"Real part at the same phase",
    scatterTitle:"Scattering from a central potential", scatterText:"See how the potential changes the phase shifts, angular distribution, radial waves, and outgoing scattering field.",
    presetsAria:"Potential presets", well:"Attractive well", barrier:"Repulsive barrier", coreWell:"Core and well",
    strength:"Gaussian strength \\(U_0\\) [\\(L^{-2}\\)]", range:"Range \\(a\\) [\\(L\\)]", core:"Repulsive core \\(U_c\\) [\\(L^{-2}\\)]", energy:"Energy \\(E=k^2\\) [\\(L^{-2}\\)]",
    potentialProfile:"Potential profile", phaseShiftPlot:"Phase shifts", angularDistribution:"Angular distribution \\(d\\sigma/d\\Omega\\)",
    resonanceEnergy:"Selected-channel energy response", radialComparison:"Selected-channel radial wave",
    fieldModeAria:"Scattering field", total:"Incident + scattered", scattered:"Scattered only",
    channel:"Resonance channel", fieldComparison:"Scattering field on the y = 0 plane",
    maskNote:"The gray disk masks the potential interior, where the asymptotic outgoing-wave expression is not used.",
    plane3dAria:"Three-dimensional plane-wave partial sum", plane2dAria:"Partial-wave addition on the y equals zero plane",
    scatteringFieldAria:"Scattering field on the y equals zero plane",
    current:"Current sum", next:"Next channel", after:"After addition",
    crossSection:"total cross section", enhancement:"interior radial-weight ratio",
  },
  ja: {
    siteNav:"サイトナビゲーション", field:"量子力学", title:"部分波散乱",
    lede:"角運動量チャネルから平面波を構成し、中心力ポテンシャルが各チャネルの位相と外向き散乱場をどう変えるかを調べます。",
    loading:"可視化を準備しています…", runtimeLoading:"数値モデルを準備しています…",
    kernelLoading:"散乱モデルを準備しています…", calculating:"波動場を更新しています…",
    validating:"結果を確認しています…", ready:"準備ができました。", cached:"更新しました。",
    error:"計算に失敗しました。ページを再読み込みし、接続を確認してください。",
    planeTitle:"平面波を部分波から組み立てる", planeText:"現在の部分和、次の角運動量チャネル、そのチャネルを加えた後の和を比較します。",
    back:"戻す", add:"加える", threeD:"三次元部分和", rotate:"ドラッグで回転、ホイールでズーム",
    addition:"\\(y=0\\) 平面での加算", sameSnapshot:"同じ位相における実部",
    scatterTitle:"中心力ポテンシャルによる散乱", scatterText:"ポテンシャルによる位相シフト、角度分布、動径波、外向き散乱場の変化を比較します。",
    presetsAria:"ポテンシャルのプリセット", well:"引力井戸", barrier:"斥力障壁", coreWell:"芯と井戸",
    strength:"Gaussian強度 \\(U_0\\) [\\(L^{-2}\\)]", range:"到達距離 \\(a\\) [\\(L\\)]", core:"短距離斥力 \\(U_c\\) [\\(L^{-2}\\)]", energy:"エネルギー \\(E=k^2\\) [\\(L^{-2}\\)]",
    potentialProfile:"ポテンシャル", phaseShiftPlot:"位相シフト", angularDistribution:"角度分布 \\(d\\sigma/d\\Omega\\)",
    resonanceEnergy:"選択チャネルのエネルギー応答", radialComparison:"選択チャネルの動径波",
    fieldModeAria:"散乱場", total:"入射波＋散乱波", scattered:"散乱波のみ",
    channel:"共鳴チャネル", fieldComparison:"\\(y=0\\) 平面上の散乱場",
    maskNote:"灰色の円内はポテンシャル内部として除外し、漸近的な外向き散乱波を適用しません。",
    plane3dAria:"平面波部分和の三次元表示", plane2dAria:"y=0平面における部分波の加算",
    scatteringFieldAria:"y=0平面における散乱場",
    current:"現在の和", next:"次のチャネル", after:"加算後",
    crossSection:"全断面積", enhancement:"内部動径重み比",
  },
};

const t = key => TEXT[LOCALE][key] ?? key;
const status = byId("runtime-status");
document.documentElement.lang = LOCALE;
document.title = `${t("title")} — Interactive Physics Vignettes`;
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

let provider;
try {
  await window.physicsAtlasPlotlyReady;
  const root = LOCALE === "ja" ? "../../../../" : "../../../";
  const runtimeBase = new URL(`${root}quantum-mechanics/partial-wave-scattering/app/runtime/`, location.href);
  const providerModule = await import(new URL(DATA.providerAsset, runtimeBase));
  provider = new providerModule.PyodideComputeProvider({
    workerUrl:new URL(DATA.workerAsset, runtimeBase),
    resultSchemas:DATA.resultSchemas,
    runtime:{
      name:"pyodide", version:DATA.pyodideVersion,
      pythonVersion:DATA.pythonVersion, numpyVersion:DATA.numpyVersion,
    },
    cacheEntries:DATA.limits.memoryCacheEntries,
    maximumTimeoutMs:DATA.limits.hardMaxElapsedMs,
  });
} catch (cause) {
  setStatus("error", true);
  throw cause;
}

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
  return {
    title:{text:title, standoff:8},
    gridcolor:COLORS.grid,
    zerolinecolor:COLORS.muted,
    automargin:true,
  };
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
const latestRequestByOperation = new Map();
async function compute(operation, input) {
  const request = {
    protocol:DATA.protocol,
    requestId:`partial-wave-${Date.now()}-${++sequence}`,
    kernelVersion:DATA.kernelVersion,
    operation,
    input,
    limits:{maxElapsedMs:DATA.limits.maxElapsedMs},
  };
  latestRequestByOperation.set(operation, request.requestId);
  let response;
  try {
    response = await provider.compute(request, {
      onPhase:phase => {
        if (latestRequestByOperation.get(operation) === request.requestId) {
          setStatus(PHASE_STATUS[phase] ?? "calculating");
        }
      },
    });
  } catch {
    if (latestRequestByOperation.get(operation) === request.requestId) {
      setStatus("error", true);
    }
    return {kind:"failed"};
  }
  if (latestRequestByOperation.get(operation) !== request.requestId) {
    return {kind:"obsolete"};
  }
  if (!response.ok) {
    if (response.error?.code === "SUPERSEDED") return {kind:"superseded"};
    if (response.error?.code === "CANCELLED") return {kind:"cancelled"};
    setStatus("error", true);
    return {kind:"failed"};
  }
  setStatus(response.provider?.cacheHit ? "cached" : "ready");
  return {kind:"result", value:response.result};
}

const pendingComputations = new Map();
let drainingComputations = false;

function enqueueComputation(operation, input, render) {
  pendingComputations.set(operation, {operation, input, render});
  if (!drainingComputations) void drainComputationQueue();
}

async function drainComputationQueue() {
  if (drainingComputations) return;
  drainingComputations = true;
  try {
    while (pendingComputations.size) {
      const [operation, job] = pendingComputations.entries().next().value;
      pendingComputations.delete(operation);
      const outcome = await compute(job.operation, job.input);
      if (outcome.kind === "superseded") {
        if (!pendingComputations.has(operation)) pendingComputations.set(operation, job);
      } else if (outcome.kind === "result" && !pendingComputations.has(operation)) {
        await job.render(outcome.value);
      }
    }
  } catch {
    setStatus("error", true);
  } finally {
    drainingComputations = false;
    if (pendingComputations.size) void drainComputationQueue();
  }
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

function drawField(canvas, matrix, axisValues, scale, xLabel, zLabel) {
  const width = Math.max(120, canvas.clientWidth);
  const height = Math.max(160, canvas.clientHeight);
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);
  const margin = {left:48, right:8, top:12, bottom:40};
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
  context.fillText(axisValues[0].toFixed(1), left, top + side + 13);
  context.fillText(axisValues.at(-1).toFixed(1), left + side, top + side + 13);
  context.fillText(xLabel, left + side / 2, top + side + 29);
  context.textAlign = "right";
  context.fillText(axisValues.at(-1).toFixed(1), left - 5, top + 4);
  context.fillText(axisValues[0].toFixed(1), left - 5, top + side);
  context.save();
  context.translate(left - 35, top + side / 2);
  context.rotate(-Math.PI / 2);
  context.textAlign = "center";
  context.fillText(zLabel, 0, 0);
  context.restore();
}

let lastPlaneResult = null;
let lastScatteringResult = null;

function drawPlaneSlices(result) {
  const matrices = [result.current, result.next, result.after];
  const scale = sharedScale(matrices);
  drawField(byId("plane-current"), result.current, result.axis2d, scale, "x / λ [dimensionless]", "z / λ [dimensionless]");
  drawField(byId("plane-next"), result.next, result.axis2d, scale, "x / λ [dimensionless]", "z / λ [dimensionless]");
  drawField(byId("plane-after"), result.after, result.axis2d, scale, "x / λ [dimensionless]", "z / λ [dimensionless]");
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
    colorbar:{title:"Re ψ [arb. units]", thickness:13, len:.65},
    hovertemplate:"x=%{x:.2f} λ<br>y=%{y:.2f} λ<br>z=%{z:.2f} λ<br>Re ψ=%{value:.3f}<extra></extra>",
  }];
  const layout3d = {
    ...baseLayout(560), margin:{l:4, r:4, t:8, b:4}, dragmode:false,
    scene:{
      xaxis:axis("x / λ [dimensionless]"), yaxis:axis("y / λ [dimensionless]"), zaxis:axis("z / λ [dimensionless]"),
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
  byId("scatter-ell").value = scatterState.maximumEll;
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
  const potentialData = [
    {type:"scatter", mode:"lines", x:result.potential.radius, y:result.potential.value, name:"potential", line:{color:result.parameters.strength < 0 ? COLORS.blue : COLORS.orange, width:2.2}},
    {type:"scatter", mode:"lines", x:[0, 4.5], y:[result.parameters.energy, result.parameters.energy], name:"E", line:{color:COLORS.gold, width:1.4, dash:"dash"}},
  ];
  const potentialLayout = {
    ...baseLayout(340), showlegend:false, margin:{l:74, r:18, t:22, b:58},
    xaxis:axis("radius r [L]"),
    yaxis:axis("potential U(r), energy E [L⁻²]"),
  };

  const phaseShiftData = [
    {type:"scatter", mode:"lines", x:phaseLines.map(point => point.ell), y:phaseLines.map(point => point.value), line:{color:COLORS.grid, width:5}, showlegend:false, hoverinfo:"skip"},
    {type:"scatter", mode:"markers", x:result.phases.map((_, ell) => ell), y:result.phases, marker:{size:9, color:result.phaseStrengths, colorscale:[[0, "#C8D6E5"], [1, COLORS.violet]], cmin:0, cmax:1}, name:"phase shifts", hovertemplate:"ℓ=%{x}<br>δ=%{y:.4f} rad<extra></extra>"},
  ];
  const phaseShiftLayout = {
    ...baseLayout(340), showlegend:false, margin:{l:72, r:18, t:22, b:58},
    xaxis:{...axis("partial-wave index ℓ [dimensionless]"), dtick:1},
    yaxis:{...axis("phase shift δℓ [rad]"), range:[-Math.PI / 2, Math.PI / 2], tickvals:[-Math.PI / 2, 0, Math.PI / 2], ticktext:["−π/2", "0", "+π/2"]},
  };

  const differential = result.differentialCrossSection;
  const differentialData = [{
    type:"scatter", mode:"lines",
    x:differential.angle, y:differential.value,
    line:{color:COLORS.blue, width:2.4},
    fill:"tozeroy", fillcolor:"rgba(59, 111, 182, 0.10)",
    hovertemplate:"θ=%{x:.3f} rad<br>dσ/dΩ=%{y:.5f}<extra></extra>",
  }];
  const differentialLayout = {
    ...baseLayout(340), showlegend:false, margin:{l:76, r:18, t:22, b:58},
    xaxis:{
      ...axis("scattering angle θ [rad]"),
      range:[0, Math.PI],
      tickvals:[0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI],
      ticktext:["0", "π/4", "π/2", "3π/4", "π"],
    },
    yaxis:{...axis("dσ/dΩ [L² sr⁻¹]"), rangemode:"tozero"},
  };

  const resonanceEnergyData = [
    {type:"scatter", mode:"lines", x:result.resonance.energy, y:result.resonance.phase, name:"phase shift", line:{color:COLORS.violet, width:2}},
    {type:"scatter", mode:"lines", x:result.resonance.energy, y:result.resonance.strength, name:"sin² phase shift", line:{color:COLORS.gold, width:1.5, dash:"dash"}, yaxis:"y2"},
  ];
  const resonanceEnergyLayout = {
    ...baseLayout(340), margin:{l:74, r:76, t:36, b:58},
    legend:{orientation:"h", x:0, y:1.13, font:{size:10}},
    xaxis:axis("energy E [L⁻²]"),
    yaxis:axis("phase shift δℓ [rad]"),
    yaxis2:{...axis("sin²δℓ [dimensionless]"), overlaying:"y", side:"right", range:[0, 1], showgrid:false},
    shapes:[{
      type:"line",
      xref:"x", yref:"paper",
      x0:result.parameters.energy, x1:result.parameters.energy,
      y0:0, y1:1,
      line:{color:COLORS.orange, width:2, dash:"dash"},
    }],
  };

  const radialData = [
    {type:"scatter", mode:"lines", x:result.resonance.radius, y:result.resonance.radial, name:"with potential", line:{color:COLORS.violet, width:2}},
    {type:"scatter", mode:"lines", x:result.resonance.radius, y:result.resonance.freeRadial, name:"free", line:{color:COLORS.muted, width:1.3, dash:"dash"}},
  ];
  const radialLayout = {
    ...baseLayout(340), margin:{l:74, r:18, t:36, b:58},
    legend:{orientation:"h", x:0, y:1.13, font:{size:10}},
    xaxis:axis("radius r [L]"),
    yaxis:axis("reduced radial wave uℓ(r) [arb. units]"),
  };

  const field = result.field;
  const fieldScale = sharedScale([field.current, field.next, field.after]);
  drawField(byId("field-current"), field.current, field.axis, fieldScale, "transverse x [L]", "incident axis z [L]");
  drawField(byId("field-next"), field.next, field.axis, fieldScale, "transverse x [L]", "incident axis z [L]");
  drawField(byId("field-after"), field.after, field.axis, fieldScale, "transverse x [L]", "incident axis z [L]");
  byId("field-current-label").textContent = `${t("current")} ℓ≤${result.maximumEll}`;
  byId("field-next-label").textContent = `${t("next")} ℓ=${result.nextEll}`;
  byId("cross-section").textContent = `${t("crossSection")} σ = ${result.crossSection.toFixed(3)} L² · ${t("enhancement")} (ℓ=${result.resonanceEll}) = ${result.resonance.enhancement.toFixed(2)}`;
  await Promise.all([
    Plotly.react("potential-profile", potentialData, potentialLayout, CONFIG),
    Plotly.react("phase-shifts", phaseShiftData, phaseShiftLayout, CONFIG),
    Plotly.react("differential-cross-section", differentialData, differentialLayout, CONFIG),
    Plotly.react("resonance-energy", resonanceEnergyData, resonanceEnergyLayout, CONFIG),
    Plotly.react("resonance-radial", radialData, radialLayout, CONFIG),
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

function requestPlane() {
  planeTimer = null;
  const maximumEll = Number(byId("plane-ell").value);
  setPlaneEll(maximumEll);
  enqueueComputation(DATA.operations.plane.name, {maximumEll}, renderPlane);
}

function schedulePlane() {
  clearTimeout(planeTimer);
  planeTimer = setTimeout(requestPlane, 160);
}

let scatterTimer = null;
function requestScattering() {
  scatterTimer = null;
  updateParameterOutputs();
  updateScatterControls();
  enqueueComputation(
    DATA.operations.scattering.name,
    {
      ...parameters(),
      maximumEll:scatterState.maximumEll,
      fieldMode:scatterState.fieldMode,
      resonanceEll:scatterState.resonanceEll,
    },
    renderScattering,
  );
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
byId("scatter-ell").addEventListener("input", event => {
  scatterState.maximumEll = Number(event.target.value);
  updateScatterControls();
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
      drawField(byId("field-current"), field.current, field.axis, scale, "transverse x [L]", "incident axis z [L]");
      drawField(byId("field-next"), field.next, field.axis, scale, "transverse x [L]", "incident axis z [L]");
      drawField(byId("field-after"), field.after, field.axis, scale, "transverse x [L]", "incident axis z [L]");
    }
  }, 120);
});
updateParameterOutputs();
updateScatterControls();
requestPlane();
requestScattering();
