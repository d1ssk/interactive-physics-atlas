import {
  C_ZERO,
  TAU,
  add,
  branchOffsetsFromContinuation,
  compileExpression,
  complex,
  continuationSummary,
  createContinuationState,
  divide,
  isFiniteComplex,
  magnitude,
  relativeComplexDistance,
  subtract,
  trapezoidContribution,
} from "./physics.mjs";

const FIELD_SIZE = 400;
const PREVIEW_FIELD_SIZE = 180;
const RENDER_SETTLE_DELAY = 140;

const STRINGS = {
  en: {
    documentTitle: "Complex Function Explorer — Interactive Physics Atlas",
    siteNavLabel: "Site navigation",
    title: "Complex Function Explorer",
    lede: "Explore values of complex functions, the branch structure of multivalued functions, and contour integrals on the same input plane.",
    functionHeading: "Function",
    loadingExpression: "Loading expression…",
    inputForm: "Input form",
    modeHolomorphic: "Expression in z (locally holomorphic)",
    modeXY: "General f(x, y)",
    modeZbar: "General f(z, z̄)",
    updatePlot: "Update plot",
    availableSyntax: "Available:",
    implicitMultiplication: "(implicit multiplication such as 2z is accepted)",
    presetLabel: "Function presets",
    presetTwoBranch: "Branch points at ±1",
    presetLog: "Logarithmic sheets",
    presetThreeBranch: "Three branch points",
    presetResidue: "Residue test",
    presetEssential: "Essential singularity",
    presetZbar: "Non-holomorphic z̄",
    presetXY: "General f(x,y)",
    display: "Display",
    displayDomain: "Hue = phase, brightness = amplitude",
    displayComponents: "Two panels: real / imaginary",
    plotRange: "Plot range",
    initialBranch: "Initial branch",
    followSheet: "Move the background to the path's sheet",
    showCuts: "Principal-value discontinuity candidates",
    showContours: "Contours",
    amplitudePhase: "Amplitude and phase",
    panelDomain: "domain coloring: f(z)",
    backgroundDisplay: "Background",
    tryCircle: "Try a circular path",
    clearPath: "Clear path",
    rendering: "Rendering…",
    canvasLabel: "Complex input plane. Drag to draw an integration path.",
    canvasImaginaryLabel: "Imaginary-part view of the complex input plane. Drag to draw an integration path.",
    colorLegendLabel: "Color legend",
    domainLegend: "Hue shows arg f and brightness shows |f|/(1+|f|). Dashed marks indicate detected branch-cut candidates.",
    dragInstruction: "Drag on the plane to begin a contour integral. Return to the starting ring to close it.",
    currentValue: "Value at the current point",
    backgroundValue: "Background-sheet f(z)",
    continuedValue: "Pathwise f(z)",
    contourIntegral: "Contour integral",
    idle: "Idle",
    trapezoidRule: "Incremental trapezoidal rule:",
    integralPlaneLabel: "Path of the integral value in the complex plane",
    integralPlane: "Integral-value plane",
    path: "Path",
    pathSheet: "Sheet along path",
    endStart: "End value / start value",
    liftedPath: "Lifted path",
    methodHeading: "How branch following works",
    methodText: "The background evaluates one branch point by point. During a drag, each multivalued operation unwraps its argument continuously. When the path crosses a displayed cut, the background is redrawn on the branch selected by that crossing direction.",
    riemannText: "A branch cut is a convention for drawing a single-valued chart. The precise operation here is analytic continuation, or lifting the path to the Riemann surface. A path closed in the base plane need not close after this lift.",
    initialBranchText: "initial branch k={index}",
    fixedBranchText: "fixed branch k={index}{suffix}",
    pathSuffix: " · path {sheet}",
    positiveDirection: "crossed in the positive direction; {sheet}",
    negativeDirection: "crossed in the negative direction; {sheet}",
    undefinedValue: "undefined",
    sheetFollowed: "{change}. The background moved to the analytically continued sheet.",
    sheetFixed: "{change}. Only the path value was analytically continued; the background remains fixed.",
    closedSkipped: "The path is closed. {count} segment(s) touching a singularity or non-finite value were omitted from the integral.",
    closedConfirmed: "The path is closed and the integral is final. End/start also shows the monodromy.",
    statusDrawing: "Integrating",
    statusOpen: "Provisional",
    statusClosed: "Final",
    pathMeasure: "{count} points / length {length}",
    singleValued: "single-valued",
    closesSame: "closes at the same value",
    liftOpen: "ends at another value (open lift)",
    baseOpen: "not closed in the base plane",
    evaluationFailure: "contains unevaluable segments",
    drawingStatus: "Integrating. Return to the cyan starting ring to close the path and finalize the integral.",
    provisionalStatus: "The path did not return to its start, so the integral remains provisional. Drag again to start a new path.",
    genericCircle: "Circular path centered at the origin.",
    realImaginary: "Real and imaginary parts",
    componentLegend: "Blue is negative, white is zero, and red is positive. The current robust automatic scale is about ±{scale}.",
    parsed: "Expression parsed",
    presetLoaded: "Preset loaded",
    followEnabled: "The background moved to the current analytically continued sheet and will follow later cut crossings.",
    followNext: "The background will follow the analytically continued sheet on the next integration path.",
    followDisabled: "The background returned to the path's initial fixed sheet. Analytic continuation along the path remains active.",
    presetTwoBranchDescription: "A circuit around either one of ±1 reverses the sign of the square root.",
    presetLogDescription: "Each circuit around the origin continues log(z) to a value differing by 2πi.",
    presetThreeBranchDescription: "The circular path encloses only the origin among the three finite branch points.",
    presetResidueDescription: "A positively oriented circle approaches the residue-theorem value.",
    presetEssentialDescription: "Domain coloring reveals the essential singularity near the origin.",
    presetZbarDescription: "A closed contour integral of a map involving z̄ need not vanish.",
    presetXYDescription: "A general complex-valued field built from independent x and y variables.",
  },
  ja: {
    documentTitle: "複素関数エクスプローラ — Interactive Physics Atlas",
    siteNavLabel: "サイトナビゲーション",
    title: "複素関数エクスプローラ",
    lede: "複素関数の値、多価関数の分枝構造、線積分を同じ入力平面上で調べます。",
    functionHeading: "関数",
    loadingExpression: "式を読み込んでいます…",
    inputForm: "入力形式",
    modeHolomorphic: "z の式（局所的に正則）",
    modeXY: "一般の f(x, y)",
    modeZbar: "一般の f(z, z̄)",
    updatePlot: "プロットを更新",
    availableSyntax: "使用可能:",
    implicitMultiplication: "（2z のような積の省略も可）",
    presetLabel: "関数プリセット",
    presetTwoBranch: "±1 の branch point",
    presetLog: "対数の sheet",
    presetThreeBranch: "3つの branch point",
    presetResidue: "留数の確認",
    presetEssential: "真性特異点",
    presetZbar: "非正則な z̄",
    presetXY: "一般の f(x,y)",
    display: "表示",
    displayDomain: "色相＝位相、明るさ＝振幅",
    displayComponents: "2パネル：実部／虚部",
    plotRange: "表示範囲",
    initialBranch: "初期 branch",
    followSheet: "背景を経路の sheet に追従",
    showCuts: "主値の不連続候補",
    showContours: "等高線",
    amplitudePhase: "振幅と位相",
    panelDomain: "domain coloring: f(z)",
    backgroundDisplay: "背景",
    tryCircle: "円経路を試す",
    clearPath: "経路を消去",
    rendering: "描画中…",
    canvasLabel: "複素入力平面。ドラッグして積分経路を描けます。",
    canvasImaginaryLabel: "虚部を表示した複素入力平面。ドラッグして積分経路を描けます。",
    colorLegendLabel: "色の凡例",
    domainLegend: "色相は arg f、明るさは |f|/(1+|f|)。破線は検出した branch cut 候補です。",
    dragInstruction: "平面上をドラッグすると線積分を始めます。始点の輪へ戻ると自動的に閉じます。",
    currentValue: "現在点での値",
    backgroundValue: "背景 sheet の f(z)",
    continuedValue: "経路に沿った f(z)",
    contourIntegral: "線積分",
    idle: "待機",
    trapezoidRule: "逐次台形則:",
    integralPlaneLabel: "複素平面上での積分値の軌跡",
    integralPlane: "積分値の複素平面",
    path: "経路",
    pathSheet: "経路上の sheet",
    endStart: "終値／初値",
    liftedPath: "持ち上げた経路",
    methodHeading: "branch の追跡方法",
    methodText: "背景は各点で一つの branch を評価します。ドラッグ中は多価演算ごとに偏角を連続的にほどきます。表示中の cut を横切ると、横切った向きから選ばれる branch で背景を描き直します。",
    riemannText: "branch cut は一価の座標表示を作るための規約です。ここで行っている操作を正確に言えば解析接続、すなわち経路をリーマン面へ持ち上げることです。底空間で閉じた経路が、持ち上げた先でも閉じるとは限りません。",
    initialBranchText: "開始 branch k={index}",
    fixedBranchText: "固定 branch k={index}{suffix}",
    pathSuffix: " · 経路 {sheet}",
    positiveDirection: "正方向へ横切り、{sheet}",
    negativeDirection: "負方向へ横切り、{sheet}",
    undefinedValue: "未定義",
    sheetFollowed: "{change}。背景を解析接続先の sheet へ移しました。",
    sheetFixed: "{change}。経路上の値だけを解析接続し、背景は固定しています。",
    closedSkipped: "経路を閉じました。ただし特異点または非有限値に触れた {count} 区間は積分から除外されています。",
    closedConfirmed: "経路を閉じ、積分値を確定しました。終値／初値でモノドロミーも確認できます。",
    statusDrawing: "積分中",
    statusOpen: "暫定値",
    statusClosed: "確定",
    pathMeasure: "{count} 点 / 長さ {length}",
    singleValued: "一価",
    closesSame: "同じ値へ閉じる",
    liftOpen: "別の値へ到着（開いた lift）",
    baseOpen: "底空間で未閉鎖",
    evaluationFailure: "評価不能区間あり",
    drawingStatus: "積分中です。水色の始点リングへ戻ると経路を閉じ、積分値を確定します。",
    provisionalStatus: "始点へ戻らずに終了したため積分値は暫定です。もう一度ドラッグすると新しい経路を開始します。",
    genericCircle: "原点を中心とする円経路です。",
    realImaginary: "実部と虚部",
    componentLegend: "青は負、白は0、赤は正です。外れ値に頑健な現在の自動スケールは約 ±{scale} です。",
    parsed: "式を解釈しました",
    presetLoaded: "プリセットを読み込みました",
    followEnabled: "背景を現在の解析接続先の sheet へ移しました。以後は cut 通過に追従します。",
    followNext: "次の積分経路で、背景が解析接続先の sheet へ自動追従します。",
    followDisabled: "背景を積分開始時の固定 sheet へ戻しました。経路上の解析接続は継続します。",
    presetTwoBranchDescription: "±1 の一方だけを一周すると平方根の符号が反転します。",
    presetLogDescription: "原点を一周するたびに log(z) は 2πi ずつ別の値へ続きます。",
    presetThreeBranchDescription: "3つの有限 branch point のうち、原点だけを囲みます。",
    presetResidueDescription: "正向きの円では積分値が留数定理の値へ近づきます。",
    presetEssentialDescription: "原点近傍の真性特異点を domain coloring で観察します。",
    presetZbarDescription: "z̄ を含む非正則写像では閉曲線積分が一般には消えません。",
    presetXYDescription: "x と y を独立変数として作った一般の複素値場です。",
  },
};

const locale = (() => {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "ja") return requested;
  return window.location.pathname.split("/").includes("ja") ? "ja" : "en";
})();

function t(key, values = {}) {
  const template = STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/gu, (_match, name) => String(values[name] ?? ""));
}

function applyLocale() {
  document.documentElement.lang = locale;
  document.title = t("documentTitle");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }

  const localeLink = document.querySelector("#locale-link");
  if (locale === "ja") {
    localeLink.href = "../../../mathematics-for-physics/complex-functions/?lang=en";
    localeLink.textContent = "English";
    localeLink.lang = "en";
  } else {
    localeLink.href = "../../ja/mathematics-for-physics/complex-functions/?lang=ja";
    localeLink.textContent = "日本語";
    localeLink.lang = "ja";
  }
}

function localizeExpressionError(error) {
  if (locale !== "ja" || !error?.code) return error?.message ?? String(error);
  const details = error.details ?? {};
  if (error.code === "unrecognized-character") {
    return `位置 ${details.position} の「${details.character}」を解釈できません。`;
  }
  if (error.code === "expected-token") {
    const found = details.atEnd ? "式の終わり" : `「${details.found}」`;
    return `位置 ${details.position}: ${details.expected} が必要ですが ${found} があります。`;
  }
  if (error.code === "unknown-function") return `未知の関数「${details.name}」です。`;
  if (error.code === "unknown-symbol") return `未知の記号「${details.name}」です。`;
  if (error.code === "expected-value") {
    const found = details.atEnd ? "式の終わり" : `「${details.found}」`;
    return `位置 ${details.position}: ${found} の前に値が必要です。`;
  }
  if (error.code === "wrong-arity") {
    return `${details.name} は ${details.expected} 個の引数を取ります。`;
  }
  if (error.code === "empty-expression") return "式を入力してください。";
  if (error.code === "invalid-variables") {
    return `この入力モードでは ${details.variables.join(", ")} は使えません。入力形式を切り替えてください。`;
  }
  if (error.code === "invalid-functions") {
    return `正則関数モードでは ${details.functions.join(", ")} は使えません。入力形式を切り替えてください。`;
  }
  return error.message;
}

const PRESETS = {
  "two-branch": {
    expression: "sqrt((1-z)*(1+z))",
    mode: "holomorphic",
    range: 2.5,
    branchPoints: [complex(-1, 0), complex(1, 0)],
    demoCenter: complex(1, 0),
    demoRadius: 0.55,
    descriptionKey: "presetTwoBranchDescription",
  },
  log: {
    expression: "log(z)",
    mode: "holomorphic",
    range: 2.5,
    branchPoints: [complex(0, 0)],
    demoCenter: complex(0, 0),
    demoRadius: 1.25,
    descriptionKey: "presetLogDescription",
  },
  "three-branch": {
    expression: "sqrt(z*(z-1)*(z+1))",
    mode: "holomorphic",
    range: 2.5,
    branchPoints: [complex(-1, 0), complex(0, 0), complex(1, 0)],
    demoCenter: complex(0, 0),
    demoRadius: 0.42,
    descriptionKey: "presetThreeBranchDescription",
  },
  residue: {
    expression: "1/z",
    mode: "holomorphic",
    range: 2.5,
    branchPoints: [complex(0, 0)],
    demoCenter: complex(0, 0),
    demoRadius: 1.2,
    descriptionKey: "presetResidueDescription",
  },
  essential: {
    expression: "exp(1/z)",
    mode: "holomorphic",
    range: 1.6,
    branchPoints: [complex(0, 0)],
    demoCenter: complex(0, 0),
    demoRadius: 0.8,
    descriptionKey: "presetEssentialDescription",
  },
  zbar: {
    expression: "z + 0.65*zbar",
    mode: "zbar",
    range: 2.5,
    branchPoints: [],
    demoCenter: complex(0, 0),
    demoRadius: 1.25,
    descriptionKey: "presetZbarDescription",
  },
  xy: {
    expression: "sin(x*y) + i*cos(x^2-y^2)",
    mode: "xy",
    range: 3,
    branchPoints: [],
    demoCenter: complex(0, 0),
    demoRadius: 1.4,
    descriptionKey: "presetXYDescription",
  },
};

const elements = {
  form: document.querySelector("#function-form"),
  expression: document.querySelector("#expression"),
  expressionMode: document.querySelector("#expression-mode"),
  expressionLabel: document.querySelector("#expression-label"),
  parseStatus: document.querySelector("#parse-status"),
  displayMode: document.querySelector("#display-mode"),
  plotRange: document.querySelector("#plot-range"),
  rangeOutput: document.querySelector("#range-output"),
  branchIndex: document.querySelector("#branch-index"),
  branchOutput: document.querySelector("#branch-output"),
  followSheet: document.querySelector("#follow-sheet"),
  showCuts: document.querySelector("#show-cuts"),
  showContours: document.querySelector("#show-contours"),
  plotCard: document.querySelector(".plot-card"),
  plotGrid: document.querySelector("#plot-grid"),
  plotHeading: document.querySelector("#plot-heading"),
  sheetIndicator: document.querySelector("#sheet-indicator"),
  displayedSheet: document.querySelector("#displayed-sheet"),
  panelATitle: document.querySelector("#panel-a-title"),
  panelBTitle: document.querySelector("#panel-b-title"),
  fieldA: document.querySelector("#field-a"),
  fieldB: document.querySelector("#field-b"),
  overlayA: document.querySelector("#overlay-a"),
  overlayB: document.querySelector("#overlay-b"),
  domainLegend: document.querySelector("#domain-legend"),
  componentLegend: document.querySelector("#component-legend"),
  legendText: document.querySelector("#legend-text"),
  interactionStatus: document.querySelector("#interaction-status"),
  demoCircle: document.querySelector("#demo-circle"),
  resetPath: document.querySelector("#reset-path"),
  probeZ: document.querySelector("#probe-z"),
  probePrincipal: document.querySelector("#probe-principal"),
  probeContinued: document.querySelector("#probe-continued"),
  probeMagnitude: document.querySelector("#probe-magnitude"),
  probePhase: document.querySelector("#probe-phase"),
  pathBadge: document.querySelector("#path-badge"),
  integralValue: document.querySelector("#integral-value"),
  realValue: document.querySelector("#real-value"),
  imagValue: document.querySelector("#imag-value"),
  realBar: document.querySelector("#real-bar"),
  imagBar: document.querySelector("#imag-bar"),
  integralPlane: document.querySelector("#integral-plane"),
  pathLength: document.querySelector("#path-length"),
  branchTurns: document.querySelector("#branch-turns"),
  monodromy: document.querySelector("#monodromy"),
  liftStatus: document.querySelector("#lift-status"),
};

const state = {
  compiled: null,
  activePreset: "two-branch",
  branchPoints: PRESETS["two-branch"].branchPoints,
  path: null,
  drawing: false,
  activePointer: null,
  renderRevision: 0,
  refinementTimer: null,
  componentScale: 1,
  displayedBranchOffsets: null,
};

function plotRange() {
  return Number(elements.plotRange.value);
}

function branchIndex() {
  return Number(elements.branchIndex.value);
}

function backgroundEvaluationOptions() {
  if (state.displayedBranchOffsets) {
    return {branchOffsets: state.displayedBranchOffsets, branchIndex: branchIndex()};
  }
  return {branchIndex: branchIndex()};
}

function branchNodeKind(id) {
  const [kind] = String(id).split(":");
  const labels = {sqrt: "sqrt", log: "log", pow: "pow", power: "^"};
  return labels[kind] ?? kind;
}

function labeledBranchEntries(entries) {
  const items = [...entries];
  const totals = new Map();
  for (const [id] of items) {
    const kind = branchNodeKind(id);
    totals.set(kind, (totals.get(kind) ?? 0) + 1);
  }
  const seen = new Map();
  return items.map(([id, value]) => {
    const kind = branchNodeKind(id);
    const ordinal = (seen.get(kind) ?? 0) + 1;
    seen.set(kind, ordinal);
    return {id, label: totals.get(kind) > 1 ? `${kind}[${ordinal}]` : kind, value};
  });
}

function offsetsSignature(offsets) {
  if (!offsets) return "fixed";
  return [...offsets.entries()]
    .sort(([left], [right]) => String(left).localeCompare(String(right)))
    .map(([id, offset]) => `${id}:${offset}`)
    .join("|");
}

function offsetMapsEqual(left, right) {
  return offsetsSignature(left) === offsetsSignature(right);
}

function mapMatchesGlobalSheet(offsets) {
  return offsets && [...offsets.values()].every((offset) => offset === branchIndex());
}

function signedInteger(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function branchCoordinateDescription(id, label, offset) {
  if (branchNodeKind(id) === "sqrt") {
    const sheet = ((offset % 2) + 2) % 2;
    return `${label} → sheet ${sheet} (k=${signedInteger(offset)})`;
  }
  if (branchNodeKind(id) === "log") {
    return `${label} → sheet k=${signedInteger(offset)}`;
  }
  return `${label} → branch k=${signedInteger(offset)}`;
}

function sheetDescription(offsets) {
  if (!offsets || offsets.size === 0) return t("initialBranchText", {index: branchIndex()});
  return labeledBranchEntries(offsets.entries())
    .map(({id, label, value}) => branchCoordinateDescription(id, label, value))
    .join(" / ");
}

function updateSheetIndicator() {
  if (!elements.followSheet.checked) {
    const pathOffsets = state.path?.sheetOffsets;
    const suffix = pathOffsets?.size
      ? t("pathSuffix", {sheet: sheetDescription(pathOffsets)})
      : "";
    elements.displayedSheet.textContent = t("fixedBranchText", {
      index: branchIndex(),
      suffix,
    });
    elements.sheetIndicator.classList.add("fixed");
    return;
  }
  elements.displayedSheet.textContent = sheetDescription(state.displayedBranchOffsets);
  elements.sheetIndicator.classList.remove("fixed");
}

function flashSheetTransition() {
  elements.plotCard.classList.remove("sheet-transition");
  void elements.plotCard.offsetWidth;
  elements.plotCard.classList.add("sheet-transition");
}

function setDisplayedBranchOffsets(offsets, {animate = false, render = true} = {}) {
  const normalized = offsets ? new Map(offsets) : null;
  const equivalentToCurrent =
    offsetMapsEqual(state.displayedBranchOffsets, normalized) ||
    (!state.displayedBranchOffsets && mapMatchesGlobalSheet(normalized)) ||
    (!normalized && mapMatchesGlobalSheet(state.displayedBranchOffsets));
  state.displayedBranchOffsets = normalized;
  updateSheetIndicator();
  if (!equivalentToCurrent && render) scheduleRender();
  if (!equivalentToCurrent && animate) flashSheetTransition();
  return !equivalentToCurrent;
}

function describeSheetChanges(previous, current) {
  const ids = new Set([...(previous?.keys() ?? []), ...(current?.keys() ?? [])]);
  return labeledBranchEntries([...ids].map((id) => [id, id]))
    .map(({id, label}) => {
      const before = previous?.get(id) ?? branchIndex();
      const after = current?.get(id) ?? branchIndex();
      if (before === after) return null;
      return t(after > before ? "positiveDirection" : "negativeDirection", {
        sheet: branchCoordinateDescription(id, label, after),
      });
    })
    .filter(Boolean)
    .join(" / ");
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatNumber(value, digits = 4) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 5e-12) return "0";
  if (Math.abs(value) >= 1e4 || Math.abs(value) < 1e-3) return value.toExponential(2);
  return Number(value.toPrecision(digits)).toString();
}

function formatComplex(value, digits = 4) {
  if (!value || !isFiniteComplex(value)) return t("undefinedValue");
  const real = Math.abs(value.re) < 5e-12 ? 0 : value.re;
  const imaginary = Math.abs(value.im) < 5e-12 ? 0 : value.im;
  const sign = imaginary < 0 ? "−" : "+";
  return `${formatNumber(real, digits)} ${sign} ${formatNumber(Math.abs(imaginary), digits)}i`;
}

function hsvToRgb(hue, saturation, value) {
  const h = ((hue % 1) + 1) % 1;
  const sector = h * 6;
  const index = Math.floor(sector);
  const fraction = sector - index;
  const p = value * (1 - saturation);
  const q = value * (1 - fraction * saturation);
  const t = value * (1 - (1 - fraction) * saturation);
  const choices = [
    [value, t, p],
    [q, value, p],
    [p, value, t],
    [p, q, value],
    [t, p, value],
    [value, p, q],
  ];
  return choices[index % 6].map((component) => Math.round(component * 255));
}

function domainColor(real, imaginary) {
  const amplitude = Math.hypot(real, imaginary);
  if (!Number.isFinite(amplitude)) return [7, 9, 12];
  if (amplitude < 1e-14) return [1, 2, 3];
  const argument = Math.atan2(imaginary, real);
  const hue = argument / TAU;
  let brightness = 0.1 + 0.9 * (amplitude / (1 + amplitude));

  if (elements.showContours.checked) {
    const magnitudeWave = Math.abs(Math.sin(Math.PI * 2 * Math.log10(amplitude)));
    const phaseWave = Math.abs(Math.sin(6 * argument));
    const magnitudeLine = 1 - 0.22 * Math.exp(-55 * magnitudeWave * magnitudeWave);
    const phaseLine = 1 - 0.12 * Math.exp(-65 * phaseWave * phaseWave);
    brightness *= magnitudeLine * phaseLine;
  }
  return hsvToRgb(hue, 0.84, clamp(brightness, 0, 1));
}

function componentColor(value, scaleValue) {
  if (!Number.isFinite(value)) return [7, 9, 12];
  const normalized = Math.tanh(value / Math.max(scaleValue, 1e-9));
  const middle = [242, 238, 226];
  const negative = [19, 82, 132];
  const positive = [197, 40, 76];
  const destination = normalized < 0 ? negative : positive;
  const amount = Math.abs(normalized);
  return middle.map((component, index) =>
    Math.round(component + amount * (destination[index] - component)),
  );
}

function sampleField(size = FIELD_SIZE) {
  const length = size * size;
  const real = new Float64Array(length);
  const imaginary = new Float64Array(length);
  const finite = new Uint8Array(length);
  const scaleSamples = [];
  const extent = plotRange();

  for (let row = 0; row < size; row += 1) {
    const y = extent * (1 - (2 * (row + 0.5)) / size);
    for (let column = 0; column < size; column += 1) {
      const x = extent * ((2 * (column + 0.5)) / size - 1);
      const index = row * size + column;
      const value = state.compiled.evaluateAt(complex(x, y), backgroundEvaluationOptions());
      real[index] = value.re;
      imaginary[index] = value.im;
      if (isFiniteComplex(value)) {
        finite[index] = 1;
        if (index % 11 === 0) {
          scaleSamples.push(Math.abs(value.re), Math.abs(value.im));
        }
      }
    }
  }

  scaleSamples.sort((a, b) => a - b);
  const percentile = scaleSamples[Math.floor(scaleSamples.length * 0.82)] ?? 1;
  state.componentScale = Math.max(percentile, 0.05);
  return {real, imaginary, finite, size};
}

function isJumpCandidate(field, index, row, column) {
  if (!field.finite[index]) return false;
  const currentReal = field.real[index];
  const currentImaginary = field.imaginary[index];
  const currentMagnitude = Math.hypot(currentReal, currentImaginary);
  const neighbors = [];
  if (column > 0) neighbors.push(index - 1);
  if (row > 0) neighbors.push(index - field.size);

  return neighbors.some((neighbor) => {
    if (!field.finite[neighbor]) return false;
    const difference = Math.hypot(
      currentReal - field.real[neighbor],
      currentImaginary - field.imaginary[neighbor],
    );
    const neighborMagnitude = Math.hypot(field.real[neighbor], field.imaginary[neighbor]);
    const relativeJump = difference / Math.max(currentMagnitude + neighborMagnitude, 1e-7);
    return relativeJump > 0.82 && difference > 0.08;
  });
}

function drawRaster(canvas, field, channel) {
  const scratch = document.createElement("canvas");
  scratch.width = field.size;
  scratch.height = field.size;
  const scratchContext = scratch.getContext("2d", {alpha: false});
  const image = scratchContext.createImageData(field.size, field.size);

  for (let row = 0; row < field.size; row += 1) {
    for (let column = 0; column < field.size; column += 1) {
      const index = row * field.size + column;
      const offset = index * 4;
      let color;
      if (!field.finite[index]) {
        const hatch = (Math.floor(row / 4) + Math.floor(column / 4)) % 2;
        color = hatch ? [20, 22, 26] : [5, 7, 9];
      } else if (channel === "domain") {
        color = domainColor(field.real[index], field.imaginary[index]);
      } else {
        const component = channel === "real" ? field.real[index] : field.imaginary[index];
        color = componentColor(component, state.componentScale);
      }

      if (
        elements.showCuts.checked &&
        isJumpCandidate(field, index, row, column) &&
        (row + column) % 5 !== 0
      ) {
        color = (row + column) % 2 ? [242, 240, 225] : [22, 25, 29];
      }
      image.data[offset] = color[0];
      image.data[offset + 1] = color[1];
      image.data[offset + 2] = color[2];
      image.data[offset + 3] = 255;
    }
  }
  scratchContext.putImageData(image, 0, 0);
  const context = canvas.getContext("2d", {alpha: false});
  context.imageSmoothingEnabled = true;
  context.drawImage(scratch, 0, 0, canvas.width, canvas.height);
}

function scheduleRender({preview = false} = {}) {
  window.clearTimeout(state.refinementTimer);
  state.refinementTimer = null;
  if (preview) {
    state.refinementTimer = window.setTimeout(() => scheduleRender(), RENDER_SETTLE_DELAY);
  }
  const revision = state.renderRevision + 1;
  state.renderRevision = revision;
  elements.plotGrid.setAttribute("aria-busy", "true");
  window.requestAnimationFrame(() => {
    if (revision !== state.renderRevision || !state.compiled) return;
    try {
      const field = sampleField(preview ? PREVIEW_FIELD_SIZE : FIELD_SIZE);
      if (revision !== state.renderRevision) return;
      updateLegendText();
      if (elements.displayMode.value === "domain") {
        drawRaster(elements.fieldA, field, "domain");
      } else {
        drawRaster(elements.fieldA, field, "real");
        drawRaster(elements.fieldB, field, "imaginary");
      }
      drawAllOverlays();
      elements.plotGrid.setAttribute("aria-busy", "false");
    } catch (error) {
      showParseError(error);
      elements.plotGrid.setAttribute("aria-busy", "false");
    }
  });
}

function complexToCanvas(value, canvas) {
  const extent = plotRange();
  return {
    x: ((value.re / extent + 1) / 2) * canvas.width,
    y: ((1 - value.im / extent) / 2) * canvas.height,
  };
}

function pointerToComplex(event, canvas) {
  const rectangle = canvas.getBoundingClientRect();
  const normalizedX = (event.clientX - rectangle.left) / rectangle.width;
  const normalizedY = (event.clientY - rectangle.top) / rectangle.height;
  const extent = plotRange();
  return complex(extent * (2 * normalizedX - 1), extent * (1 - 2 * normalizedY));
}

function drawGrid(context, canvas) {
  const extent = plotRange();
  const componentView = elements.displayMode.value === "components";
  const colors = componentView
    ? {
        axis: "rgba(18,25,31,0.46)",
        grid: "rgba(18,25,31,0.13)",
        tick: "rgba(18,25,31,0.68)",
        label: "rgba(18,25,31,0.78)",
      }
    : {
        axis: "rgba(255,255,255,0.43)",
        grid: "rgba(255,255,255,0.105)",
        tick: "rgba(255,255,255,0.56)",
        label: "rgba(255,255,255,0.72)",
      };
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.lineWidth = 1;
  context.font = "11px ui-monospace, monospace";
  context.textAlign = "left";
  context.textBaseline = "top";

  const integerExtent = Math.floor(extent);
  for (let tick = -integerExtent; tick <= integerExtent; tick += 1) {
    const vertical = complexToCanvas(complex(tick, 0), canvas).x;
    const horizontal = complexToCanvas(complex(0, tick), canvas).y;
    const isAxis = tick === 0;
    context.strokeStyle = isAxis ? colors.axis : colors.grid;
    context.beginPath();
    context.moveTo(vertical, 0);
    context.lineTo(vertical, canvas.height);
    context.moveTo(0, horizontal);
    context.lineTo(canvas.width, horizontal);
    context.stroke();
    if (tick !== 0) {
      context.fillStyle = colors.tick;
      context.fillText(String(tick), vertical + 4, canvas.height / 2 + 4);
      context.fillText(`${tick}i`, canvas.width / 2 + 4, horizontal + 4);
    }
  }
  context.fillStyle = colors.label;
  context.fillText("Re z", canvas.width - 34, canvas.height / 2 + 5);
  context.fillText("Im z", canvas.width / 2 + 6, 8);
  context.restore();
}

function drawBranchPoints(context, canvas) {
  for (const point of state.branchPoints) {
    const position = complexToCanvas(point, canvas);
    context.save();
    context.translate(position.x, position.y);
    context.rotate(Math.PI / 4);
    context.fillStyle = "#0b1017";
    context.strokeStyle = "#ffd166";
    context.lineWidth = 2;
    context.fillRect(-5, -5, 10, 10);
    context.strokeRect(-5, -5, 10, 10);
    context.restore();
  }
}

function drawPath(context, canvas) {
  if (!state.path || state.path.points.length === 0) return;
  const positions = state.path.points.map((point) => complexToCanvas(point, canvas));
  context.save();
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(positions[0].x, positions[0].y);
  for (let index = 1; index < positions.length; index += 1) {
    context.lineTo(positions[index].x, positions[index].y);
  }
  context.strokeStyle = "rgba(0, 0, 0, 0.72)";
  context.lineWidth = 6;
  context.stroke();
  context.strokeStyle = state.path.closed ? "#87dfa1" : "#ffffff";
  context.lineWidth = 2.5;
  context.stroke();

  const start = positions[0];
  const end = positions.at(-1);
  context.beginPath();
  context.arc(start.x, start.y, 8, 0, TAU);
  context.strokeStyle = "#5cd9dc";
  context.lineWidth = 2.5;
  context.stroke();
  if (!state.path.closed && state.path.totalLength > plotRange() * 0.6) {
    context.setLineDash([3, 4]);
    context.beginPath();
    context.arc(start.x, start.y, 15, 0, TAU);
    context.strokeStyle = "rgba(92,217,220,0.8)";
    context.lineWidth = 1.5;
    context.stroke();
    context.setLineDash([]);
  }
  context.beginPath();
  context.arc(end.x, end.y, 4.5, 0, TAU);
  context.fillStyle = state.path.closed ? "#87dfa1" : "#ffd166";
  context.fill();
  context.restore();
}

function drawOverlay(canvas) {
  const context = canvas.getContext("2d");
  drawGrid(context, canvas);
  drawBranchPoints(context, canvas);
  drawPath(context, canvas);
}

function drawAllOverlays() {
  drawOverlay(elements.overlayA);
  if (elements.displayMode.value === "components") drawOverlay(elements.overlayB);
}

function startPath(point) {
  const continuationState = createContinuationState();
  const value = state.compiled.evaluateAt(point, {
    branchIndex: branchIndex(),
    continuationState,
  });
  state.path = {
    points: [point],
    values: [value],
    integrals: [C_ZERO],
    integral: C_ZERO,
    totalLength: 0,
    continuationState,
    closed: false,
    invalidSegments: 0,
  };
  state.path.sheetOffsets = branchOffsetsFromContinuation(continuationState);
  if (elements.followSheet.checked) {
    setDisplayedBranchOffsets(state.path.sheetOffsets, {render: true});
  } else {
    setDisplayedBranchOffsets(null, {render: true});
  }
  updateProbe(point, value);
  updatePathReadouts("drawing");
  drawAllOverlays();
}

function syncDisplayedSheetFromPath({animate = true, render = true} = {}) {
  if (!state.path) return false;
  const previousOffsets = state.path.sheetOffsets;
  const currentOffsets = branchOffsetsFromContinuation(state.path.continuationState);
  state.path.sheetOffsets = currentOffsets;
  const pathSheetChanged = !offsetMapsEqual(previousOffsets, currentOffsets);
  if (!pathSheetChanged) return false;

  const changeDescription = describeSheetChanges(previousOffsets, currentOffsets);
  if (elements.followSheet.checked) {
    setDisplayedBranchOffsets(currentOffsets, {animate, render});
    elements.interactionStatus.textContent = t("sheetFollowed", {change: changeDescription});
  } else {
    updateSheetIndicator();
    elements.interactionStatus.textContent = t("sheetFixed", {change: changeDescription});
  }
  return true;
}

function appendSample(point, {syncSheet = true} = {}) {
  const path = state.path;
  const previousPoint = path.points.at(-1);
  const previousValue = path.values.at(-1);
  const value = state.compiled.evaluateAt(point, {
    branchIndex: branchIndex(),
    continuationState: path.continuationState,
  });
  path.totalLength += magnitude(subtract(point, previousPoint));
  if (isFiniteComplex(previousValue) && isFiniteComplex(value)) {
    path.integral = add(
      path.integral,
      trapezoidContribution(previousPoint, point, previousValue, value),
    );
  } else {
    path.invalidSegments += 1;
  }
  path.points.push(point);
  path.values.push(value);
  path.integrals.push(path.integral);
  if (syncSheet) syncDisplayedSheetFromPath();
  updateProbe(point, value);
}

function appendPoint(point) {
  const previous = state.path.points.at(-1);
  const delta = subtract(point, previous);
  const distance = magnitude(delta);
  const stepSize = (2 * plotRange()) / 260;
  const steps = clamp(Math.ceil(distance / stepSize), 1, 24);
  for (let step = 1; step <= steps; step += 1) {
    appendSample(
      complex(previous.re + (delta.re * step) / steps, previous.im + (delta.im * step) / steps),
    );
  }
}

function closePath() {
  if (!state.path || state.path.closed) return;
  appendPoint(state.path.points[0]);
  state.path.closed = true;
  state.drawing = false;
  updatePathReadouts("closed");
  drawAllOverlays();
  elements.interactionStatus.textContent = state.path.invalidSegments
    ? t("closedSkipped", {count: state.path.invalidSegments})
    : t("closedConfirmed");
}

function resetPath() {
  state.path = null;
  state.drawing = false;
  state.activePointer = null;
  setDisplayedBranchOffsets(null, {render: true});
  elements.probeZ.textContent = "—";
  elements.probePrincipal.textContent = "—";
  elements.probeContinued.textContent = "—";
  elements.probeMagnitude.textContent = "—";
  elements.probePhase.textContent = "—";
  updatePathReadouts("idle");
  drawAllOverlays();
  elements.interactionStatus.textContent = t("dragInstruction");
}

function rebuildPath() {
  if (!state.path) return;
  const points = [...state.path.points];
  const wasClosed = state.path.closed;
  startPath(points[0]);
  for (let index = 1; index < points.length; index += 1) {
    appendSample(points[index], {syncSheet: false});
  }
  syncDisplayedSheetFromPath({animate: false, render: true});
  state.path.closed = wasClosed;
  updatePathReadouts(wasClosed ? "closed" : "open");
  drawAllOverlays();
}

function updateProbe(point, continuedValue = null) {
  const backgroundValue = state.compiled.evaluateAt(point, backgroundEvaluationOptions());
  const displayValue = continuedValue ?? backgroundValue;
  elements.probeZ.textContent = formatComplex(point);
  elements.probePrincipal.textContent = formatComplex(backgroundValue);
  elements.probeContinued.textContent = continuedValue ? formatComplex(continuedValue) : "—";
  elements.probeMagnitude.textContent = formatNumber(magnitude(displayValue), 5);
  elements.probePhase.textContent = isFiniteComplex(displayValue)
    ? `${formatNumber(Math.atan2(displayValue.im, displayValue.re), 5)} rad`
    : "—";
}

function updateSignedBar(element, value, scaleValue) {
  const amount = clamp(Math.abs(value) / scaleValue, 0, 1) * 50;
  if (value >= 0) {
    element.style.left = "50%";
    element.style.width = `${amount}%`;
    element.style.background = "#ff7096";
  } else {
    element.style.left = `${50 - amount}%`;
    element.style.width = `${amount}%`;
    element.style.background = "#5cd9dc";
  }
}

function drawIntegralPlane() {
  const canvas = elements.integralPlane;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#080d13";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const integrals = state.path?.integrals ?? [C_ZERO];
  const maximum = Math.max(1, ...integrals.map((value) => magnitude(value))) * 1.15;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scaleFactor = Math.min(canvas.width, canvas.height) * 0.42 / maximum;
  context.strokeStyle = "rgba(255,255,255,0.18)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, centerY);
  context.lineTo(canvas.width, centerY);
  context.moveTo(centerX, 0);
  context.lineTo(centerX, canvas.height);
  context.stroke();
  context.fillStyle = "rgba(255,255,255,0.5)";
  context.font = "10px ui-monospace, monospace";
  context.fillText("Re I", canvas.width - 26, centerY - 6);
  context.fillText("Im I", centerX + 5, 11);
  if (integrals.length > 1) {
    context.beginPath();
    integrals.forEach((value, index) => {
      const x = centerX + value.re * scaleFactor;
      const y = centerY - value.im * scaleFactor;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = "#ffd166";
    context.lineWidth = 2;
    context.stroke();
  }
  const last = integrals.at(-1);
  context.beginPath();
  context.arc(centerX + last.re * scaleFactor, centerY - last.im * scaleFactor, 4, 0, TAU);
  context.fillStyle = state.path?.closed ? "#87dfa1" : "#ff7096";
  context.fill();
}

function updatePathReadouts(status) {
  const labels = {
    idle: t("idle"),
    drawing: t("statusDrawing"),
    open: t("statusOpen"),
    closed: t("statusClosed"),
  };
  elements.pathBadge.textContent = labels[status] ?? labels.idle;
  elements.pathBadge.className = `path-badge ${status}`;
  const integral = state.path?.integral ?? C_ZERO;
  elements.integralValue.textContent = formatComplex(integral, 6);
  elements.realValue.textContent = formatNumber(integral.re, 4);
  elements.imagValue.textContent = formatNumber(integral.im, 4);
  const barScale = Math.max(1, Math.abs(integral.re), Math.abs(integral.im));
  updateSignedBar(elements.realBar, integral.re, barScale);
  updateSignedBar(elements.imagBar, integral.im, barScale);
  drawIntegralPlane();

  if (!state.path) {
    elements.pathLength.textContent = t("pathMeasure", {count: 0, length: 0});
    elements.branchTurns.textContent = "—";
    elements.monodromy.textContent = "—";
    elements.liftStatus.textContent = "—";
    return;
  }
  elements.pathLength.textContent = t("pathMeasure", {
    count: state.path.points.length,
    length: formatNumber(state.path.totalLength, 5),
  });
  const summary = continuationSummary(state.path.continuationState);
  elements.branchTurns.textContent = summary.nodes.length
    ? labeledBranchEntries(summary.nodes.map((node) => [node.id, node.turns]))
        .map(({id, label, value}) => branchCoordinateDescription(id, label, value))
        .join(", ")
    : t("singleValued");

  if (state.path.values.length > 1 && isFiniteComplex(state.path.values[0])) {
    const ratio = divide(state.path.values.at(-1), state.path.values[0]);
    elements.monodromy.textContent = formatComplex(ratio, 5);
    if (state.path.closed) {
      const closesOnLift = relativeComplexDistance(state.path.values.at(-1), state.path.values[0]) < 2e-3;
      elements.liftStatus.textContent = closesOnLift ? t("closesSame") : t("liftOpen");
    } else {
      elements.liftStatus.textContent = t("baseOpen");
    }
  } else {
    elements.monodromy.textContent = "—";
    elements.liftStatus.textContent = t("evaluationFailure");
  }
}

function onPointerDown(event) {
  if (!state.compiled) return;
  event.preventDefault();
  state.drawing = true;
  state.activePointer = event.pointerId;
  event.currentTarget.setPointerCapture(event.pointerId);
  startPath(pointerToComplex(event, event.currentTarget));
  elements.interactionStatus.textContent = t("drawingStatus");
}

function onPointerMove(event) {
  const point = pointerToComplex(event, event.currentTarget);
  if (!state.drawing || event.pointerId !== state.activePointer) {
    // Once a path exists, keep its analytically continued endpoint visible.
    // Mixing a newly hovered z with that endpoint value would be misleading.
    if (!state.path) updateProbe(point);
    return;
  }
  const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [event];
  for (const sampledEvent of events) {
    appendPoint(pointerToComplex(sampledEvent, event.currentTarget));
  }
  const start = state.path.points[0];
  const end = state.path.points.at(-1);
  const closeDistance = plotRange() * 0.075;
  if (
    state.path.points.length > 28 &&
    state.path.totalLength > plotRange() * 0.9 &&
    magnitude(subtract(start, end)) < closeDistance
  ) {
    closePath();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    state.activePointer = null;
    return;
  }
  updatePathReadouts("drawing");
  drawAllOverlays();
}

function onPointerUp(event) {
  if (event.pointerId !== state.activePointer) return;
  state.drawing = false;
  state.activePointer = null;
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
  if (!state.path?.closed) {
    updatePathReadouts("open");
    elements.interactionStatus.textContent = t("provisionalStatus");
  }
}

function makeDemoCircle() {
  const preset = PRESETS[state.activePreset] ?? {
    demoCenter: complex(0, 0),
    demoRadius: plotRange() * 0.48,
    descriptionKey: "genericCircle",
  };
  const points = [];
  const samples = 360;
  for (let index = 0; index <= samples; index += 1) {
    const angle = (TAU * index) / samples;
    points.push(
      complex(
        preset.demoCenter.re + preset.demoRadius * Math.cos(angle),
        preset.demoCenter.im + preset.demoRadius * Math.sin(angle),
      ),
    );
  }
  startPath(points[0]);
  for (let index = 1; index < points.length; index += 1) appendSample(points[index]);
  state.path.closed = true;
  updatePathReadouts("closed");
  drawAllOverlays();
  elements.interactionStatus.textContent = t(preset.descriptionKey);
}

function updateViewMode() {
  const components = elements.displayMode.value === "components";
  elements.plotGrid.classList.toggle("domain-view", !components);
  elements.plotHeading.textContent = components ? t("realImaginary") : t("amplitudePhase");
  elements.panelATitle.textContent = components ? "Re f(z)" : t("panelDomain");
  elements.panelBTitle.textContent = "Im f(z)";
  elements.domainLegend.hidden = components;
  elements.componentLegend.hidden = !components;
  updateLegendText();
  scheduleRender();
}

function updateLegendText() {
  const components = elements.displayMode.value === "components";
  elements.legendText.textContent = components
    ? t("componentLegend", {scale: formatNumber(state.componentScale, 3)})
    : t("domainLegend");
}

function updateModeLabel() {
  const labels = {
    holomorphic: "f(z) =",
    xy: "f(x, y) =",
    zbar: "f(z, z̄) =",
  };
  elements.expressionLabel.textContent = labels[elements.expressionMode.value];
}

function showParseError(error) {
  elements.parseStatus.textContent = localizeExpressionError(error);
  elements.parseStatus.classList.add("error");
}

function applyExpression() {
  try {
    const compiled = compileExpression(elements.expression.value, elements.expressionMode.value);
    // Probe once so arity errors are reported before the expensive render.
    compiled.evaluateAt(complex(0.371, 0.219), {branchIndex: branchIndex()});
    state.compiled = compiled;
    state.activePreset = null;
    state.branchPoints = [];
    document.querySelectorAll("[data-preset]").forEach((button) => button.classList.remove("active"));
    elements.parseStatus.textContent = t("parsed");
    elements.parseStatus.classList.remove("error");
    resetPath();
    scheduleRender();
  } catch (error) {
    showParseError(error);
  }
}

function applyPreset(name) {
  const preset = PRESETS[name];
  elements.expression.value = preset.expression;
  elements.expressionMode.value = preset.mode;
  elements.plotRange.value = String(preset.range);
  elements.rangeOutput.value = String(preset.range);
  elements.branchIndex.value = "0";
  elements.branchOutput.value = "0";
  updateModeLabel();
  try {
    state.compiled = compileExpression(preset.expression, preset.mode);
    state.activePreset = name;
    state.branchPoints = preset.branchPoints;
    document.querySelectorAll("[data-preset]").forEach((button) => {
      button.classList.toggle("active", button.dataset.preset === name);
    });
    elements.parseStatus.textContent = t("presetLoaded");
    elements.parseStatus.classList.remove("error");
    resetPath();
    scheduleRender();
  } catch (error) {
    showParseError(error);
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  applyExpression();
});
elements.expressionMode.addEventListener("change", updateModeLabel);
elements.displayMode.addEventListener("change", updateViewMode);
elements.plotRange.addEventListener("input", () => {
  elements.rangeOutput.value = Number(elements.plotRange.value).toFixed(2).replace(/0+$/u, "").replace(/\.$/u, "");
  scheduleRender({preview: true});
  drawAllOverlays();
});
elements.branchIndex.addEventListener("input", () => {
  elements.branchOutput.value = elements.branchIndex.value;
  if (state.path) {
    rebuildPath();
  } else {
    setDisplayedBranchOffsets(null, {render: false});
    scheduleRender({preview: true});
  }
});
elements.followSheet.addEventListener("change", () => {
  if (elements.followSheet.checked && state.path) {
    setDisplayedBranchOffsets(state.path.sheetOffsets, {animate: true, render: true});
    elements.interactionStatus.textContent = t("followEnabled");
  } else {
    setDisplayedBranchOffsets(null, {animate: false, render: true});
    elements.interactionStatus.textContent = elements.followSheet.checked
      ? t("followNext")
      : t("followDisabled");
  }
  updateProbe(state.path?.points.at(-1) ?? complex(0, 0), state.path?.values.at(-1) ?? null);
});
elements.showCuts.addEventListener("change", scheduleRender);
elements.showContours.addEventListener("change", scheduleRender);
elements.demoCircle.addEventListener("click", makeDemoCircle);
elements.resetPath.addEventListener("click", resetPath);

for (const button of document.querySelectorAll("[data-preset]")) {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
}

for (const canvas of [elements.overlayA, elements.overlayB]) {
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", (event) => {
    if (!state.drawing) return;
    onPointerMove(event);
  });
}

applyLocale();
applyPreset("two-branch");
updateViewMode();
