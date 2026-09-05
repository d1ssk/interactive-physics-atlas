(function runMassScaleAtlas() {
  "use strict";

  const Physics = window.MassScalePhysics;
  const Data = window.MassScaleData;
  if (!Physics || !Data) throw new Error("Mass-scale data failed to load");

  const SCALE = Object.freeze({
    minLog: -33,
    maxLog: Physics.logEnergy(1.220890e28),
    pxPerDecade: 210,
    paddingTop: 280,
    paddingBottom: 420,
  });

  const I18N = {
    ja: {
      skip: "スケール本体へ移動", siteNavLabel: "サイトと表示設定", languageLabel: "言語",
      readingGuideLabel: "この図の読み方", atlasLabel: "物理世界の質量・エネルギースケール",
      cosmologyLabel: "宇宙熱史のベンチマーク", filter: "表示項目", filterKicker: "LAYERS", filterTitle: "表示するレイヤー",
      filterNote: "各線は軸上の正確な値から、対応するカード1枚だけへつながります。",
      eyebrow: "THE ENERGY SCALE OF THE PHYSICAL WORLD", title: '<span class="title-line">エネルギーの階層を、辿る。</span>',
      lede: "現在の宇宙膨張から Planck スケールまで",
      factDecades: "倍を越える隔たり", factUnit: "全区間で共通の単位", factDirection: "下ほど高エネルギー",
      start: "スクロールを始める", offAxis: "OFF THE LOG AXIS", masslessTitle: "質量ゼロ",
      photon: "光子", photonNote: "標準模型では m = 0。実験上限は軸上に別表示。", gluon: "グルーオン",
      gluonNote: "標準模型では m = 0。自由粒子としては観測されない。",
      here: "現在位置", lengthScale: "長さ \\(\\hbar c/E\\)", timeScale: "時間 \\(\\hbar/E\\)", temperatureScale: "温度 \\(E/k_{\\mathrm B}\\)",
      energyAxis: "エネルギー / 質量", thermalHistory: "標準宇宙論の熱史",
      endpointKicker: "END OF THE CURRENT MAP", endpointTitle: "ここから先は、量子重力の地図が要る",
      endpointText: "Planck スケールは、「最大エネルギー」を示す壁ではありません。場の量子論と一般相対論のパッチワークが信頼できなくなり、量子重力が必要になると考えられる境界です。",
      backTop: "最初のスケールへ戻る ↑", sourcesKicker: "SOURCES & CONVENTIONS", sourcesTitle: "出典と規約",
      sourceNote1: "粒子質量は PDG 2025 update を中心に採用。軽いクォークは \\(\\overline{\\mathrm{MS}}\\)、\\(\\mu = 2\\,\\mathrm{GeV}\\)、\\(c, b\\) は \\(\\mu = \\overline{m}_q\\) の値です。",
      sourceNote2: "右の宇宙年齢は独立した熱史ベンチマークです。現在位置の長さ・時間・温度は \\(\\ell = \\hbar c/E\\)、\\(\\tau = \\hbar/E\\)、\\(T = E/k_{\\mathrm B}\\) による換算で、個々の現象の実寸・寿命・実温度を表すものではありません。",
      sourceNote3: "電磁波・化学・核・QCD・仮説スケールの帯は、厳密な誤差棒ではなく慣習的な区分、対象依存性、または模型依存性を可視化したものです。",
      close: "閉じる", detailClose: "詳細を閉じる", markerAria: "{title}、{value}。詳細を開く",
      source: "出典", secondarySource: "関連出典",
      category_cosmic: "宇宙・熱史", category_particles: "標準模型粒子", category_composites: "複合粒子",
      category_phenomena: "現象スケール", category_experiments: "実験・宇宙線", category_speculative: "仮説スケール",
      category_gravity: "重力", category_limits: "上限", category_radiation: "電磁波",
      status_measured: "MEASURED", status_derived: "DERIVED", status_benchmark: "BENCHMARK",
      status_representative: "RANGE", status_uncertain: "UNRESOLVED", status_scheme: "SCHEME-DEPENDENT",
      status_model: "MODEL-DEPENDENT", status_limit: "UPPER LIMIT", status_experiment: "EXPERIMENT",
    },
    en: {
      skip: "Skip to the scale", siteNavLabel: "Site and display settings", languageLabel: "Language",
      readingGuideLabel: "How to read this atlas", atlasLabel: "Mass and energy scales of the physical world",
      cosmologyLabel: "Cosmic thermal-history benchmarks", filter: "Layers", filterKicker: "LAYERS", filterTitle: "Visible layers",
      filterNote: "Each line joins one exact axis value to one corresponding card.",
      eyebrow: "THE ENERGY SCALE OF THE PHYSICAL WORLD", title: '<span class="title-line">Trace the energy hierarchy.</span>',
      lede: "From the expansion of today’s Universe to the Planck scale",
      factDecades: "fold span", factUnit: "one unit throughout", factDirection: "higher energy below",
      start: "Begin scrolling", offAxis: "OFF THE LOG AXIS", masslessTitle: "Zero mass",
      photon: "Photon", photonNote: "m = 0 in the Standard Model; its upper limit appears on-axis.", gluon: "Gluon",
      gluonNote: "m = 0 in the Standard Model; never observed as a free particle.",
      here: "At the cursor", lengthScale: "length \\(\\hbar c/E\\)", timeScale: "time \\(\\hbar/E\\)", temperatureScale: "temperature \\(E/k_{\\mathrm B}\\)",
      energyAxis: "ENERGY / MASS", thermalHistory: "STANDARD COSMIC THERMAL HISTORY",
      endpointKicker: "END OF THE CURRENT MAP", endpointTitle: "Beyond here, we need a map of quantum gravity",
      endpointText: "The Planck scale is not a wall marking a “maximum energy.” It is a boundary where the patchwork of quantum field theory and general relativity ceases to be reliable and quantum gravity is expected to become necessary.",
      backTop: "Return to the first scale ↑", sourcesKicker: "SOURCES & CONVENTIONS", sourcesTitle: "Sources and conventions",
      sourceNote1: "Particle masses mainly follow the PDG 2025 update. Light-quark values are \\(\\overline{\\mathrm{MS}}\\) at \\(\\mu = 2\\,\\mathrm{GeV}\\); \\(c, b\\) use \\(\\mu = \\overline{m}_q\\).",
      sourceNote2: "Cosmic ages on the right are independent thermal-history benchmarks. Cursor length, time, and temperature use \\(\\ell = \\hbar c/E\\), \\(\\tau = \\hbar/E\\), and \\(T = E/k_{\\mathrm B}\\); they are not claims about an individual phenomenon’s physical size, lifetime, or actual temperature.",
      sourceNote3: "Bands for the electromagnetic spectrum, chemistry, nuclei, QCD, and hypothetical physics visualize conventional divisions or object/model dependence, not literal statistical error bars.",
      close: "Close", detailClose: "Close details", markerAria: "{title}, {value}. Open details",
      source: "Source", secondarySource: "Related source",
      category_cosmic: "Cosmos & thermal history", category_particles: "Standard Model particles", category_composites: "Composite particles",
      category_phenomena: "Phenomenon scales", category_experiments: "Experiments & cosmic rays", category_speculative: "Hypothetical scales",
      category_gravity: "Gravity", category_limits: "Limits", category_radiation: "Electromagnetic spectrum",
      status_measured: "MEASURED", status_derived: "DERIVED", status_benchmark: "BENCHMARK",
      status_representative: "RANGE", status_uncertain: "UNRESOLVED", status_scheme: "SCHEME-DEPENDENT",
      status_model: "MODEL-DEPENDENT", status_limit: "UPPER LIMIT", status_experiment: "EXPERIMENT",
    },
  };

  const categoryOrder = ["particles", "composites", "radiation", "phenomena", "cosmic", "experiments", "speculative", "gravity", "limits"];
  const categoryState = new Map(categoryOrder.map(category => [category, true]));
  const labelEntries = [];
  const rendered = new Map();
  const requestedLocale = new URLSearchParams(window.location.search).get("lang");
  const directoryLocale = window.location.pathname.split("/").includes("ja") ? "ja" : "en";
  const locale = requestedLocale === "en" || requestedLocale === "ja"
    ? requestedLocale
    : directoryLocale;
  let scrollFrame = 0;
  let detailTrigger = null;

  const byId = id => document.getElementById(id);
  const t = (key, values = {}) => Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    I18N[locale][key] ?? I18N.ja[key] ?? key,
  );
  const localized = value => value?.[locale] ?? value?.ja ?? "";

  const superscripts = {"-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"};
  const superscript = value => String(value).split("").map(character => superscripts[character] ?? character).join("");
  const exponentCharacters = {"⁻": "−", "⁺": "+", "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9"};

  function setScientificText(element, value) {
    const text = String(value);
    const pattern = /10([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/gu;
    const content = document.createDocumentFragment();
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      content.append(document.createTextNode(text.slice(cursor, match.index + 2)));
      const exponent = [...match[1]].map(character => exponentCharacters[character] ?? character).join("");
      content.append(makeElement("sup", "scientific-exponent", exponent));
      cursor = match.index + match[0].length;
    }
    content.append(document.createTextNode(text.slice(cursor)));
    element.replaceChildren(content);
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) setScientificText(element, text);
    return element;
  }

  function categoryClass(category) {
    return `category-${category}`;
  }

  function categoryLabel(category) {
    return t(`category_${category}`);
  }

  function statusLabel(status) {
    return t(`status_${status}`);
  }

  function formatScientific(value, digits = 3, unit = "") {
    if (!(value > 0)) return `0${unit ? ` ${unit}` : ""}`;
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / 10 ** exponent;
    const rounded = Number(mantissa.toPrecision(digits));
    const coefficient = Math.abs(rounded - 1) < 10 ** (-digits) ? "" : `${rounded} × `;
    return `${coefficient}10${superscript(exponent)}${unit ? ` ${unit}` : ""}`;
  }

  function formatQuantity(value, unit) {
    const exponent = Math.floor(Math.log10(value));
    if (exponent >= -2 && exponent < 4) {
      return `${Number(value.toPrecision(3)).toLocaleString(locale, {maximumSignificantDigits: 3})} ${unit}`;
    }
    return formatScientific(value, 3, unit);
  }

  function yForEnergy(energy) {
    return Physics.energyToY(energy, SCALE);
  }

  function sceneHeight() {
    return SCALE.paddingTop + (SCALE.maxLog - SCALE.minLog) * SCALE.pxPerDecade + SCALE.paddingBottom;
  }

  function clearDynamicLayers() {
    ["tick-layer", "chapter-layer", "range-layer", "marker-layer", "cosmology-layer", "connector-layer"].forEach(id => {
      byId(id).replaceChildren();
    });
    labelEntries.length = 0;
    rendered.clear();
  }

  function renderTicks() {
    const layer = byId("tick-layer");
    for (let exponent = Math.ceil(SCALE.minLog); exponent <= Math.floor(SCALE.maxLog); exponent += 1) {
      const tick = makeElement("div", `tick${exponent % 5 === 0 ? " major" : ""}`);
      tick.style.top = `${yForEnergy(10 ** exponent)}px`;
      const label = makeElement("span", "tick-label", `10${superscript(exponent)} eV`);
      tick.append(label);
      layer.append(tick);
    }
  }

  function renderChapters() {
    const layer = byId("chapter-layer");
    Data.chapters.forEach(chapter => {
      const element = makeElement("section", "chapter");
      element.dataset.actualY = String(yForEnergy(chapter.energy));
      element.style.top = `${element.dataset.actualY}px`;
      element.append(makeElement("h3", "", localized(chapter.title)), makeElement("p", "", localized(chapter.text)));
      layer.append(element);
    });
  }

  function createMarkerCard(item, actualY) {
    const card = makeElement("button", `marker-card ${categoryClass(item.category)} status-${item.status ?? "measured"}`);
    card.type = "button";
    card.dataset.itemId = item.id;
    card.dataset.category = item.category;
    if (item.endpoint) card.classList.add("endpoint-card");
    card.setAttribute("aria-label", t("markerAria", {title: localized(item.title), value: localized(item.value)}));
    card.append(
      makeElement("span", "marker-kind", statusLabel(item.status ?? "measured")),
      makeElement("h3", "", localized(item.title)),
      makeElement("p", "value", localized(item.value)),
    );
    card.addEventListener("click", () => openDetail(item, card));
    card.addEventListener("pointerenter", () => highlight(item.id, true));
    card.addEventListener("pointerleave", () => highlight(item.id, false));
    card.addEventListener("focus", () => highlight(item.id, true));
    card.addEventListener("blur", () => highlight(item.id, false));
    byId("marker-layer").append(card);
    labelEntries.push({element: card, actualY, lane: item.lane, category: item.category, item, kind: "marker"});
    return card;
  }

  function renderPoint(item) {
    const actualY = yForEnergy(item.energy);
    const card = createMarkerCard(item, actualY);
    rendered.set(item.id, {item, card});
  }

  function renderRange(item) {
    const top = yForEnergy(item.low);
    const bottom = yForEnergy(item.high);
    const band = makeElement("div", `range-band ${categoryClass(item.category)} status-${item.status ?? "representative"}`);
    band.dataset.itemId = item.id;
    band.dataset.category = item.category;
    if (item.openLow) band.classList.add("open-low");
    if (item.openHigh) band.classList.add("open-high");
    band.style.top = `${top}px`;
    band.style.height = `${Math.max(16, bottom - top)}px`;
    byId("range-layer").append(band);
    const actualY = (top + bottom) / 2;
    const card = createMarkerCard(item, actualY);
    rendered.set(item.id, {item, card, band});
  }

  function renderMarkers() {
    Data.markers.forEach(item => item.type === "range" ? renderRange(item) : renderPoint(item));
  }

  function renderCosmology() {
    const layer = byId("cosmology-layer");
    Data.cosmology.forEach(item => {
      const actualY = yForEnergy(item.energy);
      const card = makeElement("article", "cosmology-card category-cosmic");
      card.dataset.category = "cosmic";
      card.append(
        makeElement("h3", "", localized(item.title)),
        makeElement("p", "age", localized(item.age)),
        makeElement("p", "note", localized(item.note)),
      );
      layer.append(card);
      labelEntries.push({element: card, actualY, lane: 3, category: "cosmic", item, kind: "cosmology"});
    });
  }

  function renderSources() {
    const list = byId("source-list");
    list.replaceChildren();
    Object.values(Data.sources).forEach(source => {
      const item = makeElement("li");
      const link = makeElement("a", "", source.label);
      link.href = source.href;
      link.target = "_blank";
      link.rel = "noreferrer";
      item.append(link);
      list.append(item);
    });
  }

  function renderFilterOptions() {
    const options = byId("filter-options");
    options.replaceChildren();
    categoryOrder.forEach(category => {
      const label = makeElement("label", `filter-option ${categoryClass(category)}`);
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = categoryState.get(category);
      input.dataset.category = category;
      input.addEventListener("change", () => {
        categoryState.set(category, input.checked);
        applyFilters();
      });
      label.append(input, makeElement("span", "option-dot"), makeElement("span", "", categoryLabel(category)));
      options.append(label);
    });
  }

  function localizeStatic() {
    document.documentElement.classList.remove("math-ready");
    document.documentElement.lang = locale;
    document.title = locale === "ja" ? "エネルギー階層マップ — Interactive Physics Atlas" : "Energy Scale Atlas — Interactive Physics Atlas";
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const value = t(element.dataset.i18n);
      if (element.dataset.i18n === "title") element.innerHTML = value;
      else element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    byId("brand-home").href = directoryLocale === "ja" ? "../../../ja/" : "../../";
    document.querySelectorAll("[data-language]").forEach(link => {
      const isCurrent = link.dataset.language === locale;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      if (link.dataset.language === "ja") {
        link.href = directoryLocale === "ja" ? "./?lang=ja" : "../../ja/particle-physics/mass-scale-atlas/?lang=ja";
      } else {
        link.href = directoryLocale === "ja" ? "../../../particle-physics/mass-scale-atlas/?lang=en" : "./?lang=en";
      }
    });
    byId("filter-close").setAttribute("aria-label", t("close"));
    byId("detail-close").setAttribute("aria-label", t("detailClose"));
    typesetLocalizedMath();
  }

  function typesetLocalizedMath() {
    const targets = [...document.querySelectorAll("[data-math]")];
    if (!window.MathJax?.startup?.promise) {
      revealMathFallback(targets);
      return;
    }
    window.MathJax.startup.promise
      .then(() => {
        window.MathJax.typesetClear(targets);
        return window.MathJax.typesetPromise(targets);
      })
      .then(() => document.documentElement.classList.add("math-ready"))
      .catch(() => revealMathFallback(targets));
  }

  function revealMathFallback(targets) {
    targets.forEach(target => {
      target.textContent = target.textContent
        .replaceAll("\\overline{\\mathrm{MS}}", "MS̄")
        .replaceAll("\\overline{m}_q", "m̄q")
        .replaceAll("\\mathrm{GeV}", "GeV")
        .replaceAll("\\mu", "μ")
        .replaceAll("\\,", " ")
        .replaceAll("\\(", "")
        .replaceAll("\\)", "")
        .replaceAll("\\hbar", "ℏ")
        .replaceAll("\\ell", "ℓ")
        .replaceAll("\\tau", "τ")
        .replaceAll("k_{\\mathrm B}", "kB");
    });
    document.documentElement.classList.add("math-ready");
  }

  function renderAll() {
    localizeStatic();
    clearDynamicLayers();
    byId("scale-scene").style.height = `${sceneHeight()}px`;
    renderTicks();
    renderChapters();
    renderMarkers();
    renderCosmology();
    renderSources();
    renderFilterOptions();
    applyFilters();
    requestAnimationFrame(() => {
      layoutLabels();
      updateScrollState();
    });
  }

  function applyFilters() {
    rendered.forEach(({item, card, band}) => {
      const visible = categoryState.get(item.category);
      card.hidden = !visible;
      if (band) band.hidden = !visible;
    });
    labelEntries.filter(entry => entry.kind === "cosmology").forEach(entry => {
      entry.element.hidden = !categoryState.get("cosmic");
    });
    layoutLabels();
  }

  function groupKey(entry, width) {
    if (width <= 700) return "mobile";
    if (entry.kind === "cosmology") return "cosmology";
    if (width <= 1080) return `marker-${entry.lane % 2}`;
    return `marker-${entry.lane}`;
  }

  function markerLeft(entry, width, axisX) {
    if (width <= 700) return axisX + 34;
    if (width <= 1080) return entry.lane % 2 === 0 ? axisX + 54 : Math.round(width * .48);
    return [Math.round(width * .23), Math.round(width * .43), Math.round(width * .61)][entry.lane] ?? Math.round(width * .61);
  }

  function clusterEntries(entries, threshold) {
    const clusters = [];
    entries.forEach(entry => {
      const current = clusters.at(-1);
      if (!current || entry.actualY - current.at(-1).actualY > threshold) clusters.push([entry]);
      else current.push(entry);
    });
    return clusters;
  }

  function layoutGroup(entries, minTop) {
    const threshold = window.innerWidth <= 700 ? 118 : 94;
    const clusters = clusterEntries(entries.sort((left, right) => left.actualY - right.actualY), threshold);
    let previousBottom = minTop;
    clusters.forEach(cluster => {
      const gap = 12;
      const heights = cluster.map(entry => Math.max(58, entry.element.offsetHeight));
      const totalHeight = heights.reduce((sum, height) => sum + height, 0) + gap * (cluster.length - 1);
      const center = cluster.reduce((sum, entry) => sum + entry.actualY, 0) / cluster.length;
      let cursor = Math.max(center - totalHeight / 2, previousBottom + gap);
      cluster.forEach((entry, index) => {
        const height = heights[index];
        entry.displayY = cursor + height / 2;
        entry.element.style.top = `${entry.displayY}px`;
        cursor += height + gap;
      });
      previousBottom = cursor - gap;
    });
  }

  function layoutLabels() {
    const scene = byId("scale-scene");
    if (!scene.clientWidth) return;
    const width = scene.clientWidth;
    const axisRect = byId("axis-line").getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const axisX = axisRect.left - sceneRect.left;
    const visible = labelEntries.filter(entry => !entry.element.hidden);
    const groups = new Map();
    visible.forEach(entry => {
      if (entry.kind === "marker") entry.element.style.left = `${markerLeft(entry, width, axisX)}px`;
      const key = groupKey(entry, width);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    });
    groups.forEach(entries => layoutGroup(entries, SCALE.paddingTop - 80));
    positionChapters(axisX);
    alignRangeBands();
    drawConnectors(axisX);
  }

  function overlapArea(left, top, right, bottom, obstacle, padding = 18) {
    const overlapWidth = Math.max(0, Math.min(right, obstacle.right + padding) - Math.max(left, obstacle.left - padding));
    const overlapHeight = Math.max(0, Math.min(bottom, obstacle.bottom + padding) - Math.max(top, obstacle.top - padding));
    return overlapWidth * overlapHeight;
  }

  function positionChapters(axisX) {
    const scene = byId("scale-scene");
    const width = scene.clientWidth;
    const mobile = width <= 700;
    const sceneRect = scene.getBoundingClientRect();
    const obstacles = labelEntries
      .filter(entry => !entry.element.hidden)
      .map(entry => {
        const bounds = entry.element.getBoundingClientRect();
        return {
          left: bounds.left - sceneRect.left,
          right: bounds.right - sceneRect.left,
          top: bounds.top - sceneRect.top,
          bottom: bounds.bottom - sceneRect.top,
        };
      });
    document.querySelectorAll(".chapter").forEach(chapter => {
      const baseY = Number(chapter.dataset.actualY);
      const chapterWidth = chapter.offsetWidth;
      const chapterHeight = chapter.offsetHeight;
      const maxLeft = Math.max(axisX + 24, width - chapterWidth - (mobile ? 18 : 245));
      const xCandidates = mobile
        ? [axisX + 24]
        : [axisX + Math.round(width * .035), Math.round(width * .37), maxLeft];
      const yOffsets = mobile ? [0, -220, 220, -400, 400, -600, 600, -760, 760] : [0, -160, 160, -300, 300, -480, 480, -640, 640];
      let best = {left: xCandidates[0], top: baseY, score: Number.POSITIVE_INFINITY};
      xCandidates.forEach(leftCandidate => {
        const left = Math.max(axisX + 24, Math.min(maxLeft, leftCandidate));
        yOffsets.forEach(offset => {
          const top = Math.max(SCALE.paddingTop - 100, Math.min(sceneHeight() - SCALE.paddingBottom, baseY + offset));
          const overlap = obstacles.reduce(
            (total, obstacle) => total + overlapArea(left, top, left + chapterWidth, top + chapterHeight, obstacle),
            0,
          );
          const score = overlap * 100 + Math.abs(offset);
          if (score < best.score) best = {left, top, score};
        });
      });
      chapter.style.left = `${best.left}px`;
      chapter.style.top = `${best.top}px`;
    });
  }

  function alignRangeBands() {
    labelEntries
      .filter(entry => entry.kind === "marker" && entry.item.type === "range" && !entry.element.hidden)
      .forEach(entry => {
        const band = rendered.get(entry.item.id)?.band;
        if (!band) return;
        const bleed = 10;
        band.style.left = `${entry.element.offsetLeft - bleed}px`;
        band.style.width = `${entry.element.offsetWidth + bleed * 2}px`;
      });
  }

  function drawConnectors(axisX) {
    const svg = byId("connector-layer");
    svg.setAttribute("viewBox", `0 0 ${byId("scale-scene").clientWidth} ${sceneHeight()}`);
    svg.replaceChildren();
    rendered.forEach(record => {
      record.connector = null;
      record.connectorDot = null;
    });
    labelEntries.filter(entry => entry.kind === "marker" && entry.item.type === "point" && !entry.element.hidden).forEach(entry => {
      const cardLeft = entry.element.offsetLeft;
      const controlSpan = Math.max(34, Math.min(110, (cardLeft - axisX) * .34));
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", `connector-path ${categoryClass(entry.category)}`);
      path.setAttribute("d", `M ${axisX} ${entry.actualY} C ${axisX + controlSpan} ${entry.actualY}, ${cardLeft - controlSpan} ${entry.displayY}, ${cardLeft} ${entry.displayY}`);
      path.dataset.itemId = entry.item.id;
      svg.append(path);
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", `connector-dot ${categoryClass(entry.category)}`);
      dot.setAttribute("cx", axisX);
      dot.setAttribute("cy", entry.actualY);
      dot.setAttribute("r", "3");
      dot.dataset.itemId = entry.item.id;
      svg.append(dot);
      const record = rendered.get(entry.item.id);
      if (record) {
        record.connector = path;
        record.connectorDot = dot;
      }
    });
  }

  function highlight(id, active) {
    const record = rendered.get(id);
    if (!record?.connector) return;
    record.connector.classList.toggle("highlighted", active);
    record.connectorDot?.classList.toggle("highlighted", active);
    byId("connector-layer").classList.toggle("has-highlight", active);
  }

  function openDetail(item, trigger) {
    const panel = byId("detail-panel");
    panel.className = `detail-panel ${categoryClass(item.category)}`;
    byId("detail-category").textContent = `${categoryLabel(item.category)} · ${statusLabel(item.status ?? "measured")}`;
    byId("detail-title").textContent = localized(item.title);
    setScientificText(byId("detail-value"), localized(item.value));
    setScientificText(byId("detail-text"), localized(item.detail));
    const sourceBox = byId("detail-sources");
    sourceBox.replaceChildren();
    [[item.source, "source"], [item.secondarySource, "secondarySource"]].forEach(([sourceKey, labelKey]) => {
      const source = Data.sources[sourceKey];
      if (!source) return;
      const link = makeElement("a", "", `${t(labelKey)}: ${source.label} ↗`);
      link.href = source.href;
      link.target = "_blank";
      link.rel = "noreferrer";
      sourceBox.append(link);
    });
    panel.hidden = false;
    detailTrigger = trigger;
    byId("detail-close").focus();
  }

  function closeDetail({restoreFocus = true} = {}) {
    const panel = byId("detail-panel");
    if (panel.hidden) return;
    panel.hidden = true;
    if (restoreFocus) detailTrigger?.focus();
    detailTrigger = null;
  }

  function updateScrollState() {
    scrollFrame = 0;
    const scene = byId("scale-scene");
    const rect = scene.getBoundingClientRect();
    const cursorY = window.innerHeight * .48;
    const localY = cursorY - rect.top;
    const active = localY >= 0 && localY <= rect.height;
    byId("sticky-readout").classList.toggle("visible", active);
    byId("reading-line").classList.toggle("visible", active);
    if (!active) return;

    const clampedY = Math.max(SCALE.paddingTop, Math.min(sceneHeight() - SCALE.paddingBottom, localY));
    const energy = Physics.yToEnergy(clampedY, SCALE);
    setScientificText(byId("current-energy"), formatScientific(energy, 3, "eV"));
    setScientificText(byId("current-length"), formatQuantity(Physics.reducedLengthMeters(energy), "m"));
    setScientificText(byId("current-time"), formatQuantity(Physics.quantumTimeSeconds(energy), "s"));
    setScientificText(byId("current-temperature"), formatQuantity(Physics.temperatureKelvin(energy), "K"));
    const progress = (Physics.logEnergy(energy) - SCALE.minLog) / (SCALE.maxLog - SCALE.minLog);
    byId("progress-bar").style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }

  function scheduleScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollState);
  }

  function bindControls() {
    const filterPanel = byId("filter-panel");
    const filterToggle = byId("filter-toggle");
    const setFilterOpen = open => {
      filterPanel.hidden = !open;
      filterToggle.setAttribute("aria-expanded", String(open));
      if (open) byId("filter-close").focus();
    };
    filterToggle.addEventListener("click", () => setFilterOpen(filterPanel.hidden));
    byId("filter-close").addEventListener("click", () => {
      setFilterOpen(false);
      filterToggle.focus();
    });
    byId("detail-close").addEventListener("click", () => closeDetail());
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (!byId("detail-panel").hidden) closeDetail();
      else if (!filterPanel.hidden) {
        setFilterOpen(false);
        filterToggle.focus();
      }
    });
    window.addEventListener("scroll", scheduleScrollUpdate, {passive: true});
    window.addEventListener("resize", () => {
      layoutLabels();
      updateScrollState();
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => layoutLabels());
      observer.observe(byId("scale-scene"));
    }
  }

  bindControls();
  renderAll();
  if (document.fonts) {
    document.fonts.ready.then(() => {
      layoutLabels();
      updateScrollState();
    });
  }
})();
