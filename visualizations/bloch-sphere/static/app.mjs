import {
  GATES,
  applyGate,
  blochVector,
  canonicalizeGlobalPhase,
  interpolateGateBlochVector,
  stateFromBasis,
  superposeStates,
} from "./physics.mjs";

const TRANSLATIONS = {
  en: {
    title: "Bloch Sphere",
    intro: "Relate a qubit's complex amplitudes to a direction on the unit sphere.",
    panel1Title: "State and Bloch vector", panel1Copy: "Choose a basis and amplitudes; the corresponding state appears as one point on the sphere.",
    panel2Title: "Superposition of states", panel2Copy: "Add two kets as complex vectors, then normalize. The relative phase changes the result.",
    panel3Title: "Single-qubit unitary operations", panel3Copy: "Choose a gate and play the rotation from input to output. The faint arrow is the input.",
    stateInput: "State input", stateA: "State A", stateB: "State B", result: "Result", inputState: "Input state",
    inputBasis: "Input basis", amplitudeBalance: "Amplitude balance", relativePhase: "Relative phase",
    zBasis: "Z basis", xBasis: "X basis", yBasis: "Y basis", firstBasisState: "first basis state",
    secondBasisState: "second basis state", identity: "identity", halfTurnX: "180° about x-axis",
    halfTurnY: "180° about y-axis", halfTurnZ: "180° about z-axis", quarterTurnZ: "90° about z-axis",
    eighthTurnZ: "45° about z-axis", normalizationFactor: "normalization factor",
    presetLabel: "Representative states", computationalState: "State in the computational basis",
    dragHint: "drag to rotate", sphere1Label: "Bloch sphere for state A", basis: "Basis", amplitude: "Amplitude",
    phase: "Phase", sphere2aLabel: "State A before superposition", sphere2bLabel: "State B before superposition",
    sphereResultLabel: "State after superposition", phaseOfB: "Phase of B relative to A",
    afterNormalization: "After normalization", normalizing: "Computing normalization…",
    cancellationWarning: "Complete cancellation: the zero vector cannot be normalized as a quantum state.",
    additionNote: "The Bloch vectors are not added. The complex kets are added first, and the new Bloch vector is calculated from the result.",
    chooseGate: "Choose a gate", actionOnKet: "Action on the ket", sphere3Label: "Bloch vectors before and after a unitary operation",
    playAction: "Play operation", rotationProgress: "Rotation progress", input: "Input", output: "Output",
    noscript: "JavaScript is required for this visualization.", normBefore: "Norm before normalization",
    cannotNormalize: "Cannot normalize", undefinedState: "is undefined",
    panel1DynamicLabel: "State Bloch vector", resultDynamicLabel: "Bloch vector after superposition",
    cancellationDynamicLabel: "The result is undefined because the states cancel completely",
    gateDynamicLabel: "gate in progress; current Bloch vector",
  },
  ja: {
    title: "Bloch球",
    intro: "量子ビットの複素振幅と単位球面上の方向との対応を観察します。",
    panel1Title: "状態とBloch vectorの関係", panel1Copy: "基底と振幅を選ぶと、対応する状態が球面上の1点として現れます。",
    panel2Title: "状態の重ね合わせ", panel2Copy: "2つのketを複素ベクトルとして足して正規化します。相対位相によって結果が変わります。",
    panel3Title: "1量子ビット・ユニタリ操作", panel3Copy: "ゲートを選び、入力から出力への回転を再生します。薄い矢印が入力です。",
    stateInput: "状態の入力", stateA: "状態 A", stateB: "状態 B", result: "結果", inputState: "入力状態",
    inputBasis: "入力基底", amplitudeBalance: "振幅バランス", relativePhase: "相対位相",
    zBasis: "Z基底", xBasis: "X基底", yBasis: "Y基底", firstBasisState: "第1基底状態",
    secondBasisState: "第2基底状態", identity: "恒等操作", halfTurnX: "x軸まわりに180°",
    halfTurnY: "y軸まわりに180°", halfTurnZ: "z軸まわりに180°", quarterTurnZ: "z軸まわりに90°",
    eighthTurnZ: "z軸まわりに45°", normalizationFactor: "規格化係数",
    presetLabel: "代表的な状態", computationalState: "計算基底での状態", dragHint: "ドラッグで視点を回転",
    sphere1Label: "状態AのBloch球", basis: "基底", amplitude: "振幅", phase: "位相",
    sphere2aLabel: "重ね合わせ前の状態A", sphere2bLabel: "重ね合わせ前の状態B",
    sphereResultLabel: "重ね合わせ後の状態", phaseOfB: "Aに対するBの位相", afterNormalization: "正規化後",
    normalizing: "正規化係数を計算中…", cancellationWarning: "完全な打ち消し合いです。零ベクトルは量子状態として正規化できません。",
    additionNote: "Bloch vector同士を足しているのではありません。複素ketを足した後、その結果から新しいBloch vectorを計算しています。",
    chooseGate: "ゲートを選択", actionOnKet: "ketへの作用", sphere3Label: "ユニタリ操作前後のBloch vector",
    playAction: "作用を再生", rotationProgress: "回転の進行", input: "入力", output: "出力",
    noscript: "この可視化にはJavaScriptが必要です。", normBefore: "加算前のノルム", cannotNormalize: "正規化できません",
    undefinedState: "は未定義", panel1DynamicLabel: "状態のBloch vector", resultDynamicLabel: "重ね合わせ後のBloch vector",
    cancellationDynamicLabel: "完全な打ち消し合いのため、重ね合わせ後の状態は未定義です",
    gateDynamicLabel: "ゲート作用中。現在のBloch vector",
  },
};

const locale = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const t = key => TRANSLATIONS[locale][key] ?? TRANSLATIONS.en[key] ?? key;
document.documentElement.lang = locale;
document.title = `${t("title")} — Interactive Physics Atlas`;
document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
  element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
});

const radians = (degrees) => degrees * Math.PI / 180;
const degrees = (angle) => angle * 180 / Math.PI;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

function cleanNumber(value, digits = 3) {
  if (Math.abs(value) < 5e-10) return "0";
  if (Math.abs(Math.abs(value) - 1) < 5e-10) return value < 0 ? "-1" : "1";
  return Number(value.toFixed(digits)).toString();
}

function complexToTex(value) {
  const re = Math.abs(value.re) < 5e-10 ? 0 : value.re;
  const im = Math.abs(value.im) < 5e-10 ? 0 : value.im;
  if (im === 0) return cleanNumber(re);
  if (re === 0) {
    if (Math.abs(im - 1) < 5e-10) return "i";
    if (Math.abs(im + 1) < 5e-10) return "-i";
    return `${cleanNumber(im)}i`;
  }
  const sign = im < 0 ? "-" : "+";
  const imaginary = Math.abs(Math.abs(im) - 1) < 5e-10 ? "i" : `${cleanNumber(Math.abs(im))}i`;
  return `\\left(${cleanNumber(re)}${sign}${imaginary}\\right)`;
}

function stateToTex(state, symbol = "\\psi") {
  const [alpha, beta] = canonicalizeGlobalPhase(state);
  return `|${symbol}\\rangle \\sim ${complexToTex(alpha)}|0\\rangle + ${complexToTex(beta)}|1\\rangle`;
}

let mathQueue = Promise.resolve();
let mathFrame = null;

function setMath(element, tex) {
  if (!element) return;
  if (window.MathJax?.typesetClear) window.MathJax.typesetClear([element]);
  element.textContent = `\\(${tex}\\)`;
  element.dataset.mathDirty = "true";
  if (mathFrame !== null) return;
  mathFrame = requestAnimationFrame(() => {
    mathFrame = null;
    const targets = [...document.querySelectorAll("[data-math-dirty]")];
    if (!targets.length || !window.MathJax?.typesetPromise) return;
    targets.forEach((target) => delete target.dataset.mathDirty);
    mathQueue = mathQueue.then(() => window.MathJax.typesetPromise(targets)).then(() => {
      window.dispatchEvent(new CustomEvent("physics-atlas:mathjax-ready"));
    }).catch(() => {});
  });
}

function vectorText(vector) {
  return `(${cleanNumber(vector.x)}, ${cleanNumber(vector.y)}, ${cleanNumber(vector.z)})`;
}

const PRESETS = {
  zero: {basis: "z", theta: 0, phase: 0},
  one: {basis: "z", theta: 180, phase: 0},
  plus: {basis: "x", theta: 0, phase: 0},
  minus: {basis: "x", theta: 180, phase: 0},
  "plus-y": {basis: "y", theta: 0, phase: 0},
  "minus-y": {basis: "y", theta: 180, phase: 0},
};

const BASIS_KETS = {
  z: ["|0\\rangle", "|1\\rangle"],
  x: ["|+\\rangle", "|-\\rangle"],
  y: ["|+y\\rangle", "|-y\\rangle"],
};

class StateEditor {
  constructor(root, symbol, onChange) {
    this.root = root;
    this.symbol = symbol;
    this.onChange = onChange;
    this.basis = root.querySelector('[data-field="basis"]');
    this.theta = root.querySelector('[data-field="theta"]');
    this.phase = root.querySelector('[data-field="phase"]');
    this.thetaOutput = root.querySelector('[data-output="theta"]');
    this.phaseOutput = root.querySelector('[data-output="phase"]');
    this.ketOutput = root.querySelector('[data-output="ket"]');
    this.probabilityOutput = root.querySelector('[data-output="basis-probabilities"]');
    this.probabilityBar = root.querySelector('[data-bar="first"]');

    for (const input of [this.basis, this.theta, this.phase]) {
      input.addEventListener("input", () => this.render(true));
    }
    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => this.applyPreset(button.dataset.preset));
    });
    this.render(false);
  }

  get state() {
    return stateFromBasis(this.basis.value, radians(Number(this.theta.value)), radians(Number(this.phase.value)));
  }

  applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    this.basis.value = preset.basis;
    this.theta.value = preset.theta;
    this.phase.value = preset.phase;
    this.render(true);
  }

  render(notify) {
    const theta = Number(this.theta.value);
    const phase = Number(this.phase.value);
    setMath(this.thetaOutput, `\\theta=${theta}^{\\circ}`);
    setMath(this.phaseOutput, `\\phi=${phase}^{\\circ}`);
    const probability0 = Math.cos(radians(theta) / 2) ** 2;
    if (this.probabilityOutput) {
      const [ket0, ket1] = BASIS_KETS[this.basis.value];
      setMath(this.probabilityOutput, `P(${ket0})=${(100 * probability0).toFixed(1)}\\%\\;\\cdot\\;P(${ket1})=${(100 * (1 - probability0)).toFixed(1)}\\%`);
    }
    if (this.probabilityBar) this.probabilityBar.style.width = `${100 * probability0}%`;
    setMath(this.ketOutput, stateToTex(this.state, this.symbol));
    if (notify) this.onChange?.(this);
  }
}

const camera = {azimuth: -0.76, elevation: 0.34};
const sphereViews = [];

class BlochSphere {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.model = {vector: null, color: "#1f77b4", ghosts: [], axis: null, trajectory: []};
    this.drag = null;
    this.installInteraction();
    sphereViews.push(this);
  }

  setModel(model) {
    this.model = {...this.model, ...model};
    this.draw();
  }

  installInteraction() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      this.drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.drag || event.pointerId !== this.drag.id) return;
      camera.azimuth -= (event.clientX - this.drag.x) * 0.008;
      camera.elevation = clamp(camera.elevation + (event.clientY - this.drag.y) * 0.008, -1.18, 1.18);
      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
      sphereViews.forEach((view) => view.draw());
    });
    const endDrag = (event) => {
      if (this.drag?.id === event.pointerId) this.drag = null;
    };
    this.canvas.addEventListener("pointerup", endDrag);
    this.canvas.addEventListener("pointercancel", endDrag);
    this.canvas.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 0.16 : 0.07;
      if (event.key === "ArrowLeft") camera.azimuth += step;
      else if (event.key === "ArrowRight") camera.azimuth -= step;
      else if (event.key === "ArrowUp") camera.elevation = clamp(camera.elevation - step, -1.18, 1.18);
      else if (event.key === "ArrowDown") camera.elevation = clamp(camera.elevation + step, -1.18, 1.18);
      else return;
      event.preventDefault();
      sphereViews.forEach((view) => view.draw());
    });
  }

  geometry() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    return {width, height, cx: width / 2, cy: height / 2 + height * 0.015, radius: Math.min(width, height) * 0.335};
  }

  cameraBasis() {
    const cosElevation = Math.cos(camera.elevation);
    const forward = {
      x: cosElevation * Math.cos(camera.azimuth),
      y: cosElevation * Math.sin(camera.azimuth),
      z: Math.sin(camera.elevation),
    };
    const right = {x: -Math.sin(camera.azimuth), y: Math.cos(camera.azimuth), z: 0};
    const up = {
      x: -Math.sin(camera.elevation) * Math.cos(camera.azimuth),
      y: -Math.sin(camera.elevation) * Math.sin(camera.azimuth),
      z: cosElevation,
    };
    return {forward, right, up};
  }

  project(point) {
    const {cx, cy, radius} = this.geometry();
    const {forward, right, up} = this.cameraBasis();
    return {
      x: cx + radius * (point.x * right.x + point.y * right.y + point.z * right.z),
      y: cy - radius * (point.x * up.x + point.y * up.y + point.z * up.z),
      depth: point.x * forward.x + point.y * forward.y + point.z * forward.z,
    };
  }

  drawLine3d(from, to, color, width = 1, dashed = false, alpha = 1) {
    const a = this.project(from);
    const b = this.project(to);
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dashed ? [5, 6] : []);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  drawPolyline(points, color, width = 1, depthAware = true, dashed = false) {
    for (let index = 1; index < points.length; index += 1) {
      const depth = (this.project(points[index - 1]).depth + this.project(points[index]).depth) / 2;
      const alpha = depthAware ? (depth >= 0 ? 0.55 : 0.16) : 0.76;
      this.drawLine3d(points[index - 1], points[index], color, width, dashed || (depthAware && depth < 0), alpha);
    }
  }

  drawLabel(point, text) {
    const projected = this.project(point);
    const ctx = this.ctx;
    ctx.save();
    ctx.font = `${Math.max(11, this.canvas.width * 0.022)}px Arial, sans-serif`;
    ctx.fillStyle = "#333333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, projected.x, projected.y);
    ctx.restore();
  }

  drawArrow(vector, color, options = {}) {
    if (!vector) return;
    const start = this.project({x: 0, y: 0, z: 0});
    const end = this.project(vector);
    const ctx = this.ctx;
    const width = options.width ?? Math.max(3, this.canvas.width * 0.009);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const head = Math.max(10, this.canvas.width * 0.025);
    ctx.save();
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.setLineDash(options.dashed ? [10, 9] : []);
    const shaftEnd = {
      x: end.x - head * .9 * Math.cos(angle),
      y: end.y - head * .9 * Math.sin(angle),
    };
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(shaftEnd.x, shaftEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - head * Math.cos(angle - 0.43), end.y - head * Math.sin(angle - 0.43));
    ctx.lineTo(end.x - head * Math.cos(angle + 0.43), end.y - head * Math.sin(angle + 0.43));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    const {width, height, cx, cy, radius} = this.geometry();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    const samples = 96;
    for (const z of [-0.5, 0, 0.5]) {
      const latitudeRadius = Math.sqrt(1 - z * z);
      const points = Array.from({length: samples + 1}, (_, index) => {
        const angle = 2 * Math.PI * index / samples;
        return {x: latitudeRadius * Math.cos(angle), y: latitudeRadius * Math.sin(angle), z};
      });
      this.drawPolyline(points, "#b8b8b8", z === 0 ? 1.2 : .8);
    }
    for (const longitude of [0, Math.PI / 3, 2 * Math.PI / 3]) {
      const points = Array.from({length: samples + 1}, (_, index) => {
        const polar = 2 * Math.PI * index / samples;
        return {x: Math.sin(polar) * Math.cos(longitude), y: Math.sin(polar) * Math.sin(longitude), z: Math.cos(polar)};
      });
      this.drawPolyline(points, "#b8b8b8", .8);
    }

    const axes = [
      {key: "x", vector: {x: 1.12, y: 0, z: 0}, positive: "|+⟩", negative: "|−⟩"},
      {key: "y", vector: {x: 0, y: 1.12, z: 0}, positive: "|+y⟩", negative: "|−y⟩"},
      {key: "z", vector: {x: 0, y: 0, z: 1.12}, positive: "|0⟩", negative: "|1⟩"},
    ];
    for (const axis of axes) {
      const negative = {x: -axis.vector.x, y: -axis.vector.y, z: -axis.vector.z};
      const positiveLabel = {x: axis.vector.x * 1.16, y: axis.vector.y * 1.16, z: axis.vector.z * 1.16};
      const negativeLabel = {x: -positiveLabel.x, y: -positiveLabel.y, z: -positiveLabel.z};
      this.drawLine3d(negative, axis.vector, "#555555", 1.2, false, .85);
      this.drawLabel(positiveLabel, axis.positive);
      this.drawLabel(negativeLabel, axis.negative);
    }

    if (this.model.axis) {
      const axis = this.model.axis;
      this.drawLine3d(
        {x: -axis.x * 1.08, y: -axis.y * 1.08, z: -axis.z * 1.08},
        {x: axis.x * 1.08, y: axis.y * 1.08, z: axis.z * 1.08},
        "#777777",
        2,
        true,
        .76,
      );
    }

    if (this.model.trajectory?.length > 1) {
      this.drawPolyline(this.model.trajectory, "#ff7f0e", Math.max(2, width * .004), false, true);
    }
    for (const ghost of this.model.ghosts ?? []) {
      this.drawArrow(ghost.vector, ghost.color ?? "#777777", {width: width * .006, alpha: ghost.alpha ?? .55, dashed: true});
    }
    this.drawArrow(this.model.vector, this.model.color ?? "#1f77b4");

    ctx.save();
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

const view1 = new BlochSphere(document.querySelector("#sphere-1"));
const view2a = new BlochSphere(document.querySelector("#sphere-2a"));
const view2b = new BlochSphere(document.querySelector("#sphere-2b"));
const view2result = new BlochSphere(document.querySelector("#sphere-2result"));
const view3 = new BlochSphere(document.querySelector("#sphere-3"));

let editor1;
let editor2a;
let editor2b;
let editor3;

function updatePanel1() {
  const vector = blochVector(editor1.state);
  view1.setModel({vector, color: "#1f77b4", ghosts: [], axis: null, trajectory: []});
  document.querySelectorAll("#p1-vector [data-coordinate]").forEach((element) => {
    element.textContent = cleanNumber(vector[element.dataset.coordinate]);
  });
  view1.canvas.setAttribute("aria-label", `${t("panel1DynamicLabel")} x ${cleanNumber(vector.x)}, y ${cleanNumber(vector.y)}, z ${cleanNumber(vector.z)}`);
}

const deltaInput = document.querySelector("#delta");
const deltaOutput = document.querySelector("#delta-output");
const resultKet = document.querySelector("#p2-result-ket");
const normalizationOutput = document.querySelector("#p2-normalization");
const interferenceWarning = document.querySelector("#p2-warning");

function updatePanel2() {
  const stateA = editor2a.state;
  const stateB = editor2b.state;
  const vectorA = blochVector(stateA);
  const vectorB = blochVector(stateB);
  const delta = Number(deltaInput.value);
  setMath(deltaOutput, `\\delta=${delta}^{\\circ}`);
  view2a.setModel({vector: vectorA, color: "#1f77b4", ghosts: [], axis: null, trajectory: []});
  view2b.setModel({vector: vectorB, color: "#ff7f0e", ghosts: [], axis: null, trajectory: []});
  try {
    const result = superposeStates(stateA, stateB, radians(delta));
    const resultVector = blochVector(result.state);
    view2result.setModel({
      vector: resultVector,
      color: "#2ca02c",
      ghosts: [
        {vector: vectorA, color: "#1f77b4", alpha: .25},
        {vector: vectorB, color: "#ff7f0e", alpha: .25},
      ],
      axis: null,
      trajectory: [],
    });
    setMath(resultKet, stateToTex(result.state, "\\Psi"));
    normalizationOutput.textContent = `${t("normBefore")} ${cleanNumber(result.unnormalizedNorm)} · ${t("normalizationFactor")} ${cleanNumber(1 / result.unnormalizedNorm)}`;
    interferenceWarning.hidden = true;
    view2result.canvas.setAttribute("aria-label", `${t("resultDynamicLabel")} ${vectorText(resultVector)}`);
  } catch (error) {
    view2result.setModel({vector: null, ghosts: [], axis: null, trajectory: []});
    setMath(resultKet, `|\\Psi\\rangle\\;\\text{${t("undefinedState")}}`);
    normalizationOutput.textContent = t("cannotNormalize");
    interferenceWarning.hidden = false;
    view2result.canvas.setAttribute("aria-label", t("cancellationDynamicLabel"));
  }
}

const gateProgress = document.querySelector("#gate-progress");
const gateProgressOutput = document.querySelector("#gate-progress-output");
const gatePlay = document.querySelector("#gate-play");
const gateKet = document.querySelector("#p3-ket");
const gateOperation = document.querySelector("#gate-operation");
const beforeVectorOutput = document.querySelector("#p3-before-vector");
const afterVectorOutput = document.querySelector("#p3-after-vector");
let selectedGate = "H";
let animationFrame = null;
let renderedGateKetSignature = "";

const GATE_DESCRIPTIONS = {
  en: {
    I: "Identity · no rotation", X: "Pauli X · 180° about x-axis", Y: "Pauli Y · 180° about y-axis",
    Z: "Pauli Z · 180° about z-axis", H: "Hadamard rotation",
    S: "Phase S · 90° about z-axis", T: "Phase T · 45° about z-axis",
  },
  ja: {
    I: "恒等操作 · 回転なし", X: "PAULI X · X軸まわりに180°", Y: "PAULI Y · Y軸まわりに180°",
    Z: "PAULI Z · Z軸まわりに180°", H: "HADAMARD回転",
    S: "位相S · Z軸まわりに90°", T: "位相T · Z軸まわりに45°",
  },
};

function updatePanel3() {
  const inputState = editor3.state;
  const outputState = applyGate(selectedGate, inputState);
  const before = blochVector(inputState);
  const after = blochVector(outputState);
  const progress = Number(gateProgress.value) / 1000;
  const current = interpolateGateBlochVector(selectedGate, inputState, progress);
  const gate = GATES[selectedGate];
  const trajectory = Array.from({length: 49}, (_, index) => (
    interpolateGateBlochVector(selectedGate, inputState, index / 48)
  ));
  view3.setModel({
    vector: current,
    color: "#1f77b4",
    ghosts: [{vector: before, color: "#777777", alpha: .55}],
    axis: gate.angle === 0 ? null : gate.axis,
    trajectory: gate.angle === 0 ? [] : trajectory,
  });
  gateProgressOutput.textContent = `${Math.round(progress * 100)}%`;
  gateOperation.textContent = GATE_DESCRIPTIONS[locale][selectedGate];
  beforeVectorOutput.textContent = vectorText(before);
  afterVectorOutput.textContent = vectorText(after);
  const gateKetSignature = `${selectedGate}:${inputState.map(value => `${value.re},${value.im}`).join(":")}`;
  if (gateKetSignature !== renderedGateKetSignature) {
    renderedGateKetSignature = gateKetSignature;
    setMath(gateKet, `${selectedGate}|\\psi\\rangle \\sim ${stateToTex(outputState, "\\psi'").replace(/^\|\\psi'\\rangle \\sim /, "")}`);
  }
  view3.canvas.setAttribute("aria-label", `${selectedGate} ${t("gateDynamicLabel")} ${Math.round(progress * 100)}%. ${vectorText(current)}`);
}

function stopGateAnimation() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

function playGateAnimation() {
  stopGateAnimation();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || GATES[selectedGate].angle === 0) {
    gateProgress.value = 1000;
    updatePanel3();
    return;
  }
  gateProgress.value = 0;
  const start = performance.now();
  const duration = 1050;
  const tick = (now) => {
    const linear = clamp((now - start) / duration, 0, 1);
    const eased = linear < .5 ? 2 * linear * linear : 1 - ((-2 * linear + 2) ** 2) / 2;
    gateProgress.value = Math.round(1000 * eased);
    updatePanel3();
    if (linear < 1) animationFrame = requestAnimationFrame(tick);
    else animationFrame = null;
  };
  animationFrame = requestAnimationFrame(tick);
}

editor1 = new StateEditor(document.querySelector("#p1-editor"), "\\psi", updatePanel1);
editor2a = new StateEditor(document.querySelector("#p2a-editor"), "\\psi_A", updatePanel2);
editor2b = new StateEditor(document.querySelector("#p2b-editor"), "\\psi_B", updatePanel2);
editor3 = new StateEditor(document.querySelector("#p3-editor"), "\\psi", () => {
  stopGateAnimation();
  gateProgress.value = 1000;
  updatePanel3();
});

deltaInput.addEventListener("input", updatePanel2);
document.querySelectorAll("[data-gate]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedGate = button.dataset.gate;
    document.querySelectorAll("[data-gate]").forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
    playGateAnimation();
  });
});
gateProgress.addEventListener("input", () => {
  stopGateAnimation();
  updatePanel3();
});
gatePlay.addEventListener("click", playGateAnimation);

updatePanel1();
updatePanel2();
updatePanel3();
window.addEventListener("load", () => {
  document.querySelectorAll(".math-value").forEach((element) => {
    if (element.dataset.mathDirty === "true") setMath(element, element.textContent.replace(/^\\\(|\\\)$/g, ""));
  });
});
