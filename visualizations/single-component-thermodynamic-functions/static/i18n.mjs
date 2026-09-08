export const locale = (() => {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "ja") return requested;
  return window.location.pathname.split("/").includes("ja") ? "ja" : "en";
})();

const STRINGS = {
  en: {
    documentTitle: "Thermodynamic Functions of a One-Component System — Interactive Physics Vignettes",
    pressureIsobaric: "Pressure uses a logarithmic scale. Changing it is adiabatic and preserves entropy.",
    pressureBath: "Pressure uses a logarithmic scale. The heat bath holds temperature fixed while it changes.",
    conditionAdiabatic: "Insulated walls. Piston operations are quasistatic, and the wall is fixed afterward.",
    conditionIsothermal: "A heat bath fixes the temperature. Its temperature and the piston correspond to the natural variables T and v. Heat is not set independently; the required transfer appears in the heat-bath ledger.",
    conditionIsobaric: "An insulated movable wall follows the specified external pressure. Heating or cooling and external pressure correspond to the natural variables s and P. Temperature and volume are not independent controls.",
    conditionBath: "A heat bath fixes temperature and the movable-wall load fixes pressure. These settings correspond to the natural variables T and P. Heat and volume are not independent controls.",
    titleU: "Internal energy",
    titleS: "Entropy",
    titleF: "Helmholtz free energy",
    titleH: "Enthalpy",
    titleG: "Gibbs free energy",
    computing: "Computing the local and global thermodynamic surfaces…",
    directOrigin: "Direct state selection",
    equilibriumOrigin: "Physical operation / equilibrium",
    metricT: "Temperature T", metricP: "Pressure P", metricV: "Volume v", metricS: "Entropy s", metricU: "Internal energy u", metricF: "Helmholtz free energy f", metricH: "Enthalpy h", metricG: "Gibbs free energy g", metricMu: "Chemical potential μ (= g)",
    phaseSolid: "Solid", phaseLiquid: "Liquid", phaseVapor: "Vapor",
    ledgerControl: "Direct heating / cooling", ledgerBath: "Heat exchange with bath", ledgerNet: "Net heat Q", ledgerWork: "work W", ledgerDeltaU: "Change in internal energy ΔU", ledgerScope: "Ledger for the full n = 1.000 mol system",
    compressSmall: "Compress slightly −0.05%",
    compress: "Compress slightly −2%",
    expandSmall: "Expand slightly +0.05%",
    expand: "Expand slightly +2%",
    thermalVariable: "Change {symbol} by heating or cooling",
    coexistNonunique: "Phase coexistence: the derivative is not unique here. With contact planes visible, pale gray shows the phase-side limits and the colored supporting plane corresponds to the current phase fractions. Temperature and pressure alone do not determine those fractions.",
    coexist: "Phase coexistence: changing the phase fractions transfers latent heat at fixed temperature and pressure.",
    directLedger: "Changed by direct selection: no heat or work is assigned because this is not a physical process.",
    emptyLedger: "Operate on the state to display heat and work.",
    solidLiquidBoundary: "solid–liquid boundary",
    liquidVaporBoundary: "liquid–vapor boundary",
    solidVaporBoundary: "solid–vapor boundary",
    solidLiquidCoexistence: "solid–liquid coexistence",
    liquidVaporCoexistence: "liquid–vapor coexistence",
    solidVaporCoexistence: "solid–vapor coexistence",
    globalMixedScale: " (linear 42% up to 0.020 L/mol; logarithmic 58% above)",
    globalLogScale: " (logarithmic)",
    globalInstruction: ". Drag to change the view; click to select a state.",
    insulatedWall: "insulated wall",
    fixedTemperatureBath: "fixed-temperature bath",
    heatExchange: "heat exchange",
    directOverlay: "Direct state selection",
    actionHeat: "heat transfer",
    actionVolume: "piston operation",
    actionTemperature: "heat-bath change",
    actionPressure: "load change",
    followed: "The local surface followed the current point. Its position is outlined in gray on the global view.",
    changed: "The quasistatic operation changed the equilibrium state. The ledger is for the latest operation.",
    directChanged: "The equilibrium state was selected directly. Subsequent physical operations start here.",
    ready: "Ready. Compare the system, surface, and operation panels.",
    modeChanged: "The boundary condition and thermodynamic function changed while preserving the equilibrium state.",
    representationChanged: "The same state and operation trail are now shown in different natural variables.",
    resetDone: "Restored the initial state.",
    fitDone: "Fitted the display range to the current point.",
    coolSmall: "− Cool slightly",
    heatSmall: "+ Heat slightly",
    outOfRange: "out of range",
    directionInvalid: "That direction is outside the model range under the current constraint. Choose a green interval on the slider.",
    positiveAmount: "Enter a value greater than zero for {label}.",
    heatAmount: "heat amount",
    volumeAmount: "volume change",
    temperatureAmount: "temperature change",
    pressureAmount: "pressure change",
    unreachable: "unreachable",
    invalidInterval: "A red interval has no equilibrium state in combination with the other currently fixed variable. The state was not changed.",
    initFailed: "Initialization failed. Open the application through an HTTP server and reload it. {error}",
    rendererAria: "Three-dimensional thermodynamic-function surface rendered with JavaScript",
    overviewAria: "Global thermodynamic-function surface and local display boundary. Click to select an equilibrium state.",
  },
  ja: {
    documentTitle: "1成分系の熱力学関数 — Interactive Physics Vignettes",
    pressureIsobaric: "外圧は対数目盛。変更中は熱交換せず、エントロピーを保ちます。",
    pressureBath: "外圧は対数目盛。変更中は熱浴が温度を一定に保ちます。",
    conditionAdiabatic: "断熱壁。ピストン操作は準静的で、操作後は壁を固定します。",
    conditionIsothermal: "熱浴が温度を固定します。自然変数 T と v に対応して、熱浴温度とピストンを操作します。熱は独立に指定せず、必要な熱交換は熱浴との収支に現れます。",
    conditionIsobaric: "断熱された可動壁が設定した外圧に合わせて動きます。自然変数 s と P に対応して、加熱・冷却と外圧を操作します。温度と体積は独立に指定しません。",
    conditionBath: "熱浴が温度、可動壁の荷重が圧力を固定します。自然変数 T と P に対応して、両設定を操作します。熱と体積は独立に指定しません。",
    titleU: "内部エネルギー", titleS: "エントロピー", titleF: "ヘルムホルツ自由エネルギー", titleH: "エンタルピー", titleG: "ギブズ自由エネルギー",
    computing: "局所と全体の熱力学曲面を計算しています…",
    directOrigin: "状態の直接指定", equilibriumOrigin: "物理操作 / 平衡状態",
    metricT: "温度 T", metricP: "圧力 P", metricV: "体積 v", metricS: "エントロピー s", metricU: "内部エネルギー u", metricF: "ヘルムホルツ自由エネルギー f", metricH: "エンタルピー h", metricG: "ギブズ自由エネルギー g", metricMu: "化学ポテンシャル μ (= g)",
    phaseSolid: "固体", phaseLiquid: "液体", phaseVapor: "気体",
    ledgerControl: "直接的加熱・冷却", ledgerBath: "熱浴との熱交換", ledgerNet: "正味の熱 Q", ledgerWork: "仕事 W", ledgerDeltaU: "内部エネルギーの変化 ΔU", ledgerScope: "n = 1.000 mol の系全体の収支",
    compressSmall: "少し圧縮 −0.05%", compress: "少し圧縮 −2%", expandSmall: "少し膨張 +0.05%", expand: "少し膨張 +2%",
    thermalVariable: "加熱・冷却で変える {symbol}",
    coexistNonunique: "相共存：この点で微分は一意ではありません。接平面を表示すると、薄い灰色が各相側の極限、色付き平面が現在の相割合に対応する支持平面を示します。温度と圧力だけでは相の割合は決まりません。",
    coexist: "相共存：相の割合が変わることで、同じ温度・圧力のまま潜熱を受け渡せます。",
    directLedger: "直接指定による変更：物理過程ではないため、熱・仕事は割り当てません。", emptyLedger: "操作すると熱と仕事を表示します。",
    solidLiquidBoundary: "固液境界", liquidVaporBoundary: "液気境界", solidVaporBoundary: "固気境界",
    solidLiquidCoexistence: "固液共存", liquidVaporCoexistence: "液気共存", solidVaporCoexistence: "固気共存",
    globalMixedScale: "（0.020 L/mol までは線形42%、それ以上は対数58%）", globalLogScale: "（対数）", globalInstruction: "。ドラッグで視点を変更、クリックで状態を指定。",
    insulatedWall: "断熱壁", fixedTemperatureBath: "温度一定の熱浴", heatExchange: "熱の出入り",
    directOverlay: "状態の直接指定",
    actionHeat: "熱の出し入れ", actionVolume: "ピストン操作", actionTemperature: "熱浴の変更", actionPressure: "荷重の変更",
    followed: "局所曲面の表示範囲が現在点を追従しました。全体図の灰色の線で位置を確認できます。", changed: "準静的な操作で平衡状態を変更しました。収支は直前の操作分です。",
    directChanged: "平衡状態を直接指定しました。以後の物理操作は、この状態を出発点にします。", ready: "準備できました。系・曲面・操作の3つのパネルを見比べてください。",
    modeChanged: "平衡状態を保ったまま境界条件と熱力学関数を切り替えました。", representationChanged: "同じ状態と操作の軌跡を、別の自然変数で表示しています。",
    resetDone: "初期状態に戻しました。", fitDone: "現在点に表示範囲を合わせました。", coolSmall: "− 少し冷却", heatSmall: "＋ 少し加熱", outOfRange: "範囲外",
    directionInvalid: "この方向は現在の拘束ではモデル範囲外です。スライダーの緑の区間を選んでください。", positiveAmount: "{label}には 0 より大きい値を入力してください。",
    heatAmount: "加熱量", volumeAmount: "体積変化量", temperatureAmount: "温度変化量", pressureAmount: "圧力変化量", unreachable: "到達不可",
    invalidInterval: "赤い区間は、現在固定されている他の変数との組み合わせでは平衡状態がありません。状態は変更していません。",
    initFailed: "初期化できませんでした。HTTP サーバー経由で開き、再読み込みしてください。 {error}",
    rendererAria: "JavaScriptで描画した熱力学関数の三次元曲面", overviewAria: "熱力学関数の全体像と現在の局所表示範囲。クリックで平衡状態を指定できます。",
  },
};

const STATIC_EN = new Map([
  ["1成分系の熱力学関数", "Thermodynamic Functions of a One-Component System"],
  ["熱力学では、平衡状態を温度 \\(T\\)、圧力 \\(P\\)、モル体積 \\(v\\)、モルエントロピー \\(s\\) などの熱力学量で記述します。内部エネルギー \\(u\\) やエンタルピー \\(h\\) などの熱力学関数は状態だけで決まり、準静的な操作は平衡状態の連続的な移り変わりとして表せます。", "Thermodynamics describes equilibrium states using quantities such as temperature \\(T\\), pressure \\(P\\), molar volume \\(v\\), and molar entropy \\(s\\). Thermodynamic functions such as internal energy \\(u\\) and enthalpy \\(h\\) depend only on the state, so a quasistatic operation can be represented as a continuous succession of equilibrium states."],
  ["どの関数が適しているかは状況ごとの拘束条件によって異なります。\\(u(s,v)\\)、\\(s(u,v)\\)、\\(f(T,v)\\)、\\(h(s,P)\\)、\\(g(T,P)\\) は自然変数が異なり、互いにルジャンドル変換で結ばれています。曲面の傾きは、温度・圧力・エントロピー・体積などの共役な熱力学量を与えます。", "The most useful function depends on the constraints of the situation. The functions \\(u(s,v)\\), \\(s(u,v)\\), \\(f(T,v)\\), \\(h(s,P)\\), and \\(g(T,P)\\) have different natural variables and are related by Legendre transforms. Their surface slopes give conjugate thermodynamic quantities such as temperature, pressure, entropy, and volume."],
  ["この可視化では、ピストン、直接的な加熱・冷却、熱浴、外圧を操作し、平衡状態の変化を熱力学関数の曲面上の移動として追います。収支に表示される熱 \\(Q\\) と系がする仕事 \\(W\\) から \\(\\Delta U=Q-W\\) を確認できます。水を模したモデルでは、相共存と、相転移に伴って熱力学関数やその微分に現れる非解析的な構造も観察できます。示量変数は 1 mol あたりで表示します。", "In this visualization, you operate the piston, apply direct heating or cooling, and vary the heat bath and external pressure while following equilibrium-state changes across a thermodynamic-function surface. The ledger shows heat \\(Q\\) and work done by the system \\(W\\), letting you verify \\(\\Delta U=Q-W\\). The water-like model also reveals phase coexistence and the nonanalytic structures that phase transitions produce in thermodynamic functions or their derivatives. Extensive quantities are shown per mole."],
  ["物質", "Substance"], ["水を模した固体・液体・気体", "Water-like solid, liquid, and vapor"], ["単原子理想気体（Ar 基準）", "Monatomic ideal gas (argon reference)"],
  ["境界条件", "Boundary condition"], ["断熱・固定容積", "Adiabatic / fixed volume"], ["断熱・定圧可動壁", "Adiabatic / movable wall at fixed pressure"], ["熱浴・固定容積", "Heat bath / fixed volume"], ["熱浴・定圧可動壁", "Heat bath / movable wall at fixed pressure"],
  ["断熱での表現", "Adiabatic representation"], ["内部エネルギーで表示", "Show internal energy"], ["エントロピーで表示", "Show entropy"], ["物質量 n = 1.000 mol（固定）", "Amount n = 1.000 mol (fixed)"], ["初期状態に戻す", "Reset to initial state"],
  ["ローカルの計算環境を読み込んでいます…", "Loading the local computation engine…"], ["系と現在状態", "System and current state"], ["平衡状態", "Equilibrium state"],
  ["模式図 · 高さ = 体積割合", "Schematic · heights = volume fractions"], ["体積・エントロピー・各エネルギーは 1 mol あたりの値です。", "Volume, entropy, and energies are molar quantities."],
  ["各相のモル割合", "Mole fraction of each phase"], ["各相の体積割合", "Volume fraction of each phase"], ["状態を直接指定する", "Select a state directly"],
  ["自然変数平面の点またはスライダーを動かします。物理操作ではないため、熱・仕事は割り当てません。", "Move a point or slider on the natural-variable plane. This is not a physical operation, so no heat or work is assigned."],
  ["状態を操作する", "Operate on the state"], ["体積操作", "Volume operation"], ["ピストンで体積を変える", "Change volume with the piston"], ["少し圧縮 −2%", "Compress slightly −2%"], ["少し膨張 +2%", "Expand slightly +2%"],
  ["指定する変化量 |Δv|", "Specified change |Δv|"], ["指定量で圧縮", "Compress by amount"], ["指定量で膨張", "Expand by amount"], ["熱操作", "Heat operation"], ["加熱・冷却で変える自然変数", "Natural variable changed by heating or cooling"],
  ["− 少し冷却", "− Cool slightly"], ["＋ 少し加熱", "+ Heat slightly"], ["指定する熱量 |Q|", "Specified heat |Q|"], ["指定量で冷却", "Cool by amount"], ["指定量で加熱", "Heat by amount"],
  ["到達可能", "Reachable"], ["現在の拘束では到達不可", "Unreachable under current constraint"], ["温度操作", "Temperature operation"], ["熱浴温度", "Heat-bath temperature"],
  ["温度を少し下げる −2 K", "Lower temperature slightly −2 K"], ["温度を少し上げる +2 K", "Raise temperature slightly +2 K"], ["指定する変化量 |ΔT|", "Specified change |ΔT|"], ["指定量だけ下げる", "Decrease by amount"], ["指定量だけ上げる", "Increase by amount"],
  ["圧力操作", "Pressure operation"], ["外圧・荷重", "External pressure / load"], ["外圧を少し下げる −5%", "Lower pressure slightly −5%"], ["外圧を少し上げる +5%", "Raise pressure slightly +5%"], ["指定する変化量 |ΔP|", "Specified change |ΔP|"],
  ["直前の操作の収支", "Latest-operation ledger"], ["操作すると熱と仕事を表示します。", "Operate on the state to display heat and work."], ["\\(\\Delta U=Q-W\\)（系へ入る熱と、系が外へする仕事を正とする）", "\\(\\Delta U=Q-W\\) (heat entering the system and work done by the system are positive)"],
  ["エンタルピー", "Enthalpy"], ["現在点に表示範囲を合わせる", "Fit range to current point"], ["GLOBAL / 全体", "GLOBAL"], ["灰色の線", "Gray outline"], ["= メイン表示の範囲", "= main display range"], ["現在の平衡状態", "Current equilibrium state"],
  ["相で色分け", "Color by phase"], ["接線の棒", "Tangent rods"], ["接平面", "Contact plane"], ["操作の軌跡", "Operation trail"], ["固体", "Solid"], ["液体", "Liquid"], ["気体", "Vapor"], ["固液共存", "Solid–liquid coexistence"], ["液気共存", "Liquid–vapor coexistence"], ["固気共存", "Solid–vapor coexistence"], ["三相共存", "Three-phase coexistence"],
  ["この実験で固定される量と、自然変数", "Fixed quantities and natural variables"],
  ["「断熱・固定容積」では \\(u(s,v)\\) または \\(s(u,v)\\)。「断熱・定圧可動壁」では \\(h(s,P)\\)、「熱浴・固定容積」では \\(f(T,v)\\)、「熱浴・定圧可動壁」では \\(g(T,P)\\) を表示します。断熱・固定容積でも、ピストン操作中は \\(s\\) を保って体積を変え、操作後に壁を固定します。", "The adiabatic, fixed-volume setting shows \\(u(s,v)\\) or \\(s(u,v)\\); the adiabatic movable wall at fixed pressure shows \\(h(s,P)\\); the fixed-volume heat bath shows \\(f(T,v)\\); and the heat bath with a movable wall at fixed pressure shows \\(g(T,P)\\). In the first setting, piston motion preserves \\(s\\), after which the wall is fixed."],
  ["操作欄は微分の自然変数に対応します。\\(ds\\) または \\(du\\) があれば、その自然変数をスライダーで指定して準静的に加熱・冷却できます。\\(dT\\) があれば熱浴温度、\\(dv\\) があればピストン、\\(dP\\) があれば外圧を操作できます。スライダーの緑は現在の他変数と組み合わせられる値、赤は平衡状態が存在しない値です。どの組み合わせでも状態が存在しない値はスライダーの端から除いています。", "Controls follow the natural variables in each differential. When \\(ds\\) or \\(du\\) is present, its slider specifies quasistatic heating or cooling. A \\(dT\\) term exposes heat-bath temperature, \\(dv\\) exposes the piston, and \\(dP\\) exposes external pressure. Green slider intervals are compatible with the other fixed variable; red intervals have no equilibrium state. Values impossible in every combination are omitted from the slider endpoints."],
  ["状態欄は境界条件によらず \\(T,P,v,s,u,f,h,g\\) を表示します。表示単位は示量変数について 1 mol あたりです。この試作は単一成分の純物質なので、化学ポテンシャルはギブズ自由エネルギーに等しく、\\(\\mu=g\\) です。相共存中も平衡にある各相の \\(\\mu\\) は同じ値です。", "The state panel always shows \\(T,P,v,s,u,f,h,g\\). Extensive quantities are reported per mole. For this pure one-component model, chemical potential equals molar Gibbs energy, \\(\\mu=g\\), and every coexisting equilibrium phase has the same \\(\\mu\\)."],
  ["色付きの二本の棒は二つの自然変数方向の接線で、接平面とは独立に表示できます。傾きの数値は共役量を SI 単位で表示し、曲面は kJ/mol・L/mol・kPa に換算しています。描画と計算は JavaScript で実行します。カメラや軸の縮尺による見かけの角度は、物理量そのものではありません。", "The two colored rods are tangents in the natural-variable directions and can be shown independently of the contact plane. Numerical slopes use SI units for conjugate quantities; surfaces use kJ/mol, L/mol, and kPa. Rendering and computation run in JavaScript. Apparent angles caused by camera and axis scales are not physical quantities."],
  ["モデル、近似、数値の基準", "Models, approximations, and numerical references"],
  ["物質量は \\(n=1.000\\,\\mathrm{mol}\\) に固定し、示量変数はモル量 \\(u=U/n\\)、\\(s=S/n\\)、\\(v=V/n\\)、\\(f=F/n\\)、\\(h=H/n\\)、\\(g=G/n\\) で表示します。装置図のピストンが表す全体積は \\(V=nv\\) です。理想気体は \\(c_V=3R/2\\)、\\(u=c_VT\\)。粒子種はアルゴンとし、その原子質量、Planck 定数、Avogadro 定数を入れた Sackur–Tetrode 式 \\(s=R[\\ln\\{(v/N_A)(4\\pi m u/(3N_Ah^2))^{3/2}\\}+5/2]\\) を直接計算します。300 K・100 kPa では \\(s=154.974\\,\\mathrm{J/(mol\\,K)}\\) です。", "The amount is fixed at \\(n=1.000\\,\\mathrm{mol}\\), and extensive variables are shown as molar quantities \\(u=U/n\\), \\(s=S/n\\), \\(v=V/n\\), \\(f=F/n\\), \\(h=H/n\\), and \\(g=G/n\\). The piston schematic represents total volume \\(V=nv\\). The ideal gas uses \\(c_V=3R/2\\) and \\(u=c_VT\\), with argon particle mass in the Sackur–Tetrode expression \\(s=R[\\ln\\{(v/N_A)(4\\pi m u/(3N_Ah^2))^{3/2}\\}+5/2]\\). At 300 K and 100 kPa, \\(s=154.974\\,\\mathrm{J/(mol\\,K)}\\)."],
  ["水モデルは各相のモルギブズ関数 \\(g_i(T,P)\\) を定義し、最小の相または共存する相の混合を採用します。\\(s=-\\partial_T g\\)、\\(v=\\partial_P g\\) から全物理量を導出します。定圧モル熱容量は固体・液体・気体で 37、75.3、34 J/(mol K)、融解・蒸発の潜熱は基準点で 6.01、45.0 kJ/mol とした教育用近似です。共通のエントロピー基準は、298.15 K・1 bar の液体で \\(s=69.95\\,\\mathrm{J/(mol\\,K)}\\) となるよう定めています。三重点の目安は", "The water model defines a molar Gibbs function \\(g_i(T,P)\\) for each phase and selects the minimum phase or a coexistence mixture. All quantities follow from \\(s=-\\partial_T g\\) and \\(v=\\partial_P g\\). Its constant-pressure molar heat capacities are 37, 75.3, and 34 J/(mol K) for solid, liquid, and vapor; reference latent heats of fusion and vaporization are 6.01 and 45.0 kJ/mol. A shared entropy reference gives liquid water \\(s=69.95\\,\\mathrm{J/(mol\\,K)}\\) at 298.15 K and 1 bar. The triple-point reference follows"],
  ["IAPWS の 273.16 K・611.657 Pa", "IAPWS at 273.16 K and 611.657 Pa"], ["を参照しています。", "."],
  ["凝縮相は熱膨張なし・小さな圧縮率あり、蒸気は理想気体。氷のモル体積を液体より大きくしています。実在水の高精度な状態方程式ではなく、臨界点・過冷却・核生成・輸送現象は扱いません。計算範囲は 200–620 K、1 Pa–50 MPa。この範囲は精度保証ではありません。計算可能領域の境界を求め、その境界に沿う格子で曲面を描きます。領域外を補間して埋めることはせず、相転移による本来の折れ目も保持します。", "Condensed phases have no thermal expansion and small compressibilities; vapor is ideal, and ice has greater molar volume than liquid. This is not a high-accuracy equation of state for real water and omits the critical point, supercooling, nucleation, and transport. The computational domain is 200–620 K and 1 Pa–50 MPa, not an accuracy range. Surface meshes follow the feasible-domain boundary; they neither fill outside it nor smooth genuine phase-transition folds."],
  ["共存点ではレバー則で相の割合を求めます。\\(g(T,P)\\) の折れ目では各相側の極限平面を示し、混合状態の平面は「支持平面」として表示します。三重点ではヘルムホルツ関数やエンタルピーにも非一意な傾きが現れる場合があり、同様に極限の平面を示します。三重点を温度・圧力だけで直接指定した場合は、数値的に選ばれた一相を表示します。", "At coexistence, phase fractions follow the lever rule. At folds of \\(g(T,P)\\), limiting planes from each phase are shown, while the mixture plane is a supporting plane. Helmholtz energy and enthalpy can likewise have nonunique slopes at the triple point. Selecting the triple point using only temperature and pressure displays the phase chosen by the numerical tie-break."],
]);

const ATTRIBUTE_EN = new Map([
  ["熱浴、断熱壁、相の体積割合、体積変化を表すピストンの模式図", "Schematic of a heat bath, insulated walls, phase volume fractions, and a volume-changing piston"],
  ["自然変数平面。ドラッグで状態を指定できます。キーボードでは隣のスライダーを使用してください。", "Natural-variable plane. Drag to select a state; keyboard users can use the adjacent sliders."],
  ["第一自然変数を直接指定", "Select the first natural variable directly"], ["第二自然変数を直接指定", "Select the second natural variable directly"],
  ["ピストンの体積", "Piston volume"], ["加熱または冷却によって変える自然変数", "Natural variable changed by heating or cooling"], ["指定する熱量の絶対値", "Absolute specified heat"],
  ["熱浴の設定温度", "Heat-bath set temperature"], ["指定する温度変化量", "Specified temperature change"], ["外圧の設定値（対数目盛）", "External pressure setting on a logarithmic scale"], ["指定する圧力変化量", "Specified pressure change"],
  ["熱力学関数と現在点の局所的な3次元表示", "Local three-dimensional thermodynamic-function surface and current point"], ["熱力学関数の全体像と局所表示範囲", "Global thermodynamic-function surface and local display boundary"],
]);

const ERROR_EN = new Map([
  ["モデルの温度・圧力範囲外です（200–620 K、1 Pa–50 MPa）。", "Outside the model domain (200–620 K and 1 Pa–50 MPa)."],
  ["この自然変数の組はモデルの計算範囲外です。範囲を狭めるか別の点を選んでください。", "This pair of natural variables is outside the model domain. Narrow the range or select another point."],
  ["この体積では安定な平衡状態を計算できません。", "No stable equilibrium state can be computed at this volume."],
  ["エントロピーが第1軸の曲面だけに使用できます。", "This operation applies only when entropy is the first surface axis."],
  ["表示する第2自然変数の範囲に平衡状態がありません。", "The displayed range of the second natural variable contains no equilibrium state."],
  ["表示範囲との交差がありません。", "There is no intersection with the displayed range."],
  ["この表示範囲に曲面がありません。現在点に表示範囲を合わせてください。", "There is no surface in this range. Fit the range to the current point."],
  ["この熱力学関数には dS または dU がないため、熱を独立に指定できません。温度を操作してください。", "This thermodynamic function has no dS or dU term, so heat cannot be set independently. Adjust temperature instead."],
  ["等圧ではピストンは自由に動くため、体積を独立に指定できません。", "At fixed pressure the piston moves freely, so volume cannot be set independently."],
  ["この熱力学関数には外圧が自然変数として含まれません。", "External pressure is not a natural variable of this thermodynamic function."],
  ["この境界条件では利用できない操作です。", "That operation is unavailable under this boundary condition."],
  ["この境界条件では熱方向の自然変数を操作できません。", "The thermal natural variable cannot be operated under this boundary condition."],
  ["この表示範囲には選択できる平衡状態がありません。", "This display range contains no selectable equilibrium state."],
]);

export function t(key, values = {}) {
  const template = STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/gu, (_match, name) => String(values[name] ?? ""));
}

export function translateLiteral(value) {
  if (locale === "ja") return value;
  return STATIC_EN.get(value) ?? ATTRIBUTE_EN.get(value) ?? ERROR_EN.get(value) ?? value;
}

export function applyLocale() {
  document.documentElement.lang = locale;
  document.title = t("documentTitle");
  if (locale === "en") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const leading = node.nodeValue.match(/^\s*/u)[0];
      const trailing = node.nodeValue.match(/\s*$/u)[0];
      const content = node.nodeValue.trim();
      if (STATIC_EN.has(content)) node.nodeValue = leading + STATIC_EN.get(content) + trailing;
    }
    for (const element of document.querySelectorAll("[aria-label]")) {
      element.setAttribute("aria-label", ATTRIBUTE_EN.get(element.getAttribute("aria-label")) ?? element.getAttribute("aria-label"));
    }
  }
  const localeLink = document.querySelector("#locale-link");
  if (locale === "ja") {
    localeLink.href = "../../../thermodynamics/single-component-thermodynamic-functions/?lang=en";
    localeLink.textContent = "English";
    localeLink.lang = "en";
  } else {
    localeLink.href = "../../ja/thermodynamics/single-component-thermodynamic-functions/?lang=ja";
    localeLink.textContent = "日本語";
    localeLink.lang = "ja";
  }
}
