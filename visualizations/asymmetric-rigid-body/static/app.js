import {
  DEFAULT_INERTIA,
  applySpaceRotation,
  angularMomentum,
  axisStability,
  invariantGeometry,
  inverseRotateVector,
  makeInitialState,
  momentumDerivative,
  norm,
  rk4Step,
  rotateVector,
  rotationVectorBetween,
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
    axisOne: "axis 1",
    axisTwo: "axis 2",
    axisThree: "axis 3",
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
    momentumSphere: "angular momentum sphere",
    energyEllipsoid: "energy ellipsoid",
    eulerOrbit: "intersection / Euler orbit",
    vectorGain: "(length ×2)",
    twoSurfaces: "Two conserved surfaces constrain the motion",
    equationsLabel: "Conserved angular momentum and energy",
    surfaceExplanation: "In the body frame, the tip of angular momentum remains on both surfaces. Their yellow intersection is the Euler orbit, and the purple Euler vector is tangent to it.",
    noscript: "JavaScript is required for this visualization.",
    axisNames: ["Minimum-moment axis · axis 1", "Intermediate axis · axis 2", "Maximum-moment axis · axis 3"],
    stableStatus: "Stable",
    unstableStatus: "Unstable",
    handsOnLabel: "HANDS-ON CHALLENGE",
    handsOnTitle: "Give the body a spin",
    handsOnIntro: "The body starts at rest. Grab any of the six colored points and swing it: the body follows your pointer, then keeps the angular velocity it has when you release. A quick flick can launch a very fast spin.",
    handsOnControlsLabel: "Hands-on rotation controls",
    releaseRule: "Release preserves the instantaneous angular velocity. The center remains fixed.",
    stop: "Stop",
    resetBody: "Reset",
    motion: "MOTION",
    nearestAxis: "NEAREST AXIS",
    alignmentError: "ALIGNMENT ERROR",
    angularSpeed: "ANGULAR SPEED",
    flipTimer: "FLIP TIMER",
    torqueBodyTitle: "Torque playground",
    torqueDragHint: "Point: drag and release · keyboard: 1–6 select, W/A/S/D move, Space releases · elsewhere: rotate view",
    torqueCanvasLabel: "Stationary asymmetric rigid body with six draggable points. Drag and release a point, or use keys 1 through 6, W A S D, and Space, to spin the body. Dragging elsewhere or pressing an arrow key rotates the view.",
    gripPoints: "six grip points",
    grabbedMotion: "body follows pointer",
    handsOnTrail: "body-axis 1 trail",
    handsOnTip: "Tip: curve the grabbed point around the center, then release without slowing down. The readouts preview the release axis and speed. A nearly perfect axis 2 launch can remain apparently steady for a long time.",
    atRest: "At rest",
    holding: "Holding · release to spin",
    spinning: "Spinning",
    stopped: "Stopped",
    waitingForFlip: "t = {time} · waiting",
    flippedAt: "Flip at t = {time}",
    stableAxisSpin: "Stable-axis spin",
    exactAlignment: "exact",
    torqueAxisNames: ["axis 1 · stable", "axis 2 · unstable", "axis 3 · stable"],
  },
  ja: {
    pageTitle: "非対称剛体の自由回転",
    title: "非対称剛体の自由回転",
    intro: "最小・最大慣性主軸まわりの回転は安定ですが、中間軸まわりだけは不安定です。剛体の反転と保存量の幾何を同じ時刻で比較します。",
    inertiaOrderLabel: "主慣性モーメントの大小関係",
    controlsLabel: "初期条件と再生操作",
    initialOmega: "初期角速度",
    axisGroupLabel: "初期角速度を近づける慣性主軸",
    axisOne: "axis 1",
    axisTwo: "axis 2",
    axisThree: "axis 3",
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
    momentumSphere: "角運動量球面",
    energyEllipsoid: "エネルギー楕円体",
    eulerOrbit: "交線 / Euler 軌道",
    vectorGain: "（長さを2倍表示）",
    twoSurfaces: "二つの保存量曲面が運動を拘束する",
    equationsLabel: "角運動量とエネルギーの保存式",
    surfaceExplanation: "body frame では角運動量の先端が二つの曲面上に留まります。黄色の交線が Euler 軌道であり、紫色の Euler ベクトルはその接線です。",
    noscript: "この可視化には JavaScript が必要です。",
    axisNames: ["最小慣性主軸 · axis 1", "中間慣性主軸 · axis 2", "最大慣性主軸 · axis 3"],
    stableStatus: "安定",
    unstableStatus: "不安定",
    handsOnLabel: "操作チャレンジ",
    handsOnTitle: "自分の手で剛体を回す",
    handsOnIntro: "剛体は静止状態から始まります。6 個の色付き点のどれかをつかんで振り回すと、剛体がポインターに追随します。離した瞬間の角速度を保って自由回転へ移ります。",
    handsOnControlsLabel: "手動回転の操作",
    releaseRule: "離した瞬間の角速度を引き継ぎます。重心は固定されています。",
    stop: "停止",
    resetBody: "リセット",
    motion: "運動状態",
    nearestAxis: "最も近い主軸",
    alignmentError: "軸からのずれ",
    angularSpeed: "角速度の大きさ",
    flipTimer: "反転タイマー",
    torqueBodyTitle: "トルク・プレイグラウンド",
    torqueDragHint: "点：ドラッグして離す · キーボード：1–6で選択、W/A/S/Dで移動、Spaceで解放 · それ以外：視点移動",
    torqueCanvasLabel: "ドラッグ可能な6個の点をもつ静止した非対称剛体。点をドラッグして離すか、1から6、W、A、S、D、Spaceキーを使うと剛体を回転させられます。それ以外のドラッグまたは矢印キーで視点を回転できます。",
    gripPoints: "6 個の点",
    grabbedMotion: "剛体がポインターに追随",
    handsOnTrail: "body axis 1 の軌跡",
    handsOnTip: "点を重心のまわりで弧を描くように動かし、減速せずに離してみてください。表示から離した場合の回転軸と速さを確認できます。不安定方向の回転でも、回転軸をaxis 2 に近くできれば、長時間定常を保てます。",
    atRest: "静止中",
    holding: "把持中 · 離すと回転",
    spinning: "回転中",
    stopped: "停止中",
    waitingForFlip: "t = {time} · 反転待ち",
    flippedAt: "t = {time} で反転",
    stableAxisSpin: "安定軸回転",
    exactAlignment: "厳密",
    torqueAxisNames: ["axis 1 · 安定", "axis 2 · 不安定", "axis 3 · 安定"],
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
const BODY_RADII = [1.78, 1.29, 0.55];
const RELEASE_SAMPLE_WINDOW_MS = 90;
const RELEASE_IDLE_CUTOFF_MS = 120;
const MAX_RELEASE_SPEED = 32;
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
  constructor(canvas, camera, render, interaction = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.camera = {...camera};
    this.initialCamera = {...camera};
    this.render = render;
    this.interaction = interaction;
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
      const custom = this.interaction.pointerDown?.(event, this) === true;
      this.drag = {
        id: event.pointerId,
        kind: custom ? "custom" : "camera",
        x: event.clientX,
        y: event.clientY,
      };
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.drag) {
        this.interaction.pointerHover?.(event, this);
        return;
      }
      if (event.pointerId !== this.drag.id) return;
      if (this.drag.kind === "custom") {
        this.interaction.pointerMove?.(event, this);
        return;
      }
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
      if (event.pointerId !== this.drag?.id) return;
      if (this.drag.kind === "custom") this.interaction.pointerUp?.(event, this);
      this.drag = null;
    };
    this.canvas.addEventListener("pointerup", endDrag);
    this.canvas.addEventListener("pointercancel", endDrag);
    this.canvas.addEventListener("pointerleave", () => {
      if (!this.drag) this.interaction.pointerLeave?.(this);
    });
    this.canvas.addEventListener("dblclick", () => {
      this.camera = {...this.initialCamera};
      this.draw();
    });
    this.canvas.addEventListener("keydown", (event) => {
      if (this.interaction.keyDown?.(event, this) === true) {
        event.preventDefault();
        return;
      }
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
  const radii = BODY_RADII;
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

const GRIP_POINTS = BODY_RADII.flatMap((radius, axis) => [-1, 1].map((sign) => {
  const point = [0, 0, 0];
  point[axis] = sign * radius;
  return {axis, sign, point};
}));

function drawGripPoints(view, quaternion, hoveredIndex) {
  const projected = GRIP_POINTS.map((handle, index) => ({
    ...handle,
    index,
    world: rotateVector(quaternion, handle.point),
  })).map((handle) => ({...handle, projected: view.project(handle.world)}));
  projected.sort((left, right) => left.projected.depth - right.projected.depth);
  for (const handle of projected) {
    const hovered = handle.index === hoveredIndex;
    const ctx = view.ctx;
    ctx.save();
    ctx.globalAlpha = handle.projected.depth < 0 ? 0.7 : 1;
    ctx.fillStyle = AXIS_COLORS[handle.axis];
    ctx.strokeStyle = hovered ? "#fff7dd" : "rgba(11, 20, 17, .82)";
    ctx.lineWidth = hovered ? 3 : 2;
    ctx.shadowColor = hovered ? AXIS_COLORS[handle.axis] : "transparent";
    ctx.shadowBlur = hovered ? 15 : 0;
    ctx.beginPath();
    ctx.arc(handle.projected.x, handle.projected.y, hovered ? 8.5 : 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
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
  torqueCanvas: document.querySelector("#torque-canvas"),
  torqueStop: document.querySelector("#torque-stop"),
  torqueReset: document.querySelector("#torque-reset"),
  torqueMotion: document.querySelector("#torque-motion"),
  torqueAxis: document.querySelector("#torque-axis"),
  torqueAlignment: document.querySelector("#torque-alignment"),
  torqueSpeed: document.querySelector("#torque-speed"),
  torqueTimer: document.querySelector("#torque-timer"),
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

const torqueModel = {
  state: {omega: [0, 0, 0], quaternion: [1, 0, 0, 0], time: 0},
  playing: false,
  stoppedAfterLaunch: false,
  hoveredHandle: null,
  drag: null,
  launch: null,
  markerTrail: [],
  trailClock: 0,
};

let bodyView;
let momentumView;
let torqueView;

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

function torqueAlignment(state) {
  const length = norm(state.omega);
  if (length < 1e-8) return null;
  let axis = 0;
  for (let index = 1; index < 3; index += 1) {
    if (Math.abs(state.omega[index]) > Math.abs(state.omega[axis])) axis = index;
  }
  return {
    axis,
    sign: Math.sign(state.omega[axis]) || 1,
    deviation: Math.acos(clamp(Math.abs(state.omega[axis]) / length, -1, 1)) * 180 / Math.PI,
  };
}

function eventCanvasPoint(event, view) {
  const rect = view.canvas.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top};
}

function gripPointAtEvent(event, view) {
  const pointer = eventCanvasPoint(event, view);
  const candidates = GRIP_POINTS.map((handle, index) => {
    const world = rotateVector(torqueModel.state.quaternion, handle.point);
    const projected = view.project(world);
    return {...handle, index, projected, distance: Math.hypot(pointer.x - projected.x, pointer.y - projected.y)};
  }).filter((handle) => handle.distance <= 15);
  candidates.sort((left, right) => left.distance - right.distance || right.projected.depth - left.projected.depth);
  return candidates[0] ?? null;
}

function pointerTargetForGrip(pointer, view, radius, depthSign) {
  const pixels = Math.min(view.width, view.height) * 0.405 / view.fitRadius;
  let screenRight = (pointer.x - view.width / 2) / pixels;
  let screenUp = (view.height / 2 - pointer.y) / pixels;
  const screenRadius = Math.hypot(screenRight, screenUp);
  if (screenRadius > radius * 0.999) {
    const contraction = radius * 0.999 / screenRadius;
    screenRight *= contraction;
    screenUp *= contraction;
  }
  const depth = depthSign * Math.sqrt(Math.max(
    0,
    radius * radius - screenRight * screenRight - screenUp * screenUp,
  ));
  const {forward, right, up} = view.cameraBasis();
  return right.map((value, index) => (
    value * screenRight + up[index] * screenUp + forward[index] * depth
  ));
}

function limitedVector(vector, maximum) {
  const length = norm(vector);
  return length > maximum ? scale(vector, maximum / length) : vector;
}

function estimatedReleaseOmega(drag, timestamp) {
  const recent = drag.velocitySamples.filter(
    (sample) => timestamp - sample.timestamp <= RELEASE_SAMPLE_WINDOW_MS,
  );
  if (!recent.length || timestamp - drag.lastMotionTimestamp > RELEASE_IDLE_CUTOFF_MS) {
    return [0, 0, 0];
  }
  const weighted = recent.reduce((sum, sample, index) => {
    const weight = index + 1;
    return sum.map((component, axis) => component + weight * sample.omegaSpace[axis]);
  }, [0, 0, 0]);
  const totalWeight = recent.length * (recent.length + 1) / 2;
  return limitedVector(weighted.map((component) => component / totalWeight), MAX_RELEASE_SPEED);
}

function updateGrabFromPointer(event, view) {
  const drag = torqueModel.drag;
  const pointer = eventCanvasPoint(event, view);
  const handle = GRIP_POINTS[drag.handleIndex];
  const currentPoint = rotateVector(torqueModel.state.quaternion, handle.point);
  const targetPoint = pointerTargetForGrip(pointer, view, norm(handle.point), drag.depthSign);
  const rotation = rotationVectorBetween(currentPoint, targetPoint);
  const angle = norm(rotation);
  const timestamp = event.timeStamp;
  const dt = Math.max(0, (timestamp - drag.lastTimestamp) / 1000);
  torqueModel.state.quaternion = applySpaceRotation(torqueModel.state.quaternion, rotation);
  drag.currentX = pointer.x;
  drag.currentY = pointer.y;
  drag.lastTimestamp = timestamp;
  if (angle > 1e-5 && dt > 1e-4 && dt < 0.2) {
    const omegaSpace = limitedVector(rotation.map((component) => component / dt), MAX_RELEASE_SPEED);
    drag.velocitySamples.push({timestamp, omegaSpace});
    drag.velocitySamples = drag.velocitySamples.filter(
      (sample) => timestamp - sample.timestamp <= RELEASE_SAMPLE_WINDOW_MS,
    );
    drag.lastMotionTimestamp = timestamp;
  }
  const releaseOmegaSpace = estimatedReleaseOmega(drag, timestamp);
  torqueModel.state.omega = inverseRotateVector(
    torqueModel.state.quaternion,
    releaseOmegaSpace,
  );
}

function beginTorqueDrag(handleIndex, timestamp, view, pointer = null) {
  const handle = GRIP_POINTS[handleIndex];
  const handleWorld = rotateVector(torqueModel.state.quaternion, handle.point);
  const projected = view.project(handleWorld);
  const depth = dot(handleWorld, view.cameraBasis().forward);
  torqueModel.state.omega = [0, 0, 0];
  torqueModel.drag = {
    handleIndex,
    currentX: pointer?.x ?? projected.x,
    currentY: pointer?.y ?? projected.y,
    depthSign: depth < 0 ? -1 : 1,
    lastTimestamp: timestamp,
    lastMotionTimestamp: Number.NEGATIVE_INFINITY,
    velocitySamples: [],
  };
  torqueModel.playing = false;
  torqueModel.stoppedAfterLaunch = false;
  torqueModel.launch = null;
  torqueModel.markerTrail = [];
  torqueModel.trailClock = 0;
  torqueModel.hoveredHandle = handleIndex;
  view.canvas.style.cursor = "grabbing";
  updateTorqueReadout(true);
  view.draw();
}

function finishTorqueDrag(timestamp, cancelled, view) {
  const drag = torqueModel.drag;
  const releaseOmegaSpace = cancelled
    ? [0, 0, 0]
    : estimatedReleaseOmega(drag, timestamp);
  torqueModel.state.omega = inverseRotateVector(
    torqueModel.state.quaternion,
    releaseOmegaSpace,
  );
  const alignment = torqueAlignment(torqueModel.state);
  torqueModel.playing = norm(torqueModel.state.omega) >= 0.03;
  if (!torqueModel.playing) torqueModel.state.omega = [0, 0, 0];
  torqueModel.stoppedAfterLaunch = false;
  torqueModel.launch = torqueModel.playing && alignment ? {
    time: torqueModel.state.time,
    axis: alignment.axis,
    sign: alignment.sign,
    deviation: alignment.deviation,
    flipTime: null,
  } : null;
  torqueModel.drag = null;
  torqueModel.hoveredHandle = null;
  view.canvas.style.cursor = "grab";
  updateTorqueReadout();
  view.draw();
}

function moveTorqueDragFromKeyboard(key, timestamp, fast, view) {
  const drag = torqueModel.drag;
  const {right, up} = view.cameraBasis();
  const direction = {
    a: up,
    d: scale(up, -1),
    w: right,
    s: scale(right, -1),
  }[key];
  const rotation = scale(direction, fast ? 0.13 : 0.06);
  const elapsed = Math.max(1 / 120, Math.min((timestamp - drag.lastTimestamp) / 1000, 0.08));
  const omegaSpace = limitedVector(
    rotation.map((component) => component / elapsed),
    MAX_RELEASE_SPEED,
  );
  torqueModel.state.quaternion = applySpaceRotation(torqueModel.state.quaternion, rotation);
  torqueModel.state.omega = inverseRotateVector(torqueModel.state.quaternion, omegaSpace);
  drag.lastTimestamp = timestamp;
  drag.lastMotionTimestamp = timestamp;
  drag.velocitySamples.push({timestamp, omegaSpace});
  drag.velocitySamples = drag.velocitySamples.filter(
    (sample) => timestamp - sample.timestamp <= RELEASE_SAMPLE_WINDOW_MS,
  );
  updateTorqueReadout(true);
  view.draw();
}

function renderTorqueBody(view) {
  const state = torqueModel.state;
  view.fitRadius = 2.55;
  const bodyAxisOne = rotateVector(state.quaternion, [BODY_RADII[0], 0, 0]);
  const momentumSpace = rotateVector(state.quaternion, angularMomentum(state.omega, DEFAULT_INERTIA));
  const momentumLength = norm(momentumSpace);

  if (momentumLength > 1e-8) {
    path3d(view, planeCircle(momentumSpace, 2.0), {
      color: "#728078",
      width: 0.8,
      dash: [4, 7],
      alpha: 0.22,
    });
  }
  if (torqueModel.markerTrail.length > 1) {
    for (let index = 1; index < torqueModel.markerTrail.length; index += 1) {
      path3d(view, [torqueModel.markerTrail[index - 1], torqueModel.markerTrail[index]], {
        color: GOLD,
        width: 1.2,
        alpha: 0.05 + 0.32 * index / torqueModel.markerTrail.length,
      });
    }
  }

  drawBodyEllipsoid(view, state.quaternion);
  drawAxes(view, 2.05, state.quaternion);

  if (momentumLength > 1e-8) {
    arrow3d(view, scale(unit(momentumSpace), 2.28), GOLD, "L", {width: 3.2});
    const omegaSpace = rotateVector(state.quaternion, state.omega);
    arrow3d(view, scale(unit(omegaSpace), 1.92), MAGENTA, "ω", {
      width: 2.5,
      alpha: 0.95,
      labelOffset: [0, 11],
    });
  }

  drawGripPoints(view, state.quaternion, torqueModel.drag?.handleIndex ?? torqueModel.hoveredHandle);
  const marker = view.project(bodyAxisOne);
  view.ctx.save();
  view.ctx.fillStyle = AXIS_COLORS[0];
  view.ctx.beginPath();
  view.ctx.arc(marker.x, marker.y, 3.6, 0, 2 * Math.PI);
  view.ctx.fill();
  view.ctx.restore();
}

function updateTorqueReadout(holding = false) {
  const alignment = torqueAlignment(torqueModel.state);
  if (holding) dom.torqueMotion.textContent = t("holding");
  else if (torqueModel.playing) dom.torqueMotion.textContent = t("spinning");
  else if (torqueModel.launch || torqueModel.stoppedAfterLaunch) dom.torqueMotion.textContent = t("stopped");
  else dom.torqueMotion.textContent = t("atRest");

  if (!alignment) {
    dom.torqueAxis.textContent = "—";
    dom.torqueAlignment.textContent = "—";
  } else {
    const launchAlignment = !holding && torqueModel.launch ? torqueModel.launch : alignment;
    dom.torqueAxis.textContent = t("torqueAxisNames")[launchAlignment.axis];
    dom.torqueAlignment.textContent = launchAlignment.deviation < 0.05
      ? t("exactAlignment")
      : `${launchAlignment.deviation.toFixed(2)}°`;
  }

  const angularSpeed = norm(torqueModel.state.omega);
  dom.torqueSpeed.textContent = angularSpeed < 1e-3 ? "—" : angularSpeed.toFixed(2);

  const launch = torqueModel.launch;
  if (!launch || holding) dom.torqueTimer.textContent = "—";
  else if (launch.axis !== 1) dom.torqueTimer.textContent = t("stableAxisSpin");
  else if (launch.flipTime !== null) {
    dom.torqueTimer.textContent = t("flippedAt", {time: launch.flipTime.toFixed(2)});
  } else {
    const elapsed = Math.max(0, torqueModel.state.time - launch.time);
    dom.torqueTimer.textContent = t("waitingForFlip", {time: elapsed.toFixed(2)});
  }
}

const torqueInteraction = {
  pointerDown(event, view) {
    const handle = gripPointAtEvent(event, view);
    if (!handle) return false;
    const pointer = eventCanvasPoint(event, view);
    beginTorqueDrag(handle.index, event.timeStamp, view, pointer);
    return true;
  },
  pointerMove(event, view) {
    const coalesced = event.getCoalescedEvents?.() ?? [];
    for (const sample of [...coalesced, event]) {
      const pointer = eventCanvasPoint(sample, view);
      const repeated = sample.timeStamp === torqueModel.drag.lastTimestamp
        && pointer.x === torqueModel.drag.currentX
        && pointer.y === torqueModel.drag.currentY;
      if (!repeated) updateGrabFromPointer(sample, view);
    }
    updateTorqueReadout(true);
    view.draw();
  },
  pointerUp(event, view) {
    const drag = torqueModel.drag;
    const pointer = eventCanvasPoint(event, view);
    if (Math.hypot(pointer.x - drag.currentX, pointer.y - drag.currentY) > 0.25) {
      updateGrabFromPointer(event, view);
    }
    finishTorqueDrag(event.timeStamp, event.type === "pointercancel", view);
  },
  pointerHover(event, view) {
    const handle = gripPointAtEvent(event, view);
    const next = handle?.index ?? null;
    if (next === torqueModel.hoveredHandle) return;
    torqueModel.hoveredHandle = next;
    view.canvas.style.cursor = next === null ? "grab" : "pointer";
    view.draw();
  },
  pointerLeave(view) {
    if (torqueModel.hoveredHandle === null) return;
    torqueModel.hoveredHandle = null;
    view.canvas.style.cursor = "grab";
    view.draw();
  },
  keyDown(event, view) {
    const digit = /^(?:Digit|Numpad)([1-6])$/.exec(event.code);
    if (digit) {
      beginTorqueDrag(Number(digit[1]) - 1, event.timeStamp, view);
      return true;
    }
    if (!torqueModel.drag) return false;
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      moveTorqueDragFromKeyboard(key, event.timeStamp, event.shiftKey, view);
      return true;
    }
    if (event.code === "Space" || event.key === "Enter") {
      finishTorqueDrag(event.timeStamp, false, view);
      return true;
    }
    if (event.key === "Escape") {
      finishTorqueDrag(event.timeStamp, true, view);
      return true;
    }
    return false;
  },
};

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

function resetTorqueSimulation() {
  torqueModel.state = {omega: [0, 0, 0], quaternion: [1, 0, 0, 0], time: 0};
  torqueModel.playing = false;
  torqueModel.stoppedAfterLaunch = false;
  torqueModel.hoveredHandle = null;
  torqueModel.drag = null;
  torqueModel.launch = null;
  torqueModel.markerTrail = [];
  torqueModel.trailClock = 0;
  if (torqueView) {
    torqueView.canvas.style.cursor = "grab";
    torqueView.draw();
  }
  updateTorqueReadout();
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
dom.torqueStop.addEventListener("click", () => {
  torqueModel.playing = false;
  torqueModel.stoppedAfterLaunch = Boolean(torqueModel.launch);
  updateTorqueReadout();
  torqueView.draw();
});
dom.torqueReset.addEventListener("click", resetTorqueSimulation);

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
torqueView = new OrbitView(
  dom.torqueCanvas,
  {azimuth: -0.78, elevation: 0.35},
  renderTorqueBody,
  torqueInteraction,
);

applyLocale();
setPlaybackLabel();
resetSimulation();
resetTorqueSimulation();

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
  if (torqueModel.playing) {
    let remaining = realDt;
    while (remaining > 1e-12) {
      const angularSpeed = Math.max(1, norm(torqueModel.state.omega));
      const step = Math.min(remaining, 0.004, 0.025 / angularSpeed);
      torqueModel.state = rk4Step(torqueModel.state, DEFAULT_INERTIA, step);
      remaining -= step;
    }
    torqueModel.trailClock += realDt;
    if (torqueModel.trailClock >= 0.035) {
      torqueModel.trailClock = 0;
      torqueModel.markerTrail.push(rotateVector(
        torqueModel.state.quaternion,
        [BODY_RADII[0], 0, 0],
      ));
      if (torqueModel.markerTrail.length > 220) torqueModel.markerTrail.shift();
    }
    const launch = torqueModel.launch;
    if (launch?.axis === 1 && launch.flipTime === null) {
      const momentum = angularMomentum(torqueModel.state.omega, DEFAULT_INERTIA);
      const projection = launch.sign * momentum[launch.axis] / norm(momentum);
      if (projection <= -0.98) launch.flipTime = torqueModel.state.time - launch.time;
    }
    updateTorqueReadout();
    torqueView.draw();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
