import {
  DEFAULT_BOUNDS,
  localShapeBoundaryPoints,
  objectSurfaceSamples,
  pointInMaterial,
  pointInObject,
  sampleDisplayedField,
  sampleDisplayedPotential,
  sampleIntensity,
} from "./physics.mjs";

const TRANSLATIONS = {
  en: {
    title: "Material response to applied fields", fieldTypeLabel: "Field type",
    electricField: "Electric field", magneticField: "Magnetic field", appliedField: "Applied field",
    toolsLabel: "Shape and display controls", addObject: "Add object", circle: "Circle",
    rectangle: "Rectangle", triangle: "Triangle", display: "Display",
    backgroundColor: "Background color", arrows: "Arrows", arrowDensity: "Arrow density",
    arrowDensityLabel: "Field arrow density", low: "Low", medium: "Medium", high: "High",
    inducedOnly: "Induced field only", subtractApplied: "Subtract uniform applied field",
    boundaryColor: "Boundary color", resetShielding: "Reset shielding example", removeAll: "Remove all",
    move: "move", resizeRotate: "resize / rotate", delete: "Delete", duplicate: "Duplicate",
    visualizationLabel: "Field visualization", canvasLabel: "Two-dimensional field distorted by material objects",
    canvasHelp: "Select and drag an object", inspectorLabel: "Selected object settings",
    selectObject: "Select an object", selectObjectHelp: "Click an object on the canvas to edit its material and shape.",
    electricalProperty: "Electrical property", perfectConductor: "Perfect conductor (neutral, isolated)",
    linearDielectric: "Linear dielectric", permeabilityExamples: "Relative permeability examples",
    magneticMaterialNote: "Linear, isotropic magnetic material. Values above one concentrate magnetic flux; real iron depends on field strength and history.",
    makeHollow: "Make hollow", vacuumCavity: "Vacuum cavity inside", wallThickness: "Wall thickness",
    placementShape: "Placement and shape", width: "Width", height: "Height", rotation: "Rotation",
    equalize: "Make width and height equal", noscript: "JavaScript is required for this visualization.",
    recalculating: "Recalculating", approximate: "approximate", converged: "converged",
    solverError: "Solver error", httpRequired: "Open this page through an HTTP server",
    object: "Object", conductor: "Conductor", circleBadge: "Circle / ellipse", rectangleBadge: "Rectangle", triangleBadge: "Triangle",
    conductorNote: "The conductor is equipotential and its total free charge is constrained to zero.",
    dielectricNote: "Treated as a linear, isotropic dielectric including polarization charge.",
    inducedElectricPotential: "Induced electric potential", inducedMagneticPotential: "Induced magnetic potential",
    electricPotential: "Electric potential", magneticPotential: "Magnetic scalar potential",
    inducedElectricField: "Induced electric field", inducedMagneticField: "Induced magnetic flux density",
    magneticFluxDensity: "Magnetic flux density", surfaceCharge: "Surface charge density",
    surfacePole: "Surface pole density", inducedElectricTitle: "Electric field induced by the objects",
    inducedMagneticTitle: "Magnetic field induced by the objects", electricTitle: "Uniform electric field from left to right",
    magneticTitle: "Uniform magnetic field from left to right", highPotential: "High potential",
    lowPotential: "Low potential", fieldEntry: "Field enters", fieldExit: "Field exits",
    negativeInducedPotential: "Negative induced potential", positiveInducedPotential: "Positive induced potential",
    lowPsi: "Low magnetic potential", highPsi: "High magnetic potential", negativeSurface: "Negative surface density",
    positiveSurface: "Positive surface density", electricCanvas: "Two-dimensional electric field distorted by material objects",
    magneticCanvas: "Two-dimensional magnetic field distorted by material objects",
    inducedElectricCanvas: "Two-dimensional electric field induced by material objects",
    inducedMagneticCanvas: "Two-dimensional magnetic field induced by material objects",
    electricModel: "Two-dimensional cross-section · linear dielectric / neutral isolated conductor · insulating top and bottom boundaries",
    magneticModel: "Two-dimensional cross-section · linear isotropic magnetic material · no free current",
  },
  ja: {
    title: "物質を置いて見る場", fieldTypeLabel: "場の種類", electricField: "電場", magneticField: "磁場",
    appliedField: "外部場", toolsLabel: "図形と表示の操作", addObject: "物体を追加", circle: "円",
    rectangle: "四角形", triangle: "三角形", display: "表示", backgroundColor: "背景の色", arrows: "矢印",
    arrowDensity: "矢印密度", arrowDensityLabel: "場の矢印密度", low: "少", medium: "中", high: "多",
    inducedOnly: "誘導された場のみ", subtractApplied: "外部一様場を差し引く", boundaryColor: "境界の色",
    resetShielding: "遮蔽の例に戻す", removeAll: "すべて取り除く", move: "移動", resizeRotate: "拡縮・回転",
    delete: "削除", duplicate: "複製", visualizationLabel: "場の可視化",
    canvasLabel: "物体によって変形する二次元の場", canvasHelp: "物体を選択してドラッグ",
    inspectorLabel: "選択した物体の設定", selectObject: "物体を選択",
    selectObjectHelp: "キャンバス上の物体をクリックすると、材質と形を編集できます。",
    electricalProperty: "電気的性質", perfectConductor: "完全導体（中性・孤立）", linearDielectric: "線形誘電体",
    permeabilityExamples: "比透磁率の例",
    magneticMaterialNote: "線形・等方な磁性体として扱います。1より大きいと磁束が物質へ集まります。鉄の値は磁場強度や履歴でも変わります。",
    makeHollow: "中空にする", vacuumCavity: "内部を真空の空洞にする", wallThickness: "殻の厚さ",
    placementShape: "配置と形", width: "幅", height: "高さ", rotation: "回転", equalize: "縦横を同じにする",
    noscript: "この可視化にはJavaScriptが必要です。", recalculating: "再計算中", approximate: "近似",
    converged: "収束", solverError: "計算エラー", httpRequired: "HTTPサーバーで開いてください",
    object: "物体", conductor: "導体", circleBadge: "円 / 楕円", rectangleBadge: "四角形", triangleBadge: "三角形",
    conductorNote: "導体全体を等電位にし、総自由電荷が0となるよう電位を解きます。",
    dielectricNote: "分極電荷を含む線形・等方誘電体として扱います。",
    inducedElectricPotential: "誘導電位", inducedMagneticPotential: "誘導磁気ポテンシャル",
    electricPotential: "電位", magneticPotential: "磁気スカラーポテンシャル", inducedElectricField: "誘導電場",
    inducedMagneticField: "誘導磁束密度", magneticFluxDensity: "磁束密度", surfaceCharge: "表面電荷密度",
    surfacePole: "表面磁極密度", inducedElectricTitle: "物体によって誘導された電場",
    inducedMagneticTitle: "物体によって誘導された磁場", electricTitle: "左から右へ向かう一様電場",
    magneticTitle: "左から右へ向かう一様磁場", highPotential: "高電位", lowPotential: "低電位",
    fieldEntry: "磁場の入口", fieldExit: "磁場の出口", negativeInducedPotential: "負の誘導ポテンシャル",
    positiveInducedPotential: "正の誘導ポテンシャル", lowPsi: "低い磁気ポテンシャル",
    highPsi: "高い磁気ポテンシャル", negativeSurface: "負の表面密度", positiveSurface: "正の表面密度",
    electricCanvas: "物体によって変形する二次元の電場", magneticCanvas: "物体によって変形する二次元の磁場",
    inducedElectricCanvas: "物体によって誘導された二次元の電場", inducedMagneticCanvas: "物体によって誘導された二次元の磁場",
    electricModel: "奥行き方向に一様な2次元断面 · 線形誘電体／中性孤立導体 · 上下端は絶縁境界",
    magneticModel: "奥行き方向に一様な2次元断面 · 線形・等方磁性体 · 自由電流なし",
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

function typeset(targets) {
  const startup = window.MathJax?.startup?.promise;
  if (!startup) return;
  startup.then(() => {
    window.MathJax.typesetClear(targets);
    return window.MathJax.typesetPromise(targets);
  }).then(() => window.dispatchEvent(new CustomEvent("physics-atlas:mathjax-ready"))).catch(() => {});
}

const byId = id => document.getElementById(id);
const canvas = byId("field-canvas");
const context = canvas.getContext("2d");
const potentialLayer = document.createElement("canvas");
const potentialContext = potentialLayer.getContext("2d");
const BOUNDS = {...DEFAULT_BOUNDS};
const SHAPE_BOUNDARIES = new Map();

function shieldingExample() {
  return [{
    id: 1,
    shape: "rounded-rectangle",
    x: 0,
    y: 0,
    width: 2.7,
    height: 3.5,
    rotation: 0,
    hollow: true,
    wall: 0.24,
    electricKind: "conductor",
    epsilon: 4,
    mu: 50,
  }];
}

const state = {
  mode: "electric",
  objects: shieldingExample(),
  nextId: 2,
  selectedId: 1,
  layers: {potential: true, field: true, surface: true},
  fieldDensity: "medium",
  inducedOnly: false,
  appliedStrength: 1,
  solution: null,
  solutionSerial: 0,
  potentialImageSerial: -1,
  revision: 0,
  requestSequence: 0,
  acceptedSequence: 0,
  solveTimer: null,
  pendingQuality: "full",
  dragging: null,
  pointerWorld: null,
  worker: null,
};

function selectedObject() {
  return state.objects.find(object => object.id === state.selectedId) ?? null;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 0.0005) return "0";
  return Number(value.toFixed(digits)).toString();
}

function formatPermeability(value) {
  if (!Number.isFinite(value)) return "—";
  const digits = value < 2 ? 2 : value < 100 ? 1 : 0;
  return Number(value.toFixed(digits)).toLocaleString(locale === "ja" ? "ja-JP" : "en-US");
}

function normalizedAngle(angle) {
  let degrees = angle * 180 / Math.PI;
  while (degrees > 180) degrees -= 360;
  while (degrees <= -180) degrees += 360;
  return degrees;
}

function viewSize() {
  const rectangle = canvas.getBoundingClientRect();
  return {width: Math.max(1, rectangle.width), height: Math.max(1, rectangle.height)};
}

function worldToScreen(x, y, view = viewSize()) {
  return {
    x: view.width * (x - BOUNDS.xMin) / (BOUNDS.xMax - BOUNDS.xMin),
    y: view.height * (BOUNDS.yMax - y) / (BOUNDS.yMax - BOUNDS.yMin),
  };
}

function screenToWorld(x, y, view = viewSize()) {
  return {
    x: BOUNDS.xMin + x / view.width * (BOUNDS.xMax - BOUNDS.xMin),
    y: BOUNDS.yMax - y / view.height * (BOUNDS.yMax - BOUNDS.yMin),
  };
}

function canvasPoint(event) {
  const rectangle = canvas.getBoundingClientRect();
  return {x: event.clientX - rectangle.left, y: event.clientY - rectangle.top};
}

function resizeCanvas() {
  const view = viewSize();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(view.width * ratio));
  const height = Math.max(1, Math.round(view.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return view;
}

function setSolverStatus(kind, message) {
  const element = byId("solver-state");
  element.dataset.state = kind;
  element.querySelector("span").textContent = message;
}

function scheduleSolve(quality = "full", delay = 80) {
  state.pendingQuality = state.pendingQuality === "full" || quality === "full" ? "full" : "fast";
  window.clearTimeout(state.solveTimer);
  setSolverStatus("working", t("recalculating"));
  state.solveTimer = window.setTimeout(() => {
    const requestedQuality = state.pendingQuality;
    state.pendingQuality = "fast";
    submitSolve(requestedQuality);
  }, delay);
}

function submitSolve(quality) {
  if (!state.worker) return;
  const requestId = ++state.requestSequence;
  const revision = state.revision;
  const highQuality = quality === "full";
  state.worker.postMessage({
    requestId,
    options: {
      mode: state.mode,
      objects: state.objects,
      bounds: BOUNDS,
      nx: 161,
      ny: 103,
      leftPotential: 5 * state.appliedStrength,
      rightPotential: -5 * state.appliedStrength,
      maxIterations: highQuality ? 2200 : 230,
      tolerance: highQuality ? 2.2e-5 : 9e-5,
      revision,
    },
  });
  state.lastRequest = {requestId, revision, quality};
}

function initializeWorker() {
  try {
    state.worker = new Worker(new URL("./solver-worker.mjs", import.meta.url), {type: "module"});
    state.worker.addEventListener("message", event => {
      const {requestId, solution, error} = event.data;
      if (error) {
        setSolverStatus("error", t("solverError"));
        console.error(error);
        return;
      }
      const matchingRevision = state.lastRequest?.revision === state.revision;
      if (!matchingRevision || requestId < state.acceptedSequence) return;
      state.acceptedSequence = requestId;
      state.solution = solution;
      state.solutionSerial += 1;
      state.potentialImageSerial = -1;
      const approximation = solution.residual > solution.tolerance;
      setSolverStatus("ready", `${approximation ? t("approximate") : t("converged")} · ${solution.iterations} iter`);
      byId("grid-readout").textContent = `${solution.nx} × ${solution.ny}`;
      updateProbe();
      render();
    });
    state.worker.addEventListener("error", event => {
      setSolverStatus("error", "solver worker error");
      console.error(event);
    });
    scheduleSolve("full", 0);
  } catch (error) {
    setSolverStatus("error", t("httpRequired"));
    console.error(error);
  }
}

function markPhysicsChanged(quality = "full") {
  state.revision += 1;
  syncInspector();
  render();
  scheduleSolve(quality);
}

function potentialColor(value) {
  const scale = Math.max(0.2, (state.inducedOnly ? 1.35 : 5) * state.appliedStrength);
  const normalized = clamp(value / scale, -1, 1);
  const amount = 0.86 * Math.pow(Math.abs(normalized), 0.72);
  const neutral = [31, 39, 47];
  const target = normalized >= 0 ? [211, 82, 47] : [37, 105, 158];
  return target.map((channel, index) => Math.round(neutral[index] + amount * (channel - neutral[index])));
}

function updatePotentialLayer() {
  const solution = state.solution;
  if (!solution || state.potentialImageSerial === state.solutionSerial) return;
  potentialLayer.width = solution.nx;
  potentialLayer.height = solution.ny;
  const image = potentialContext.createImageData(solution.nx, solution.ny);
  for (let row = 0; row < solution.ny; row += 1) {
    const targetRow = solution.ny - 1 - row;
    for (let column = 0; column < solution.nx; column += 1) {
      const source = row * solution.nx + column;
      const target = 4 * (targetRow * solution.nx + column);
      const x = solution.bounds.xMin + column * solution.dx;
      const y = solution.bounds.yMin + row * solution.dy;
      const displayedPotential = sampleDisplayedPotential(solution, x, y, state.inducedOnly);
      const [red, green, blue] = potentialColor(displayedPotential);
      image.data[target] = red;
      image.data[target + 1] = green;
      image.data[target + 2] = blue;
      image.data[target + 3] = 255;
    }
  }
  potentialContext.putImageData(image, 0, 0);
  state.potentialImageSerial = state.solutionSerial;
}

function drawBackground(view) {
  context.fillStyle = "#172029";
  context.fillRect(0, 0, view.width, view.height);
  if (state.layers.potential && state.solution) {
    updatePotentialLayer();
    context.save();
    context.imageSmoothingEnabled = true;
    context.globalAlpha = 0.96;
    context.drawImage(potentialLayer, 0, 0, view.width, view.height);
    context.restore();
  }

  context.save();
  context.lineWidth = 1;
  for (let x = -4; x <= 4; x += 1) {
    const screen = worldToScreen(x, 0, view);
    context.strokeStyle = x === 0 ? "rgba(235,244,244,.15)" : "rgba(235,244,244,.07)";
    context.beginPath();
    context.moveTo(screen.x, 0);
    context.lineTo(screen.x, view.height);
    context.stroke();
  }
  for (let y = -3; y <= 3; y += 1) {
    const screen = worldToScreen(0, y, view);
    context.strokeStyle = y === 0 ? "rgba(235,244,244,.15)" : "rgba(235,244,244,.07)";
    context.beginPath();
    context.moveTo(0, screen.y);
    context.lineTo(view.width, screen.y);
    context.stroke();
  }

  if (!state.inducedOnly) {
    const edgeWidth = Math.max(8, view.width * 0.012);
    const leftGradient = context.createLinearGradient(0, 0, edgeWidth * 2.5, 0);
    leftGradient.addColorStop(0, state.mode === "electric" ? "rgba(255,123,72,.7)" : "rgba(132,108,196,.7)");
    leftGradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = leftGradient;
    context.fillRect(0, 0, edgeWidth * 2.5, view.height);
    const rightGradient = context.createLinearGradient(view.width, 0, view.width - edgeWidth * 2.5, 0);
    rightGradient.addColorStop(0, state.mode === "electric" ? "rgba(59,139,194,.72)" : "rgba(53,132,139,.72)");
    rightGradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = rightGradient;
    context.fillRect(view.width - edgeWidth * 2.5, 0, edgeWidth * 2.5, view.height);
  }
  context.restore();
}

function drawArrow(x, y, vectorX, vectorY, length, alpha) {
  const magnitude = Math.hypot(vectorX, vectorY);
  if (!Number.isFinite(magnitude) || magnitude < 1e-9) return;
  const ux = vectorX / magnitude;
  const uy = vectorY / magnitude;
  const half = length * 0.38;
  const startX = x - ux * half;
  const startY = y - uy * half;
  const endX = x + ux * (length - half);
  const endY = y + uy * (length - half);
  const head = Math.min(5.5, length * 0.28);
  context.strokeStyle = `rgba(239,247,246,${alpha})`;
  context.fillStyle = `rgba(239,247,246,${alpha})`;
  context.lineWidth = 1.15;
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.stroke();
  context.beginPath();
  context.moveTo(endX, endY);
  context.lineTo(endX - ux * head - uy * head * 0.55, endY - uy * head + ux * head * 0.55);
  context.lineTo(endX - ux * head + uy * head * 0.55, endY - uy * head - ux * head * 0.55);
  context.closePath();
  context.fill();
}

function isInsideElectricConductor(x, y) {
  if (state.mode !== "electric") return false;
  return state.objects.some(object => object.electricKind === "conductor" && pointInMaterial(x, y, object));
}

function drawFieldArrows(view) {
  if (!state.layers.field || !state.solution) return;
  const spacing = {low: 45, medium: 32, high: 24}[state.fieldDensity];
  const reference = Math.max(0.05, state.appliedStrength);
  context.save();
  for (let screenY = spacing * 0.62; screenY < view.height; screenY += spacing) {
    for (let screenX = spacing * 0.62; screenX < view.width; screenX += spacing) {
      const world = screenToWorld(screenX, screenY, view);
      if (!state.inducedOnly && isInsideElectricConductor(world.x, world.y)) continue;
      const field = sampleDisplayedField(state.solution, world.x, world.y, state.inducedOnly);
      const magnitude = Math.hypot(field.x, field.y);
      if (magnitude < reference * 0.008) continue;
      const length = 10 + 14 * Math.tanh(0.58 * magnitude / reference);
      const alpha = 0.42 + 0.42 * Math.tanh(magnitude / reference);
      drawArrow(screenX, screenY, field.x, -field.y, length, alpha);
    }
  }
  context.restore();
}

function screenDimensions(object, view) {
  return {
    width: object.width / (BOUNDS.xMax - BOUNDS.xMin) * view.width,
    height: object.height / (BOUNDS.yMax - BOUNDS.yMin) * view.height,
  };
}

function addShapePath(object, view, scale = 1) {
  const dimensions = screenDimensions(object, view);
  if (!SHAPE_BOUNDARIES.has(object.shape)) {
    SHAPE_BOUNDARIES.set(object.shape, localShapeBoundaryPoints(object.shape, 112));
  }
  const boundary = SHAPE_BOUNDARIES.get(object.shape);
  boundary.forEach((point, index) => {
    const x = scale * dimensions.width * point.u / 2;
    const y = -scale * dimensions.height * point.v / 2;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
}

function objectLabel(object) {
  if (state.mode === "magnetic") {
    const value = object.mu >= 1000 ? `${formatNumber(object.mu / 1000, 1)}k` : formatNumber(object.mu, 1);
    return `μᵣ ${value}`;
  }
  if (object.electricKind === "conductor") return t("conductor");
  return `εᵣ ${formatNumber(object.epsilon, 1)}`;
}

function drawObjects(view) {
  for (const object of state.objects) {
    const center = worldToScreen(object.x, object.y, view);
    const innerScale = clamp(1 - object.wall, 0.35, 0.9);
    context.save();
    context.translate(center.x, center.y);
    context.rotate(-object.rotation);
    context.beginPath();
    addShapePath(object, view);
    if (object.hollow) addShapePath(object, view, innerScale);
    if (state.mode === "magnetic") {
      context.fillStyle = "rgba(137, 116, 190, .35)";
      context.strokeStyle = "rgba(207, 195, 240, .78)";
    } else if (object.electricKind === "conductor") {
      context.fillStyle = "rgba(166, 181, 184, .42)";
      context.strokeStyle = "rgba(226, 236, 236, .84)";
    } else {
      context.fillStyle = "rgba(49, 169, 157, .28)";
      context.strokeStyle = "rgba(153, 231, 217, .78)";
    }
    context.lineWidth = state.selectedId === object.id ? 1.8 : 1.15;
    context.fill("evenodd");
    context.stroke();
    context.fillStyle = "rgba(241,247,245,.84)";
    context.font = "700 10px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const labelY = object.hollow ? -screenDimensions(object, view).height * (1 + innerScale) / 4 : 0;
    context.fillText(objectLabel(object), 0, labelY);
    context.restore();
  }
}

function densityColor(value, scale) {
  const normalized = Math.tanh(value / Math.max(scale, 1e-7));
  const amount = Math.abs(normalized);
  const neutral = [209, 219, 217];
  const target = normalized >= 0 ? [245, 82, 58] : [50, 151, 207];
  const channels = target.map((channel, index) => Math.round(neutral[index] + amount * (channel - neutral[index])));
  return `rgb(${channels[0]} ${channels[1]} ${channels[2]})`;
}

function drawSurfaceDensities(view) {
  if (!state.layers.surface || !state.solution || state.objects.length === 0) return;
  const groups = state.objects.map(object => ({object, samples: objectSurfaceSamples(state.solution, object, 128)}));
  const magnitudes = groups.flatMap(group => group.samples.map(sample => Math.abs(sample.density))).sort((a, b) => a - b);
  const percentile = magnitudes[Math.floor(0.9 * Math.max(0, magnitudes.length - 1))] ?? 1;
  const scale = Math.max(0.04 * state.appliedStrength, percentile * 0.72);
  context.save();
  context.lineCap = "round";
  context.lineWidth = 5;
  for (const group of groups) {
    for (const boundaryName of ["outer", "inner"]) {
      const samples = group.samples.filter(sample => sample.boundary === boundaryName);
      for (let index = 0; index < samples.length; index += 1) {
        const first = samples[index];
        const second = samples[(index + 1) % samples.length];
        const firstScreen = worldToScreen(first.x, first.y, view);
        const secondScreen = worldToScreen(second.x, second.y, view);
        context.strokeStyle = densityColor((first.density + second.density) / 2, scale);
        context.beginPath();
        context.moveTo(firstScreen.x, firstScreen.y);
        context.lineTo(secondScreen.x, secondScreen.y);
        context.stroke();
      }
    }
  }
  context.restore();
}

function rotatedPoint(object, localX, localY) {
  const cosine = Math.cos(object.rotation);
  const sine = Math.sin(object.rotation);
  return {
    x: object.x + cosine * localX - sine * localY,
    y: object.y + sine * localX + cosine * localY,
  };
}

function selectionHandles(object, view) {
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;
  const corners = [
    {name: "nw", sx: -1, sy: 1},
    {name: "ne", sx: 1, sy: 1},
    {name: "se", sx: 1, sy: -1},
    {name: "sw", sx: -1, sy: -1},
  ].map(handle => ({
    ...handle,
    world: rotatedPoint(object, handle.sx * halfWidth, handle.sy * halfHeight),
  }));
  const rotation = {
    name: "rotate",
    world: rotatedPoint(object, 0, halfHeight + 0.48),
  };
  return [...corners, rotation].map(handle => ({...handle, screen: worldToScreen(handle.world.x, handle.world.y, view)}));
}

function drawSelection(view) {
  const object = selectedObject();
  if (!object) return;
  const handles = selectionHandles(object, view);
  const corners = handles.slice(0, 4);
  const topWorld = rotatedPoint(object, 0, object.height / 2);
  const topMiddle = worldToScreen(topWorld.x, topWorld.y, view);
  const rotation = handles[4];
  context.save();
  context.strokeStyle = "rgba(124, 231, 218, .95)";
  context.lineWidth = 1.1;
  context.setLineDash([4, 4]);
  context.beginPath();
  corners.forEach((handle, index) => {
    if (index === 0) context.moveTo(handle.screen.x, handle.screen.y);
    else context.lineTo(handle.screen.x, handle.screen.y);
  });
  context.closePath();
  context.stroke();
  context.setLineDash([]);
  context.beginPath();
  context.moveTo(topMiddle.x, topMiddle.y);
  context.lineTo(rotation.screen.x, rotation.screen.y);
  context.stroke();
  for (const handle of corners) {
    context.fillStyle = "#f7fbf8";
    context.strokeStyle = "#34a79b";
    context.lineWidth = 1.5;
    context.fillRect(handle.screen.x - 4.5, handle.screen.y - 4.5, 9, 9);
    context.strokeRect(handle.screen.x - 4.5, handle.screen.y - 4.5, 9, 9);
  }
  context.beginPath();
  context.arc(rotation.screen.x, rotation.screen.y, 5, 0, 2 * Math.PI);
  context.fillStyle = "#f7fbf8";
  context.fill();
  context.strokeStyle = "#34a79b";
  context.stroke();
  context.restore();
}

function render() {
  const view = resizeCanvas();
  context.clearRect(0, 0, view.width, view.height);
  drawBackground(view);
  drawFieldArrows(view);
  drawObjects(view);
  drawSurfaceDensities(view);
  drawSelection(view);
}

function localPoint(world, object) {
  const dx = world.x - object.x;
  const dy = world.y - object.y;
  const cosine = Math.cos(object.rotation);
  const sine = Math.sin(object.rotation);
  return {x: cosine * dx + sine * dy, y: -sine * dx + cosine * dy};
}

function hitSelectionHandle(screen, view) {
  const object = selectedObject();
  if (!object) return null;
  for (const handle of selectionHandles(object, view)) {
    if (Math.hypot(screen.x - handle.screen.x, screen.y - handle.screen.y) <= 12) return handle;
  }
  return null;
}

function hitObject(world) {
  for (let index = state.objects.length - 1; index >= 0; index -= 1) {
    if (pointInObject(world.x, world.y, state.objects[index])) return state.objects[index];
  }
  return null;
}

function constrainObject(object) {
  const cosine = Math.abs(Math.cos(object.rotation));
  const sine = Math.abs(Math.sin(object.rotation));
  const extentX = cosine * object.width / 2 + sine * object.height / 2;
  const extentY = sine * object.width / 2 + cosine * object.height / 2;
  object.x = clamp(object.x, BOUNDS.xMin + extentX + 0.15, BOUNDS.xMax - extentX - 0.15);
  object.y = clamp(object.y, BOUNDS.yMin + extentY + 0.12, BOUNDS.yMax - extentY - 0.12);
}

function pointerDown(event) {
  if (event.button !== 0) return;
  const screen = canvasPoint(event);
  const world = screenToWorld(screen.x, screen.y);
  const view = viewSize();
  const handle = hitSelectionHandle(screen, view);
  const object = selectedObject();
  if (handle && object) {
    state.dragging = {
      type: handle.name === "rotate" ? "rotate" : "resize",
      handle,
      object,
      original: {...object},
      startWorld: world,
      aspect: object.width / object.height,
    };
  } else {
    const hit = hitObject(world);
    if (!hit) {
      state.selectedId = null;
      state.dragging = null;
      syncInspector();
      render();
      return;
    }
    state.selectedId = hit.id;
    state.dragging = {
      type: "move",
      object: hit,
      original: {...hit},
      startWorld: world,
    };
    syncInspector();
  }
  canvas.setPointerCapture(event.pointerId);
  event.preventDefault();
  render();
}

function updateProbe() {
  if (!state.solution || !state.pointerWorld) {
    byId("probe-output").textContent = "—";
    return;
  }
  const field = sampleDisplayedField(
    state.solution,
    state.pointerWorld.x,
    state.pointerWorld.y,
    state.inducedOnly,
  );
  byId("probe-output").textContent = `(${formatNumber(field.x)}, ${formatNumber(field.y)}) · |${state.mode === "electric" ? "E" : "B"}| ${formatNumber(Math.hypot(field.x, field.y))}`;
}

function pointerMove(event) {
  const screen = canvasPoint(event);
  const world = screenToWorld(screen.x, screen.y);
  state.pointerWorld = world;
  updateProbe();

  if (!state.dragging) {
    const handle = hitSelectionHandle(screen, viewSize());
    if (handle?.name === "rotate") canvas.style.cursor = "grab";
    else if (handle) canvas.style.cursor = "nwse-resize";
    else canvas.style.cursor = hitObject(world) ? "move" : "default";
    return;
  }

  const {object, original, startWorld} = state.dragging;
  if (state.dragging.type === "move") {
    object.x = original.x + world.x - startWorld.x;
    object.y = original.y + world.y - startWorld.y;
  } else if (state.dragging.type === "rotate") {
    object.rotation = Math.atan2(world.y - object.y, world.x - object.x) - Math.PI / 2;
  } else {
    const local = localPoint(world, object);
    let width = clamp(2 * Math.abs(local.x), 0.6, 5.2);
    let height = clamp(2 * Math.abs(local.y), 0.6, 5.2);
    if (event.shiftKey) {
      const factor = Math.max(width / original.width, height / original.height);
      width = clamp(original.width * factor, 0.6, 5.2);
      height = clamp(width / state.dragging.aspect, 0.6, 5.2);
    }
    object.width = width;
    object.height = height;
  }
  constrainObject(object);
  state.revision += 1;
  syncInspector();
  render();
  scheduleSolve("fast", 105);
  event.preventDefault();
}

function pointerUp(event) {
  if (!state.dragging) return;
  state.dragging = null;
  canvas.releasePointerCapture?.(event.pointerId);
  scheduleSolve("full", 25);
  render();
}

function addObject(shape) {
  const offset = 0.22 * (state.objects.length % 5);
  const object = {
    id: state.nextId++,
    shape,
    x: offset,
    y: -offset,
    width: shape === "circle" ? 2 : shape === "rounded-triangle" ? 2.25 : 2.5,
    height: shape === "circle" ? 2 : shape === "rounded-triangle" ? 2.15 : 1.65,
    rotation: 0,
    hollow: false,
    wall: 0.24,
    electricKind: "dielectric",
    epsilon: 4,
    mu: 10,
  };
  state.objects.push(object);
  state.selectedId = object.id;
  markPhysicsChanged("full");
}

function deleteSelected() {
  if (state.selectedId === null) return;
  state.objects = state.objects.filter(object => object.id !== state.selectedId);
  state.selectedId = null;
  markPhysicsChanged("full");
}

function duplicateSelected() {
  const object = selectedObject();
  if (!object) return;
  const copy = {...object, id: state.nextId++, x: object.x + 0.35, y: object.y - 0.35};
  constrainObject(copy);
  state.objects.push(copy);
  state.selectedId = copy.id;
  markPhysicsChanged("full");
}

function syncInspector() {
  const object = selectedObject();
  byId("inspector-empty").hidden = Boolean(object);
  byId("inspector-content").hidden = !object;
  if (!object) return;
  byId("object-name").textContent = `${t("object")} ${object.id}`;
  byId("shape-badge").textContent = {
    circle: t("circleBadge"),
    "rounded-rectangle": t("rectangleBadge"),
    "rounded-triangle": t("triangleBadge"),
  }[object.shape];
  byId("electric-kind").value = object.electricKind;
  byId("epsilon").value = String(object.epsilon);
  byId("epsilon-output").textContent = formatNumber(object.epsilon, 1);
  byId("epsilon-row").hidden = object.electricKind === "conductor";
  byId("electric-material-note").textContent = object.electricKind === "conductor"
    ? t("conductorNote")
    : t("dielectricNote");
  byId("mu-log").value = String(Math.log10(object.mu));
  byId("mu-output").textContent = formatPermeability(object.mu);
  byId("hollow").checked = object.hollow;
  byId("wall-row").hidden = !object.hollow;
  byId("wall").value = String(object.wall);
  byId("wall-output").textContent = `${Math.round(100 * object.wall)}%`;
  byId("object-width").value = object.width.toFixed(2);
  byId("object-height").value = object.height.toFixed(2);
  byId("object-rotation").value = normalizedAngle(object.rotation).toFixed(0);
}

function syncFieldPresentation() {
  const electric = state.mode === "electric";
  const induced = state.inducedOnly;
  byId("potential-layer-name").textContent = induced
    ? electric ? t("inducedElectricPotential") : t("inducedMagneticPotential")
    : electric ? t("electricPotential") : t("magneticPotential");
  byId("field-layer-name").textContent = induced
    ? electric ? t("inducedElectricField") : t("inducedMagneticField")
    : electric ? t("electricField") : t("magneticFluxDensity");
  byId("surface-layer-name").textContent = electric ? t("surfaceCharge") : t("surfacePole");
  byId("field-kicker").textContent = `${electric ? "ELECTROSTATIC POTENTIAL SOLVER" : "MAGNETOSTATIC SCALAR-POTENTIAL SOLVER"}${induced ? " · INDUCED COMPONENT" : ""}`;
  byId("field-title").textContent = induced
    ? electric ? t("inducedElectricTitle") : t("inducedMagneticTitle")
    : electric ? t("electricTitle") : t("magneticTitle");
  byId("left-edge-label").innerHTML = electric ? `<b>＋</b><span>${t("highPotential")}</span>` : `<b>N</b><span>${t("fieldEntry")}</span>`;
  byId("right-edge-label").innerHTML = electric ? `<b>−</b><span>${t("lowPotential")}</span>` : `<b>S</b><span>${t("fieldExit")}</span>`;
  byId("left-edge-label").hidden = induced;
  byId("right-edge-label").hidden = induced;
  byId("potential-low").textContent = induced ? t("negativeInducedPotential") : electric ? t("lowPotential") : t("lowPsi");
  byId("potential-high").textContent = induced ? t("positiveInducedPotential") : electric ? t("highPotential") : t("highPsi");
  byId("surface-negative").textContent = t("negativeSurface");
  byId("surface-positive").textContent = t("positiveSurface");
  byId("probe-label").textContent = `${induced ? "INDUCED " : "POINTER "}${electric ? "E" : "B"}`;
  canvas.setAttribute(
    "aria-label",
    induced
      ? electric ? t("inducedElectricCanvas") : t("inducedMagneticCanvas")
      : electric ? t("electricCanvas") : t("magneticCanvas"),
  );
}

function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  document.querySelectorAll("[data-mode]").forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const electric = mode === "electric";
  byId("electric-material-controls").hidden = !electric;
  byId("magnetic-material-controls").hidden = electric;
  syncFieldPresentation();
  byId("model-equation").textContent = electric
    ? "\\(\\nabla\\cdot(\\varepsilon\\nabla\\phi)=0\\)"
    : "\\(\\nabla\\cdot(\\mu\\nabla\\psi)=0\\)";
  typeset([byId("model-equation")]);
  byId("model-description").textContent = electric
    ? t("electricModel")
    : t("magneticModel");
  markPhysicsChanged("full");
}

function bindObjectInput(id, property, transform = Number) {
  const input = byId(id);
  input.addEventListener("input", () => {
    const object = selectedObject();
    if (!object) return;
    object[property] = transform(input.value, object);
    if (property === "width" || property === "height") constrainObject(object);
    markPhysicsChanged("fast");
  });
  input.addEventListener("change", () => scheduleSolve("full", 20));
}

document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
document.querySelectorAll("[data-add-shape]").forEach(button => {
  button.addEventListener("click", () => addObject(button.dataset.addShape));
});
document.querySelectorAll("[data-field-density]").forEach(button => {
  button.addEventListener("click", () => {
    state.fieldDensity = button.dataset.fieldDensity;
    document.querySelectorAll("[data-field-density]").forEach(candidate => {
      const active = candidate === button;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});
document.querySelectorAll("[data-mu]").forEach(button => {
  button.addEventListener("click", () => {
    const object = selectedObject();
    if (!object) return;
    object.mu = Number(button.dataset.mu);
    markPhysicsChanged("full");
  });
});

byId("show-potential").addEventListener("change", event => { state.layers.potential = event.target.checked; render(); });
byId("show-field").addEventListener("change", event => { state.layers.field = event.target.checked; render(); });
byId("show-induced-only").addEventListener("change", event => {
  state.inducedOnly = event.target.checked;
  state.potentialImageSerial = -1;
  syncFieldPresentation();
  updateProbe();
  render();
});
byId("show-surface").addEventListener("change", event => { state.layers.surface = event.target.checked; render(); });
byId("applied-strength").addEventListener("input", event => {
  state.appliedStrength = Number(event.target.value);
  byId("applied-output").textContent = `${state.appliedStrength.toFixed(2)} ×`;
  markPhysicsChanged("fast");
});
byId("applied-strength").addEventListener("change", () => scheduleSolve("full", 20));
byId("electric-kind").addEventListener("change", event => {
  const object = selectedObject();
  if (!object) return;
  object.electricKind = event.target.value;
  markPhysicsChanged("full");
});
bindObjectInput("epsilon", "epsilon");
bindObjectInput("mu-log", "mu", value => clamp(10 ** Number(value), 0.1, 5000));
byId("hollow").addEventListener("change", event => {
  const object = selectedObject();
  if (!object) return;
  object.hollow = event.target.checked;
  markPhysicsChanged("full");
});
bindObjectInput("wall", "wall");
bindObjectInput("object-width", "width", value => clamp(Number(value) || 0.6, 0.6, 5.2));
bindObjectInput("object-height", "height", value => clamp(Number(value) || 0.6, 0.6, 5.2));
bindObjectInput("object-rotation", "rotation", value => Number(value) * Math.PI / 180);

byId("equalize-size").addEventListener("click", () => {
  const object = selectedObject();
  if (!object) return;
  const size = (object.width + object.height) / 2;
  object.width = size;
  object.height = size;
  constrainObject(object);
  markPhysicsChanged("full");
});
byId("duplicate-object").addEventListener("click", duplicateSelected);
byId("delete-object").addEventListener("click", deleteSelected);
byId("clear-scene").addEventListener("click", () => {
  state.objects = [];
  state.selectedId = null;
  markPhysicsChanged("full");
});
byId("reset-scene").addEventListener("click", () => {
  state.objects = shieldingExample();
  state.nextId = 2;
  state.selectedId = 1;
  markPhysicsChanged("full");
});

canvas.addEventListener("pointerdown", pointerDown);
canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerup", pointerUp);
canvas.addEventListener("pointercancel", pointerUp);
canvas.addEventListener("pointerleave", () => {
  if (!state.dragging) {
    state.pointerWorld = null;
    updateProbe();
  }
});

window.addEventListener("keydown", event => {
  const editing = event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement;
  if (editing) return;
  if ((event.key === "Delete" || event.key === "Backspace") && selectedObject()) {
    event.preventDefault();
    deleteSelected();
  } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d" && selectedObject()) {
    event.preventDefault();
    duplicateSelected();
  } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && selectedObject()) {
    event.preventDefault();
    const object = selectedObject();
    const step = event.shiftKey ? 0.2 : 0.05;
    if (event.key === "ArrowLeft") object.x -= step;
    if (event.key === "ArrowRight") object.x += step;
    if (event.key === "ArrowDown") object.y -= step;
    if (event.key === "ArrowUp") object.y += step;
    constrainObject(object);
    markPhysicsChanged("fast");
    scheduleSolve("full", 150);
  }
});

new ResizeObserver(render).observe(canvas.parentElement);
byId("model-description").textContent = t("electricModel");
syncInspector();
syncFieldPresentation();
render();
initializeWorker();
