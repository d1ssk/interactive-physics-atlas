# Bloch球

## 1量子ビットを方向として表す

観測できないglobal phaseを除くと、任意の純粋な1量子ビット状態は

$$
|\psi\rangle
=
\cos\frac{\theta}{2}|0\rangle
+e^{i\phi}\sin\frac{\theta}{2}|1\rangle.
$$

と書けます。$(\theta,\phi)$ は単位球面上の1点を指定します。その直交座標はPauli演算子の期待値

$$
\mathbf r
=
(\langle X\rangle,\langle Y\rangle,\langle Z\rangle)
=
(\sin\theta\cos\phi,\sin\theta\sin\phi,\cos\theta).
$$

です。

## 可視化

<iframe src="app/index.html?lang=ja" title="Bloch球による状態・重ね合わせ・量子ゲートの可視化" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2550px; min-height: 1000px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 試してみること

1. 最初のパネルで、同じ状態を $X$、$Y$、$Z$ の各基底から指定し、Bloch vectorを比較します。
2. 2番目のパネルで相対位相 $\delta$ を変えます。Bloch vectorではなくketを加算してから正規化していることに注目してください。逆向きのketは零ベクトルへ打ち消し合う場合があります。
3. 3番目のパネルでPauli、Hadamard、$S$、$T$ の各ゲートを作用させます。進行スライダーを動かし、ユニタリ操作を回転として観察します。

## 図から読み取れること

純粋状態は常に単位球面上にあります。北極と南極は $|0\rangle$ と $|1\rangle$ であり、赤道上の状態は計算基底で等しい確率をもち、相対位相が異なります。1量子ビットのユニタリ操作は規格化を保ち、Bloch vectorの回転として作用します。

## 規約と制約

この可視化が扱うのは純粋な1量子ビット状態だけです。global phaseだけが異なる状態は同じ物理状態を表すため、ketを表示する際にはglobal phaseを固定します。Bloch球の内部に位置する混合状態は扱いません。

## 参考文献

- M. A. Nielsen and I. L. Chuang, *Quantum Computation and Quantum Information*, 10th anniversary
  ed., Section 1.2.
