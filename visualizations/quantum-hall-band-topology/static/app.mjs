import {
  TAU,
  qwzBandGap,
  qwzBerryCurvature,
  qwzChernNumber,
  qwzEnergy,
  sshBandGap,
  sshD,
  sshFiniteSpectrum,
  sshPath,
  sshWindingNumber,
  unitD,
} from "./physics.mjs";

const query = new URLSearchParams(window.location.search);
const LOCALE = query.get("lang") === "ja" ? "ja" : "en";
const PANEL = document.documentElement.dataset.panel;
const MESSAGES = {
  en: {
    eyebrow: "BAND TOPOLOGY",
    mapTitle: "Brillouin torus and Bloch sphere",
    mapLede: "Track the occupied-band map from momentum space to the unit sphere.",
    mapTag: "QWZ · MAP",
    transitionTitle: "Gap closings between Chern phases",
    transitionLede: "Change the mass continuously and locate the points where an integer invariant can jump.",
    transitionTag: "QWZ · TRANSITION",
    windingTitle: "One-dimensional winding in the SSH model",
    windingLede: "Read the same bulk Hamiltonian as a band dispersion and as a closed curve in the d-plane.",
    windingTag: "SSH · BULK",
    edgeTitle: "Finite-chain spectrum and edge localization",
    edgeLede: "Compare the bulk winding with the two levels nearest zero energy in an open chain.",
    edgeTag: "SSH · EDGE",
    mass: "Mass",
    hopping: "Hopping amplitude",
    orientation: "Orientation",
    occupiedChern: "OCCUPIED CHERN NUMBER",
    movePointer: "MOVE POINTER",
    dragOrbit: "DRAG TO ORBIT",
    identifyEdges: "IDENTIFY EDGES",
    bzNote: "Opposite edges are identified.",
    torusNote: "The marker is the same momentum as in the square.",
    sphereNote: "Each dot is the image of a momentum-grid point.",
    momentum: "MOMENTUM",
    unitVector: "UNIT VECTOR",
    localCurvature: "LOCAL CURVATURE",
    bulkGap: "BULK GAP",
    changeMass: "Change mass continuously",
    gappedPhases: "GAPPED PHASES",
    gapClosings: "GAP CLOSINGS",
    intracellRatio: "Intracell ratio",
    topological: "Topological",
    critical: "Critical",
    trivial: "Trivial",
    winding: "WINDING",
    moveAlongK: "MOVE ALONG k",
    centralEnergies: "CENTRAL ENERGIES",
    edgeWeight: "EDGE WEIGHT",
    localization: "LOCALIZATION",
    massAria: "QWZ mass m",
    hoppingAria: "QWZ hopping amplitude A",
    orientationAria: "QWZ time-reversal-breaking orientation lambda",
    bzAria: "Colored Brillouin zone; move the pointer to select momentum",
    torusAria: "Three-dimensional Brillouin torus colored by the Bloch-vector direction; drag to orbit",
    sphereAria: "Image of the Brillouin zone on the Bloch sphere; drag to orbit",
    energySurfaceAria: "Upper and lower QWZ energy surfaces over the full Brillouin zone; drag to orbit",
    energySurfaceNote: "Both bands are shown over the full Brillouin zone.",
    sshRatioAria: "SSH intracell to intercell hopping ratio",
    sshBandAria: "SSH band structure; move the pointer along momentum",
    windingAria: "Closed SSH d-vector trajectory around the origin",
    flowAria: "Finite SSH chain spectrum as a function of hopping ratio",
    profileAria: "Real-space probability profile of the two central SSH states",
    gapOpen: "The gap is open, so the Chern number cannot change under a smooth deformation.",
    gapClosedGamma: "The bands touch at Γ. The occupied-band Chern number is undefined at this mass.",
    gapClosedXY: "The bands touch simultaneously at X and Y. Their two Dirac contributions change the Chern number by two.",
    gapClosedM: "The bands touch at M. The occupied-band Chern number is undefined at this mass.",
    mapGapless: "GAPLESS",
    windingTopological: "The circle encloses the origin once.",
    windingCritical: "The circle passes through the origin, where the bulk gap closes and winding is undefined.",
    windingTrivial: "The circle does not enclose the origin.",
    edgeLocalized: "The two central states are concentrated at opposite ends of the chain.",
    edgeExtended: "Near the transition, the central states spread through the finite chain.",
    edgeAbsent: "The central states belong to the bulk spectrum rather than an in-gap edge pair.",
    edge: "EDGE",
    extended: "EXTENDED",
    bulk: "BULK",
  },
  ja: {
    eyebrow: "BAND TOPOLOGY",
    mapTitle: "Brillouin torus と Bloch 球",
    mapLede: "運動量空間から単位球面への占有バンドの写像を追います。",
    mapTag: "QWZ · 写像",
    transitionTitle: "Chern 相を隔てるギャップ閉鎖",
    transitionLede: "質量を連続に変え、整数不変量が跳べる点を確かめます。",
    transitionTag: "QWZ · 相転移",
    windingTitle: "SSH 模型の 1 次元 winding",
    windingLede: "同じバルク Hamiltonian を、バンド分散と d 平面上の閉曲線として読みます。",
    windingTag: "SSH · バルク",
    edgeTitle: "有限鎖のスペクトルと端局在",
    edgeLede: "バルクの winding と、開放鎖でゼロエネルギーに最も近い 2 準位を比較します。",
    edgeTag: "SSH · 端",
    mass: "質量",
    hopping: "ホッピング振幅",
    orientation: "向き",
    occupiedChern: "占有バンドの CHERN 数",
    movePointer: "ポインターで選択",
    dragOrbit: "ドラッグで回転",
    identifyEdges: "辺を同一視",
    bzNote: "向かい合う辺は同一視されています。",
    torusNote: "マーカーは正方形上と同じ運動量を示します。",
    sphereNote: "各点は運動量格子点の像です。",
    momentum: "運動量",
    unitVector: "単位ベクトル",
    localCurvature: "局所曲率",
    bulkGap: "バルクギャップ",
    changeMass: "質量を連続に変える",
    gappedPhases: "ギャップのある相",
    gapClosings: "ギャップ閉鎖",
    intracellRatio: "単位胞内ホッピング比",
    topological: "トポロジカル",
    critical: "臨界",
    trivial: "自明",
    winding: "WINDING",
    moveAlongK: "k に沿って移動",
    centralEnergies: "中央 2 準位",
    edgeWeight: "端の重み",
    localization: "局在性",
    massAria: "QWZ 質量 m",
    hoppingAria: "QWZ ホッピング振幅 A",
    orientationAria: "QWZ の時間反転対称性を破る向き lambda",
    bzAria: "色付けした Brillouin zone。ポインターで運動量を選択できます",
    torusAria: "Bloch ベクトルの向きで着色した 3 次元 Brillouin torus。ドラッグで回転できます",
    sphereAria: "Brillouin zone の Bloch 球上の像。ドラッグで回転できます",
    energySurfaceAria: "Brillouin zone 全体にわたる QWZ 上下バンドのエネルギー曲面。ドラッグで回転できます",
    energySurfaceNote: "Brillouin zone 全体にわたる上下 2 バンドを表示しています。",
    sshRatioAria: "SSH の単位胞内・単位胞間ホッピング比",
    sshBandAria: "SSH バンド構造。ポインターで運動量を選択できます",
    windingAria: "原点のまわりを通る SSH d ベクトルの閉軌道",
    flowAria: "ホッピング比に対する有限 SSH 鎖のスペクトル",
    profileAria: "SSH 鎖の中央 2 状態の実空間確率分布",
    gapOpen: "ギャップが開いているため、滑らかな変形では Chern 数を変えられません。",
    gapClosedGamma: "Γ でバンドが接触しています。この質量では占有バンドの Chern 数は定義できません。",
    gapClosedXY: "X と Y でバンドが同時に接触しています。2 つの Dirac 寄与により Chern 数は 2 だけ変化します。",
    gapClosedM: "M でバンドが接触しています。この質量では占有バンドの Chern 数は定義できません。",
    mapGapless: "ギャップレス",
    windingTopological: "円は原点を 1 回囲みます。",
    windingCritical: "円が原点を通り、バルクギャップが閉じるため winding は定義できません。",
    windingTrivial: "円は原点を囲みません。",
    edgeLocalized: "中央 2 状態は鎖の左右端に集中しています。",
    edgeExtended: "相転移の近くでは、中央状態が有限鎖全体へ広がります。",
    edgeAbsent: "中央状態はギャップ内の端状態対ではなく、バルクスペクトルに属します。",
    edge: "端局在",
    extended: "非局在",
    bulk: "バルク",
  },
};

const t = key => MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key;
const byId = id => document.getElementById(id);
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

const PANEL_COPY = {
  map: ["mapTitle", "mapLede", "mapTag"],
  transition: ["transitionTitle", "transitionLede", "transitionTag"],
  winding: ["windingTitle", "windingLede", "windingTag"],
  edge: ["edgeTitle", "edgeLede", "edgeTag"],
};

function localize() {
  document.documentElement.lang = LOCALE;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
  const [titleKey, ledeKey, tagKey] = PANEL_COPY[PANEL];
  byId("app-title").textContent = t(titleKey);
  byId("app-lede").textContent = t(ledeKey);
  byId("model-tag").textContent = t(tagKey);
  document.title = t(titleKey);
}

function cssValue(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function colors() {
  return {
    paper: cssValue("--atlas-viz-panel"),
    subtle: cssValue("--atlas-viz-panel-subtle"),
    ink: cssValue("--ink"),
    muted: cssValue("--muted"),
    border: cssValue("--atlas-viz-border"),
    dark: cssValue("--plot-dark"),
    darkGrid: cssValue("--plot-dark-grid"),
    positive: cssValue("--chern-positive"),
    negative: cssValue("--chern-negative"),
    edge: cssValue("--topology-edge"),
    winding: cssValue("--topology-winding"),
    highlight: cssValue("--topology-highlight"),
  };
}

function signed(value, digits = 2) {
  if (Math.abs(value) < 0.5 * 10 ** -digits) return (0).toFixed(digits);
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}`;
}

function chernText(chern) {
  if (chern === null) return "—";
  return chern > 0 ? `+${chern}` : String(chern).replace("-", "−");
}

function formatEnergy(value) {
  const magnitude = Math.abs(value);
  if (magnitude > 0 && magnitude < 0.001) {
    return value.toExponential(2).replaceAll("-", "−");
  }
  return signed(value, 3);
}

function canvasPoint(canvas, event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * canvas.width / bounds.width,
    y: (event.clientY - bounds.top) * canvas.height / bounds.height,
  };
}

function line(context, points, options = {}) {
  if (!points.length) return;
  context.save();
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.strokeStyle = options.stroke ?? colors().ink;
  context.lineWidth = options.width ?? 2;
  context.globalAlpha = options.alpha ?? 1;
  if (options.dash) context.setLineDash(options.dash);
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();
  context.restore();
}

function circle(context, x, y, radius, fill, stroke = null, width = 1) {
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, TAU);
  if (fill) {
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = width;
    context.stroke();
  }
  context.restore();
}

function arrow(context, from, to, color, width = 2) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  line(context, [from, to], {stroke: color, width});
  context.save();
  context.translate(to.x, to.y);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-9, -4.5);
  context.lineTo(-7, 0);
  context.lineTo(-9, 4.5);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function drawPlotFrame(context, width, height, options = {}) {
  const palette = colors();
  const area = options.area ?? {left: 65, right: width - 25, top: 25, bottom: height - 56};
  context.clearRect(0, 0, width, height);
  context.fillStyle = options.background ?? palette.paper;
  context.fillRect(0, 0, width, height);
  context.save();
  context.strokeStyle = options.grid ?? palette.border;
  context.lineWidth = 1;
  const rows = options.rows ?? 6;
  for (let index = 0; index <= rows; index += 1) {
    const y = lerp(area.top, area.bottom, index / rows);
    context.beginPath();
    context.moveTo(area.left, y);
    context.lineTo(area.right, y);
    context.stroke();
  }
  context.strokeStyle = options.axis ?? palette.muted;
  context.beginPath();
  context.moveTo(area.left, area.top);
  context.lineTo(area.left, area.bottom);
  context.lineTo(area.right, area.bottom);
  context.stroke();
  context.restore();
  return area;
}

function directionColor(vector, alpha = 1) {
  if (!vector) return `rgba(240, 240, 234, ${alpha})`;
  const hue = ((Math.atan2(vector.y, vector.x) / TAU * 360 + 360) % 360 + 184) % 360;
  const saturation = 72 - 8 * Math.abs(vector.z);
  const lightness = 46 + 18 * vector.z;
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

const qwzState = {mass: -1, hopping: 1, trBreaking: 1};
const selectedMomentum = {kx: 0, ky: 0};
const torusCamera = {azimuth: -0.72, elevation: 0.48};
const sphereCamera = {azimuth: -0.7, elevation: 0.34};
const energyCamera = {azimuth: -0.74, elevation: 0.5};
const sshState = {ratio: 0.65, selectedK: 0};

function project3D(vector, camera, geometry) {
  const {azimuth, elevation} = camera;
  const right = {x: Math.cos(azimuth), y: Math.sin(azimuth), z: 0};
  const up = {
    x: -Math.sin(azimuth) * Math.sin(elevation),
    y: Math.cos(azimuth) * Math.sin(elevation),
    z: Math.cos(elevation),
  };
  const forward = {
    x: -Math.sin(azimuth) * Math.cos(elevation),
    y: Math.cos(azimuth) * Math.cos(elevation),
    z: -Math.sin(elevation),
  };
  return {
    x: geometry.cx + geometry.scale * (
      vector.x * right.x + vector.y * right.y + vector.z * right.z
    ),
    y: geometry.cy - geometry.scale * (
      vector.x * up.x + vector.y * up.y + vector.z * up.z
    ),
    depth: vector.x * forward.x + vector.y * forward.y + vector.z * forward.z,
  };
}

function projectSphere(vector, geometry) {
  return project3D(vector, sphereCamera, {...geometry, scale: geometry.radius});
}

function installOrbitControls(canvas, camera, redraw) {
  let drag = null;
  canvas.addEventListener("pointerdown", event => {
    canvas.setPointerCapture(event.pointerId);
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
  });
  canvas.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId) return;
    camera.azimuth += (event.clientX - drag.x) * 0.008;
    camera.elevation = clamp(
      camera.elevation - (event.clientY - drag.y) * 0.008,
      -1.25,
      1.25,
    );
    drag.x = event.clientX;
    drag.y = event.clientY;
    redraw();
  });
  const stopDrag = event => {
    if (drag?.id === event.pointerId) drag = null;
  };
  canvas.addEventListener("pointerup", stopDrag);
  canvas.addEventListener("pointercancel", stopDrag);
  canvas.addEventListener("keydown", event => {
    const step = event.shiftKey ? 0.2 : 0.08;
    if (event.key === "ArrowLeft") camera.azimuth -= step;
    else if (event.key === "ArrowRight") camera.azimuth += step;
    else if (event.key === "ArrowUp") {
      camera.elevation = clamp(camera.elevation + step, -1.25, 1.25);
    } else if (event.key === "ArrowDown") {
      camera.elevation = clamp(camera.elevation - step, -1.25, 1.25);
    } else return;
    event.preventDefault();
    redraw();
  });
}

function sphereCurve(kind, fixed, samples = 90) {
  return Array.from({length: samples + 1}, (_, index) => {
    const angle = TAU * index / samples;
    if (kind === "latitude") {
      const radial = Math.sqrt(Math.max(0, 1 - fixed * fixed));
      return {x: radial * Math.cos(angle), y: radial * Math.sin(angle), z: fixed};
    }
    return {
      x: Math.sin(angle) * Math.cos(fixed),
      y: Math.sin(angle) * Math.sin(fixed),
      z: Math.cos(angle),
    };
  });
}

function drawProjectedCurve(context, vectors, geometry, color) {
  const projected = vectors.map(vector => projectSphere(vector, geometry));
  for (const visible of [false, true]) {
    let segment = [];
    for (let index = 0; index < projected.length; index += 1) {
      const point = projected[index];
      const isVisible = point.depth >= 0;
      if (isVisible === visible) segment.push(point);
      if (isVisible !== visible || index === projected.length - 1) {
        if (segment.length > 1) {
          line(context, segment, {
            stroke: color,
            width: visible ? 1.1 : 0.7,
            alpha: visible ? 0.62 : 0.2,
          });
        }
        segment = [point];
      }
    }
  }
}

function drawBZ() {
  const canvas = byId("bz-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const area = {left: 59, right: canvas.width - 26, top: 22, bottom: canvas.height - 58};
  const columns = 51;
  const rows = 43;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = palette.dark;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let ix = 0; ix < columns; ix += 1) {
    for (let iy = 0; iy < rows; iy += 1) {
      const kx = -Math.PI + TAU * (ix + 0.5) / columns;
      const ky = Math.PI - TAU * (iy + 0.5) / rows;
      const vector = unitD(kx, ky, qwzState);
      const x0 = lerp(area.left, area.right, ix / columns);
      const x1 = lerp(area.left, area.right, (ix + 1) / columns);
      const y0 = lerp(area.top, area.bottom, iy / rows);
      const y1 = lerp(area.top, area.bottom, (iy + 1) / rows);
      context.fillStyle = directionColor(vector);
      context.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    }
  }

  context.save();
  context.strokeStyle = "rgba(255,255,255,.22)";
  context.lineWidth = 1;
  for (const fraction of [0.25, 0.5, 0.75]) {
    const x = lerp(area.left, area.right, fraction);
    const y = lerp(area.top, area.bottom, fraction);
    context.beginPath();
    context.moveTo(x, area.top);
    context.lineTo(x, area.bottom);
    context.moveTo(area.left, y);
    context.lineTo(area.right, y);
    context.stroke();
  }
  context.strokeStyle = "rgba(255,255,255,.8)";
  context.setLineDash([7, 6]);
  context.strokeRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  context.restore();

  context.fillStyle = "#9babb2";
  context.font = "700 14px monospace";
  context.textAlign = "center";
  for (const [fraction, label] of [[0, "−π"], [0.5, "0"], [1, "+π"]]) {
    context.fillText(label, lerp(area.left, area.right, fraction), area.bottom + 25);
  }
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (const [fraction, label] of [[0, "+π"], [0.5, "0"], [1, "−π"]]) {
    context.fillText(label, area.left - 12, lerp(area.top, area.bottom, fraction));
  }
  context.fillStyle = "#c7d1d5";
  context.font = "italic 16px Georgia";
  context.textAlign = "right";
  context.fillText("kx", area.right, area.bottom + 43);
  context.save();
  context.translate(19, area.top);
  context.rotate(-Math.PI / 2);
  context.fillText("ky", 0, 0);
  context.restore();

  const selectedX = lerp(area.left, area.right, (selectedMomentum.kx + Math.PI) / TAU);
  const selectedY = lerp(area.bottom, area.top, (selectedMomentum.ky + Math.PI) / TAU);
  circle(context, selectedX, selectedY, 11, "rgba(17,25,34,.58)", "white", 2);
  circle(context, selectedX, selectedY, 4, palette.highlight);
}

function torusPoint(kx, ky) {
  const majorRadius = 1.05;
  const minorRadius = 0.42;
  const radial = majorRadius + minorRadius * Math.cos(ky);
  return {
    x: radial * Math.cos(kx),
    y: radial * Math.sin(kx),
    z: minorRadius * Math.sin(ky),
  };
}

function torusNormal(kx, ky) {
  return {
    x: Math.cos(ky) * Math.cos(kx),
    y: Math.cos(ky) * Math.sin(kx),
    z: Math.sin(ky),
  };
}

function drawTorus() {
  const canvas = byId("torus-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const geometry = {
    cx: canvas.width / 2,
    cy: canvas.height / 2 + 2,
    scale: Math.min(canvas.width, canvas.height) * 0.29,
  };
  const majorSteps = 48;
  const minorSteps = 24;
  const faces = [];

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = palette.dark;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let ix = 0; ix < majorSteps; ix += 1) {
    const kx0 = -Math.PI + TAU * ix / majorSteps;
    const kx1 = -Math.PI + TAU * (ix + 1) / majorSteps;
    for (let iy = 0; iy < minorSteps; iy += 1) {
      const ky0 = -Math.PI + TAU * iy / minorSteps;
      const ky1 = -Math.PI + TAU * (iy + 1) / minorSteps;
      const vertices = [
        torusPoint(kx0, ky0),
        torusPoint(kx1, ky0),
        torusPoint(kx1, ky1),
        torusPoint(kx0, ky1),
      ].map(point => project3D(point, torusCamera, geometry));
      const vector = unitD((kx0 + kx1) / 2, (ky0 + ky1) / 2, qwzState);
      faces.push({
        vertices,
        depth: vertices.reduce((sum, point) => sum + point.depth, 0) / vertices.length,
        color: directionColor(vector, 0.94),
      });
    }
  }

  faces.sort((left, right) => left.depth - right.depth);
  for (const face of faces) {
    context.beginPath();
    face.vertices.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.closePath();
    context.fillStyle = face.color;
    context.fill();
    context.strokeStyle = "rgba(13,22,30,.18)";
    context.lineWidth = 0.65;
    context.stroke();
  }

  const surface = torusPoint(selectedMomentum.kx, selectedMomentum.ky);
  const normal = torusNormal(selectedMomentum.kx, selectedMomentum.ky);
  const lifted = {
    x: surface.x + 0.16 * normal.x,
    y: surface.y + 0.16 * normal.y,
    z: surface.z + 0.16 * normal.z,
  };
  const surfaceProjection = project3D(surface, torusCamera, geometry);
  const liftedProjection = project3D(lifted, torusCamera, geometry);
  const selected = unitD(selectedMomentum.kx, selectedMomentum.ky, qwzState);
  line(context, [surfaceProjection, liftedProjection], {stroke: "white", width: 2});
  circle(context, liftedProjection.x, liftedProjection.y, 11, "rgba(17,25,34,.68)", "white", 2);
  circle(
    context,
    liftedProjection.x,
    liftedProjection.y,
    4,
    directionColor(selected),
    palette.highlight,
    2,
  );
}

function drawSphere() {
  const canvas = byId("sphere-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const geometry = {
    cx: canvas.width / 2,
    cy: canvas.height / 2 - 2,
    radius: Math.min(canvas.width, canvas.height) * 0.39,
  };
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = palette.dark;
  context.fillRect(0, 0, canvas.width, canvas.height);
  circle(context, geometry.cx, geometry.cy, geometry.radius, "#17232e", "#718891", 1.2);
  for (const z of [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75]) {
    drawProjectedCurve(context, sphereCurve("latitude", z), geometry, "#789198");
  }
  for (let index = 0; index < 12; index += 1) {
    drawProjectedCurve(context, sphereCurve("longitude", TAU * index / 12), geometry, "#789198");
  }

  const cloud = [];
  const resolution = 33;
  for (let ix = 0; ix < resolution; ix += 1) {
    for (let iy = 0; iy < resolution; iy += 1) {
      const vector = unitD(
        -Math.PI + TAU * ix / resolution,
        -Math.PI + TAU * iy / resolution,
        qwzState,
      );
      if (!vector) continue;
      cloud.push({...projectSphere(vector, geometry), color: directionColor(vector, 0.72)});
    }
  }
  cloud.sort((left, right) => left.depth - right.depth);
  for (const point of cloud) {
    circle(context, point.x, point.y, point.depth >= 0 ? 2.7 : 1.6, point.color);
  }

  const selected = unitD(selectedMomentum.kx, selectedMomentum.ky, qwzState);
  if (selected) {
    const point = projectSphere(selected, geometry);
    arrow(context, {x: geometry.cx, y: geometry.cy}, point, "rgba(255,255,255,.9)", 2);
    circle(context, point.x, point.y, 10, "rgba(17,25,34,.62)", "white", 2);
    circle(context, point.x, point.y, 4, directionColor(selected), palette.highlight, 2);
  } else {
    circle(context, geometry.cx, geometry.cy, 13, "rgba(237,107,58,.2)", palette.highlight, 2);
  }
}

function updateQwzReadout() {
  const chern = qwzChernNumber(qwzState);
  const gap = qwzBandGap(qwzState, 93);
  document.querySelectorAll("[data-qwz-chern]").forEach(element => {
    element.textContent = chernText(chern);
    element.style.color = chern === null
      ? colors().highlight
      : chern < 0 ? colors().negative : colors().positive;
  });
  document.querySelectorAll("[data-qwz-gap]").forEach(element => {
    element.textContent = gap.toFixed(3);
  });
  document.querySelectorAll('[data-output="mass"]').forEach(element => {
    element.textContent = `m = ${signed(qwzState.mass, 2)}`;
  });
  document.querySelectorAll('[data-output="hopping"]').forEach(element => {
    element.textContent = `A = ${qwzState.hopping.toFixed(2)}`;
  });
  document.querySelectorAll('[data-output="trBreaking"]').forEach(element => {
    element.textContent = `λ = ${signed(qwzState.trBreaking, 2)}`;
  });
  document.querySelectorAll("[data-qwz-param]").forEach(input => {
    input.value = qwzState[input.dataset.qwzParam];
  });

  if (PANEL === "map") {
    const vector = unitD(selectedMomentum.kx, selectedMomentum.ky, qwzState);
    const curvature = qwzBerryCurvature(selectedMomentum.kx, selectedMomentum.ky, qwzState);
    byId("selected-k").textContent = `(${signed(selectedMomentum.kx / Math.PI, 2)}π, ${signed(selectedMomentum.ky / Math.PI, 2)}π)`;
    byId("selected-d").textContent = vector
      ? `(${signed(vector.x, 3)}, ${signed(vector.y, 3)}, ${signed(vector.z, 3)})`
      : t("mapGapless");
    byId("selected-curvature").textContent = curvature === null
      ? "Ω₋ = —"
      : `Ω₋ = ${signed(curvature, 3)}`;
  }

  if (PANEL === "transition") {
    document.querySelectorAll("[data-mass-preset]").forEach(button => {
      button.classList.toggle(
        "active",
        Math.abs(Number(button.dataset.massPreset) - qwzState.mass) < 1e-9,
      );
    });
    let statusKey = "gapOpen";
    if (Math.abs(qwzState.mass + 2) < 1e-9) statusKey = "gapClosedGamma";
    else if (Math.abs(qwzState.mass) < 1e-9) statusKey = "gapClosedXY";
    else if (Math.abs(qwzState.mass - 2) < 1e-9) statusKey = "gapClosedM";
    byId("gap-explanation").textContent = t(statusKey);
  }
}

function energySurfacePoint(kx, ky, sign, energyScale) {
  return {
    x: 1.28 * kx / Math.PI,
    y: 1.28 * ky / Math.PI,
    z: sign * 1.18 * qwzEnergy(kx, ky, qwzState) / energyScale,
  };
}

function drawEnergySurfaces() {
  const canvas = byId("qwz-energy-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const geometry = {
    cx: canvas.width * 0.5,
    cy: canvas.height * 0.51,
    scale: Math.min(canvas.width, canvas.height) * 0.285,
  };
  const energyScale = Math.max(4.2, Math.abs(qwzState.mass) + 2.35);
  const resolution = 31;
  const faces = [];

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = palette.dark;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const planeLines = [];
  for (const coordinate of [-1.28, -0.64, 0, 0.64, 1.28]) {
    planeLines.push([
      {x: -1.28, y: coordinate, z: 0},
      {x: 1.28, y: coordinate, z: 0},
    ]);
    planeLines.push([
      {x: coordinate, y: -1.28, z: 0},
      {x: coordinate, y: 1.28, z: 0},
    ]);
  }
  for (const points of planeLines) {
    line(context, points.map(point => project3D(point, energyCamera, geometry)), {
      stroke: "#52646e",
      width: 1,
      alpha: 0.48,
    });
  }

  for (const sign of [-1, 1]) {
    for (let ix = 0; ix < resolution - 1; ix += 1) {
      const kx0 = -Math.PI + TAU * ix / (resolution - 1);
      const kx1 = -Math.PI + TAU * (ix + 1) / (resolution - 1);
      for (let iy = 0; iy < resolution - 1; iy += 1) {
        const ky0 = -Math.PI + TAU * iy / (resolution - 1);
        const ky1 = -Math.PI + TAU * (iy + 1) / (resolution - 1);
        const modelPoints = [
          energySurfacePoint(kx0, ky0, sign, energyScale),
          energySurfacePoint(kx1, ky0, sign, energyScale),
          energySurfacePoint(kx1, ky1, sign, energyScale),
          energySurfacePoint(kx0, ky1, sign, energyScale),
        ];
        const vertices = modelPoints.map(point => project3D(point, energyCamera, geometry));
        const averageEnergy = modelPoints.reduce((sum, point) => sum + Math.abs(point.z), 0)
          / modelPoints.length;
        const lightness = 42 + 12 * averageEnergy / 1.18;
        faces.push({
          vertices,
          depth: vertices.reduce((sum, point) => sum + point.depth, 0) / vertices.length,
          fill: sign > 0
            ? "hsla(184, 72%, " + lightness + "%, .78)"
            : "hsla(16, 74%, " + (lightness + 3) + "%, .78)",
          stroke: sign > 0 ? "rgba(121,225,226,.2)" : "rgba(255,174,133,.2)",
        });
      }
    }
  }

  faces.sort((left, right) => left.depth - right.depth);
  for (const face of faces) {
    context.beginPath();
    face.vertices.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.closePath();
    context.fillStyle = face.fill;
    context.fill();
    context.strokeStyle = face.stroke;
    context.lineWidth = 0.55;
    context.stroke();
  }

  const criticalPoints = Math.abs(qwzState.mass + 2) < 1e-9
    ? [{label: "Γ", kx: 0, ky: 0}]
    : Math.abs(qwzState.mass) < 1e-9
      ? [{label: "X", kx: Math.PI, ky: 0}, {label: "Y", kx: 0, ky: Math.PI}]
      : Math.abs(qwzState.mass - 2) < 1e-9
        ? [{label: "M", kx: Math.PI, ky: Math.PI}]
        : [];
  for (const critical of criticalPoints) {
    const point = project3D(
      {x: 1.28 * critical.kx / Math.PI, y: 1.28 * critical.ky / Math.PI, z: 0},
      energyCamera,
      geometry,
    );
    circle(context, point.x, point.y, 15, "rgba(237,107,58,.2)", "white", 2);
    circle(context, point.x, point.y, 5, palette.highlight);
    context.fillStyle = "white";
    context.font = "800 13px monospace";
    context.textAlign = "left";
    context.fillText(critical.label, point.x + 13, point.y - 12);
  }

  const legend = [
    {label: "UPPER BAND  E₊", color: palette.positive},
    {label: "LOWER BAND  E₋", color: palette.negative},
  ];
  context.font = "800 12px monospace";
  context.textAlign = "left";
  legend.forEach((entry, index) => {
    const y = 28 + 23 * index;
    context.fillStyle = entry.color;
    context.fillRect(24, y - 9, 19, 5);
    context.fillStyle = "#d8e1e4";
    context.fillText(entry.label, 51, y);
  });
  context.fillStyle = "#9babb2";
  context.textAlign = "right";
  context.fillText("kx, ky ∈ [−π, +π]", canvas.width - 22, canvas.height - 21);
}

function renderQwz() {
  updateQwzReadout();
  if (PANEL === "map") {
    drawBZ();
    drawTorus();
    drawSphere();
  } else {
    drawEnergySurfaces();
  }
  window.dispatchEvent(new Event("physics-atlas:visualization-rendered"));
}

let qwzFrame = null;
function scheduleQwzRender() {
  if (qwzFrame !== null) return;
  qwzFrame = requestAnimationFrame(() => {
    qwzFrame = null;
    renderQwz();
  });
}

function installQwzControls() {
  document.querySelectorAll("[data-qwz-param]").forEach(input => {
    input.addEventListener("input", () => {
      qwzState[input.dataset.qwzParam] = Number(input.value);
      scheduleQwzRender();
    });
  });
  document.querySelectorAll("[data-mass-preset]").forEach(button => {
    button.addEventListener("click", () => {
      qwzState.mass = Number(button.dataset.massPreset);
      scheduleQwzRender();
    });
  });
  if (PANEL === "transition") {
    installOrbitControls(byId("qwz-energy-canvas"), energyCamera, drawEnergySurfaces);
    return;
  }
  if (PANEL !== "map") return;

  const bzCanvas = byId("bz-canvas");
  const setMomentum = event => {
    const point = canvasPoint(bzCanvas, event);
    const area = {left: 59, right: bzCanvas.width - 26, top: 22, bottom: bzCanvas.height - 58};
    selectedMomentum.kx = lerp(-Math.PI, Math.PI, clamp(
      (point.x - area.left) / (area.right - area.left), 0, 1,
    ));
    selectedMomentum.ky = lerp(Math.PI, -Math.PI, clamp(
      (point.y - area.top) / (area.bottom - area.top), 0, 1,
    ));
    scheduleQwzRender();
  };
  bzCanvas.addEventListener("pointerdown", event => {
    bzCanvas.setPointerCapture(event.pointerId);
    setMomentum(event);
  });
  bzCanvas.addEventListener("pointermove", event => {
    if (event.pointerType === "mouse" || bzCanvas.hasPointerCapture(event.pointerId)) {
      setMomentum(event);
    }
  });
  bzCanvas.addEventListener("keydown", event => {
    const step = event.shiftKey ? Math.PI / 4 : Math.PI / 16;
    if (event.key === "ArrowLeft") selectedMomentum.kx -= step;
    else if (event.key === "ArrowRight") selectedMomentum.kx += step;
    else if (event.key === "ArrowUp") selectedMomentum.ky += step;
    else if (event.key === "ArrowDown") selectedMomentum.ky -= step;
    else return;
    const wrap = value => ((value + Math.PI) % TAU + TAU) % TAU - Math.PI;
    selectedMomentum.kx = wrap(selectedMomentum.kx);
    selectedMomentum.ky = wrap(selectedMomentum.ky);
    event.preventDefault();
    scheduleQwzRender();
  });

  installOrbitControls(byId("torus-canvas"), torusCamera, drawTorus);
  installOrbitControls(byId("sphere-canvas"), sphereCamera, drawSphere);
}

function drawSshBands(path) {
  const canvas = byId("ssh-band-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const area = drawPlotFrame(context, canvas.width, canvas.height);
  const ymax = 3;
  const xCanvas = k => lerp(area.left, area.right, (k + Math.PI) / TAU);
  const yCanvas = energy => lerp(area.bottom, area.top, (energy + ymax) / (2 * ymax));
  line(context, [{x: area.left, y: yCanvas(0)}, {x: area.right, y: yCanvas(0)}], {
    stroke: palette.muted,
    width: 1,
  });
  line(context, path.map(sample => ({x: xCanvas(sample.k), y: yCanvas(sample.energy)})), {
    stroke: palette.winding,
    width: 3,
  });
  line(context, path.map(sample => ({x: xCanvas(sample.k), y: yCanvas(-sample.energy)})), {
    stroke: palette.positive,
    width: 3,
  });

  const vector = sshD(sshState.selectedK, {t1: sshState.ratio, t2: 1});
  const energy = Math.hypot(vector.x, vector.y);
  const selectedX = xCanvas(sshState.selectedK);
  line(context, [{x: selectedX, y: area.top}, {x: selectedX, y: area.bottom}], {
    stroke: palette.highlight,
    width: 1.2,
    dash: [5, 5],
  });
  circle(context, selectedX, yCanvas(energy), 5, palette.highlight, "white", 1.3);
  circle(context, selectedX, yCanvas(-energy), 5, palette.highlight, "white", 1.3);

  context.fillStyle = palette.muted;
  context.font = "700 13px monospace";
  context.textAlign = "center";
  for (const [k, label] of [[-Math.PI, "−π"], [0, "0"], [Math.PI, "+π"]]) {
    context.fillText(label, xCanvas(k), area.bottom + 27);
  }
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (const value of [-2, -1, 0, 1, 2]) {
    context.fillText(String(value).replace("-", "−"), area.left - 12, yCanvas(value));
  }
  context.fillStyle = palette.ink;
  context.font = "italic 16px Georgia";
  context.fillText("k", area.right, area.bottom + 40);
}

function drawSshWinding(path) {
  const canvas = byId("ssh-winding-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const area = drawPlotFrame(context, canvas.width, canvas.height);
  const extent = 3.1;
  const xCanvas = x => lerp(area.left, area.right, (x + extent) / (2 * extent));
  const yCanvas = y => lerp(area.bottom, area.top, (y + extent) / (2 * extent));
  line(context, [{x: xCanvas(0), y: area.top}, {x: xCanvas(0), y: area.bottom}], {
    stroke: palette.muted,
    width: 1,
  });
  line(context, [{x: area.left, y: yCanvas(0)}, {x: area.right, y: yCanvas(0)}], {
    stroke: palette.muted,
    width: 1,
  });
  for (let index = 1; index < path.length; index += 1) {
    const start = path[index - 1];
    const end = path[index];
    const hue = 185 + 90 * index / path.length;
    line(context, [
      {x: xCanvas(start.x), y: yCanvas(start.y)},
      {x: xCanvas(end.x), y: yCanvas(end.y)},
    ], {stroke: `hsl(${hue}, 62%, 48%)`, width: 4});
  }
  const origin = {x: xCanvas(0), y: yCanvas(0)};
  circle(context, origin.x, origin.y, 13, "rgba(237,107,58,.13)");
  circle(context, origin.x, origin.y, 5, palette.paper, palette.highlight, 2.3);
  context.fillStyle = palette.highlight;
  context.font = "800 10px monospace";
  context.textAlign = "left";
  context.fillText("ORIGIN", origin.x + 12, origin.y - 11);

  const selected = sshD(sshState.selectedK, {t1: sshState.ratio, t2: 1});
  const point = {x: xCanvas(selected.x), y: yCanvas(selected.y)};
  arrow(context, origin, point, "rgba(23,32,42,.5)", 1.4);
  circle(context, point.x, point.y, 7, palette.highlight, "white", 1.5);

  const arrowIndex = Math.floor(path.length * 0.18);
  arrow(context, {
    x: xCanvas(path[arrowIndex - 3].x),
    y: yCanvas(path[arrowIndex - 3].y),
  }, {
    x: xCanvas(path[arrowIndex + 3].x),
    y: yCanvas(path[arrowIndex + 3].y),
  }, palette.winding, 2.1);

  context.fillStyle = palette.muted;
  context.font = "700 13px monospace";
  context.textAlign = "center";
  for (const value of [-2, 0, 2]) {
    context.fillText(String(value).replace("-", "−"), xCanvas(value), area.bottom + 27);
  }
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (const value of [-2, 0, 2]) {
    context.fillText(String(value).replace("-", "−"), area.left - 12, yCanvas(value));
  }
  context.fillStyle = palette.ink;
  context.font = "italic 16px Georgia";
  context.fillText("dx", area.right, area.bottom + 40);
  context.save();
  context.translate(19, area.top);
  context.rotate(-Math.PI / 2);
  context.fillText("dy", 0, 0);
  context.restore();
}

function updateSshReadout(spectrum = null) {
  const winding = sshWindingNumber({t1: sshState.ratio, t2: 1});
  const gap = sshBandGap({t1: sshState.ratio, t2: 1});
  document.querySelectorAll("[data-ssh-output]").forEach(element => {
    element.textContent = `t₁/t₂ = ${sshState.ratio.toFixed(2)}`;
  });
  document.querySelectorAll("[data-ssh-ratio]").forEach(input => {
    input.value = sshState.ratio;
  });
  document.querySelectorAll("[data-winding]").forEach(element => {
    element.textContent = winding === null ? "—" : winding;
  });
  document.querySelectorAll("[data-ssh-gap]").forEach(element => {
    element.textContent = gap.toFixed(3);
  });
  document.querySelectorAll("[data-ssh-preset]").forEach(button => {
    button.classList.toggle(
      "active",
      Math.abs(Number(button.dataset.sshPreset) - sshState.ratio) < 1e-9,
    );
  });

  if (PANEL === "winding") {
    const statusKey = winding === null
      ? "windingCritical"
      : winding === 1 ? "windingTopological" : "windingTrivial";
    byId("ssh-status").textContent = t(statusKey);
  }
  if (PANEL === "edge" && spectrum) {
    byId("edge-energies").textContent = spectrum.centralEnergies.map(formatEnergy).join(", ");
    byId("edge-weight").textContent = `${(100 * spectrum.edgeWeight).toFixed(1)}%`;
    const regime = winding === 1 && spectrum.edgeWeight > 0.45
      ? "edge"
      : winding === null || spectrum.inverseParticipation < 0.055 ? "extended" : "bulk";
    byId("edge-verdict").textContent = t(regime);
    byId("edge-status").textContent = t(
      regime === "edge" ? "edgeLocalized" : regime === "extended" ? "edgeExtended" : "edgeAbsent",
    );
  }
}

function renderWinding() {
  const path = sshPath({t1: sshState.ratio, t2: 1});
  updateSshReadout();
  drawSshBands(path);
  drawSshWinding(path);
  window.dispatchEvent(new Event("physics-atlas:visualization-rendered"));
}

let chainFlow = null;
function finiteChainFlow() {
  if (!chainFlow) {
    chainFlow = Array.from({length: 41}, (_, index) => {
      const ratio = 1.8 * index / 40;
      return {ratio, spectrum: sshFiniteSpectrum(12, {t1: ratio, t2: 1})};
    });
  }
  return chainFlow;
}

function drawChainSpectrum(currentSpectrum) {
  const canvas = byId("chain-spectrum-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const area = drawPlotFrame(context, canvas.width, canvas.height, {
    rows: 8,
    background: palette.dark,
    grid: palette.darkGrid,
    axis: "#5d727c",
  });
  const maxEnergy = 3;
  const xCanvas = ratio => lerp(area.left, area.right, ratio / 1.8);
  const yCanvas = energy => lerp(area.bottom, area.top, (energy + maxEnergy) / (2 * maxEnergy));
  const flow = finiteChainFlow();

  for (let level = 0; level < flow[0].spectrum.values.length; level += 1) {
    const central = level === 11 || level === 12;
    line(context, flow.map(entry => ({
      x: xCanvas(entry.ratio),
      y: yCanvas(entry.spectrum.values[level]),
    })), {
      stroke: central ? palette.edge : "#708792",
      width: central ? 2.1 : 0.75,
      alpha: central ? 0.98 : 0.53,
    });
  }

  const transitionX = xCanvas(1);
  line(context, [{x: transitionX, y: area.top}, {x: transitionX, y: area.bottom}], {
    stroke: "#a58be0",
    width: 1.2,
    dash: [6, 6],
  });
  context.fillStyle = "#b6a1e8";
  context.font = "800 10px monospace";
  context.textAlign = "center";
  context.fillText("BULK GAP CLOSES", transitionX, area.top + 16);

  const cursorX = xCanvas(sshState.ratio);
  line(context, [{x: cursorX, y: area.top}, {x: cursorX, y: area.bottom}], {
    stroke: palette.highlight,
    width: 2,
  });
  for (const energy of currentSpectrum.values) circle(context, cursorX, yCanvas(energy), 2.5, "#f2f0e9");
  for (const energy of currentSpectrum.centralEnergies) {
    circle(context, cursorX, yCanvas(energy), 5, palette.edge, palette.dark, 1.2);
  }

  context.fillStyle = "#8ca0a9";
  context.font = "700 12px monospace";
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  for (const ratio of [0, 0.5, 1, 1.5, 1.8]) {
    context.fillText(ratio.toFixed(ratio === 0 || ratio === 1 ? 0 : 1), xCanvas(ratio), area.bottom + 27);
  }
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (const energy of [-2, -1, 0, 1, 2]) {
    context.fillText(String(energy).replace("-", "−"), area.left - 12, yCanvas(energy));
  }
  context.fillStyle = "#bac7cc";
  context.font = "italic 15px Georgia";
  context.fillText("t₁/t₂", area.right, area.bottom + 40);
}

function drawEdgeProfile(spectrum) {
  const canvas = byId("edge-profile-canvas");
  const context = canvas.getContext("2d");
  const palette = colors();
  const area = {left: 54, right: canvas.width - 24, top: 34, bottom: canvas.height - 57};
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const maximum = Math.max(...spectrum.density, 0.001) * 1.12;
  const xCanvas = site => lerp(area.left, area.right, site / (spectrum.density.length - 1));
  const yCanvas = probability => lerp(area.bottom, area.top, probability / maximum);
  context.strokeStyle = palette.border;
  for (let index = 0; index <= 4; index += 1) {
    const y = lerp(area.bottom, area.top, index / 4);
    context.beginPath();
    context.moveTo(area.left, y);
    context.lineTo(area.right, y);
    context.stroke();
  }
  for (let site = 0; site < spectrum.density.length - 1; site += 1) {
    const bond = site % 2 === 0 ? sshState.ratio : 1;
    context.strokeStyle = site % 2 === 0 ? "rgba(118,88,189,.43)" : "rgba(0,143,154,.48)";
    context.lineWidth = 1.3 + 2.7 * bond / 1.8;
    context.beginPath();
    context.moveTo(xCanvas(site), area.bottom + 25);
    context.lineTo(xCanvas(site + 1), area.bottom + 25);
    context.stroke();
  }
  const barWidth = Math.max(3, (area.right - area.left) / spectrum.density.length * 0.62);
  spectrum.density.forEach((probability, site) => {
    const x = xCanvas(site);
    const y = yCanvas(probability);
    const color = site % 2 === 0 ? palette.winding : palette.positive;
    context.fillStyle = color;
    context.fillRect(x - barWidth / 2, y, barWidth, area.bottom - y);
    circle(context, x, y, 3, color);
    circle(context, x, area.bottom + 25, 3.5, color);
  });
  context.fillStyle = palette.muted;
  context.font = "700 11px monospace";
  context.textAlign = "center";
  context.fillText("LEFT EDGE", area.left + 28, area.top - 12);
  context.fillText("RIGHT EDGE", area.right - 31, area.top - 12);
  context.textAlign = "right";
  context.fillText("SITE", area.right, area.bottom + 43);
  context.save();
  context.translate(17, area.top);
  context.rotate(-Math.PI / 2);
  context.fillText("AVERAGED PROBABILITY", 0, 0);
  context.restore();
}

function renderEdge() {
  const spectrum = sshFiniteSpectrum(18, {t1: sshState.ratio, t2: 1});
  updateSshReadout(spectrum);
  drawChainSpectrum(sshFiniteSpectrum(12, {t1: sshState.ratio, t2: 1}));
  drawEdgeProfile(spectrum);
  window.dispatchEvent(new Event("physics-atlas:visualization-rendered"));
}

let sshFrame = null;
function scheduleSshRender() {
  if (sshFrame !== null) return;
  sshFrame = requestAnimationFrame(() => {
    sshFrame = null;
    if (PANEL === "edge") renderEdge();
    else renderWinding();
  });
}

function installSshControls() {
  document.querySelectorAll("[data-ssh-ratio]").forEach(input => {
    input.addEventListener("input", () => {
      sshState.ratio = Number(input.value);
      scheduleSshRender();
    });
  });
  document.querySelectorAll("[data-ssh-preset]").forEach(button => {
    button.addEventListener("click", () => {
      sshState.ratio = Number(button.dataset.sshPreset);
      scheduleSshRender();
    });
  });
  if (PANEL !== "winding") return;
  const canvas = byId("ssh-band-canvas");
  const setK = event => {
    const point = canvasPoint(canvas, event);
    const area = {left: 65, right: canvas.width - 25};
    sshState.selectedK = lerp(-Math.PI, Math.PI, clamp(
      (point.x - area.left) / (area.right - area.left), 0, 1,
    ));
    scheduleSshRender();
  };
  canvas.addEventListener("pointerdown", event => {
    canvas.setPointerCapture(event.pointerId);
    setK(event);
  });
  canvas.addEventListener("pointermove", event => {
    if (event.pointerType === "mouse" || canvas.hasPointerCapture(event.pointerId)) setK(event);
  });
  canvas.addEventListener("keydown", event => {
    const step = event.shiftKey ? Math.PI / 4 : Math.PI / 18;
    if (event.key === "ArrowLeft") sshState.selectedK -= step;
    else if (event.key === "ArrowRight") sshState.selectedK += step;
    else return;
    sshState.selectedK = clamp(sshState.selectedK, -Math.PI, Math.PI);
    event.preventDefault();
    scheduleSshRender();
  });
}

localize();
if (PANEL === "map" || PANEL === "transition") {
  installQwzControls();
  renderQwz();
} else {
  installSshControls();
  if (PANEL === "edge") renderEdge();
  else renderWinding();
}
document.documentElement.dataset.appReady = "true";
