# AdS₂とdS₂の時空幾何

anti-de Sitter 時空と de Sitter 時空は、それぞれ負曲率と正曲率をもつ最大対称 Lorentz 幾何です。2 次元では 3 次元の周囲空間内の二次曲面として表示でき、座標パッチや測地線を具体的に調べられます。ただし、因果構造を正しく読み取るには別の共形図が必要です。

## 可視化

<iframe src="app/index.html?lang=ja" title="AdS2とdS2の埋め込み、座標パッチ、測地線、共形図" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1900px; min-height: 1250px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 周囲空間による定義

時空次元を $D=d+1$、曲率半径を $L>0$ とします。anti-de Sitter時空は $\mathbb R^{2,d}$ 内の二次曲面

$$
-X_{-1}^2-X_0^2+\sum_{i=1}^{d}X_i^2=-L^2,
$$

de Sitter時空は $\mathbb R^{1,d+1}$ 内の二次曲面

$$
-X_0^2+\sum_{i=1}^{d+1}X_i^2=L^2.
$$

として定義されます。AdSとdSの計量は、それぞれの不定値な周囲空間計量から誘導されます。AdSに $\varepsilon=-1$、dSに $\varepsilon=+1$ を割り当てます。ここでの符号規約は

$$
R^\rho{}_{\sigma\mu\nu}
=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}
+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}
-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma},
$$

なので、

$$
R_{\mu\nu\rho\sigma}
=\frac{\varepsilon}{L^2}
\left(g_{\mu\rho}g_{\nu\sigma}-g_{\mu\sigma}g_{\nu\rho}\right),
\qquad
R=\frac{\varepsilon d(d+1)}{L^2}.
$$

です。この可視化では曲面を $d=1$ に特殊化するため、AdS₂では $R=-2/L^2$、dS₂では $R=+2/L^2$ となります。

表示軸は周囲空間成分を通常の画面座標として描いたものです。画面上のユークリッド的な長さや角度から因果的な型を判定することはできません。接ベクトル $U$ が時間的、ヌル、空間的であるかは、その周囲空間ノルムがそれぞれ負、零、正であることによって決まります。

## AdS₂の座標系

AdS₂の大域座標による埋め込みは

$$
X_{-1}=L\cosh\rho\cos\tau,
\qquad
X_0=L\cosh\rho\sin\tau,
\qquad
X_1=L\sinh\rho,
$$

で、誘導計量は

$$
ds^2=L^2\left(-\cosh^2\rho\,d\tau^2+d\rho^2\right).
$$

です。埋め込み二次曲面上では $\tau$ が周期的なので、閉じた時間的曲線が存在します。通常AdS時空と呼ばれるものは、$\tau$ をほどいて得られる普遍被覆です。

Poincaré パッチでは $z>0$ とし、

$$
X_{-1}=\frac{L^2+z^2-t^2}{2z},
\qquad
X_0=\frac{Lt}{z},
\qquad
X_1=\frac{L^2-z^2+t^2}{2z},
$$

と置きます。このとき

$$
ds^2=\frac{L^2}{z^2}\left(-dt^2+dz^2\right).
$$

となります。この座標チャートが覆うのは大域 AdS の一領域だけです。$z\to0$ は共形境界へ近づく極限、$z\to\infty$ は Poincaré 地平面へ近づく極限です。

## dS₂の座標系

dS₂の大域座標は双曲面全体を覆い、

$$
X_0=L\sinh(\tau/L),
\qquad
X_1=L\cosh(\tau/L)\cos\theta,
\qquad
X_2=L\cosh(\tau/L)\sin\theta,
$$

と書けます。計量は

$$
ds^2=-d\tau^2+L^2\cosh^2(\tau/L)\,d\theta^2.
$$

です。一方、膨張平坦パッチでは

$$
ds^2=-dt^2+e^{2t/L}dx^2,
$$

となり、大域 dS₂の平面的な半分だけを覆います。一人の慣性観測者に適合する静的パッチの計量は

$$
ds^2=-\left(1-\frac{r^2}{L^2}\right)dt_s^2
+\frac{dr^2}{1-r^2/L^2},
\qquad |r|<L.
$$

です。その境界 $|r|=L$ は宇宙論的地平面で、中心の観測者が影響を与え、かつ信号を受け取れる領域を制限します。

## 局所標構と測地線

選択した各点で、この可視化は二次曲面に接する正規直交対 $(e_0,e_1)$ を構成します。これは

$$
e_0\mathbin{\cdot}e_0=-1,
\qquad
e_1\mathbin{\cdot}e_1=+1,
\qquad
e_0\mathbin{\cdot}e_1=0.
$$

を満たします。ラピディティ $\chi$ の局所 Lorentz ブーストは

$$
e'_0=\cosh\chi\,e_0+\sinh\chi\,e_1,
\qquad
e'_1=\sinh\chi\,e_0+\cosh\chi\,e_1.
$$

と作用します。ヌル方向 $e'_0\pm e'_1$ はブースト後もヌルです。強調表示する 3 本の測地線は、二次曲面と周囲空間の原点を通る適切な 2 次元平面との交線です。時間的、ヌル、空間的という分類は、画面上の曲がり方ではなく誘導 Lorentz 計量によって決まります。

## 共形図

AdS₂では $\tan\sigma=\sinh\rho$ と定義すると、大域計量は

$$
ds^2=\frac{L^2}{\cos^2\sigma}
\left(-d\tau^2+d\sigma^2\right),
\qquad
-\frac{\pi}{2}<\sigma<\frac{\pi}{2}.
$$

となります。共形因子を除くと、普遍被覆は縦長の帯です。左右の境界は時間的であり、信号は有限の大域座標時間で境界へ到達して戻ることができます。

dS₂では $\tan\eta=\sinh(\tau/L)$ と定義すると、

$$
ds^2=\frac{L^2}{\cos^2\eta}
\left(-d\eta^2+d\theta^2\right),
\qquad
-\frac{\pi}{2}<\eta<\frac{\pi}{2}.
$$

となります。過去と未来の共形境界は空間的です。色を付けた菱形は一つの静的patchで、斜辺が宇宙論的地平面です。

## 探索例

1. AdS₂の大域座標と Poincaré 座標を比較してください。選択点を動かし、Poincaré パッチが二次曲面のどの部分を覆うかを確認できます。

2. dS₂の大域座標、平坦座標、静的座標を比較してください。座標チャートを変更すると座標格子が変わりますが、背後の双曲面は変わりません。

3. ラピディティ $\chi$ を変化させてください。正規直交標構は変わりますが、二つのヌル方向の因果的性質は保たれます。

4. 埋め込み図と共形図を比較してください。特に、3次元曲面のユークリッド的な見かけから地平面や無限遠の因果的性質を推測しないよう注意してください。

## 規約と制限

実装内部の周囲空間成分の順序は $(X_0,X_1,X_2)$ です。読みやすさのため、Plotly の軸は $(X_1,X_2,X_0)$ の順に表示します。AdS₂の周囲空間の符号は $(-,+,-)$、dS₂では $(-,+,+)$ です。

3 次元プロットでは、不定値計量をもつ幾何をユークリッド的な画面上に描かざるを得ません。埋め込み制約や座標の位置関係は示せますが、Lorentz 的な長さや角度は保存されません。また、AdS₂曲面を普遍被覆として解釈すると表示が重なります。大域時間をほどいて表示するのは共形パネルだけです。

2 次元では Einstein テンソルが恒等的に消えます。ここでは AdS₂と dS₂を一定曲率 Lorentz 多様体として扱い、通常の高次元真空 Einstein 方程式だけから曲率半径が決まるとは解釈しません。

AdS 幾何はホログラフィーと弦理論で中心的な役割を持つため、このページは弦理論の節からもリンクしています。ただし、この可視化は弦、ブレーン、境界 CFT、AdS/CFT 対応そのものは扱いません。

## 参考文献

- S. M. Carroll, *Spacetime and Geometry*.
- R. M. Wald, *General Relativity*.
- M. Ammon and J. Erdmenger, *Gauge/Gravity Duality*.
