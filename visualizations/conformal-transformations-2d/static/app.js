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
    title: "Two-Dimensional Conformal Transformations",
    lede: "Follow conformality from a local differential to global Möbius maps and the infinitesimal Witt algebra.",
    localStep: "1 · Local differential",
    localTitle: "When does a small circle stay a circle?",
    mapLabel: "Map",
    mixingLabel: "Antiholomorphic mixing \\(\\lambda\\)",
    axisRatio: "axis ratio \\(K\\)",
    orientationLabel: "orientation",
    localCaption: "Purple is the exact image of a small circle; dashed green is its first-order Wirtinger approximation. A conformal differential keeps the two local singular values equal.",
    globalStep: "2 · Global completion",
    globalTitle: "Möbius transformations act smoothly through infinity",
    mobiusLabel: "\\(\\mathrm{PSL}(2,\\mathbb C)\\) preset",
    sphereLegend: "Gray lines are the reference grid. Blue and gold are transformed latitude and longitude families. Red points are fixed eigenlines.",
    mobiusInvariant: "<strong>Invariant:</strong> generalized circles map to generalized circles, crossing angles are preserved, and the ordered cross ratio is unchanged.",
    algebraStep: "3 · Infinitesimal conformal algebra",
    algebraTitle: "Global Möbius modes sit inside the Witt algebra",
    modeLabel: "Mode \\(m\\)",
    flowLabel: "Flow parameter \\(\\epsilon\\)",
    wittCaption: "Red arrows show the positive-parameter generator. Only \\(m=-1,0,1\\) are everywhere-regular holomorphic vector fields on the Riemann sphere; the other finite maps shown use a principal branch and are local.",
    chainTitle: "The conceptual chain",
    chainLocal: "<strong>Local:</strong> \\(\\partial_{\\bar z}f=0\\) makes the real Jacobian a rotation times a scale when \\(\\partial_zf\\ne0\\).",
    chainGlobal: "<strong>Global:</strong> bijective holomorphic maps of \\(\\mathbb{CP}^1\\) form \\(\\mathrm{PSL}(2,\\mathbb C)\\).",
    chainAlgebra: "<strong>Algebraic:</strong> \\(\\ell_{-1},\\ell_0,\\ell_1\\) generate the global subgroup; all integer modes form the centerless Witt algebra locally.",
    orientationPreserving: "preserving",
    orientationReversing: "reversing",
    orientationDegenerate: "degenerate",
    localPlotAria: "A complex-plane grid and small circle before and after the selected map",
    spherePlotAria: "Reference and transformed coordinate curves on the Riemann sphere",
    wittPlotAria: "Finite Witt flow and its infinitesimal vector field on the complex plane",
    localNotes: {
      square: "Away from \\(z=0\\), the differential is multiplication by \\(2z\\), so a sufficiently small circle stays circular.",
      conjugate: "Angles are preserved in magnitude, but complex conjugation reverses the orientation of every local frame.",
      mixed: "At \\(\\lambda=0\\) the map is holomorphic. Increasing \\(\\lambda\\) separates the singular values; degeneracy occurs at \\(|\\lambda|=1\\).",
      exponential: "The global grid bends and repeats, while every nonzero local derivative remains a rotation followed by a scale.",
      "special-conformal": "This is the finite flow of \\(\\ell_1=-z^2\\partial_z\\), away from its pole in the plane chart.",
    },
    mobiusNotes: {
      identity: "Every sphere point is fixed; the transformed and reference grids coincide.",
      translation: "Infinity is fixed. Circles through infinity appear as lines in the complex-plane chart.",
      dilation: "Zero and infinity are fixed; this is conformal but not an isometry of the round sphere.",
      rotation: "The \\(\\mathrm{PSU}(2)\\) subgroup also preserves the round-sphere metric.",
      special: "This is a finite \\(\\ell_1\\) flow. Its apparent plane pole is an ordinary point mapping to infinity on \\(\\mathbb{CP}^1\\).",
      loxodromic: "A generic map has two fixed points and combines rotation with contraction and expansion along the sphere.",
    },
    wittNotes: {
      "-2": "\\(\\ell_{-2}\\) has a pole at \\(z=0\\); its principal-branch finite flow is only a local visualization.",
      "-1": "\\(\\ell_{-1}\\) generates translations and is globally Möbius on the Riemann sphere.",
      "0": "\\(\\ell_0\\) generates dilation for real \\(\\epsilon\\) and rotation for imaginary \\(\\epsilon\\); it is globally Möbius.",
      "1": "\\(\\ell_1\\) generates \\(z\\mapsto z/(1+\\epsilon z)\\), the holomorphic special conformal transformation.",
      "2": "\\(\\ell_2\\) is locally holomorphic, but the finite principal-branch map is not a one-to-one automorphism of the sphere.",
    },
    flowBackward: " The finite grid flows opposite to the red arrows because \\(\\epsilon<0\\).",
    flowForward: " The finite grid flows along the red arrows because \\(\\epsilon>0\\).",
    flowZero: " At \\(\\epsilon=0\\) the grid is unchanged; the arrows still show the positive generator.",
  },
  ja: {
    title: "2次元共形変換",
    lede: "局所微分から大域的なMöbius変換、無限小Witt代数まで、共形性のつながりを調べます。",
    localStep: "1 · 局所微分",
    localTitle: "小さな円が円のまま写る条件",
    mapLabel: "写像",
    mixingLabel: "反正則混合 \\(\\lambda\\)",
    axisRatio: "軸比 \\(K\\)",
    orientationLabel: "向き",
    localCaption: "紫線は小円の厳密な像、緑の破線はWirtinger微分による一次近似です。共形微分では二つの局所特異値が一致します。",
    globalStep: "2 · 大域的完備化",
    globalTitle: "Möbius変換は無限遠点を越えて滑らかに作用する",
    mobiusLabel: "\\(\\mathrm{PSL}(2,\\mathbb C)\\) のプリセット",
    sphereLegend: "灰色は基準格子、青と金は変換後の緯線・経線です。赤点は射影行列の固定固有直線を表します。",
    mobiusInvariant: "<strong>不変量：</strong>一般化円は一般化円へ写り、交差角と順序付き交比は保存されます。",
    algebraStep: "3 · 無限小共形代数",
    algebraTitle: "大域的MöbiusモードはWitt代数に含まれる",
    modeLabel: "モード \\(m\\)",
    flowLabel: "フローパラメータ \\(\\epsilon\\)",
    wittCaption: "赤い矢印は正のパラメータに対する生成子です。Riemann球面上の至る所で正則なベクトル場は \\(m=-1,0,1\\) だけです。それ以外の有限変換は主値分枝を選んだ局所表示です。",
    chainTitle: "概念のつながり",
    chainLocal: "<strong>局所：</strong>\\(\\partial_{\\bar z}f=0\\) かつ \\(\\partial_zf\\ne0\\) なら、実Jacobianは回転と一様拡大縮小の積になります。",
    chainGlobal: "<strong>大域：</strong>\\(\\mathbb{CP}^1\\) の正則自己同型は \\(\\mathrm{PSL}(2,\\mathbb C)\\) をなします。",
    chainAlgebra: "<strong>代数：</strong>\\(\\ell_{-1},\\ell_0,\\ell_1\\) が大域部分群を生成し、整数モード全体は局所的に中心なしWitt代数をなします。",
    orientationPreserving: "保存",
    orientationReversing: "反転",
    orientationDegenerate: "退化",
    localPlotAria: "選択した写像の前後における複素平面の格子と小円",
    spherePlotAria: "Riemann球面上の基準座標曲線と変換後の曲線",
    wittPlotAria: "複素平面上の有限Wittフローと無限小ベクトル場",
    localNotes: {
      square: "\\(z=0\\) から離れた点では微分が \\(2z\\) の乗算なので、十分小さな円は円に写ります。",
      conjugate: "角の大きさは保たれますが、複素共役は各局所標構の向きを反転します。",
      mixed: "\\(\\lambda=0\\) では正則です。\\(\\lambda\\) を増やすと二つの特異値が離れ、\\(|\\lambda|=1\\) で退化します。",
      exponential: "大域的には格子が曲がって重なりますが、零でない局所微分は常に回転と一様拡大縮小です。",
      "special-conformal": "平面chart上の極を除けば、これは \\(\\ell_1=-z^2\\partial_z\\) の有限フローです。",
    },
    mobiusNotes: {
      identity: "球面上の全点が固定され、変換後の格子は基準格子と一致します。",
      translation: "無限遠点は固定されます。無限遠点を通る円は複素平面chartでは直線に見えます。",
      dilation: "零点と無限遠点が固定されます。共形変換ですが、丸い球面の等長変換ではありません。",
      rotation: "部分群 \\(\\mathrm{PSU}(2)\\) は丸い球面の計量も保存します。",
      special: "これは有限 \\(\\ell_1\\) フローです。平面上の見かけの極は、\\(\\mathbb{CP}^1\\) 上で無限遠点へ写る通常の点です。",
      loxodromic: "一般の変換は二つの固定点を持ち、球面に沿う回転と収縮・膨張を組み合わせます。",
    },
    wittNotes: {
      "-2": "\\(\\ell_{-2}\\) は \\(z=0\\) に極を持つため、主値分枝による有限フローは局所的な表示に限られます。",
      "-1": "\\(\\ell_{-1}\\) は平行移動を生成し、Riemann球面上で大域的なMöbius変換になります。",
      "0": "\\(\\ell_0\\) は実 \\(\\epsilon\\) に対して拡大縮小、虚 \\(\\epsilon\\) に対して回転を生成し、大域的なMöbius変換になります。",
      "1": "\\(\\ell_1\\) は正則特殊共形変換 \\(z\\mapsto z/(1+\\epsilon z)\\) を生成します。",
      "2": "\\(\\ell_2\\) は局所的には正則ですが、主値分枝で表した有限変換は球面の一対一な自己同型ではありません。",
    },
    flowBackward: " \\(\\epsilon<0\\) なので、有限格子は赤い矢印と反対向きに流れます。",
    flowForward: " \\(\\epsilon>0\\) なので、有限格子は赤い矢印の向きに流れます。",
    flowZero: " \\(\\epsilon=0\\) では格子は不変ですが、矢印は正の生成子を示します。",
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
    for (const id of ["local-grid", "mobius-sphere", "witt-plot"]) {
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
  byId("local-grid").setAttribute("aria-label", t("localPlotAria"));
  byId("mobius-sphere").setAttribute("aria-label", t("spherePlotAria"));
  byId("witt-plot").setAttribute("aria-label", t("wittPlotAria"));
  typeset(document.body);
}

const LOCAL_LABELS = {
  en: {
    square: "holomorphic: f(z) = z²",
    conjugate: "antiholomorphic: f(z) = z̄",
    mixed: "nonconformal: f(z) = z + 0.4z̄",
    exponential: "holomorphic: f(z) = exp(z)",
    "special-conformal": "Möbius/SCT: f(z) = z/(1 + 0.4z)",
  },
  ja: {
    square: "正則：f(z) = z²",
    conjugate: "反正則：f(z) = z̄",
    mixed: "非共形：f(z) = z + 0.4z̄",
    exponential: "正則：f(z) = exp(z)",
    "special-conformal": "Möbius/SCT：f(z) = z/(1 + 0.4z)",
  },
};

const MOBIUS_LABELS = {
  en: {identity: "identity", translation: "translation", dilation: "dilation", rotation: "sphere rotation", special: "special conformal", loxodromic: "loxodromic"},
  ja: {identity: "恒等変換", translation: "平行移動", dilation: "拡大縮小", rotation: "球面回転", special: "特殊共形変換", loxodromic: "loxodromic変換"},
};

const WITT_LABELS = {
  en: {"-2": "m = −2", "-1": "m = −1 · translation", "0": "m = 0 · dilation", "1": "m = 1 · special conformal", "2": "m = 2"},
  ja: {"-2": "m = −2", "-1": "m = −1 · 平行移動", "0": "m = 0 · 拡大縮小", "1": "m = 1 · 特殊共形", "2": "m = 2"},
};

function renderLocal() {
  const key = byId("local-map").value;
  const usesMixing = key === "mixed";
  byId("mixing-control").classList.toggle("is-hidden", !usesMixing);
  const mixingIndex = Number(byId("mixing").value);
  const item = usesMixing ? DATA.localVariants[DATA.mixingKeys[mixingIndex]] : DATA.local[key];
  Plotly.react("local-grid", item.grid.data, item.grid.layout, PLOT_CONFIG);
  byId("partial-z").textContent = item.partialZ;
  byId("partial-zbar").textContent = item.partialZbar;
  byId("distortion").textContent = item.distortion === "infinite" ? "∞" : item.distortion;
  const orientationKey = `orientation${item.orientation[0].toUpperCase()}${item.orientation.slice(1)}`;
  byId("orientation").textContent = t(orientationKey);
  byId("local-note").innerHTML = t("localNotes")[key];
  byId("mixing-value").textContent = Number(DATA.mixingValues[mixingIndex]).toFixed(2);
  typeset(byId("local-note"));
  schedulePlotResize();
}

function renderMobius() {
  const key = byId("mobius-preset").value;
  const item = DATA.mobius[key];
  Plotly.react("mobius-sphere", item.figure.data, item.figure.layout, PLOT_CONFIG);
  byId("mobius-note").innerHTML = t("mobiusNotes")[key];
  byId("mobius-matrix").textContent = `\\(M\\sim\\begin{pmatrix}${item.matrix[0][0]}&${item.matrix[0][1]}\\\\${item.matrix[1][0]}&${item.matrix[1][1]}\\end{pmatrix},\\quad\\det M=1\\)`;
  typeset(byId("mobius-note"));
  typeset(byId("mobius-matrix"));
  schedulePlotResize();
}

function renderWitt() {
  const mode = byId("witt-mode").value;
  const epsilonIndex = Number(byId("epsilon").value);
  const epsilon = Number(DATA.epsilonValues[epsilonIndex]);
  const figure = DATA.witt[mode][DATA.epsilonKeys[epsilonIndex]];
  Plotly.react("witt-plot", figure.data, figure.layout, PLOT_CONFIG);
  const direction = epsilon < 0 ? t("flowBackward") : epsilon > 0 ? t("flowForward") : t("flowZero");
  byId("witt-note").innerHTML = t("wittNotes")[mode] + direction;
  byId("epsilon-value").textContent = epsilon.toFixed(3);
  typeset(byId("witt-note"));
  schedulePlotResize();
}

localizeStaticContent();
byId("local-map").replaceChildren(...Object.entries(LOCAL_LABELS[LOCALE]).map(([key, label]) => new Option(label, key)));
byId("local-map").addEventListener("change", renderLocal);
byId("mixing").min = 0;
byId("mixing").max = DATA.mixingValues.length - 1;
byId("mixing").step = 1;
byId("mixing").value = DATA.mixingValues.findIndex(value => Math.abs(value - 0.4) < 1e-9);
byId("mixing").addEventListener("input", renderLocal);
byId("mobius-preset").replaceChildren(...Object.entries(MOBIUS_LABELS[LOCALE]).map(([key, label]) => new Option(label, key)));
byId("mobius-preset").addEventListener("change", renderMobius);
byId("witt-mode").replaceChildren(...Object.entries(WITT_LABELS[LOCALE]).map(([key, label]) => new Option(label, key)));
byId("witt-mode").value = "1";
byId("witt-mode").addEventListener("change", renderWitt);
byId("epsilon").min = 0;
byId("epsilon").max = DATA.epsilonValues.length - 1;
byId("epsilon").step = 1;
byId("epsilon").value = DATA.epsilonValues.findIndex(value => Math.abs(value - 0.2) < 1e-9);
if (Number(byId("epsilon").value) < 0) byId("epsilon").value = Math.floor(DATA.epsilonValues.length / 2);
byId("epsilon").addEventListener("input", renderWitt);
renderLocal();
renderMobius();
renderWitt();
