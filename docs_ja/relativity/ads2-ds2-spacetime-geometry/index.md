# AdS₂ と dS₂ の時空幾何

anti-de Sitter (AdS) 時空と de Sitter (dS) 時空は、それぞれ負および正の一定曲率をもつ最大対称な Lorentz 時空です。2 次元の場合は、3 次元の平坦な埋め込み空間内の二次曲面として表すことで、座標パッチや測地線を幾何学的に可視化できます。一方、時空の因果構造を調べるには共形図が適しています。

## Visualization

<iframe src="app/index.html?lang=ja" title="AdS2とdS2の埋め込み、座標パッチ、測地線、共形図" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1900px; min-height: 1250px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 埋め込み空間による定義

時空次元を $D=d+1$、曲率半径を $L>0$ とします。anti-de Sitter 時空は、計量

$$
ds_{\rm emb}^2
=
-dX_{-1}^2-dX_0^2+\sum_{i=1}^{d}dX_i^2
$$

をもつ $\mathbb R^{2,d}$ 内の二次曲面

$$
-X_{-1}^2-X_0^2+\sum_{i=1}^{d}X_i^2=-L^2,
$$

de Sitter 時空は、計量

$$
ds_{\rm emb}^2
=
-dX_0^2+\sum_{i=1}^{d+1}dX_i^2
$$

をもつ $\mathbb R^{1,d+1}$ 内の二次曲面

$$
-X_0^2+\sum_{i=1}^{d+1}X_i^2=L^2
$$

として定義されます。AdS と dS の計量は、それぞれの埋め込み空間の計量から誘導されます。

AdS に $\varepsilon=-1$、dS に $\varepsilon=+1$ を割り当てます。曲率テンソルの符号規約を

$$
R^\rho{}_{\sigma\mu\nu}
=
\partial_\mu\Gamma^\rho_{\nu\sigma}
-\partial_\nu\Gamma^\rho_{\mu\sigma}
+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}
-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}
$$

とすると、

$$
R_{\mu\nu\rho\sigma}
=
\frac{\varepsilon}{L^2}
\left(
g_{\mu\rho}g_{\nu\sigma}
-g_{\mu\sigma}g_{\nu\rho}
\right),
\qquad
R=\frac{\varepsilon d(d+1)}{L^2}.
$$

この可視化では $d=1$ としているため、

$$
R_{\mathrm{AdS}_2}=-\frac{2}{L^2},
\qquad
R_{\mathrm{dS}_2}=+\frac{2}{L^2}
$$

となります。

埋め込み図では、埋め込み空間の座標を通常の 3 次元画面上に描いています。そのため、画面上のユークリッド的な長さや角度から時空の因果構造を読み取ることはできません。接ベクトル $U$ が時間的、ヌル、空間的のいずれであるかは、埋め込み空間の不定値計量によるノルム $U\cdot U$ が、それぞれ負、零、正であることによって決まります。

## AdS₂ の座標系

AdS₂ の大域座標 $(\tau,\rho)$ は

$$
X_{-1}=L\cosh\rho\cos\tau,
\qquad
X_0=L\cosh\rho\sin\tau,
\qquad
X_1=L\sinh\rho
$$

によって埋め込み座標と関係づけられます。誘導計量は

$$
ds^2
=
L^2\left(
-\cosh^2\rho\,d\tau^2+d\rho^2
\right)
$$

です。

埋め込み二次曲面そのものでは $\tau$ は周期的であり、閉じた時間的曲線が存在します。通常、物理で AdS 時空という場合には、$\tau$ の周期性をほどいた普遍被覆を考えます。

Poincaré パッチでは $z>0$ として、

$$
X_{-1}
=
\frac{L^2+z^2-t^2}{2z},
\qquad
X_0=\frac{Lt}{z},
\qquad
X_1
=
\frac{L^2-z^2+t^2}{2z}
$$

と置きます。このとき計量は

$$
ds^2
=
\frac{L^2}{z^2}
\left(
-dt^2+dz^2
\right)
$$

となります。

Poincaré 座標が覆うのは大域 AdS₂ の一部だけです。$z\to0$ は共形境界に近づく極限であり、$z\to\infty$ は Poincaré 地平面に近づく極限に対応します。

## dS₂ の座標系

dS₂ の大域座標 $(\tau,\theta)$ は双曲面全体を覆い、

$$
X_0=L\sinh(\tau/L),
\qquad
X_1=L\cosh(\tau/L)\cos\theta,
\qquad
X_2=L\cosh(\tau/L)\sin\theta
$$

と書けます。誘導計量は

$$
ds^2
=
-d\tau^2
+
L^2\cosh^2(\tau/L)\,d\theta^2
$$

です。

膨張する平坦パッチでは、

$$
ds^2
=
-dt^2+e^{2t/L}dx^2
$$

となります。この座標系は大域 dS₂ の一部のみを覆います。

一方、特定の慣性観測者を中心とする静的パッチでは、

$$
ds^2
=
-\left(1-\frac{r^2}{L^2}\right)dt_s^2
+
\frac{dr^2}{1-r^2/L^2},
\qquad
|r|<L
$$

と書けます。$|r|=L$ は宇宙論的地平面であり、中心の観測者と因果的に関係できる領域の境界となります。

## 局所標構と測地線

可視化では、選択した各点において二次曲面に接する正規直交標構 $(e_0,e_1)$ を構成します。これは

$$
e_0\cdot e_0=-1,
\qquad
e_1\cdot e_1=+1,
\qquad
e_0\cdot e_1=0
$$

を満たします。

ラピディティ $\chi$ の局所 Lorentz ブーストを施すと、

$$
e'_0
=
\cosh\chi\,e_0+\sinh\chi\,e_1,
\qquad
e'_1
=
\sinh\chi\,e_0+\cosh\chi\,e_1
$$

となります。ヌル方向 $e'_0\pm e'_1$ は、ブースト後もヌルのままです。

表示される時間的、ヌル、空間的測地線は、二次曲面と埋め込み空間の原点を通る適切な 2 次元平面との交線として得られます。その因果的分類は、画面上での曲がり方ではなく、誘導された Lorentz 計量によって決まります。

## 共形図

AdS₂ の大域座標で

$$
\tan\sigma=\sinh\rho
$$

と定義すると、

$$
ds^2
=
\frac{L^2}{\cos^2\sigma}
\left(
-d\tau^2+d\sigma^2
\right),
\qquad
-\frac{\pi}{2}<\sigma<\frac{\pi}{2}
$$

となります。

共形因子 $L^2/\cos^2\sigma$ を除けば、AdS₂ の普遍被覆は縦長の帯として表されます。左右の共形境界は時間的であり、ヌル信号は有限の大域座標時間で境界に到達できます。

dS₂ では

$$
\tan\eta=\sinh(\tau/L)
$$

と定義すると、

$$
ds^2
=
\frac{L^2}{\cos^2\eta}
\left(
-d\eta^2+d\theta^2
\right),
\qquad
-\frac{\pi}{2}<\eta<\frac{\pi}{2}
$$

となります。

dS₂ の過去と未来の共形境界は空間的です。色を付けた菱形の領域は一つの静的パッチを表し、そのヌル境界が宇宙論的地平面に対応します。

## 探索例

1. AdS₂ の大域座標と Poincaré 座標を切り替え、Poincaré パッチが二次曲面のどの領域を覆うかを確認します。

2. dS₂ の大域座標、平坦座標、静的座標を比較します。座標系を変えると座標格子は変化しますが、背後にある同じ dS₂ 時空を記述しています。

3. ラピディティ $\chi$ を変化させ、局所標構に対する Lorentz ブーストを確認します。標構は変化しますが、ヌル方向の因果的性質は変わりません。

4. 埋め込み図と共形図を比較します。特に、3 次元画面上のユークリッド的な見かけと、時空の地平面や無限遠の因果的性質は区別して考える必要があります。
