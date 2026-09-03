const byId = id => document.getElementById(id);
const PLOT_CONFIG = {
  responsive: true,
  scrollZoom: true,
  displaylogo: false,
  displayModeBar: window.matchMedia("(min-width: 520px)").matches ? "hover" : false,
};
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";

const MESSAGES = {
  en: {
    title: "AdS₂ and dS₂ Spacetime Geometry",
    lede: "Compare two constant-curvature Lorentzian spacetimes without confusing an ambient embedding with a spacetime diagram.",
    controlsAria: "Visualization controls",
    spacetimeLabel: "Spacetime",
    chartLabel: "Coordinate chart",
    boostLabel: "Local-frame boost \\(\\chi\\)",
    embeddingStep: "1 · Ambient embedding",
    embeddingTitle: "The quadric is a geometric model, not a Euclidean surface",
    legendAria: "Curve colors",
    timelike: "timelike geodesic",
    spacelike: "spacelike geodesic",
    null: "null geodesic",
    embeddingCaption: "Move the coordinate sliders to follow the selected point, two coordinate lines, and its local orthonormal and null frame. Causal type is determined by the ambient indefinite metric, not Euclidean appearance.",
    conformalStep: "2 · Conformal compactification",
    conformalTitle: "Null rays and infinity become readable",
    conformalCopy: "The conformal factor changes lengths but preserves null directions, so this view exposes boundaries, horizons, and causal contact.",
    togetherTitle: "Read the two views together",
    embeddingTakeaway: "<strong>Embedding:</strong> verifies the constant-curvature constraint and shows how coordinate patches sit on the quadric.",
    conformalTakeaway: "<strong>Conformal diagram:</strong> suppresses the conformal factor so that null directions, infinity, and observer horizons are explicit.",
    convention: "The displayed AdS₂ quadric has periodic global time; the conformal panel shows its universal cover. General-dimensional formulas and detailed chart descriptions appear in the surrounding atlas article.",
    embeddingAria: "Ambient embedding of the selected constant-curvature spacetime with coordinates, local frame, and geodesics",
    penroseAria: "Conformal causal diagram of the selected spacetime",
    kinds: {ads: "AdS₂ (negative curvature)", ds: "dS₂ (positive curvature)"},
    charts: {
      ads: {global: "global coordinates", poincare: "Poincaré patch"},
      ds: {global: "global coordinates", flat: "expanding flat patch", static: "static patch"},
    },
    coordinateLabels: {
      "ads|global": ["global time \\(\\tau\\)", "radial coordinate \\(\\rho\\)"],
      "ads|poincare": ["Poincaré time \\(t\\)", "radial coordinate \\(z\\)"],
      "ds|global": ["global time \\(\\tau\\)", "periodic angle \\(\\theta\\)"],
      "ds|flat": ["flat time \\(t\\)", "comoving position \\(x\\)"],
      "ds|static": ["static time \\(t_s\\)", "static radius \\(r\\)"],
    },
    notes: {
      "ads|global": "The global chart covers the displayed quadric. Its \\(\\tau\\) coordinate is periodic; the causal panel shows the unwrapped universal cover.",
      "ads|poincare": "Poincaré coordinates cover only \\(z>0\\). Curves can extend far in embedding space near \\(z=0\\).",
      "ds|global": "Global coordinates cover all of dS₂, and the spatial angle \\(\\theta\\) is periodic.",
      "ds|flat": "The expanding flat slicing covers one planar patch with scale factor \\(e^{t/L}\\).",
      "ds|static": "The static chart covers one observer patch bounded by cosmological horizons at \\(|r|=L\\).",
    },
    curvature: {
      ads: "AdS₂ has scalar curvature \\(R=-2/L^2\\). Its conformal boundary is timelike, so boundary conditions enter time evolution.",
      ds: "dS₂ has scalar curvature \\(R=+2/L^2\\). Past and future conformal infinity are spacelike.",
    },
    metric: {
      ads: "\\(ds^2=L^2\\sec^2\\sigma\\,(-d\\tau^2+d\\sigma^2),\\qquad \\tan\\sigma=\\sinh\\rho\\)",
      ds: "\\(ds^2=L^2\\sec^2\\eta\\,(-d\\eta^2+d\\theta^2),\\qquad \\tan\\eta=\\sinh(\\tau/L)\\)",
    },
  },
  ja: {
    title: "AdS₂とdS₂の時空幾何",
    lede: "一定曲率をもつ二つのLorentz時空を、埋め込み図と時空図を混同せずに比較します。",
    controlsAria: "可視化の操作",
    spacetimeLabel: "時空",
    chartLabel: "座標chart",
    boostLabel: "局所標構のブースト \\(\\chi\\)",
    embeddingStep: "1 · 周囲空間への埋め込み",
    embeddingTitle: "二次曲面は幾何学的模型でありユークリッド曲面ではない",
    legendAria: "曲線の色",
    timelike: "時間的測地線",
    spacelike: "空間的測地線",
    null: "null測地線",
    embeddingCaption: "座標スライダーを動かすと、選択点、二本の座標線、その点の局所正規直交標構とnull標構が移動します。因果的な型は見かけのユークリッド幾何ではなく、周囲空間の不定値計量で決まります。",
    conformalStep: "2 · 共形コンパクト化",
    conformalTitle: "null光線と無限遠の因果的性質",
    conformalCopy: "共形因子は長さを変えますがnull方向を保存するため、境界、地平面、因果的接触を読み取れます。",
    togetherTitle: "二つの図を組み合わせて読む",
    embeddingTakeaway: "<strong>埋め込み図：</strong>一定曲率の制約を確認し、座標パッチが二次曲面上のどこを覆うかを示します。",
    conformalTakeaway: "<strong>共形図：</strong>共形因子を除き、null方向、無限遠、観測者の地平面を明示します。",
    convention: "表示するAdS₂二次曲面の大域時間は周期的です。共形パネルではその普遍被覆を示します。一般次元の式と各chartの詳しい説明は、この可視化を囲む本文に記載しています。",
    embeddingAria: "選択した一定曲率時空の周囲空間への埋め込み、座標線、局所標構、測地線",
    penroseAria: "選択した時空の因果的共形図",
    kinds: {ads: "AdS₂（負曲率）", ds: "dS₂（正曲率）"},
    charts: {
      ads: {global: "大域座標", poincare: "Poincaré patch"},
      ds: {global: "大域座標", flat: "膨張平坦patch", static: "静的patch"},
    },
    coordinateLabels: {
      "ads|global": ["大域時間 \\(\\tau\\)", "動径座標 \\(\\rho\\)"],
      "ads|poincare": ["Poincaré時間 \\(t\\)", "動径座標 \\(z\\)"],
      "ds|global": ["大域時間 \\(\\tau\\)", "周期角 \\(\\theta\\)"],
      "ds|flat": ["平坦時間 \\(t\\)", "共動位置 \\(x\\)"],
      "ds|static": ["静的時間 \\(t_s\\)", "静的半径 \\(r\\)"],
    },
    notes: {
      "ads|global": "大域chartは表示した二次曲面全体を覆います。\\(\\tau\\) は周期的ですが、因果パネルでは時間をほどいた普遍被覆を示します。",
      "ads|poincare": "Poincaré座標が覆うのは \\(z>0\\) の領域だけです。\\(z=0\\) に近づくと曲線は埋め込み空間で遠方まで延びます。",
      "ds|global": "大域座標はdS₂全体を覆い、空間角 \\(\\theta\\) は周期的です。",
      "ds|flat": "膨張平坦slicingは、スケール因子 \\(e^{t/L}\\) をもつ一つのplanar patchを覆います。",
      "ds|static": "静的chartは一観測者のpatchを覆い、その境界 \\(|r|=L\\) は宇宙論的地平面です。",
    },
    curvature: {
      ads: "AdS₂のスカラー曲率は \\(R=-2/L^2\\) です。共形境界は時間的なので、時間発展には境界条件が必要です。",
      ds: "dS₂のスカラー曲率は \\(R=+2/L^2\\) です。過去と未来の共形無限遠は空間的です。",
    },
    metric: {
      ads: "\\(ds^2=L^2\\sec^2\\sigma\\,(-d\\tau^2+d\\sigma^2),\\qquad \\tan\\sigma=\\sinh\\rho\\)",
      ds: "\\(ds^2=L^2\\sec^2\\eta\\,(-d\\eta^2+d\\theta^2),\\qquad \\tan\\eta=\\sinh(\\tau/L)\\)",
    },
  },
};

const t = key => MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key;
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
    const targets = [...pendingMathTargets];
    pendingMathTargets.clear();
    if (!targets.length) return undefined;
    window.MathJax.typesetClear(targets);
    return window.MathJax.typesetPromise(targets);
  }).catch(() => {}).finally(() => {
    mathFlushScheduled = false;
    if (pendingMathTargets.size) flushMath();
  });
}

window.addEventListener("physics-atlas:mathjax-ready", flushMath);

let plotResizeScheduled = false;
function schedulePlotResize() {
  if (plotResizeScheduled) return;
  plotResizeScheduled = true;
  window.requestAnimationFrame(() => {
    plotResizeScheduled = false;
    for (const id of ["embedding-plot", "penrose-plot"]) {
      const plot = byId(id);
      if (plot?.classList.contains("js-plotly-plot")) Plotly.Plots.resize(plot);
    }
  });
}

window.addEventListener("resize", schedulePlotResize);
if ("ResizeObserver" in window) {
  const plotResizeObserver = new ResizeObserver(schedulePlotResize);
  plotResizeObserver.observe(document.querySelector("main"));
  window.addEventListener("pagehide", () => plotResizeObserver.disconnect(), {once: true});
}

function localizeStaticContent() {
  document.documentElement.lang = LOCALE;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerHTML = t(element.dataset.i18n);
  });
  byId("controls").setAttribute("aria-label", t("controlsAria"));
  byId("causal-legend").setAttribute("aria-label", t("legendAria"));
  byId("embedding-plot").setAttribute("aria-label", t("embeddingAria"));
  byId("penrose-plot").setAttribute("aria-label", t("penroseAria"));
  typeset(document.body);
}

function configureCharts() {
  const kind = byId("spacetime").value;
  const chart = byId("chart");
  chart.replaceChildren(...DATA.chartOptions[kind].map(value => new Option(t("charts")[kind][value], value)));
  configureCoordinateBars();
}

function configureCoordinateBars() {
  const key = `${byId("spacetime").value}|${byId("chart").value}`;
  const controls = DATA.coordinateControls[key];
  for (const [axis, values, defaultIndex] of [["q1", controls.q1Values, controls.defaultQ1], ["q2", controls.q2Values, controls.defaultQ2]]) {
    const input = byId(axis);
    input.min = 0;
    input.max = values.length - 1;
    input.step = 1;
    input.value = defaultIndex;
  }
  const labels = t("coordinateLabels")[key];
  byId("q1-label").innerHTML = labels[0];
  byId("q2-label").innerHTML = labels[1];
  typeset(byId("q1-label"));
  typeset(byId("q2-label"));
  render();
}

function selectedCoordinateTraces(controls, boostKey) {
  const q1Index = Number(byId("q1").value);
  const q2Index = Number(byId("q2").value);
  const point = controls.points[q1Index][q2Index];
  const frame = controls.frames[boostKey][q1Index][q2Index];
  const frameStyle = [
    ["local timelike tangent", "#c8463a", "solid"],
    ["local spacelike tangent", "#376fb0", "solid"],
    ["local null tangent +", "#2e8b57", "dash"],
    ["local null tangent −", "#2e8b57", "dash"],
  ];
  const traces = [controls.q1Curves[q2Index], controls.q2Curves[q1Index], {
    type: "scatter3d", x: [point[0]], y: [point[1]], z: [point[2]], mode: "markers",
    marker: {size: 6, color: "#d33f36"}, name: "selected coordinate point", showlegend: false,
  }];
  frame.forEach((segment, index) => traces.push({
    type: "scatter3d",
    x: segment.map(point => point[0]), y: segment.map(point => point[1]), z: segment.map(point => point[2]),
    mode: "lines", line: {color: frameStyle[index][1], width: 8, dash: frameStyle[index][2]},
    name: frameStyle[index][0], showlegend: false, hoverinfo: "skip",
  }));
  return traces;
}

function embeddingLayoutWithPreservedCamera(kind) {
  const source = DATA.layouts[kind];
  const previousCamera = byId("embedding-plot").layout?.scene?.camera;
  const scene = {...source.scene};
  if (previousCamera) scene.camera = JSON.parse(JSON.stringify(previousCamera));
  return {...source, scene};
}

function formatNumber(value, digits) {
  const threshold = 0.5 * 10 ** -digits;
  const safe = Math.abs(value) < threshold ? 0 : value;
  return safe.toFixed(digits);
}

function render() {
  const kind = byId("spacetime").value;
  const chart = byId("chart").value;
  const boostIndex = Number(byId("boost").value);
  const boostKey = DATA.boostKeys[boostIndex];
  const controls = DATA.coordinateControls[`${kind}|${chart}`];
  const traces = [DATA.surfaces[kind], ...DATA.charts[`${kind}|${chart}`], ...DATA.geodesics[`${kind}|${chart}|${boostKey}`], ...selectedCoordinateTraces(controls, boostKey)];
  Plotly.react("embedding-plot", traces, embeddingLayoutWithPreservedCamera(kind), PLOT_CONFIG);
  Plotly.react("penrose-plot", DATA.penrose[kind].data, DATA.penrose[kind].layout, PLOT_CONFIG);
  byId("chart-note").innerHTML = t("notes")[`${kind}|${chart}`];
  byId("q1-value").textContent = formatNumber(Number(controls.q1Values[Number(byId("q1").value)]), 2);
  byId("q2-value").textContent = formatNumber(Number(controls.q2Values[Number(byId("q2").value)]), 2);
  byId("boost-value").textContent = formatNumber(Number(DATA.boostValues[boostIndex]), 1);
  byId("curvature-copy").innerHTML = t("curvature")[kind];
  byId("metric-copy").innerHTML = t("metric")[kind];
  typeset(byId("chart-note"));
  typeset(byId("curvature-copy"));
  typeset(byId("metric-copy"));
  schedulePlotResize();
}

localizeStaticContent();
byId("spacetime").replaceChildren(...Object.entries(t("kinds")).map(([key, label]) => new Option(label, key)));
byId("spacetime").addEventListener("change", configureCharts);
byId("chart").addEventListener("change", configureCoordinateBars);
byId("q1").addEventListener("input", render);
byId("q2").addEventListener("input", render);
byId("boost").addEventListener("input", render);
byId("boost").min = 0;
byId("boost").max = DATA.boostValues.length - 1;
byId("boost").step = 1;
byId("boost").value = Math.floor(DATA.boostValues.length / 2);
configureCharts();
