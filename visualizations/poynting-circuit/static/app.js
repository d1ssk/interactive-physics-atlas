"use strict";

const Physics = window.PoyntingCircuitPhysics;
const byId = id => document.getElementById(id);
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const TRANSLATIONS = {
  en: {
    title: "Electromagnetic energy flow",
    pageTitle: "Electromagnetic Energy Flow Around a Circuit",
    intro: "Adjust the circuit and inspect the local fields around it.",
    fieldViewerLabel: "Electromagnetic field around the circuit",
    settingsLabel: "Simulation settings",
    sourceModeLabel: "Source mode",
    weak: "Weak",
    strong: "Strong",
    dragHint: "Drag the white handles, source, and loads to reshape the circuit",
    dc: "DC",
    ac: "AC",
    voltage: "Voltage",
    current: "Current",
    seriesLoads: "Series loads",
    addLoad: "+ Add load",
    maximumLoads: "Maximum: 2",
    frequency: "Frequency",
    phase: "Phase",
    rotatingVectors: "Rotating vectors",
    vectorScale: "Lengths of V and I are normalized separately",
    phasorLabel: "Rotating voltage and current vectors",
    voltageVector: "Voltage V",
    currentVector: "Current I",
    fieldDisplay: "Field display",
    resetGeometry: "Reset shape",
    recompute: "Recompute fields",
    computing: "Computing…",
    symbolsArrows: "Symbols and arrows",
    poyntingVector: "Poynting vector",
    electricField: "Electric field",
    magneticField: "Magnetic field (out of plane)",
    background: "Background",
    poyntingMagnitude: "Poynting-vector magnitude",
    potential: "Potential",
    energyDensity: "Electromagnetic energy density",
    none: "None",
    currentArrows: "Current arrows in wires",
    currentArrowsNote: "Instantaneous direction of positive current",
    flowingParticles: "Flowing particles",
    flowingParticlesNote: "Markers that make streamlines easier to follow",
    wirePolarity: "Wire-potential polarity",
    wirePolarityNote: "A guide, not surface-charge density",
    terminalValues: "Terminal values",
    instantaneousPower: "Instantaneous power",
    cycleAverage: "Cycle average",
    currentPhaseOffset: "Current phase offset",
    fieldAudit: "Local direction of field flux and element power",
    fieldAuditNote: "Checked from the sign of two-dimensional flux around each load; this is not an absolute power measurement.",
    solvingBasis: "Computing field basis…",
    solvedBasis: "Complex quasistatic field · {basis} basis · {iterations} iterations",
    resonanceStatus: "Ideal series resonance · field undefined",
    resonanceTitle: "Ideal series resonance",
    resonanceNote: "With zero internal resistance the current diverges, so the field is undefined.",
    geometryChanged: "Geometry changed · recomputation required",
    staleTitle: "Fields need to be recomputed",
    staleNote: "Finish adjusting the geometry, then use Recompute fields.",
    awaiting: "Awaiting calculation",
    steadyMode: "DC · steady",
    instantaneousMode: "AC · instantaneous",
    zeroInstant: "Instantaneously zero",
    loadToSource: "Load → source",
    sourceToLoad: "Source → load",
    notComputed: "Not computed",
    nearZero: "Nearly zero",
    inward: "Inward",
    outward: "Outward",
    zeroCrossing: "At a zero crossing",
    directionsAgree: "{matches}/{total} directions agree",
    dcPowerNote: "Even in steady state, the product of the electric and magnetic fields carries energy to the load.",
    resistorPowerNote: "Voltage and current reverse together, so energy flow toward a resistor does not reverse.",
    returningPowerNote: "Energy returned by L/C exceeds resistor dissipation at this phase, and the remainder returns to the source. Instantaneous resistor power stays nonnegative.",
    reactivePowerNote: "The net flow into the loads is superposed with energy stored temporarily in, and returned from, the electric or magnetic field.",
    resistor: "Resistor R",
    inductor: "Inductor L",
    capacitor: "Capacitor C",
    resistance: "Resistance",
    inductance: "Inductance",
    capacitance: "Capacitance",
    loadTypeLabel: "Type of load {number}",
    removeLoadLabel: "Remove load {number}",
    remove: "Remove",
    dissipation: "Power dissipation",
    averageLoss: "Average loss",
    elementPower: "Instantaneous element power",
    localFlux: "Local Poynting flux",
    pause: "Pause",
    play: "Play",
  },
  ja: {
    title: "電磁エネルギーの流れ",
    pageTitle: "回路周囲の電磁エネルギー流",
    intro: "回路を調整し、周囲の局所的な場を観察します。",
    fieldViewerLabel: "回路周囲の電磁場",
    settingsLabel: "シミュレーション設定",
    sourceModeLabel: "電源モード",
    weak: "弱い",
    strong: "強い",
    dragHint: "白いハンドルと電源・負荷をドラッグして回路を変形",
    dc: "直流",
    ac: "交流",
    voltage: "電圧",
    current: "電流",
    seriesLoads: "直列負荷",
    addLoad: "+ 負荷を追加",
    maximumLoads: "最大2個",
    frequency: "周波数",
    phase: "位相",
    rotatingVectors: "回転ベクトル",
    vectorScale: "V と I の長さは個別に正規化",
    phasorLabel: "電圧と電流の回転ベクトル",
    voltageVector: "電圧 V",
    currentVector: "電流 I",
    fieldDisplay: "場の表示",
    resetGeometry: "形を戻す",
    recompute: "場を再計算",
    computing: "計算中…",
    symbolsArrows: "記号・矢印",
    poyntingVector: "ポインティングベクトル",
    electricField: "電場",
    magneticField: "磁場（面外方向）",
    background: "背景",
    poyntingMagnitude: "ポインティングベクトルの大きさ",
    potential: "電位",
    energyDensity: "電磁場のエネルギー密度",
    none: "表示しない",
    currentArrows: "導線中の電流矢印",
    currentArrowsNote: "正の電流の瞬時方向",
    flowingParticles: "流れる粒子",
    flowingParticlesNote: "流線を読みやすくする目印",
    wirePolarity: "導線電位の極性",
    wirePolarityNote: "表面電荷密度ではない補助表示",
    terminalValues: "端子量",
    instantaneousPower: "瞬時電力",
    cycleAverage: "周期平均",
    currentPhaseOffset: "電流の位相差",
    fieldAudit: "場の流束と素子電力の局所方向",
    fieldAuditNote: "各負荷を囲む2次元流束の符号で検査します。絶対的な電力値ではありません。",
    solvingBasis: "基底場を計算中…",
    solvedBasis: "複素準静的場 · 基底 {basis} 個 · 反復 {iterations} 回",
    resonanceStatus: "理想直列共振 · 場を定義できません",
    resonanceTitle: "理想直列共振です",
    resonanceNote: "内部抵抗0では電流が発散するため、場を定義できません。",
    geometryChanged: "配置が変更されました · 再計算が必要です",
    staleTitle: "場の再計算が必要です",
    staleNote: "配置を確定し、「場を再計算」を押してください。",
    awaiting: "計算待ち",
    steadyMode: "DC · 定常",
    instantaneousMode: "AC · 瞬時値",
    zeroInstant: "瞬間的にゼロ",
    loadToSource: "負荷 → 電源",
    sourceToLoad: "電源 → 負荷",
    notComputed: "未計算",
    nearZero: "ほぼ0",
    inward: "流入",
    outward: "流出",
    zeroCrossing: "ゼロ交差中",
    directionsAgree: "{matches}/{total} 方向一致",
    dcPowerNote: "定常状態でも、電場と磁場の積は負荷へエネルギーを運び続けます。",
    resistorPowerNote: "電圧と電流は同時に反転するため、抵抗へ向かうエネルギー流の向きは変わりません。",
    returningPowerNote: "L/Cから戻るエネルギーが抵抗での消費を上回り、残りが電源へ戻る位相です。抵抗の瞬時電力は常に非負です。",
    reactivePowerNote: "負荷への正味の流れに、電場または磁場へ蓄えて再び戻る流れが重なります。",
    resistor: "抵抗 R",
    inductor: "インダクタ L",
    capacitor: "キャパシタ C",
    resistance: "抵抗値",
    inductance: "インダクタンス",
    capacitance: "静電容量",
    loadTypeLabel: "負荷 {number} の種類",
    removeLoadLabel: "負荷 {number} を削除",
    remove: "削除",
    dissipation: "消費電力",
    averageLoss: "平均損失",
    elementPower: "瞬時素子電力",
    localFlux: "局所ポインティング流束",
    pause: "一時停止",
    play: "再生",
  },
};

function t(key, replacements = {}) {
  let value = TRANSLATIONS[LOCALE][key] ?? TRANSLATIONS.en[key] ?? key;
  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.replace(`{${name}}`, String(replacement));
  }
  return value;
}

function applyLocale() {
  document.documentElement.lang = LOCALE;
  document.title = t("pageTitle");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }
}
const canvas = byId("field-canvas");
const context = canvas.getContext("2d");
const phasorCanvas = byId("phasor-canvas");
const phasorContext = phasorCanvas.getContext("2d");

const state = {
  mode: "dc",
  components: {
    dc: [{type: "r", resistance: 8}],
    ac: [{type: "r", resistance: 8}],
  },
  geometry: Physics.defaultGeometry(),
  fieldBasis: null,
  segments: [],
  magneticHPerAmp: null,
  fieldGrid: null,
  phase: 0,
  running: true,
  dragging: null,
  dragOffset: null,
  geometryDirty: true,
  solving: false,
  lastGeometrySolve: 0,
  lastFrame: performance.now(),
  particles: [],
  pointer: null,
};

function parameters() {
  return {
    mode: state.mode,
    voltage: Number(byId("voltage").value),
    frequency: Number(byId("frequency").value),
    components: state.components[state.mode].map(component => ({...component})),
  };
}

function currentCircuitState() {
  return Physics.circuitState(parameters(), state.phase);
}

function resizeCanvas() {
  const rectangle = canvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const pixelWidth = Math.max(1, Math.round(rectangle.width * ratio));
  const pixelHeight = Math.max(1, Math.round(rectangle.height * ratio));
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return {width: rectangle.width, height: rectangle.height};
}

function percentile(values, fraction) {
  const sorted = [...values].filter(Number.isFinite).sort((left, right) => left - right);
  if (!sorted.length) return 1;
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))] || 1;
}

function recomputeFields() {
  state.solving = true;
  byId("solver-status").textContent = t("solvingBasis");
  byId("recompute-fields").disabled = true;
  state.fieldBasis = Physics.solveFieldBasis(state.geometry, {
    width: 91,
    height: 63,
    iterations: 720,
    tolerance: 7e-6,
  });
  state.segments = Physics.circuitSegments(state.geometry, 68);
  state.geometryDirty = false;
  state.solving = false;
  state.lastGeometrySolve = performance.now();
  composeFieldPhasors();
  byId("recompute-fields").disabled = false;
  byId("recompute-fields").textContent = t("recompute");
  byId("field-stale").hidden = Boolean(state.fieldGrid);
  resetParticles();
}

function composeFieldPhasors() {
  if (!state.fieldBasis || state.geometryDirty) return;
  const circuit = currentCircuitState();
  if (!circuit.valid) {
    state.fieldGrid = null;
    byId("solver-status").textContent = t("resonanceStatus");
    byId("field-stale").hidden = false;
    byId("field-stale-title").textContent = t("resonanceTitle");
    byId("field-stale-note").textContent = t("resonanceNote");
    byId("recompute-fields").textContent = t("recompute");
    return;
  }
  const electric = Physics.combineFieldBasis(
    state.fieldBasis,
    circuit.phasors.nodeVoltages,
  );

  const width = electric.width;
  const height = electric.height;
  const size = width * height;
  const magneticHPerAmp = state.magneticHPerAmp ?? new Float64Array(size);
  const computeMagneticGrid = state.magneticHPerAmp === null;
  const electricMagnitudes = [];
  const magneticMagnitudes = [];
  const poyntingMagnitudes = [];

  for (let row = 0; row < height; row += 1) {
    const y = row / (height - 1);
    for (let column = 0; column < width; column += 1) {
      const x = column / (width - 1);
      const index = row * width + column;
      const hZ = computeMagneticGrid
        ? Physics.magneticFieldZ(x, y, state.segments)
        : magneticHPerAmp[index];
      if (computeMagneticGrid) magneticHPerAmp[index] = hZ;
      if (x > 0.06 && x < 0.94 && y > 0.07 && y < 0.93) {
        const electricMagnitude = Math.hypot(
          electric.electricXReal[index],
          electric.electricXImaginary[index],
          electric.electricYReal[index],
          electric.electricYImaginary[index],
        );
        const magneticMagnitude = Math.abs(hZ)
          * Physics.complexMagnitude(circuit.phasors.current);
        electricMagnitudes.push(electricMagnitude);
        magneticMagnitudes.push(magneticMagnitude);
        poyntingMagnitudes.push(electricMagnitude * magneticMagnitude);
      }
    }
  }
  state.fieldGrid = {
    ...electric,
    width,
    height,
    magneticHPerAmp,
    electricReference: percentile(electricMagnitudes, 0.91),
    magneticReference: percentile(magneticMagnitudes, 0.91),
    poyntingReference: percentile(poyntingMagnitudes, 0.93),
    potentialReference: Math.max(
      parameters().voltage,
      ...circuit.phasors.nodeVoltages.map(Physics.complexMagnitude),
    ),
  };
  state.magneticHPerAmp = magneticHPerAmp;
  byId("solver-status").textContent = t("solvedBasis", {
    basis: state.fieldBasis.independentNodeCount,
    iterations: state.fieldBasis.completedIterations,
  });
  byId("field-stale").hidden = true;
  if (!state.solving) byId("recompute-fields").textContent = t("recompute");
}

function markGeometryDirty() {
  state.geometryDirty = true;
  state.fieldGrid = null;
  state.magneticHPerAmp = null;
  byId("solver-status").textContent = t("geometryChanged");
  byId("recompute-fields").textContent = t("recompute");
  byId("field-stale").hidden = false;
  byId("field-stale-title").textContent = t("staleTitle");
  byId("field-stale-note").textContent = t("staleNote");
  byId("field-audit-status").textContent = t("awaiting");
  byId("field-audit-status").classList.remove("warning");
  updatePlayButton();
}

function requestFieldSolve() {
  if (state.solving) return;
  state.solving = true;
  byId("solver-status").textContent = t("solvingBasis");
  byId("recompute-fields").disabled = true;
  byId("recompute-fields").textContent = t("computing");
  requestAnimationFrame(() => {
    setTimeout(recomputeFields, 0);
  });
}

function sampleGrid(values, x, y) {
  return Physics.bilinearSample(
    values,
    state.fieldGrid.width,
    state.fieldGrid.height,
    x,
    y,
  );
}

function complexGridSample(realValues, imaginaryValues, x, y) {
  return {
    real: sampleGrid(realValues, x, y),
    imaginary: sampleGrid(imaginaryValues, x, y),
  };
}

function fieldAt(x, y, circuit) {
  const grid = state.fieldGrid;
  const phase = state.mode === "dc" ? 0 : state.phase;
  const potential = complexGridSample(
    grid.potentialReal,
    grid.potentialImaginary,
    x,
    y,
  );
  const electricX = complexGridSample(
    grid.electricXReal,
    grid.electricXImaginary,
    x,
    y,
  );
  const electricY = complexGridSample(
    grid.electricYReal,
    grid.electricYImaginary,
    x,
    y,
  );
  const instantaneous = Physics.instantaneousField(
    electricX,
    electricY,
    sampleGrid(grid.magneticHPerAmp, x, y),
    circuit.phasors.current,
    phase,
  );
  return {
    potential: Physics.realAtPhase(potential, phase),
    electricX: instantaneous.electricX,
    electricY: instantaneous.electricY,
    magneticH: instantaneous.magneticH,
    poyntingX: instantaneous.poynting.x,
    poyntingY: instantaneous.poynting.y,
  };
}

function toCanvas(point, dimensions) {
  return {x: point.x * dimensions.width, y: (1 - point.y) * dimensions.height};
}

function fromCanvas(clientX, clientY) {
  const rectangle = canvas.getBoundingClientRect();
  const screenX = (clientX - rectangle.left) / rectangle.width;
  const screenY = (clientY - rectangle.top) / rectangle.height;
  return {
    x: screenX,
    y: 1 - screenY,
  };
}

function mix(left, right, amount) {
  return Math.round(left + (right - left) * amount);
}

function flowColor(normalized, backwards, alpha = 1) {
  const value = Math.max(0, Math.min(1, normalized));
  const low = backwards ? [16, 65, 91] : [14, 72, 67];
  const high = backwards ? [72, 177, 230] : [255, 180, 84];
  return `rgba(${mix(low[0], high[0], value)},${mix(low[1], high[1], value)},${mix(low[2], high[2], value)},${alpha})`;
}

function drawBackground(dimensions, circuit) {
  const layer = byId("background-layer").value;
  context.fillStyle = "#071416";
  context.fillRect(0, 0, dimensions.width, dimensions.height);
  if (layer === "none" || !state.fieldGrid || state.geometryDirty) return;

  const columns = Math.max(44, Math.round(dimensions.width / 14));
  const rows = Math.max(32, Math.round(dimensions.height / 14));
  const cellWidth = dimensions.width / columns + 0.8;
  const cellHeight = dimensions.height / rows + 0.8;
  const epsilon = Physics.CONSTANTS.vacuumPermittivity;
  const mu = Physics.CONSTANTS.vacuumPermeability;
  const energyReference = 0.5 * epsilon
      * state.fieldGrid.electricReference ** 2
    + 0.5 * mu * state.fieldGrid.magneticReference ** 2;

  for (let row = 0; row < rows; row += 1) {
    const y = 1 - (row + 0.5) / rows;
    for (let column = 0; column < columns; column += 1) {
      const x = (column + 0.5) / columns;
      const field = fieldAt(x, y, circuit);
      if (layer === "flow") {
        const magnitude = Math.hypot(field.poyntingX, field.poyntingY);
        const normalized = Math.min(1, magnitude / state.fieldGrid.poyntingReference);
        context.fillStyle = flowColor(normalized, false, 0.04 + 0.36 * normalized);
      } else if (layer === "potential") {
        const centeredPotential = field.potential - 0.5 * circuit.voltage;
        const normalized = Math.max(-1, Math.min(
          1,
          2 * centeredPotential / state.fieldGrid.potentialReference,
        ));
        const strength = Math.abs(normalized);
        const color = normalized >= 0 ? [255, 135, 74] : [55, 147, 201];
        context.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.04 + 0.28 * strength})`;
      } else {
        const electricSquared = field.electricX ** 2 + field.electricY ** 2;
        const energy = 0.5 * epsilon * electricSquared
          + 0.5 * mu * field.magneticH ** 2;
        const normalized = energyReference > 0
          ? Math.min(1, Math.log1p(5 * energy / energyReference) / Math.log(6))
          : 0;
        context.fillStyle = `rgba(${mix(20, 113, normalized)},${mix(53, 230, normalized)},${mix(62, 195, normalized)},${0.04 + 0.3 * normalized})`;
      }
      context.fillRect(column * cellWidth, row * cellHeight, cellWidth, cellHeight);
    }
  }

  const gradient = context.createRadialGradient(
    dimensions.width * 0.5,
    dimensions.height * 0.5,
    0,
    dimensions.width * 0.5,
    dimensions.height * 0.5,
    Math.max(dimensions.width, dimensions.height) * 0.72,
  );
  gradient.addColorStop(0, "rgba(5, 15, 17, 0)");
  gradient.addColorStop(1, "rgba(3, 10, 12, 0.62)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, dimensions.width, dimensions.height);
}

function drawGrid(dimensions) {
  context.save();
  context.strokeStyle = "rgba(147, 211, 201, 0.035)";
  context.lineWidth = 1;
  const spacing = Math.max(36, Math.round(dimensions.width / 18));
  for (let x = spacing; x < dimensions.width; x += spacing) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, dimensions.height);
    context.stroke();
  }
  for (let y = spacing; y < dimensions.height; y += spacing) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(dimensions.width, y);
    context.stroke();
  }
  context.restore();
}

function drawArrow(x, y, vectorX, vectorY, length, color, alpha = 1) {
  const magnitude = Math.hypot(vectorX, vectorY);
  if (magnitude < 1e-12) return;
  const directionX = vectorX / magnitude;
  const directionY = -vectorY / magnitude;
  const halfLength = length * 0.5;
  const startX = x - directionX * halfLength;
  const startY = y - directionY * halfLength;
  const endX = x + directionX * halfLength;
  const endY = y + directionY * halfLength;
  const head = Math.min(6, length * 0.3);
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 1.25;
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.stroke();
  context.beginPath();
  context.moveTo(endX, endY);
  context.lineTo(
    endX - directionX * head - directionY * head * 0.52,
    endY - directionY * head + directionX * head * 0.52,
  );
  context.lineTo(
    endX - directionX * head + directionY * head * 0.52,
    endY - directionY * head - directionX * head * 0.52,
  );
  context.closePath();
  context.fill();
  context.restore();
}

function drawFieldSymbols(dimensions, circuit) {
  const layer = byId("vector-layer").value;
  const columns = Math.max(10, Math.round(dimensions.width / 62));
  const rows = Math.max(7, Math.round(dimensions.height / 62));
  if (!state.fieldGrid || state.geometryDirty) return;
  const temporalFlow = circuit.instantaneousPower;

  for (let row = 1; row < rows; row += 1) {
    const y = row / rows;
    for (let column = 1; column < columns; column += 1) {
      const x = column / columns;
      const field = fieldAt(x, y, circuit);
      const screen = toCanvas({x, y}, dimensions);
      if (layer === "magnetic") {
        const value = field.magneticH;
        const normalized = Math.min(1, Math.abs(field.magneticH)
          / state.fieldGrid.magneticReference);
        if (normalized < 0.04) continue;
        const radius = 2.8 + 3.2 * Math.sqrt(normalized);
        context.save();
        context.globalAlpha = 0.3 + 0.65 * normalized;
        context.strokeStyle = value > 0 ? "#64c8ff" : "#ffc068";
        context.fillStyle = context.strokeStyle;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(screen.x, screen.y, radius, 0, 2 * Math.PI);
        context.stroke();
        if (value > 0) {
          context.beginPath();
          context.arc(screen.x, screen.y, 1.3, 0, 2 * Math.PI);
          context.fill();
        } else {
          context.beginPath();
          context.moveTo(screen.x - 2.3, screen.y - 2.3);
          context.lineTo(screen.x + 2.3, screen.y + 2.3);
          context.moveTo(screen.x + 2.3, screen.y - 2.3);
          context.lineTo(screen.x - 2.3, screen.y + 2.3);
          context.stroke();
        }
        context.restore();
        continue;
      }

      let vectorX;
      let vectorY;
      let normalized;
      let color;
      if (layer === "electric") {
        vectorX = field.electricX;
        vectorY = field.electricY;
        normalized = Math.min(
          1,
          Math.hypot(field.electricX, field.electricY)
            / state.fieldGrid.electricReference,
        );
        color = "#80dfef";
      } else {
        vectorX = field.poyntingX;
        vectorY = field.poyntingY;
        normalized = Math.min(1, Math.hypot(field.poyntingX, field.poyntingY)
          / state.fieldGrid.poyntingReference);
        color = temporalFlow < 0 ? "#6ac6ff" : "#ffd08a";
      }
      if (normalized < 0.035) continue;
      drawArrow(
        screen.x,
        screen.y,
        vectorX,
        vectorY,
        7 + 18 * Math.sqrt(normalized),
        color,
        0.16 + 0.78 * normalized,
      );
    }
  }
}

function drawCubicPath(dimensions, start, control1, control2, end) {
  const screenStart = toCanvas(start, dimensions);
  const screenControl1 = toCanvas(control1, dimensions);
  const screenControl2 = toCanvas(control2, dimensions);
  const screenEnd = toCanvas(end, dimensions);
  context.beginPath();
  context.moveTo(screenStart.x, screenStart.y);
  context.bezierCurveTo(
    screenControl1.x,
    screenControl1.y,
    screenControl2.x,
    screenControl2.y,
    screenEnd.x,
    screenEnd.y,
  );
}

function wirePotentialColor(value, circuit) {
  const centered = value - 0.5 * circuit.voltage;
  const normalized = Math.max(-1, Math.min(1, 2 * centered / parameters().voltage));
  const neutral = [134, 182, 173];
  const endpoint = normalized >= 0 ? [255, 155, 89] : [77, 174, 227];
  const amount = Math.min(1, 0.2 + 0.8 * Math.abs(normalized));
  return `rgb(${mix(neutral[0], endpoint[0], amount)},`
    + `${mix(neutral[1], endpoint[1], amount)},${mix(neutral[2], endpoint[2], amount)})`;
}

function drawCircuit(dimensions, circuit) {
  const geometry = state.geometry;
  const paths = Physics.circuitPaths(geometry);
  const phase = state.mode === "dc" ? 0 : state.phase;
  const nodePotentials = circuit.phasors.nodeVoltages.map(
    value => Physics.realAtPhase(value, phase),
  );
  const topColor = wirePotentialColor(nodePotentials[0], circuit);
  const bottomColor = wirePotentialColor(nodePotentials.at(-1), circuit);
  const wirePaths = [
    [paths.sourceTop, geometry.topControl1, geometry.topControl2, paths.loadTop, topColor],
    [paths.sourceBottom, geometry.bottomControl1, geometry.bottomControl2, paths.loadBottom,
      bottomColor],
  ];
  if (paths.middle.length) {
    wirePaths.push([
      paths.loadElements[0].bottom,
      paths.middleControl1,
      paths.middleControl2,
      paths.loadElements[1].top,
      wirePotentialColor(nodePotentials[1], circuit),
    ]);
  }

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowBlur = 16;
  context.lineWidth = Math.max(11, dimensions.width * 0.012);
  context.strokeStyle = "rgba(2, 7, 8, 0.8)";
  for (const [start, control1, control2, end] of wirePaths) {
    drawCubicPath(dimensions, start, control1, control2, end);
    context.stroke();
  }

  context.lineWidth = Math.max(5, dimensions.width * 0.0055);
  for (const [start, control1, control2, end, color] of wirePaths) {
    context.shadowColor = color;
    context.strokeStyle = color;
    drawCubicPath(dimensions, start, control1, control2, end);
    context.stroke();
  }
  context.restore();

  drawInspectionContour(dimensions, circuit);
  drawSource(dimensions, circuit);
  drawLoad(dimensions, circuit);
  if (byId("show-current").checked) drawCurrentArrows2D(dimensions, circuit, paths);
  if (byId("show-charge").checked) drawSurfaceCharges(dimensions, circuit);
  const handles = ["top1", "top2", "bottom1", "bottom2"];
  if (paths.middle.length) handles.push("middle1", "middle2");
  for (const name of handles) {
    drawHandle(dimensions, controlPoint(name), state.dragging === name);
  }
}

function controlPoint(name) {
  const property = {
    top1: "topControl1",
    top2: "topControl2",
    middle1: "middleControl1",
    middle2: "middleControl2",
    bottom1: "bottomControl1",
    bottom2: "bottomControl2",
  }[name];
  return property ? state.geometry[property] : null;
}

function drawScreenArrow(start, end, color, alpha = 1, lineWidth = 1.7) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const magnitude = Math.hypot(deltaX, deltaY);
  if (magnitude < 1e-6) return;
  const directionX = deltaX / magnitude;
  const directionY = deltaY / magnitude;
  const head = Math.min(7, Math.max(4, magnitude * 0.28));
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = lineWidth;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - directionX * head - directionY * head * 0.55,
    end.y - directionY * head + directionX * head * 0.55,
  );
  context.lineTo(
    end.x - directionX * head + directionY * head * 0.55,
    end.y - directionY * head - directionX * head * 0.55,
  );
  context.closePath();
  context.fill();
  context.restore();
}

function drawCurrentArrows2D(dimensions, circuit, paths) {
  const currentSign = Math.sign(circuit.current);
  if (!currentSign) return;
  const alpha = 0.35 + 0.65 * Math.min(1, Math.abs(circuit.current) * 0.8);
  context.save();
  context.shadowColor = "#eafffb";
  context.shadowBlur = 6;
  const directedPaths = [
    [paths.sourceTop, state.geometry.topControl1, state.geometry.topControl2,
      paths.loadTop, currentSign],
    [paths.sourceBottom, state.geometry.bottomControl1, state.geometry.bottomControl2,
      paths.loadBottom, -currentSign],
  ];
  if (paths.middle.length) {
    directedPaths.push([
      paths.loadElements[0].bottom,
      paths.middleControl1,
      paths.middleControl2,
      paths.loadElements[1].top,
      currentSign,
    ]);
  }
  for (const parameter of [0.2, 0.48, 0.76]) {
    for (const [start, control1, control2, end, pathSign] of directedPaths) {
      const point = Physics.cubicPoint(start, control1, control2, end, parameter);
      const tangent = Physics.cubicTangent(start, control1, control2, end, parameter);
      const magnitude = Math.hypot(tangent.x, tangent.y);
      if (magnitude < 1e-8) continue;
      const center = toCanvas(point, dimensions);
      const direction = {
        x: pathSign * tangent.x / magnitude,
        y: -pathSign * tangent.y / magnitude,
      };
      drawScreenArrow(
        {x: center.x - 10 * direction.x, y: center.y - 10 * direction.y},
        {x: center.x + 10 * direction.x, y: center.y + 10 * direction.y},
        "#edfffb",
        alpha,
        1.8,
      );
    }
  }
  context.restore();
}

function drawInspectionContour(dimensions, circuit) {
  const geometry = state.geometry;
  const paths = Physics.circuitPaths(geometry, 4);
  const loadPoints = paths.loadElements.flatMap(load => [load.top, load.bottom, load.center]);
  const minimumX = Math.min(...loadPoints.map(point => point.x)) - 0.07;
  const maximumX = Math.max(...loadPoints.map(point => point.x)) + 0.07;
  const maximumY = Math.max(...loadPoints.map(point => point.y)) + 0.05;
  const minimumY = Math.min(...loadPoints.map(point => point.y)) - 0.05;
  const topLeft = toCanvas({x: minimumX, y: maximumY}, dimensions);
  const bottomRight = toCanvas({x: maximumX, y: minimumY}, dimensions);
  context.save();
  context.setLineDash([4, 5]);
  context.strokeStyle = circuit.instantaneousPower < 0
    ? "rgba(101, 185, 255, 0.58)"
    : "rgba(255, 185, 92, 0.58)";
  context.lineWidth = 1;
  context.strokeRect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y,
  );
  context.setLineDash([]);
  context.fillStyle = context.strokeStyle;
  context.font = "600 10px Inter, sans-serif";
  context.textAlign = "center";
  context.fillText(
    "LOAD BOUNDARY",
    0.5 * (minimumX + maximumX) * dimensions.width,
    topLeft.y - 8,
  );
  context.restore();
}

function drawSource(dimensions, circuit) {
  const geometry = state.geometry;
  const center = toCanvas({x: geometry.sourceX, y: geometry.sourceY}, dimensions);
  const elementHeight = geometry.sourceLength * dimensions.height;
  const width = Math.max(42, dimensions.width * 0.055);
  context.save();
  context.fillStyle = "rgba(7, 18, 20, 0.96)";
  context.strokeStyle = circuit.instantaneousPower >= 0 ? "#78e4d1" : "#6bbcff";
  context.lineWidth = 1.6;
  context.beginPath();
  context.roundRect(center.x - width / 2, center.y - elementHeight / 2, width, elementHeight, 8);
  context.fill();
  context.stroke();
  const longPlateY = center.y - 8;
  const shortPlateY = center.y + 9;
  context.strokeStyle = "#dae8e5";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(center.x - 13, longPlateY);
  context.lineTo(center.x + 13, longPlateY);
  context.moveTo(center.x - 8, shortPlateY);
  context.lineTo(center.x + 8, shortPlateY);
  context.stroke();
  context.fillStyle = "#a9bfbb";
  context.textAlign = "center";
  context.font = "600 9px Inter, sans-serif";
  context.fillText("SOURCE", center.x, center.y + elementHeight / 2 - 12);
  context.font = "600 14px Inter, sans-serif";
  context.fillStyle = circuit.voltage >= 0 ? "#ffac6c" : "#58b7ec";
  context.fillText(circuit.voltage >= 0 ? "+" : "−", center.x, center.y - elementHeight / 2 + 20);
  context.fillStyle = circuit.voltage >= 0 ? "#58b7ec" : "#ffac6c";
  context.fillText(circuit.voltage >= 0 ? "−" : "+", center.x, center.y + elementHeight / 2 - 24);
  context.fillStyle = "rgba(220, 240, 236, 0.45)";
  context.font = "700 12px Inter, sans-serif";
  context.fillText("⋮", center.x + width / 2 - 7, center.y + 4);
  context.restore();
}

function drawLoad(dimensions, circuit) {
  const geometry = state.geometry;
  const paths = Physics.circuitPaths(geometry, 4);
  const height = geometry.loadElementLength * dimensions.height;
  const width = Math.max(45, dimensions.width * 0.06);
  const components = parameters().components;
  for (let index = 0; index < components.length; index += 1) {
    const component = components[index];
    const componentPower = circuit.componentInstantaneousPowers[index];
    const powerColor = componentPower < -0.001 ? "#65b9ff" : "#ffb95c";
    const center = toCanvas(paths.loadElements[index].center, dimensions);
    const top = center.y - height / 2;
    context.save();
    context.shadowColor = powerColor;
    context.shadowBlur = 12 * Math.min(1, Math.abs(componentPower) / 8);
    context.fillStyle = "rgba(12, 26, 28, 0.97)";
    context.strokeStyle = powerColor;
    context.lineWidth = 1.8;
    context.beginPath();
    context.roundRect(center.x - width / 2, top, width, height, 7);
    context.fill();
    context.stroke();
    context.shadowBlur = 0;
    drawComponentSymbol(center.x, center.y, height, component.type);
    context.fillStyle = powerColor;
    context.textAlign = "center";
    context.font = "700 9px Inter, sans-serif";
    context.fillText(
      `${component.type.toUpperCase()}${index + 1}`,
      center.x,
      top + height - 8,
    );
    context.fillStyle = "rgba(220, 240, 236, 0.45)";
    context.textAlign = "center";
    context.font = "700 12px Inter, sans-serif";
    context.fillText("⋮", center.x + width / 2 - 7, center.y + 4);
    context.restore();
  }
}

function drawComponentSymbol(x, y, availableHeight, type) {
  const halfSpan = Math.min(18, availableHeight * 0.25);
  context.save();
  context.strokeStyle = "#d4e0dd";
  context.lineWidth = 1.5;
  context.beginPath();
  if (type === "c") {
    context.moveTo(x, y - halfSpan);
    context.lineTo(x, y - 4);
    context.moveTo(x - 9, y - 4);
    context.lineTo(x + 9, y - 4);
    context.moveTo(x - 9, y + 4);
    context.lineTo(x + 9, y + 4);
    context.moveTo(x, y + 4);
    context.lineTo(x, y + halfSpan);
  } else if (type === "l") {
    context.moveTo(x, y - halfSpan);
    const turns = 4;
    const samples = 28;
    for (let index = 1; index <= samples; index += 1) {
      const fraction = index / samples;
      context.lineTo(
        x + 6 * Math.sin(fraction * turns * Math.PI),
        y - halfSpan + 2 * halfSpan * fraction,
      );
    }
  } else {
    context.moveTo(x, y - halfSpan);
    const steps = 7;
    for (let index = 1; index <= steps; index += 1) {
      context.lineTo(
        x + (index === steps ? 0 : (index % 2 ? -7 : 7)),
        y - halfSpan + 2 * halfSpan * index / steps,
      );
    }
  }
  context.stroke();
  context.restore();
}

function drawSurfaceCharges(dimensions, circuit) {
  const geometry = state.geometry;
  const paths = Physics.circuitPaths(geometry);
  const topSign = circuit.voltage >= 0 ? "+" : "−";
  const bottomSign = circuit.voltage >= 0 ? "−" : "+";
  const alpha = 0.2 + 0.8 * Math.min(1, Math.abs(circuit.voltage) / parameters().voltage);
  context.save();
  context.globalAlpha = alpha;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 12px Inter, sans-serif";
  for (const parameter of [0.18, 0.38, 0.62, 0.82]) {
    const top = toCanvas(Physics.cubicPoint(
      paths.sourceTop,
      geometry.topControl1,
      geometry.topControl2,
      paths.loadTop,
      parameter,
    ), dimensions);
    const bottom = toCanvas(Physics.cubicPoint(
      paths.sourceBottom,
      geometry.bottomControl1,
      geometry.bottomControl2,
      paths.loadBottom,
      parameter,
    ), dimensions);
    context.fillStyle = topSign === "+" ? "#ffd2b0" : "#a9dcf7";
    context.fillText(topSign, top.x, top.y - 13);
    context.fillStyle = bottomSign === "+" ? "#ffd2b0" : "#a9dcf7";
    context.fillText(bottomSign, bottom.x, bottom.y + 14);
  }
  context.restore();
}

function drawHandle(dimensions, point, active) {
  const screen = toCanvas(point, dimensions);
  context.save();
  context.shadowColor = "#d9fff7";
  context.shadowBlur = active ? 16 : 8;
  context.fillStyle = active ? "#ffffff" : "#d2ebe6";
  context.strokeStyle = active ? "#ffbd65" : "rgba(6, 20, 22, 0.8)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(screen.x, screen.y, active ? 7 : 5.5, 0, 2 * Math.PI);
  context.fill();
  context.stroke();
  context.restore();
}

function resetParticle(particle, reverse = false) {
  const geometry = state.geometry;
  const paths = Physics.circuitPaths(geometry, 4);
  const loadX = Math.max(...paths.loadElements.map(load => load.center.x));
  const x = reverse ? loadX - 0.06 : geometry.sourceX + 0.06;
  const spread = 0.12 + 0.76 * Math.random();
  const topY = reverse ? paths.loadTop.y : paths.sourceTop.y;
  const bottomY = reverse ? paths.loadBottom.y : paths.sourceBottom.y;
  particle.x = x + (Math.random() - 0.5) * 0.018;
  particle.y = bottomY
    + spread * (topY - bottomY)
    + (Math.random() - 0.5) * 0.04;
  particle.life = 4 + 5 * Math.random();
  particle.previousX = particle.x;
  particle.previousY = particle.y;
}

function resetParticles() {
  state.particles = Array.from({length: 76}, () => ({}));
  const paths = Physics.circuitPaths(state.geometry);
  for (const particle of state.particles) {
    const parameter = 0.06 + 0.88 * Math.random();
    const top = Physics.cubicPoint(
      paths.sourceTop,
      state.geometry.topControl1,
      state.geometry.topControl2,
      paths.loadTop,
      parameter,
    );
    const bottom = Physics.cubicPoint(
      paths.sourceBottom,
      state.geometry.bottomControl1,
      state.geometry.bottomControl2,
      paths.loadBottom,
      parameter,
    );
    const crossSection = 0.1 + 0.8 * Math.random();
    particle.x = bottom.x + crossSection * (top.x - bottom.x);
    particle.y = bottom.y + crossSection * (top.y - bottom.y);
    particle.previousX = particle.x;
    particle.previousY = particle.y;
    particle.life = 1 + 7 * Math.random();
  }
}

function updateAndDrawParticles(dimensions, circuit, deltaSeconds) {
  if (!byId("show-particles").checked || !state.fieldGrid || state.geometryDirty) return;
  const reverse = circuit.instantaneousPower < 0;
  context.save();
  context.globalCompositeOperation = "lighter";
  for (const particle of state.particles) {
    const field = fieldAt(particle.x, particle.y, circuit);
    const magnitude = Math.hypot(field.poyntingX, field.poyntingY);
    if (magnitude < state.fieldGrid.poyntingReference * 0.006) {
      resetParticle(particle, reverse);
      continue;
    }
    const speed = (0.055 + 0.07 * Math.min(1, magnitude / state.fieldGrid.poyntingReference))
      * Math.min(1, Math.sqrt(magnitude / state.fieldGrid.poyntingReference));
    particle.previousX = particle.x;
    particle.previousY = particle.y;
    particle.x += field.poyntingX / magnitude * speed * deltaSeconds;
    particle.y += field.poyntingY / magnitude * speed * deltaSeconds;
    particle.life -= deltaSeconds;
    if (particle.life < 0 || particle.x < 0.04 || particle.x > 0.96
      || particle.y < 0.04 || particle.y > 0.96) {
      resetParticle(particle, reverse);
      continue;
    }
    const screen = toCanvas(particle, dimensions);
    const previous = toCanvas({x: particle.previousX, y: particle.previousY}, dimensions);
    const color = reverse ? "#73c8ff" : "#ffe1a7";
    context.strokeStyle = color;
    context.globalAlpha = 0.3;
    context.lineWidth = 1.1;
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(screen.x, screen.y);
    context.stroke();
    context.fillStyle = color;
    context.globalAlpha = 0.7;
    context.beginPath();
    context.arc(screen.x, screen.y, 1.35, 0, 2 * Math.PI);
    context.fill();
  }
  context.restore();
}

function signed(value, digits = 2) {
  if (Math.abs(value) < 0.5 * 10 ** -digits) return (0).toFixed(digits);
  return value.toFixed(digits).replace("-", "−");
}

function componentInwardFlux(circuit, componentIndex) {
  if (!state.fieldGrid || state.geometryDirty) return Number.NaN;
  const center = state.geometry.loads[componentIndex];
  const halfWidth = 0.058;
  const halfHeight = state.geometry.loadElementLength / 2 + 0.014;
  return Physics.rectangularInwardFlux((x, y) => {
    const field = fieldAt(x, y, circuit);
    return {x: field.poyntingX, y: field.poyntingY};
  }, center, halfWidth, halfHeight, 22);
}

function updateReadout(circuit) {
  byId("voltage-output").textContent = `${parameters().voltage} V`;
  byId("frequency-output").textContent = `${parameters().frequency} Hz`;
  byId("phase-output").textContent = `${Math.round(state.phase * 180 / Math.PI) % 360}°`;
  byId("voltage-readout").textContent = `${signed(circuit.voltage)} V`;
  byId("current-readout").textContent = `${signed(circuit.current)} A`;
  byId("power-readout").textContent = `${signed(circuit.instantaneousPower)} W`;
  byId("average-power-readout").textContent = `${circuit.averagePower.toFixed(2)} W`;
  byId("phase-readout").textContent = `${signed(circuit.currentPhase * 180 / Math.PI, 1)}°`;
  byId("mode-chip").textContent = state.mode === "dc" ? t("steadyMode") : t("instantaneousMode");

  const backwards = circuit.instantaneousPower < -0.003;
  const still = Math.abs(circuit.instantaneousPower) <= 0.003;
  const direction = byId("power-direction");
  direction.textContent = still ? t("zeroInstant") : backwards ? t("loadToSource") : t("sourceToLoad");
  direction.style.color = backwards ? "#65b9ff" : still ? "#8ea8a5" : "#ffb95c";
  byId("power-readout").style.color = backwards ? "#65b9ff" : "#ffb95c";

  const scale = Math.max(0.001, parameters().voltage * circuit.currentPeak);
  const meterFraction = Math.min(0.5, 0.5 * Math.abs(circuit.instantaneousPower) / scale);
  const meter = byId("power-meter-fill");
  meter.style.left = backwards ? `${50 - 100 * meterFraction}%` : "50%";
  meter.style.width = `${100 * meterFraction}%`;
  meter.style.background = backwards ? "#65b9ff" : "#ffb95c";

  circuit.componentAveragePowers.forEach((power, index) => {
    const output = byId(`load-power-${index}`);
    if (output) output.textContent = `${power.toFixed(2)} W`;
  });
  const fluxes = circuit.componentInstantaneousPowers.map((power, index) => {
    const instantaneousOutput = byId(`load-instant-${index}`);
    if (instantaneousOutput) instantaneousOutput.textContent = `${signed(power)} W`;
    const flux = componentInwardFlux(circuit, index);
    const fluxOutput = byId(`load-flux-${index}`);
    if (fluxOutput) {
      fluxOutput.textContent = !Number.isFinite(flux)
        ? t("notComputed")
        : Math.abs(flux) < 1e-5 ? t("nearZero") : flux > 0 ? t("inward") : t("outward");
      fluxOutput.classList.toggle("returning", flux < -1e-5);
    }
    return flux;
  });

  const comparable = fluxes.map((flux, index) => ({
    flux,
    power: circuit.componentInstantaneousPowers[index],
  })).filter(item => Number.isFinite(item.flux) && Math.abs(item.power) > 0.01);
  const matches = comparable.filter(item => Math.sign(item.flux) === Math.sign(item.power)).length;
  const audit = byId("field-audit-status");
  if (!state.fieldGrid || state.geometryDirty) {
    audit.textContent = t("awaiting");
    audit.classList.remove("warning");
  } else if (!comparable.length) {
    audit.textContent = t("zeroCrossing");
    audit.classList.remove("warning");
  } else {
    audit.textContent = t("directionsAgree", {matches, total: comparable.length});
    audit.classList.toggle("warning", matches !== comparable.length);
  }

  const note = byId("power-note");
  const purelyResistive = parameters().components.every(component => component.type === "r");
  if (state.mode === "dc") {
    note.textContent = t("dcPowerNote");
  } else if (purelyResistive) {
    note.textContent = t("resistorPowerNote");
  } else if (backwards) {
    note.textContent = t("returningPowerNote");
  } else {
    note.textContent = t("reactivePowerNote");
  }
}

function drawPhasorArrow(renderContext, center, radius, angle, color, label) {
  const end = {
    x: center.x + radius * Math.cos(angle),
    y: center.y - radius * Math.sin(angle),
  };
  const start = {
    x: center.x + 7 * Math.cos(angle),
    y: center.y - 7 * Math.sin(angle),
  };
  const directionX = Math.cos(angle);
  const directionY = -Math.sin(angle);
  const head = 7;
  renderContext.save();
  renderContext.strokeStyle = color;
  renderContext.fillStyle = color;
  renderContext.lineWidth = 2.4;
  renderContext.shadowColor = color;
  renderContext.shadowBlur = 7;
  renderContext.beginPath();
  renderContext.moveTo(start.x, start.y);
  renderContext.lineTo(end.x, end.y);
  renderContext.stroke();
  renderContext.beginPath();
  renderContext.moveTo(end.x, end.y);
  renderContext.lineTo(
    end.x - directionX * head - directionY * head * 0.55,
    end.y - directionY * head + directionX * head * 0.55,
  );
  renderContext.lineTo(
    end.x - directionX * head + directionY * head * 0.55,
    end.y - directionY * head - directionX * head * 0.55,
  );
  renderContext.closePath();
  renderContext.fill();
  renderContext.shadowBlur = 0;
  renderContext.font = "700 11px Inter, sans-serif";
  renderContext.fillText(label, end.x + 9 * directionX, end.y + 9 * directionY);
  renderContext.restore();
}

function drawPhasorPlot(circuit) {
  if (state.mode !== "ac") return;
  const rectangle = phasorCanvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(rectangle.width * ratio));
  const height = Math.max(1, Math.round(rectangle.height * ratio));
  if (phasorCanvas.width !== width || phasorCanvas.height !== height) {
    phasorCanvas.width = width;
    phasorCanvas.height = height;
  }
  phasorContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  phasorContext.clearRect(0, 0, rectangle.width, rectangle.height);
  const center = {x: rectangle.width * 0.5, y: rectangle.height * 0.52};
  const radius = Math.min(51, rectangle.height * 0.36, rectangle.width * 0.23);

  phasorContext.save();
  phasorContext.strokeStyle = "rgba(173, 229, 218, 0.14)";
  phasorContext.lineWidth = 1;
  phasorContext.beginPath();
  phasorContext.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  phasorContext.moveTo(center.x - radius - 12, center.y);
  phasorContext.lineTo(center.x + radius + 12, center.y);
  phasorContext.moveTo(center.x, center.y - radius - 8);
  phasorContext.lineTo(center.x, center.y + radius + 8);
  phasorContext.stroke();

  if (Math.abs(circuit.currentPhase) > 0.015) {
    const samples = 28;
    phasorContext.strokeStyle = "rgba(228, 242, 238, 0.55)";
    phasorContext.setLineDash([3, 3]);
    phasorContext.beginPath();
    for (let index = 0; index <= samples; index += 1) {
      const angle = state.phase + circuit.currentPhase * index / samples;
      const point = {
        x: center.x + radius * 0.42 * Math.cos(angle),
        y: center.y - radius * 0.42 * Math.sin(angle),
      };
      if (index === 0) phasorContext.moveTo(point.x, point.y);
      else phasorContext.lineTo(point.x, point.y);
    }
    phasorContext.stroke();
    phasorContext.setLineDash([]);
    phasorContext.fillStyle = "#b7cbc8";
    phasorContext.font = "600 9px Inter, sans-serif";
    phasorContext.fillText(
      `Δφ ${signed(circuit.currentPhase * 180 / Math.PI, 1)}°`,
      center.x + radius * 0.52,
      center.y + radius * 0.52,
    );
  }
  phasorContext.restore();

  drawPhasorArrow(phasorContext, center, radius, state.phase, "#ff8754", "V");
  drawPhasorArrow(
    phasorContext,
    center,
    radius * 0.88,
    state.phase + circuit.currentPhase,
    "#77ead5",
    "I",
  );
}

function drawTooltip(dimensions, circuit) {
  const tooltip = byId("canvas-tooltip");
  if (!state.pointer || state.dragging || !state.fieldGrid || state.geometryDirty) {
    tooltip.hidden = true;
    return;
  }
  const {x, y, screenX, screenY} = state.pointer;
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    tooltip.hidden = true;
    return;
  }
  const field = fieldAt(x, y, circuit);
  const flow = Math.hypot(field.poyntingX, field.poyntingY)
    / state.fieldGrid.poyntingReference;
  tooltip.textContent = `φ ${field.potential >= 0 ? "+" : ""}${field.potential.toFixed(2)} · relative |S| ${flow.toFixed(2)}`;
  tooltip.style.left = `${Math.min(dimensions.width - 150, screenX + 12)}px`;
  tooltip.style.top = `${Math.min(dimensions.height - 40, screenY + 12)}px`;
  tooltip.hidden = false;
}

function drawFrame(timestamp) {
  const dimensions = resizeCanvas();
  const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - state.lastFrame) / 1000));
  state.lastFrame = timestamp;
  if (state.mode === "ac" && state.running && !state.geometryDirty && state.fieldGrid) {
    state.phase = (state.phase + deltaSeconds * 1.15) % (2 * Math.PI);
    byId("phase").value = Math.round(state.phase * 180 / Math.PI);
  }
  const circuit = currentCircuitState();
  drawBackground(dimensions, circuit);
  drawGrid(dimensions);
  if (state.fieldGrid && !state.geometryDirty) {
    drawFieldSymbols(dimensions, circuit);
    updateAndDrawParticles(dimensions, circuit, deltaSeconds);
  }
  drawCircuit(dimensions, circuit);
  drawTooltip(dimensions, circuit);
  updateReadout(circuit);
  drawPhasorPlot(circuit);
  requestAnimationFrame(drawFrame);
}

function defaultComponent(type = "r") {
  if (type === "l") return {type, inductance: 80};
  if (type === "c") return {type, capacitance: 220};
  return {type: "r", resistance: 8};
}

function componentOptions(selected) {
  const options = [
    ["r", t("resistor")],
    ["l", t("inductor")],
    ["c", t("capacitor")],
  ];
  return options.map(([value, label]) => (
    `<option value="${value}"${selected === value ? " selected" : ""}>${label}</option>`
  )).join("");
}

function loadParameterMarkup(component, index) {
  if (component.type === "r") {
    return `
      <label class="load-parameter">
        <span>${t("resistance")} <output data-value-for="resistance">${component.resistance.toFixed(0)} Ω</output></span>
        <input type="range" min="1" max="50" step="1" value="${component.resistance}"
          data-index="${index}" data-property="resistance" data-unit="Ω">
      </label>`;
  }
  const quantity = component.type === "l" ? "inductance" : "capacitance";
  const label = component.type === "l" ? t("inductance") : t("capacitance");
  const unit = component.type === "l" ? "mH" : "μF";
  const minimum = component.type === "l" ? 5 : 10;
  const maximum = component.type === "l" ? 250 : 500;
  const step = component.type === "l" ? 5 : 10;
  return `
    <label class="load-parameter">
      <span>${label} <output data-value-for="${quantity}">${component[quantity].toFixed(0)} ${unit}</output></span>
      <input type="range" min="${minimum}" max="${maximum}" step="${step}"
        value="${component[quantity]}" data-index="${index}" data-property="${quantity}"
        data-unit="${unit}">
    </label>`;
}

function renderLoadEditor() {
  const components = state.components[state.mode];
  byId("load-list").innerHTML = components.map((component, index) => `
    <section class="load-card" data-load-index="${index}">
      <div class="load-card-header">
        <span class="load-index">${index + 1}</span>
        <select data-component-type data-index="${index}" aria-label="${t("loadTypeLabel", {number: index + 1})}"
          ${state.mode === "dc" ? "disabled" : ""}>
          ${state.mode === "dc"
            ? `<option value="r">${t("resistor")}</option>`
            : componentOptions(component.type)}
        </select>
        ${components.length > 1
          ? `<button class="remove-load-button" type="button" data-remove-load="${index}" aria-label="${t("removeLoadLabel", {number: index + 1})}">${t("remove")}</button>`
          : ""}
      </div>
      ${loadParameterMarkup(component, index)}
      <p class="load-power"><span>${state.mode === "dc" ? t("dissipation") : t("averageLoss")}</span><output id="load-power-${index}">— W</output></p>
      <p class="load-power"><span>${t("elementPower")}</span><output id="load-instant-${index}">— W</output></p>
      <p class="load-power"><span>${t("localFlux")}</span><output id="load-flux-${index}">${t("notComputed")}</output></p>
    </section>
  `).join("");
  const addButton = byId("add-load");
  addButton.disabled = components.length >= 2;
  addButton.textContent = components.length >= 2 ? t("maximumLoads") : t("addLoad");
}

function setMode(mode) {
  state.mode = mode;
  state.geometry.loadCount = state.components[mode].length;
  for (const button of document.querySelectorAll(".mode-button")) {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const controls = byId("ac-controls");
  const alternating = mode === "ac";
  controls.classList.toggle("open", alternating);
  controls.setAttribute("aria-hidden", String(!alternating));
  byId("phase-row").classList.toggle("muted", !alternating);
  renderLoadEditor();
  markGeometryDirty();
  updatePlayButton();
  resetParticles();
}

function updatePlayButton() {
  const button = byId("play-toggle");
  button.setAttribute("aria-pressed", String(state.running));
  button.innerHTML = state.running
    ? `<span>Ⅱ</span> ${t("pause")}`
    : `<span>▶</span> ${t("play")}`;
}

for (const button of document.querySelectorAll(".mode-button")) {
  button.addEventListener("click", () => setMode(button.dataset.mode));
}

for (const id of [
  "voltage",
  "frequency",
  "vector-layer",
  "background-layer",
  "show-current",
  "show-particles",
  "show-charge",
]) {
  byId(id).addEventListener("input", () => {
    if (id === "show-particles") resetParticles();
    if ((id === "voltage" || id === "frequency") && state.fieldBasis) {
      composeFieldPhasors();
    }
  });
}

byId("add-load").addEventListener("click", () => {
  const components = state.components[state.mode];
  if (components.length >= 2) return;
  const first = state.geometry.loads[0];
  const upperY = Math.min(0.86, first.y + 0.12);
  const lowerY = Math.max(0.14, first.y - 0.12);
  const upperShift = upperY - first.y;
  const lowerShift = lowerY - first.y;
  state.geometry.loads[0] = {x: first.x, y: upperY};
  state.geometry.loads[1] = {x: first.x, y: lowerY};
  state.geometry.topControl2.y += upperShift;
  state.geometry.bottomControl2.y += lowerShift;
  state.geometry.middleControl1 = {x: first.x, y: upperY - 0.075};
  state.geometry.middleControl2 = {x: first.x, y: lowerY + 0.075};
  components.push(defaultComponent());
  state.geometry.loadCount = 2;
  markGeometryDirty();
  renderLoadEditor();
  resetParticles();
});

byId("load-list").addEventListener("change", event => {
  const select = event.target.closest("[data-component-type]");
  if (!select) return;
  const index = Number(select.dataset.index);
  state.components[state.mode][index] = defaultComponent(select.value);
  renderLoadEditor();
  composeFieldPhasors();
  resetParticles();
});

byId("load-list").addEventListener("input", event => {
  const input = event.target.closest("input[data-property]");
  if (!input) return;
  const component = state.components[state.mode][Number(input.dataset.index)];
  component[input.dataset.property] = Number(input.value);
  const output = input.closest("label").querySelector("output");
  output.textContent = `${Number(input.value).toFixed(0)} ${input.dataset.unit}`;
  composeFieldPhasors();
});

byId("load-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-load]");
  if (!button) return;
  const index = Number(button.dataset.removeLoad);
  state.components[state.mode].splice(index, 1);
  if (index === 0) state.geometry.loads[0] = {...state.geometry.loads[1]};
  state.geometry.loadCount = 1;
  markGeometryDirty();
  renderLoadEditor();
  resetParticles();
});

byId("phase").addEventListener("input", event => {
  state.phase = Number(event.target.value) * Math.PI / 180;
  state.running = false;
  updatePlayButton();
});

byId("play-toggle").addEventListener("click", () => {
  if (state.geometryDirty || !state.fieldGrid) {
    byId("field-stale").hidden = false;
    return;
  }
  state.running = !state.running;
  updatePlayButton();
});

byId("reset-geometry").addEventListener("click", () => {
  state.geometry = Physics.defaultGeometry();
  state.geometry.loadCount = state.components[state.mode].length;
  markGeometryDirty();
});

byId("recompute-fields").addEventListener("click", requestFieldSolve);

function distanceToSegment(point, start, end) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const parameter = lengthSquared > 0
    ? Math.max(0, Math.min(1, (
      (point.x - start.x) * deltaX + (point.y - start.y) * deltaY
    ) / lengthSquared))
    : 0;
  return Math.hypot(
    point.x - (start.x + parameter * deltaX),
    point.y - (start.y + parameter * deltaY),
  );
}

function screenPoint(point, dimensions) {
  return toCanvas(point, dimensions);
}

function draggableAt(point, pointerScreen) {
  const rectangle = canvas.getBoundingClientRect();
  const dimensions = {width: rectangle.width, height: rectangle.height};
  const handleNames = ["top1", "top2", "bottom1", "bottom2"];
  if (state.geometry.loadCount === 2) handleNames.push("middle1", "middle2");
  for (const name of handleNames) {
    const handle = screenPoint(controlPoint(name), dimensions);
    if (Math.hypot(pointerScreen.x - handle.x, pointerScreen.y - handle.y) < 22) return name;
  }
  const paths = Physics.circuitPaths(state.geometry, 4);
  const elements = [["source", paths.sourceBottom, paths.sourceTop]];
  paths.loadElements.forEach((load, index) => {
    elements.push([`load${index}`, load.bottom, load.top]);
  });
  for (const [name, start, end] of elements) {
    const screenStart = screenPoint(start, dimensions);
    const screenEnd = screenPoint(end, dimensions);
    if (distanceToSegment(pointerScreen, screenStart, screenEnd) < 25) return name;
  }
  return null;
}

function pointerPosition(event) {
  const rectangle = canvas.getBoundingClientRect();
  return {
    point: fromCanvas(event.clientX, event.clientY),
    screen: {
      x: event.clientX - rectangle.left,
      y: event.clientY - rectangle.top,
    },
  };
}

canvas.addEventListener("pointerdown", event => {
  const position = pointerPosition(event);
  const target = draggableAt(position.point, position.screen);
  if (!target) return;
  state.dragging = target;
  if (target === "source" || target.startsWith("load")) {
    const center = target === "source"
      ? {x: state.geometry.sourceX, y: state.geometry.sourceY}
      : state.geometry.loads[Number(target.at(-1))];
    state.dragOffset = {
      x: position.point.x - center.x,
      y: position.point.y - center.y,
    };
  }
  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor = "grabbing";
  event.preventDefault();
});

canvas.addEventListener("pointermove", event => {
  const position = pointerPosition(event);
  const point = position.point;
  state.pointer = {
    ...point,
    screenX: position.screen.x,
    screenY: position.screen.y,
  };
  if (!state.dragging) {
    const target = draggableAt(point, position.screen);
    canvas.style.cursor = target === "source" || target?.startsWith("load")
      ? "move"
      : target ? "grab" : "crosshair";
    return;
  }
  if (state.dragging === "source" || state.dragging.startsWith("load")) {
    const name = state.dragging;
    const loadIndex = name === "source" ? -1 : Number(name.at(-1));
    const center = loadIndex < 0
      ? {x: state.geometry.sourceX, y: state.geometry.sourceY}
      : state.geometry.loads[loadIndex];
    const oldX = center.x;
    const oldY = center.y;
    const desiredX = point.x - state.dragOffset.x;
    const desiredY = point.y - state.dragOffset.y;
    const minimumX = name === "source" ? 0.07 : 0.48;
    const maximumX = name === "source" ? 0.43 : 0.94;
    const newX = Math.max(minimumX, Math.min(maximumX, desiredX));
    const halfLength = name === "source"
      ? state.geometry.sourceLength / 2
      : state.geometry.loadElementLength / 2;
    const newY = Math.max(0.07 + halfLength, Math.min(0.93 - halfLength, desiredY));
    const deltaX = newX - oldX;
    const deltaY = newY - oldY;
    if (name === "source") {
      state.geometry.sourceX = newX;
      state.geometry.sourceY = newY;
    } else {
      center.x = newX;
      center.y = newY;
    }
    let attachedControls;
    if (name === "source") {
      attachedControls = [state.geometry.topControl1, state.geometry.bottomControl1];
    } else if (loadIndex === 0 && state.geometry.loadCount === 2) {
      attachedControls = [state.geometry.topControl2, state.geometry.middleControl1];
    } else if (loadIndex === 0) {
      attachedControls = [state.geometry.topControl2, state.geometry.bottomControl2];
    } else {
      attachedControls = [state.geometry.middleControl2, state.geometry.bottomControl2];
    }
    for (const control of attachedControls) {
      control.x = Math.max(0.08, Math.min(0.92, control.x + deltaX));
      control.y = Math.max(0.07, Math.min(0.93, control.y + deltaY));
    }
  } else {
    const target = controlPoint(state.dragging);
    if (state.dragging === "middle1") {
      target.x = state.geometry.loads[0].x;
    } else if (state.dragging === "middle2") {
      target.x = state.geometry.loads[1].x;
    } else {
      target.x = Math.max(0.05, Math.min(0.95, point.x));
    }
    target.y = Math.max(0.05, Math.min(0.95, point.y));
  }
  markGeometryDirty();
});

function stopDragging(event) {
  if (!state.dragging) return;
  state.dragging = null;
  state.dragOffset = null;
  markGeometryDirty();
  canvas.style.cursor = "crosshair";
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);
canvas.addEventListener("pointerleave", () => {
  if (!state.dragging) state.pointer = null;
});

const initialQuery = new URLSearchParams(window.location.search);
const initialComponent = initialQuery.get("component");
applyLocale();
if (["r", "l", "c"].includes(initialComponent)) {
  state.components.ac = [defaultComponent(initialComponent)];
}
const initialMode = initialQuery.get("mode") === "ac" ? "ac" : "dc";
if (initialQuery.get("loads") === "2") {
  state.components[initialMode].push(defaultComponent());
}
const initialPhase = Number(initialQuery.get("phase"));
if (Number.isFinite(initialPhase) && initialQuery.has("phase")) {
  state.phase = initialPhase * Math.PI / 180;
  byId("phase").value = String(initialPhase);
}
if (initialQuery.get("paused") === "1") state.running = false;
setMode(initialMode);
requestFieldSolve();
requestAnimationFrame(drawFrame);
