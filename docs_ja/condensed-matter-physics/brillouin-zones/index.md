# 結晶格子と第一 Brillouin zone

3 次元の Bravais 格子は、3 本の原始並進ベクトルの整数結合によって生成されます。結晶中の波を考えると、波数ベクトル $\mathbf k$ と $\mathbf k+\mathbf G$ は、逆格子ベクトル $\mathbf G$ を通じて密接に関係します。逆格子は、この結晶の周期性を波数空間で表す格子です。

第一 Brillouin zone は、逆格子の原点に最も近い領域として定義されます。これは逆格子における Wigner–Seitz 胞であり、結晶中の波数を整理するための基本領域になります。

## 逆格子から第一 Brillouin zone へ

実空間の原始ベクトル $\mathbf a_i$ に対し、逆格子の原始ベクトル $\mathbf b_j$ を

$$
\mathbf a_i\cdot\mathbf b_j=2\pi\delta_{ij}
$$

で定義します。逆格子ベクトルは

$$
\mathbf G=n_1\mathbf b_1+n_2\mathbf b_2+n_3\mathbf b_3,
\qquad n_i\in\mathbb Z
$$

と書けます。

第一 Brillouin zone は、逆格子の原点に他のどの逆格子点よりも近い点 $\mathbf k$ の集合です。ゼロでない各逆格子ベクトル $\mathbf G$ に対して、原点と $\mathbf G$ の垂直二等分面が境界の候補となり、原点側の半空間は

$$
\mathbf k\cdot\mathbf G\leq\frac{|\mathbf G|^2}{2}
$$

で表されます。

すべての $\mathbf G\neq 0$ に対するこの半空間の共通部分が、逆格子の Wigner–Seitz 胞、すなわち第一 Brillouin zone です。

実空間と逆空間の原始胞の体積をそれぞれ $V_{\mathrm{cell}}$、$V_{\mathrm{BZ}}$ とすると、

$$
V_{\mathrm{cell}}V_{\mathrm{BZ}}=(2\pi)^3
$$

が成り立ちます。実空間の単位胞が大きいほど逆空間の基本領域は小さくなる、という実空間と逆空間の反比例関係を表しています。

## Visualization

<iframe src="app/index.html?lang=ja" title="実格子と逆格子、およびその第一 Brillouin zone" data-auto-height scrolling="no" style="display: block; width: 100%; height: 980px; min-height: 780px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 読み取れること

単純立方格子、体心立方格子（BCC）、面心立方格子（FCC）を切り替えると、実格子と逆格子の対応を比較できます。単純立方格子の逆格子は再び単純立方格子であり、第一 Brillouin zone は立方体になります。

BCC と FCC は逆格子として互いに入れ替わります。したがって、BCC の第一 Brillouin zone は FCC 格子の Wigner–Seitz 胞である菱形十二面体に、FCC の第一 Brillouin zone は BCC 格子の Wigner–Seitz 胞である切頂八面体になります。

逆格子点の表示を切り替えると、各逆格子点と原点の垂直二等分面が第一 Brillouin zone の面を定めていることを確認できます。zone の不透明度を下げて図を回転すると、逆格子点の配置と多面体の形の対応がより見やすくなります。

単純六方格子では、第一 Brillouin zone は六角柱になります。$c/a$ を変えると高さと幅の比は変化しますが、格子の対称性が保たれている限り、六角柱という基本的な形は変わりません。

## 表示上の規約

長さは無次元化しています。立方格子では慣用単位胞の辺長を $1$ とし、六方格子では $a=1$、$c/a=1.6$ としています。

ここで扱うのは原子基底を持たない Bravais 格子です。第一 Brillouin zone は、周囲の逆格子点から数値的に Wigner–Seitz 胞を構成して表示しています。