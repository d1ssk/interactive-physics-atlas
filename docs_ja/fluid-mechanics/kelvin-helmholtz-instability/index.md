# Kelvin–Helmholtz 不安定性

空や惑星大気には、ときに砕ける波のような形が規則正しく並ぶことがあります。これは、上下で異なる速さの流れが接しているとき、その境界のわずかな揺らぎが増幅され、やがて大きく巻き上がることで生じます。

この現象が Kelvin–Helmholtz 不安定性です。最初は小さな波だった界面が、せん断流の運動エネルギーを受け取って成長し、やがて billow と呼ばれる大きな波頭や渦の列へ発達します。

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

左のような波状の雲は地球大気で実際に観測され、右の土星大気にもよく似た巻き上がりが見られます。NASA は、土星の雲帯境界に並ぶこの構造を Kelvin–Helmholtz 不安定性によるものと解釈しています。

同じ不安定性は、地球大気、海洋、実験室のせん断層、巨大ガス惑星の大気など、スケールも物質も大きく異なる系に現れます。共通しているのは、隣り合う流れに速度差があることです。では、なぜ速度差があるだけで、小さな界面の揺らぎが自発的に成長していくのでしょうか。

## Visualization

<iframe src="app/index.html?lang=ja" title="Kelvin–Helmholtz 界面の巻き上がりと線形成長率スペクトル" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1000px; min-height: 700px; border: 0; overflow: hidden;" loading="eager"></iframe>

### 探索例

1. 密度を等しくしたまま速度差 $\Delta U$ を小さくします。選択したモードの成長率が低下し、やがて安定側へ移る様子を確認します。

2. 界面張力 $\sigma$ を大きくしたり、波長 $\lambda$ を短くしたりします。成長率スペクトル上の黒点をカットオフ波数 $k_c$ の両側へ動かし、不安定なモードと安定なモードで流れがどう変わるかを比べます。

3. 界面張力を $\sigma=0$ にしてから、密度比 $\rho_1/\rho_2$ を 1 の上下に変化させます。密度比をその逆数に置き換えてもせん断による成長率は変わりません。一方、対称な速度 $U_1=+\Delta U/2$, $U_2=-\Delta U/2$ では、密度加重平均速度 $\bar U$ の符号が反転します。

4. トレーサーを表示します。各点の色は、初期にどちらの流体に属していたかを表します。界面が細く引き伸ばされて入り組んでいく様子から、流体粒子の移流と混合の進行を追うことができます。

## なぜ小さな波が成長するのか

流体 1 が $y>0$、流体 2 が $y<0$ を占めるとします。それぞれの密度と遠方での一様速度を

$$
(\rho_1,U_1),\qquad (\rho_2,U_2)
$$

とし、平らな界面に小さな摂動

$$
\eta(x,t)=\eta_0 e^{i(kx-\omega t)}
$$

を加えます。

界面は、上下の流体を分ける「物質面」として動きます。つまり、流体粒子が界面を突き抜けて反対側へ移ることはなく、界面はその場所にある流体と一緒に動かなければなりません。

界面の高さを $\eta(x,t)$ とすると、ある流体粒子から見た界面の高さの変化率は

$$
(\partial_t+U_i\partial_x)\eta
$$

で表されます。ここで $U_i\partial_x$ は、背景流 $U_i$ によって界面の形が水平方向に運ばれる効果です。

一方、速度ポテンシャルの摂動を $\delta\phi_i$ とすると、鉛直方向の速度摂動は

$$
\delta v_{y,i}=\partial_y\delta\phi_i
$$

です。界面が流体と一緒に動くためには、界面の鉛直速度と流体の鉛直速度が一致しなければならないので、

$$
(\partial_t+U_i\partial_x)\eta
=
\left.\partial_y\delta\phi_i\right|_{y=0}
$$

を得ます。これが線形化した運動学的境界条件です。

したがって、界面がわずかに波打つだけでも、上下の流体にはその波に追随する鉛直速度が生じます。流れはもはや完全に水平方向ではなく、山の近くでは上向きや下向きに曲げられることになります。

この速度の変化は、同時に圧力の変化を伴います。非粘性・非圧縮流体では、線形化した非定常 Bernoulli の式から

$$
\delta p_i
=
-\rho_i(\partial_t+U_i\partial_x)\delta\phi_i
$$

となります。

ここでも $(\partial_t+U_i\partial_x)$ が現れていることが重要です。同じ形の界面摂動であっても、背景流の速度 $U_i$ が異なれば、上下の流体が感じる時間変化は異なります。そのため、界面の上下に生じる圧力応答も一般には同じにならず、その圧力差が界面を押す力として働きます。その結果、ある条件では圧力差が界面を元に戻すのではなく、山をさらに押し上げ、谷をさらに深くする向きに働きます。

つまり、

$$
\text{界面変位}
\;\longrightarrow\;
\text{速度摂動}
\;\longrightarrow\;
\text{圧力差}
\;\longrightarrow\;
\text{さらに大きな界面変位}
$$

という正のフィードバックが生じます。

この不安定性の原因は粘性ではありません。理想的な非粘性流体でも、平均流に十分な速度差があれば Kelvin–Helmholtz 不安定性は生じます。

## 分散関係と成長率

非粘性・非圧縮で、上下に無限に深い二流体を考えます。$\rho_2>\rho_1$ とし、重い流体が下側にある安定な密度配置をとります。

重力 $g$ と界面張力 $\sigma$ を含めると、分散関係は

$$
\omega
=
k\bar U
\pm
\sqrt{
\frac{(\rho_2-\rho_1)gk+\sigma k^3}{\rho_1+\rho_2}
-
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}
(U_1-U_2)^2k^2
},
$$

ただし

$$
\bar U
=
\frac{\rho_1U_1+\rho_2U_2}{\rho_1+\rho_2}
$$

です。

根号の中には、性質の異なる二つの効果が現れています。

- 重力と界面張力は界面を平らに戻そうとする復元効果
- 速度差は界面の摂動を増幅しようとする不安定化効果

根号の中が負になると、

$$
\omega=k\bar U\pm i\gamma
$$

と書けます。成長する分枝では

$$
\gamma^2
=
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}
(U_1-U_2)^2k^2
-
\frac{(\rho_2-\rho_1)gk+\sigma k^3}{\rho_1+\rho_2}.
$$

したがって振幅は

$$
\eta\propto e^{\gamma t}
$$

と指数関数的に増大します。

とくに

$$
g=\sigma=0
$$

とした vortex sheet 極限では、

$$
\gamma
=
k
\frac{\sqrt{\rho_1\rho_2}}{\rho_1+\rho_2}
|U_1-U_2|
$$

となります。

この極限では $U_1\ne U_2$ である限り、すべての $k>0$ が不安定です。しかも $\gamma\propto k$ なので、波長を短くするほど成長率が際限なく大きくなります。

これは現実の流体に本当に無限小スケールの不安定性が存在するという意味ではなく、厚さゼロの速度不連続を仮定した vortex sheet モデルの特異な性質です。現実のせん断層には有限の厚さがあり、さらに粘性、界面張力、圧縮性などの効果も加わるため、十分に短い波長ではこの理想化は成り立たなくなります。

## せん断流のエネルギーが渦へ移る

成長する波がエネルギーを作り出しているわけではありません。エネルギー源は、平均流の速度差に蓄えられた運動エネルギーです。

不安定性が発達すると、流体は上下の層をまたぐように動き、異なる流速を持つ領域の間で運動量が交換されます。その結果、平均的な速度差は小さくなる方向へ向かいます。

エネルギーの流れを模式的に書けば、

$$
\text{平均せん断流}
\;\longrightarrow\;
\text{界面波と大規模な渦}
\;\longrightarrow\;
\text{より小さなスケールの運動}
\;\longrightarrow\;
\text{熱}
$$

となります。最後の散逸までを担うのは粘性ですが、不安定性そのものは非粘性の段階ですでに存在します。

## vortex sheet はなぜ巻き上がるのか

理想化した速度分布

$$
U(y)=
\begin{cases}
U_1, & y>0,\\
U_2, & y<0
\end{cases}
$$

を考えると、速度勾配は界面だけに集中します。

二次元流れの渦度は

$$
\omega_z=-\frac{dU}{dy}
$$

なので、

$$
\omega_z
=
-(U_1-U_2)\delta(y)
$$

です。

つまり、このモデルでは界面そのものが渦度を担う薄いシート、vortex sheet になっています。

完全にまっすぐな sheet では並進対称性があるため、その形は保たれます。しかし一度わずかに曲がると、sheet 上の各部分が作る速度場が他の部分を動かし、その変形をさらに強めることがあります。

線形領域では、これが先ほど求めた指数成長として現れます。振幅が大きくなると線形近似は破れ、sheet は次第に巻き上がって、Kelvin–Helmholtz 不安定性に特徴的な猫の目状の渦構造へ発展します。

## 重力と界面張力による安定化

安定な密度成層では、重力が長波長側の復元力として働きます。一方、界面張力は曲率の大きな変形を強く嫌うため、短波長側を安定化します。

可視化では $g=0$ としているので、

$$
\gamma^2
=
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}
(U_1-U_2)^2k^2
-
\frac{\sigma}{\rho_1+\rho_2}k^3.
$$

$\sigma>0$ かつ $U_1\ne U_2$ なら、カットオフ波数は

$$
k_c
=
\frac{\rho_1\rho_2(U_1-U_2)^2}
{\sigma(\rho_1+\rho_2)}
$$

であり、不安定なのは

$$
0<k<k_c
$$

です。

また、$\gamma$ が最大になる波数は

$$
k_{\mathrm{max}}
=
\frac{2}{3}k_c
$$

です。

したがって、最も短い波長が最も速く成長するわけではありません。界面張力があると、短波長になるにつれて復元力が強まり、$k>k_c$ では指数成長は起こらず、界面は毛管波として振動します。

## 有限厚さのせん断層

現実の流れでは、速度が数学的に不連続になることはほとんどありません。典型的なモデルとして

$$
U(y)=U_0\tanh(y/L)
$$

を考えることができます。$L$ はせん断層の厚さを表します。

二次元・非粘性の微小摂動について、位相速度を

$$
c=\frac{\omega}{k}
$$

とすると、摂動の振幅 $\phi(y)$ は Rayleigh 方程式

$$
(U-c)(\phi''-k^2\phi)-U''\phi=0
$$

に従います。

Rayleigh の変曲点定理によれば、このような平行せん断流が線形不安定になるためには、流れのどこかに

$$
U''(y)=0
$$

となる変曲点が存在することが必要です。

これは必要条件であって十分条件ではありませんが、速度分布の曲率が不安定性と深く関係していることを示しています。

双曲線正接型のせん断層

$$
U(y)=U_0\tanh(y/L)
$$

は中心 $y=0$ に変曲点を持ち、有限の波数帯域で Kelvin–Helmholtz 型の不安定性を示します。vortex sheet のように任意に短い波長が際限なく速く成長することはなく、せん断層の厚さ $L$ が自然な長さスケールを与えます。

## 可視化モデル

この可視化では無次元変数を用い、

$$
\rho_2=1,\qquad
U_1=+\frac{\Delta U}{2},\qquad
U_2=-\frac{\Delta U}{2}
$$

としています。表示領域は $L_x=8$ に固定し、重力と粘性は省いています。

成長率とカットオフ波数には、厚さゼロの鋭い界面に対する線形理論を用いています。

一方、巻き上がりの表示は二流体 Euler 方程式を直接時間積分したものではありません。線形成長

$$
e^{\gamma t}
$$

から可視化上の振幅パラメータを作り、それを Kelvin–Stuart 型の猫の目流れへ接続することで、線形不安定性が大きな渦へ発展していく様子を模式的に表しています。

トレーサーは passive scalar として semi-Lagrangian 法で移流しているため、細かな構造には数値拡散が入ります。また、線形理論で安定と判定されたモードについては、毛管波の時間発展を別途解かず、初期摂動の形で表示しています。

## 参考文献

- NASA Photojournal, [*Rough Around the Edges* (PIA06502)](https://science.nasa.gov/photojournal/rough-around-the-edges/). 画像利用については NASA の [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) も参照。

- Paul Danese, [*Kelvin Helmholtz cloud formation during Hartford sunset*](https://commons.wikimedia.org/wiki/File:Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg), Wikimedia Commons, 2022 年 6 月 27 日, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

- Lord Rayleigh, [*On the Stability, or Instability, of Certain Fluid Motions*](https://doi.org/10.1112/plms/s1-11.1.57), *Proceedings of the London Mathematical Society* **s1-11** (1879), 57–72.

- J. T. Stuart, [*On Finite Amplitude Oscillations in Laminar Mixing Layers*](https://doi.org/10.1017/S0022112067000941), *Journal of Fluid Mechanics* **29** (1967), 417–440.

- S. Chandrasekhar, *Hydrodynamic and Hydromagnetic Stability*, Dover (1981), Chapter XI.
