"use strict";

import * as Physics from "./runtime/hydrogen-domain-v1.mjs";
import * as Camera from "./runtime/z-up-camera-v1.mjs";
const byId = id => document.getElementById(id);
const canvas = byId("orbital-canvas");
const context = canvas.getContext("2d");
const radialCanvas = byId("radial-chart");
const radialContext = radialCanvas.getContext("2d");
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const MESSAGES = {
  en: {
    title: "Hydrogen Wavefunction",
    lede: "Explore the three-dimensional shape, probability density, and complex phase of hydrogen wavefunctions, including superpositions and time evolution.",
    presets: "Presets",
    beatWord: "beat",
    stateHeading: "State superposition",
    addComponent: "Add component",
    angularBasis: "Angular basis",
    complexBasis: "Complex",
    eigenstates: "eigenstates",
    coefficientHelp: "Coefficients are normalized automatically. Relative phases are entered in degrees.",
    timeHeading: "Time evolution",
    play: "Play",
    pause: "Pause",
    resetTime: "Reset time",
    playbackSpeed: "Playback speed",
    timeHelp: "One atomic time unit is 24.19 as. Each component evolves as \\(\\exp(-iE_n t/\\hbar)\\).",
    displayHeading: "Display",
    pointCount: "Point count",
    pointsLight: "3,500 · light",
    pointsStandard: "7,000 · standard",
    pointsDense: "12,000 · dense",
    resample: "Resample",
    resetView: "Reset view",
    spinOff: "Auto-rotate: off",
    spinOn: "Auto-rotate: on",
    phaseLabel: "Phase \\(\\arg\\psi\\)",
    norm: "Norm",
    expectedEnergy: "Energy expectation value",
    energySpread: "Energy spread",
    beatPeriod: "Shortest beat period",
    stationaryDensity: "stationary density",
    radialLabel: "Angle-integrated radial probability \\(P(r,t)\\)",
    loading: "Calculating…",
    sampling: "Sampling the superposition…",
    invalidSettings: "Check the state settings and use at least one nonzero coefficient.",
    viewerHelp: "Drag: rotate · Wheel: zoom",
    displayDetails: "About the display",
    detailPhase: "Hue represents the complex phase; point placement and brightness represent probability density. A hybrid containing only one principal quantum number has stationary density while its common phase evolves.",
    detailHybrid: "The \\(sp\\), \\(sp^2\\), and \\(sp^3\\) presets assemble the \\(n=2\\) state \\(2s\\) and directional \\(2p\\) orbitals in the complex \\(Y_\\ell^m\\) basis. Relative phases change when different principal quantum numbers are combined, so the interference pattern evolves.",
    amplitude: "Amplitude",
    relativePhase: "Phase °",
    removeComponent: "Remove this component",
  },
  ja: {
    title: "水素原子の波動関数",
    lede: "水素原子の波動関数について、三次元の形、確率密度、複素位相を観察し、重ね合わせや時間発展も調べます。",
    presets: "プリセット",
    beatWord: "ビート",
    stateHeading: "状態の重ね合わせ",
    addComponent: "成分を追加",
    angularBasis: "角度部分の基底",
    complexBasis: "複素",
    eigenstates: "固有状態",
    coefficientHelp: "係数は自動的に規格化されます。相対位相は度単位で指定します。",
    timeHeading: "時間発展",
    play: "再生",
    pause: "一時停止",
    resetTime: "時刻を戻す",
    playbackSpeed: "再生速度",
    timeHelp: "1原子時間は24.19 asです。各成分は \\(\\exp(-iE_n t/\\hbar)\\) に従って発展します。",
    displayHeading: "表示",
    pointCount: "点の数",
    pointsLight: "3,500 · 軽量",
    pointsStandard: "7,000 · 標準",
    pointsDense: "12,000 · 高密度",
    resample: "再サンプル",
    resetView: "視点を戻す",
    spinOff: "自動回転：オフ",
    spinOn: "自動回転：オン",
    phaseLabel: "位相 \\(\\arg\\psi\\)",
    norm: "規格化",
    expectedEnergy: "エネルギー期待値",
    energySpread: "エネルギー幅",
    beatPeriod: "最短ビート周期",
    stationaryDensity: "定常密度",
    radialLabel: "角度積分した動径確率 \\(P(r,t)\\)",
    loading: "計算中…",
    sampling: "重ね合わせをサンプリング中…",
    invalidSettings: "状態の設定を確認し、少なくとも1つの係数をゼロ以外にしてください。",
    viewerHelp: "ドラッグ：回転 · ホイール：拡大縮小",
    displayDetails: "表示について",
    detailPhase: "色相は複素波動関数の位相、点の配置と明るさは確率密度を表します。単一の主量子数だけを含む混成軌道では密度は静止し、共通位相だけが時間発展します。",
    detailHybrid: "\\(sp\\)、\\(sp^2\\)、\\(sp^3\\) プリセットでは、複素 \\(Y_\\ell^m\\) 基底上で \\(n=2\\) の \\(2s\\) と方向をもつ \\(2p\\) 軌道を構成します。異なる主量子数を含む状態では相対位相が変化するため、干渉模様も時間発展します。",
    amplitude: "振幅",
    relativePhase: "位相 °",
    removeComponent: "この成分を削除",
  },
};
const t = (key, values = {}) => Object.entries(values).reduce(
  (message, [name, value]) => message.replaceAll(`{${name}}`, value),
  MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key,
);
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
    window.MathJax.typesetPromise(targets).then(() => {
      window.dispatchEvent(new Event("physics-atlas:mathjax-ready"));
    });
  });
}

window.addEventListener("physics-atlas:mathjax-ready", flushMath);

function localizeStaticContent() {
  document.documentElement.lang = LOCALE;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerHTML = t(element.dataset.i18n);
  });
  const aria = LOCALE === "ja" ? {
    ".preset-panel": "状態プリセット",
    ".controls": "状態と表示の設定",
    "#component-list": "波動関数の成分",
    "#time-slider": "原子単位の時刻",
    "#speed-slider": "再生速度",
    ".phase-legend": "複素位相の色相環",
    "#radial-chart": "時間依存する動径確率分布",
    ".viewer-card": "時間発展する波動関数の三次元表示",
    "#orbital-canvas": "水素原子の波動関数の点群",
  } : {};
  Object.entries(aria).forEach(([selector, label]) => {
    document.querySelector(selector)?.setAttribute("aria-label", label);
  });
  typeset(document.body);
}

const state = {
  points: [],
  components: [],
  rMax: 1,
  azimuth: -0.65,
  elevation: 0.32,
  zoom: 1,
  dragging: null,
  spinning: false,
  playing: false,
  timeAu: 0,
  animationFrame: null,
  previousTimestamp: null,
  lastChartTimestamp: 0,
  generation: 0,
  seed: 73021,
  regenerateTimer: null,
};

const presets = {
  "1s": [{n: 1, l: 0, m: 0, amplitude: 1, phase: 0}],
  "2pz": [{n: 2, l: 1, m: 0, amplitude: 1, phase: 0}],
  complex2p: [{n: 2, l: 1, m: 1, amplitude: 1, phase: 0}],
  sp: [
    {n: 2, l: 0, m: 0, amplitude: 1, phase: 0},
    {n: 2, l: 1, m: 0, amplitude: 1, phase: 0},
  ],
  sp2: [
    {n: 2, l: 0, m: 0, amplitude: 1, phase: 0},
    {n: 2, l: 1, m: 1, amplitude: 1, phase: 0},
    {n: 2, l: 1, m: -1, amplitude: 1, phase: 180},
  ],
  sp3: [
    {n: 2, l: 0, m: 0, amplitude: 1, phase: 0},
    {n: 2, l: 1, m: 1, amplitude: 1, phase: -45},
    {n: 2, l: 1, m: -1, amplitude: 1, phase: -135},
    {n: 2, l: 1, m: 0, amplitude: 1, phase: 0},
  ],
  beat: [
    {n: 1, l: 0, m: 0, amplitude: 1, phase: 0},
    {n: 2, l: 0, m: 0, amplitude: 1, phase: 0},
  ],
};

function createOptions(minimum, maximum, selected) {
  let options = "";
  for (let value = minimum; value <= maximum; value += 1) {
    options += `<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`;
  }
  return options;
}

function createComponentRow(component = {n: 2, l: 1, m: 1, amplitude: 1, phase: 0}) {
  const row = document.createElement("div");
  row.className = "component-row";
  row.innerHTML = `
    <label><span>\\(n\\)</span><select data-field="n">${createOptions(1, Physics.LIMITS.maxN, component.n)}</select></label>
    <label><span>\\(\\ell\\)</span><select data-field="l">${createOptions(0, component.n - 1, component.l)}</select></label>
    <label><span>\\(m\\)</span><select data-field="m">${createOptions(-component.l, component.l, component.m)}</select></label>
    <label><span>${t("amplitude")}</span><input data-field="amplitude" type="number" min="0" max="10" step="0.2" value="${component.amplitude}"></label>
    <label><span>${t("relativePhase")}</span><input data-field="phase" type="number" min="-360" max="360" step="15" value="${component.phase}"></label>
    <button type="button" class="remove-component" aria-label="${t("removeComponent")}">×</button>`;
  return row;
}

function updateRemoveButtons() {
  const rows = [...byId("component-list").children];
  for (const row of rows) row.querySelector(".remove-component").disabled = rows.length === 1;
  byId("add-component").disabled = rows.length >= Physics.LIMITS.maxComponents;
}

function setComponentRows(components) {
  const list = byId("component-list");
  list.replaceChildren(...components.map(createComponentRow));
  updateRemoveButtons();
  typeset(list);
}

function rawComponents() {
  return [...byId("component-list").children].map(row => ({
    n: Number(row.querySelector('[data-field="n"]').value),
    l: Number(row.querySelector('[data-field="l"]').value),
    m: Number(row.querySelector('[data-field="m"]').value),
    amplitude: Number(row.querySelector('[data-field="amplitude"]').value),
    phase: Number(row.querySelector('[data-field="phase"]').value) * Math.PI / 180,
    basis: "complex",
  }));
}

function resizeCanvas(target, targetContext) {
  const rectangle = target.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(rectangle.width * ratio));
  const height = Math.max(1, Math.round(rectangle.height * ratio));
  if (target.width !== width || target.height !== height) {
    target.width = width;
    target.height = height;
  }
  targetContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  return {width: rectangle.width, height: rectangle.height};
}

function phaseColor(phase, alpha) {
  const hue = ((phase / (2 * Math.PI)) * 360 + 195 + 360) % 360;
  return `hsla(${hue.toFixed(1)} 92% 67% / ${alpha.toFixed(3)})`;
}

function project(point, width, height) {
  const {horizontal, vertical, depth} = Camera.coordinates(
    point,
    state.azimuth,
    state.elevation,
  );
  const perspective = (4 * state.rMax) / Math.max(state.rMax, 4 * state.rMax - depth);
  const scale = Math.min(width, height) * 0.43 * state.zoom / state.rMax;
  return {
    x: width / 2 + horizontal * scale * perspective,
    y: height / 2 - vertical * scale * perspective,
    z: depth,
    perspective,
  };
}

function drawAxes(width, height) {
  const origin = project({x: 0, y: 0, z: 0}, width, height);
  const axes = [
    [{x: state.rMax * .28, y: 0, z: 0}, "x", "#ff806f"],
    [{x: 0, y: state.rMax * .28, z: 0}, "y", "#65df9e"],
    [{x: 0, y: 0, z: state.rMax * .28}, "z", "#68a8ff"],
  ];
  context.save();
  context.lineWidth = 1;
  context.font = "600 11px ui-monospace, monospace";
  for (const [endPoint, label, color] of axes) {
    const end = project(endPoint, width, height);
    context.strokeStyle = color;
    context.globalAlpha = .65;
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.globalAlpha = .9;
    context.fillStyle = color;
    context.fillText(label, end.x + 4, end.y - 3);
  }
  context.restore();
}

function render() {
  const {width, height} = resizeCanvas(canvas, context);
  context.clearRect(0, 0, width, height);
  const gradient = context.createRadialGradient(
    width * .5,
    height * .48,
    0,
    width * .5,
    height * .5,
    Math.max(width, height) * .7,
  );
  gradient.addColorStop(0, "#101d2e");
  gradient.addColorStop(1, "#03070c");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  if (!state.components.length) return;

  const projected = state.points.map(point => {
    const screen = project(point, width, height);
    const psi = Physics.wavefunctionAtSample(point, state.components, state.timeAu);
    return {
      ...screen,
      phase: Math.atan2(psi.im, psi.re),
      weight: Physics.complexAbsSquared(psi) / Math.max(point.proposalDensity, Number.MIN_VALUE),
    };
  });
  projected.sort((left, right) => left.z - right.z);

  context.save();
  context.globalCompositeOperation = "lighter";
  for (const item of projected) {
    const depth = Math.max(0, Math.min(1, .5 + item.z / (2 * state.rMax)));
    const intensity = Math.min(1.9, Math.sqrt(Math.max(0, item.weight)));
    const alpha = Math.min(.72, (.12 + .28 * depth) * intensity);
    if (alpha < .004) continue;
    context.fillStyle = phaseColor(item.phase, alpha);
    context.beginPath();
    context.arc(
      item.x,
      item.y,
      Math.max(.55, 1.05 * item.perspective * (.75 + .25 * intensity)),
      0,
      2 * Math.PI,
    );
    context.fill();
  }
  context.restore();

  const origin = project({x: 0, y: 0, z: 0}, width, height);
  context.fillStyle = "#f4f7fb";
  context.shadowColor = "#ffffff";
  context.shadowBlur = 12;
  context.beginPath();
  context.arc(origin.x, origin.y, 3.2, 0, 2 * Math.PI);
  context.fill();
  context.shadowBlur = 0;
  drawAxes(width, height);
}

function drawRadialDistribution() {
  if (!state.components.length) return;
  const {width, height} = resizeCanvas(radialCanvas, radialContext);
  radialContext.clearRect(0, 0, width, height);
  radialContext.fillStyle = "#09131f";
  radialContext.fillRect(0, 0, width, height);
  const padding = {left: 29, right: 7, top: 8, bottom: 22};
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const sampleCount = 420;
  const probabilities = new Float64Array(sampleCount + 1);
  let maximum = 0;
  for (let index = 0; index <= sampleCount; index += 1) {
    const radius = state.rMax * index / sampleCount;
    const probability = Physics.radialProbability(state.components, radius, state.timeAu);
    probabilities[index] = probability;
    maximum = Math.max(maximum, probability);
  }
  maximum = Math.max(maximum, Number.MIN_VALUE);

  radialContext.beginPath();
  radialContext.moveTo(padding.left, padding.top + plotHeight);
  for (let index = 0; index <= sampleCount; index += 1) {
    const x = padding.left + plotWidth * index / sampleCount;
    const y = padding.top + plotHeight * (1 - probabilities[index] / maximum);
    radialContext.lineTo(x, y);
  }
  radialContext.lineTo(padding.left + plotWidth, padding.top + plotHeight);
  radialContext.closePath();
  const fill = radialContext.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
  fill.addColorStop(0, "rgb(85 215 255 / 65%)");
  fill.addColorStop(1, "rgb(85 215 255 / 5%)");
  radialContext.fillStyle = fill;
  radialContext.fill();
  radialContext.strokeStyle = "#55d7ff";
  radialContext.lineWidth = 1.4;
  radialContext.stroke();
  radialContext.strokeStyle = "#34465d";
  radialContext.lineWidth = 1;
  radialContext.beginPath();
  radialContext.moveTo(padding.left, padding.top);
  radialContext.lineTo(padding.left, padding.top + plotHeight);
  radialContext.lineTo(padding.left + plotWidth, padding.top + plotHeight);
  radialContext.stroke();
  radialContext.fillStyle = "#8495aa";
  radialContext.font = "10px ui-monospace, monospace";
  radialContext.fillText("0", padding.left - 4, height - 6);
  radialContext.textAlign = "right";
  radialContext.fillText(`${state.rMax.toFixed(0)} a₀`, width - padding.right, height - 6);
  radialContext.save();
  radialContext.translate(10, padding.top + plotHeight / 2);
  radialContext.rotate(-Math.PI / 2);
  radialContext.textAlign = "center";
  radialContext.fillText("P(r,t)", 0, 0);
  radialContext.restore();
}

function updateTimeDisplay() {
  byId("time-slider").value = String(state.timeAu);
  byId("time-output").textContent = `${state.timeAu.toFixed(2)} a.u. · ${(state.timeAu * Physics.ATOMIC_TIME_AS).toFixed(1)} as`;
}

function componentLabel(component) {
  const coefficient = component.coefficient;
  const magnitude = Math.hypot(coefficient.re, coefficient.im);
  const phase = Math.atan2(coefficient.im, coefficient.re);
  return `\\(${magnitude.toFixed(2)}e^{i(${phase.toFixed(2)})}\\lvert ${component.n},${component.l},${component.m}\\rangle\\)`;
}

function updateDiagnostics() {
  const meanEnergy = Physics.expectationEnergyHartree(state.components);
  const spread = Physics.energyUncertaintyHartree(state.components);
  const beat = Physics.shortestBeatPeriodAu(state.components);
  byId("normalization").textContent = "1.000000";
  byId("energy").textContent = `${(meanEnergy * Physics.HARTREE_ENERGY_EV).toFixed(4)} eV`;
  byId("energy-spread").textContent = `${(spread * Physics.HARTREE_ENERGY_EV).toFixed(4)} eV`;
  byId("beat-period").textContent = Number.isFinite(beat) ? `${beat.toFixed(2)} a.u.` : t("stationaryDensity");
  const orbitalLabel = byId("orbital-label");
  const terms = [];
  state.components.forEach((component, index) => {
    if (index) {
      const operator = document.createElement("span");
      operator.textContent = "\\(+\\)";
      terms.push(operator);
    }
    const term = document.createElement("span");
    term.textContent = componentLabel(component);
    terms.push(term);
  });
  orbitalLabel.replaceChildren(...terms);
  typeset(orbitalLabel);
}

async function regenerate({newSeed = false} = {}) {
  const generation = ++state.generation;
  const loading = byId("loading");
  loading.hidden = false;
  loading.textContent = t("sampling");
  await new Promise(resolve => requestAnimationFrame(resolve));
  try {
    if (newSeed) state.seed += 104729;
    const sampled = Physics.sampleSuperposition({
      components: rawComponents(),
      count: Number(byId("points-select").value),
      seed: state.seed,
    });
    if (generation !== state.generation) return;
    state.points = sampled.points;
    state.components = sampled.components;
    state.rMax = sampled.rMax;
    updateDiagnostics();
    drawRadialDistribution();
    render();
    loading.hidden = true;
  } catch (error) {
    if (generation !== state.generation) return;
    state.components = [];
    render();
    loading.textContent = t("invalidSettings");
  }
}

function scheduleRegenerate() {
  window.clearTimeout(state.regenerateTimer);
  state.regenerateTimer = window.setTimeout(() => regenerate(), 180);
}

function resetView() {
  state.azimuth = -0.65;
  state.elevation = 0.32;
  state.zoom = 1;
  render();
}

function animationStep(timestamp) {
  const elapsed = state.previousTimestamp === null
    ? 0
    : Math.min(.05, (timestamp - state.previousTimestamp) / 1000);
  state.previousTimestamp = timestamp;
  if (state.playing) {
    const timeMaximum = Number(byId("time-slider").max);
    state.timeAu = (state.timeAu + elapsed * Number(byId("speed-slider").value)) % timeMaximum;
    updateTimeDisplay();
  }
  if (state.spinning) state.azimuth += elapsed * .24;
  render();
  if (timestamp - state.lastChartTimestamp > 90) {
    drawRadialDistribution();
    state.lastChartTimestamp = timestamp;
  }
  if (state.playing || state.spinning) state.animationFrame = requestAnimationFrame(animationStep);
  else {
    state.animationFrame = null;
    state.previousTimestamp = null;
  }
}

function ensureAnimation() {
  if (state.animationFrame === null) state.animationFrame = requestAnimationFrame(animationStep);
}

function setPlaying(playing) {
  state.playing = playing;
  const button = byId("play-toggle");
  button.setAttribute("aria-pressed", String(playing));
  button.textContent = playing ? `❚❚ ${t("pause")}` : `▶ ${t("play")}`;
  if (playing) ensureAnimation();
}

function setSpinning(spinning) {
  state.spinning = spinning;
  const button = byId("spin-toggle");
  button.setAttribute("aria-pressed", String(spinning));
  button.textContent = t(spinning ? "spinOn" : "spinOff");
  if (spinning) ensureAnimation();
}

canvas.addEventListener("pointerdown", event => {
  state.dragging = {pointerId: event.pointerId, x: event.clientX, y: event.clientY};
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", event => {
  if (!state.dragging || state.dragging.pointerId !== event.pointerId) return;
  const dx = event.clientX - state.dragging.x;
  const dy = event.clientY - state.dragging.y;
  state.dragging.x = event.clientX;
  state.dragging.y = event.clientY;
  state.azimuth -= dx * .008;
  state.elevation = Math.max(-1.3, Math.min(1.3, state.elevation + dy * .008));
  render();
});
function finishDrag(event) {
  if (!state.dragging || state.dragging.pointerId !== event.pointerId) return;
  canvas.releasePointerCapture(event.pointerId);
  state.dragging = null;
}
canvas.addEventListener("pointerup", finishDrag);
canvas.addEventListener("pointercancel", finishDrag);
canvas.addEventListener("wheel", event => {
  event.preventDefault();
  state.zoom = Math.max(.45, Math.min(2.8, state.zoom * Math.exp(-event.deltaY * .001)));
  render();
}, {passive: false});

byId("component-list").addEventListener("change", event => {
  const row = event.target.closest(".component-row");
  if (!row) return;
  if (event.target.dataset.field === "n") {
    const n = Number(event.target.value);
    const lSelect = row.querySelector('[data-field="l"]');
    const l = Math.min(Number(lSelect.value), n - 1);
    lSelect.innerHTML = createOptions(0, n - 1, l);
    const mSelect = row.querySelector('[data-field="m"]');
    mSelect.innerHTML = createOptions(-l, l, Math.max(-l, Math.min(Number(mSelect.value), l)));
  } else if (event.target.dataset.field === "l") {
    const l = Number(event.target.value);
    const mSelect = row.querySelector('[data-field="m"]');
    mSelect.innerHTML = createOptions(-l, l, Math.max(-l, Math.min(Number(mSelect.value), l)));
  }
  scheduleRegenerate();
});
byId("component-list").addEventListener("click", event => {
  const button = event.target.closest(".remove-component");
  if (!button || button.disabled) return;
  button.closest(".component-row").remove();
  updateRemoveButtons();
  regenerate();
});
byId("add-component").addEventListener("click", () => {
  const row = createComponentRow();
  byId("component-list").append(row);
  typeset(row);
  updateRemoveButtons();
  regenerate();
});
byId("points-select").addEventListener("change", () => regenerate());
byId("regenerate").addEventListener("click", () => regenerate({newSeed: true}));
byId("reset-view").addEventListener("click", resetView);
byId("spin-toggle").addEventListener("click", () => setSpinning(!state.spinning));
byId("play-toggle").addEventListener("click", () => setPlaying(!state.playing));
byId("reset-time").addEventListener("click", () => {
  state.timeAu = 0;
  updateTimeDisplay();
  render();
  drawRadialDistribution();
});
byId("time-slider").addEventListener("input", event => {
  state.timeAu = Number(event.target.value);
  updateTimeDisplay();
  render();
  drawRadialDistribution();
});
byId("speed-slider").addEventListener("input", event => {
  byId("speed-output").textContent = `${Number(event.target.value).toFixed(2).replace(/0$/, "")} a.u./s`;
});
document.querySelectorAll("[data-preset]").forEach(button => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    setComponentRows(preset);
    state.timeAu = 0;
    updateTimeDisplay();
    regenerate();
  });
});

new ResizeObserver(() => {
  render();
  drawRadialDistribution();
}).observe(canvas.parentElement);

localizeStaticContent();
setComponentRows(presets.complex2p);
updateTimeDisplay();
regenerate();
