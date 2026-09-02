"use strict";

const DATA = JSON.parse(document.getElementById("application-data").textContent);
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const MESSAGES = {
  en: {
    title: "Cosmic Causal Structure",
    lede: "The same light cones and cosmological horizons in four coordinate choices.",
    timeLog: "Logarithmic time",
    includeInflation: "Include inflation",
    timeHeading: "Logarithmic time",
    timeNote: "Without inflation, both time axes start at \\(10^{-12}\\) in their displayed units. With inflation, conformal time uses a signed logarithmic scale.",
    inflationHeading: "Inflation",
    inflationNote: "The inflation checkbox replaces all four panels with one finite inflation plus hot Big Bang history. The shaded interval is the inflationary stage.",
    contactHeading: "CMB causal contact",
    contactNote: "Blue lines trace the past light rays from opposite CMB points. Their first intersection is identified only by its marker and legend entry.",
    plotAria: "Cosmic causal structure in four coordinate choices",
    sectionAria: "Cosmic causal-structure controls and plots",
    hotBigBang: "Hot Big Bang only",
    inflationModel: "inflation + hot Big Bang",
    linearTime: "linear time",
    logTime: "logarithmic time",
    linearDistance: "linear distance",
    loadError: "The plotting library could not be loaded. Reload the page to try again.",
  },
  ja: {
    title: "宇宙の因果構造",
    lede: "同じ光円錐と宇宙論的地平線を、4通りの座標で比較します。",
    timeLog: "時間を対数表示",
    includeInflation: "inflation を含める",
    timeHeading: "時間の対数表示",
    timeNote: "inflation を含めない場合、両方の時間軸は表示単位で \\(10^{-12}\\) を下限とします。inflation を含めた共形時間には符号付き対数を使います。",
    inflationHeading: "Inflation",
    inflationNote: "チェックすると、4パネルすべてが有限な inflation と hot Big Bang を接続した同一の履歴へ切り替わります。紫の帯が inflation 期です。",
    contactHeading: "CMB の因果接触",
    contactNote: "青線は CMB 対向点から遡る光線です。最初の交点はマーカーで示し、名称は凡例にだけ表示します。",
    plotAria: "4通りの座標で表した宇宙の因果構造",
    sectionAria: "宇宙の因果構造の操作とプロット",
    hotBigBang: "hot Big Bang のみ",
    inflationModel: "inflation + hot Big Bang",
    linearTime: "時間：線形",
    logTime: "時間：対数",
    linearDistance: "距離：線形",
    loadError: "描画ライブラリを読み込めませんでした。ページを再読み込みしてください。",
  },
};
const t = key => MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key;
const byId = id => document.getElementById(id);

function typeset(target) {
  const startup = window.MathJax?.startup?.promise;
  if (!startup) return;
  startup.then(() => {
    window.MathJax.typesetClear([target]);
    return window.MathJax.typesetPromise([target]);
  });
}

function localizeStaticContent() {
  document.documentElement.lang = LOCALE;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerHTML = t(element.dataset.i18n);
  });
  byId("causal-plot").setAttribute("aria-label", t("plotAria"));
  document.querySelector(".plot-card").setAttribute("aria-label", t("sectionAria"));
  typeset(document.body);
}

localizeStaticContent();

const plot = byId("causal-plot");
const timeLog = byId("time-log");
const includeInflation = byId("include-inflation");
const status = byId("plot-status");
const error = byId("plot-error");
const MOBILE_LAYOUT = window.matchMedia("(max-width: 780px)");
const panelDefinitions = [
  {index:0,time:"conformal",distance:"comoving",xaxis:"x",yaxis:"y",title:"Comoving distance<br>Conformal time"},
  {index:1,time:"conformal",distance:"proper",xaxis:"x2",yaxis:"y2",title:"Proper distance<br>Conformal time"},
  {index:2,time:"cosmic",distance:"comoving",xaxis:"x3",yaxis:"y3",title:"Comoving distance<br>Cosmic time"},
  {index:3,time:"cosmic",distance:"proper",xaxis:"x4",yaxis:"y4",title:"Proper distance<br>Cosmic time"},
];

function panelsForViewport() {
  const domains = MOBILE_LAYOUT.matches
    ? [
        {xDomain:[0,1],yDomain:[.81,1]},
        {xDomain:[0,1],yDomain:[.54,.73]},
        {xDomain:[0,1],yDomain:[.27,.46]},
        {xDomain:[0,1],yDomain:[0,.19]},
      ]
    : [
        {xDomain:[0,.46],yDomain:[.56,1]},
        {xDomain:[.54,1],yDomain:[.56,1]},
        {xDomain:[0,.46],yDomain:[0,.44]},
        {xDomain:[.54,1],yDomain:[0,.44]},
      ];
  return panelDefinitions.map((panel,index) => ({...panel,...domains[index]}));
}

const signedLog = (value, threshold) => Math.sign(value) * Math.log10(1 + Math.abs(value) / threshold);
const firstPositive = values => Math.min(...values.filter(value => value > 0 && Number.isFinite(value)));
const uniqueSorted = values => [...new Set(values)].sort((left,right) => left-right);
const powerLabel = exponent => exponent === 0 ? "1" : `10<sup>${exponent}</sup>`;

function symmetricTicks(values, threshold) {
  const positives = values.map(Math.abs).filter(value => value > 0 && Number.isFinite(value));
  const low = Math.floor(Math.log10(Math.min(...positives)));
  const high = Math.ceil(Math.log10(Math.max(...positives)));
  const step = Math.max(1, Math.ceil((high-low)/6));
  const exponents = [];
  for (let exponent=low; exponent<=high; exponent+=step) exponents.push(exponent);
  if (exponents.at(-1) !== high) exponents.push(high);
  const actual = uniqueSorted([
    ...exponents.map(exponent => -(10 ** exponent)),
    0,
    ...exponents.map(exponent => 10 ** exponent),
  ]);
  return {
    tickvals: actual.map(value => signedLog(value,threshold)),
    ticktext: actual.map(value => {
      if (value < 0) return `−${powerLabel(Math.round(Math.log10(-value)))}`;
      if (value === 0) return "0";
      return powerLabel(Math.round(Math.log10(value)));
    }),
  };
}

function thresholdFor(values) {
  const positive = firstPositive(values.map(Math.abs));
  return 10 ** (Math.floor(Math.log10(positive)) - 1);
}

const actualTime = (source,time) => time === "conformal" ? source.eta : source.time;
const actualDistance = (values,scaleFactor,distance) => distance === "comoving"
  ? values
  : values.map((value,index) => value*scaleFactor[index]);
const axisKey = axis => axis === "x" || axis === "y"
  ? `${axis}axis`
  : `${axis[0]}axis${axis.slice(1)}`;

function cssValue(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function semanticColors() {
  return {
    light: cssValue("--causal-light-cone"),
    particle: cssValue("--causal-particle"),
    event: cssValue("--causal-event"),
    hubble: cssValue("--causal-hubble"),
    cmb: cssValue("--causal-cmb"),
    contact: cssValue("--causal-contact"),
    inflation: cssValue("--causal-inflation"),
    ink: cssValue("--causal-ink"),
    muted: cssValue("--causal-muted"),
    paper: cssValue("--atlas-viz-panel"),
    grid: cssValue("--atlas-viz-border"),
  };
}

async function render() {
  const model = includeInflation.checked ? DATA.inflation : DATA.hotBigBang;
  const colors = semanticColors();
  const mobile = MOBILE_LAYOUT.matches;
  const panels = panelsForViewport();
  const traces = [];
  const shapes = [];
  const layout = {
    height: mobile ? 2300 : 1060,
    margin: mobile ? {l:72,r:24,t:260,b:72} : {l:84,r:38,t:164,b:72},
    paper_bgcolor: colors.paper,
    plot_bgcolor: colors.paper,
    font: {family:"Inter, system-ui, sans-serif",color:colors.ink,size:12},
    dragmode: "pan",
    hovermode: "closest",
    legend: {orientation:"h",x:.5,xanchor:"center",y:mobile ? 1.08 : 1.12,yanchor:"bottom"},
  };

  panels.forEach(panel => {
    const yActual = actualTime(model.main,panel.time);
    const yPool = [...yActual,...actualTime(model.rays,panel.time)];
    if (model.hasInflation && panel.time === "conformal") {
      yPool.push(model.events.etaIntersection);
    }
    const useSymLog = timeLog.checked && model.hasInflation && panel.time === "conformal";
    const yThreshold = useSymLog ? thresholdFor(yPool) : null;
    const mapY = values => useSymLog
      ? values.map(value => signedLog(value,yThreshold))
      : values;

    model.series.forEach(item => {
      const baseX = actualDistance(item.x,model.main.a,panel.distance);
      [1,-1].forEach((branch,branchIndex) => {
        const x = baseX.map(value => branch*value);
        traces.push({
          x,
          y: mapY(yActual),
          xaxis: panel.xaxis,
          yaxis: panel.yaxis,
          mode: "lines",
          name: item.name,
          legendgroup: item.name,
          showlegend: panel.index === 0 && branchIndex === 0,
          line: {color:colors[item.colorKey],width:2.2,dash:item.dash},
          customdata: x.map((value,index) => [
            value,
            yActual[index],
            model.main.a[index],
            model.main.phase[index],
          ]),
          hovertemplate: "distance=%{customdata[0]:.4g} Gpc<br>time=%{customdata[1]:.4g}<br>a=%{customdata[2]:.3e}<br>%{customdata[3]}<extra>"+item.name+"</extra>",
        });
      });
    });

    const rayTime = actualTime(model.rays,panel.time);
    [model.rays.right,model.rays.left].forEach((values,rayIndex) => {
      const x = actualDistance(values,model.rays.a,panel.distance);
      traces.push({
        x,
        y: mapY(rayTime),
        xaxis: panel.xaxis,
        yaxis: panel.yaxis,
        mode: "lines",
        name: "Past rays from opposite CMB points",
        legendgroup: "cmb-rays",
        showlegend: panel.index === 0 && rayIndex === 0,
        line: {color:colors.cmb,width:2.6},
        customdata: x.map((value,index) => [value,rayTime[index],model.rays.a[index]]),
        hovertemplate: "distance=%{customdata[0]:.4g} Gpc<br>time=%{customdata[1]:.4g}<br>a=%{customdata[2]:.3e}<extra>Past CMB ray</extra>",
      });
    });

    const eventTime = panel.time === "conformal"
      ? model.events.etaRecombination
      : model.events.timeRecombination;
    const eventX = panel.distance === "comoving"
      ? model.events.chiLastScattering
      : model.events.aRecombination*model.events.chiLastScattering;
    traces.push({
      x: [-eventX,eventX],
      y: mapY([eventTime,eventTime]),
      xaxis: panel.xaxis,
      yaxis: panel.yaxis,
      mode: "markers",
      name: "Opposite CMB emission events",
      legendgroup: "cmb-events",
      showlegend: panel.index === 0,
      marker: {color:colors.cmb,size:9,symbol:"diamond"},
      hovertemplate: "CMB emission<extra></extra>",
    });

    if (model.hasInflation) {
      const intersectionTime = panel.time === "conformal"
        ? model.events.etaIntersection
        : model.events.timeIntersection;
      traces.push({
        x: [0],
        y: mapY([intersectionTime]),
        xaxis: panel.xaxis,
        yaxis: panel.yaxis,
        mode: "markers",
        name: "First intersection of the CMB past rays",
        legendgroup: "first-contact",
        showlegend: panel.index === 0,
        marker: {color:colors.contact,size:11,line:{color:colors.paper,width:1}},
        hovertemplate: "First intersection of the CMB past rays<extra></extra>",
      });
    }

    traces.push({
      x: [0,0],
      y: mapY(yActual),
      xaxis: panel.xaxis,
      yaxis: panel.yaxis,
      mode: "lines",
      name: "Our comoving worldline",
      legendgroup: "observer",
      showlegend: panel.index === 0,
      line: {color:colors.ink,width:1.6},
      hoverinfo: "skip",
    });

    if (model.hasInflation) {
      const startActual = panel.time === "conformal"
        ? model.events.etaStart
        : firstPositive(model.main.time);
      const endActual = panel.time === "conformal"
        ? model.events.etaReheating
        : model.events.timeReheating;
      const [yStart,yEnd] = mapY([startActual,endActual]);
      shapes.push({
        type: "rect",
        xref: `${panel.xaxis} domain`,
        x0: 0,
        x1: 1,
        yref: panel.yaxis,
        y0: yStart,
        y1: yEnd,
        fillcolor: "rgba(128,97,166,.13)",
        line: {width:0},
        layer: "below",
      });
      shapes.push({
        type: "line",
        xref: `${panel.xaxis} domain`,
        x0: 0,
        x1: 1,
        yref: panel.yaxis,
        y0: yEnd,
        y1: yEnd,
        line: {color:colors.inflation,width:1.2,dash:"dot"},
      });
    }

    const xKey = axisKey(panel.xaxis);
    const yKey = axisKey(panel.yaxis);
    layout[xKey] = {
      domain: panel.xDomain,
      anchor: panel.yaxis,
      title: panel.distance === "comoving"
        ? "Comoving radial coordinate χ [Gpc]"
        : "Proper distance D = aχ [Gpc]",
      gridcolor: colors.grid,
      zerolinecolor: colors.muted,
      automargin: true,
    };
    layout[yKey] = {
      domain: panel.yDomain,
      anchor: panel.xaxis,
      title: panel.time === "conformal"
        ? "Conformal time cη [Gpc]"
        : "Cosmic time t [Gyr]",
      gridcolor: colors.grid,
      zerolinecolor: colors.muted,
      automargin: true,
    };
    if (timeLog.checked) {
      if (useSymLog) {
        Object.assign(layout[yKey],symmetricTicks(yPool,yThreshold),{
          title: layout[yKey].title+" — symlog",
        });
      } else {
        const lowerBound = model.hasInflation
          ? firstPositive(yPool)
          : Math.max(1e-12,firstPositive(yPool));
        Object.assign(layout[yKey],{
          type: "log",
          exponentformat: "power",
          range: [Math.log10(lowerBound),Math.log10(Math.max(...yPool)*1.1)],
        });
      }
    }
  });

  if (model.hasInflation) {
    traces.push({
      x: [null],
      y: [null],
      mode: "lines",
      name: `Inflation (${model.events.eFolds} e-folds)`,
      legendgroup: "inflation-epoch",
      showlegend: true,
      line: {color:"rgba(128,97,166,.48)",width:9},
    });
  }
  layout.shapes = shapes;
  layout.annotations = panels.map(panel => ({
    text: panel.title,
    x: (panel.xDomain[0]+panel.xDomain[1])/2,
    y: panel.yDomain[1]+.035,
    xref: "paper",
    yref: "paper",
    showarrow: false,
    font: {size:12},
  }));
  const modelName = model.hasInflation ? t("inflationModel") : t("hotBigBang");
  status.textContent = `${modelName} · ${timeLog.checked ? t("logTime") : t("linearTime")} · ${t("linearDistance")}`;
  await Plotly.react(plot,traces,layout,{
    responsive: true,
    scrollZoom: true,
    displaylogo: false,
  });
  window.dispatchEvent(new Event("physics-atlas:plot-rendered"));
}

[timeLog,includeInflation].forEach(input => {
  input.addEventListener("change", () => void render());
});

MOBILE_LAYOUT.addEventListener("change", () => {
  void window.physicsAtlasPlotlyReady.then(() => render());
});

window.physicsAtlasPlotlyReady
  .then(() => render())
  .catch(() => {
    error.textContent = t("loadError");
    error.hidden = false;
    window.dispatchEvent(new Event("physics-atlas:plot-rendered"));
  });
