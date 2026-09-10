import {
  DOMAIN_HALF_HEIGHT,
  DOMAIN_WIDTH,
  advectDyeField,
  advectTracerParticles,
  createDyeField,
  createTracerParticles,
  curveExtent,
  growthRate,
  modeSummary,
  stuartVelocity,
} from "./physics.mjs";

const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const TRANSLATIONS = {
  en: {
    pageTitle: "Kelvin–Helmholtz Instability",
    title: "Kelvin–Helmholtz instability",
    intro: "Adjust the shear-layer parameters, then compare interface roll-up with the linear growth spectrum.",
    velocityKeyLabel: "Far-field velocities of the two fluids",
    parametersLabel: "Kelvin–Helmholtz model parameters",
    velocityDifference: "Velocity difference",
    velocityHint: "\\(\\Delta U\\) · larger values strengthen shear feedback",
    densityRatio: "Density ratio",
    densityHint: "\\(\\rho_1/\\rho_2\\) · logarithmic scale",
    surfaceTension: "Interfacial tension",
    tensionHint: "\\(\\sigma\\) · suppresses sufficiently short waves",
    wavelength: "Wavelength",
    wavelengthHint: "\\(\\lambda=2\\pi/k\\) · the viewport width remains \\(L_x=8\\)",
    selectedMode: "SELECTED MODE",
    growthRate: "GROWTH RATE",
    efoldingTime: "E-FOLDING TIME",
    wavenumber: "WAVENUMBER",
    flowTitle: "Interface roll-up",
    flowCaption: "Color records the side on which each parcel began.",
    canvasLabel: "The boundary between blue and orange material regions rolls up under Kelvin–Helmholtz instability",
    reset: "Reset",
    showParticles: "Show tracers",
    timeLabel: "time",
    plotLegendLabel: "Plot legend",
    growthChartHeading: "growth rate",
    growthChartTitle: "Kelvin–Helmholtz linear growth rate as a function of wavenumber",
    growthChartDescription: "The selected wavelength is marked on the growth-rate curve. Interfacial tension suppresses sufficiently short wavelengths.",
    chartCaption: "The black point marks the selected wavelength.",
    cutoff: "Interfacial-tension cutoff",
    fastestMode: "Fastest-growing mode",
    phaseSpeed: "Phase speed",
    modelBoundary: "Model boundary",
    modelNote: "The spectrum is the linear result for two inviscid, incompressible, infinitely deep fluids with no gravity. The roll-up maps exponential growth onto a divergence-free Kelvin–Stuart cat's-eye flow. It is a schematic bridge, not the exact nonlinear evolution of the two-fluid Euler equations. Stable selections remain at the initial perturbation.",
    unstableStatus: "unstable · exponential",
    stableStatus: "stable · capillary oscillation",
    neutralStatus: "neutral",
    pause: "Pause",
    play: "Play",
    stableMode: "Stable mode",
  },
  ja: {
    pageTitle: "Kelvin–Helmholtz 不安定性",
    title: "Kelvin–Helmholtz 不安定性",
    intro: "せん断層のパラメーターを変え、界面の巻き上がりと線形成長率を比較します。",
    velocityKeyLabel: "二流体の遠方速度",
    parametersLabel: "Kelvin–Helmholtz モデルのパラメーター",
    velocityDifference: "速度差",
    velocityHint: "\\(\\Delta U\\) · 大きいほどせん断のフィードバックが強い",
    densityRatio: "密度比",
    densityHint: "\\(\\rho_1/\\rho_2\\) · 対数スケール",
    surfaceTension: "界面張力",
    tensionHint: "\\(\\sigma\\) · 十分に短い波を抑える",
    wavelength: "波長",
    wavelengthHint: "\\(\\lambda=2\\pi/k\\) · 表示幅は \\(L_x=8\\) に固定",
    selectedMode: "選択中のモード",
    growthRate: "成長率",
    efoldingTime: "e-folding 時間",
    wavenumber: "波数",
    flowTitle: "物質界面の巻き上がり",
    flowCaption: "色は各流体粒子が出発した側を表します。",
    canvasLabel: "青と橙の物質領域の界面が Kelvin–Helmholtz 不安定性で巻き上がる様子",
    reset: "リセット",
    showParticles: "トレーサーを表示",
    timeLabel: "時間",
    plotLegendLabel: "グラフの凡例",
    growthChartHeading: "成長率",
    growthChartTitle: "波数に対する Kelvin–Helmholtz 不安定性の線形成長率",
    growthChartDescription: "選択中の波長を成長率曲線上に示しています。界面張力は十分に短い波長を抑えます。",
    chartCaption: "黒点が選択中の波長です。",
    cutoff: "界面張力によるカットオフ",
    fastestMode: "最も速く成長するモード",
    phaseSpeed: "位相速度",
    modelBoundary: "モデルの範囲",
    modelNote: "スペクトルは、非粘性・非圧縮で無限に深い二流体に対する重力なしの線形結果です。巻き上がりは指数成長を発散のない Kelvin–Stuart の猫の目流れに写した模式的な接続であり、二流体 Euler 方程式の厳密な非線形時間発展ではありません。安定な選択では初期摂動で停止します。",
    unstableStatus: "不安定 · 指数成長",
    stableStatus: "安定 · 毛管波振動",
    neutralStatus: "中立",
    pause: "一時停止",
    play: "再生",
    stableMode: "安定モード",
  },
};

function t(key, replacements = {}) {
  let value = TRANSLATIONS[LOCALE][key];
  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.replace(`{${name}}`, replacement);
  }
  return value;
}

function applyLocale() {
  document.documentElement.lang = LOCALE;
  document.title = t("pageTitle");
  const localizedElements = [...document.querySelectorAll("[data-i18n]")];
  for (const element of localizedElements) element.textContent = t(element.dataset.i18n);
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  window.MathJax?.startup?.promise.then(() => {
    window.MathJax.typesetClear(localizedElements);
    return window.MathJax.typesetPromise(localizedElements);
  }).then(() => window.dispatchEvent(new Event("physics-atlas:mathjax-ready")));
}

const SVG_NS = "http://www.w3.org/2000/svg";
const INK = "#17211e";
const MUTED = "#68746f";
const GRID = "#d2d9d5";
const GOLD = "#bd9a36";

const canvas = document.querySelector("#flow-canvas");
const context = canvas.getContext("2d");
const dyeCanvas = document.createElement("canvas");
const dyeContext = dyeCanvas.getContext("2d");
const growthChart = document.querySelector("#growth-chart");
const controls = {
  velocity: document.querySelector("#velocity-difference"),
  density: document.querySelector("#density-ratio"),
  tension: document.querySelector("#surface-tension"),
  wavelength: document.querySelector("#wavelength"),
  time: document.querySelector("#time-control"),
  particles: document.querySelector("#show-particles"),
};
const outputs = {
  velocity: document.querySelector("#velocity-output"),
  density: document.querySelector("#density-output"),
  tension: document.querySelector("#tension-output"),
  wavelength: document.querySelector("#wavelength-output"),
  gamma: document.querySelector("#gamma-output"),
  efold: document.querySelector("#efold-output"),
  wavenumber: document.querySelector("#wavenumber-output"),
  cutoff: document.querySelector("#cutoff-output"),
  peak: document.querySelector("#peak-output"),
  phase: document.querySelector("#phase-output"),
  time: document.querySelector("#time-output"),
};
const modeStatus = document.querySelector("#mode-status");
const modeStatusText = document.querySelector("#mode-status-text");
const playPause = document.querySelector("#play-pause");
const playIcon = playPause.querySelector("[aria-hidden]");
const playLabel = playPause.querySelector("[data-role='play-label']");
const resetButton = document.querySelector("#reset");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const queryParameters = new URLSearchParams(window.location.search);
const requestedTime = Number(queryParameters.get("time"));
const initialTime = queryParameters.has("time") && Number.isFinite(requestedTime)
  ? Math.max(0, Math.min(Number(controls.time.max), requestedTime))
  : 0;
const state = {
  parameters: readParameters(),
  dyeField: null,
  particles: null,
  showParticles: controls.particles.checked,
  time: 0,
  playing: !reducedMotion && initialTime === 0,
  lastTimestamp: null,
  lastFrameTimestamp: 0,
  pendingScrub: null,
};

function readParameters() {
  return {
    velocityDifference: Number(controls.velocity.value),
    densityRatio: 10 ** Number(controls.density.value),
    surfaceTension: Number(controls.tension.value),
    wavelength: Number(controls.wavelength.value),
  };
}

function seedDye() {
  state.dyeField = createDyeField(state.parameters, 360, 202);
  state.particles = state.showParticles ? createTracerParticles(state.parameters) : null;
}

function advanceDye(duration) {
  if (duration <= 0) return;
  if (modeSummary(state.parameters).status !== "unstable") return;
  advectDyeField(state.dyeField, state.time, duration, state.parameters);
  if (state.showParticles && state.particles !== null) {
    advectTracerParticles(state.particles, state.time, duration, state.parameters);
  }
  state.time += duration;
}

function rebuildAtTime(targetTime) {
  state.time = 0;
  seedDye();
  advanceDye(targetTime);
  updateDynamicReadouts();
  drawFlow();
}

function resizeCanvas() {
  const rectangle = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const targetWidth = Math.max(1, Math.round(rectangle.width * pixelRatio));
  const targetHeight = Math.max(1, Math.round(rectangle.height * pixelRatio));
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { width: rectangle.width, height: rectangle.height };
}

function drawArrow(x, y, dx, dy, scale) {
  const length = Math.hypot(dx, dy);
  if (length < 1e-8) return;
  const factor = scale / Math.max(1, state.parameters.velocityDifference);
  const endX = x + dx * factor;
  const endY = y - dy * factor;
  const angle = Math.atan2(endY - y, endX - x);
  const head = 3.5;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(endX, endY);
  context.lineTo(endX - head * Math.cos(angle - Math.PI / 6), endY - head * Math.sin(angle - Math.PI / 6));
  context.moveTo(endX, endY);
  context.lineTo(endX - head * Math.cos(angle + Math.PI / 6), endY - head * Math.sin(angle + Math.PI / 6));
  context.stroke();
}

function smoothstep(value) {
  const clipped = Math.max(0, Math.min(1, value));
  return clipped * clipped * (3 - 2 * clipped);
}

function renderDyeImage() {
  const { columns, rows, values } = state.dyeField;
  if (dyeCanvas.width !== columns || dyeCanvas.height !== rows) {
    dyeCanvas.width = columns;
    dyeCanvas.height = rows;
  }
  const imageData = dyeContext.createImageData(columns, rows);
  const pixels = imageData.data;
  const edgeWidth = (2 * DOMAIN_HALF_HEIGHT) / rows;
  const top = [194, 222, 237];
  const bottom = [243, 207, 179];
  const bandSpacing = 0.42;

  for (let screenRow = 0; screenRow < rows; screenRow += 1) {
    const sourceRow = rows - 1 - screenRow;
    for (let column = 0; column < columns; column += 1) {
      const fieldValue = values[sourceRow * columns + column];
      const mixture = smoothstep(0.5 + fieldValue / (2 * edgeWidth));
      const band = 0.5 + 0.5 * Math.cos((2 * Math.PI * fieldValue) / bandSpacing);
      const shade = 7 * (band - 0.5);
      const pixelIndex = (screenRow * columns + column) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        pixels[pixelIndex + channel] = Math.round(
          bottom[channel] * (1 - mixture) + top[channel] * mixture - shade,
        );
      }
      pixels[pixelIndex + 3] = 255;
    }
  }
  dyeContext.putImageData(imageData, 0, 0);
}

function drawParticles(toCanvasX, toCanvasY) {
  if (!state.showParticles || state.particles === null) return;
  const { x, y, startedAbove } = state.particles;
  for (const [side, color] of [[1, "rgba(35, 86, 126, 0.78)"], [0, "rgba(157, 75, 27, 0.78)"]]) {
    context.beginPath();
    for (let index = 0; index < x.length; index += 1) {
      if (startedAbove[index] !== side) continue;
      const canvasX = toCanvasX(x[index]);
      const canvasY = toCanvasY(y[index]);
      context.moveTo(canvasX + 1.45, canvasY);
      context.arc(canvasX, canvasY, 1.45, 0, 2 * Math.PI);
    }
    context.fillStyle = color;
    context.fill();
  }
}

function drawFlow() {
  if (state.dyeField === null) return;
  const size = resizeCanvas();
  const toCanvasX = (x) => (x / DOMAIN_WIDTH) * size.width;
  const toCanvasY = (y) => ((DOMAIN_HALF_HEIGHT - y) / (2 * DOMAIN_HALF_HEIGHT)) * size.height;

  context.clearRect(0, 0, size.width, size.height);
  renderDyeImage();
  context.imageSmoothingEnabled = true;
  context.drawImage(dyeCanvas, 0, 0, size.width, size.height);
  drawParticles(toCanvasX, toCanvasY);

  context.strokeStyle = "rgba(23, 33, 30, 0.54)";
  context.lineWidth = 0.82;
  const xPositions = 11;
  const yPositions = 7;
  const isUnstable = modeSummary(state.parameters).status === "unstable";
  for (let row = 0; row < yPositions; row += 1) {
    const y = -0.74 * DOMAIN_HALF_HEIGHT +
      (row / (yPositions - 1)) * 1.48 * DOMAIN_HALF_HEIGHT;
    for (let column = 0; column < xPositions; column += 1) {
      const x = ((column + 0.5) / xPositions) * DOMAIN_WIDTH;
      const velocity = stuartVelocity(
        x,
        y,
        state.time,
        state.parameters,
        isUnstable ? null : 0,
      );
      drawArrow(
        toCanvasX(x),
        toCanvasY(y),
        velocity.u,
        velocity.v,
        Math.min(25, size.width / 36),
      );
    }
  }
}

function svgElement(name, attributes = {}, text = null) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  if (text !== null) element.textContent = text;
  return element;
}

function formatTick(value) {
  if (Math.abs(value) >= 10) return value.toFixed(0);
  if (Math.abs(value) >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

function drawGrowthChart() {
  growthChart.replaceChildren(
    svgElement("title", { id: "growth-title" }, t("growthChartTitle")),
    svgElement(
      "desc",
      { id: "growth-description" },
      t("growthChartDescription"),
    ),
  );
  const frame = { left: 66, right: 24, top: 29, bottom: 60 };
  const chartWidth = 560 - frame.left - frame.right;
  const chartHeight = 390 - frame.top - frame.bottom;
  const summary = modeSummary(state.parameters);
  const xMaximum = curveExtent(state.parameters);
  const samples = 180;
  const points = [];
  let yMaximum = 0.08;
  for (let index = 0; index <= samples; index += 1) {
    const k = (index / samples) * xMaximum;
    const gamma = growthRate(k, state.parameters);
    points.push({ k, gamma });
    yMaximum = Math.max(yMaximum, gamma);
  }
  yMaximum *= 1.13;
  const xScale = (value) => frame.left + (value / xMaximum) * chartWidth;
  const yScale = (value) => frame.top + chartHeight - (value / yMaximum) * chartHeight;

  for (let index = 0; index <= 4; index += 1) {
    const xValue = (index / 4) * xMaximum;
    const x = xScale(xValue);
    growthChart.append(
      svgElement("line", {
        x1: x,
        y1: frame.top,
        x2: x,
        y2: frame.top + chartHeight,
        stroke: GRID,
        "stroke-width": 1,
      }),
      svgElement("text", { x, y: frame.top + chartHeight + 22, "text-anchor": "middle" }, formatTick(xValue)),
    );
  }
  for (let index = 0; index <= 4; index += 1) {
    const yValue = (index / 4) * yMaximum;
    const y = yScale(yValue);
    growthChart.append(
      svgElement("line", {
        x1: frame.left,
        y1: y,
        x2: frame.left + chartWidth,
        y2: y,
        stroke: GRID,
        "stroke-width": 1,
      }),
      svgElement("text", { x: frame.left - 10, y: y + 4, "text-anchor": "end" }, formatTick(yValue)),
    );
  }

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point.k).toFixed(2)},${yScale(point.gamma).toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${xScale(xMaximum)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;
  growthChart.append(
    svgElement("path", { d: areaPath, fill: "#eee5c8", opacity: 0.86 }),
    svgElement("path", {
      d: linePath,
      fill: "none",
      stroke: GOLD,
      "stroke-width": 3,
      "stroke-linejoin": "round",
    }),
  );

  if (Number.isFinite(summary.criticalK) && summary.criticalK > 0 && summary.criticalK <= xMaximum) {
    const cutoffX = xScale(summary.criticalK);
    growthChart.append(
      svgElement("line", {
        x1: cutoffX,
        y1: frame.top,
        x2: cutoffX,
        y2: frame.top + chartHeight,
        stroke: MUTED,
        "stroke-width": 1.2,
        "stroke-dasharray": "3 5",
      }),
      svgElement("text", { x: cutoffX + 7, y: frame.top + 15 }, "cutoff"),
    );
  }

  const selectedX = xScale(summary.k);
  const selectedY = yScale(summary.gamma);
  growthChart.append(
    svgElement("line", {
      x1: selectedX,
      y1: frame.top,
      x2: selectedX,
      y2: frame.top + chartHeight,
      stroke: INK,
      "stroke-width": 1.2,
      "stroke-dasharray": "6 5",
    }),
    svgElement("circle", {
      cx: selectedX,
      cy: selectedY,
      r: 6,
      fill: INK,
      stroke: "white",
      "stroke-width": 2,
    }),
    svgElement(
      "text",
      {
        x: Math.min(selectedX + 10, frame.left + chartWidth - 86),
        y: Math.max(selectedY - 11, frame.top + 13),
        class: "selected-label",
      },
      `selected: ${summary.gamma.toFixed(3)}`,
    ),
    svgElement(
      "text",
      { x: frame.left + chartWidth / 2, y: 377, "text-anchor": "middle", class: "axis-label" },
      "wavenumber",
    ),
    svgElement(
      "text",
      {
        x: 17,
        y: frame.top + chartHeight / 2,
        transform: `rotate(-90 17 ${frame.top + chartHeight / 2})`,
        "text-anchor": "middle",
        class: "axis-label",
      },
      "growth rate",
    ),
  );
}

function formatFinite(value, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : "∞";
}

function updateParameterReadouts() {
  const summary = modeSummary(state.parameters);
  outputs.velocity.value = state.parameters.velocityDifference.toFixed(2);
  outputs.density.value = state.parameters.densityRatio.toFixed(2);
  outputs.tension.value = state.parameters.surfaceTension.toFixed(2);
  outputs.wavelength.value = state.parameters.wavelength.toFixed(1);
  outputs.gamma.value = summary.gamma.toFixed(3);
  outputs.efold.value = summary.gamma > 1e-12 ? (1 / summary.gamma).toFixed(3) : "—";
  outputs.wavenumber.value = summary.k.toFixed(3);
  outputs.cutoff.value = formatFinite(summary.criticalK);
  outputs.peak.value = formatFinite(summary.mostUnstableK);
  outputs.phase.value = summary.phaseSpeed.toFixed(3);

  modeStatus.className = summary.status;
  const isUnstable = summary.status === "unstable";
  if (isUnstable) {
    modeStatusText.textContent = t("unstableStatus");
  } else if (summary.status === "stable") {
    modeStatusText.textContent = t("stableStatus");
  } else {
    modeStatusText.textContent = t("neutralStatus");
  }
  controls.time.disabled = !isUnstable;
  playPause.disabled = !isUnstable;
  if (!isUnstable) state.playing = false;
  updatePlayButton();
}

function updateDynamicReadouts() {
  outputs.time.value = `t = ${state.time.toFixed(2)}`;
  controls.time.value = String(Math.min(Number(controls.time.max), state.time));
}

function updatePlayButton() {
  if (playPause.disabled) {
    playIcon.textContent = "—";
    playLabel.textContent = t("stableMode");
  } else {
    playIcon.textContent = state.playing ? "Ⅱ" : "▶";
    playLabel.textContent = state.playing ? t("pause") : t("play");
  }
}

function refreshParameters() {
  state.parameters = readParameters();
  state.time = 0;
  seedDye();
  updateParameterReadouts();
  updateDynamicReadouts();
  drawGrowthChart();
  drawFlow();
}

for (const control of [controls.velocity, controls.density, controls.tension, controls.wavelength]) {
  control.addEventListener("input", refreshParameters);
}

controls.particles.addEventListener("change", () => {
  state.showParticles = controls.particles.checked;
  if (state.showParticles) {
    state.particles = createTracerParticles(state.parameters);
    if (state.time > 0) {
      advectTracerParticles(state.particles, 0, state.time, state.parameters);
    }
  } else {
    state.particles = null;
  }
  drawFlow();
});

controls.time.addEventListener("input", () => {
  state.playing = false;
  updatePlayButton();
  state.pendingScrub = Number(controls.time.value);
  outputs.time.value = `t = ${state.pendingScrub.toFixed(2)}`;
  requestAnimationFrame(() => {
    if (state.pendingScrub === null) return;
    const target = state.pendingScrub;
    state.pendingScrub = null;
    rebuildAtTime(target);
  });
});

playPause.addEventListener("click", () => {
  if (state.time >= Number(controls.time.max) - 1e-9) {
    rebuildAtTime(0);
  }
  state.playing = !state.playing;
  state.lastTimestamp = null;
  updatePlayButton();
});

resetButton.addEventListener("click", () => {
  state.playing = false;
  rebuildAtTime(0);
  updatePlayButton();
});

canvas.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    playPause.click();
  }
});

function animate(timestamp) {
  if (state.playing && timestamp - state.lastFrameTimestamp >= 24) {
    if (state.lastTimestamp !== null) {
      const wallSeconds = Math.min((timestamp - state.lastTimestamp) / 1000, 0.08);
      const remaining = Number(controls.time.max) - state.time;
      advanceDye(Math.min(remaining, 1.0 * wallSeconds));
      updateDynamicReadouts();
      drawFlow();
      if (state.time >= Number(controls.time.max) - 1e-9) {
        state.playing = false;
        updatePlayButton();
      }
    }
    state.lastTimestamp = timestamp;
    state.lastFrameTimestamp = timestamp;
  } else if (!state.playing) {
    state.lastTimestamp = null;
  }
  requestAnimationFrame(animate);
}

const resizeObserver = new ResizeObserver(drawFlow);
resizeObserver.observe(canvas);

applyLocale();
seedDye();
if (initialTime > 0) advanceDye(initialTime);
updateParameterReadouts();
updateDynamicReadouts();
updatePlayButton();
drawGrowthChart();
drawFlow();
requestAnimationFrame(animate);
