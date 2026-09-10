# スカラー場真空の量子揺らぎ

## 零点運動から場の配位へ

自由な実スカラー場では、空間 Fourier mode の一つ一つが調和振動子です。$\hbar=c=1$
の単位系では、その振動数は

$$
\omega_{\mathbf k}=\sqrt{\mathbf k^2+m^2}
$$

です。真空には振動子の量子がありませんが、各 mode の波動関数は一点には潰れません。標準的な正準規格化では

$$
\left\langle |q_{\mathbf k}|^2\right\rangle
=
\frac{1}{2\omega_{\mathbf k}},
\qquad
\left\langle |p_{\mathbf k}|^2\right\rangle
=
\frac{\omega_{\mathbf k}}{2}
$$

です。すべての mode をサンプルして Fourier 変換すると、場の配位 $\phi(\mathbf x)$ が一つ得られます。これは、真空で場を測定したときに得られる確率分布からの一標本です。

## 可視化に含まれる二つのサンプル

上段は空間2次元の場です。$t=0$ で正準変数 $(\phi,\pi)$ を正の真空 Wigner 分布から一度だけサンプルし、各自由 mode を

$$
q_{\mathbf k}(t)
=
q_{\mathbf k}(0)\cos(\omega_{\mathbf k}t)
+
\frac{p_{\mathbf k}(0)}{\omega_{\mathbf k}}
\sin(\omega_{\mathbf k}t)
$$

に従って発展させます。したがって、2+1次元バルク全体が一つの相関した履歴であり、各時刻を独立にサンプルしてはいません。自由 Gaussian 理論では、この構成は symmetrized、すなわち Hadamard 二点関数を共分散として実数の履歴全体を一度に生成することと統計的に等価です。実確率分布の共分散には実数かつ対称な関数が必要で、Hadamard 関数はこの条件を満たします。一方、Feynman 関数は時間順序、Wightman 関数は演算子順序を保持するため、一般には複素数値または非対称です。そのため、これらをそのまま実確率変数の共分散行列として使うことはできません。

下段は空間3次元の measure から独立に生成した等時刻配位です。この二つの Gaussian measure は実際に異なります。空間 $d$ 次元における正則化前の等時刻相関は

$$
C_d(r)
=
\int\frac{d^d k}{(2\pi)^d}
\frac{e^{i\mathbf k\cdot\mathbf r}}{2\sqrt{\mathbf k^2+m^2}}
$$

であり、$r=0$ を除けば

$$
C_2(r)=\frac{e^{-mr}}{4\pi r},
\qquad
C_3(r)=\frac{mK_1(mr)}{4\pi^2r}
$$

です。したがって、3次元空間の場を平面で切った配位は、本当に空間2次元の場の真空と同じ分布にはなりません。相関グラフでは、各次元について別途48個の独立な配位を生成し、正則化済みの規格化相関を推定します。各格子距離の点は、格子並進と全空間方向について平均した値の標本平均です。error bar はその平均の標準誤差を表します。これは真空 ensemble の Monte Carlo 推定値であり、検出器による実験データでも、上に表示した一つの配位だけから求めた相関でもありません。

## 可視化

各段の左右は同じ realization を二通りに符号化しています。点群表示の各点は格子上のサンプルで、色が $\phi$ の符号、大きさが $|\phi|$ を表します。等値面表示の橙色と青緑色の境界は、それぞれ $\phi>u\sigma$ と $\phi<-u\sigma$ の excursion region を囲みます。ここで $\sigma^2=\langle\phi^2\rangle$ は正則化した ensemble の分散です。$u$ を変えても場は再サンプルされず、表現だけが変わります。各段の一方を回転すると、もう一方も同じ視点へ連動します。

<iframe
  src="app/index.html?lang=ja"
  title="スカラー場真空の量子揺らぎのインタラクティブ可視化"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2450px; min-height: 1300px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## 試してみること

1. seed を固定したまま $m$ を大きくし、空間的な滑らかさの変化を $\xi\sim m^{-1}$ および二組の相関推定値と比較する。
2. $m$ を固定し、UV window を Nyquist scale に近づける。短波長 mode が増えるため、細かな構造が現れる。
3. seed を変えずに境界 $u$ を動かす。点群の値は固定されたまま、正負の excursion region の連結成分が結合したり消えたりする。
4. 同じパラメータで realization をいくつか生成する。個々の形と Monte Carlo 推定値は、同じ ensemble 期待値のまわりで変動する。

## 正則化と規約

数値模型は一辺 $L_{\rm box}=12L$、格子点数 $18^d$、格子間隔 $a=L_{\rm box}/18$ の周期的空間格子を使います。離散化した自由発展と空間差分を整合させるため、格子分散関係

$$
\omega_{\rm lat}^2(\mathbf k)
=
m^2
+
\sum_i
\left[
\frac{2}{a}\sin\left(\frac{k_i a}{2}\right)
\right]^2
$$

を用います。さらに、サンプルした振幅へ

$$
W(\mathbf k)
=
\exp\left[
-\frac{1}{2}
\left(\frac{|\mathbf k|}{\Lambda}\right)^8
\right],
\qquad
\Lambda
=
f_{\rm UV}\frac{\pi}{a}
$$

を掛けます。この滑らかな表示用 window は、暗黙のカットオフを隠すのではなく、格子 scale の構造を抑制するものです。slider は $f_{\rm UV}=\Lambda/\Lambda_{\rm Ny}$ を変えます。

この正則化は Lorentz 不変ではありません。空間格子、$|\mathbf k|$ に対するカットオフ、等時刻 Wigner 分布は、いずれも時間切片を選びます。実質量殻では $k^2=m^2$ を固定しても Lorentz boost によりエネルギーと運動量をいくらでも大きくできるため、有限 mode 数と Lorentz 不変性を同時に満たす hard cutoff は得られません。Pauli–Villars、proper-time、Euclid 的正則化などの共変な方法は相関関数の計算には有用ですが、この表示のための実 Lorentzian 場履歴上の正の確率分布を与えるものではありません。

有限体積、有限格子間隔、追加の window、Plotly による等値面補間は、いずれも見た目に影響します。等値面は一つの粗視化されたサンプルの level set を記述したもので、物理的な膜ではありません。相互作用する真空、繰り込まれた局所エネルギー密度、粒子検出確率、測定 dynamics は計算していません。

ブラウザは、正本となる Python/NumPy のサンプリング核を Pyodide Worker 内で実行します。JavaScript は返された version 付き数値配列から Plotly trace を構成しますが、場の理論の計算を重複実装してはいません。
