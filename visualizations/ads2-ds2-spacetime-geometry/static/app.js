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
    lede: "Compare two constant-curvature Lorentzian spacetimes using their embeddings and conformal diagrams.",
    controlsAria: "Visualization controls",
    spacetimeLabel: "Spacetime",
    chartLabel: "Coordinate chart",
    boostLabel: "Local-frame boost \\(\\chi\\)",
    embeddingTitle: "Embedding",
    legendAria: "Curve colors",
    timelike: "timelike geodesic",
    spacelike: "spacelike geodesic",
    null: "null geodesic",
    embeddingCaption: "Move the coordinate sliders to follow the selected point, two coordinate lines, and its local orthonormal frame and null directions. Causal type is determined by the indefinite metric of the embedding space, not by Euclidean appearance.",
    conformalTitle: "Conformal Diagram",
    conformalCopy: "A conformal diagram preserves null directions while suppressing the conformal factor, making boundaries, horizons, and causal structure easier to read.",
    togetherTitle: "Reading the Diagrams",
    embeddingTakeaway: "<strong>Embedding:</strong> shows the spacetime as a quadric and how each coordinate patch covers it.",
    conformalTakeaway: "<strong>Conformal diagram:</strong> makes null directions, conformal infinity, and observer horizons explicit.",
    convention: "The AdS₂ embedding shown here has periodic global time, while the conformal diagram shows its universal cover.",
    embeddingAria: "Embedding of the selected constant-curvature spacetime with coordinate lines, local frame, and geodesics",
    penroseAria: "Conformal causal diagram of the selected spacetime",
    kinds: {
      ads: "AdS₂ (negative curvature)",
      ds: "dS₂ (positive curvature)",
    },
    charts: {
      ads: {
        global: "global coordinates",
        poincare: "Poincaré patch",
      },
      ds: {
        global: "global coordinates",
        flat: "expanding flat patch",
        static: "static patch",
      },
    },
    coordinateLabels: {
      "ads|global": ["global time \\(\\tau\\)", "radial coordinate \\(\\rho\\)"],
      "ads|poincare": ["Poincaré time \\(t\\)", "radial coordinate \\(z\\)"],
      "ds|global": ["global time \\(\\tau\\)", "periodic angle \\(\\theta\\)"],
      "ds|flat": ["flat time \\(t\\)", "comoving position \\(x\\)"],
      "ds|static": ["static time \\(t_s\\)", "static radius \\(r\\)"],
    },
    notes: {
      "ads|global": "Global coordinates cover the entire displayed quadric. The coordinate \\(\\tau\\) is periodic on the quadric, while the conformal diagram shows the unwrapped universal cover.",
      "ads|poincare": "Poincaré coordinates cover only part of global AdS₂, with \\(z>0\\). The grid is clipped to the displayed \\(|\\rho|\\le2\\) region and extends toward the Poincaré horizon.",
      "ds|global": "Global coordinates cover all of dS₂, with periodic spatial angle \\(\\theta\\).",
      "ds|flat": "The expanding flat slicing covers one planar patch, with scale factor \\(e^{t/L}\\).",
      "ds|static": "Static coordinates cover one observer's patch, bounded by cosmological horizons at \\(|r|=L\\).",
    },
    curvature: {
      ads: "AdS₂ has scalar curvature \\(R=-2/L^2\\). Its conformal boundary is timelike, so boundary conditions are required to specify time evolution.",
      ds: "dS₂ has scalar curvature \\(R=+2/L^2\\). Its past and future conformal boundaries are spacelike.",
    },
    metric: {
      ads: "\\(ds^2=L^2\\sec^2\\sigma\\,(-d\\tau^2+d\\sigma^2),\\qquad \\tan\\sigma=\\sinh\\rho\\)",
      ds: "\\(ds^2=L^2\\sec^2\\eta\\,(-d\\eta^2+d\\theta^2),\\qquad \\tan\\eta=\\sinh(\\tau/L)\\)",
    },
  },

  ja: {
    title: "AdS₂ と dS₂ の時空幾何",
    lede: "一定曲率をもつ二つの Lorentz 時空を、埋め込み図と共形図を通して比較します。",
    controlsAria: "可視化の操作",
    spacetimeLabel: "時空",
    chartLabel: "座標系",
    boostLabel: "局所標構のブースト \\(\\chi\\)",
    embeddingTitle: "埋め込み図",
    legendAria: "曲線の色",
    timelike: "時間的測地線",
    spacelike: "空間的測地線",
    null: "ヌル測地線",
    embeddingCaption: "座標スライダーを動かすと、選択点、2 本の座標線、その点での局所正規直交標構とヌル方向が移動します。因果的な型は画面上のユークリッド的な見かけではなく、埋め込み空間の不定値計量によって決まります。",
    conformalTitle: "共形図",
    conformalCopy: "共形図ではヌル方向を保ったまま共形因子を除くことで、境界、地平面、因果構造を読み取りやすくします。",
    togetherTitle: "図の読み方",
    embeddingTakeaway: "<strong>埋め込み図：</strong>時空を二次曲面として表し、それぞれの座標パッチがどの領域を覆うかを示します。",
    conformalTakeaway: "<strong>共形図：</strong>ヌル方向、共形無限遠、観測者の地平面を明示します。",
    convention: "AdS₂ の埋め込み図では大域時間が周期的な二次曲面を表示し、共形図ではその普遍被覆を示します。",
    embeddingAria: "選択した一定曲率時空の埋め込み図、座標線、局所標構、測地線",
    penroseAria: "選択した時空の因果構造を示す共形図",
    kinds: {
      ads: "AdS₂（負曲率）",
      ds: "dS₂（正曲率）",
    },
    charts: {
      ads: {
        global: "大域座標",
        poincare: "Poincaré パッチ",
      },
      ds: {
        global: "大域座標",
        flat: "膨張平坦パッチ",
        static: "静的パッチ",
      },
    },
    coordinateLabels: {
      "ads|global": ["大域時間 \\(\\tau\\)", "動径座標 \\(\\rho\\)"],
      "ads|poincare": ["Poincaré 時間 \\(t\\)", "動径座標 \\(z\\)"],
      "ds|global": ["大域時間 \\(\\tau\\)", "周期角 \\(\\theta\\)"],
      "ds|flat": ["平坦時間 \\(t\\)", "共動座標 \\(x\\)"],
      "ds|static": ["静的時間 \\(t_s\\)", "静的半径 \\(r\\)"],
    },
    notes: {
      "ads|global": "大域座標は表示した二次曲面全体を覆います。二次曲面上では \\(\\tau\\) は周期的ですが、共形図では時間の周期性をほどいた普遍被覆を示します。",
      "ads|poincare": "Poincaré 座標が覆うのは大域 AdS₂ の一部だけで、\\(z>0\\) です。格子線は表示範囲 \\(|\\rho|\\le2\\) で切り、Poincaré 地平面に近づく領域まで描いています。",
      "ds|global": "大域座標は dS₂ 全体を覆い、空間角 \\(\\theta\\) は周期的です。",
      "ds|flat": "膨張平坦スライスは、スケール因子 \\(e^{t/L}\\) をもつ一つの平坦パッチを覆います。",
      "ds|static": "静的座標は一人の観測者を中心とするパッチを覆い、その境界 \\(|r|=L\\) が宇宙論的地平面に対応します。",
    },
    curvature: {
      ads: "AdS₂ のスカラー曲率は \\(R=-2/L^2\\) です。共形境界は時間的であるため、時間発展を定めるには境界条件が必要です。",
      ds: "dS₂ のスカラー曲率は \\(R=+2/L^2\\) です。過去と未来の共形境界は空間的です。",
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
const savedEmbeddingCameras = new Map();
let renderedEmbeddingKind = null;

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
    marker: {size: 6, color: "#d33f36"}, name: "selected coordinate point",
    showlegend: false, hoverinfo: "skip",
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
  const scene = {...source.scene};
  const savedCamera = savedEmbeddingCameras.get(kind);
  if (savedCamera) scene.camera = JSON.parse(JSON.stringify(savedCamera));
  return {...source, scene};
}

function attachEmbeddingCameraListener() {
  const plot = byId("embedding-plot");
  if (plot.__atlasCameraListenerAttached) return;
  plot.__atlasCameraListenerAttached = true;
  plot.on("plotly_relayout", event => {
    const cameraChanged = Object.keys(event).some(key => key === "scene.camera" || key.startsWith("scene.camera."));
    if (!cameraChanged || !renderedEmbeddingKind) return;
    const camera = event["scene.camera"] ?? plot.layout?.scene?.camera;
    if (camera) savedEmbeddingCameras.set(renderedEmbeddingKind, JSON.parse(JSON.stringify(camera)));
  });
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
  const embeddingUpdate = Plotly.react(
    "embedding-plot", traces, embeddingLayoutWithPreservedCamera(kind), PLOT_CONFIG,
  );
  renderedEmbeddingKind = kind;
  Promise.resolve(embeddingUpdate).then(attachEmbeddingCameraListener);
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
