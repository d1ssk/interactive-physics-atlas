"use strict";

const DATA = JSON.parse(document.getElementById("application-data").textContent);
const locale = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";

const I18N = {
  en: {
    pageTitle: "Legendre Transform Explorer — Interactive Physics Atlas",
    siteNavLabel: "Site navigation",
    title: "Legendre Transform Explorer",
    lede: "Move a supporting line and watch its slope and negative intercept become the coordinates of a point on the convex conjugate.",
    settingsLabel: "Display settings",
    functionLabel: "Function",
    modeLabel: "Transform step",
    modeFirst: "1 → 2",
    modeSecond: "2 → 3",
    interactionLabel: "Supporting-line controls",
    firstSliderLabel: "Supporting line on \\(f\\)",
    secondSliderLabel: "Supporting line on \\(f^*\\)",
    play: "▶ Sweep",
    stop: "■ Stop",
    plotsLabel: "Legendre-transform plots",
    enlarge: "Enlarge",
    compare: "Show pair",
    functionPlotLabel: "Original function and selected supporting line",
    dualPlotLabel: "Convex conjugate",
    doublePlotLabel: "Biconjugate",
    definitionHeading: "Definition and geometric interpretation",
    definitionText: "The Legendre transform can be defined as the map from a convex function \\(f\\) to its convex conjugate \\(f^*(p)=\\sup_{x\\in\\mathbb R}\\{px-f(x)\\}\\). If the supremum is attained at \\(x_0\\), the line \\(y=px-f^*(p)\\) is a supporting line of \\(f\\) at \\(x_0\\). Its slope is \\(p\\), while the negative of its vertical intercept is \\(f^*(p)\\).",
    conventionHeading: "Conventions in physics",
    conventionText: "In physics, sign conventions and choices of conjugate variables may differ, and an infimum is sometimes used instead of a supremum, especially for concave entropy functions and thermodynamic potentials. Check the definition being used when comparing formulas.",
    thermoHeading: "Thermodynamic singularities",
    thermoText: "At phase coexistence, a thermodynamic potential can develop a nondifferentiable point, while its conjugate description can contain a linear segment. The last two examples illustrate this correspondence.",
    firstCoordinate: "Contact point on f",
    firstHeight: "Value of f",
    secondCoordinate: "Contact point on f*",
    secondHeight: "Value of f*",
    slopeMapping: "Slope → new horizontal coordinate",
    targetMapping: "−intercept → new vertical coordinate",
    selected: "Selected",
    supportingLine: "Supporting line",
    therefore: "Therefore",
    plotError: "The plots could not be loaded. Reload this page over HTTP or HTTPS.",
  },

  ja: {
    pageTitle: "Legendre変換エクスプローラ — Interactive Physics Atlas",
    siteNavLabel: "サイトナビゲーション",
    title: "Legendre変換エクスプローラ",
    lede: "支持線を動かし、その傾きと切片の符号を反転した量が、凸共役上の点の座標になる様子を観察します。",
    settingsLabel: "表示設定",
    functionLabel: "関数",
    modeLabel: "変換の段階",
    modeFirst: "1 → 2",
    modeSecond: "2 → 3",
    interactionLabel: "支持線の操作",
    firstSliderLabel: "\\(f\\) の支持線",
    secondSliderLabel: "\\(f^*\\) の支持線",
    play: "▶ 走査",
    stop: "■ 停止",
    plotsLabel: "Legendre変換のプロット",
    enlarge: "拡大",
    compare: "2枚に戻る",
    functionPlotLabel: "元の関数と選択した支持線",
    dualPlotLabel: "凸共役",
    doublePlotLabel: "二重共役",
    definitionHeading: "定義と幾何学的解釈",
    definitionText: "Legendre変換は、凸関数 \\(f\\) をその凸共役 \\(f^*(p)=\\sup_{x\\in\\mathbb R}\\{px-f(x)\\}\\) に写す変換として定義できます。上限が \\(x_0\\) で達成されるとき、直線 \\(y=px-f^*(p)\\) は \\(x_0\\) で \\(f\\) を支える支持線になります。その傾きが \\(p\\)、縦軸との切片の符号を反転した量が \\(f^*(p)\\) です。",
    conventionHeading: "物理での規約",
    conventionText: "物理では、共役変数の取り方や符号の規約が異なることがあり、特に凹関数として扱うエントロピーや熱力学ポテンシャルでは、sup の代わりに inf を使う場合もあります。式を比較するときは、どの定義を採用しているかを確認する必要があります。",
    thermoHeading: "熱力学に現れる特異性",
    thermoText: "相共存では、熱力学ポテンシャルに微分不可能な点が現れ、その共役な記述には直線区間が現れることがあります。最後の2例では、この対応を確認できます。",
    firstCoordinate: "f 上の接点",
    firstHeight: "f の値",
    secondCoordinate: "f* 上の接点",
    secondHeight: "f* の値",
    slopeMapping: "傾き → 新しい横座標",
    targetMapping: "−切片 → 新しい縦座標",
    selected: "選択中",
    supportingLine: "支持線",
    therefore: "したがって",
    plotError: "プロットを読み込めませんでした。HTTP または HTTPS でページを再読み込みしてください。",
  },
};

const t = key => I18N[locale][key];
const select = document.getElementById("function-select");
const firstSlider = document.getElementById("first-slider");
const secondSlider = document.getElementById("second-slider");
const playButton = document.getElementById("play-button");
const formulaLine = document.getElementById("formula-line");
const plotError = document.getElementById("plot-error");
const modeButtons = {
  first: document.getElementById("mode-first"),
  second: document.getElementById("mode-second"),
};
const plotIds = ["function-plot", "dual-plot", "double-plot"];
let mode = "first";
let playTimer = null;
let plotlyLoaded = false;
let resizeTimer = null;
let expandedPlot = null;

const COLORS = {
  primal: cssColor("--legendre-primal"),
  dual: cssColor("--legendre-dual"),
  double: cssColor("--legendre-double"),
  tangent: cssColor("--legendre-tangent"),
  slope: cssColor("--legendre-slope"),
  intercept: cssColor("--legendre-intercept"),
  grid: cssColor("--atlas-viz-border"),
  text: cssColor("--legendre-ink"),
};

function cssColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function applyLocale() {
  document.documentElement.lang = locale;
  document.title = t("pageTitle");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }

  const brand = document.getElementById("brand-home");
  const localeLink = document.getElementById("locale-link");
  brand.href = "../../";
  if (locale === "ja") {
    localeLink.href = "../../../mathematics-for-physics/legendre-transform/?lang=en";
    localeLink.lang = "en";
    localeLink.textContent = "English";
  } else {
    localeLink.href = "../../ja/mathematics-for-physics/legendre-transform/?lang=ja";
    localeLink.lang = "ja";
    localeLink.textContent = "日本語";
  }
}

function populateFunctions() {
  select.replaceChildren();
  for (const [key, item] of Object.entries(DATA.functions)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = item.names[locale];
    select.appendChild(option);
  }
  select.value = "quadratic";
}

function fmt(number) {
  if (Math.abs(number) < 5e-8) return "0.000";
  if (Math.abs(number) >= 100) return number.toExponential(3);
  return number.toFixed(3);
}

function negativeTerm(number) {
  if (Math.abs(number) < 5e-8) return "";
  return number < 0 ? `+${fmt(-number)}` : `-${fmt(number)}`;
}

function verticalArrow(x, y, delta) {
  return {
    x: [x, x],
    y: [y, y + delta],
    mode: "lines+markers",
    showlegend: false,
    hoverinfo: "skip",
    line: {color: COLORS.slope, width: 2.4},
    marker: {
      color: COLORS.slope,
      size: [0, 6],
      symbol: ["circle", delta < 0 ? "triangle-down" : "triangle-up"],
      line: {width: 0},
    },
  };
}

function horizontalArrow(delta) {
  return {
    x: [0, delta],
    y: [0, 0],
    mode: "lines+markers",
    showlegend: false,
    hoverinfo: "skip",
    line: {color: COLORS.slope, width: 2.4},
    marker: {
      color: COLORS.slope,
      size: [0, 6],
      symbol: ["circle", delta < 0 ? "triangle-left" : "triangle-right"],
      line: {width: 0},
    },
  };
}

function valueArrow(x, value) {
  return {
    x,
    y: value,
    ax: x,
    ay: 0,
    xref: "x",
    yref: "y",
    axref: "x",
    ayref: "y",
    text: "",
    showarrow: true,
    arrowhead: 2,
    arrowsize: .65,
    arrowwidth: 2.2,
    arrowcolor: COLORS.intercept,
    standoff: 7,
  };
}

function basePrimalTrace(item) {
  return {
    x: item.x,
    y: item.f,
    mode: "lines",
    name: "f(x)",
    line: {color: COLORS.primal, width: 3.5},
    hovertemplate: "x=%{x:.3f}<br>f(x)=%{y:.3f}<extra></extra>",
  };
}

function baseDualTrace(item) {
  return {
    x: item.p,
    y: item.fStar,
    mode: "lines",
    name: "f*(p)",
    line: {color: COLORS.dual, width: 3.5},
    hovertemplate: "p=%{x:.3f}<br>f*(p)=%{y:.3f}<extra></extra>",
  };
}

function baseDoubleTraces(item) {
  return [
    {
      x: item.x,
      y: item.f,
      mode: "lines",
      name: "f(x)",
      hoverinfo: "skip",
      line: {color: COLORS.grid, width: 6},
    },
    {
      x: item.doubleX,
      y: item.fDouble,
      mode: "lines",
      name: "f**(x)",
      line: {color: COLORS.double, width: 3},
      hovertemplate: "x=%{x:.3f}<br>f**(x)=%{y:.3f}<extra></extra>",
    },
  ];
}

function plotLayout(title, xTitle, yTitle, commonRange, shapes, annotations) {
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  return {
    title: {text: title, font: {size: mobile ? 13 : 16}},
    font: {
      family: "Inter, Noto Sans JP, ui-sans-serif, system-ui, sans-serif",
      color: COLORS.text,
      size: mobile ? 10 : 12,
    },
    margin: mobile ? {l: 42, r: 6, t: 38, b: 39} : {l: 50, r: 8, t: 45, b: 46},
    xaxis: {
      title: xTitle,
      range: commonRange,
      constrain: "domain",
      zeroline: true,
      gridcolor: COLORS.grid,
      tickvals: mobile ? [-4, -2, 0, 2, 4] : undefined,
    },
    yaxis: {
      title: yTitle,
      range: commonRange,
      scaleanchor: "x",
      scaleratio: 1,
      constrain: "domain",
      zeroline: true,
      gridcolor: COLORS.grid,
      tickvals: mobile ? [-4, -2, 0, 2, 4] : undefined,
    },
    shapes,
    annotations,
    dragmode: "pan",
    hovermode: "closest",
    showlegend: false,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
  };
}

function plotConfig() {
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  return {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
    displayModeBar: mobile ? false : "hover",
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  };
}

function renderMath(element) {
  if (!window.MathJax?.typesetPromise) return;
  MathJax.startup.promise.then(() => {
    MathJax.typesetClear([element]);
    return MathJax.typesetPromise([element]);
  });
}

function selectedState() {
  const item = DATA.functions[select.value];
  const slider = mode === "first" ? firstSlider : secondSlider;
  const contacts = mode === "first" ? item.firstContacts : item.secondContacts;
  const index = Math.min(Number(slider.value), contacts.x.length - 1);
  return {
    item,
    x0: contacts.x[index],
    f0: contacts.f[index],
    p0: contacts.p[index],
    star0: contacts.fStar[index],
  };
}

function updateReadout(state) {
  const {item, x0, f0, p0, star0} = state;
  const sourceCoordinateLabel = document.getElementById("source-coordinate-label");
  const sourceCoordinateValue = document.getElementById("source-coordinate-value");
  const sourceHeightLabel = document.getElementById("source-height-label");
  const sourceHeightValue = document.getElementById("source-height-value");
  const slopeLabel = document.getElementById("slope-label");
  const slopeValue = document.getElementById("slope-value");
  const targetLabel = document.getElementById("target-label");
  const targetValue = document.getElementById("target-value");

  slopeLabel.textContent = t("slopeMapping");
  targetLabel.textContent = t("targetMapping");
  if (mode === "first") {
    sourceCoordinateLabel.textContent = t("firstCoordinate");
    sourceCoordinateValue.textContent = `x₀ = ${fmt(x0)}`;
    sourceHeightLabel.textContent = t("firstHeight");
    sourceHeightValue.textContent = `f(x₀) = ${fmt(f0)}`;
    slopeValue.textContent = `p = ${fmt(p0)}`;
    targetValue.textContent = `f*(p) = ${fmt(star0)}`;
    formulaLine.textContent = `${t("selected")}: \\(${item.formula}\\). ${t("supportingLine")} \\(y=${fmt(p0)}x${negativeTerm(star0)}\\).`;
  } else {
    sourceCoordinateLabel.textContent = t("secondCoordinate");
    sourceCoordinateValue.textContent = `p₀ = ${fmt(p0)}`;
    sourceHeightLabel.textContent = t("secondHeight");
    sourceHeightValue.textContent = `f*(p₀) = ${fmt(star0)}`;
    slopeValue.textContent = `x = ${fmt(x0)}`;
    targetValue.textContent = `f**(x) = ${fmt(f0)}`;
    formulaLine.textContent = `\\(f^*\\): \\(y=${fmt(x0)}p${negativeTerm(f0)}\\). ${t("therefore")} \\(f^{**}(${fmt(x0)})=${fmt(f0)}\\).`;
  }
  renderMath(formulaLine);
}

function redraw() {
  const state = selectedState();
  updateReadout(state);
  if (!plotlyLoaded) return;

  const {item, x0, f0, p0, star0} = state;
  const commonRange = [-item.axisLimit, item.axisLimit];
  const primalTraces = [basePrimalTrace(item)];
  const dualTraces = [baseDualTrace(item)];
  const doubleTraces = baseDoubleTraces(item);
  let primalShapes = [];
  let dualShapes = [];
  let primalAnnotations = [];
  let dualAnnotations = [];
  let doubleAnnotations = [];

  if (mode === "first") {
    primalTraces.push(
      {
        x: commonRange,
        y: commonRange.map(x => f0 + p0 * (x - x0)),
        mode: "lines",
        showlegend: false,
        line: {color: COLORS.tangent, width: 2.5},
        hoverinfo: "skip",
      },
      {
        x: [x0],
        y: [f0],
        mode: "markers",
        showlegend: false,
        marker: {color: COLORS.tangent, size: 10, line: {color: "white", width: 2}},
        hovertemplate: "x₀=%{x:.3f}<br>f(x₀)=%{y:.3f}<extra></extra>",
      },
      {
        x: [0],
        y: [-star0],
        mode: "markers",
        showlegend: false,
        marker: {color: COLORS.intercept, size: 11, symbol: "diamond", line: {color: "white", width: 1.5}},
        hovertemplate: "intercept=%{y:.3f}<extra></extra>",
      },
      verticalArrow(x0 + 1, f0, p0),
    );
    dualTraces.push(
      {
        x: [p0],
        y: [star0],
        mode: "markers",
        showlegend: false,
        marker: {color: COLORS.intercept, size: 11, symbol: "diamond", line: {color: "white", width: 1.5}},
        hovertemplate: "p=%{x:.3f}<br>f*(p)=%{y:.3f}<extra></extra>",
      },
      horizontalArrow(p0),
    );
    primalShapes = [{type: "line", x0, x1: x0 + 1, y0: f0, y1: f0, line: {color: COLORS.grid, width: 2}}];
    primalAnnotations = [valueArrow(0, -star0)];
    dualAnnotations = [valueArrow(p0, star0)];
  } else {
    dualTraces.push(
      {
        x: commonRange,
        y: commonRange.map(p => star0 + x0 * (p - p0)),
        mode: "lines",
        showlegend: false,
        line: {color: COLORS.tangent, width: 2.5},
        hoverinfo: "skip",
      },
      {
        x: [p0],
        y: [star0],
        mode: "markers",
        showlegend: false,
        marker: {color: COLORS.tangent, size: 10, line: {color: "white", width: 2}},
        hovertemplate: "p₀=%{x:.3f}<br>f*(p₀)=%{y:.3f}<extra></extra>",
      },
      {
        x: [0],
        y: [-f0],
        mode: "markers",
        showlegend: false,
        marker: {color: COLORS.intercept, size: 11, symbol: "diamond", line: {color: "white", width: 1.5}},
        hovertemplate: "intercept=%{y:.3f}<extra></extra>",
      },
      verticalArrow(p0 + 1, star0, x0),
    );
    doubleTraces.push(
      {
        x: [x0],
        y: [f0],
        mode: "markers",
        showlegend: false,
        marker: {color: COLORS.intercept, size: 11, symbol: "diamond", line: {color: "white", width: 1.5}},
        hovertemplate: "x=%{x:.3f}<br>f**(x)=%{y:.3f}<extra></extra>",
      },
      horizontalArrow(x0),
    );
    dualShapes = [{type: "line", x0: p0, x1: p0 + 1, y0: star0, y1: star0, line: {color: COLORS.grid, width: 2}}];
    dualAnnotations = [valueArrow(0, -f0)];
    doubleAnnotations = [valueArrow(x0, f0)];
  }

  const config = plotConfig();
  const renders = [
    Plotly.react("function-plot", primalTraces, plotLayout("1. Original function  f", "x", "f(x)", commonRange, primalShapes, primalAnnotations), config),
    Plotly.react("dual-plot", dualTraces, plotLayout("2. Convex conjugate  f*", "p", "f*(p)", commonRange, dualShapes, dualAnnotations), config),
    Plotly.react("double-plot", doubleTraces, plotLayout("3. Biconjugate  f** = f", "x", "f**(x)", commonRange, [], doubleAnnotations), config),
  ];
  Promise.all(renders).then(() => window.dispatchEvent(new Event("physics-atlas:plot-rendered")));
}

function stopPlaying() {
  if (playTimer !== null) window.clearInterval(playTimer);
  playTimer = null;
  playButton.textContent = t("play");
}

function clearDetailView() {
  expandedPlot = null;
  document.body.classList.remove("detail-view");
  for (const card of document.querySelectorAll(".plot-card")) card.classList.remove("expanded");
  for (const button of document.querySelectorAll(".expand-button")) {
    button.textContent = t("enlarge");
    button.setAttribute("aria-expanded", "false");
  }
}

function setModeAppearance() {
  const first = mode === "first";
  document.body.classList.toggle("mode-first", first);
  document.body.classList.toggle("mode-second", !first);
  modeButtons.first.classList.toggle("active", first);
  modeButtons.second.classList.toggle("active", !first);
  modeButtons.first.setAttribute("aria-pressed", String(first));
  modeButtons.second.setAttribute("aria-pressed", String(!first));
  firstSlider.closest("label").hidden = !first;
  secondSlider.closest("label").hidden = first;
  document.getElementById("function-card").classList.toggle("inactive", !first);
  document.getElementById("double-card").classList.toggle("inactive", first);
}

function chooseMode(nextMode) {
  stopPlaying();
  clearDetailView();
  mode = nextMode;
  setModeAppearance();
  redraw();
}

function resetForFunction() {
  const item = DATA.functions[select.value];
  firstSlider.max = item.firstContacts.p.length - 1;
  secondSlider.max = item.secondContacts.p.length - 1;
  firstSlider.value = Math.floor(Number(firstSlider.max) / 2);
  secondSlider.value = Math.floor(Number(secondSlider.max) / 2);
  redraw();
}

function toggleDetail(button) {
  const name = button.dataset.plot;
  if (expandedPlot === name) {
    clearDetailView();
  } else {
    clearDetailView();
    expandedPlot = name;
    document.body.classList.add("detail-view");
    button.closest(".plot-card").classList.add("expanded");
    button.textContent = t("compare");
    button.setAttribute("aria-expanded", "true");
  }
  window.setTimeout(resizeVisiblePlots, 0);
}

function resizeVisiblePlots() {
  if (!plotlyLoaded) return;
  for (const id of plotIds) {
    const plot = document.getElementById(id);
    if (plot.offsetParent !== null) Plotly.Plots.resize(plot);
  }
}

select.addEventListener("change", resetForFunction);
firstSlider.addEventListener("input", redraw);
secondSlider.addEventListener("input", redraw);
modeButtons.first.addEventListener("click", () => chooseMode("first"));
modeButtons.second.addEventListener("click", () => chooseMode("second"));
playButton.addEventListener("click", () => {
  if (playTimer !== null) {
    stopPlaying();
    return;
  }
  playButton.textContent = t("stop");
  playTimer = window.setInterval(() => {
    const slider = mode === "first" ? firstSlider : secondSlider;
    slider.value = (Number(slider.value) + 1) % (Number(slider.max) + 1);
    redraw();
  }, 55);
});
for (const button of document.querySelectorAll(".expand-button")) {
  button.addEventListener("click", () => toggleDetail(button));
}
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (window.innerWidth > 760 && expandedPlot !== null) clearDetailView();
    redraw();
    resizeVisiblePlots();
  }, 120);
});
window.addEventListener("physics-atlas:mathjax-ready", () => renderMath(formulaLine));

applyLocale();
populateFunctions();
setModeAppearance();
resetForFunction();
window.physicsAtlasPlotlyReady
  .then(() => {
    plotlyLoaded = true;
    redraw();
  })
  .catch(() => {
    plotError.textContent = t("plotError");
    plotError.hidden = false;
  });
