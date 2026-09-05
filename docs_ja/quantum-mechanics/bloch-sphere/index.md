# Bloch球

## 1量子ビット状態を球面上の点として表す

観測に影響しない全体位相（global phase）を除くと、任意の純粋な1量子ビット状態は

$$
|\psi\rangle
=
\cos\frac{\theta}{2}|0\rangle
+
e^{i\phi}\sin\frac{\theta}{2}|1\rangle
$$

と書けます。$(\theta,\phi)$ は単位球面上の1点を指定し、その直交座標は Pauli 演算子の期待値

$$
\mathbf r
=
(\langle X\rangle,\langle Y\rangle,\langle Z\rangle)
=
(\sin\theta\cos\phi,\sin\theta\sin\phi,\cos\theta)
$$

で与えられます。この単位球面を Bloch 球、$\mathbf r$ を Bloch ベクトルと呼びます。

## Visualization

<iframe src="app/index.html?lang=ja" title="Bloch球による状態・重ね合わせ・量子ゲートの可視化" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2550px; min-height: 1000px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 試してみること

1. 最初のパネルで、同じ状態を $X$、$Y$、$Z$ の各基底から指定し、Bloch ベクトルを比較します。

2. 2番目のパネルで相対位相 $\delta$ を変えます。Bloch ベクトルを足すのではなく、ket を重ね合わせてから正規化していることに注目してください。係数まで含めて互いに反対向きの ket を加えると、零ベクトルになる場合もあります。

3. 3番目のパネルで Pauli、Hadamard、$S$、$T$ の各ゲートを作用させます。進行スライダーを動かし、ユニタリ操作が Bloch 球上の回転としてどのように現れるかを観察します。

## 図から読み取れること

純粋状態の Bloch ベクトルは常に単位球面上にあります。北極と南極はそれぞれ $|0\rangle$ と $|1\rangle$ に対応します。赤道上の状態を計算基底で測定すると、$0$ と $1$ が等しい確率で得られますが、球面上の方位角によって相対位相が異なります。

1量子ビットに対するユニタリ操作は状態の規格化を保ち、全体位相を除けば Bloch 球上の回転として表されます。

## この可視化で扱う範囲

この可視化では、純粋な1量子ビット状態だけを扱います。全体位相だけが異なる ket は同じ物理状態を表すため、ket の表示では全体位相を一定の規約で固定しています。

混合状態は Bloch 球の内部の点として表されますが、この可視化では扱いません。
