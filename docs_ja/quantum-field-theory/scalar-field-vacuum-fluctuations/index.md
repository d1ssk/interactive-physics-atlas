# 自由スカラー場真空の量子揺らぎ

## 零点運動から場の配位へ

自由な実スカラー場は、空間 Fourier モードごとに分解すると、互いに独立な調和振動子の集まりとみなせます。$\hbar=c=1$ の単位系では、波数 $\mathbf k$ のモードの振動数は

$$
\omega_{\mathbf k}
=
\sqrt{\mathbf k^2+m^2}
$$

です。

真空には粒子としての励起はありません。しかし、調和振動子の基底状態には零点揺らぎがあります。標準的な正準規格化では

$$
\left\langle |q_{\mathbf k}|^2\right\rangle
=
\frac{1}{2\omega_{\mathbf k}},
\qquad
\left\langle |p_{\mathbf k}|^2\right\rangle
=
\frac{\omega_{\mathbf k}}{2}
$$

となります。

場の配位 $\phi(\mathbf x)$ を基底にして真空状態を見ると、この零点揺らぎは、さまざまな場の配位にまたがって広がった波動汎函数として現れます。真空は $\phi(\mathbf x)=0$ という一つの配位に集中しているのではなく、それぞれの配位に対する量子振幅

$$
\Psi_0[\phi]
$$

によって特徴づけられます。自由場ではこの真空波動汎函数は Gaussian であり、各 Fourier モードの揺らぎはその幅によって決まります。

この分布から各 Fourier モードの振幅をサンプルし、Fourier 変換すると、空間的に相関した一つの場

$$
\phi(\mathbf x)
$$

が得られます。この visualization で表示しているのは、そのような真空の確率分布から取り出した一つの realization です。Realization ごとに場の模様は異なりますが、その空間相関や振幅の統計は、真空状態の二点関数によって特徴づけられます。

## Visualization

各段の左右は、同じ realization を異なる方法で表示しています。

点群表示では、各点が格子上の場の値を表します。色は $\phi$ の符号、大きさは $|\phi|$ に対応します。

等値面表示では、

$$
\phi>u\sigma,
\qquad
\phi<-u\sigma
$$

を満たす領域の境界を、それぞれ橙色と青緑色で表示します。ここで

$$
\sigma^2=\langle\phi^2\rangle
$$

は、同じ正則化のもとで定義された真空アンサンブルの分散です。

閾値 $u$ を変えても場そのものは再サンプルされません。左右は同じ realization なので、一方を回転すると、もう一方も同じ視点へ連動します。

<iframe
  src="app/index.html?lang=ja"
  title="スカラー場真空の量子揺らぎのインタラクティブ可視化"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2450px; min-height: 1300px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## 時間方向へ伸ばした真空揺らぎ

上段では、空間2次元の自由場を時間発展させています。

$t=0$ で正準変数 $(\phi,\pi)$ を真空の Wigner 分布から一度だけサンプルし、その後は各 Fourier モードを

$$
q_{\mathbf k}(t)
=
q_{\mathbf k}(0)\cos(\omega_{\mathbf k}t)
+
\frac{p_{\mathbf k}(0)}{\omega_{\mathbf k}}
\sin(\omega_{\mathbf k}t)
$$

に従って自由発展させます。

時刻の場を独立に生成しているわけではなく、最初に選ばれた $(\phi,\pi)$ が、その後の時空全体の履歴を決めます。そのため、表示される $2+1$ 次元の場は、一つの時間的に相関した realization になっています。

自由 Gaussian 理論では、真空の Wigner 分布は正の Gaussian 分布です。また時間発展も線形なので、この確率過程の二点共分散は

$$
C(x,x')
=
\frac{1}{2}
\left\langle
\left\{
\hat\phi(x),\hat\phi(x')
\right\}
\right\rangle
$$

という対称化された二点関数になります。これはしばしば Hadamard 関数、あるいはその $1/2$ を含む規約に応じて symmetrized two-point function と呼ばれるものです。

この点は、Feynman propagator や Wightman 関数とは異なります。実確率変数の共分散は実数かつ対称でなければなりませんが、Feynman propagator は時間順序を、Wightman 関数

$$
\langle\hat\phi(x)\hat\phi(x')\rangle
$$

は演算子の順序を保持しており、一般にはこの条件を満たしません。ここで生成している古典的な確率場は、量子真空のあらゆる演算子相関を再現するものではなく、自由場の対称化された相関を実確率過程として表したものです。

## 2次元の真空と3次元の真空

下段では、空間3次元の真空 Gaussian measure から独立に等時刻配位を生成しています。

上段の空間2次元の場に1方向を追加しただけに見えますが、両者の確率分布は同じではありません。空間 $d$ 次元における自由場の正則化前の等時刻二点相関は

$$
C_d(r)
=
\int\frac{d^d k}{(2\pi)^d}
\frac{e^{i\mathbf k\cdot\mathbf r}}
{2\sqrt{\mathbf k^2+m^2}}
$$

です。

$r>0$ では、

$$
C_2(r)
=
\frac{e^{-mr}}{4\pi r},
$$

$$
C_3(r)
=
\frac{mK_1(mr)}{4\pi^2r}
$$

となります。ここで $K_1$ は第2種変形 Bessel 関数です。

したがって、3次元空間の真空配位をある平面で切り取っても、その断面は「本来の空間2次元スカラー場の真空」と同じ統計にはなりません。断面上の点だけを見ても、その相関にはもとの3次元場のモード構造が残っているからです。

可視化中の相関グラフでは、2次元と3次元についてそれぞれ48個の独立な realization を生成し、正則化された規格化相関を Monte Carlo 法で推定しています。各格子距離では、格子上の並進と空間方向について平均したうえで、さらに realization 間の平均を取っています。error bar は、そのアンサンブル平均の標準誤差を表します。

したがって、このグラフは上に表示された一つの場から計算したものではなく、同じ真空 measure から生成した多数の独立標本によるアンサンブル平均です。

## 探索例

1. seed を固定したまま $m$ を大きくし、長距離相関がより速く減衰する様子を観察します。代表的な相関長 $\xi\sim m^{-1}$ と、相関グラフの変化を比較してみてください。

2. $m$ を固定したまま UV window を Nyquist scale に近づけます。より高い波数のモードが加わり、場に細かな空間構造が現れます。

3. seed を変えずに閾値 $u$ を動かします。場の値そのものは変わりませんが、正負の excursion region がつながったり、分裂したり、消えたりします。

4. 同じパラメータのまま realization をいくつか生成します。個々の模様は大きく変わりますが、それらはすべて同じ Gaussian ensemble からの標本です。相関の Monte Carlo 推定値も、同じ期待値のまわりで統計的に揺らぎます。

## 格子と UV 正則化

数値計算では、一辺

$$
L_{\rm box}=12L
$$

の周期的空間を各方向18点に離散化し、

$$
a=\frac{L_{\rm box}}{18}
$$

を格子間隔としています。

空間差分と自由時間発展を同じ離散化で整合させるため、連続系の

$$
\omega^2=\mathbf k^2+m^2
$$

ではなく、格子 Laplacian に対応する分散関係

$$
\omega_{\rm lat}^2(\mathbf k)
=
m^2
+
\sum_i
\left[
\frac{2}{a}
\sin\left(\frac{k_i a}{2}\right)
\right]^2
$$

を用います。

さらに、サンプルした各 Fourier モードには

$$
W(\mathbf k)
=
\exp\left[
-\frac{1}{2}
\left(
\frac{|\mathbf k|}{\Lambda}
\right)^8
\right]
$$

という滑らかな UV window を掛けます。カットオフ scale は

$$
\Lambda
=
f_{\rm UV}\frac{\pi}{a}
$$

で、slider は

$$
f_{\rm UV}
=
\frac{\Lambda}{\Lambda_{\rm Ny}}
$$

を変化させます。

格子そのものにも Nyquist scale という UV cutoff がありますが、この window はそこへ達する前から高波数モードを滑らかに抑えます。そのため、格子 scale に近い構造や discretization artifact を強く表示しすぎずに、真空揺らぎの空間構造を観察できます。

## 正則化と Lorentz 対称性

この可視化で用いている正則化は Lorentz 不変ではありません。空間格子、$|\mathbf k|$ に基づく UV window、そしてある時刻で定義した Wigner 分布は、いずれも特定の時間切片を選んでいます。

これは単なる実装上の都合ではありません。質量殻

$$
E^2-\mathbf k^2=m^2
$$

を保ったまま Lorentz boost を行えば、$E$ と $|\mathbf k|$ はいくらでも大きくできます。そのため、「一定以上の三運動量を捨てる」という cutoff は Lorentz boost のもとで不変にはなりません。

Pauli-Villars 正則化や proper-time 法、Euclid 空間での正則化など、Lorentz 共変性を保ちやすい方法は相関関数やループ積分の計算に適しています。一方、この可視化では「有限個の実数自由度から実際の場の realization を生成する」ことを優先しているため、空間格子上の cutoff を明示的に導入しています。

有限体積、有限格子間隔、UV window、等値面の補間はいずれも表示される形に影響します。とくに等値面は、粗視化された場の level set を幾何学的に表示したものであり、そこに物理的な膜が存在しているわけではありません。
