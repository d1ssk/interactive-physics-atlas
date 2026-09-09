"use strict";

(() => {
  const TRANSLATIONS = {
    en: {
      title: "Crystal lattices and first Brillouin zones",
      leadReal: "Compare a real-space Bravais lattice with its reciprocal lattice.",
      leadDefinition: "The shaded first Brillouin zone is the reciprocal-lattice Wigner–Seitz cell.",
      settingsLabel: "Display settings", lattice: "Lattice", realPoints: "Real-lattice points",
      primitiveCell: "Primitive cell and basis", reciprocalPoints: "Reciprocal-lattice points",
      zoneEdges: "Zone edges", zoneOpacity: "Zone opacity", selected: "Selected lattice",
      cellVolume: "Primitive-cell volume", zoneVolume: "Brillouin-zone volume",
      loading: "Loading three-dimensional plots…", loadError: "The three-dimensional plots could not be loaded.",
      plotsLabel: "Real- and reciprocal-space plots", realCaption: "Real space",
      reciprocalCaption: "Reciprocal space and first Brillouin zone",
      realPlotLabel: "Three-dimensional real-space crystal lattice",
      reciprocalPlotLabel: "Three-dimensional reciprocal lattice and first Brillouin zone",
      howToRead: "How to read the plots.",
      basisExplanation: "The red, green, and blue vectors are the primitive bases",
      and: "and", faceExplanation: "Every shaded face bisects the segment from the origin to a reciprocal-lattice point.",
      gestureHelp: "Drag to rotate and use the wheel or trackpad to zoom.",
      latticeNames: {sc: "Simple cubic (SC)", bcc: "Body-centered cubic (BCC)", fcc: "Face-centered cubic (FCC)", hexagonal: "Simple hexagonal"},
      notes: {sc: "Its first Brillouin zone is a cube.", bcc: "Its first Brillouin zone is a rhombic dodecahedron.", fcc: "Its first Brillouin zone is a truncated octahedron.", hexagonal: "Here c/a = 1.6; its first Brillouin zone is a hexagonal prism."},
    },
    ja: {
      title: "結晶格子と第一 Brillouin zone",
      leadReal: "実空間の Bravais 格子と、それに対応する逆格子を比較します。",
      leadDefinition: "色付きの第一 Brillouin zone は、逆格子の Wigner–Seitz 胞です。",
      settingsLabel: "表示設定", lattice: "格子", realPoints: "実格子点",
      primitiveCell: "原始胞と基底", reciprocalPoints: "逆格子点", zoneEdges: "zone の稜線",
      zoneOpacity: "zone の不透明度", selected: "選択中の格子", cellVolume: "原始胞体積",
      zoneVolume: "Brillouin zone の体積", loading: "3 次元プロットを読み込んでいます…",
      loadError: "3 次元プロットを読み込めませんでした。",
      plotsLabel: "実空間と逆空間のプロット", realCaption: "実空間",
      reciprocalCaption: "逆空間と第一 Brillouin zone", realPlotLabel: "実空間の結晶格子の 3 次元表示",
      reciprocalPlotLabel: "逆格子と第一 Brillouin zone の 3 次元表示",
      howToRead: "プロットの見方。", basisExplanation: "赤・緑・青のベクトルは原始基底",
      and: "および", faceExplanation: "色付きの各面は、原点とある逆格子点を結ぶ線分の垂直二等分面です。",
      gestureHelp: "ドラッグで回転し、ホイールまたはトラックパッドで拡大縮小できます。",
      latticeNames: {sc: "単純立方格子 (SC)", bcc: "体心立方格子 (BCC)", fcc: "面心立方格子 (FCC)", hexagonal: "単純六方格子"},
      notes: {sc: "第一 Brillouin zone は立方体。", bcc: "第一 Brillouin zone は菱形十二面体。", fcc: "第一 Brillouin zone は切頂八面体。", hexagonal: "ここでは c/a = 1.6。第一 Brillouin zone は六角柱。"},
    },
  };

  const locale = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
  const strings = TRANSLATIONS[locale];
  const data = window.BRILLOUIN_DATA;
  const byId = id => document.getElementById(id);
  const select = byId("lattice-select");
  const realPointsToggle = byId("real-points");
  const realCellToggle = byId("real-cell");
  const reciprocalPointsToggle = byId("reciprocal-points");
  const zoneEdgesToggle = byId("zone-edges");
  const opacitySlider = byId("opacity");
  const status = byId("runtime-status");

  document.documentElement.lang = locale;
  document.title = strings.title;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = strings[element.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    element.setAttribute("aria-label", strings[element.dataset.i18nAriaLabel]);
  });

  for (const key of Object.keys(data)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = strings.latticeNames[key];
    select.appendChild(option);
  }

  const css = getComputedStyle(document.documentElement);
  const color = name => css.getPropertyValue(name).trim();
  const colors = [color("--basis-a1"), color("--basis-a2"), color("--basis-a3")];
  const plotConfig = {responsive: true, displaylogo: false, scrollZoom: true};
  const sceneBase = {
    aspectmode: "data", dragmode: "turntable",
    xaxis: {title: "x", showbackground: false, gridcolor: color("--atlas-viz-border"), zerolinecolor: "#9ea8b5"},
    yaxis: {title: "y", showbackground: false, gridcolor: color("--atlas-viz-border"), zerolinecolor: "#9ea8b5"},
    zaxis: {title: "z", showbackground: false, gridcolor: color("--atlas-viz-border"), zerolinecolor: "#9ea8b5"},
    camera: {eye: {x: 1.55, y: 1.55, z: 1.2}},
  };
  const plotNames = {
    sc: {real: "Simple cubic (SC)", reciprocal: "simple cubic"},
    bcc: {real: "Body-centered cubic (BCC)", reciprocal: "face-centered cubic (FCC)"},
    fcc: {real: "Face-centered cubic (FCC)", reciprocal: "body-centered cubic (BCC)"},
    hexagonal: {real: "Simple hexagonal", reciprocal: "simple hexagonal"},
  };

  function xyz(points) {
    return {x: points.map(point => point[0]), y: points.map(point => point[1]), z: points.map(point => point[2])};
  }

  function basisTraces(vectors, symbol) {
    return vectors.map((vector, index) => ({
      type: "scatter3d", mode: "lines+markers+text",
      x: [0, vector[0]], y: [0, vector[1]], z: [0, vector[2]],
      text: ["", `${symbol}<sub>${index + 1}</sub>`], textposition: "top center",
      line: {color: colors[index], width: 8}, marker: {color: colors[index], size: [0, 4]},
      name: `${symbol}<sub>${index + 1}</sub>`,
      hovertemplate: `${symbol}<sub>${index + 1}</sub><br>(%{x:.3f}, %{y:.3f}, %{z:.3f})<extra></extra>`,
    }));
  }

  function lineTrace(lines, name, lineColor, width, visible = true) {
    return {type: "scatter3d", mode: "lines", x: lines[0], y: lines[1], z: lines[2], name,
      visible, hoverinfo: "skip", line: {color: lineColor, width}};
  }

  function commonLayout(title) {
    return {
      title: {text: title, font: {size: 16}}, margin: {l: 2, r: 2, t: 46, b: 2},
      font: {family: "Inter, Noto Sans JP, system-ui, sans-serif", color: "#344052"},
      scene: structuredClone(sceneBase), legend: {x: 0.01, y: 0.99},
      paper_bgcolor: color("--atlas-viz-panel"), uirevision: "same-camera",
    };
  }

  function redraw() {
    const key = select.value;
    const item = data[key];
    const realPoints = xyz(item.realPoints);
    const realTraces = [{
      type: "scatter3d", mode: "markers", x: realPoints.x, y: realPoints.y, z: realPoints.z,
      name: "real lattice", visible: realPointsToggle.checked,
      marker: {color: color("--lattice-point"), size: 3.5, opacity: 0.78},
      hovertemplate: "r=(%{x:.3f}, %{y:.3f}, %{z:.3f})<extra></extra>",
    }];
    if (realCellToggle.checked) {
      realTraces.push(lineTrace(item.cellLines, "primitive cell", color("--primitive-cell"), 6));
      realTraces.push(...basisTraces(item.primitive, "a"));
    }
    Plotly.react("real-plot", realTraces, commonLayout(`Real space: ${plotNames[key].real}`), plotConfig);

    const reciprocalPoints = xyz(item.reciprocalPoints);
    const zoneVertices = xyz(item.zoneVertices);
    const reciprocalTraces = [{
      type: "mesh3d", x: zoneVertices.x, y: zoneVertices.y, z: zoneVertices.z,
      i: item.triangles.map(triangle => triangle[0]),
      j: item.triangles.map(triangle => triangle[1]),
      k: item.triangles.map(triangle => triangle[2]),
      name: "first Brillouin zone", color: color("--zone-face"), opacity: Number(opacitySlider.value),
      flatshading: true, hoverinfo: "skip",
      lighting: {ambient: 0.72, diffuse: 0.65, specular: 0.25, roughness: 0.75},
    }, lineTrace(item.zoneLines, "zone edges", color("--zone-edge"), 5, zoneEdgesToggle.checked), {
      type: "scatter3d", mode: "markers", x: reciprocalPoints.x, y: reciprocalPoints.y, z: reciprocalPoints.z,
      name: "reciprocal lattice", visible: reciprocalPointsToggle.checked,
      marker: {color: color("--reciprocal-point"), size: 3.5, opacity: 0.68},
      hovertemplate: "G=(%{x:.3f}, %{y:.3f}, %{z:.3f})<extra></extra>",
    }, ...basisTraces(item.reciprocal, "b")];
    Plotly.react(
      "reciprocal-plot", reciprocalTraces,
      commonLayout(`Reciprocal: ${plotNames[key].reciprocal}`), plotConfig,
    );

    byId("selected-name").textContent = strings.latticeNames[key];
    byId("cell-volume").textContent = item.cellVolume.toFixed(4);
    byId("zone-volume").textContent = item.zoneVolume.toFixed(4);
    byId("note").textContent = strings.notes[key];
  }

  [select, realPointsToggle, realCellToggle, reciprocalPointsToggle, zoneEdgesToggle, opacitySlider]
    .forEach(control => control.addEventListener(control.type === "range" ? "input" : "change", redraw));
  select.value = "sc";

  window.physicsAtlasPlotlyReady.then(() => {
    redraw();
    status.hidden = true;
  }).catch(() => {
    status.textContent = strings.loadError;
    status.classList.add("error");
  });
})();
