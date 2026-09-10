# Kelvin–Helmholtz 不安定性

隣り合う流れの速度が異なると、その界面の小さな波打ちは、せん断流からエネルギーを受け取って成長することがあります。やがて緩やかな波は billow と渦の列へ巻き上がります。これが Kelvin–Helmholtz 不安定性の典型的な形です。

<div class="phenomenon-photo-grid">
  <figure class="phenomenon-photo">
    <div class="phenomenon-photo-media"><img src="../../assets/images/kelvin-helmholtz-hartford-clouds.jpg" alt="夕暮れの Hartford 上空に、砕ける波のような形の雲が連なる様子" width="960" height="840" loading="eager"></div>
    <figcaption>2022 年 6 月 27 日、夕暮れの Hartford 上空に現れた Kelvin–Helmholtz 雲。撮影: Paul Danese. <a href="https://commons.wikimedia.org/wiki/File:Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg">Wikimedia Commons</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>.</figcaption>
  </figure>
  <figure class="phenomenon-photo">
    <div class="phenomenon-photo-media"><img src="../../assets/images/kelvin-helmholtz-saturn.jpg" alt="土星の明暗の雲帯の境界に、巻いた波が連なる様子" width="961" height="551" loading="eager"></div>
    <figcaption>2004 年 10 月 9 日、Cassini 探査機の狭角カメラが捉えた土星大気の緯度帯境界の巻き上がり。Credit: NASA/JPL/Space Science Institute. <a href="https://science.nasa.gov/photojournal/rough-around-the-edges/">Source: NASA Photojournal PIA06502</a>.</figcaption>
  </figure>
</div>

NASA はこの雲帯境界に連なる巻きを Kelvin–Helmholtz 不安定性のパターンと同定しています。同じ機構は、地球大気の雲層、海洋や実験室のせん断層、巨大ガス惑星の帯状大気など、大きく異なるスケールに現れます。物質の種類よりも、速度差と、摂動された界面の力学的応答が本質です。

## 可視化

<iframe src="app/index.html?lang=ja" title="Kelvin–Helmholtz 界面の巻き上がりと線形成長率スペクトル" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1000px; min-height: 700px; border: 0; overflow: hidden;" loading="eager"></iframe>

### 試してみること

1. 密度を等しくしたまま速度差 $\Delta U$ を小さくします。選択中のモードの成長率がゼロに近づき、巻き上がりが止まることを確かめます。
2. 界面張力 $\sigma$ を大きくし、波長 $\lambda$ を短くします。黒点をカットオフ $k_c$ の反対側へ動かし、選択中のモードが安定になる前後で流れのパネルを比べます。
3. $\rho_1/\rho_2$ を 1 の上下に変化させます。密度比をその逆数に置き換えても成長率は変わりませんが、密度加重した位相速度の符号は反転します。
4. トレーサーを表示します。各点の色は初期にどちらの流体にあったかを保つため、色の境界が細くなっても物質の伸長と入り組みが見えます。

## 摂動された界面の線形フィードバック

流体 1 が $y>0$、流体 2 が $y<0$ を占めるとします。密度と遠方の一様速度をそれぞれ $(\rho_1,U_1)$, $(\rho_2,U_2)$ とします。初期に平らな界面の法線モードは

$$
\eta(x,t)=\eta_0 e^{i(kx-\omega t)}.
$$

と書けます。流れは界面を貫くことができないため、山や谷の周りで上下の流れが曲げられます。生じた速度ポテンシャルは、線形化した非定常 Bernoulli の関係

$$
\delta p_i=-\rho_i(\partial_t+U_i\partial_x)\delta\phi_i.
$$

を通じて圧力摂動を生みます。$U_1$ と $U_2$ が異なるため、二つの圧力応答は必ずしも復元する位相にはなりません。二つの法線モードのうち一方では、圧力差が山を押し上げ、谷を深くします。こうして、界面変位、速度摂動、圧力摂動の間に正のフィードバックができます。これは本質的に粘性抵抗ではなく、理想的な非粘性流体でも不安定性は生じます。

## 分散関係と成長率

非粘性・非圧縮で無限に深い二流体を考えます。$\rho_2>\rho_1$ のとき重い流体が下にある配置では、重力 $g$ と界面張力 $\sigma$ を含む分散関係は

$$
\omega=k\bar U\pm\sqrt{
\frac{(\rho_2-\rho_1)gk+\sigma k^3}{\rho_1+\rho_2}
-\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}(U_1-U_2)^2k^2
},
\qquad
\bar U=\frac{\rho_1U_1+\rho_2U_2}{\rho_1+\rho_2}.
$$

です。根号の中が負ならば $\omega=k\bar U\pm i\gamma$ と書け、成長する分枝は

$$
\gamma^2=
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}(U_1-U_2)^2k^2
-\frac{(\rho_2-\rho_1)gk+\sigma k^3}{\rho_1+\rho_2}.
$$

に従います。$g=\sigma=0$ の vortex sheet 極限では

$$
\gamma=k\frac{\sqrt{\rho_1\rho_2}}{\rho_1+\rho_2}|U_1-U_2|,
$$

となり、$U_1\ne U_2$ ならすべての $k>0$ が不安定で、成長する振幅は

$$
\eta\propto e^{\gamma t}.
$$

と変化します。$k$ とともに $\gamma$ が無限に大きくなるのは、無限に薄い非粘性 vortex sheet の病的な性質です。現実のせん断層には有限の厚さがあり、粘性、界面張力、圧縮性などが十分に小さなスケールを正則化します。

## エネルギー源と vortex sheet の見方

波がエネルギーを作るのではありません。エネルギー源は、平均速度勾配に蓄えられた運動エネルギーです。不安定性が発達すると層をまたいで運動量が交換され、速度差は小さくなる方向に向かいます。エネルギーは平均せん断から波と渦の運動へ、現実の流体ではさらに小さなスケールと熱へ渡されます。

理想化した不連続な速度分布

$$
U(y)=
\begin{cases}
U_1,&y>0,\\
U_2,&y<0,
\end{cases}
$$

では、流れに垂直な渦度が界面に集中します。

$$
\omega_z=-\frac{dU}{dy}=-(U_1-U_2)\delta(y).
$$

したがって界面自体が vortex sheet です。完全に直線な sheet は対称性によってそのまま保たれますが、一度曲がると、各部分が誘導する速度が他の部分を非対称に動かします。この自己誘導が曲がりを強め、やがて特徴的な猫の目状の巻き上がりを作ります。

## 安定化と有限厚さのせん断層

安定な密度成層は $gk$ に比例する長波長の復元項を、界面張力は $\sigma k^3$ に比例する短波長の復元項を与えます。可視化は $g=0$ としているため、不安定な区間と最も速く成長する波数は

$$
k_c=\frac{\rho_1\rho_2(U_1-U_2)^2}{\sigma(\rho_1+\rho_2)},
\qquad
0<k<k_c,
\qquad
k_{\mathrm{max}}=\frac{2}{3}k_c,
$$

です。これは $\sigma>0$ かつ $U_1\ne U_2$ の場合です。選択したモードが $k>k_c$ なら、このモデルで指数成長は起こらず、毛管波として振動します。

現実の速度分布は連続です。典型的なモデルは

$$
U(y)=U_0\tanh(y/L).
$$

です。位相速度 $c=\omega/k$ の二次元非粘性摂動では、振幅 $\phi(y)$ が Rayleigh 方程式

$$
(U-c)(\phi''-k^2\phi)-U''\phi=0.
$$

に従います。Rayleigh の変曲点定理によれば、不安定であるための必要条件は、流れのどこかで

$$
U''(y)=0
$$

となることです。これは十分条件ではありません。双曲線正接層は中心にこの変曲点を持ち、有限帯域の波長に対して不安定です。

## 規約と限界

可視化は無次元変数、$\rho_2=1$、対称な遠方速度 $U_1=+\Delta U/2$, $U_2=-\Delta U/2$、固定表示幅 $L_x=8$ を用います。重力と粘性は省いています。

線形成長率とカットオフは、上の鋭い界面モデルに対して厳密です。色の場は符号付きの passive scalar で、semi-Lagrangian 法によって数値的に輸送しているため、いくらかの数値拡散が入ります。線形増幅と直感的な有限振幅像を結ぶため、アプリは $e^{\gamma t}$ を有界で発散のない Kelvin–Stuart の猫の目流れに写します。これは模式的な構成であり、二流体 Euler 方程式の厳密な非線形初期値解ではありません。また、安定な選択は毛管波運動を別にモデル化せず、初期摂動のまま停止させます。

## 参考文献

- NASA Photojournal, [*Rough Around the Edges* (PIA06502)](https://science.nasa.gov/photojournal/rough-around-the-edges/)。観測条件と画像クレジットは原文を参照。NASA の [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) も参照。
- Paul Danese, [*Kelvin Helmholtz cloud formation during Hartford sunset*](https://commons.wikimedia.org/wiki/File:Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg), Wikimedia Commons, 2022 年 6 月 27 日, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- Lord Rayleigh, [*On the Stability, or Instability, of Certain Fluid Motions*](https://doi.org/10.1112/plms/s1-11.1.57), *Proceedings of the London Mathematical Society* **s1-11** (1879), 57–72.
- J. T. Stuart, [*On Finite Amplitude Oscillations in Laminar Mixing Layers*](https://doi.org/10.1017/S0022112067000941), *Journal of Fluid Mechanics* **29** (1967), 417–440.
- S. Chandrasekhar, *Hydrodynamic and Hydromagnetic Stability*, Dover (1981), Chapter XI.
