# Chern 絶縁体とバルク・エッジ対応

<div class="center-material-tables"></div>

絶縁体では、Fermi 準位がバンドギャップの中にあれば、低エネルギーのバルク励起は存在しません。それでも、すべての絶縁体が同じとは限りません。

整数量子 Hall 効果や Chern 絶縁体では、占有バンドそのものに整数で特徴づけられる大域的な構造があります。その整数が **Chern 数**です。Chern 数が異なる二つの絶縁体は、バンドギャップを保ったまま連続的に移り変わることができません。そして、異なる Chern 数を持つ領域を接触させると、その境界にはギャップを横切る状態が現れます。

重要なのは、この整数が個々のエネルギー固有値から直接読めるわけではないことです。運動量空間を一周したとき、占有状態の「向き」が全体としてどのようにつながっているかを見る必要があります。

この記事では、2 バンド Chern 絶縁体を例に

1. Brillouin zone が Bloch 球へどのように写されるか
2. その写像から Chern 数という整数がどのように現れるか
3. Chern 数が変化するとき、なぜバルクギャップが閉じなければならないか
4. バルクのトポロジーが境界状態とどのようにつながるか

を順に見ていきます。

最後の点については、まず 1 次元の SSH 模型を用いて、winding と端状態の対応を直接観察します。SSH 模型は 2 次元 Chern 絶縁体の端 Hamiltonian そのものではありませんが、「バルクの大域的な性質が境界に現れる」というバルク・エッジ対応の仕組みを最も単純な形で見ることができます。

## 2 バンド Hamiltonian を球面上の点として見る

まず、各結晶運動量 $\mathbf k$ における Bloch Hamiltonian を考えます。内部自由度が二つだけなら、$H(\mathbf k)$ は $2\times2$ の Hermitian 行列です。

任意の $2\times2$ Hermitian 行列は、単位行列と三つの Pauli 行列を使って

$$
H(\mathbf k)
=
d_0(\mathbf k)\,\mathbf 1
+
d_x(\mathbf k)\sigma_x
+
d_y(\mathbf k)\sigma_y
+
d_z(\mathbf k)\sigma_z
$$

と展開できます。

ここで $d_0,d_x,d_y,d_z$ はすべて実関数です。単位行列に比例する $d_0(\mathbf k)$ の項は、二つの固有値を同じだけずらすだけで、固有状態の向きやバンド間のギャップには影響しません。

Chern 数を決めるのは固有状態の構造なので、以下ではこの共通のエネルギーシフトを取り除き、

$$
H(\mathbf k)
=
\sum_{a=x,y,z}
d_a(\mathbf k)\sigma_a
$$

と書きます。

この形にすると、二本のエネルギーバンドは

$$
E_\pm(\mathbf k)
=
\pm|\mathbf d(\mathbf k)|
$$

となります。

つまり、各 $\mathbf k$ における 2 バンド Hamiltonian は、三次元空間内の一つのベクトル

$$
\mathbf d(\mathbf k)
=
\bigl(
d_x(\mathbf k),
d_y(\mathbf k),
d_z(\mathbf k)
\bigr)
$$

によって特徴づけられます。

$|\mathbf d(\mathbf k)|$ は二本のバンドのエネルギー差を決め、その**向き**は固有状態を決めます。したがって、バンドのトポロジーを考えるときに本質的なのはベクトルの長さではなく、

$$
\hat{\mathbf d}(\mathbf k)
=
\frac{\mathbf d(\mathbf k)}
{|\mathbf d(\mathbf k)|}
$$

という単位ベクトルです。

$|\mathbf d(\mathbf k)|\neq0$ である限り二本のバンドは接触せず、下側のバンドへの射影演算子は

$$
P_-(\mathbf k)
=
\frac{
1-\sum_{a=x,y,z}\hat d_a(\mathbf k)\sigma_a
}{2}
$$

と書けます。

単位ベクトル $\hat{\mathbf d}$ は球面 $S^2$ 上の一点を指定します。したがって、各結晶運動量 $\mathbf k$ に対して、占有状態を Bloch 球上の一点として対応づけることができます。

一方、2 次元結晶では $k_x$ と $k_y$ はどちらも周期的です。Brillouin zone は正方形として描かれることが多いものの、向かい合う辺は同じ点を表します。そのため、その位相構造は torus

$$
T^2
$$

です。

こうして、ギャップを持つ 2 バンド系は自然に

$$
\hat{\mathbf d}:T^2\longrightarrow S^2
$$

という写像を定めます。

Brillouin zone 全体で $\mathbf k$ を動かすと、$\hat{\mathbf d}(\mathbf k)$ は Bloch 球上に一つの像を描きます。その像が球面の一部を行き来するだけなら、写像全体を連続的に縮めて単純な形に変形できます。一方、球面全体を向きをそろえて一度、あるいは複数回覆っている場合、その巻き付きは小さな変形では取り除けません。

この違いを位相不変な整数として数えるのが Chern 数です。

ここで注意したいのは、トポロジーを担うのが固有ベクトル $|u_-(\mathbf k)\rangle$ そのものではないことです。量子状態は

$$
|u_-(\mathbf k)\rangle
\rightarrow
e^{i\chi(\mathbf k)}
|u_-(\mathbf k)\rangle
$$

という位相変換によって物理的には変わりません。したがって、本当に意味を持つのは位相を除いた状態、すなわち ray です。これは射影演算子

$$
P_-(\mathbf k)
=
|u_-(\mathbf k)\rangle
\langle u_-(\mathbf k)|
$$

によって位相に依存せず表せます。

2 バンド系では、この射影演算子が $\hat{\mathbf d}(\mathbf k)$ と一対一に対応するため、Bloch 球への写像を見ることは、占有状態の ray が Brillouin zone 全体でどのようにつながっているかを見ることと同じです。

Chern 数がゼロでないとき、この ray の族には大域的なねじれがあります。任意の $\mathbf k$ の近くでは固有ベクトルを滑らかに選べますが、その選び方を Brillouin torus 全体へ広げて、同時に滑らかかつ周期的にすることはできません。

言い換えると、問題があるのは固有状態そのものが不連続だからではありません。物理的な状態を表す射影演算子 $P_-(\mathbf k)$ は Brillouin zone 全体で滑らかです。それにもかかわらず、それを一つの滑らかで周期的な固有ベクトル $|u_-(\mathbf k)\rangle$ によって大域的に表そうとすると、どこかで位相の継ぎ目を入れなければならないのです。

この「大域的には一つの位相規約で覆えない」という性質が、Berry 曲率を Brillouin zone 全体で積分したときに非零の Chern 数として現れます。

## Berry 曲率は Bloch 球上の面積を測る

局所的に占有バンドの固有状態 $|u_-(\mathbf k)\rangle$ を選び、Berry 接続を

$$
\mathcal A_i(\mathbf k)
=
-i
\langle
u_-(\mathbf k)
|
\partial_{k_i}
u_-(\mathbf k)
\rangle
$$

と定義します。

Berry 曲率は

$$
\Omega_-(\mathbf k)
=
\partial_{k_x}\mathcal A_y
-
\partial_{k_y}\mathcal A_x
$$

です。

固有状態に運動量依存の位相

$$
|u_-(\mathbf k)\rangle
\rightarrow
e^{i\chi(\mathbf k)}
|u_-(\mathbf k)\rangle
$$

を掛けると Berry 接続は変化しますが、Berry 曲率は変化しません。したがって、$\Omega_-$ は固有ベクトルの位相選択に依存しない量です。

2 バンド Hamiltonian では、Berry 曲率を固有ベクトルを使わずに直接

$$
\Omega_-(\mathbf k)
=
-\frac12
\hat{\mathbf d}\cdot
\left(
\partial_{k_x}\hat{\mathbf d}
\times
\partial_{k_y}\hat{\mathbf d}
\right)
$$

と書けます。

この式には明快な幾何学的意味があります。

$$
\hat{\mathbf d}\cdot
\left(
\partial_{k_x}\hat{\mathbf d}
\times
\partial_{k_y}\hat{\mathbf d}
\right)
$$

は、Brillouin zone 上の小さな面積要素が Bloch 球上でどれだけの**向き付き面積**へ写されるかを測っています。

したがって、Berry 曲率を Brillouin zone 全体で積分すると

$$
C
=
\frac{1}{2\pi}
\int_{\mathrm{BZ}}
\Omega_-(\mathbf k)\,d^2k
$$

すなわち

$$
C
=
-\frac{1}{4\pi}
\int_{\mathrm{BZ}}
\hat{\mathbf d}\cdot
\left(
\partial_{k_x}\hat{\mathbf d}
\times
\partial_{k_y}\hat{\mathbf d}
\right)
d^2k
\in\mathbb Z
$$

を得ます。

これが第一 Chern 数です。

Bloch 球を一方向に一度覆えば $|C|=1$、逆向きに覆えば符号が反転します。ある領域を進んだあと逆向きに引き返す部分は、向き付き面積として互いに打ち消し合います。

Chern 数が整数になることは偶然ではありません。これは $T^2\to S^2$ という写像の次数を数えているからです。

## Chern 数が Hall 伝導度になる

ここまで、Chern 数を Brillouin torus から Bloch 球への写像を特徴づける整数として見てきました。しかし、この整数が重要なのは数学的に面白いからだけではありません。

Chern 数は、そのまま物質の横方向の電気伝導度に現れます。

2 次元結晶に弱い一様電場 $\mathbf E$ を加えたとき、電子の結晶運動量は

$$
\hbar\dot{\mathbf k}
=
-e\mathbf E
$$

に従って変化します。ここで電子の電荷を $-e$ としています。

通常のバンド分散だけを考えれば、波束の速度は

$$
\mathbf v_{\mathrm{g}}
=
\frac{1}{\hbar}
\nabla_{\mathbf k}E_-(\mathbf k)
$$

という群速度です。

ところが、Bloch 固有状態そのものが $\mathbf k$ とともに変化するバンドでは、これに Berry 曲率に由来する速度が加わります。この記事の Berry 曲率の符号規約では、

$$
\dot{\mathbf r}
=
\frac{1}{\hbar}
\nabla_{\mathbf k}E_-(\mathbf k)
+
\frac{e}{\hbar}
\mathbf Ω_-(\mathbf k)\times\mathbf E
$$

となります。[^berry-curvature-real-space]

[^berry-curvature-real-space]:
    ### Berry 曲率はなぜ実空間の速度に現れるのか

    Berry 曲率は運動量空間の量ですが、その効果は実空間の波束運動に現れます。

    Bloch 電子を一つの $\mathbf k$ の固有状態ではなく、その近くの状態を重ね合わせた波束として考えます。実空間で波束がどこに集中するかは、異なる $\mathbf k$ 成分どうしの相対位相によって決まります。

    Bloch 状態は

    $$
    |\psi_{\mathbf k}\rangle
    =
    e^{i\mathbf k\cdot\mathbf r}
    |u_{\mathbf k}\rangle
    $$

    と書けるので、この相対位相には平面波部分だけでなく、内部状態 $|u_{\mathbf k}\rangle$ が $\mathbf k$ とともにどう変化するかも寄与します。この幾何学的な寄与を表すのが Berry 接続です。

    電場によって

    $$
    \hbar\dot{\mathbf k}=-e\mathbf E
    $$

    と波束の中心が運動量空間を移動すると、$|u_{\mathbf k}\rangle$ の変化を通じて、波束を構成する $\mathbf k$ 成分どうしの相対位相も変化します。

    この効果を波束中心の運動方程式に取り入れると、Berry 接続に由来する項はその curl、すなわち Berry 曲率として現れ、

    $$
    \dot{\mathbf r}_{\mathrm{anom}}
    =
    \frac{e}{\hbar}
    \mathbf Ω_-(\mathbf k)\times\mathbf E
    $$

    という横方向の速度を生みます。

    このため Berry 曲率は、しばしば「運動量空間の磁場」にたとえられます。これは実空間の Lorentz 力そのものではなく、**Bloch 状態の内部構造が運動量空間で変化することに由来する、波束中心の幾何学的な横ずれ**です。


$$
\mathbf Ω_-
=
\Omega_-(\mathbf k)\,\hat{\mathbf z}
$$

です。たとえば $x$ 方向に電場

$$
\mathbf E=E_x\hat{\mathbf x}
$$

を加えると、Berry 曲率による速度は

$$
v_y^{\mathrm{anom}}
=
\frac{eE_x}{\hbar}
\Omega_-(\mathbf k)
$$

となります。

つまり、一つ一つの Bloch 状態は、電場と平行な運動だけでなく、Berry 曲率に比例した**横方向の異常速度**を持ちます。

### 占有バンド全体を足し合わせる

一つの状態だけを見れば、異常速度は $\mathbf k$ によって異なります。しかし絶縁体では、Fermi 準位より下にあるバンドが Brillouin zone 全体にわたって完全に占有されています。

単位面積あたりの電流密度は、占有されたすべての $\mathbf k$ 状態の速度を足し合わせて

$$
\mathbf j
=
-e
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\,
\dot{\mathbf r}(\mathbf k)
$$

と書けます。

まず群速度の寄与を考えると、

$$
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\nabla_{\mathbf k}E_-(\mathbf k)
=
0
$$

です。

これは $E_-(\mathbf k)$ が Brillouin zone 上で周期的だからです。完全に埋まったバンドでは、ある $\mathbf k$ における群速度の寄与が別の場所の寄与と打ち消し合い、バンド全体として通常の電流は流れません。

残るのが Berry 曲率による横方向の速度です。

$x$ 方向に電場を加えたとき、

$$
j_y
=
-e
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\,
\frac{eE_x}{\hbar}
\Omega_-(\mathbf k)
$$

なので、

$$
\frac{j_y}{E_x}
=
-\frac{e^2}{\hbar}
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\Omega_-(\mathbf k).
$$

ここで Chern 数の定義

$$
C
=
\frac{1}{2\pi}
\int_{\mathrm{BZ}}
\Omega_-(\mathbf k)\,d^2k
$$

を使うと、

$$
\frac{j_y}{E_x}
=
-C\frac{e^2}{h}
$$

を得ます。

Brillouin zone 上で場所ごとに異なる Berry 曲率をすべて足し合わせた結果が、ちょうど整数 $C$ だけを残すわけです。

### なぜ伝導度が整数に量子化されるのか

伝導度テンソルを

$$
j_i
=
\sum_j\sigma_{ij}E_j
$$

と書き、Hall 伝導度を

$$
j_x=\sigma_{xy}E_y
$$

によって定義すると、反対称性

$$
\sigma_{yx}=-\sigma_{xy}
$$

から

$$
\sigma_{xy}
=
C\frac{e^2}{h}
$$

となります。

ここで重要なのは、$\sigma_{xy}$ が Hamiltonian の細かなパラメーターに連続的に依存する量ではなく、

$$
C\in\mathbb Z
$$

というトポロジカル不変量だけで決まることです。

たとえば Hamiltonian のホッピング強度や質量パラメーターを少し変えれば、各 $\mathbf k$ における Berry 曲率

$$
\Omega_-(\mathbf k)
$$

の分布そのものは変化します。ある領域で大きくなり、別の領域で小さくなることもあります。

それでもバルクギャップが閉じない限り、

$$
\int_{\mathrm{BZ}}\Omega_-\,d^2k
=
2\pi C
$$

は変わりません。

したがって Hall 伝導度も

$$
\sigma_{xy}
=
C\frac{e^2}{h}
$$

のままです。

これは量子 Hall 効果の量子化が、局所的な Berry 曲率の値ではなく、**Brillouin zone 全体にわたる占有状態の大域的な構造**によって固定されていることを意味します。

通常の物性量では、Hamiltonian のパラメーターを少し変えれば応答も少し変わります。しかし Chern 絶縁体の Hall 伝導度はそうではありません。ギャップが開いている同じトポロジカル相の中では、Hamiltonian を連続的に変形しても量子化された値は変化しません。

そして

$$
C
$$

を別の整数へ変えるためには、どこかの結晶運動量でバンドギャップを閉じなければなりません。

このことが、次に見る**トポロジカル相転移ではなぜギャップ閉鎖が避けられないのか**という問題に直接つながります。

## 具体例：Qi–Wu–Zhang 型 Chern 絶縁体

以下の 2 次元パネルでは

$$
H(\mathbf k)
=
A\sin k_x\,\sigma_x
-\lambda\sin k_y\,\sigma_y
+
(m+\cos k_x+\cos k_y)\sigma_z
$$

という Qi–Wu–Zhang 型の格子 Hamiltonian を用います。

運動量と格子定数は無次元とし、cosine 項の係数をエネルギーの単位に取ります。$d_y$ に付けた負号は、以下で用いる Chern 数の向きを指定しています。

この模型では

$$
\mathbf d(\mathbf k)
=
\left(
A\sin k_x,\,
-\lambda\sin k_y,\,
m+\cos k_x+\cos k_y
\right).
$$

パラメーター $m$ を変えると、$d_z$ 成分が全体として上下にずれ、Brillouin torus の像の Bloch 球の覆い方が変わります。

ギャップ閉鎖点を除けば、占有バンドの Chern 数は

$$
C=
\begin{cases}
0,
& m<-2,
\\[4pt]
\operatorname{sgn}(A\lambda),
& -2<m<0,
\\[4pt]
-\operatorname{sgn}(A\lambda),
& 0<m<2,
\\[4pt]
0,
& m>2.
\end{cases}
$$

です。

たとえば $A\lambda>0$ なら

$$
0
\;\longrightarrow\;
+1
\;\longrightarrow\;
-1
\;\longrightarrow\;
0
$$

と相が変化します。

### Visualization: Brillouin torus から Bloch 球へ

<iframe src="app/index.html?panel=map&amp;lang=ja" title="2 バンド Chern 絶縁体の Brillouin torus から Bloch 球への写像" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1120px; min-height: 820px; border: 0; overflow: hidden;" loading="eager"></iframe>

左の正方形は Brillouin zone の通常の表示、中央のドーナツは向かい合う辺を同一視した同じ空間 $T^2$ の 3 次元表示です。正方形上でポインターを動かすと、同じ $\mathbf k$ がトーラス上のマーカーとして示され、さらに Bloch 球上のどの方向 $\hat{\mathbf d}(\mathbf k)$ に対応するかを見ることができます。トーラスと Bloch 球はドラッグして回転できます。

まず

$$
m=-2.5,\quad -1,\quad +1,\quad +2.5
$$

を比較してみてください。

$m=-1$ や $m=+1$ では像が Bloch 球全体を覆い、向き付き被覆数はゼロではありません。一方、$m=\pm2.5$ では写像を一点へ連続的に縮めることができ、$C=0$ です。

Brillouin zone と球面上で用いている色は、同じ $\hat{\mathbf d}$ を対応づけるためのものです。Berry 曲率そのものを色で表しているわけではありません。

次に $\lambda$ の符号を反転してみます。

エネルギーは

$$
E_\pm=\pm|\mathbf d|
$$

だけで決まるため、$\lambda\to-\lambda$ としてもスペクトルは変わりません。しかし、Bloch 球を掃く向きは反転します。その結果

$$
C\rightarrow-C
$$

となります。

同じエネルギースペクトルを持つ二つの Hamiltonian が、異なるトポロジーを持ちうることがここから分かります。

## Chern 数が変わる瞬間

Chern 数は整数です。

したがって、Hamiltonian を少しずつ変えたとき

$$
C=1.0,\;0.9,\;0.8,\ldots
$$

と連続的に変化することはありません。

$|\mathbf d(\mathbf k)|$ がすべての $\mathbf k$ でゼロでない限り、

$$
\hat{\mathbf d}
=
\frac{\mathbf d}{|\mathbf d|}
$$

は常に定義され、写像 $T^2\to S^2$ は連続的に変形されるだけです。その間、写像の次数である Chern 数は変わりません。

したがって、異なる Chern 相の間を移るには、どこかで

$$
\mathbf d(\mathbf k)=0
$$

となる必要があります。

これは二本のバンドが接触することと同値です。バルクギャップ

$$
\Delta
=
2\min_{\mathbf k}
|\mathbf d(\mathbf k)|
$$

は相転移点で

$$
\Delta=0
$$

になります。

この模型では $d_x=d_y=0$ となる高対称点

$$
\Gamma=(0,0),\qquad
X=(\pi,0),\qquad
Y=(0,\pi),\qquad
M=(\pi,\pi)
$$

でギャップ閉鎖が起こります。

それぞれの点での $d_z$ は

$$
d_z(\Gamma)=m+2,
$$

$$
d_z(X)=d_z(Y)=m,
$$

$$
d_z(M)=m-2
$$

です。

したがって、

- $m=-2$ では $\Gamma$
- $m=0$ では $X$ と $Y$
- $m=2$ では $M$

でバンドが接触します。

特に $m=0$ では二点が同時に閉じることが重要です。$A\lambda>0$ のとき

$$
C:+1\longrightarrow-1
$$

と変化するので、Chern 数の跳びは $-2$ です。

### Dirac cone から Chern 数の変化を見る

ギャップ閉鎖点の近くでは、複雑だった格子 Hamiltonian は非常に単純になります。閉鎖点を $\mathbf K_i$ とし、

$$
\mathbf k=\mathbf K_i+\mathbf q
$$

とおいて小さな $\mathbf q$ について展開すると、

$$
H_i(\mathbf q)
\simeq
v_{x,i}q_x\sigma_x
+
v_{y,i}q_y\sigma_y
+
M_i\sigma_z
$$

という 2 次元の massive Dirac Hamiltonian が得られます。

ここで $M_i$ は Dirac 質量です。$\mathbf q=0$ でのエネルギーは

$$
E_\pm(0)=\pm|M_i|
$$

なので、局所的なバンドギャップは

$$
2|M_i|
$$

です。

したがって、相転移点では

$$
M_i=0
$$

となって Dirac cone が質量を失い、バンドが接触します。そして相転移点を通過すると $M_i$ の符号が反転します。

たとえば

$$
M_i>0
\quad\longrightarrow\quad
M_i<0
$$

という変化です。

重要なのは、単にギャップがいったんゼロになることだけではありません。Dirac 質量の符号反転に伴って、その閉鎖点の近くに集中している Berry 曲率の向きも反転します。

#### 一つの massive Dirac cone は何を寄与するか

Dirac Hamiltonian

$$
H(\mathbf q)
=
v_xq_x\sigma_x
+
v_yq_y\sigma_y
+
M\sigma_z
$$

について、下側バンドの Berry 曲率は

$$
\Omega_-(\mathbf q)
=
-\frac12
\frac{
M v_xv_y
}{
\left(
v_x^2q_x^2+v_y^2q_y^2+M^2
\right)^{3/2}
}
$$

となります。

Berry 曲率は $\mathbf q=0$、つまり Dirac point の近くに集中しており、その符号は

$$
Mv_xv_y
$$

によって決まります。

この連続体模型を $\mathbf q$ 平面全体で積分すると、

$$
\frac{1}{2\pi}
\int_{\mathbb R^2}
\Omega_-(\mathbf q)\,d^2q
=
-\frac12
\operatorname{sgn}(v_xv_yM)
$$

を得ます。

ここに $1/2$ が現れます。

ただし、この $\pm1/2$ を「一つの Dirac cone が半整数の Chern 数を持つ」とそのまま解釈するのは適切ではありません。連続体の Dirac 模型は運動量平面の無限遠までしか記述しておらず、Brillouin zone 全体を持つ格子模型ではないからです。

むしろ重要なのは、**質量の符号が反転すると、この寄与が整数だけ変化する**ことです。

たとえば $v_xv_y>0$ なら

$$
M>0:
\qquad
-\frac12,
$$

$$
M<0:
\qquad
+\frac12
$$

となるため、質量反転による変化は

$$
\Delta C=+1
$$

です。

逆に $v_xv_y<0$ なら変化の向きも反対になります。

したがって、それぞれのギャップ閉鎖点について、

1. Dirac 質量 $M_i$ がどちら向きに符号反転するか
2. $v_{x,i}v_{y,i}$ が正か負か

を調べれば、その相転移で Chern 数がどちら向きに変化するかが分かります。

#### QWZ 模型では四つの Dirac point がどう寄与するか

今回の Hamiltonian

$$
H(\mathbf k)
=
A\sin k_x\,\sigma_x
-\lambda\sin k_y\,\sigma_y
+
(m+\cos k_x+\cos k_y)\sigma_z
$$

では、ギャップを閉じうる点は

$$
\Gamma=(0,0),\qquad
X=(\pi,0),\qquad
Y=(0,\pi),\qquad
M=(\pi,\pi)
$$

の四つです。

それぞれの Dirac 質量は

$$
M_\Gamma=m+2,
\qquad
M_X=M_Y=m,
\qquad
M_M=m-2.
$$

一方、$\sigma_x,\sigma_y$ に掛かる速度の符号も各点で異なります。

$s=\operatorname{sgn}(A\lambda)$ とすると、

| 点 | $M_i$ | $\operatorname{sgn}(v_{x,i}v_{y,i})$ | Dirac cone の寄与 |
| --- | --- | --- | --- |
| $\Gamma$ | $m+2$ | $-s$ | $+\dfrac{s}{2}\operatorname{sgn}(m+2)$ |
| $X$ | $m$ | $+s$ | $-\dfrac{s}{2}\operatorname{sgn}(m)$ |
| $Y$ | $m$ | $+s$ | $-\dfrac{s}{2}\operatorname{sgn}(m)$ |
| $M$ | $m-2$ | $-s$ | $+\dfrac{s}{2}\operatorname{sgn}(m-2)$ |

四つを足し合わせると、

$$
C
=
\frac{s}{2}
\left[
\operatorname{sgn}(m+2)
-
2\operatorname{sgn}(m)
+
\operatorname{sgn}(m-2)
\right],
\qquad
m\neq-2,0,2
$$

となります。

この式の各項には明確な意味があります。

$$
\operatorname{sgn}(m+2)
$$

は $\Gamma$ 点、

$$
-2\operatorname{sgn}(m)
$$

は $X$ と $Y$ の二点、

$$
\operatorname{sgn}(m-2)
$$

は $M$ 点から来ています。

特に $m=0$ では、$X$ と $Y$ の **二つの Dirac 質量が同時に符号反転**します。そのため Chern 数は一度に 2 だけ変化します。

$A\lambda>0$、すなわち $s=1$ の場合には、

$$
m< -2:
\qquad C=0,
$$

$$
-2<m<0:
\qquad C=+1,
$$

$$
0<m<2:
\qquad C=-1,
$$

$$
m>2:
\qquad C=0.
$$

したがって $m$ を増やしていくと、

$$
0
\overset{\Gamma}{\longrightarrow}
+1
\overset{X,Y}{\longrightarrow}
-1
\overset{M}{\longrightarrow}
0
$$

と変化します。

$m=-2$ と $m=2$ では一つの Dirac cone だけが質量反転するため $C$ は 1 だけ変化し、$m=0$ では二つが同時に反転するため $C$ は 2 だけ変化します。

この見方をすると、Chern 数の相図は単なる公式ではなく、**Brillouin zone 内の各 Dirac point で起こる質量反転を足し合わせたもの**として理解できます。

### Visualization: ギャップ閉鎖と Chern 相

<iframe src="app/index.html?panel=transition&amp;lang=ja" title="QWZ バンドのギャップ閉鎖と占有バンド Chern 数の転移" data-auto-height scrolling="no" style="display: block; width: 100%; height: 880px; min-height: 700px; border: 0; overflow: hidden;" loading="eager"></iframe>

$m$ を $-2$, $0$, $2$ の前後で動かしてみてください。

エネルギー固有値そのものは $m$ とともに連続的に変化します。しかし Chern 数は、ギャップの開いている各区間では一定です。そしてバンドが接触した瞬間だけ、別の整数へ飛び移ります。

$m=0$ では $X$ と $Y$ の二点で同時に接触が起こります。上下のエネルギー曲面は Brillouin zone 全体を表示しているので、ドラッグして視点を変えながら二つの接触を確認できます。$m=-2$ では $\Gamma$、$m=2$ では $M$ に現れる一つの接触と比較してください。

## バルクの整数が境界に現れる

ここまでの議論は、周期境界条件を課した無限結晶のバルクだけを見ていました。

では、Chern 数がゼロでない結晶を途中で切ると何が起こるのでしょうか。

たとえば Chern 数 $C$ の絶縁体と、$C=0$ の真空との境界を考えます。バルクの内部ではどちら側もギャップを持っています。しかし、二つの領域の Chern 数は異なります。

もし境界を含む系全体がどこでもギャップを保ったまま滑らかにつながっているなら、Chern 数は途中で変化できないはずです。

したがって境界付近では、どこかでギャップが埋められなければなりません。

2 次元 Chern 絶縁体では、その役割を担うのが **chiral edge state** です。境界に沿う運動量を $k_\parallel$ とすると、端状態の分散はバルクの価電子帯と伝導帯の間をつなぎ、バルクギャップを横切ります。

二つの領域の Chern 数の差を

$$
\Delta C=C_{\mathrm{left}}-C_{\mathrm{right}}
$$

とすると、境界に現れる edge mode の正味の chirality はこの差によって固定されます。特に真空との境界では、$|C|$ 本に相当する正味の chiral edge branch が必要になります。

これが 2 次元 Chern 絶縁体におけるバルク・エッジ対応です。

この edge mode は単なる表面の細かな性質ではありません。局所的な境界ポテンシャルを多少変えても、バルクギャップを閉じたり反対向きのモードと消滅させたりしない限り、正味の chirality を取り除くことはできません。

次に、この考え方をより直接見られる 1 次元模型へ移ります。

## 1 次元で見るバルク・エッジ対応：SSH 模型

Su–Schrieffer–Heeger 模型では、各単位胞に二つのサイト $A,B$ があり、単位胞内ホッピング $t_1$ と単位胞間ホッピング $t_2$ が交互に並びます。

基底 $(A,B)$ では

$$
H_{\mathrm{SSH}}(k)
=
\begin{pmatrix}
0&t_1+t_2e^{-ik}
\\
t_1+t_2e^{ik}&0
\end{pmatrix}
$$

すなわち

$$
H_{\mathrm{SSH}}(k)
=
d_x(k)\sigma_x+d_y(k)\sigma_y
$$

と書けます。ここで

$$
d_x=t_1+t_2\cos k,
\qquad
d_y=t_2\sin k.
$$

$\sigma_z$ 成分が存在しないため

$$
\{
\sigma_z,
H_{\mathrm{SSH}}(k)
\}
=0
$$

という chiral 対称性を持ちます。

したがってエネルギー固有値は

$$
E_\pm(k)=\pm|q(k)|
$$

という対称な形になります。ここで、

$$
q(k)
=
d_x+i d_y
=
t_1+t_2e^{ik}
$$

です。

$k$ を Brillouin zone 全体にわたって動かすと、複素平面上の $q(k)$ は閉曲線を描きます。

この曲線が原点のまわりを何回回るかを

$$
\nu
=
\frac{1}{2\pi i}
\int_{-\pi}^{\pi}
q^{-1}(k)\,
\partial_k q(k)\,dk
$$

すなわち

$$
\nu
=
\frac{1}{2\pi}
\int_{-\pi}^{\pi}
\partial_k\arg q(k)\,dk
$$

で定義します。

これが winding number です。

実数で正の $t_1,t_2$ を考えると、$q(k)$ は複素平面上で

- 中心 $(t_1,0)$
- 半径 $t_2$

の円を描きます。

したがって

$$
t_1<t_2
$$

なら円は原点を囲み

$$
\nu=1,
$$

一方

$$
t_1>t_2
$$

なら原点を囲まず

$$
\nu=0
$$

です。

二つの相の境界

$$
t_1=t_2
$$

では円が原点を通ります。このとき $q(\pi)=0$ となり、

$$
\Delta_{\mathrm{SSH}}
=
2|t_1-t_2|
$$

というバンドギャップが閉じます。

ここにも、**整数の winding を変えるには、閉曲線が原点を通らなければならない。**という、先ほどの Chern 絶縁体とまったく同じ論理があります。

Hamiltonian の言葉では、それがバンドギャップの閉鎖に対応しています。

この winding は、占有バンドの Berry 位相とも結びついています。1 次元では、Brillouin zone を一周する閉路に沿って Berry 接続を積分し、

$$
\gamma
=
\int_{-\pi}^{\pi}
\mathcal A(k)\,dk
\pmod{2\pi}
$$

という Berry 位相を定義できます。

SSH 模型では chiral 対称性によって、この位相は

$$
\gamma
=
\pi\nu
\pmod{2\pi}
$$

となります。

したがって、$\nu=0$ の相では $\gamma=0$、$\nu=1$ の相では $\gamma=\pi$ です。複素平面上で $q(k)$ が原点を囲むかどうかという winding の情報が、占有状態が Brillouin zone を一周したときに蓄積する幾何学的な位相にも現れています。

### Visualization: バンド分散と winding circle

<iframe src="app/index.html?panel=winding&amp;lang=ja" title="SSH バンド分散と Bloch Hamiltonian の winding" data-auto-height scrolling="no" style="display: block; width: 100%; height: 800px; min-height: 640px; border: 0; overflow: hidden;" loading="eager"></iframe>

$t_1/t_2$ を

$$
0.6,\qquad 1,\qquad 1.4
$$

などに変えてみてください。

左のバンド図では、$t_1=t_2$ のときだけ二本のバンドが接触します。

右の複素平面では、同じ出来事が winding circle と原点の接触として見えます。

二つは別の現象ではありません。

$$
E_\pm(k)=\pm|q(k)|
$$

なので、$q(k)$ が原点を通ることとエネルギーギャップが閉じることはまったく同じ条件です。

## 結晶を切ると winding は端状態になる

今度は周期境界条件を外し、$N$ 個の単位胞を持つ有限 SSH 鎖を考えます。

Hamiltonian は

$$
H_{\mathrm{open}}
=
\sum_{n=1}^{N}
t_1
|n,A\rangle
\langle n,B|
+
\sum_{n=1}^{N-1}
t_2
|n+1,A\rangle
\langle n,B|
+
\mathrm{h.c.}
$$

です。

まず極端な場合

$$
t_1=0
$$

を考えると構造がよく見えます。

鎖の内部では $t_2$ によって隣接するサイトが dimer を作ります。しかし左端の $A$ サイトと右端の $B$ サイトだけは相手を持たず、完全に孤立します。

したがって二つの厳密なゼロエネルギー状態が端に残ります。

$t_1$ をゼロから少し増やしても、$|t_1/t_2|<1$ である限り端状態は消えず、内部へ指数関数的にしみ出します。半無限鎖では

$$
\psi_L(n,A)
\propto
\left(
-\frac{t_1}{t_2}
\right)^{n-1},
$$

$$
\psi_R(n,B)
\propto
\left(
-\frac{t_1}{t_2}
\right)^{N-n}
$$

となり、局在長 $\xi$ は

$$
\xi^{-1}
=
\ln
\left|
\frac{t_2}{t_1}
\right|
$$

で与えられます。

$t_1/t_2\to1$ とすると

$$
\xi\to\infty
$$

となります。

端状態がバルクの奥まで広がり、ちょうど相転移点でバルク状態と区別できなくなるわけです。

有限鎖では、左右の端から伸びた指数関数的な tail がわずかに重なります。そのため二つの端状態は対称・反対称結合を作り、エネルギーは

$$
+\varepsilon,\qquad-\varepsilon
$$

へわずかに分裂します。

鎖が長くなるほどこの分裂は指数関数的に小さくなり、

$$
N\rightarrow\infty
$$

ではゼロへ近づきます。

### Visualization: SSH 鎖の端状態

<iframe src="app/index.html?panel=edge&amp;lang=ja" title="有限 SSH 鎖のスペクトルフローと端状態の確率分布" data-auto-height scrolling="no" style="display: block; width: 100%; height: 760px; min-height: 620px; border: 0; overflow: hidden;" loading="eager"></iframe>

まず

$$
t_1/t_2=0
$$

から始めてみてください。

中央の二準位は厳密にゼロエネルギーにあり、波動関数は両端のサイトに完全に局在しています。

そこから $t_1/t_2$ を増やすと、端状態は徐々に内部へ広がります。同時に、有限サイズによる二準位の分裂も見えるようになります。

さらに

$$
t_1/t_2\rightarrow1
$$

とすると局在長が発散し、端状態はバルクへ溶け込みます。

$$
t_1/t_2>1
$$

では、同じ終端の取り方に対して独立した端状態は存在しません。

分布図では中央二固有状態の確率密度を平均して表示しています。有限鎖では固有状態そのものが左右の端状態の対称・反対称結合になりうるため、この表示によって両端への局在を直接見ることができます。

## Chern 数と SSH winding に共通するもの

2 次元 Chern 絶縁体と 1 次元 SSH 模型では、トポロジカル不変量そのものは異なります。

Chern 絶縁体では

$$
T^2\longrightarrow S^2
$$

という写像の次数を Chern 数 $C$ が数えます。

SSH 模型では

$$
S^1\longrightarrow S^1
$$

に相当する閉曲線 $q(k)$ の winding number $\nu$ を数えます。

しかし、その背後にある論理は共通しています。

- ギャップが開いている限り、Hamiltonian は連続的に変形できる。
- その連続変形では整数のトポロジカル不変量は変化しない。
- 整数を変えるには、どこかでギャップを閉じる必要がある。
- 異なるトポロジーを持つ二つの領域を接続すると、その差が境界状態として現れる。

これがバンドトポロジーとバルク・エッジ対応の中心的な考え方です。

SSH 模型では、winding の値は単位胞の取り方と結びついています。単位胞を一サイト分ずらせば winding の表示も変化しますが、そのとき有限鎖の終端の切り方も同時に変わります。バルクの記述と境界条件を整合して比較する限り、端状態についての物理的な予言に矛盾は生じません。

一方、2 次元 Chern 絶縁体の Chern 数はこの意味での単位胞選択には依存せず、真空との境界にはバルクギャップを横切る chiral edge mode が現れます。

## 磁場中の電子と整数量子 Hall 効果

ここまでの議論では、Chern 数を持つバンドが完全に占有されると

$$
\sigma_{xy}
=
C\frac{e^2}{h}
$$

という量子化された Hall 応答が現れることを見ました。

では、実際の整数量子 Hall 効果では何が Chern band の役割を果たしているのでしょうか。

典型的な量子 Hall 実験では、半導体界面や graphene などに作られたほぼ 2 次元の電子系に、面に垂直な強い磁場を加えます。磁場中では電子は Lorentz 力によって円運動を行いますが、量子力学ではその軌道運動のエネルギーが連続ではなくなり、離散的な **Landau 準位**に量子化されます。

放物型分散を持つ電子について、spin をいったん無視すれば

$$
E_n
=
\hbar\omega_c
\left(
n+\frac12
\right),
\qquad
\omega_c=\frac{eB}{m^\ast},
\qquad
n=0,1,2,\ldots
$$

です。

各 Landau 準位には非常に多数の状態が含まれます。単位面積あたりの状態数は

$$
\frac{eB}{h}
$$

なので、電子密度を $n_e$ とすると

$$
\nu
=
\frac{n_e h}{eB}
$$

という無次元量が、Landau 準位が何本まで埋まっているかを表します。これを filling factor と呼びます。

$\nu$ 本の Landau 準位が完全に占有され、その上の準位との間に Fermi 準位があるとき、Hall 伝導度は向きの規約を除いて

$$
|\sigma_{xy}|
=
\nu\frac{e^2}{h}
$$

となります。

これは先ほど導いた Chern band の式と同じ形です。

### Landau 準位にも Chern 数がある

Landau 準位と QWZ 模型の Bloch band は、見た目にはかなり異なります。

QWZ 模型では結晶運動量 $\mathbf k$ を使って Brillouin zone を考えました。一方、一様磁場中では vector potential のため通常の並進対称性の扱いが変わり、同じ Bloch Hamiltonian をそのまま使うことはできません。

しかしトポロジカルには同じ構造があります。

一つの完全に占有された Landau 準位は、適切な形で定義された Chern 数

$$
C=\pm1
$$

を持ちます。符号は磁場の向きや Hall 伝導度の規約によって決まります。

したがって $\nu$ 本の Landau 準位が占有されていれば、それらの Chern 数が足し合わされ、

$$
|C_{\mathrm{tot}}|=\nu
$$

となります。その結果として

$$
|\sigma_{xy}|
=
\nu\frac{e^2}{h}
$$

が得られます。

つまり、整数量子 Hall 効果で観測される整数 $\nu$ は、単に「Landau 準位が何本埋まっているか」を数えているだけではありません。それぞれの占有準位が持つトポロジカル不変量の総和として理解できます。

QWZ 模型のような Chern 絶縁体は、この量子 Hall のトポロジーを、必ずしも一様な外部磁場や Landau 準位を必要とせず格子上で実現した模型だと見ることができます。

### なぜ実験では plateau が現れるのか

実際の量子 Hall 実験では、Hall 伝導度はある一点だけで量子化されるのではなく、磁場や電子密度をある程度変えても

$$
\sigma_{xy}
=
\nu\frac{e^2}{h}
$$

に張り付いた **plateau** を作ります。

ここで重要な役割を果たすのが disorder です。

完全に清浄な理想系では、Landau 準位は鋭いエネルギー準位になります。しかし実際の試料には不純物やポテンシャルの揺らぎがあり、それぞれの Landau 準位は有限の幅を持つエネルギー領域へ広がります。

この広がった Landau level のすべての状態が同じ性質を持つわけではありません。

準位の裾にある多くの状態は、不純物ポテンシャルのまわりに空間的に **局在**します。一方、Landau level の中心付近には試料全体へ広がった extended state が残ります。

Fermi 準位が局在状態の領域を動いている間、新しく占有される電子は局所的な場所に閉じ込められます。そのため、電子数は変化しても試料全体を横切る輸送には寄与せず、Hall 伝導度は同じ値に保たれます。

このため、磁場や電子密度を連続的に変えても

$$
\sigma_{xy}
=
\nu\frac{e^2}{h}
$$

が有限の範囲にわたって維持されます。

これが量子 Hall plateau の重要な起源です。

一方、Fermi 準位が Landau level の中心付近にある extended state を横切ると、バルクを通る状態が再び現れます。この領域では縦伝導度 $\sigma_{xx}$ も有限になり、Hall 伝導度は

$$
\nu\frac{e^2}{h}
\longrightarrow
(\nu+1)\frac{e^2}{h}
$$

のように次の plateau へ移ります。

したがって disorder は量子 Hall 効果のトポロジーそのものを作っているわけではありません。Chern 数と Hall 伝導度の量子化は、清浄な系でも定義できます。

しかし、実験で観測される**幅を持った非常に安定な plateau**には、disorder によるバルク状態の局在が重要です。

ある意味では、通常なら「理想的な量子化を壊しそう」に見える disorder が、むしろ量子化された plateau を広い範囲で安定化しているわけです。

### 境界では Landau 準位が edge channel になる

有限の試料では、電子を閉じ込めるポテンシャルが端に近づくにつれて大きくなります。そのため Landau 準位のエネルギーも試料の端で曲がり、Fermi energy を横切る状態が現れます。

これが量子 Hall 系の chiral edge state です。

バルクでは Fermi 準位付近の状態が局在し、縦方向の伝導が抑えられていても、端には一方向へ伝播する edge channel が残ります。

完全に占有された Landau 準位が $\nu$ 本あれば、対応して $\nu$ 本の chiral edge channel が現れます。これは

$$
C_{\mathrm{bulk}}
\longleftrightarrow
\text{edge mode の正味の本数}
$$

という、先ほど述べたバルク・エッジ対応そのものです。

したがって、実際の整数量子 Hall 効果では

$$
\text{Landau 準位}
\;\longleftrightarrow\;
\text{Chern 数}
\;\longleftrightarrow\;
\text{量子化 Hall 伝導度}
\;\longleftrightarrow\;
\text{chiral edge channel}
$$

という四つの見方が、同じ現象を異なる側面から記述しています。
