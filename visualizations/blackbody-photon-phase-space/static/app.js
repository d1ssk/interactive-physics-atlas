"use strict";

const Physics = window.BlackbodyPhysics;
const byId = id => document.getElementById(id);
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";

const TRANSLATIONS = {
  en: {
    pageTitle: "Blackbody Photon Phase Space — Interactive Physics Vignettes",
    titlePrefix: "Blackbody photons in",
    lede: "Compare low-temperature radiation spread over the sky with high-temperature sunlight confined to one tiny direction.",
    sourceLegendLabel: "Radiation-source legend",
    earthLegend: "Earth · full sky",
    sunLegend: "Sun · solar disk",
    settingsLabel: "Display settings",
    physicalParameters: "Physical parameters",
    earthTemperature: "Earth temperature",
    sunTemperature: "Sun temperature",
    bondAlbedo: "Bond albedo",
    display: "Display",
    frequencyScale: "Radial frequency scale",
    linearScale: "Linear · frequency",
    logScale: "Logarithmic · log₁₀ frequency",
    pointCount: "Number of points",
    pointsLight: "7,000 · light",
    pointsStandard: "13,000 · standard",
    pointsDense: "22,000 · dense",
    solarMagnification: "Solar-disk angular magnification",
    magnificationOne: "×1 · physical angular size",
    magnificationTen: "×10 · visual aid",
    earth: "Earth",
    sun: "Sun",
    resetView: "Reset view",
    integratedQuantitiesLabel: "Integrated quantities",
    integrateSameSpace: "Integrate the same phase space",
    solarAngularRadius: "Solar angular radius",
    solarSolidAngle: "Solar solid angle",
    fractionOfSky: "Fraction of the sky",
    photonRatio: "Photon number, Sun / Earth",
    energyRatio: "Absorbed solar energy / terrestrial energy",
    renderedPoints: "Rendered points, Earth / Sun",
    diagnosticCaveat: "Ideal blackbodies integrated over all frequencies. Bond albedo affects only the energy ratio; wavelength dependence and atmospheric transfer are omitted.",
    phaseSpaceLabel: "Three-dimensional blackbody photon phase space",
    viewerHelp: "Drag: rotate · Shift-drag: pan · Wheel: zoom · Hover: inspect a point",
    zoom: "Zoom",
    spectrumTitle: "Photon number per unit solid angle",
    spectrumLabel: "Earth and solar photon spectra",
    solarDirection: "Solar component within the disk",
    earthPoint: "Earth · full sky",
    sunPoint: "Sun · within disk",
    frequency: "Frequency",
    occupation: "Occupation number",
    density: "Photon density",
    radiusLinearCaption: "linear scale",
    radiusLogCaption: "logarithmic scale",
    spectrumAxisFrequency: "Frequency [Hz]",
    spectrumAxisDensity: "dN/(dV dΩ dlnν) [m⁻³ sr⁻¹]",
  },
  ja: {
    pageTitle: "黒体光子の位相空間 — Interactive Physics Vignettes",
    titlePrefix: "黒体光子の",
    lede: "低温で全天に広がる地球放射と、高温でごく狭い方向に集中する太陽放射を、同じ位相空間で比較します。",
    sourceLegendLabel: "放射源の凡例",
    earthLegend: "地球 · 全天",
    sunLegend: "太陽 · 太陽円盤",
    settingsLabel: "表示設定",
    physicalParameters: "物理パラメータ",
    earthTemperature: "地球温度",
    sunTemperature: "太陽温度",
    bondAlbedo: "Bond albedo",
    display: "表示",
    frequencyScale: "周波数の半径目盛り",
    linearScale: "リニア · 周波数",
    logScale: "対数 · log₁₀ 周波数",
    pointCount: "表示点数",
    pointsLight: "7,000 · 軽量",
    pointsStandard: "13,000 · 標準",
    pointsDense: "22,000 · 高密度",
    solarMagnification: "太陽円盤の角度表示倍率",
    magnificationOne: "×1 · 物理的な角度",
    magnificationTen: "×10 · 観察用",
    earth: "地球",
    sun: "太陽",
    resetView: "視点を戻す",
    integratedQuantitiesLabel: "積分量",
    integrateSameSpace: "同じ位相空間を積分",
    solarAngularRadius: "太陽の角半径",
    solarSolidAngle: "太陽の立体角",
    fractionOfSky: "全天に占める割合",
    photonRatio: "光子数 太陽 / 地球",
    energyRatio: "吸収太陽エネルギー / 地球放射エネルギー",
    renderedPoints: "表示点 地球 / 太陽",
    diagnosticCaveat: "全周波数で積分した理想黒体の値です。Bond albedo はエネルギー比だけに反映し、波長依存性と大気中の放射輸送は省略しています。",
    phaseSpaceLabel: "黒体光子位相空間の3次元表示",
    viewerHelp: "ドラッグ：回転 · Shift＋ドラッグ：移動 · ホイール：拡大 · 点にカーソル：値を表示",
    zoom: "拡大",
    spectrumTitle: "単位立体角あたりの光子数",
    spectrumLabel: "地球と太陽の光子スペクトル",
    solarDirection: "太陽円盤内の太陽成分",
    earthPoint: "地球 · 全天",
    sunPoint: "太陽 · 円盤内",
    frequency: "周波数",
    occupation: "占有数",
    density: "光子密度",
    radiusLinearCaption: "リニア目盛り",
    radiusLogCaption: "対数目盛り",
    spectrumAxisFrequency: "Frequency [Hz]",
    spectrumAxisDensity: "dN/(dV dΩ dlnν) [m⁻³ sr⁻¹]",
  },
};

function t(key) {
  return TRANSLATIONS[LOCALE][key] ?? TRANSLATIONS.en[key] ?? key;
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

const phaseCanvas = byId("phase-space-canvas");
const phaseContext = phaseCanvas.getContext("2d");
const spectrumCanvas = byId("spectrum-canvas");
const spectrumContext = spectrumCanvas.getContext("2d");

const FREQUENCY_MIN = 1e12;
const FREQUENCY_MAX = 1.5e15;
const INNER_RADIUS = 0.14;
const EARTH_COLOR = {red: 45, green: 168, blue: 189, css: "#2da8bd"};
const SUN_COLOR = {red: 223, green: 140, blue: 29, css: "#df8c1d"};
const SOLAR_RADIUS = Physics.solarAngularRadius();
const SOLAR_SOLID_ANGLE = Physics.circularConeSolidAngle(SOLAR_RADIUS);
const RADIAL_TICKS = Object.freeze({
  linear: [0, 300e12, 600e12, 900e12, 1.2e15, 1.5e15],
  log: [1e12, 10e12, 100e12, 1e15, 1.5e15],
});
const INITIAL_YAW = -0.72;
const INITIAL_PITCH = -0.36;
const DRAG_ROTATION_SPEED = 0.008;

function multiplyRotations(left, right) {
  return left.map((row, rowIndex) =>
    row.map((_, columnIndex) =>
      row.reduce(
        (sum, __, innerIndex) => sum + left[rowIndex][innerIndex] * right[innerIndex][columnIndex],
        0,
      ),
    ),
  );
}

function rotationAroundScreenX(angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    [1, 0, 0],
    [0, cosine, -sine],
    [0, sine, cosine],
  ];
}

function rotationAroundScreenY(angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    [cosine, 0, sine],
    [0, 1, 0],
    [-sine, 0, cosine],
  ];
}

function initialViewRotation() {
  return multiplyRotations(
    rotationAroundScreenX(INITIAL_PITCH),
    rotationAroundScreenY(INITIAL_YAW),
  );
}

const state = {
  points: [],
  hitPoints: [],
  viewRotation: initialViewRotation(),
  zoom: 1,
  panX: 0,
  panY: 0,
  dragging: null,
  hoveredPoint: null,
  tooltipAwaitingMathJax: false,
  pointCounts: {earth: 0, sun: 0},
  solarDirection: null,
};

function parameters() {
  return {
    earthTemperature: Number(byId("earth-temperature").value),
    sunTemperature: Number(byId("sun-temperature").value),
    bondAlbedo: Number(byId("bond-albedo").value),
    frequencyScale: byId("frequency-scale").value,
    pointCount: Number(byId("point-count").value),
    solarMagnification: Number(byId("solar-magnification").value),
    showEarth: byId("show-earth").checked,
    showSun: byId("show-sun").checked,
  };
}

function halton(index, base) {
  let fraction = 1;
  let result = 0;
  let remaining = index;
  while (remaining > 0) {
    fraction /= base;
    result += fraction * (remaining % base);
    remaining = Math.floor(remaining / base);
  }
  return result;
}

function resizeCanvas(canvas, context) {
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

function logarithmicRange(minimum, maximum, count) {
  const values = [];
  const logMinimum = Math.log(minimum);
  const logSpan = Math.log(maximum) - logMinimum;
  for (let index = 0; index < count; index += 1) {
    values.push(Math.exp(logMinimum + logSpan * index / (count - 1)));
  }
  return values;
}

function frequencyRadius(frequency, scale = byId("frequency-scale").value) {
  const fraction = scale === "linear"
    ? frequency / FREQUENCY_MAX
    : Math.log(frequency / FREQUENCY_MIN) / Math.log(FREQUENCY_MAX / FREQUENCY_MIN);
  return INNER_RADIUS + (1 - INNER_RADIUS) * Math.max(0, Math.min(1, fraction));
}

function cross(left, right) {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function normalized(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  return {x: vector.x / length, y: vector.y / length, z: vector.z / length};
}

function offsetDirection(center, angle, azimuth) {
  const reference = Math.abs(center.y) < 0.9 ? {x: 0, y: 1, z: 0} : {x: 1, y: 0, z: 0};
  const tangentX = normalized(cross(reference, center));
  const tangentY = cross(center, tangentX);
  const sine = Math.sin(angle);
  const tangentXWeight = sine * Math.cos(azimuth);
  const tangentYWeight = sine * Math.sin(azimuth);
  return {
    x: Math.cos(angle) * center.x + tangentXWeight * tangentX.x + tangentYWeight * tangentY.x,
    y: Math.cos(angle) * center.y + tangentXWeight * tangentX.y + tangentYWeight * tangentY.y,
    z: Math.cos(angle) * center.z + tangentXWeight * tangentX.z + tangentYWeight * tangentY.z,
  };
}

function photonFrequencySampler(temperature) {
  const gridCount = 1800;
  const logMinimum = Math.log(FREQUENCY_MIN);
  const interval = (Math.log(FREQUENCY_MAX) - logMinimum) / gridCount;
  const frequencies = [FREQUENCY_MIN];
  const cumulative = [0];
  let previous = Physics.photonNumberPerLogFrequencySolidAngle(FREQUENCY_MIN, temperature);
  let integral = 0;
  for (let index = 1; index <= gridCount; index += 1) {
    const frequency = Math.exp(logMinimum + index * interval);
    const current = Physics.photonNumberPerLogFrequencySolidAngle(frequency, temperature);
    integral += 0.5 * (previous + current) * interval;
    frequencies.push(frequency);
    cumulative.push(integral);
    previous = current;
  }

  function frequencyAtQuantile(quantile) {
    const target = Math.max(0, Math.min(1, quantile)) * integral;
    let low = 0;
    let high = cumulative.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (cumulative[middle] < target) low = middle;
      else high = middle;
    }
    const span = cumulative[high] - cumulative[low];
    const fraction = span > 0 ? (target - cumulative[low]) / span : 0;
    const logFrequency = Math.log(frequencies[low])
      + fraction * (Math.log(frequencies[high]) - Math.log(frequencies[low]));
    return Math.exp(logFrequency);
  }

  return {frequencyAtQuantile, integral};
}

function earthDirectionAt(index) {
  const y = 1 - 2 * halton(index, 2);
  const horizontal = Math.sqrt(Math.max(0, 1 - y * y));
  const azimuth = 2 * Math.PI * halton(index, 3);
  return {x: horizontal * Math.cos(azimuth), y, z: horizontal * Math.sin(azimuth)};
}

function solarDirectionAt(index, center, magnification) {
  const solidAngleFraction = halton(index, 2);
  const cosineOffset = 1 - solidAngleFraction * (1 - Math.cos(SOLAR_RADIUS));
  const physicalOffset = Math.acos(cosineOffset);
  return {
    direction: offsetDirection(
      center,
      physicalOffset * magnification,
      2 * Math.PI * halton(index, 3),
    ),
    physicalOffset,
  };
}

function createPoint(source, direction, frequency, temperature, physicalOffset = null) {
  const radius = frequencyRadius(frequency);
  return {
    source,
    frequency,
    physicalOffset,
    x: radius * direction.x,
    y: radius * direction.y,
    z: radius * direction.z,
    density: Physics.photonNumberPerLogFrequencySolidAngle(frequency, temperature),
  };
}

function createDensityGeometry(current) {
  const earthSampler = photonFrequencySampler(current.earthTemperature);
  const sunSampler = photonFrequencySampler(current.sunTemperature);
  const earthBandDensity = 4 * Math.PI * earthSampler.integral;
  const sunBandDensity = SOLAR_SOLID_ANGLE * sunSampler.integral;
  const solarFraction = sunBandDensity / (earthBandDensity + sunBandDensity);
  const sunCount = Math.round(current.pointCount * solarFraction);
  const earthCount = current.pointCount - sunCount;
  const center = Physics.directionFromAzimuthElevation(0.58, 0.28);
  const points = [];

  for (let index = 1; index <= earthCount; index += 1) {
    const frequency = earthSampler.frequencyAtQuantile(halton(index, 5));
    points.push(createPoint("earth", earthDirectionAt(index), frequency, current.earthTemperature));
  }
  for (let index = 1; index <= sunCount; index += 1) {
    const sample = solarDirectionAt(index, center, current.solarMagnification);
    const frequency = sunSampler.frequencyAtQuantile(halton(index, 5));
    points.push(
      createPoint("sun", sample.direction, frequency, current.sunTemperature, sample.physicalOffset),
    );
  }
  state.solarDirection = center;
  state.pointCounts = {earth: earthCount, sun: sunCount};
  return points;
}

function regenerateGeometry() {
  state.points = createDensityGeometry(parameters());
  updateLabelsAndDiagnostics();
  drawSpectrum();
  render();
}

function project(point, width, height) {
  const coordinates = [point.x, point.y, point.z];
  const [rotatedX, rotatedY, rotatedZ] = state.viewRotation.map(row =>
    row.reduce((sum, coefficient, index) => sum + coefficient * coordinates[index], 0),
  );
  const perspective = 3.7 / (3.7 - rotatedZ);
  const scale = Math.min(width, height) * 0.43 * state.zoom;
  return {
    x: width / 2 + state.panX + rotatedX * scale * perspective,
    y: height / 2 + state.panY - rotatedY * scale * perspective,
    z: rotatedZ,
    perspective,
  };
}

function drawPolyline3d(points, width, height, strokeStyle, lineWidth = 1) {
  phaseContext.beginPath();
  points.forEach((point, index) => {
    const projected = project(point, width, height);
    if (index === 0) phaseContext.moveTo(projected.x, projected.y);
    else phaseContext.lineTo(projected.x, projected.y);
  });
  phaseContext.strokeStyle = strokeStyle;
  phaseContext.lineWidth = lineWidth;
  phaseContext.stroke();
}

function circlePoints(radius, plane) {
  const points = [];
  for (let index = 0; index <= 80; index += 1) {
    const angle = 2 * Math.PI * index / 80;
    if (plane === "xy") points.push({x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0});
    else points.push({x: radius * Math.cos(angle), y: 0, z: radius * Math.sin(angle)});
  }
  return points;
}

function formatFrequency(frequency) {
  const terahertz = frequency / 1e12;
  if (terahertz === 0) return "0";
  if (terahertz >= 1000) return `${(terahertz / 1000).toFixed(terahertz === 1000 ? 0 : 1)} PHz`;
  if (terahertz >= 10) return `${terahertz.toFixed(0)} THz`;
  return `${terahertz.toFixed(1)} THz`;
}

function drawFrequencyGrid(width, height) {
  const ticks = RADIAL_TICKS[parameters().frequencyScale];
  phaseContext.save();
  for (const frequency of ticks) {
    const radius = frequencyRadius(frequency);
    drawPolyline3d(circlePoints(radius, "xy"), width, height, "rgb(145 176 192 / 18%)");
    drawPolyline3d(circlePoints(radius, "xz"), width, height, "rgb(145 176 192 / 13%)");
    const labelPosition = project({x: radius, y: 0, z: 0}, width, height);
    phaseContext.fillStyle = "rgb(190 211 221 / 72%)";
    phaseContext.font = "10px ui-monospace, monospace";
    phaseContext.fillText(formatFrequency(frequency), labelPosition.x + 5, labelPosition.y - 4);
  }
  phaseContext.restore();
}

function drawSolarAxis(width, height) {
  if (!state.solarDirection || !parameters().showSun) return;
  const direction = state.solarDirection;
  const line = [INNER_RADIUS, 1.04].map(radius => ({
    x: radius * direction.x,
    y: radius * direction.y,
    z: radius * direction.z,
  }));
  drawPolyline3d(line, width, height, "rgb(223 140 29 / 62%)", 1.2);
  const labelPosition = project(line[1], width, height);
  phaseContext.fillStyle = SUN_COLOR.css;
  phaseContext.font = "700 11px ui-monospace, monospace";
  phaseContext.fillText("Ω☉", labelPosition.x + 6, labelPosition.y - 5);
}

function render() {
  const {width, height} = resizeCanvas(phaseCanvas, phaseContext);
  const background = phaseContext.createRadialGradient(
    width * 0.5,
    height * 0.47,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.7,
  );
  background.addColorStop(0, "#10212d");
  background.addColorStop(0.55, "#08131c");
  background.addColorStop(1, "#03080c");
  phaseContext.fillStyle = background;
  phaseContext.fillRect(0, 0, width, height);
  drawFrequencyGrid(width, height);
  drawSolarAxis(width, height);

  const current = parameters();
  const projected = [];
  for (const point of state.points) {
    if ((point.source === "earth" && !current.showEarth)
      || (point.source === "sun" && !current.showSun)) continue;
    projected.push({...project(point, width, height), point});
  }
  projected.sort((left, right) => left.z - right.z);
  state.hitPoints = [];

  phaseContext.save();
  phaseContext.globalCompositeOperation = "lighter";
  for (const item of projected) {
    const color = item.point.source === "earth" ? EARTH_COLOR : SUN_COLOR;
    const depth = Math.max(0, Math.min(1, 0.5 + item.z / 2));
    const alpha = 0.29 * (0.76 + 0.24 * depth);
    const pointRadius = item.point.source === "earth" ? 1.25 : 1.45;
    phaseContext.fillStyle = `rgb(${color.red} ${color.green} ${color.blue} / ${alpha.toFixed(3)})`;
    phaseContext.beginPath();
    phaseContext.arc(item.x, item.y, pointRadius, 0, 2 * Math.PI);
    phaseContext.fill();
    state.hitPoints.push(item);
  }
  phaseContext.restore();

  const origin = project({x: 0, y: 0, z: 0}, width, height);
  phaseContext.fillStyle = "rgb(225 239 245 / 78%)";
  phaseContext.beginPath();
  phaseContext.arc(origin.x, origin.y, 2, 0, 2 * Math.PI);
  phaseContext.fill();
  byId("zoom-readout").textContent = `${t("zoom")} ${state.zoom < 10 ? state.zoom.toFixed(2) : state.zoom.toFixed(1)}×`;
}

function superscript(value) {
  const characters = {"-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"};
  return String(value).split("").map(character => characters[character]).join("");
}

function formatScientificLatex(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "\\(0\\)";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  return `\\(${mantissa.toFixed(digits)}\\times10^{${exponent}}\\)`;
}

function typesetElements(elements) {
  if (!window.MathJax?.startup?.promise) return false;
  window.MathJax.startup.promise.then(() => {
    window.MathJax.typesetClear(elements);
    return window.MathJax.typesetPromise(elements);
  }).then(() => window.dispatchEvent(new Event("physics-atlas:mathjax-ready")));
  return true;
}

function updateLabelsAndDiagnostics() {
  const current = parameters();
  byId("earth-temperature-output").textContent = `${current.earthTemperature} K`;
  byId("sun-temperature-output").textContent = `${current.sunTemperature} K`;
  byId("bond-albedo-output").textContent = current.bondAlbedo.toFixed(2);
  const radiusLabel = byId("frequency-radius-label");
  radiusLabel.innerHTML = current.frequencyScale === "linear"
    ? `\\(r(\\nu)\\) · ${t("radiusLinearCaption")}`
    : `\\(r(\\nu)\\) · ${t("radiusLogCaption")}`;
  byId("frequency-radius-range").textContent = current.frequencyScale === "linear"
    ? "0 → 1.5 PHz"
    : "1 THz → 1.5 PHz";

  const angleDegrees = SOLAR_RADIUS * 180 / Math.PI;
  const skyFraction = SOLAR_SOLID_ANGLE / (4 * Math.PI);
  const earthPhotons = Physics.photonDensityInSolidAngle(current.earthTemperature, 4 * Math.PI);
  const solarPhotons = Physics.photonDensityInSolidAngle(current.sunTemperature, SOLAR_SOLID_ANGLE);
  const earthEnergy = Physics.energyDensityInSolidAngle(current.earthTemperature, 4 * Math.PI);
  const solarEnergy = Physics.absorbedEnergyDensityInSolidAngle(
    current.sunTemperature,
    SOLAR_SOLID_ANGLE,
    current.bondAlbedo,
  );
  byId("solar-angle").textContent = `${angleDegrees.toFixed(4)}°`;
  byId("solar-solid-angle").textContent = `${(SOLAR_SOLID_ANGLE * 1e6).toFixed(2)} µsr`;
  byId("solar-sky-fraction").textContent = `${(skyFraction * 100).toFixed(6)} %`;
  byId("photon-ratio").textContent = (solarPhotons / earthPhotons).toFixed(4);
  byId("energy-ratio").textContent = (solarEnergy / earthEnergy).toFixed(4);
  byId("rendered-points").textContent = `${state.pointCounts.earth.toLocaleString(LOCALE)} / ${state.pointCounts.sun.toLocaleString(LOCALE)}`;
  typesetElements([radiusLabel]);
}

function chartCoordinates(frequency, value, bounds, plot) {
  const x = plot.left + plot.width
    * Math.log(frequency / FREQUENCY_MIN) / Math.log(FREQUENCY_MAX / FREQUENCY_MIN);
  const logValue = Math.log10(Math.max(value, 10 ** bounds.minimum));
  const y = plot.top + plot.height * (bounds.maximum - logValue)
    / (bounds.maximum - bounds.minimum);
  return {x, y};
}

function drawSpectrumLine(values, bounds, plot, color) {
  spectrumContext.beginPath();
  values.forEach((item, index) => {
    const point = chartCoordinates(item.frequency, item.value, bounds, plot);
    if (index === 0) spectrumContext.moveTo(point.x, point.y);
    else spectrumContext.lineTo(point.x, point.y);
  });
  spectrumContext.strokeStyle = color;
  spectrumContext.lineWidth = 1.8;
  spectrumContext.stroke();
}

function drawSpectrum() {
  const {width, height} = resizeCanvas(spectrumCanvas, spectrumContext);
  spectrumContext.clearRect(0, 0, width, height);
  const current = parameters();
  const frequencies = logarithmicRange(FREQUENCY_MIN, FREQUENCY_MAX, 180);
  const earthValues = frequencies.map(frequency => ({
    frequency,
    value: Physics.photonNumberPerLogFrequencySolidAngle(frequency, current.earthTemperature),
  }));
  const sunValues = frequencies.map(frequency => ({
    frequency,
    value: Physics.photonNumberPerLogFrequencySolidAngle(frequency, current.sunTemperature),
  }));
  let maximumValue = 0;
  for (const item of [...earthValues, ...sunValues]) maximumValue = Math.max(maximumValue, item.value);
  const maximum = Math.ceil(Math.log10(maximumValue));
  const bounds = {maximum, minimum: maximum - 13};
  const plot = {left: 73, right: 10, top: 8, bottom: 43};
  plot.width = width - plot.left - plot.right;
  plot.height = height - plot.top - plot.bottom;

  spectrumContext.font = "9px ui-monospace, monospace";
  spectrumContext.lineWidth = 1;
  for (let index = 0; index <= 4; index += 1) {
    const exponent = Math.round(bounds.minimum + (bounds.maximum - bounds.minimum) * index / 4);
    const y = plot.top + plot.height * (bounds.maximum - exponent)
      / (bounds.maximum - bounds.minimum);
    spectrumContext.strokeStyle = "rgb(101 128 143 / 22%)";
    spectrumContext.beginPath();
    spectrumContext.moveTo(plot.left, y);
    spectrumContext.lineTo(plot.left + plot.width, y);
    spectrumContext.stroke();
    spectrumContext.fillStyle = "#738995";
    spectrumContext.textAlign = "right";
    spectrumContext.fillText(`10${superscript(exponent)}`, plot.left - 6, y + 3);
  }

  for (const frequency of [1e12, 10e12, 100e12, 1e15]) {
    const x = chartCoordinates(frequency, 10 ** bounds.minimum, bounds, plot).x;
    spectrumContext.strokeStyle = "rgb(101 128 143 / 18%)";
    spectrumContext.beginPath();
    spectrumContext.moveTo(x, plot.top);
    spectrumContext.lineTo(x, plot.top + plot.height);
    spectrumContext.stroke();
    spectrumContext.fillStyle = "#738995";
    spectrumContext.textAlign = "center";
    spectrumContext.fillText(formatFrequency(frequency), x, height - 23);
  }
  spectrumContext.save();
  spectrumContext.beginPath();
  spectrumContext.rect(plot.left, plot.top, plot.width, plot.height);
  spectrumContext.clip();
  drawSpectrumLine(earthValues, bounds, plot, EARTH_COLOR.css);
  drawSpectrumLine(sunValues, bounds, plot, SUN_COLOR.css);
  spectrumContext.restore();

  spectrumContext.fillStyle = "#617783";
  spectrumContext.font = "9px ui-monospace, monospace";
  spectrumContext.textAlign = "center";
  spectrumContext.fillText(t("spectrumAxisFrequency"), plot.left + plot.width / 2, height - 5);
  spectrumContext.save();
  spectrumContext.translate(width < 520 ? 10 : 13, height / 2);
  spectrumContext.rotate(-Math.PI / 2);
  spectrumContext.font = "9px ui-monospace, monospace";
  spectrumContext.fillText(t("spectrumAxisDensity"), 0, 0);
  spectrumContext.restore();
}

function hideTooltip() {
  byId("tooltip").hidden = true;
  state.hoveredPoint = null;
}

function showTooltip(event) {
  if (state.dragging) return;
  const rectangle = phaseCanvas.getBoundingClientRect();
  const x = event.clientX - rectangle.left;
  const y = event.clientY - rectangle.top;
  let nearest = null;
  let nearestDistanceSquared = 90;
  for (const item of state.hitPoints) {
    const distanceSquared = (item.x - x) ** 2 + (item.y - y) ** 2;
    if (distanceSquared < nearestDistanceSquared) {
      nearest = item;
      nearestDistanceSquared = distanceSquared;
    }
  }
  const tooltip = byId("tooltip");
  if (!nearest) {
    hideTooltip();
    return;
  }
  if (nearest.point !== state.hoveredPoint || tooltip.hidden) {
    const isEarth = nearest.point.source === "earth";
    const color = isEarth ? EARTH_COLOR.css : SUN_COLOR.css;
    const temperature = isEarth ? parameters().earthTemperature : parameters().sunTemperature;
    const occupation = Physics.occupationNumber(nearest.point.frequency, temperature);
    tooltip.style.setProperty("--tooltip-color", color);
    tooltip.innerHTML = `<strong>${t(isEarth ? "earthPoint" : "sunPoint")}</strong><br>`
      + `${t("frequency")} = ${formatFrequency(nearest.point.frequency)}<br>`
      + `${t("occupation")} = ${formatScientificLatex(occupation, 3)}<br>`
      + `${t("density")} = ${formatScientificLatex(nearest.point.density, 3)} m⁻³ sr⁻¹`;
    tooltip.hidden = false;
    state.hoveredPoint = nearest.point;
    if (!typesetElements([tooltip]) && !state.tooltipAwaitingMathJax) {
      state.tooltipAwaitingMathJax = true;
      window.addEventListener("physics-atlas:mathjax-ready", () => {
        state.tooltipAwaitingMathJax = false;
        if (!tooltip.hidden) typesetElements([tooltip]);
      }, {once: true});
    }
  }
  const maximumLeft = rectangle.width - tooltip.offsetWidth - 9;
  const maximumTop = rectangle.height - tooltip.offsetHeight - 9;
  tooltip.style.left = `${Math.max(9, Math.min(maximumLeft, x + 14))}px`;
  tooltip.style.top = `${Math.max(9, Math.min(maximumTop, y + 14))}px`;
}

function resetView() {
  state.viewRotation = initialViewRotation();
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  render();
}

phaseCanvas.addEventListener("pointerdown", event => {
  phaseCanvas.setPointerCapture(event.pointerId);
  state.dragging = {
    x: event.clientX,
    y: event.clientY,
    mode: event.shiftKey || event.button === 1 ? "pan" : "rotate",
  };
  hideTooltip();
});

phaseCanvas.addEventListener("pointermove", event => {
  if (!state.dragging) {
    showTooltip(event);
    return;
  }
  const deltaX = event.clientX - state.dragging.x;
  const deltaY = event.clientY - state.dragging.y;
  if (state.dragging.mode === "pan") {
    state.panX += deltaX;
    state.panY += deltaY;
  } else {
    const horizontalRotation = rotationAroundScreenY(deltaX * DRAG_ROTATION_SPEED);
    const verticalRotation = rotationAroundScreenX(deltaY * DRAG_ROTATION_SPEED);
    // Pre-multiply so the drag axes stay fixed to the screen at every viewing angle.
    state.viewRotation = multiplyRotations(
      verticalRotation,
      multiplyRotations(horizontalRotation, state.viewRotation),
    );
  }
  state.dragging = {...state.dragging, x: event.clientX, y: event.clientY};
  render();
});

function finishDragging(event) {
  if (phaseCanvas.hasPointerCapture(event.pointerId)) phaseCanvas.releasePointerCapture(event.pointerId);
  state.dragging = null;
}

phaseCanvas.addEventListener("pointerup", finishDragging);
phaseCanvas.addEventListener("pointercancel", finishDragging);
phaseCanvas.addEventListener("pointerleave", event => {
  if (!state.dragging) hideTooltip();
  if (state.dragging && event.buttons === 0) finishDragging(event);
});
phaseCanvas.addEventListener("wheel", event => {
  event.preventDefault();
  const rectangle = phaseCanvas.getBoundingClientRect();
  const cursorX = event.clientX - rectangle.left - rectangle.width / 2;
  const cursorY = event.clientY - rectangle.top - rectangle.height / 2;
  const previousZoom = state.zoom;
  state.zoom = Math.max(0.3, Math.min(20, state.zoom * Math.exp(-event.deltaY * 0.0015)));
  const zoomRatio = state.zoom / previousZoom;
  state.panX = cursorX - zoomRatio * (cursorX - state.panX);
  state.panY = cursorY - zoomRatio * (cursorY - state.panY);
  render();
}, {passive: false});
phaseCanvas.addEventListener("contextmenu", event => event.preventDefault());

byId("earth-temperature").addEventListener("input", regenerateGeometry);
byId("sun-temperature").addEventListener("input", regenerateGeometry);
byId("bond-albedo").addEventListener("input", updateLabelsAndDiagnostics);
byId("frequency-scale").addEventListener("change", regenerateGeometry);
byId("point-count").addEventListener("change", regenerateGeometry);
byId("solar-magnification").addEventListener("change", regenerateGeometry);
byId("show-earth").addEventListener("change", render);
byId("show-sun").addEventListener("change", render);
byId("reset-view").addEventListener("click", resetView);
window.addEventListener("resize", () => {
  drawSpectrum();
  render();
});

applyLocale();
regenerateGeometry();
