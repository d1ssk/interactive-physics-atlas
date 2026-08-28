# Ising模型の相転移

## 物理的な考え方

強磁性Ising模型は、局所的な整列と熱的無秩序の競合を表す最も単純な格子模型です。各スピンは2値をとり、外場ゼロのHamiltonianは

$$
H=-J\sum_{\langle i,j\rangle}s_i s_j,
\qquad s_i\in\{-1,+1\}.
$$

$J=k_B=1$ とし、周期境界条件を課した超立方格子を用います。1次元では正の温度に相転移はありません。無限2次元正方格子の臨界温度は厳密に

$$
T_c=\frac{2}{\log(1+\sqrt{2})}\simeq2.269185,
$$

であり、3次元立方格子では数値的に $T_c\simeq4.511524$ と見積もられています。下の有限格子ではこれらの温度で特異性は生じませんが、近傍でゆらぎと緩和が顕著に変化します。

## 関連する方程式

スピン $s_i$ の反転を提案したとき、エネルギー変化は

$$
\Delta E=2s_i\sum_{j\in\operatorname{nn}(i)}s_j.
$$

ランダム逐次一スピン反転Metropolisダイナミクスでは、次の確率で提案を受理します。

$$
P_{\mathrm{acc}}=\min\!\left(1,e^{-\Delta E/T}\right).
$$

1 sweepを $N=L^d$ 回の独立な格子点選択による反転試行と定義します。同じ格子点が複数回選ばれる場合もあります。表示する観測量は

$$
m=\frac{1}{N}\sum_i s_i,
\qquad
e=\frac{H}{N}.
$$

### 熱力学関数

無限1D鎖では $T>0$ に対して

$$
f(T)=-T\log\!\left[2\cosh(1/T)\right],
\qquad
e(T)=-\tanh(1/T),
\qquad
c(T)=\frac{\operatorname{sech}^2(1/T)}{T^2}.
$$

自発磁化はすべての $T>0$ でゼロです。無限2D正方格子では $\beta=1/T$ とし、

$$
\kappa=\frac{2\sinh(2\beta)}{\cosh^2(2\beta)}.
$$

外場ゼロの自発磁化とスピンあたり内部エネルギーは

$$
m(T)=
\begin{cases}
\left[1-\sinh^{-4}(2/T)\right]^{1/8}, & T<T_c,\\
0, & T\ge T_c,
\end{cases}
$$

$$
e(T)=-\coth(2\beta)
\left[1+\frac{2}{\pi}\left(2\tanh^2(2\beta)-1\right)K(\kappa)\right],
$$

となります。$K$ は第1種完全楕円積分です。熱容量は $c(T)=de/dT$ であり、$T_c$ で対数発散します。アプリケーションでは厳密なエネルギーを有限差分して2Dの熱容量曲線を描くため、表示上のピークは有限で、その高さはグラフの解像度に依存します。3Dには対応する閉じた形の熱力学的厳密解がないため、厳密であるかのような3D曲線は描きません。

## インタラクティブ可視化

<iframe src="app/index.html?lang=ja" title="1・2・3次元Ising模型のインタラクティブ・シミュレーション" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2450px; min-height: 1500px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 試してほしいこと

1. 2Dで $T=1.5$ として格子を整列させた後、温度を $T=4$ まで上げ、ドメインが崩れる様子を観察します。
2. $T_c$、続いて $1.01T_c$ を選びます。相転移点直上で大きなドメインがゆっくり変化する様子を、臨界点から離れた温度での速い相関減衰と比較します。
3. 1Dへ切り替え、低い正の温度で待ちます。有限温度の秩序相がないことと整合して、熱的なドメイン壁が残ります。
4. 3Dへ切り替えて $z$ 断面を動かします。画像は断面ごとに変わりますが、$m$ と $e$ は引き続き $L^3$ 個すべてのスピンを使います。
5. ランダム化後に同じシードと設定を再利用します。操作変更の順序も同じなら、明示的な擬似乱数生成器により軌道を再現できます。

## 注目する点

2Dまたは3Dの相転移点より下では同符号の大きなドメインが形成され、$|m|$ が大きくなりえます。相転移点より上では、十分大きく平衡化された系の長時間磁化は熱的無秩序によってゼロ付近に保たれます。$T_c$ 近傍では多くの長さスケールにわたるゆらぎが現れ、局所Metropolisダイナミクスは臨界緩和を示します。

熱力学曲線とライブ表示のカードは異なる問いに答えます。厳密解がある場合、曲線は無限系の平衡量を表します。カードは有限マルコフ鎖の瞬間的な1状態です。熱平均を推定するには、平衡化区間を捨て、自己相関を測り、十分に離れた標本を平均する必要があります。

## 規約と制限

1D、2D、3Dの各モードは、同じランダム逐次局所Metropolis規約と周期境界条件を用います。3DのCanvasには描画とWorkerのスナップショットを有界に保つため、選択した2D断面だけを表示します。観測量は立方格子全体から計算します。クラスターアルゴリズムではないため、臨界点近傍で効率よく平衡化することは期待できません。

シミュレーションはJavaScript module Web Worker内で有界なバッチごとに実行します。描画はメインスレッドに残し、スピンのスナップショットは型付きバイトバッファとして転送します。表示更新頻度と更新1回あたりのsweep数を下げるとクライアント負荷を抑えられます。バックエンド、Pyodide、Wasmランタイムは読み込みません。

有限サイズ、有限時間、相関した標本、初期化バイアスはいずれも結果に影響します。この可視化の目的は定性的な探索と決定論的なアルゴリズム検証であり、臨界指数や熱力学平均の精密決定ではありません。

## 参考文献

- L. Onsager, “Crystal Statistics. I. A Two-Dimensional Model with an
  Order-Disorder Transition,” *Physical Review* **65**, 117 (1944).
- C. N. Yang, “The Spontaneous Magnetization of a Two-Dimensional Ising Model,”
  *Physical Review* **85**, 808 (1952).
- M. Hasenbusch, “Finite size scaling study of lattice models in the three-dimensional
  Ising universality class,” *Physical Review B* **82**, 174433 (2010).
- N. Metropolis et al., “Equation of State Calculations by Fast Computing Machines,”
  *Journal of Chemical Physics* **21**, 1087 (1953).
