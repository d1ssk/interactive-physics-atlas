import {
  clampVector,
  fieldMagnitude,
  lienardWiechertField,
  larmorPower,
} from "./physics.js";

const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const TRANSLATIONS = {
  en: {
    pageTitle: "Retarded Fields of a Moving Charge",
    title: "Retarded fields of a moving charge",
    intro: "Move the point charge and observe changes propagating at a finite speed.",
    viewerLabel: "Electromagnetic field produced by a moving point charge",
    canvasLabel: "Electromagnetic field on an orthographically projected observation plane",
    retardedField: "Retarded field",
    radiationOnly: "Radiation only",
    preparingHistory: "Preparing history…",
    legendLabel: "Display legend",
    electricField: "Electric field",
    magneticField: "Magnetic field",
    radiationStrength: "Radiation strength",
    dragHint: "Drag the charge to move it",
    settingsLabel: "Display and simulation settings",
    observationPlane: "Observation plane",
    planeGroupLabel: "Field observation plane",
    motionPlane: "Motion plane \\(xy\\)",
    perpendicularPlane: "Perpendicular \\(xz\\)",
    planeNoteXY: "Observe the field on the charge's \\(xy\\) motion plane.",
    planeNoteXZ: "Observe the field on the fixed \\(xz\\) plane (\\(y=0\\)), perpendicular to the motion plane.",
    charge: "Charge",
    clearHistory: "Clear history",
    chargeSignLabel: "Charge sign",
    positiveCharge: "Positive",
    negativeCharge: "Negative",
    automaticMotion: "Automatic motion",
    fieldDisplay: "Field display",
    componentGroupLabel: "Displayed field component",
    totalField: "Total field",
    chargeTrail: "Charge trail",
    propagationSpeed: "Propagation speed",
    arrowSensitivity: "Arrow sensitivity",
    currentCharge: "Charge now",
    speed: "Speed",
    acceleration: "Acceleration",
    radiationIndex: "Radiation index",
    sampleStatus: "{count} samples · orthographic",
  },
  ja: {
    pageTitle: "運動する電荷の遅延場",
    title: "運動する電荷の遅延場",
    intro: "点電荷を動かし、場の変化が有限の速さで伝わる様子を観察します。",
    viewerLabel: "運動する点電荷が作る電磁場",
    canvasLabel: "正投影された観測面上の電磁場",
    retardedField: "遅延場",
    radiationOnly: "放射場のみ",
    preparingHistory: "履歴を準備中…",
    legendLabel: "表示凡例",
    electricField: "電場",
    magneticField: "磁場",
    radiationStrength: "放射強度",
    dragHint: "電荷をドラッグして動かす",
    settingsLabel: "表示とシミュレーションの設定",
    observationPlane: "観測平面",
    planeGroupLabel: "場の観測平面",
    motionPlane: "運動面 \\(xy\\)",
    perpendicularPlane: "垂直面 \\(xz\\)",
    planeNoteXY: "電荷が動く \\(xy\\) 平面上で場を観測します。",
    planeNoteXZ: "運動面に垂直な固定 \\(xz\\) 平面（\\(y=0\\)）で場を観測します。",
    charge: "電荷",
    clearHistory: "履歴を消去",
    chargeSignLabel: "電荷の符号",
    positiveCharge: "正電荷",
    negativeCharge: "負電荷",
    automaticMotion: "自動運動",
    fieldDisplay: "場の表示",
    componentGroupLabel: "表示する場の成分",
    totalField: "全場",
    chargeTrail: "電荷の軌跡",
    propagationSpeed: "伝播速度",
    arrowSensitivity: "矢印の感度",
    currentCharge: "現在の電荷",
    speed: "速さ",
    acceleration: "加速度",
    radiationIndex: "放射指標",
    sampleStatus: "{count} サンプル · 正投影",
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
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  window.MathJax?.startup?.promise.then(() => window.MathJax.typesetPromise());
}

const byId = id => document.getElementById(id);
const canvas = byId("field-canvas");
const context = canvas.getContext("2d");
const radiationLayer = document.createElement("canvas");
const radiationContext = radiationLayer.getContext("2d");
const PLANE_RADIUS = 4.6;
const GRID = {columns: 18, rows: 18};
const MAX_HISTORY_SECONDS = 7;
const FIELD_INTERVAL = 1 / 28;

function themeColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

const state = {
  time: 0,
  lastFrame: performance.now(),
  charge: {x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0},
  target: {x: 0, y: 0},
  history: [],
  fieldGrid: [],
  lastHistorySample: -Infinity,
  lastFieldUpdate: -Infinity,
  dragging: false,
  pointerId: null,
  automatic: false,
  chargeSign: 1,
  component: "total",
  fieldPlane: "xy",
};

function propagationSpeed() {
  return Number(byId("wave-speed").value);
}

function dot(left, right) {
  return (left.x ?? 0) * right.x
    + (left.y ?? 0) * right.y
    + (left.z ?? 0) * right.z;
}

function cameraBasis() {
  const azimuth = -72 * Math.PI / 180;
  const elevation = 42 * Math.PI / 180;
  return {
    right: {x: -Math.sin(azimuth), y: Math.cos(azimuth), z: 0},
    up: {
      x: -Math.sin(elevation) * Math.cos(azimuth),
      y: -Math.sin(elevation) * Math.sin(azimuth),
      z: Math.cos(elevation),
    },
  };
}

function planePoint(u, v, plane = state.fieldPlane) {
  return plane === "xy" ? {x: u, y: v, z: 0} : {x: u, y: 0, z: v};
}

function rawProject(point, basis) {
  return {x: dot(point, basis.right), y: -dot(point, basis.up)};
}

function planeWorldBoundary(plane, segments = 96) {
  return Array.from({length: segments}, (_, index) => {
    const angle = 2 * Math.PI * index / segments;
    return planePoint(
      PLANE_RADIUS * Math.cos(angle),
      PLANE_RADIUS * Math.sin(angle),
      plane,
    );
  });
}

function projection(dimensions) {
  const basis = cameraBasis();
  const points = planeWorldBoundary(state.fieldPlane);
  if (state.fieldPlane === "xz") points.push(...planeWorldBoundary("xy"));
  const raw = points.map(point => rawProject(point, basis));
  const minX = Math.min(...raw.map(point => point.x));
  const maxX = Math.max(...raw.map(point => point.x));
  const minY = Math.min(...raw.map(point => point.y));
  const maxY = Math.max(...raw.map(point => point.y));
  const scale = Math.min(
    dimensions.width * 0.92 / (maxX - minX),
    dimensions.height * 0.86 / (maxY - minY),
  );
  return {
    ...basis,
    scale,
    cx: dimensions.width * 0.5 - scale * (minX + maxX) / 2,
    cy: dimensions.height * 0.52 - scale * (minY + maxY) / 2,
  };
}

function project(point, view) {
  const raw = rawProject(point, view);
  return {x: view.cx + view.scale * raw.x, y: view.cy + view.scale * raw.y};
}

function projectVector(vector, view) {
  return {x: dot(vector, view.right), y: -dot(vector, view.up)};
}

function unprojectToMotionPlane(screen, view) {
  const projectedX = (screen.x - view.cx) / view.scale;
  const projectedY = (screen.y - view.cy) / view.scale;
  const a = view.right.x;
  const b = view.right.y;
  const c = -view.up.x;
  const d = -view.up.y;
  const determinant = a * d - b * c;
  return {
    x: (projectedX * d - b * projectedY) / determinant,
    y: (a * projectedY - projectedX * c) / determinant,
  };
}

function resizeCanvas() {
  const rectangle = canvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(rectangle.width * ratio));
  const height = Math.max(1, Math.round(rectangle.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return {width: rectangle.width, height: rectangle.height};
}

function clampToDomain(point, margin = 0.35) {
  const limit = PLANE_RADIUS - margin;
  const distance = Math.hypot(point.x, point.y);
  if (distance <= limit) return {x: point.x, y: point.y};
  const scale = limit / distance;
  return {x: point.x * scale, y: point.y * scale};
}

function resetHistory() {
  const source = state.charge;
  state.history = [{
    t: state.time - MAX_HISTORY_SECONDS,
    x: source.x,
    y: source.y,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
  }];
  state.lastHistorySample = -Infinity;
  recordHistory(true);
  state.lastFieldUpdate = -Infinity;
}

function recordHistory(force = false) {
  if (!force && state.time - state.lastHistorySample < 1 / 60) return;
  state.history.push({t: state.time, ...state.charge});
  state.lastHistorySample = state.time;
  const cutoff = state.time - MAX_HISTORY_SECONDS;
  while (state.history.length > 2 && state.history[1].t < cutoff) state.history.shift();
}

function updateCharge(deltaTime) {
  if (state.automatic) {
    const phase = state.time * 1.3;
    state.target.x = 2.35 * Math.sin(phase);
    state.target.y = 1.05 * Math.sin(phase * 1.73 + 0.35);
  }
  const charge = state.charge;
  const c = propagationSpeed();
  const requestedAcceleration = {
    x: 185 * (state.target.x - charge.x) - 22 * charge.vx,
    y: 185 * (state.target.y - charge.y) - 22 * charge.vy,
  };
  const acceleration = clampVector(requestedAcceleration, 14 * c);
  charge.ax = acceleration.x;
  charge.ay = acceleration.y;
  charge.vx += charge.ax * deltaTime;
  charge.vy += charge.ay * deltaTime;
  const velocity = clampVector({x: charge.vx, y: charge.vy}, 0.72 * c);
  charge.vx = velocity.x;
  charge.vy = velocity.y;
  charge.x += charge.vx * deltaTime;
  charge.y += charge.vy * deltaTime;
  const clamped = clampToDomain(charge);
  if (clamped.x !== charge.x) charge.vx = 0;
  if (clamped.y !== charge.y) charge.vy = 0;
  charge.x = clamped.x;
  charge.y = clamped.y;
}

function recomputeField() {
  const samples = [];
  const c = propagationSpeed();
  const du = 2 * PLANE_RADIUS / GRID.columns;
  const dv = 2 * PLANE_RADIUS / GRID.rows;
  for (let row = 0; row < GRID.rows; row += 1) {
    for (let column = 0; column < GRID.columns; column += 1) {
      const u = -PLANE_RADIUS + (column + 0.5) * du;
      const v = -PLANE_RADIUS + (row + 0.5) * dv;
      if (Math.hypot(u, v) > PLANE_RADIUS - 0.12) continue;
      const point = planePoint(u, v);
      const field = lienardWiechertField(point, state.time, state.history, {
        propagationSpeed: c,
        charge: state.chargeSign,
        softening: 0.16,
      });
      samples.push({row, column, u, v, point, field});
    }
  }
  state.fieldGrid = samples;
  state.lastFieldUpdate = state.time;
  byId("history-status").textContent = t("sampleStatus", {count: state.history.length});
}

function drawBackdrop(dimensions) {
  context.fillStyle = themeColor("--atlas-viz-background", "#ffffff");
  context.fillRect(0, 0, dimensions.width, dimensions.height);
}

function polygon(points, targetContext = context) {
  targetContext.beginPath();
  targetContext.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => targetContext.lineTo(point.x, point.y));
  targetContext.closePath();
}

function drawPlaneSurface(view, plane, options = {}) {
  const boundary = planeWorldBoundary(plane).map(point => project(point, view));
  context.save();
  context.globalAlpha = options.alpha ?? 1;
  polygon(boundary);
  context.fillStyle = themeColor("--atlas-viz-panel-subtle", "#f7f8f6");
  context.fill();
  context.strokeStyle = themeColor("--atlas-viz-border", "#bcc3c0");
  context.lineWidth = options.width ?? 1;
  context.stroke();
  context.restore();
}

function mixChannel(left, right, amount) {
  return Math.round(left + (right - left) * amount);
}

function radiationSpotColor(magnitude, gain) {
  const amount = Math.min(0.72, Math.tanh(magnitude * gain * 5) * 0.72);
  const base = [247, 248, 246];
  const radiation = [224, 207, 231];
  const channels = base.map(
    (value, index) => mixChannel(value, radiation[index], amount),
  );
  return "rgb(" + channels.join(" ") + ")";
}

function projectedPlaneCircle(centerU, centerV, radius, view) {
  return Array.from({length: 32}, (_, index) => {
    const angle = 2 * Math.PI * index / 32;
    return project(
      planePoint(
        centerU + radius * Math.cos(angle),
        centerV + radius * Math.sin(angle),
      ),
      view,
    );
  });
}

function drawRadiationSpots(view) {
  const gain = Number(byId("field-gain").value);
  const spacing = 2 * PLANE_RADIUS / GRID.columns;
  const spotRadius = spacing * 0.68;
  const sortedSamples = [...state.fieldGrid].sort((left, right) => (
    fieldMagnitude(left.field.radiationElectric)
    - fieldMagnitude(right.field.radiationElectric)
  ));
  const rectangle = canvas.getBoundingClientRect();
  const ratio = canvas.width / Math.max(1, rectangle.width);
  if (radiationLayer.width !== canvas.width || radiationLayer.height !== canvas.height) {
    radiationLayer.width = canvas.width;
    radiationLayer.height = canvas.height;
  }
  radiationContext.setTransform(1, 0, 0, 1, 0, 0);
  radiationContext.clearRect(0, 0, radiationLayer.width, radiationLayer.height);
  radiationContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  radiationContext.save();
  polygon(
    planeWorldBoundary(state.fieldPlane).map(point => project(point, view)),
    radiationContext,
  );
  radiationContext.clip();
  for (const sample of sortedSamples) {
    const strength = fieldMagnitude(sample.field.radiationElectric);
    if (strength < 1e-5) continue;
    polygon(
      projectedPlaneCircle(sample.u, sample.v, spotRadius, view),
      radiationContext,
    );
    // Opaque, weakest-to-strongest replacement gives max-like overlap, not additive darkening.
    radiationContext.fillStyle = radiationSpotColor(strength, gain);
    radiationContext.fill();
  }
  radiationContext.restore();
  context.save();
  context.globalAlpha = state.fieldPlane === "xz" ? 0.72 : 1;
  context.drawImage(
    radiationLayer,
    0,
    0,
    radiationLayer.width,
    radiationLayer.height,
    0,
    0,
    rectangle.width,
    rectangle.height,
  );
  context.restore();
}

function drawPlaneGrid(view, plane, muted = false) {
  context.save();
  context.globalAlpha = muted ? 0.42 : state.fieldPlane === "xz" ? 0.76 : 1;
  polygon(planeWorldBoundary(plane).map(point => project(point, view)));
  context.clip();
  const gridColor = themeColor("--atlas-viz-border", "#d0d5d2");
  const axisColor = themeColor("--atlas-viz-muted", "#aab2ae");
  context.lineWidth = 1;
  for (let u = Math.ceil(-PLANE_RADIUS); u <= PLANE_RADIUS; u += 1) {
    const start = project(planePoint(u, -PLANE_RADIUS, plane), view);
    const end = project(planePoint(u, PLANE_RADIUS, plane), view);
    context.strokeStyle = u === 0 ? axisColor : gridColor;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }
  for (let v = Math.ceil(-PLANE_RADIUS); v <= PLANE_RADIUS; v += 1) {
    const start = project(planePoint(-PLANE_RADIUS, v, plane), view);
    const end = project(planePoint(PLANE_RADIUS, v, plane), view);
    context.strokeStyle = v === 0 ? axisColor : gridColor;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }
  context.restore();
}

function drawPlanes(view) {
  if (state.fieldPlane === "xz") {
    drawPlaneSurface(view, "xy", {
      alpha: 0.28,
    });
    drawPlaneGrid(view, "xy", true);
    drawPlaneSurface(view, "xz", {
      alpha: 0.72,
    });
  } else {
    drawPlaneSurface(view, "xy");
  }
  drawRadiationSpots(view);
  drawPlaneGrid(view, state.fieldPlane);
}

function selectedComponents(field) {
  if (state.component === "radiation") {
    return {electric: field.radiationElectric, magnetic: field.radiationMagnetic};
  }
  return {electric: field.electric, magnetic: field.magnetic};
}

function arrowHead(end, unit, size, color) {
  const normal = {x: -unit.y, y: unit.x};
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - unit.x * size + normal.x * size * 0.44,
    end.y - unit.y * size + normal.y * size * 0.44,
  );
  context.lineTo(
    end.x - unit.x * size - normal.x * size * 0.44,
    end.y - unit.y * size - normal.y * size * 0.44,
  );
  context.closePath();
  context.fill();
}

function drawArrow(base, vector, view, gain, color, sensitivity) {
  const magnitude = fieldMagnitude(vector);
  if (magnitude < 1e-7) return;
  const projected = projectVector(vector, view);
  const projectedMagnitude = Math.hypot(projected.x, projected.y);
  if (projectedMagnitude < 1e-10) return;
  const unit = {x: projected.x / projectedMagnitude, y: projected.y / projectedMagnitude};
  const length = 5 + 18 * Math.tanh(Math.log1p(magnitude * gain * sensitivity));
  const start = {x: base.x - unit.x * length * 0.25, y: base.y - unit.y * length * 0.25};
  const end = {x: base.x + unit.x * length * 0.75, y: base.y + unit.y * length * 0.75};
  context.strokeStyle = color;
  context.lineWidth = 1.25;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  arrowHead(end, unit, Math.min(4.5, length * 0.27), color);
}

function drawFields(view) {
  const showElectric = byId("show-electric").checked;
  const showMagnetic = byId("show-magnetic").checked;
  const gain = Number(byId("field-gain").value);
  for (const sample of state.fieldGrid) {
    if (sample.field.distance < 0.3) continue;
    const base = project(sample.point, view);
    const field = selectedComponents(sample.field);
    if (showElectric) drawArrow(base, field.electric, view, gain, "#247a58", 2.4);
    if (showMagnetic) drawArrow(base, field.magnetic, view, gain, "#c76520", 12);
  }
}

function drawTrail(view) {
  if (!byId("show-trail").checked || state.history.length < 2) return;
  const recent = state.history.filter(sample => sample.t >= state.time - 3.5);
  if (recent.length < 2) return;
  context.save();
  context.lineCap = "round";
  context.strokeStyle = "#8d9793";
  context.lineWidth = 1;
  context.setLineDash([2, 3]);
  context.beginPath();
  recent.forEach((sample, index) => {
    const point = project({...sample, z: 0}, view);
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();
  context.restore();
}

function drawCharge(view) {
  const point = project({...state.charge, z: 0}, view);
  const positive = state.chargeSign > 0;
  context.save();
  if (state.fieldPlane === "xz") {
    const sourceOnPlane = project({x: state.charge.x, y: 0, z: 0}, view);
    context.strokeStyle = "#9da5a1";
    context.lineWidth = 1;
    context.setLineDash([3, 3]);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(sourceOnPlane.x, sourceOnPlane.y);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(sourceOnPlane.x, sourceOnPlane.y, 4, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  context.fillStyle = positive ? "#ffffff" : "#30343a";
  context.strokeStyle = positive ? "#247a58" : "#30343a";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(point.x, point.y, state.dragging ? 12 : 10, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = positive ? "#247a58" : "#ffffff";
  context.font = "700 15px ui-sans-serif, system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(positive ? "+" : "−", point.x, point.y - 0.5);
  if (state.dragging) {
    const target = project({...state.target, z: 0}, view);
    context.strokeStyle = "#7f8985";
    context.setLineDash([3, 3]);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(target.x, target.y);
    context.stroke();
  }
  context.restore();
}

function drawAxisLabels(view) {
  const labels = state.fieldPlane === "xy"
    ? [
      {label: "x", point: planePoint(PLANE_RADIUS + 0.22, 0)},
      {label: "y", point: planePoint(0, PLANE_RADIUS + 0.22)},
    ]
    : [
      {label: "x", point: planePoint(PLANE_RADIUS + 0.22, 0)},
      {label: "z", point: planePoint(0, PLANE_RADIUS + 0.22)},
    ];
  context.save();
  context.fillStyle = "#626b67";
  context.font = "italic 12px Georgia, serif";
  for (const item of labels) {
    const point = project(item.point, view);
    context.fillText(item.label, point.x, point.y);
  }
  context.restore();
}

function updateReadout() {
  const charge = state.charge;
  const c = propagationSpeed();
  const speedRatio = Math.hypot(charge.vx, charge.vy) / c;
  const acceleration = Math.hypot(charge.ax, charge.ay);
  const power = larmorPower(state.chargeSign, {x: charge.ax, y: charge.ay}, c);
  byId("speed-readout").textContent = speedRatio.toFixed(2) + " c";
  byId("acceleration-readout").textContent = acceleration.toFixed(2);
  byId("power-readout").textContent = power.toFixed(2);
  byId("speed-fill").style.width = Math.min(100, speedRatio / 0.72 * 100) + "%";
}

function render() {
  const dimensions = resizeCanvas();
  const view = projection(dimensions);
  drawBackdrop(dimensions);
  drawPlanes(view);
  drawTrail(view);
  drawFields(view);
  drawCharge(view);
  drawAxisLabels(view);
}

function animate(now) {
  const deltaTime = Math.min(0.032, Math.max(0, (now - state.lastFrame) / 1000));
  state.lastFrame = now;
  state.time += deltaTime;
  updateCharge(deltaTime);
  recordHistory();
  if (state.time - state.lastFieldUpdate >= FIELD_INTERVAL) recomputeField();
  updateReadout();
  render();
  requestAnimationFrame(animate);
}

function pointerWorld(event) {
  const rectangle = canvas.getBoundingClientRect();
  const dimensions = {width: rectangle.width, height: rectangle.height};
  return clampToDomain(unprojectToMotionPlane({
    x: event.clientX - rectangle.left,
    y: event.clientY - rectangle.top,
  }, projection(dimensions)));
}

function isChargeHit(event) {
  const rectangle = canvas.getBoundingClientRect();
  const dimensions = {width: rectangle.width, height: rectangle.height};
  const screen = project({...state.charge, z: 0}, projection(dimensions));
  return Math.hypot(
    event.clientX - rectangle.left - screen.x,
    event.clientY - rectangle.top - screen.y,
  ) < 28;
}

canvas.addEventListener("pointerdown", event => {
  if (!isChargeHit(event)) return;
  state.automatic = false;
  byId("auto-motion").setAttribute("aria-pressed", "false");
  state.dragging = true;
  state.pointerId = event.pointerId;
  state.target = pointerWorld(event);
  canvas.classList.add("dragging");
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", event => {
  if (!state.dragging || event.pointerId !== state.pointerId) return;
  state.target = pointerWorld(event);
});

function releasePointer(event) {
  if (!state.dragging || event.pointerId !== state.pointerId) return;
  state.target = pointerWorld(event);
  state.dragging = false;
  state.pointerId = null;
  canvas.classList.remove("dragging");
}

canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", releasePointer);

function activateButton(selector, selected) {
  document.querySelectorAll(selector).forEach(candidate => {
    const active = candidate === selected;
    candidate.classList.toggle("active", active);
    candidate.setAttribute("aria-pressed", String(active));
  });
}

document.querySelectorAll(".charge-button").forEach(button => {
  button.addEventListener("click", () => {
    state.chargeSign = Number(button.dataset.charge);
    activateButton(".charge-button", button);
    state.lastFieldUpdate = -Infinity;
  });
});

document.querySelectorAll(".component-button").forEach(button => {
  button.addEventListener("click", () => {
    state.component = button.dataset.component;
    activateButton(".component-button", button);
    byId("state-chip").textContent = state.component === "total"
      ? t("retardedField")
      : t("radiationOnly");
  });
});

document.querySelectorAll(".plane-button").forEach(button => {
  button.addEventListener("click", () => {
    state.fieldPlane = button.dataset.plane;
    activateButton(".plane-button", button);
    byId("plane-note").textContent = state.fieldPlane === "xy"
      ? t("planeNoteXY")
      : t("planeNoteXZ");
    window.MathJax?.typesetPromise?.([byId("plane-note")]);
    state.lastFieldUpdate = -Infinity;
  });
});

byId("auto-motion").addEventListener("click", event => {
  state.automatic = !state.automatic;
  event.currentTarget.setAttribute("aria-pressed", String(state.automatic));
  if (!state.automatic) state.target = {x: state.charge.x, y: state.charge.y};
});

byId("clear-waves").addEventListener("click", () => {
  state.target = {x: state.charge.x, y: state.charge.y};
  Object.assign(state.charge, {vx: 0, vy: 0, ax: 0, ay: 0});
  resetHistory();
});

byId("wave-speed").addEventListener("input", event => {
  byId("wave-speed-output").textContent = Number(event.target.value).toFixed(1);
  resetHistory();
});

byId("field-gain").addEventListener("input", event => {
  byId("field-gain-output").textContent = Number(event.target.value).toFixed(1) + "×";
});

applyLocale();
resetHistory();
recomputeField();
requestAnimationFrame(animate);
