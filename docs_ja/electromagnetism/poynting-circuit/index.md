# 回路の電磁場とエネルギー流

## 電子ではなく場がエネルギーを運ぶ

回路のエネルギー伝達を、「電子が電源から導線の中を進み、負荷までエネルギーを運ぶ」と考えるのは適切ではありません。導体中の電子は電流を担い、電磁場とエネルギーをやり取りしますが、**電源から負荷へのエネルギー輸送そのものは、電磁場のエネルギー流として記述されます**。

その流束密度を表すのが、Poynting ベクトル

$$
\mathbf S(\mathbf r,t)
=
\mathbf E(\mathbf r,t)\times\mathbf H(\mathbf r,t)
$$

です。

重要なのは、$\mathbf S$ が導線内部だけでなく、**導線の周囲の空間にも存在する**ことです。たとえば直流回路の抵抗では、周囲の電場と磁場からなる Poynting 流が抵抗へ向かい、電磁場のエネルギーがそこで熱へ変換されます。

したがって、回路図でいう「電源が負荷へ電力を供給する」という記述を、場の立場から局所的に見ると、

> **電磁場が空間を通ってエネルギーを運び、負荷へ流れ込む**

という描像になります。

## Poynting の定理

電磁場と物質の間の局所的なエネルギー収支は、Poynting の定理

$$
\frac{\partial u_{\mathrm{em}}}{\partial t}
+
\nabla\cdot\mathbf S
=
-\mathbf J\cdot\mathbf E,
$$

$$
u_{\mathrm{em}}
=
\frac{1}{2}\epsilon_0|\mathbf E|^2
+
\frac{1}{2}\mu_0|\mathbf H|^2
$$

で表されます。

$\mathbf J\cdot\mathbf E>0$ の領域では、電磁場が物質へエネルギーを注入しています。抵抗では、このエネルギーがジュール熱として散逸します。そのエネルギーは、電源から周囲の電磁場を通じて運ばれ、Poynting 流として抵抗へ流れ込んだものです。

直流回路では電場と磁場が定常なので、$\mathbf S$ も時間によらず負荷へ向かいます。

純抵抗の交流回路では、電圧と電流、したがって $\mathbf E$ と $\mathbf H$ が半周期ごとに同時に反転します。このため

$$
\mathbf E\times\mathbf H
$$

の向きは反転せず、各瞬間の電力 (瞬時電力)

$$
p_R(t)=v(t)i(t)=R\,i^2(t)
$$

も常に非負です。

一方、理想インダクタや理想キャパシタでは、素子が電磁エネルギーを一時的に蓄え、後で回路へ返します。そのため瞬時電力の符号が変わり、Poynting 流も周期の途中で反転します。理想的には、この往復するエネルギーの周期平均はゼロです。

## Visualization

<iframe src="app/index.html?lang=ja" title="直流・交流直列回路の周囲を流れる電磁エネルギー" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1480px; min-height: 760px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 試してほしいこと

1. **直流**のまま抵抗値や電源電圧を変え、Poynting ベクトルと抵抗の端子電力を比較してください。エネルギーが導線に沿って「電子に運ばれる」というより、周囲の電磁場から抵抗へ流れ込んでいることが見えます。

2. 白い曲線ハンドルや素子をドラッグして回路の形を変えてください。形状を変更すると既存の場は無効になるので、配置を決めてから **場を再計算** を押します。

3. 抵抗を接続したまま **交流** に切り替え、アニメーションを止めて位相を1周期分動かしてください。$\mathbf E$ と $\mathbf H$ はそれぞれ反転しますが、両方が同時に反転するため $\mathbf E\times\mathbf H$ の向きは変わらず、エネルギーは常に抵抗へ流入します。

4. インダクタまたはキャパシタを追加してください。ある位相では素子へエネルギーが流入し、別の位相では素子から場や電源側へ戻ります。瞬時電力の符号と Poynting 流の向きを比較すると、リアクティブ素子におけるエネルギーの往復が確認できます。

5. 電位、電場、磁場、電磁エネルギー密度を切り替えて比較してください。

## 準静的回路モデル

この可視化では、回路を理想的な集中定数素子の直列接続として扱います。交流モードでは電圧スライダーを電源電圧のピーク値とし、

$$
Z_R=R,
\qquad
Z_L=i\omega L,
\qquad
Z_C=\frac{1}{i\omega C},
$$

$$
\widetilde I
=
\frac{\widetilde V}{\sum_k Z_k}
$$

から回路電流を求めます。

周囲の電場は、各導体ノードについてあらかじめ計算した Laplace 方程式の基底解 $\Phi_n(\mathbf r)$ を用いて構成します。複素ノード電圧 $\widetilde V_n$ に対して

$$
\widetilde\phi(\mathbf r)
=
\sum_n \widetilde V_n\Phi_n(\mathbf r),
$$

$$
\widetilde{\mathbf E}
=
-\nabla\widetilde\phi
$$

とします。

磁場は、描画された電流経路を細線電流として近似し、軟化した Biot–Savart 則から計算します。この2次元モデルでは磁場は主に画面に垂直な成分を持ち、面内の電場との外積によって面内のエネルギー流が得られます。

交流の場合、表示しているのは時間平均ではなく**各瞬間の Poynting ベクトル**です。選択した位相で実電場と実磁場を復元し、

$$
\mathbf S(\mathbf r,t)
=
\operatorname{Re}
\left[
\widetilde{\mathbf E}(\mathbf r)e^{i\omega t}
\right]
\times
\operatorname{Re}
\left[
\widetilde{\mathbf H}(\mathbf r)e^{i\omega t}
\right]
$$

として計算します。

このため、インダクタやキャパシタで起こるエネルギー流の反転もそのまま表示されます。

## 読み取れること

- 回路のエネルギー輸送は、導線内部だけで完結するものではありません。電磁エネルギーは導線の周囲にも分布し、Poynting ベクトルとして負荷へ流れ込みます。
- 純抵抗では、直流でも交流でもエネルギーは常に抵抗へ渡されます。
- 理想インダクタと理想キャパシタでは、エネルギーは素子と電磁場の間を往復し、電力と Poynting 流の向きが周期的に反転します。
- 電圧・電流による回路論と、$\mathbf E$・$\mathbf H$・$\mathbf S$ による場の記述は、異なる物理を表しているのではなく、同じエネルギー伝達を異なるレベルで記述しています。

各負荷の周囲では、表示上の2次元 Poynting 流束を積分し、その符号を素子の瞬時電力と比較しています。ただし、この比較はエネルギー流の向きの整合性を見るためのもので、絶対値の精密な一致を意図したものではありません。

## モデルの限界

これは低周波・2次元・細線近似にもとづく準静的な概念モデルです。

3次元の素子形状、有限の伝搬速度、放射、表皮効果、誘電体構造、寄生容量・寄生インダクタンスなどは含めていません。$R$、$L$、$C$ は理想集中定数素子として扱います。

また、損失のない直列 $LC$ 回路が厳密に共振すると、理想回路モデルでは電流振幅が発散するため、この場合の場は定義しません。

## 参考

- R. P. Feynman, R. B. Leighton, M. Sands, [*The Feynman Lectures on Physics, Vol. II, Chapter 27: Field Energy and Field Momentum*](https://www.feynmanlectures.caltech.edu/II_27.html)
- Veritasium, [*The Biggest Misconception About Electricity*](https://www.youtube.com/watch?v=bHIhgxav9LY)
- Veritasium, [*How Electricity Actually Works*](https://www.youtube.com/watch?v=oI_X2cMHNe0)
