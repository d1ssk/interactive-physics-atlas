import * as Physics from "./runtime/lorentz-domain-v1.mjs";

const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const MESSAGES = {
  en: {
    title: "Lorentz Transformation",
    lede: "Compare the coordinates that two inertial frames assign to one event, then exchange which frame is drawn orthogonally.",
    eventCoordinates: "Event coordinates",
    timeDilation: "Time dilation",
    lengthContraction: "Length contraction",
    orthogonalDisplay: "Orthogonal display",
    dragHint: "Drag the red event \\(P\\)",
    relativeSpeed: "Relative speed",
    eventSpace: "Spatial coordinate in \\(S\\)",
    eventTime: "Time coordinate in \\(S\\)",
    frameBase: "frame \\(S\\)",
    framePrime: "frame \\(S'\\)",
    lorentzFactor: "Lorentz factor",
    playChange: "Play transformation",
    playing: "Playing…",
    watchAgain: "Play again",
    tiltProperTime: "Tilt the proper-time interval",
    tiltProperLength: "Tilt the proper-length interval",
    timeStepOne: "Mark a proper-time interval \\(\\Delta\\tau\\) in the orthogonal frame. Its simultaneity line meets the other frame's time axis.",
    timeStepTwo: "Tilt the segment while preserving its spacetime interval. Its endpoint follows \\((ct)^2-x^2=(c\\Delta\\tau)^2\\).",
    lengthStepOne: "Tilt a segment of proper length \\(L_0\\) toward the other frame's space axis while preserving its spacetime interval.",
    lengthStepTwo: "Project the moving endpoint along its worldline to select endpoints that are simultaneous in the orthogonal frame.",
    comparison: "Comparison",
    convention: "Convention: \\(c=1\\), coordinates \\((x,ct)\\), metric signature \\((+,-)\\). For positive \\(\\beta\\), \\(S'\\) moves in the positive spatial direction of \\(S\\).",
    visualizationAria: "Interactive Lorentz transformation diagram",
    modeAria: "Displayed construction",
    frameAria: "Frame drawn with orthogonal axes",
    eventCanvasAria: "Spacetime diagram with two inertial coordinate systems and one event",
    timeCanvasAria: "Spacetime diagram showing time dilation as an invariant hyperbolic rotation",
    lengthCanvasAria: "Spacetime diagram showing length contraction as an invariant hyperbolic rotation",
    readoutAria: "Coordinates of the event in both frames",
  },
  ja: {
    title: "Lorentz変換",
    lede: "一つの事象に二つの慣性系が与える座標を比較し、どちらの系を直交表示するかを交換できます。",
    eventCoordinates: "事象の座標",
    timeDilation: "時間の遅れ",
    lengthContraction: "長さの収縮",
    orthogonalDisplay: "直交表示",
    dragHint: "赤い事象 \\(P\\) はドラッグできます",
    relativeSpeed: "相対速度",
    eventSpace: "\\(S\\) における空間座標",
    eventTime: "\\(S\\) における時間座標",
    frameBase: "座標系 \\(S\\)",
    framePrime: "座標系 \\(S'\\)",
    lorentzFactor: "Lorentz 因子",
    playChange: "変化を再生",
    playing: "再生中…",
    watchAgain: "もう一度見る",
    tiltProperTime: "固有時を傾ける",
    tiltProperLength: "固有長を傾ける",
    timeStepOne: "直交表示した系で固有時 \\(\\Delta\\tau\\) を取ります。水平な同時線と、もう一方の時間軸との交点が比較の基準です。",
    timeStepTwo: "時空間隔を保ったまま線分を傾けると、端点は双曲線 \\((ct)^2-x^2=(c\\Delta\\tau)^2\\) 上を動きます。",
    lengthStepOne: "固有長 \\(L_0\\) の線分を、時空間隔を保ったままもう一方の空間軸まで傾けます。",
    lengthStepTwo: "直交表示した系で同時な両端を取るには、運動する端点の世界線に沿って空間軸へ射影します。",
    comparison: "比較",
    convention: "規約：\\(c=1\\)、座標は \\((x,ct)\\)、計量符号は \\((+,-)\\)。正の \\(\\beta\\) では \\(S'\\) が \\(S\\) の正の空間方向へ運動します。",
    visualizationAria: "Lorentz変換のインタラクティブ時空図",
    modeAria: "表示する構成",
    frameAria: "直交表示する座標系",
    eventCanvasAria: "二つの慣性系の座標軸と一つの事象を示す時空図",
    timeCanvasAria: "固有時を保つ双曲線回転から時間の遅れを示す時空図",
    lengthCanvasAria: "固有長を保つ双曲線回転から長さの収縮を示す時空図",
    readoutAria: "両座標系での事象の座標",
  },
};
const t = key => MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key;

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
    const targets = [...pendingMathTargets];
    pendingMathTargets.clear();
    if (!targets.length) return undefined;
    window.MathJax.typesetClear(targets);
    return window.MathJax.typesetPromise(targets);
  }).catch(() => {}).finally(() => {
    mathFlushScheduled = false;
    if (pendingMathTargets.size) flushMath();
  });
}

window.addEventListener("physics-atlas:mathjax-ready", flushMath);

function localizeStaticContent() {
  document.documentElement.lang = LOCALE;
  if (LOCALE === "ja") {
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.innerHTML = t(element.dataset.i18n);
    });
  }
  document.querySelector(".visualization-card").setAttribute("aria-label", t("visualizationAria"));
  document.querySelector(".mode-tabs").setAttribute("aria-label", t("modeAria"));
  document.querySelector(".frame-choice").setAttribute("aria-label", t("frameAria"));
  document.querySelector("#event-readouts").setAttribute("aria-label", t("readoutAria"));
  typeset(document.body);
}

localizeStaticContent();

const canvas = document.querySelector("#diagram");
const context = canvas.getContext("2d");
const controls = {
  beta: document.querySelector("#beta"),
  eventX: document.querySelector("#event-x"),
  eventCt: document.querySelector("#event-ct"),
  progress: document.querySelector("#demo-progress"),
};
const outputs = {
  beta: document.querySelector("#beta-value"),
  eventX: document.querySelector("#event-x-value"),
  eventCt: document.querySelector("#event-ct-value"),
  progress: document.querySelector("#demo-progress-value"),
  baseCoordinate: document.querySelector("#base-coordinate"),
  primeCoordinate: document.querySelector("#prime-coordinate"),
  gamma: document.querySelector("#gamma-value"),
  timeResult: document.querySelector("#time-result"),
  lengthResult: document.querySelector("#length-result"),
};
const sections = {
  eventControls: document.querySelector("#event-controls"),
  demoControls: document.querySelector("#demo-controls"),
  eventReadouts: document.querySelector("#event-readouts"),
  timeExplanation: document.querySelector("#time-explanation"),
  lengthExplanation: document.querySelector("#length-explanation"),
};
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const frameButtons = [...document.querySelectorAll("[data-frame]")];
const replayButton = document.querySelector("#replay-demo");
const progressLabel = document.querySelector("#demo-progress-label");
const dragHint = document.querySelector("#drag-hint");
const legendItems = {
  event: document.querySelector("#legend-event"),
  demo: document.querySelector("#legend-demo"),
  comparison: document.querySelector("#legend-comparison"),
};
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  beta: 0.55,
  event: {x: 1.4, ct: 2.15},
  mode: "event",
  focus: "base",
  viewBlend: 0,
  demoProgress: 0,
};
const inputTargets = {
  beta: state.beta,
  eventX: state.event.x,
  eventCt: state.event.ct,
  demoProgress: state.demoProgress,
};

const AXIS_EXTENT = 3.5;
const DEMO_MAGNITUDE = 2;
const styles = getComputedStyle(document.documentElement);
const COLORS = {
  ink: styles.getPropertyValue("--ink").trim(),
  muted: styles.getPropertyValue("--muted").trim(),
  base: styles.getPropertyValue("--frame-base").trim(),
  prime: styles.getPropertyValue("--frame-prime").trim(),
  event: styles.getPropertyValue("--event").trim(),
  light: styles.getPropertyValue("--light").trim(),
  demo: styles.getPropertyValue("--proper-interval").trim(),
  panel: styles.getPropertyValue("--panel").trim(),
};

let dimensions = {width: 1, height: 1, centerX: 0, centerY: 0, scale: 1};
let draggingEvent = false;
let viewAnimation = null;
let demoAnimation = null;
let pendingDemoStart = null;
let inputSmoothingAnimation = null;
let lastSmoothingTime = 0;

function format(value, digits = 2) {
  const threshold = 0.5 * 10 ** -digits;
  const safe = Math.abs(value) < threshold ? 0 : value;
  return safe.toFixed(digits);
}

function targetBlend(frame = state.focus) {
  return frame === "prime" ? 1 : 0;
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - (-2 * value + 2) ** 3 / 2;
}

function displayCoordinates(event) {
  const prime = Physics.boost(event, state.beta);
  return {
    x: event.x + (prime.x - event.x) * state.viewBlend,
    ct: event.ct + (prime.ct - event.ct) * state.viewBlend,
  };
}

function calculateScale() {
  const factor = Physics.gamma(state.beta);
  const primeEvent = Physics.boost(state.event, state.beta);
  let bound = AXIS_EXTENT * factor;
  if (state.mode === "event") {
    bound = Math.max(
      bound,
      Math.abs(state.event.x),
      Math.abs(state.event.ct),
      Math.abs(primeEvent.x),
      Math.abs(primeEvent.ct),
    );
  } else {
    bound = Math.max(bound, DEMO_MAGNITUDE * factor);
  }
  const padding = dimensions.width < 620 ? 1.22 : 1.16;
  return Math.min(dimensions.width, dimensions.height) / (2 * bound * padding);
}

function physicalToScreen(event) {
  const displayed = displayCoordinates(event);
  return {
    x: dimensions.centerX + displayed.x * dimensions.scale,
    y: dimensions.centerY - displayed.ct * dimensions.scale,
  };
}

function screenToPhysical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const displayedX = (clientX - rect.left - dimensions.centerX) / dimensions.scale;
  const displayedCt = -(clientY - rect.top - dimensions.centerY) / dimensions.scale;
  const factor = Physics.gamma(state.beta);
  const diagonal = 1 - state.viewBlend + state.viewBlend * factor;
  const offDiagonal = -state.viewBlend * factor * state.beta;
  const determinant = diagonal * diagonal - offDiagonal * offDiagonal;
  return {
    x: (diagonal * displayedX - offDiagonal * displayedCt) / determinant,
    ct: (-offDiagonal * displayedX + diagonal * displayedCt) / determinant,
  };
}

function frameToPhysical(frame, point) {
  return Physics.framePoint(frame, point, state.beta);
}

function screenDirection(frame, axis) {
  const origin = physicalToScreen({x: 0, ct: 0});
  const unit = axis === "x" ? {x: 1, ct: 0} : {x: 0, ct: 1};
  const end = physicalToScreen(frameToPhysical(frame, unit));
  const length = Math.hypot(end.x - origin.x, end.y - origin.y) || 1;
  return {x: (end.x - origin.x) / length, y: (end.y - origin.y) / length};
}

function strokeScreenLine(from, to, color, width = 1, dash = [], opacity = 1) {
  context.save();
  context.globalAlpha = opacity;
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.setLineDash(dash);
  context.stroke();
  context.restore();
}

function strokePhysicalLine(from, to, color, width = 1, dash = [], opacity = 1) {
  strokeScreenLine(physicalToScreen(from), physicalToScreen(to), color, width, dash, opacity);
}

function strokePhysicalPolyline(points, color, width = 1, dash = [], opacity = 1) {
  if (points.length < 2) return;
  context.save();
  context.globalAlpha = opacity;
  context.beginPath();
  const start = physicalToScreen(points[0]);
  context.moveTo(start.x, start.y);
  for (const point of points.slice(1)) {
    const screen = physicalToScreen(point);
    context.lineTo(screen.x, screen.y);
  }
  context.strokeStyle = color;
  context.lineWidth = width;
  context.setLineDash(dash);
  context.stroke();
  context.restore();
}

function drawArrowhead(from, to, color, width, opacity) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const size = 8;
  context.save();
  context.globalAlpha = opacity;
  context.beginPath();
  context.moveTo(to.x, to.y);
  context.lineTo(to.x - size * Math.cos(angle - 0.45), to.y - size * Math.sin(angle - 0.45));
  context.moveTo(to.x, to.y);
  context.lineTo(to.x - size * Math.cos(angle + 0.45), to.y - size * Math.sin(angle + 0.45));
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
  context.restore();
}

function drawPoint(point, color, radius, opacity = 1, ring = false) {
  const screen = physicalToScreen(point);
  context.save();
  context.globalAlpha = opacity;
  context.beginPath();
  context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
  if (ring) {
    context.fillStyle = COLORS.panel;
    context.fill();
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    context.stroke();
  } else {
    context.fillStyle = color;
    context.fill();
  }
  context.restore();
}

function roundedRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawLabel(text, screen, color, options = {}) {
  const {
    align = "center",
    font = "700 11px Inter, system-ui, sans-serif",
    opacity = 1,
  } = options;
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.font = font;
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(text, screen.x, screen.y);
  context.restore();
}

function drawPill(text, point, offset, color, opacity = 1) {
  const screen = physicalToScreen(point);
  const center = {x: screen.x + offset.x, y: screen.y + offset.y};
  context.save();
  context.font = "700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
  const width = Math.ceil(context.measureText(text).width) + 14;
  const height = 23;
  roundedRect(center.x - width / 2, center.y - height / 2, width, height, 6);
  context.globalAlpha = 0.94 * opacity;
  context.fillStyle = COLORS.panel;
  context.fill();
  context.globalAlpha = 0.72 * opacity;
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.stroke();
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, center.x, center.y + 0.5);
  context.restore();
}

function drawLightLines() {
  const extent = AXIS_EXTENT * 3.2;
  strokePhysicalLine(
    {x: -extent, ct: -extent},
    {x: extent, ct: extent},
    COLORS.light,
    1.15,
    [7, 7],
    0.45,
  );
  strokePhysicalLine(
    {x: -extent, ct: extent},
    {x: extent, ct: -extent},
    COLORS.light,
    1.15,
    [7, 7],
    0.45,
  );
}

function drawFrameAxes(frame) {
  const color = frame === "base" ? COLORS.base : COLORS.prime;
  const orthogonality = frame === "base" ? 1 - state.viewBlend : state.viewBlend;
  const opacity = 0.62 + orthogonality * 0.3;
  const width = 1.5 + orthogonality * 0.55;

  for (const axis of ["x", "ct"]) {
    const negative = axis === "x"
      ? {x: -AXIS_EXTENT, ct: 0}
      : {x: 0, ct: -AXIS_EXTENT};
    const positive = axis === "x"
      ? {x: AXIS_EXTENT, ct: 0}
      : {x: 0, ct: AXIS_EXTENT};
    const from = physicalToScreen(frameToPhysical(frame, negative));
    const to = physicalToScreen(frameToPhysical(frame, positive));
    strokeScreenLine(from, to, color, width, [], opacity);
    drawArrowhead(from, to, color, width, opacity);

    const direction = screenDirection(frame, axis);
    const perpendicular = {x: -direction.y, y: direction.x};
    for (const value of [-3, -2, -1, 1, 2, 3]) {
      const coordinates = axis === "x" ? {x: value, ct: 0} : {x: 0, ct: value};
      const tick = physicalToScreen(frameToPhysical(frame, coordinates));
      const tickSize = orthogonality > 0.55 ? 4.5 : 3.5;
      strokeScreenLine(
        {x: tick.x - perpendicular.x * tickSize, y: tick.y - perpendicular.y * tickSize},
        {x: tick.x + perpendicular.x * tickSize, y: tick.y + perpendicular.y * tickSize},
        color,
        1,
        [],
        opacity * 0.75,
      );
    }

    const label = frame === "base"
      ? (axis === "x" ? "x" : "ct")
      : (axis === "x" ? "x′" : "ct′");
    const labelOffset = axis === "x"
      ? {x: direction.x * 12 + perpendicular.x * 9, y: direction.y * 12 + perpendicular.y * 9}
      : {x: direction.x * 12 - perpendicular.x * 10, y: direction.y * 12 - perpendicular.y * 10};
    drawLabel(
      label,
      {x: to.x + labelOffset.x, y: to.y + labelOffset.y},
      color,
      {font: "700 13px Georgia, serif", opacity},
    );
  }
}

function drawOrigin() {
  const origin = physicalToScreen({x: 0, ct: 0});
  context.save();
  context.beginPath();
  context.arc(origin.x, origin.y, 2.7, 0, Math.PI * 2);
  context.fillStyle = COLORS.ink;
  context.fill();
  context.restore();
  drawLabel("O", {x: origin.x - 10, y: origin.y + 13}, COLORS.muted, {
    font: "600 10px Inter, system-ui, sans-serif",
  });
}

function drawCoordinateGuide(frame, coordinates, feet) {
  const color = frame === "base" ? COLORS.base : COLORS.prime;
  strokePhysicalLine(state.event, feet.xFoot, color, 1.2, [4, 5], 0.62);
  strokePhysicalLine(state.event, feet.ctFoot, color, 1.2, [4, 5], 0.62);
  drawPoint(feet.xFoot, color, 3.25, 0.9, true);
  drawPoint(feet.ctFoot, color, 3.25, 0.9, true);

  const xDirection = screenDirection(frame, "x");
  const xNormal = {x: -xDirection.y, y: xDirection.x};
  const prime = frame === "prime" ? "′" : "";
  drawPill(
    `x${prime} = ${format(coordinates.x)}`,
    feet.xFoot,
    {x: xNormal.x * 18, y: xNormal.y * 18},
    color,
  );
  drawPill(
    `ct${prime} = ${format(coordinates.ct)}`,
    feet.ctFoot,
    {x: -48, y: 0},
    color,
  );
}

function drawEvent() {
  const coordinates = Physics.coordinatesInFrames(state.event, state.beta);
  const feet = Physics.coordinateGuides(state.event, state.beta);
  drawCoordinateGuide("base", coordinates.base, feet.base);
  drawCoordinateGuide("prime", coordinates.prime, feet.prime);

  const screen = physicalToScreen(state.event);
  context.save();
  context.shadowColor = COLORS.event;
  context.shadowBlur = 11;
  context.beginPath();
  context.arc(screen.x, screen.y, 6.5, 0, Math.PI * 2);
  context.fillStyle = COLORS.event;
  context.fill();
  context.restore();
  drawLabel("P", {x: screen.x + 12, y: screen.y - 12}, COLORS.event, {
    align: "left",
    font: "800 12px Inter, system-ui, sans-serif",
  });
}

function sampleHyperbola(kind, frame, relativeBeta) {
  const points = [];
  for (let index = 0; index <= 36; index += 1) {
    const progress = index / 36;
    const point = kind === "time"
      ? Physics.hyperbolicTimelikePoint(DEMO_MAGNITUDE, relativeBeta, progress)
      : Physics.hyperbolicSpacelikePoint(DEMO_MAGNITUDE, relativeBeta, progress);
    points.push(frameToPhysical(frame, point));
  }
  return points;
}

function drawTimeDemo(frame, opacity) {
  if (opacity <= 0.015) return;
  const relativeBeta = frame === "base" ? state.beta : -state.beta;
  const data = Physics.timeDilationConstruction(relativeBeta, DEMO_MAGNITUDE);
  const animated = Physics.hyperbolicTimelikePoint(
    DEMO_MAGNITUDE,
    relativeBeta,
    state.demoProgress,
  );
  const origin = frameToPhysical(frame, {x: 0, ct: 0});
  const reference = frameToPhysical(frame, data.referenceEnd);
  const intersection = frameToPhysical(frame, data.simultaneousIntersection);
  const movingEnd = frameToPhysical(frame, data.movingClockEnd);
  const animatedEnd = frameToPhysical(frame, animated);
  const coordinateEnd = frameToPhysical(frame, {x: 0, ct: data.coordinateTime});
  const frameColor = frame === "base" ? COLORS.base : COLORS.prime;
  const comparisonOpacity = opacity * (0.16 + 0.84 * state.demoProgress);

  strokePhysicalPolyline(
    sampleHyperbola("time", frame, relativeBeta),
    COLORS.demo,
    1,
    [3, 5],
    opacity * 0.58,
  );
  strokePhysicalLine(origin, reference, frameColor, 4, [], opacity * 0.26);
  strokePhysicalLine(reference, intersection, frameColor, 1.4, [5, 5], opacity * 0.7);
  strokePhysicalLine(origin, animatedEnd, COLORS.demo, 4.2, [], opacity);
  strokePhysicalLine(movingEnd, coordinateEnd, COLORS.event, 1.4, [5, 5], comparisonOpacity);
  strokePhysicalLine(origin, coordinateEnd, COLORS.event, 2.4, [], comparisonOpacity * 0.68);

  drawPoint(reference, frameColor, 3.5, opacity, true);
  drawPoint(intersection, frameColor, 3.5, opacity, true);
  drawPoint(animatedEnd, COLORS.demo, 5, opacity);
  drawPoint(coordinateEnd, COLORS.event, 3.7, comparisonOpacity, true);

  if (opacity > 0.56) {
    const compact = dimensions.width < 560;
    const referenceScreen = physicalToScreen(reference);
    const intersectionScreen = physicalToScreen(intersection);
    const animatedScreen = physicalToScreen(animatedEnd);
    const coordinateScreen = physicalToScreen(coordinateEnd);
    drawLabel("proper time  Δτ", {x: referenceScreen.x - 12, y: referenceScreen.y - 13}, frameColor, {
      align: "right",
      font: "700 10.5px Inter, system-ui, sans-serif",
      opacity,
    });
    if (!compact) {
      drawLabel(
        `simultaneous in ${frame === "base" ? "S" : "S′"}`,
        {x: intersectionScreen.x, y: intersectionScreen.y + 15},
        frameColor,
        {font: "650 9.5px Inter, system-ui, sans-serif", opacity},
      );
      drawLabel("same proper time", {x: animatedScreen.x + 10, y: animatedScreen.y - 13}, COLORS.demo, {
        align: "left",
        font: "700 10px Inter, system-ui, sans-serif",
        opacity,
      });
    }
    drawLabel("Δt = γΔτ", {x: coordinateScreen.x - 11, y: coordinateScreen.y - 12}, COLORS.event, {
      align: "right",
      font: "750 10.5px Inter, system-ui, sans-serif",
      opacity: comparisonOpacity,
    });
  }
}

function drawLengthDemo(frame, opacity) {
  if (opacity <= 0.015) return;
  const relativeBeta = frame === "base" ? state.beta : -state.beta;
  const data = Physics.lengthContractionConstruction(relativeBeta, DEMO_MAGNITUDE);
  const animated = Physics.hyperbolicSpacelikePoint(
    DEMO_MAGNITUDE,
    relativeBeta,
    state.demoProgress,
  );
  const origin = frameToPhysical(frame, {x: 0, ct: 0});
  const reference = frameToPhysical(frame, data.referenceEnd);
  const restEnd = frameToPhysical(frame, data.movingRestEnd);
  const animatedEnd = frameToPhysical(frame, animated);
  const simultaneousEnd = frameToPhysical(frame, data.simultaneousEndpoint);
  const frameColor = frame === "base" ? COLORS.base : COLORS.prime;
  const comparisonOpacity = opacity * (0.16 + 0.84 * state.demoProgress);

  strokePhysicalPolyline(
    sampleHyperbola("length", frame, relativeBeta),
    COLORS.demo,
    1,
    [3, 5],
    opacity * 0.58,
  );
  strokePhysicalLine(origin, reference, frameColor, 4, [], opacity * 0.26);
  strokePhysicalLine(origin, animatedEnd, COLORS.demo, 4.2, [], opacity);
  strokePhysicalLine(restEnd, simultaneousEnd, COLORS.event, 1.4, [5, 5], comparisonOpacity);
  strokePhysicalLine(origin, simultaneousEnd, COLORS.event, 3.1, [], comparisonOpacity);

  drawPoint(reference, frameColor, 3.5, opacity, true);
  drawPoint(animatedEnd, COLORS.demo, 5, opacity);
  drawPoint(simultaneousEnd, COLORS.event, 4, comparisonOpacity, true);

  if (opacity > 0.56) {
    const compact = dimensions.width < 560;
    const referenceScreen = physicalToScreen(reference);
    const animatedScreen = physicalToScreen(animatedEnd);
    const simultaneousScreen = physicalToScreen(simultaneousEnd);
    drawLabel(compact ? "L₀" : "proper length  L₀", {
      x: referenceScreen.x + 5,
      y: referenceScreen.y - 16,
    }, frameColor, {
      align: compact ? "center" : "left",
      font: "700 10.5px Inter, system-ui, sans-serif",
      opacity,
    });
    if (!compact) {
      drawLabel("same proper length", {x: animatedScreen.x + 10, y: animatedScreen.y - 13}, COLORS.demo, {
        align: "left",
        font: "700 10px Inter, system-ui, sans-serif",
        opacity,
      });
    }
    drawLabel("L = L₀/γ", {x: simultaneousScreen.x, y: simultaneousScreen.y + 17}, COLORS.event, {
      font: "750 10.5px Inter, system-ui, sans-serif",
      opacity: comparisonOpacity,
    });
  }
}

function draw() {
  dimensions.scale = calculateScale();
  context.clearRect(0, 0, dimensions.width, dimensions.height);
  drawLightLines();
  drawFrameAxes("base");
  drawFrameAxes("prime");
  drawOrigin();

  if (state.mode === "event") {
    drawEvent();
    return;
  }

  const baseOpacity = (1 - state.viewBlend) ** 1.45;
  const primeOpacity = state.viewBlend ** 1.45;
  if (state.mode === "time") {
    drawTimeDemo("base", baseOpacity);
    drawTimeDemo("prime", primeOpacity);
  } else {
    drawLengthDemo("base", baseOpacity);
    drawLengthDemo("prime", primeOpacity);
  }
}

function updateMath(element, latex) {
  if (element.dataset.latex === latex) return;
  if (window.MathJax?.typesetClear) window.MathJax.typesetClear([element]);
  element.dataset.latex = latex;
  element.textContent = `\\(${latex}\\)`;
  typeset(element);
}

function updateOutputs() {
  const coordinates = Physics.coordinatesInFrames(state.event, state.beta);
  const factor = Physics.gamma(state.beta);
  const timeDemo = Physics.timeDilationConstruction(state.beta, DEMO_MAGNITUDE);
  const lengthDemo = Physics.lengthContractionConstruction(state.beta, DEMO_MAGNITUDE);
  updateMath(outputs.beta, `\\beta=${format(state.beta)}`);
  updateMath(outputs.eventX, `x=${format(state.event.x)}`);
  updateMath(outputs.eventCt, `ct=${format(state.event.ct)}`);
  updateMath(
    outputs.baseCoordinate,
    `(x,ct)=(${format(coordinates.base.x)},\\,${format(coordinates.base.ct)})`,
  );
  updateMath(
    outputs.primeCoordinate,
    `(x',ct')=(${format(coordinates.prime.x)},\\,${format(coordinates.prime.ct)})`,
  );
  updateMath(outputs.gamma, `\\gamma=${format(factor, 3)}`);
  updateMath(
    outputs.timeResult,
    `\\Delta t=${format(timeDemo.coordinateTime)}=\\gamma\\,\\Delta\\tau`,
  );
  updateMath(
    outputs.lengthResult,
    `L=${format(lengthDemo.coordinateLength)}=L_0/\\gamma`,
  );
  outputs.progress.textContent = `${Math.round(state.demoProgress * 100)}%`;
}

function syncControls() {
  controls.beta.value = String(state.beta);
  controls.eventX.value = String(state.event.x);
  controls.eventCt.value = String(state.event.ct);
  controls.progress.value = String(state.demoProgress);
}

function syncInputTargetsFromState() {
  inputTargets.beta = state.beta;
  inputTargets.eventX = state.event.x;
  inputTargets.eventCt = state.event.ct;
  inputTargets.demoProgress = state.demoProgress;
}

function stopInputSmoothing() {
  if (inputSmoothingAnimation !== null) cancelAnimationFrame(inputSmoothingAnimation);
  inputSmoothingAnimation = null;
  lastSmoothingTime = 0;
}

function finishInputSmoothing() {
  stopInputSmoothing();
  state.beta = inputTargets.beta;
  state.event.x = inputTargets.eventX;
  state.event.ct = inputTargets.eventCt;
  state.demoProgress = inputTargets.demoProgress;
}

function startInputSmoothing() {
  if (reducedMotion.matches) {
    finishInputSmoothing();
    syncControls();
    updateOutputs();
    draw();
    return;
  }
  if (inputSmoothingAnimation !== null) return;
  lastSmoothingTime = 0;

  const step = timestamp => {
    const deltaTime = lastSmoothingTime === 0 ? 16 : Math.min(50, timestamp - lastSmoothingTime);
    lastSmoothingTime = timestamp;
    const smoothing = 1 - Math.exp(-deltaTime / 72);
    state.beta += (inputTargets.beta - state.beta) * smoothing;
    state.event.x += (inputTargets.eventX - state.event.x) * smoothing;
    state.event.ct += (inputTargets.eventCt - state.event.ct) * smoothing;
    state.demoProgress += (inputTargets.demoProgress - state.demoProgress) * smoothing;
    outputs.progress.textContent = `${Math.round(state.demoProgress * 100)}%`;
    draw();

    const settled =
      Math.abs(inputTargets.beta - state.beta) < 0.0004
      && Math.abs(inputTargets.eventX - state.event.x) < 0.0015
      && Math.abs(inputTargets.eventCt - state.event.ct) < 0.0015
      && Math.abs(inputTargets.demoProgress - state.demoProgress) < 0.0008;
    if (settled) {
      finishInputSmoothing();
      syncControls();
      updateOutputs();
      draw();
      return;
    }
    inputSmoothingAnimation = requestAnimationFrame(step);
  };
  inputSmoothingAnimation = requestAnimationFrame(step);
}

function animateView(frame) {
  const destination = targetBlend(frame);
  const startValue = state.viewBlend;
  const distance = Math.abs(destination - startValue);
  state.focus = frame;
  frameButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.frame === frame));
  });
  if (viewAnimation !== null) cancelAnimationFrame(viewAnimation);
  if (reducedMotion.matches || distance < 0.001) {
    state.viewBlend = destination;
    draw();
    return;
  }

  const duration = 760 * distance;
  const startTime = performance.now();
  const step = timestamp => {
    const progress = Math.max(0, Math.min(1, (timestamp - startTime) / duration));
    state.viewBlend = startValue + (destination - startValue) * easeInOut(progress);
    draw();
    if (progress < 1) viewAnimation = requestAnimationFrame(step);
    else viewAnimation = null;
  };
  viewAnimation = requestAnimationFrame(step);
}

function stopDemoAnimation() {
  if (pendingDemoStart !== null) {
    cancelAnimationFrame(pendingDemoStart);
    pendingDemoStart = null;
  }
  if (demoAnimation !== null) cancelAnimationFrame(demoAnimation);
  demoAnimation = null;
  replayButton.textContent = t("playChange");
}

function playDemo() {
  stopDemoAnimation();
  finishInputSmoothing();
  if (reducedMotion.matches) {
    state.demoProgress = 1;
    syncInputTargetsFromState();
    syncControls();
    updateOutputs();
    draw();
    return;
  }
  state.demoProgress = 0;
  inputTargets.demoProgress = 0;
  replayButton.textContent = t("playing");
  const startTime = performance.now();
  const duration = 1900;
  const step = timestamp => {
    const progress = Math.max(0, Math.min(1, (timestamp - startTime) / duration));
    state.demoProgress = easeInOut(progress);
    inputTargets.demoProgress = state.demoProgress;
    controls.progress.value = String(state.demoProgress);
    outputs.progress.textContent = `${Math.round(state.demoProgress * 100)}%`;
    draw();
    if (progress < 1) demoAnimation = requestAnimationFrame(step);
    else {
      demoAnimation = null;
      replayButton.textContent = t("watchAgain");
    }
  };
  demoAnimation = requestAnimationFrame(step);
}

function setMode(mode) {
  stopDemoAnimation();
  finishInputSmoothing();
  state.mode = mode;
  modeButtons.forEach(button => {
    button.setAttribute("aria-selected", String(button.dataset.mode === mode));
  });
  const eventMode = mode === "event";
  sections.eventControls.hidden = !eventMode;
  sections.demoControls.hidden = eventMode;
  sections.eventReadouts.hidden = !eventMode;
  sections.timeExplanation.hidden = mode !== "time";
  sections.lengthExplanation.hidden = mode !== "length";
  dragHint.hidden = !eventMode;
  legendItems.event.hidden = !eventMode;
  legendItems.demo.hidden = eventMode;
  legendItems.comparison.hidden = eventMode;
  progressLabel.textContent = mode === "time" ? t("tiltProperTime") : t("tiltProperLength");
  canvas.setAttribute(
    "aria-label",
    mode === "event"
      ? t("eventCanvasAria")
      : mode === "time"
        ? t("timeCanvasAria")
        : t("lengthCanvasAria"),
  );
  state.demoProgress = 0;
  inputTargets.demoProgress = 0;
  syncControls();
  updateOutputs();
  draw();
  if (!eventMode) {
    pendingDemoStart = requestAnimationFrame(() => {
      pendingDemoStart = null;
      playDemo();
    });
  }
}

controls.beta.addEventListener("input", () => {
  inputTargets.beta = Number(controls.beta.value);
  startInputSmoothing();
});
controls.eventX.addEventListener("input", () => {
  inputTargets.eventX = Number(controls.eventX.value);
  startInputSmoothing();
});
controls.eventCt.addEventListener("input", () => {
  inputTargets.eventCt = Number(controls.eventCt.value);
  startInputSmoothing();
});
controls.progress.addEventListener("input", () => {
  stopDemoAnimation();
  inputTargets.demoProgress = Number(controls.progress.value);
  startInputSmoothing();
});
modeButtons.forEach(button => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
frameButtons.forEach(button => {
  button.addEventListener("click", () => animateView(button.dataset.frame));
});
replayButton.addEventListener("click", playDemo);

canvas.addEventListener("pointerdown", event => {
  if (state.mode !== "event") return;
  const pointScreen = physicalToScreen(state.event);
  const rect = canvas.getBoundingClientRect();
  const pointer = {x: event.clientX - rect.left, y: event.clientY - rect.top};
  if (Math.hypot(pointer.x - pointScreen.x, pointer.y - pointScreen.y) > 28) return;
  stopInputSmoothing();
  syncInputTargetsFromState();
  draggingEvent = true;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", event => {
  if (!draggingEvent) return;
  const point = screenToPhysical(event.clientX, event.clientY);
  state.event.x = Math.round(Math.max(-2.8, Math.min(2.8, point.x)) * 20) / 20;
  state.event.ct = Math.round(Math.max(-2.8, Math.min(2.8, point.ct)) * 20) / 20;
  syncInputTargetsFromState();
  syncControls();
  updateOutputs();
  draw();
});
const endDrag = () => {
  draggingEvent = false;
};
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

const resizeObserver = new ResizeObserver(() => {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  dimensions = {
    width: rect.width,
    height: rect.height,
    centerX: rect.width / 2,
    centerY: rect.height / 2 + (rect.width < 620 ? 10 : 7),
    scale: 1,
  };
  draw();
});
resizeObserver.observe(canvas);

syncControls();
updateOutputs();
draw();
