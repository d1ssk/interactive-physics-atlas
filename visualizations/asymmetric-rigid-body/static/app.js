import {
  DEFAULT_INERTIA,
  angularMomentum,
  axisStability,
  invariantGeometry,
  makeInitialState,
  momentumDerivative,
  norm,
  rk4Step,
  rotateVector,
  sampleMomentumTrajectory,
} from "./physics.js";

const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const TRANSLATIONS = {
  en: {
    pageTitle: "Torque-Free Rotation of an Asymmetric Rigid Body",
    title: "Torque-free rotation of an asymmetric rigid body",
    intro: "Rotation is stable near the smallest and largest principal axes, but unstable near the intermediate axis. Compare the body's flips with the geometry of its conserved quantities.",
    inertiaOrderLabel: "Ordering of the principal moments of inertia",
    controlsLabel: "Initial condition and playback controls",
    initialOmega: "Initial angular velocity",
    axisGroupLabel: "Principal axis nearest the initial angular velocity",
    stable: "stable",
    unstable: "unstable",
    initialDisplacement: "Initial displacement from axis",
    timeScale: "Time scale",
    pause: "Pause",
    play: "Play",
    reset: "Reset",
    selectedAxis: "SELECTED AXIS",
    linearStability: "LINEAR STABILITY",
    time: "TIME",
    axisDeparture: "AXIS DEPARTURE",
    bodyFlip: "Body orientation",
    dragHint: "Drag to rotate the view",
    bodyCanvasLabel: "Torque-free asymmetric rigid body viewed in inertial space",
    fixedMomentum: "space-fixed",
    spaceView: "(space view)",
    axisOneTrail: "body-axis 1 trail",
    invariantIntersection: "Intersection of invariants",
    momentumCanvasLabel: "Angular-momentum sphere, energy ellipsoid, and their intersection in the body frame",
    vectorGain: "(length ×2)",
    twoSurfaces: "Two conserved surfaces constrain the motion",
    equationsLabel: "Conserved angular momentum and energy",
    surfaceExplanation: "In the body frame, the tip of angular momentum remains on both surfaces. Their yellow intersection is the Euler orbit, and the purple Euler vector is tangent to it.",
    noscript: "JavaScript is required for this visualization.",
    axisNames: ["Minimum-moment axis · axis 1", "Intermediate axis · axis 2", "Maximum-moment axis · axis 3"],
    stableStatus: "Stable",
    unstableStatus: "Unstable",
  },
  ja: {
    pageTitle: "非対称剛体の自由回転",
    title: "非対称剛体の自由回転",
    intro: "最小・最大慣性主軸まわりの回転は安定ですが、中間軸まわりだけは不安定です。剛体の反転と保存量の幾何を同じ時刻で比較します。",
    inertiaOrderLabel: "主慣性モーメントの大小関係",
    controlsLabel: "初期条件と再生操作",
    initialOmega: "初期角速度",
    axisGroupLabel: "初期角速度を近づける慣性主軸",
    stable: "安定",
    unstable: "不安定",
    initialDisplacement: "主軸からの初期ずれ",
    timeScale: "時間スケール",
    pause: "一時停止",
    play: "再生",
    reset: "初期状態へ",
    selectedAxis: "選択した主軸",
    linearStability: "線形安定性",
    time: "時刻",
    axisDeparture: "主軸からの角度",
    bodyFlip: "剛体の姿勢",
    dragHint: "ドラッグして視点を回転",
    bodyCanvasLabel: "慣性系から見た自由回転する非対称剛体",
    fixedMomentum: "空間に固定された",
    spaceView: "（空間表示）",
    axisOneTrail: "body axis 1 の軌跡",
    invariantIntersection: "保存量曲面の交線",
    momentumCanvasLabel: "body frame の角運動量球面、エネルギー楕円体、およびその交線",
    vectorGain: "（長さを2倍表示）",
    twoSurfaces: "二つの保存量曲面が運動を拘束する",
    equationsLabel: "角運動量とエネルギーの保存式",
    surfaceExplanation: "body frame では角運動量の先端が二つの曲面上に留まります。黄色の交線が Euler 軌道であり、紫色の Euler ベクトルはその接線です。",
    noscript: "この可視化には JavaScript が必要です。",
    axisNames: ["最小慣性主軸 · axis 1", "中間慣性主軸 · axis 2", "最大慣性主軸 · axis 3"],
    stableStatus: "安定",
    unstableStatus: "不安定",
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
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
}

const AXIS_COLORS = ["#f07376", "#54c7bc", "#f0bd53"];
const GOLD = "#f0b84c";
const MAGENTA = "#ef6d91";
const VIOLET = "#b69cff";
const EULER_VECTOR_GAIN = 2;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const dot = (left, right) => left.reduce((sum, value, index) => sum + value * right[index], 0);
const cross = (left, right) => [
  left[1] * right[2] - left[2] * right[1],
  left[2] * right[0] - left[0] * right[2],
  left[0] * right[1] - left[1] * right[0],
];
const unit = (vector) => {
  const length = norm(vector);
  return length > 1e-12 ? vector.map((value) => value / length) : [0, 0, 0];
};
const scale = (vector, factor) => vector.map((value) => value * factor);
class OrbitView {
  constructor(canvas, camera, render) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.camera = {...camera};
    this.initialCamera = {...camera};
    this.render = render;
    this.width = 0;
    this.height = 0;
    this.drag = null;
    this.fitRadius = 2;
    this.installInteraction();
    new ResizeObserver(() => this.draw()).observe(canvas);
  }

  installInteraction() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      this.drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.drag || event.pointerId !== this.drag.id) return;
      this.camera.azimuth -= (event.clientX - this.drag.x) * 0.008;
      this.camera.elevation = clamp(
        this.camera.elevation + (event.clientY - this.drag.y) * 0.008,
        -1.35,
        1.35,
      );
      this.drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
      this.draw();
    });
    const endDrag = (event) => {
      if (event.pointerId === this.drag?.id) this.drag = null;
    };
    this.canvas.addEventListener("pointerup", endDrag);
    this.canvas.addEventListener("pointercancel", endDrag);
    this.canvas.addEventListener("dblclick", () => {
      this.camera = {...this.initialCamera};
      this.draw();
    });
    this.canvas.addEventListener("keydown", (event) => {
      const amount = event.shiftKey ? 0.18 : 0.08;
      if (event.key === "ArrowLeft") this.camera.azimuth += amount;
      else if (event.key === "ArrowRight") this.camera.azimuth -= amount;
      else if (event.key === "ArrowUp") this.camera.elevation = clamp(this.camera.elevation + amount, -1.35, 1.35);
      else if (event.key === "ArrowDown") this.camera.elevation = clamp(this.camera.elevation - amount, -1.35, 1.35);
      else return;
      event.preventDefault();
      this.draw();
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(rect.width * dpr);
    const pixelHeight = Math.round(rect.height * dpr);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    return true;
  }

  cameraBasis() {
    const {azimuth, elevation} = this.camera;
    const forward = [
      Math.cos(elevation) * Math.cos(azimuth),
      Math.cos(elevation) * Math.sin(azimuth),
      Math.sin(elevation),
    ];
    const right = [-Math.sin(azimuth), Math.cos(azimuth), 0];
    const up = cross(forward, right);
    return {forward, right, up};
  }

  project(vector) {
    const {forward, right, up} = this.cameraBasis();
    const pixels = Math.min(this.width, this.height) * 0.405 / this.fitRadius;
    return {
      x: this.width / 2 + dot(vector, right) * pixels,
      y: this.height / 2 - dot(vector, up) * pixels,
      depth: dot(vector, forward),
    };
  }

  draw() {
    if (!this.resize()) return;
    this.ctx.fillStyle = "#0b1411";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.render(this);
  }
}

function path3d(view, points, {color, width = 1, dash = [], alpha = 1, close = false}) {
  if (points.length < 2) return;
  const projected = points.map((point) => view.project(point));
  const ctx = view.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(projected[0].x, projected[0].y);
  for (const point of projected.slice(1)) ctx.lineTo(point.x, point.y);
  if (close) ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.setLineDash(dash);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

function arrowBetween3d(
  view,
  startVector,
  endVector,
  color,
  label,
  {width = 2.6, alpha = 1, labelOffset = [0, 0]} = {},
) {
  const start = view.project(startVector);
  const end = view.project(endVector);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length < 2) return;
  const ux = dx / length;
  const uy = dy / length;
  const head = clamp(length * 0.16, 7, 13);
  const ctx = view.ctx;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x - ux * head * 0.55, end.y - uy * head * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - ux * head - uy * head * 0.5, end.y - uy * head + ux * head * 0.5);
  ctx.lineTo(end.x - ux * head + uy * head * 0.5, end.y - uy * head - ux * head * 0.5);
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = "italic 700 13px Georgia, serif";
    ctx.fillText(label, end.x + 7 + labelOffset[0], end.y - 7 + labelOffset[1]);
  }
  ctx.restore();
}

function arrow3d(view, vector, color, label, options = {}) {
  arrowBetween3d(view, [0, 0, 0], vector, color, label, options);
}

function pointOnEllipsoid(latitude, longitude, radii) {
  const ring = Math.cos(latitude);
  return [
    radii[0] * ring * Math.cos(longitude),
    radii[1] * ring * Math.sin(longitude),
    radii[2] * Math.sin(latitude),
  ];
}

function drawBodyEllipsoid(view, quaternion) {
  const radii = [1.78, 1.29, 0.55];
  const faces = [];
  const latitudes = 12;
  const longitudes = 28;
  for (let latitudeIndex = 0; latitudeIndex < latitudes; latitudeIndex += 1) {
    const latitude0 = -Math.PI / 2 + Math.PI * latitudeIndex / latitudes;
    const latitude1 = -Math.PI / 2 + Math.PI * (latitudeIndex + 1) / latitudes;
    for (let longitudeIndex = 0; longitudeIndex < longitudes; longitudeIndex += 1) {
      const longitude0 = 2 * Math.PI * longitudeIndex / longitudes;
      const longitude1 = 2 * Math.PI * (longitudeIndex + 1) / longitudes;
      const local = [
        pointOnEllipsoid(latitude0, longitude0, radii),
        pointOnEllipsoid(latitude0, longitude1, radii),
        pointOnEllipsoid(latitude1, longitude1, radii),
        pointOnEllipsoid(latitude1, longitude0, radii),
      ];
      const world = local.map((point) => rotateVector(quaternion, point));
      const projected = world.map((point) => view.project(point));
      const normal = unit(cross(
        world[1].map((value, index) => value - world[0][index]),
        world[3].map((value, index) => value - world[0][index]),
      ));
      const center = world.reduce(
        (sum, point) => sum.map((value, index) => value + point[index] / 4),
        [0, 0, 0],
      );
      if (dot(normal, center) < 0) normal.forEach((value, index) => { normal[index] = -value; });
      faces.push({
        projected,
        depth: projected.reduce((sum, point) => sum + point.depth / 4, 0),
        normal,
      });
    }
  }
  const light = unit([-0.5, -0.2, 1]);
  const ctx = view.ctx;
  faces.sort((left, right) => left.depth - right.depth);
  for (const face of faces) {
    const brightness = clamp(0.28 + 0.5 * Math.max(0, dot(face.normal, light)), 0.2, 0.8);
    const green = Math.round(92 + brightness * 68);
    const blue = Math.round(81 + brightness * 58);
    ctx.beginPath();
    ctx.moveTo(face.projected[0].x, face.projected[0].y);
    for (const point of face.projected.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${Math.round(48 + brightness * 35)}, ${green}, ${blue}, .93)`;
    ctx.fill();
    ctx.strokeStyle = "rgba(218, 235, 221, .055)";
    ctx.lineWidth = 0.45;
    ctx.stroke();
  }
}

function planeCircle(normal, radius, count = 96) {
  const n = unit(normal);
  const reference = Math.abs(n[2]) < 0.86 ? [0, 0, 1] : [0, 1, 0];
  const first = unit(cross(n, reference));
  const second = cross(n, first);
  return Array.from({length: count + 1}, (_, index) => {
    const angle = 2 * Math.PI * index / count;
    return first.map((value, component) => radius * (
      value * Math.cos(angle) + second[component] * Math.sin(angle)
    ));
  });
}

function drawWireSurface(view, radii, color, {dash = [], alpha = 0.3, width = 0.8} = {}) {
  const latitudeAngles = [-60, -30, 0, 30, 60].map((angle) => angle * Math.PI / 180);
  for (const latitude of latitudeAngles) {
    const points = Array.from({length: 73}, (_, index) => (
      pointOnEllipsoid(latitude, 2 * Math.PI * index / 72, radii)
    ));
    path3d(view, points, {color, width, dash, alpha});
  }
  for (let index = 0; index < 12; index += 1) {
    const longitude = Math.PI * index / 6;
    const points = Array.from({length: 49}, (_, step) => (
      pointOnEllipsoid(-Math.PI / 2 + Math.PI * step / 48, longitude, radii)
    ));
    path3d(view, points, {color, width, dash, alpha});
  }
}

function drawAxes(view, extent, rotatedQuaternion = null) {
  const labels = ["I₁", "I₂", "I₃"];
  for (let axis = 0; axis < 3; axis += 1) {
    const vector = [0, 0, 0];
    vector[axis] = extent;
    const negative = vector.map((value) => -value);
    const positiveWorld = rotatedQuaternion ? rotateVector(rotatedQuaternion, vector) : vector;
    const negativeWorld = rotatedQuaternion ? rotateVector(rotatedQuaternion, negative) : negative;
    path3d(view, [negativeWorld, positiveWorld], {color: AXIS_COLORS[axis], width: 1, alpha: 0.52});
    const endpoint = view.project(positiveWorld);
    const ctx = view.ctx;
    ctx.save();
    ctx.fillStyle = AXIS_COLORS[axis];
    ctx.font = "italic 700 11px Georgia, serif";
    ctx.globalAlpha = 0.9;
    ctx.fillText(labels[axis], endpoint.x + 5, endpoint.y - 5);
    ctx.restore();
  }
}

const dom = {
  axisButtons: [...document.querySelectorAll("[data-axis]")],
  tilt: document.querySelector("#tilt"),
  tiltOutput: document.querySelector("#tilt-output"),
  speed: document.querySelector("#speed"),
  speedOutput: document.querySelector("#speed-output"),
  playPause: document.querySelector("#play-pause"),
  reset: document.querySelector("#reset"),
  axisName: document.querySelector("#axis-name"),
  stability: document.querySelector("#stability"),
  time: document.querySelector("#time-output"),
  departure: document.querySelector("#departure-output"),
};

const model = {
  axis: 1,
  state: null,
  geometry: null,
  trajectory: [],
  spaceMomentum: [0, 1, 0],
  playing: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  speed: 1,
  markerTrail: [],
  trailClock: 0,
};

let bodyView;
let momentumView;

function renderBody(view) {
  if (!model.state) return;
  view.fitRadius = 2.55;
  const quaternion = model.state.quaternion;
  const bodyAxisOne = rotateVector(quaternion, [1.78, 0, 0]);

  path3d(view, planeCircle(model.spaceMomentum, 2.0), {
    color: "#728078",
    width: 0.8,
    dash: [4, 7],
    alpha: 0.22,
  });
  if (model.markerTrail.length > 1) {
    for (let index = 1; index < model.markerTrail.length; index += 1) {
      path3d(view, [model.markerTrail[index - 1], model.markerTrail[index]], {
        color: GOLD,
        width: 1.2,
        alpha: 0.05 + 0.32 * index / model.markerTrail.length,
      });
    }
  }
  drawBodyEllipsoid(view, quaternion);
  drawAxes(view, 2.05, quaternion);

  const fixedMomentum = scale(unit(model.spaceMomentum), 2.28);
  const omegaSpace = rotateVector(quaternion, model.state.omega);
  const displayedOmega = scale(unit(omegaSpace), 1.92);
  arrow3d(view, fixedMomentum, GOLD, "L", {width: 3.2});
  arrow3d(view, displayedOmega, MAGENTA, "ω", {width: 2.5, alpha: 0.95, labelOffset: [0, 11]});

  const marker = view.project(bodyAxisOne);
  view.ctx.save();
  view.ctx.fillStyle = AXIS_COLORS[0];
  view.ctx.beginPath();
  view.ctx.arc(marker.x, marker.y, 3.6, 0, 2 * Math.PI);
  view.ctx.fill();
  view.ctx.restore();
}

function renderMomentum(view) {
  if (!model.state || !model.geometry) return;
  const radii = model.geometry.ellipsoidRadii;
  const maximumRadius = Math.max(model.geometry.sphereRadius, ...radii);
  view.fitRadius = maximumRadius * 1.24;
  drawAxes(view, maximumRadius * 1.12);
  drawWireSurface(
    view,
    [model.geometry.sphereRadius, model.geometry.sphereRadius, model.geometry.sphereRadius],
    "#80a69b",
    {alpha: 0.25, width: 0.75},
  );
  drawWireSurface(view, radii, MAGENTA, {dash: [3, 5], alpha: 0.35, width: 0.85});

  for (let index = 1; index < model.trajectory.length; index += 1) {
    const depth = view.project(model.trajectory[index]).depth / maximumRadius;
    path3d(view, [model.trajectory[index - 1], model.trajectory[index]], {
      color: depth > 0 ? "#ffd474" : "#9c7936",
      width: depth > 0 ? 2.4 : 1.35,
      alpha: depth > 0 ? 0.95 : 0.48,
    });
  }

  const momentum = angularMomentum(model.state.omega, DEFAULT_INERTIA);
  const eulerVector = momentumDerivative(model.state.omega, DEFAULT_INERTIA);
  const eulerEndpoint = momentum.map(
    (value, index) => value + EULER_VECTOR_GAIN * eulerVector[index],
  );
  arrow3d(view, momentum, GOLD, "L", {width: 3.3});
  arrow3d(view, model.state.omega, MAGENTA, "ω", {width: 2.5, labelOffset: [1, 11]});
  arrowBetween3d(view, momentum, eulerEndpoint, VIOLET, "L̇", {
    width: 2.5,
    labelOffset: [1, -2],
  });
  const endpoint = view.project(momentum);
  view.ctx.save();
  view.ctx.fillStyle = "#fff3c9";
  view.ctx.shadowColor = GOLD;
  view.ctx.shadowBlur = 13;
  view.ctx.beginPath();
  view.ctx.arc(endpoint.x, endpoint.y, 4.3, 0, 2 * Math.PI);
  view.ctx.fill();
  view.ctx.restore();
}

function setPlaybackLabel() {
  dom.playPause.querySelector("[aria-hidden]").textContent = model.playing ? "Ⅱ" : "▶";
  dom.playPause.querySelector("[data-role='play-label']").textContent = t(model.playing ? "pause" : "play");
}

function resetSimulation() {
  model.state = makeInitialState(model.axis, Number(dom.tilt.value), DEFAULT_INERTIA);
  const momentum = angularMomentum(model.state.omega, DEFAULT_INERTIA);
  model.spaceMomentum = rotateVector(model.state.quaternion, momentum);
  model.geometry = invariantGeometry(model.state.omega, DEFAULT_INERTIA);
  model.trajectory = sampleMomentumTrajectory(model.state, DEFAULT_INERTIA, {
    duration: 80,
    dt: 0.015,
    stride: 10,
  });
  model.markerTrail = [];
  model.trailClock = 0;
  updateReadout();
  bodyView?.draw();
  momentumView?.draw();
}

function updateReadout() {
  if (!model.state) return;
  const momentum = angularMomentum(model.state.omega, DEFAULT_INERTIA);
  const momentumLength = norm(momentum);
  const departure = Math.acos(clamp(momentum[model.axis] / momentumLength, -1, 1)) * 180 / Math.PI;
  const stable = axisStability(model.axis, DEFAULT_INERTIA) === "stable";
  dom.axisName.textContent = t("axisNames")[model.axis];
  dom.stability.className = stable ? "stable" : "unstable";
  dom.stability.innerHTML = `<i></i> ${t(stable ? "stableStatus" : "unstableStatus")}`;
  dom.time.textContent = model.state.time.toFixed(2);
  dom.departure.textContent = `${departure.toFixed(1)}°`;
}

dom.axisButtons.forEach((button) => {
  button.addEventListener("click", () => {
    model.axis = Number(button.dataset.axis);
    dom.axisButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    resetSimulation();
  });
});
dom.tilt.addEventListener("input", () => {
  dom.tiltOutput.textContent = `${Number(dom.tilt.value).toFixed(1)}°`;
  resetSimulation();
});
dom.speed.addEventListener("input", () => {
  model.speed = Number(dom.speed.value);
  dom.speedOutput.textContent = `${model.speed.toFixed(model.speed % 1 ? 2 : 1)}×`;
});
dom.playPause.addEventListener("click", () => {
  model.playing = !model.playing;
  setPlaybackLabel();
});
dom.reset.addEventListener("click", resetSimulation);

bodyView = new OrbitView(
  document.querySelector("#body-canvas"),
  {azimuth: -0.78, elevation: 0.35},
  renderBody,
);
momentumView = new OrbitView(
  document.querySelector("#momentum-canvas"),
  {azimuth: -0.8, elevation: 0.42},
  renderMomentum,
);

applyLocale();
setPlaybackLabel();
resetSimulation();

let previousTimestamp = performance.now();
function animate(timestamp) {
  const realDt = Math.min((timestamp - previousTimestamp) / 1000, 0.05);
  previousTimestamp = timestamp;
  if (model.playing) {
    let remaining = realDt * 2.2 * model.speed;
    while (remaining > 1e-12) {
      const step = Math.min(remaining, 0.006);
      model.state = rk4Step(model.state, DEFAULT_INERTIA, step);
      remaining -= step;
    }
    model.trailClock += realDt;
    if (model.trailClock >= 0.035) {
      model.trailClock = 0;
      model.markerTrail.push(rotateVector(model.state.quaternion, [1.78, 0, 0]));
      if (model.markerTrail.length > 180) model.markerTrail.shift();
    }
    updateReadout();
    bodyView.draw();
    momentumView.draw();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
