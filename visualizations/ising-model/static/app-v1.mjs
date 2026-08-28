import {IsingWorkerProvider} from "./runtime/ising-worker-provider-v1.mjs";

const DATA = JSON.parse(document.getElementById("application-data").textContent);
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const byId = id => document.getElementById(id);
const MESSAGES = {
  en: {
    title: "Ising Model Phase Transition",
    running: "Running", paused: "Paused", loading: "Starting…", error: "Calculation error",
    pause: "Pause", resume: "Resume", randomize: "Randomize", align: "Align",
    dimension: "Dimension", latticeSize: "Linear size", temperature: "Temperature \\(T/J\\)",
    batch: "Work per update", displayRate: "Display rate", seed: "Seed", slice: "Displayed z slice",
    recentHistory: "Recent history", magnetization: "Magnetization",
    energy: "Energy", acceptance: "Acceptance", latestSweep: "latest sweep",
    thermoTitle: "Functions of temperature", spinColors: "Spin colors",
    modelNote: "Zero field, \\(J=k_B=1\\), periodic boundaries, random-sequential single-spin-flip Metropolis updates.",
    howToRead: "How to read the simulation",
    instantaneous: "The lattice and metric cards show one instantaneous finite-system state, not a thermal average. Reliable estimates require equilibration, sampling, and uncertainty analysis.",
    criticalSlowing: "Near a critical point, local Metropolis updates decorrelate slowly. Consecutive samples are autocorrelated, so a high sweep count is not the same as many independent samples.",
    threeDimensional: "In 3D the canvas shows one selectable slice, while magnetization and energy use every spin in the cubic lattice.",
    lattice1: "1D periodic chain", lattice2: "2D periodic square lattice", lattice3: "3D periodic cubic lattice",
    note1: "The horizontal strip is the complete periodic chain; its left and right ends are neighbors.",
    note2: "Nearest-neighbor pixels are rendered without interpolation. Opposite edges are identified.",
    note3: "A 2D cross-section is shown to bound rendering cost; observables use the complete 3D lattice.",
    noFiniteTransition: "No finite-temperature transition", exactTransition: "exact transition", numericalTransition: "numerical transition",
    thermoDescription1: "The infinite 1D chain is analytic and has no ordered phase at any positive temperature.",
    thermoDescription2: "The infinite square lattice has an exact zero-field solution and a continuous transition.",
    thermoDescription3: "The cubic lattice has a finite-temperature transition, but no closed-form thermodynamic solution is known.",
    thermoLimit1: "Curves are exact in the thermodynamic limit. The plotted heat capacity is evaluated directly from the exact formula.",
    thermoLimit2: "Magnetization and energy are exact thermodynamic-limit curves. Heat capacity is a finite-difference derivative of the exact energy, so the logarithmic singularity appears as a resolution-dependent finite peak.",
    thermoLimit3: "The marker uses the accepted numerical estimate \\(T_c/J\\approx4.511524\\). No exact curve is drawn; the live cards remain instantaneous finite-run values.",
    noExact3d: "No exact 3D thermodynamic curve is available. Use the live simulation to study finite runs without treating them as exact equilibrium averages.",
    latticeAria1: "Spin configuration of a periodic one-dimensional Ising chain",
    latticeAria2: "Spin configuration of a periodic two-dimensional Ising lattice",
    latticeAria3: "Selected slice of a periodic three-dimensional Ising lattice",
    historyAria: "Recent absolute magnetization and energy per dimension",
    thermoAria: "Exact thermodynamic functions versus temperature",
    dimension1: "1D chain", dimension2: "2D square", dimension3: "3D cubic",
  },
  ja: {
    title: "Ising模型の相転移",
    running: "計算中", paused: "一時停止中", loading: "起動中…", error: "計算エラー",
    pause: "一時停止", resume: "再開", randomize: "ランダム化", align: "整列",
    dimension: "次元", latticeSize: "一辺の格子点数", temperature: "温度 \\(T/J\\)",
    batch: "更新1回あたりの計算量", displayRate: "表示更新頻度", seed: "シード", slice: "表示する \\(z\\) 断面",
    recentHistory: "直近の時間変化", magnetization: "磁化",
    energy: "エネルギー", acceptance: "受理率", latestSweep: "直近のsweep",
    thermoTitle: "温度の関数としての熱力学量", spinColors: "スピンの色",
    modelNote: "外場なし、\\(J=k_B=1\\)、周期境界条件、ランダム逐次一スピン反転Metropolis更新。",
    howToRead: "シミュレーションの読み方",
    instantaneous: "格子と観測量カードが示すのは有限系の瞬間的な1状態であり、熱平均ではありません。信頼できる推定には、平衡化、サンプリング、不確かさの評価が必要です。",
    criticalSlowing: "臨界点近傍では局所Metropolis更新の相関がゆっくりとしか減衰しません。連続する標本には自己相関があるため、sweep数が多くても独立標本が多いとは限りません。",
    threeDimensional: "3Dでは選択した1断面をCanvasに表示しますが、磁化とエネルギーは立方格子の全スピンから計算します。",
    lattice1: "1D周期鎖", lattice2: "2D周期正方格子", lattice3: "3D周期立方格子",
    note1: "横長の帯が周期鎖全体です。左端と右端は隣接します。",
    note2: "最近接スピンを補間せずピクセル表示します。向かい合う辺は同一視されます。",
    note3: "描画負荷を抑えるため2D断面を表示します。観測量は3D格子全体から計算します。",
    noFiniteTransition: "有限温度の相転移なし", exactTransition: "厳密な相転移点", numericalTransition: "数値的な相転移点",
    thermoDescription1: "無限1D鎖には解析解があり、正の温度では秩序相をもちません。",
    thermoDescription2: "無限正方格子には外場ゼロの厳密解があり、連続相転移を示します。",
    thermoDescription3: "立方格子には有限温度の相転移がありますが、閉じた形の熱力学的厳密解は知られていません。",
    thermoLimit1: "曲線は熱力学極限で厳密です。表示した熱容量は厳密式から直接評価しています。",
    thermoLimit2: "磁化とエネルギーは熱力学極限の厳密曲線です。熱容量は厳密なエネルギーの有限差分微分なので、対数特異性は解像度に依存する有限のピークとして現れます。",
    thermoLimit3: "マーカーには数値的に得られた \\(T_c/J\\approx4.511524\\) を用います。厳密曲線は描かず、ライブ表示は有限時間の瞬間値のままです。",
    noExact3d: "3Dの厳密な熱力学曲線はありません。ライブ計算は有限時間の挙動を調べるためのもので、厳密な平衡平均とはみなしません。",
    latticeAria1: "周期境界をもつ1次元Ising鎖のスピン配置",
    latticeAria2: "周期境界をもつ2次元Ising格子のスピン配置",
    latticeAria3: "周期境界をもつ3次元Ising格子の選択断面",
    historyAria: "絶対磁化と次元あたりエネルギーの直近の時間変化",
    thermoAria: "温度に対する厳密な熱力学関数",
    dimension1: "1D鎖", dimension2: "2D正方格子", dimension3: "3D立方格子",
  },
};
const t = key => MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key;

const elements = {
  dimension: byId("dimension"), size: byId("lattice-size"), temperature: byId("temperature"),
  temperatureValue: byId("temperature-value"), batch: byId("batch"), displayRate: byId("display-rate"),
  seed: byId("seed"), pause: byId("pause-button"), random: byId("random-button"), align: byId("align-button"),
  critical: byId("critical-button"), criticalAbove: byId("critical-above-button"), transitionNote: byId("transition-note"),
  statusChip: byId("status-chip"), statusText: byId("status-text"), latticeHeading: byId("lattice-heading"),
  latticeCard: document.querySelector(".lattice-card"), latticeNote: byId("lattice-note"), lattice: byId("lattice-canvas"),
  history: byId("history-canvas"), thermo: byId("thermo-canvas"), thermoEmpty: byId("thermo-empty"),
  thermoDescription: byId("thermo-description"), thermoFormula: byId("thermo-formula"), thermoLimitation: byId("thermo-limitation"),
  sliceControl: byId("slice-control"), slice: byId("slice"), sliceValue: byId("slice-value"),
  spinLegend: document.querySelector(".spin-legend"), sweeps: byId("sweep-count"),
  magnetization: byId("magnetization"), energy: byId("energy"), acceptance: byId("acceptance"),
};

const SIZES = DATA.limits.sizes;
const HISTORY_LIMIT = DATA.limits.historyLength;
let provider;
let generationId = 0;
let requestId = 0;
let running = true;
let current = null;
let history = [];
let latticeBuffer = document.createElement("canvas");

function typeset(target) {
  const startup = window.MathJax?.startup?.promise;
  if (!startup) return;
  startup.then(() => {
    window.MathJax.typesetClear([target]);
    return window.MathJax.typesetPromise([target]);
  }).then(() => window.dispatchEvent(new Event("physics-atlas:mathjax-ready")));
}

function localize() {
  document.documentElement.lang = LOCALE;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerHTML = t(element.dataset.i18n);
  });
  [...elements.dimension.options].forEach((option, index) => { option.textContent = t(`dimension${index + 1}`); });
  elements.lattice.setAttribute("aria-label", t("latticeAria2"));
  elements.spinLegend.setAttribute("aria-label", t("spinColors"));
  elements.history.setAttribute("aria-label", t("historyAria"));
  elements.thermo.setAttribute("aria-label", t("thermoAria"));
  document.querySelector(".controls").setAttribute("aria-label", LOCALE === "ja" ? "シミュレーション設定" : "Simulation settings");
  document.querySelector(".metrics").setAttribute("aria-label", LOCALE === "ja" ? "現在の観測量" : "Current observables");
  typeset(document.body);
}

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  return {width, height, ratio};
}

function drawLattice() {
  if (!current) return;
  const {snapshot, spins} = current;
  const dimension = snapshot.dimension;
  const size = snapshot.shape[0];
  const sourceWidth = dimension === 1 ? size : size;
  const sourceHeight = dimension === 1 ? 1 : size;
  latticeBuffer.width = sourceWidth;
  latticeBuffer.height = sourceHeight;
  const bufferContext = latticeBuffer.getContext("2d", {alpha: false});
  const image = bufferContext.createImageData(sourceWidth, sourceHeight);
  const slice = Number(elements.slice.value);
  for (let pixel = 0; pixel < sourceWidth * sourceHeight; pixel += 1) {
    const spinIndex = dimension === 3 ? pixel + size * size * slice : pixel;
    const offset = pixel * 4;
    const up = spins[spinIndex] > 0;
    image.data[offset] = up ? 114 : 196;
    image.data[offset + 1] = up ? 181 : 203;
    image.data[offset + 2] = up ? 138 : 199;
    image.data[offset + 3] = 255;
  }
  bufferContext.putImageData(image, 0, 0);
  const {width, height} = fitCanvas(elements.lattice);
  const context = elements.lattice.getContext("2d", {alpha: false});
  context.imageSmoothingEnabled = false;
  context.drawImage(latticeBuffer, 0, 0, width, height);
}

function drawHistory() {
  const {width, height, ratio} = fitCanvas(elements.history);
  const context = elements.history.getContext("2d");
  context.clearRect(0, 0, width, height);
  const pad = {left: 38 * ratio, right: 14 * ratio, top: 14 * ratio, bottom: 25 * ratio};
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  context.font = `${10 * ratio}px ui-monospace, monospace`;
  context.lineWidth = ratio;
  for (let step = 0; step <= 4; step += 1) {
    const y = pad.top + innerHeight * step / 4;
    context.strokeStyle = "rgba(75,100,85,.14)";
    context.beginPath(); context.moveTo(pad.left, y); context.lineTo(width - pad.right, y); context.stroke();
    context.fillStyle = "#6c7d73"; context.textAlign = "right"; context.textBaseline = "middle";
    context.fillText((1 - step / 4).toFixed(2), pad.left - 6 * ratio, y);
  }
  context.fillStyle = "#6c7d73"; context.textAlign = "left"; context.fillText("past", pad.left, height - 9 * ratio);
  context.textAlign = "right"; context.fillText("now", width - pad.right, height - 9 * ratio);
  const x = index => pad.left + innerWidth * index / Math.max(HISTORY_LIMIT - 1, 1);
  function line(getValue, color) {
    if (history.length < 2) return;
    context.beginPath();
    history.forEach((point, index) => {
      const y = pad.top + (1 - getValue(point)) * innerHeight;
      if (index === 0) context.moveTo(x(index), y); else context.lineTo(x(index), y);
    });
    context.strokeStyle = color; context.lineWidth = 2 * ratio; context.lineJoin = "round"; context.stroke();
  }
  line(point => Math.abs(point.magnetization), "#2f7eb5");
  line(point => -point.energyPerSpin / point.dimension, "#d1783f");
}

function drawThermodynamics() {
  const dimension = Number(elements.dimension.value);
  const curve = DATA.thermodynamics[String(dimension)];
  elements.thermo.hidden = !curve;
  elements.thermoEmpty.hidden = Boolean(curve);
  if (!curve) { elements.thermoEmpty.textContent = t("noExact3d"); return; }
  const {width, height, ratio} = fitCanvas(elements.thermo);
  const context = elements.thermo.getContext("2d");
  context.clearRect(0, 0, width, height);
  const left = 42 * ratio, right = 15 * ratio, top = 10 * ratio, bottom = 28 * ratio;
  const gap = 13 * ratio;
  const panelHeight = (height - top - bottom - gap * 2) / 3;
  const innerWidth = width - left - right;
  const temperatureToX = temperature => left + innerWidth * (temperature - .5) / 5.5;
  const panels = [
    {label: "|m|", values: curve.magnetization, minimum: 0, maximum: 1, color: "#2f7eb5"},
    {label: "e", values: curve.energy, minimum: -dimension, maximum: 0, color: "#d1783f"},
    {label: "c", values: curve.heat_capacity, minimum: 0, maximum: Math.max(1, ...curve.heat_capacity.filter(Number.isFinite)), color: "#8a63b8"},
  ];
  context.font = `${10 * ratio}px ui-monospace, monospace`; context.lineWidth = ratio;
  panels.forEach((panel, panelIndex) => {
    const panelTop = top + panelIndex * (panelHeight + gap);
    context.fillStyle = "#6c7d73"; context.textAlign = "right"; context.textBaseline = "top";
    context.fillText(panel.label, left - 8 * ratio, panelTop);
    context.strokeStyle = "rgba(75,100,85,.14)"; context.strokeRect(left, panelTop, innerWidth, panelHeight);
    context.beginPath();
    panel.values.forEach((value, index) => {
      const clipped = Math.max(panel.minimum, Math.min(panel.maximum, value));
      const x = temperatureToX(curve.temperature[index]);
      const y = panelTop + panelHeight * (1 - (clipped - panel.minimum) / (panel.maximum - panel.minimum));
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.strokeStyle = panel.color; context.lineWidth = 1.8 * ratio; context.stroke();
  });
  const markerX = temperatureToX(Number(elements.temperature.value));
  context.strokeStyle = "rgba(55,75,63,.55)"; context.setLineDash([4 * ratio, 4 * ratio]);
  context.beginPath(); context.moveTo(markerX, top); context.lineTo(markerX, height - bottom); context.stroke(); context.setLineDash([]);
  const critical = DATA.criticalTemperatures[String(dimension)];
  if (critical) {
    const criticalX = temperatureToX(critical);
    context.strokeStyle = "rgba(56,116,81,.58)"; context.beginPath(); context.moveTo(criticalX, top); context.lineTo(criticalX, height - bottom); context.stroke();
    context.fillStyle = "#387451"; context.textAlign = "center"; context.textBaseline = "bottom"; context.fillText("Tc", criticalX, height - 2 * ratio);
  }
  context.fillStyle = "#6c7d73"; context.textAlign = "left"; context.textBaseline = "bottom"; context.fillText("0.5", left, height - 2 * ratio);
  context.textAlign = "right"; context.fillText("6.0  T/J", width - right, height - 2 * ratio);
}

function updateDimensionCopy() {
  const dimension = Number(elements.dimension.value);
  elements.latticeCard.dataset.dimension = String(dimension);
  elements.latticeHeading.textContent = t(`lattice${dimension}`);
  elements.latticeNote.textContent = t(`note${dimension}`);
  elements.lattice.setAttribute("aria-label", t(`latticeAria${dimension}`));
  const critical = DATA.criticalTemperatures[String(dimension)];
  elements.critical.disabled = !critical;
  elements.criticalAbove.disabled = !critical;
  elements.transitionNote.textContent = critical ? `${critical.toFixed(6)} · ${t(dimension === 2 ? "exactTransition" : "numericalTransition")}` : t("noFiniteTransition");
  elements.thermoDescription.textContent = t(`thermoDescription${dimension}`);
  elements.thermoLimitation.innerHTML = t(`thermoLimit${dimension}`);
  const formulas = {
    1: [
      "\\(f(T)=-T\\log[2\\cosh(1/T)]\\)",
      "\\(e(T)=-\\tanh(1/T)\\)",
      "\\(c(T)=\\operatorname{sech}^2(1/T)/T^2\\)",
    ],
    2: [
      "\\(m(T)=[1-\\sinh^{-4}(2/T)]^{1/8}\\; (T<T_c)\\)",
      "\\(m(T)=0\\; (T\\ge T_c)\\)",
      "\\(\\kappa=2\\sinh(2/T)/\\cosh^2(2/T)\\)",
      "\\(e(T)=-\\coth(2/T)\\)",
      "\\(\\times[1+\\frac{2}{\\pi}(2\\tanh^2(2/T)-1)K(\\kappa)]\\)",
      "\\(T_c=2/\\log(1+\\sqrt2)\\)",
    ],
    3: [
      "\\(T_c/J\\approx4.511524\\)",
      `${LOCALE === "ja" ? "閉じた形の" : "No closed-form"} \\(f(T)\\), \\(e(T)\\), ${LOCALE === "ja" ? "または" : "or"} \\(c(T)\\) ${LOCALE === "ja" ? "は知られていません。" : "is known."}`,
    ],
  };
  elements.thermoFormula.replaceChildren(...formulas[dimension].map(formula => {
    const paragraph = document.createElement("p");
    paragraph.textContent = formula;
    return paragraph;
  }));
  typeset(elements.thermoFormula);
  typeset(elements.thermoLimitation);
  drawThermodynamics();
}

function populateSizes() {
  const dimension = Number(elements.dimension.value);
  const previous = Number(elements.size.value);
  elements.size.replaceChildren(...SIZES[String(dimension)].map(size => {
    const option = document.createElement("option"); option.value = String(size); option.textContent = dimension === 1 ? String(size) : `${size} × ${size}${dimension === 3 ? ` × ${size}` : ""}`; return option;
  }));
  const preferred = SIZES[String(dimension)].includes(previous) ? previous : SIZES[String(dimension)][1];
  elements.size.value = String(preferred);
}

function updateMetrics(snapshot) {
  elements.sweeps.textContent = snapshot.sweeps.toLocaleString(LOCALE === "ja" ? "ja-JP" : "en-US");
  elements.magnetization.textContent = snapshot.magnetization.toFixed(3);
  elements.energy.textContent = snapshot.energyPerSpin.toFixed(3);
  elements.acceptance.textContent = `${(snapshot.acceptanceRate * 100).toFixed(1)}%`;
}

function setStatus(kind) {
  elements.statusChip.classList.toggle("paused", kind === "paused");
  elements.statusChip.classList.toggle("error", kind === "error");
  elements.statusText.textContent = t(kind);
  elements.pause.textContent = running ? t("pause") : t("resume");
}

function makeRequest(operation, input, generation = generationId) {
  requestId += 1;
  return {protocol: DATA.protocol, kernelVersion: DATA.kernelVersion, operation, requestId, generationId: generation, input};
}

function install(response, expectedGeneration) {
  if (response.generationId !== generationId || expectedGeneration !== generationId) return false;
  current = response;
  history.push({...response.snapshot, dimension: response.snapshot.dimension});
  if (history.length > HISTORY_LIMIT) history.shift();
  updateMetrics(response.snapshot); drawLattice(); drawHistory();
  return true;
}

async function resetSimulation(initialState, operation = "ising.reset.v1") {
  generationId += 1;
  const expectedGeneration = generationId;
  history = [];
  current = null;
  setStatus("loading");
  const dimension = Number(elements.dimension.value);
  const size = Number(elements.size.value);
  elements.slice.max = String(size - 1); elements.slice.value = String(Math.floor(size / 2)); elements.sliceValue.value = elements.slice.value;
  elements.sliceControl.hidden = dimension !== 3;
  try {
    const response = await provider.compute(makeRequest(operation, {
      dimension, size, temperature: Number(elements.temperature.value), seed: Number(elements.seed.value) >>> 0, initialState,
    }, expectedGeneration));
    if (!install(response, expectedGeneration)) return;
    setStatus(running ? "running" : "paused");
    if (running) scheduleAdvance(expectedGeneration);
  } catch (_error) {
    if (expectedGeneration === generationId) { running = false; setStatus("error"); }
  }
}

function scheduleAdvance(expectedGeneration) {
  if (!running || expectedGeneration !== generationId) return;
  const delay = 1000 / Number(elements.displayRate.value);
  window.setTimeout(() => advance(expectedGeneration), delay);
}

async function advance(expectedGeneration) {
  if (!running || expectedGeneration !== generationId) return;
  try {
    const response = await provider.compute(makeRequest("ising.advance.v1", {sweeps: Number(elements.batch.value)}, expectedGeneration));
    if (install(response, expectedGeneration)) scheduleAdvance(expectedGeneration);
  } catch (_error) {
    if (expectedGeneration === generationId) { running = false; setStatus("error"); }
  }
}

async function configureTemperature() {
  const expectedGeneration = generationId;
  try {
    const response = await provider.compute(makeRequest("ising.configure.v1", {temperature: Number(elements.temperature.value)}, expectedGeneration));
    install(response, expectedGeneration);
  } catch (_error) {
    if (expectedGeneration === generationId) { running = false; setStatus("error"); }
  }
}

elements.temperature.addEventListener("input", () => { elements.temperatureValue.value = Number(elements.temperature.value).toFixed(2); drawThermodynamics(); });
elements.temperature.addEventListener("change", configureTemperature);
elements.critical.addEventListener("click", () => {
  elements.temperature.value = DATA.criticalTemperatures[elements.dimension.value].toFixed(2);
  elements.temperature.dispatchEvent(new Event("input")); configureTemperature();
});
elements.criticalAbove.addEventListener("click", () => {
  elements.temperature.value = (DATA.criticalTemperatures[elements.dimension.value] * (1 + DATA.criticalAboveFraction)).toFixed(2);
  elements.temperature.dispatchEvent(new Event("input")); configureTemperature();
});
elements.dimension.addEventListener("change", () => { populateSizes(); updateDimensionCopy(); resetSimulation("random"); });
elements.size.addEventListener("change", () => resetSimulation("random"));
elements.random.addEventListener("click", () => resetSimulation("random"));
elements.align.addEventListener("click", () => resetSimulation("aligned-up"));
elements.pause.addEventListener("click", () => {
  running = !running; setStatus(running ? "running" : "paused"); if (running) scheduleAdvance(generationId);
});
elements.slice.addEventListener("input", () => { elements.sliceValue.value = elements.slice.value; drawLattice(); });
window.addEventListener("resize", () => { drawLattice(); drawHistory(); drawThermodynamics(); });
window.addEventListener("pagehide", () => provider?.dispose(), {once: true});

localize();
populateSizes();
updateDimensionCopy();
provider = new IsingWorkerProvider({protocol: DATA.protocol, kernelVersion: DATA.kernelVersion, snapshotSchema: DATA.snapshotSchema});
resetSimulation("random", "ising.initialize.v1");
