"use strict";

const DATA = JSON.parse(document.getElementById("runtime-manifest").textContent);
const byId = id => document.getElementById(id);
const LOCALE = new URLSearchParams(location.search).get("lang") === "ja" ? "ja" : "en";

const TEXT = {
  en: {
    title:"Scalar-Field Vacuum Fluctuations",
    loading:"Preparing the visualization…",
    runtimeLoading:"Loading the in-browser Python runtime…",
    kernelLoading:"Loading the scalar-field kernel…",
    calculating:"Sampling the Gaussian modes in Python…",
    validating:"Checking the realization…",
    error:"The calculation failed. Reload the page and check the connection.",
    controlsTitle:"Choose the Gaussian measure",
    controlsText:"Changing the mass, cutoff, or seed asks the in-browser Python kernel for a new pair of realizations.",
    massLabel:"Mass \\(m\\) [\\(L^{-1}\\)]",
    cutoffLabel:"UV window \\(\\Lambda/\\Lambda_{\\rm Ny}\\)",
    thresholdLabel:"Boundary \\(u\\) in \\(|\\phi|=u\\sigma\\)",
    seedLabel:"Reproducible seed",
    resample:"New draw",
    linkCameras:"Link point/surface cameras within each row",
    spacetimeTitle:"One 2+1-dimensional spacetime realization",
    spacetimeText:"A single canonical vacuum draw is evolved exactly with the free equations. Time runs vertically; slices are correlated, not sampled independently.",
    spaceTitle:"One three-dimensional equal-time realization",
    spaceText:"This is an independent draw from the three-spatial-dimensional vacuum measure. It is not a spatial slice of the 2+1-dimensional realization above.",
    pointsTitle:"Lattice-point view",
    pointsHint:"color = sign · size = magnitude",
    surfacesTitle:"Signed excursion regions",
    surfacesHint:"boundaries at \\(\\phi=\\pm u\\sigma\\)",
    spacetimePointsAria:"Point-cloud view of a scalar-field realization in two plus one dimensional spacetime",
    spacetimeSurfacesAria:"Signed excursion surfaces of a scalar-field realization in two plus one dimensional spacetime",
    spacePointsAria:"Point-cloud view of an equal-time scalar-field realization in three-dimensional space",
    spaceSurfacesAria:"Signed excursion surfaces of an equal-time scalar-field realization in three-dimensional space",
    correlationTitle:"The ensembles are dimension-dependent",
    correlationText:"The curves are the regulated equal-time ensemble correlations, not estimates from the single realizations above.",
    correlationAria:"Comparison of normalized equal-time correlations in two and three spatial dimensions",
    readingTitle:"What this display is—and is not",
    sampleHeading:"A measurement distribution",
    sampleText:"Each picture is one field configuration drawn from the vacuum wavefunctional (equivalently, the free-vacuum Wigner distribution for canonical data). It is not a claim that particles fill the dots or that a classical random field literally exists between measurements.",
    timeHeading:"Free-field spacetime history",
    timeText:"Only for the free Gaussian theory can the positive Wigner draw be evolved this way to reproduce symmetrized correlations. It is not a positive-probability sample of the Feynman or Wightman function.",
    uvHeading:"Explicit, frame-dependent UV smoothing",
    uvText:"The periodic spatial lattice and smooth spatial-momentum window make the variance finite. This regulator selects the displayed time slicing and is not Lorentz invariant.",
    geometryHeading:"Two encodings, one realization",
    geometryText:"Dots are lattice samples—not particles—and their size represents field magnitude. The surfaces enclose thresholded positive and negative field regions from exactly the same numerical array.",
    summary:values => `18-point axes · a=${values.spacing} L · Λ=${values.cutoff} L⁻¹ · ξ≈${values.correlationLength} L · seed ${values.seed}`,
  },
  ja: {
    title:"スカラー場の真空揺らぎ",
    loading:"可視化を準備しています…",
    runtimeLoading:"ブラウザ内の Python 実行環境を読み込んでいます…",
    kernelLoading:"スカラー場の計算核を読み込んでいます…",
    calculating:"Python で Gaussian mode をサンプリングしています…",
    validating:"生成した配位を確認しています…",
    error:"計算に失敗しました。ページを再読み込みし、接続を確認してください。",
    controlsTitle:"Gaussian measure を選ぶ",
    controlsText:"質量、カットオフ、seed を変えると、ブラウザ内の Python 計算核が二つの配位を新たに生成します。",
    massLabel:"質量 \\(m\\) [\\(L^{-1}\\)]",
    cutoffLabel:"UV window \\(\\Lambda/\\Lambda_{\\rm Ny}\\)",
    thresholdLabel:"境界 \\(|\\phi|=u\\sigma\\) の \\(u\\)",
    seedLabel:"再現可能な seed",
    resample:"新しい配位",
    linkCameras:"各行の点群・等値面の視点を連動",
    spacetimeTitle:"2+1次元時空の一つの realization",
    spacetimeText:"真空の正準変数を一度だけサンプルし、自由方程式で厳密に発展させています。縦軸が時間で、各時刻を独立にサンプルしてはいません。",
    spaceTitle:"3次元空間の一つの等時刻 realization",
    spaceText:"空間3次元の真空 measure から独立に生成した配位です。上の2+1次元配位の空間断面ではありません。",
    pointsTitle:"格子点による表示",
    pointsHint:"色＝符号・大きさ＝振幅",
    surfacesTitle:"正負の excursion region",
    surfacesHint:"境界は \\(\\phi=\\pm u\\sigma\\)",
    spacetimePointsAria:"2+1次元時空におけるスカラー場配位の点群表示",
    spacetimeSurfacesAria:"2+1次元時空におけるスカラー場配位の正負の等値面表示",
    spacePointsAria:"3次元空間におけるスカラー場の等時刻配位の点群表示",
    spaceSurfacesAria:"3次元空間におけるスカラー場の等時刻配位の正負の等値面表示",
    correlationTitle:"ensemble は空間次元によって異なる",
    correlationText:"曲線は正則化した等時刻 ensemble 相関であり、上の一つの配位から推定したものではありません。",
    correlationAria:"空間2次元と3次元の規格化した等時刻相関の比較",
    readingTitle:"この表示が表すもの・表さないもの",
    sampleHeading:"測定結果の分布",
    sampleText:"各図は、真空波動汎関数（正準変数については自由真空の Wigner 分布と等価）から場の配位を一つ取り出したものです。点が粒子で満たされることや、測定と無関係に古典確率場が実在することを主張する図ではありません。",
    timeHeading:"自由場の時空履歴",
    timeText:"正の Wigner 分布からの配位をこのように発展させて symmetrized correlation を再現できるのは自由 Gaussian 理論だからです。Feynman 関数や Wightman 関数の正の確率サンプルではありません。",
    uvHeading:"明示的で frame-dependent な UV 平滑化",
    uvText:"周期的空間格子と空間運動量の滑らかな window によって分散を有限にしています。この正則化は表示した時間切片を選び、Lorentz 不変ではありません。",
    geometryHeading:"同じ配位の二つの符号化",
    geometryText:"点は格子上のサンプルであって粒子ではなく、大きさが場の振幅を表します。等値面はまったく同じ数値配列から、しきい値を超えた正負の領域を囲みます。",
    summary:values => `各軸18点 · a=${values.spacing} L · Λ=${values.cutoff} L⁻¹ · ξ≈${values.correlationLength} L · seed ${values.seed}`,
  },
};

const t = key => TEXT[LOCALE][key] ?? key;
const status = byId("runtime-status");
document.documentElement.lang = LOCALE;
document.title = `${t("title")} — Interactive Physics Olio`;
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
  const runtimeBase = new URL(
    `${root}quantum-field-theory/scalar-field-vacuum-fluctuations/app/runtime/`,
    location.href,
  );
  const providerModule = await import(new URL(DATA.providerAsset, runtimeBase));
  provider = new providerModule.PyodideComputeProvider({
    workerUrl:new URL(DATA.workerAsset, runtimeBase),
    resultSchemas:DATA.resultSchemas,
    runtime:{
      name:"pyodide",
      version:DATA.pyodideVersion,
      pythonVersion:DATA.pythonVersion,
      numpyVersion:DATA.numpyVersion,
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
  positive:"#D9772B",
  positiveLight:"#F0C99F",
  negative:"#268E9B",
  negativeLight:"#A9D7DC",
  dimension3:"#69558F",
  ink:"#263238",
  muted:"#667078",
  grid:themeColor("--atlas-viz-border", "#DDE2E6"),
  panel:themeColor("--atlas-viz-panel", "#FCFCFD"),
  subtle:themeColor("--atlas-viz-panel-subtle", "#F5F7F8"),
};

const PLOT_IDS = [
  "spacetime-points",
  "spacetime-surfaces",
  "space-points",
  "space-surfaces",
  "correlation",
];
const PHASE_STATUS = {
  "runtime-loading":"runtimeLoading",
  "kernel-loading":"kernelLoading",
  calculating:"calculating",
  validating:"validating",
};

let latestResult = null;
let latestCoordinates = null;
let requestSequence = 0;
let latestRequestId = "";
let cameraSyncInProgress = false;

function setStatus(key, error = false) {
  status.textContent = key ? t(key) : "";
  status.classList.toggle("error", error);
}

function axis(title) {
  return {
    title:{text:title, font:{size:11}},
    showbackground:true,
    backgroundcolor:COLORS.subtle,
    gridcolor:COLORS.grid,
    zerolinecolor:COLORS.muted,
    tickfont:{size:9, color:COLORS.muted},
  };
}

function scene(zTitle, spacetime = false) {
  return {
    xaxis:axis("space x [L]"),
    yaxis:axis("space y [L]"),
    zaxis:axis(zTitle),
    aspectmode:"manual",
    aspectratio:spacetime ? {x:1, y:1, z:.86} : {x:1, y:1, z:1},
    camera:{eye:{x:1.45, y:1.45, z:1.12}},
  };
}

function layout3d(zTitle, uirevision, spacetime = false) {
  return {
    template:null,
    height:570,
    margin:{l:8, r:8, t:8, b:8},
    paper_bgcolor:COLORS.panel,
    plot_bgcolor:COLORS.panel,
    font:{family:"Arial, sans-serif", color:COLORS.ink, size:11},
    hoverlabel:{font:{size:11}},
    showlegend:true,
    legend:{orientation:"h", x:.5, xanchor:"center", y:.01, bgcolor:"rgba(255,255,255,.74)"},
    dragmode:"turntable",
    uirevision,
    scene:scene(zTitle, spacetime),
  };
}

function buildCoordinates(result) {
  const axisValues = result.axis;
  const times = result.times;
  const n = axisValues.length;
  const spacetime = {x:[], y:[], z:[]};
  for (let it = 0; it < times.length; it += 1) {
    for (let ix = 0; ix < n; ix += 1) {
      for (let iy = 0; iy < n; iy += 1) {
        spacetime.x.push(axisValues[ix]);
        spacetime.y.push(axisValues[iy]);
        spacetime.z.push(times[it]);
      }
    }
  }
  const space3d = {x:[], y:[], z:[]};
  for (let ix = 0; ix < n; ix += 1) {
    for (let iy = 0; iy < n; iy += 1) {
      for (let iz = 0; iz < n; iz += 1) {
        space3d.x.push(axisValues[ix]);
        space3d.y.push(axisValues[iy]);
        space3d.z.push(axisValues[iz]);
      }
    }
  }
  return {spacetime, space3d};
}

function pointTraces(coordinates, values, sigma) {
  const groups = {
    positive:{x:[], y:[], z:[], values:[], sizes:[]},
    negative:{x:[], y:[], z:[], values:[], sizes:[]},
  };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    const group = value >= 0 ? groups.positive : groups.negative;
    group.x.push(coordinates.x[index]);
    group.y.push(coordinates.y[index]);
    group.z.push(coordinates.z[index]);
    group.values.push(value);
    group.sizes.push(1.5 + 5 * Math.min(Math.abs(value) / (2.5 * sigma), 1));
  }
  return [
    {group:groups.positive, name:"φ ≥ 0", color:COLORS.positive, symbol:"circle"},
    {group:groups.negative, name:"φ < 0", color:COLORS.negative, symbol:"diamond"},
  ].map(({group, name, color, symbol}) => ({
    type:"scatter3d",
    mode:"markers",
    x:group.x,
    y:group.y,
    z:group.z,
    customdata:group.values,
    marker:{size:group.sizes, color, symbol, opacity:.52, line:{width:0}},
    name,
    hovertemplate:"x=%{x:.2f}<br>y=%{y:.2f}<br>z=%{z:.2f}<br>φ=%{customdata:.3f}<extra>%{fullData.name}</extra>",
  }));
}

function centralTimePlane(axisValues) {
  const first = axisValues[0];
  const last = axisValues.at(-1);
  return {
    type:"surface",
    x:[[first, last], [first, last]],
    y:[[first, first], [last, last]],
    z:[[0, 0], [0, 0]],
    surfacecolor:[[0, 0], [0, 0]],
    colorscale:[[0, COLORS.muted], [1, COLORS.muted]],
    opacity:.12,
    showscale:false,
    showlegend:false,
    hoverinfo:"skip",
    name:"t = 0",
  };
}

function excursionTraces(coordinates, values, sigma, threshold) {
  const level = threshold * sigma;
  const upper = level + Math.max(level * .002, 1e-6);
  const base = {
    type:"isosurface",
    x:coordinates.x,
    y:coordinates.y,
    z:coordinates.z,
    isomin:level,
    isomax:upper,
    surface:{count:1, fill:1},
    caps:{x:{show:false}, y:{show:false}, z:{show:false}},
    opacity:.48,
    showscale:false,
    flatshading:false,
  };
  return [
    {
      ...base,
      value:values,
      colorscale:[[0, COLORS.positiveLight], [1, COLORS.positive]],
      name:"φ > +uσ",
      hovertemplate:"positive boundary<br>φ=%{value:.3f}<extra></extra>",
    },
    {
      ...base,
      value:values.map(value => -value),
      colorscale:[[0, COLORS.negativeLight], [1, COLORS.negative]],
      name:"φ < −uσ",
      hovertemplate:"negative boundary<br>−φ=%{value:.3f}<extra></extra>",
    },
  ];
}

function correlationLayout() {
  return {
    template:null,
    height:390,
    margin:{l:62, r:24, t:24, b:56},
    paper_bgcolor:COLORS.panel,
    plot_bgcolor:COLORS.panel,
    font:{family:"Arial, sans-serif", color:COLORS.ink, size:11},
    hovermode:"x unified",
    dragmode:"pan",
    legend:{orientation:"h", x:.5, xanchor:"center", y:1.08},
    xaxis:{
      title:{text:"separation r [L]", standoff:8},
      gridcolor:COLORS.grid,
      zerolinecolor:COLORS.muted,
    },
    yaxis:{
      title:{text:"C(r) / C(0)", standoff:8},
      gridcolor:COLORS.grid,
      zerolinecolor:COLORS.muted,
      range:[-.18, 1.05],
    },
  };
}

function installCameraLink(sourceId, targetId) {
  const source = byId(sourceId);
  source.removeAllListeners?.("plotly_relayout");
  source.on("plotly_relayout", event => {
    if (!byId("link-cameras").checked || cameraSyncInProgress || !event["scene.camera"]) return;
    cameraSyncInProgress = true;
    Plotly.relayout(targetId, {"scene.camera":event["scene.camera"]})
      .finally(() => { cameraSyncInProgress = false; });
  });
}

function linkCameras() {
  installCameraLink("spacetime-points", "spacetime-surfaces");
  installCameraLink("spacetime-surfaces", "spacetime-points");
  installCameraLink("space-points", "space-surfaces");
  installCameraLink("space-surfaces", "space-points");
}

async function render(result) {
  latestResult = result;
  latestCoordinates = latestCoordinates ?? buildCoordinates(result);
  const threshold = Number(byId("threshold").value);
  const spacetimeValues = result.spacetime.field;
  const spatialValues = result.space3d.field;
  const spacetimePoints = [
    ...pointTraces(latestCoordinates.spacetime, spacetimeValues, result.spacetime.sigma),
    centralTimePlane(result.axis),
  ];
  const spacetimeSurfaces = [
    ...excursionTraces(
      latestCoordinates.spacetime,
      spacetimeValues,
      result.spacetime.sigma,
      threshold,
    ),
    centralTimePlane(result.axis),
  ];
  const spatialPoints = pointTraces(
    latestCoordinates.space3d,
    spatialValues,
    result.space3d.sigma,
  );
  const spatialSurfaces = excursionTraces(
    latestCoordinates.space3d,
    spatialValues,
    result.space3d.sigma,
    threshold,
  );
  const correlation = [
    {
      type:"scatter",
      mode:"lines+markers",
      x:result.correlation.distance,
      y:result.correlation.dimension2,
      line:{color:COLORS.negative, width:2.5},
      marker:{color:COLORS.negative, size:5, symbol:"circle"},
      name:"d = 2 spatial vacuum",
      hovertemplate:"r=%{x:.2f}<br>C₂(r)/C₂(0)=%{y:.3f}<extra></extra>",
    },
    {
      type:"scatter",
      mode:"lines+markers",
      x:result.correlation.distance,
      y:result.correlation.dimension3,
      line:{color:COLORS.dimension3, width:2.5, dash:"dash"},
      marker:{color:COLORS.dimension3, size:5, symbol:"diamond"},
      name:"d = 3 spatial vacuum",
      hovertemplate:"r=%{x:.2f}<br>C₃(r)/C₃(0)=%{y:.3f}<extra></extra>",
    },
  ];
  await Promise.all([
    Plotly.react(
      "spacetime-points",
      spacetimePoints,
      layout3d("time t [L]", "spacetime-camera", true),
      CONFIG,
    ),
    Plotly.react(
      "spacetime-surfaces",
      spacetimeSurfaces,
      layout3d("time t [L]", "spacetime-camera", true),
      CONFIG,
    ),
    Plotly.react("space-points", spatialPoints, layout3d("space z [L]", "space-camera"), CONFIG),
    Plotly.react(
      "space-surfaces",
      spatialSurfaces,
      layout3d("space z [L]", "space-camera"),
      CONFIG,
    ),
    Plotly.react("correlation", correlation, correlationLayout(), CONFIG),
  ]);
  linkCameras();
  const parameters = result.parameters;
  byId("parameter-summary").textContent = TEXT[LOCALE].summary({
    spacing:result.spacetime.spacing.toFixed(3),
    cutoff:result.spacetime.cutoff.toFixed(3),
    correlationLength:(1 / parameters.mass).toFixed(2),
    seed:parameters.seed,
  });
  window.dispatchEvent(new Event("resize"));
}

async function computeRealization() {
  const mass = Number(byId("mass").value);
  const cutoffFraction = Number(byId("cutoff").value);
  const seed = Math.trunc(Number(byId("seed").value));
  if (!Number.isInteger(seed) || seed < 0 || seed > 2147483647) {
    setStatus("error", true);
    return;
  }
  const request = {
    protocol:DATA.protocol,
    requestId:`scalar-vacuum-${Date.now()}-${++requestSequence}`,
    kernelVersion:DATA.kernelVersion,
    operation:DATA.operation,
    input:{mass, cutoffFraction, seed},
    limits:{maxElapsedMs:DATA.limits.maxElapsedMs},
  };
  latestRequestId = request.requestId;
  const response = await provider.compute(request, {
    onPhase:phase => {
      if (latestRequestId === request.requestId && PHASE_STATUS[phase]) {
        setStatus(PHASE_STATUS[phase]);
      }
    },
  });
  if (latestRequestId !== request.requestId || response.error?.code === "SUPERSEDED") return;
  if (!response.ok) {
    setStatus("error", true);
    return;
  }
  latestCoordinates = null;
  await render(response.result);
  setStatus("");
}

function updateControlOutputs() {
  byId("mass-output").textContent = Number(byId("mass").value).toFixed(2);
  byId("cutoff-output").textContent = Number(byId("cutoff").value).toFixed(2);
  byId("threshold-output").textContent = Number(byId("threshold").value).toFixed(2);
}

for (const id of ["mass", "cutoff", "threshold"]) {
  byId(id).addEventListener("input", updateControlOutputs);
}
for (const id of ["mass", "cutoff", "seed"]) {
  byId(id).addEventListener("change", computeRealization);
}
let thresholdFrame = 0;
byId("threshold").addEventListener("input", () => {
  cancelAnimationFrame(thresholdFrame);
  thresholdFrame = requestAnimationFrame(() => {
    if (latestResult) render(latestResult);
  });
});
byId("resample").addEventListener("click", () => {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  byId("seed").value = String(random[0] % 2147483648);
  computeRealization();
});
byId("link-cameras").addEventListener("change", () => {
  if (byId("link-cameras").checked) linkCameras();
});
addEventListener("pagehide", () => provider?.dispose(), {once:true});

updateControlOutputs();
await computeRealization();
