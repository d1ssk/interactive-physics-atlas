# 回路周囲の電磁エネルギー流

## 物理的な考え方

回路図では、電圧・電流・素子電力によってエネルギー伝達を記述します。これを場の立場から局所的に見ると、電磁エネルギーは導線の周囲の空間を横切って負荷へ流入します。その流束密度がポインティングベクトル

$$
\mathbf S(\mathbf r,t)=\mathbf E(\mathbf r,t)\times\mathbf H(\mathbf r,t)
$$

です。

直流抵抗では両方の場が定常であり、$\mathbf S$ は連続して抵抗へ向かいます。交流回路では電場と磁場が位相とともに変化します。理想インダクタと理想キャパシタは蓄えたエネルギーを戻せるため、周期平均の実電力が非負でも瞬時の流れは反転しえます。

局所的な収支はポインティングの定理

$$
\frac{\partial u_{\mathrm{em}}}{\partial t}
+\nabla\!\cdot\!\mathbf S
=-\mathbf J\!\cdot\!\mathbf E,
\qquad
u_{\mathrm{em}}=\frac{1}{2}\epsilon_0|\mathbf E|^2
+\frac{1}{2}\mu_0|\mathbf H|^2
$$

で表されます。したがって、負荷へ向かう正の流入は、その素子へ渡される正の瞬時電力と整合します。

## 準静的回路モデル

負荷は理想素子の直列接続です。交流モードでは電圧スライダーを電源電圧のピーク値とし、

$$
Z_R=R,
\qquad
Z_L=i\omega L,
\qquad
Z_C=\frac{1}{i\omega C},
\qquad
\widetilde I=\frac{\widetilde V}{\sum_k Z_k}
$$

を用います。

アプリケーションは最初に、各導体ノードについて単位電位の Laplace 基底場 $\Phi_n(\mathbf r)$ を解きます。複素ノード電圧から

$$
\widetilde\phi(\mathbf r)=\sum_n\widetilde V_n\Phi_n(\mathbf r),
\qquad
\widetilde{\mathbf E}=-\nabla\widetilde\phi
$$

を構成します。

面外方向の磁場は、描画された電流経路に沿う軟化した細線 Biot–Savart 和から計算します。表示する瞬時ベクトルは、選択した位相で両方の実場を復元してから

$$
\mathbf S(\mathbf r,t)
=\operatorname{Re}\!\left[\widetilde{\mathbf E}(\mathbf r)e^{i\omega t}\right]
\times
\operatorname{Re}\!\left[\widetilde{\mathbf H}(\mathbf r)e^{i\omega t}\right]
$$

として求めます。これは複素表示による時間平均ポインティングベクトルではなく、周期内でのリアクティブなエネルギー流の反転を残す定義です。

## 可視化

<iframe src="app/index.html?lang=ja" title="直流・交流直列回路の周囲を流れる電磁エネルギー" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1480px; min-height: 760px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 試してほしいこと

1. **直流**のまま抵抗値と電圧を変え、場の矢印と端子電力を比較してください。周囲の場から抵抗へ流れ込む向きが見えます。
2. 白い曲線ハンドルまたは素子をドラッグしてください。古い場は意図的に無効化されるため、形を決めてから **場を再計算** を押します。
3. 抵抗を接続した **交流** に切り替え、アニメーションを停止して1周期分の位相を動かしてください。電圧と電流が同時に反転するため、抵抗へ向かう瞬時ポインティング流は反転しません。
4. インダクタまたはキャパシタを追加してください。リアクティブ素子の瞬時電力と局所流入が負になる位相は、場または電源へエネルギーを戻していることを表します。
5. 電位、電場、磁場、エネルギー密度の各表示を比較してください。これらは別々の解ではなく、同じ回路状態の異なる見方です。

## 注目する点

- エネルギー輸送を、導線内部だけをエネルギーが移動する描像として表してはいません。ポインティングベクトルは一般に回路周囲の空間にも存在し、散逸素子へ収束します。
- 純抵抗の交流負荷では $\mathbf E$ と $\mathbf H$ がともに反転するため、$\mathbf E\times\mathbf H$ は抵抗へ向いたままです。
- 理想リアクティブ素子では瞬時素子電力の符号が変わり、その周期平均はゼロです。一方、抵抗の瞬時電力は非負です。
- 場の検査は符号だけを比較します。各負荷を囲む表示上の2次元ポインティング流束を積分し、その素子の瞬時電力と符号が一致するかを調べます。

## 規約と限界

これは低周波・2次元・細線・準静的な概念モデルです。座標と場の大きさは規格化されており、表示される流束は $\mathrm{W\,m^{-2}}$ 単位の絶対測定値ではありません。有限の計算境界、軟化した導線磁場、粗い数値格子が局所的な形に影響します。

3次元の素子形状、伝搬遅延、放射、表皮効果、誘電体構造、形状依存の寄生インピーダンスは含みません。$R$、$L$、$C$ は理想集中定数素子です。無損失の直列 $LC$ が厳密に共振すると理想モデルでは電流が発散するため、場を未定義とします。

## 参考文献

- D. J. Griffiths, *Introduction to Electrodynamics*（電磁エネルギーとポインティングの定理の節）
- R. P. Feynman, R. B. Leighton, M. Sands, *The Feynman Lectures on Physics*, Vol. II, Chapters 27–28
