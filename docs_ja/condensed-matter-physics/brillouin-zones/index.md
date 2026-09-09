# 結晶格子と第一 Brillouin zone

Bravais 格子は、3 本の原始並進ベクトルの整数結合で生成されます。逆格子は、周期結晶内で同等な波数ベクトルを整理する格子です。第一 Brillouin zone は、他のどの逆格子点よりも原点に近い逆空間の点の集合です。

## 逆格子と第一 Brillouin zone

原始ベクトル $\mathbf a_i$ に対し、逆格子基底 $\mathbf b_j$ を

$$
\mathbf a_i\cdot\mathbf b_j=2\pi\delta_{ij}.
$$

で定義します。ゼロでない各逆格子ベクトル $\mathbf G$ は、1 つの垂直二等分面による不等式

$$
\mathbf k\cdot\mathbf G\leq\frac{|\mathbf G|^2}{2}.
$$

を与えます。それらの共通部分が逆格子の Wigner–Seitz 胞、すなわち第一 Brillouin zone です。実空間と逆空間の原始胞体積をそれぞれ $V_{\mathrm{cell}}$、$V_{\mathrm{BZ}}$ とすると、

$$
V_{\mathrm{cell}}V_{\mathrm{BZ}}=(2\pi)^3.
$$

となります。

## Visualization

<iframe src="app/index.html?lang=ja" title="実格子と逆格子、およびその第一 Brillouin zone" data-auto-height scrolling="no" style="display: block; width: 100%; height: 980px; min-height: 780px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 試してみること

1. 単純立方、体心立方、面心立方の各格子を比較します。BCC と FCC が逆格子として入れ替わることを追ってください。
2. 逆格子点をいったん非表示にし、再び表示して、どの近接点が zone の各面を定めるかを確認します。
3. zone の不透明度を下げ、両方の図を回転して、実空間の原始基底と逆空間の多面体を比較します。

## 図から読み取れること

- 単純立方格子の第一 Brillouin zone は立方体です。
- BCC の逆格子は FCC なので、BCC の zone は菱形十二面体です。FCC の逆格子は BCC なので、FCC の zone は切頂八面体です。
- 単純六方格子では六角柱になります。$c/a$ を変えると縦横比は変わりますが、縮退が生じない範囲ではこの組合せ型は変わりません。

## 規約と限界

長さは無次元です。立方格子では慣用単位胞の辺長を $1$ とし、六方格子では $a=1$、$c/a=1.6$ とします。表示するのは原子基底を持たない理想的な Bravais 格子です。zone は有限の近接 shell に含まれる逆格子点から数値的に構成していますが、表示する 4 種の格子には十分な範囲です。

## 参考文献

- N. W. Ashcroft and N. D. Mermin, *Solid State Physics*, Chapter 8.
- C. Kittel, *Introduction to Solid State Physics*, Chapter 2.
