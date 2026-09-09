# Chern バンドとバルク・エッジのトポロジー

整数量子 Hall 効果では、輸送係数が占有量子状態の大域的な性質によって固定されます。局所的には、Bloch 固有ベクトルは結晶運動量とともに滑らかに変化します。しかし大域的には、Brillouin zone 全体にわたる占有状態の族が、滑らかで周期的な位相選択ではほどけないねじれを持ちえます。そのねじれを測る整数が第一 Chern 数です。

この記事では、この事実を 2 バンド Chern 絶縁体模型で順に導きます。Brillouin torus から Bloch 球への写像、トポロジカル相転移を可能にするギャップ閉鎖、SSH 模型の 1 次元 winding、対応する有限鎖の端状態という 4 つの可視化を、理論上の役割に応じて配置しています。SSH 模型は単純な 1 次元の類例として用いるものであり、2 次元模型の物理的な端 Hamiltonian そのものではありません。

## Bloch 状態から空間の写像へ

トレースがゼロの任意の 2 準位 Bloch Hamiltonian は

$$
H(\mathbf k)=\sum_{a=x,y,z}d_a(\mathbf k)\sigma_a,
\qquad
E_\pm(\mathbf k)=\pm|\mathbf d(\mathbf k)|.
$$

と書けます。ここで $(\sigma_x,\sigma_y,\sigma_z)$ は、軌道や副格子など 2 つの内部自由度に作用します。単位行列に比例する項は 2 本のエネルギーを同じだけずらしますが固有状態を変えないため、省略しています。$|\mathbf d|$ がどこでもゼロでなければ、下側と上側のバンドはバルクギャップで隔てられ、占有バンドへの射影演算子は

$$
P_-(\mathbf k)
=\frac{1-\sum_a\hat d_a(\mathbf k)\sigma_a}{2},
\qquad
\hat{\mathbf d}=\frac{\mathbf d}{|\mathbf d|}.
$$

となります。逆格子ベクトルだけ異なる結晶運動量は同一です。したがって、2 次元 Brillouin zone は、向かい合う辺を同一視した正方形として描かれていても torus $T^2$ です。規格化したベクトルは連続写像

$$
\hat{\mathbf d}:T^2\longrightarrow S^2.
$$

を定めます。トポロジーを担うのは射影演算子、同じことですが占有状態が表す ray であり、1 本の固有ベクトルに任意に選んだ位相ではありません。この区別は重要です。Chern 数がゼロでないことは、torus 全体で滑らかかつ周期的な占有固有ベクトルを 1 本選べないことにほかなりません。

## Berry 曲率と Chern 数

局所的な gauge のもとで、$|u_-(\mathbf k)\rangle$ を占有バンドの周期部分とします。Berry 接続と Berry 曲率は

$$
\mathcal A_i(\mathbf k)
=-i\langle u_-(\mathbf k)|\partial_{k_i}u_-(\mathbf k)\rangle,
\qquad
\Omega_-(\mathbf k)
=\partial_{k_x}\mathcal A_y-\partial_{k_y}\mathcal A_x.
$$

です。$|u_-\rangle$ に運動量依存の位相を掛けると接続は変わりますが、曲率は変わりません。この記事では Berry 接続の符号を上式のように選んでいます。2 バンド Hamiltonian では、曲率を gauge に依存しない幾何学的な形

$$
\Omega_-(\mathbf k)
=-\frac12\hat{\mathbf d}\cdot
\left(\partial_{k_x}\hat{\mathbf d}\times\partial_{k_y}\hat{\mathbf d}\right).
$$

で表せます。このスカラー三重積は、Bloch 球面上を掃く向き付き面積の密度です。Brillouin torus 全体で積分すると

$$
C=\frac{1}{2\pi}\int_{\mathrm{BZ}}\Omega_-(\mathbf k)\,d^2k
=-\frac{1}{4\pi}\int_{\mathrm{BZ}}
\hat{\mathbf d}\cdot
\left(\partial_{k_x}\hat{\mathbf d}\times\partial_{k_y}\hat{\mathbf d}\right)d^2k
\in\mathbb Z.
$$

を得ます。したがって $C$ は球面の向き付き被覆数です。球面を逆向きに 1 回覆えば符号が反転し、球面の一部を進んで同じ領域を引き返すだけなら正味の次数はゼロです。電荷 $-e$ の電子からなる孤立した 1 本のバンドが完全に占有されているとき、上の符号規約では横応答は

$$
\frac{j_y}{E_x}=-C\frac{e^2}{h}.
$$

となります。$j_x=\sigma_{xy}E_y$ によって $\sigma_{xy}$ を定義すれば、$\sigma_{xy}=C e^2/h$ です。Berry 接続の定義に使う符号を反転すれば、表示される $C$ の符号も反転します。両方の規約を明示すれば、記法だけに由来する符号の食い違いを避けられます。

## 具体的な Chern 絶縁体

2 次元の各パネルでは、Qi–Wu–Zhang 型の格子 Hamiltonian

$$
H(\mathbf k)
=A\sin k_x\,\sigma_x
-\lambda\sin k_y\,\sigma_y
+(m+\cos k_x+\cos k_y)\sigma_z.
$$

を用います。運動量と格子定数は無次元とし、各 cosine 項の係数をエネルギー単位に選びます。$d_y$ の負号が、この記事全体で用いる向きを固定します。ギャップ閉鎖点を除けば、占有バンドの Chern 数は

$$
C=
\begin{cases}
0, & m<-2,\\
\operatorname{sgn}(A\lambda), & -2<m<0,\\
-\operatorname{sgn}(A\lambda), & 0<m<2,\\
0, & m>2.
\end{cases}
$$

です。最初の可視化では、正方形の Brillouin zone の各点を $\hat{\mathbf d}$ の向きで着色し、球面上の像にも同じ色を使います。この色は写像を可視化する符号化であって、Berry 曲率のカラースケールではありません。局所的な曲率は別の数値として表示されます。

### 可視化：Brillouin torus から球面への写像

<iframe src="app/index.html?panel=map&amp;lang=ja" title="2 バンド Chern 絶縁体の Brillouin torus から Bloch 球への写像" data-auto-height scrolling="no" style="display: block; width: 100%; height: 880px; min-height: 680px; border: 0; overflow: hidden;" loading="eager"></iframe>

Brillouin zone 上でポインターを動かし、選択点と球面上の矢印を比較してください。次に $m=-2.6$, $-1$, $+1$, $+2.6$ を試します。2 つのトポロジカル区間では点群が球面全体に達しますが、自明な区間では向き付き被覆数がゼロです。$\lambda$ の符号を反転すると、エネルギースペクトルを変えずに写像の向き、したがってゼロでない Chern 数の符号だけを反転できます。

臨界パラメーターでは、1 つ以上の運動量で $\mathbf d=0$ となります。その点では単位ベクトルも占有バンドの射影演算子も定義できません。球面写像に現れる穴や特異点は、孤立バンドのトポロジーが定義できなくなったことを示す物理的な警告です。

## 整数が変わるにはギャップ閉鎖が必要

$\mathbf d(\mathbf k)$ がゼロにならない限り、Hamiltonian のパラメーターを変えても写像 $T^2\to S^2$ は連続的に変形されるだけです。連続写像の次数は連続的には変化できません。整数が $+1$ から $0$ へ徐々に移ることはないため、相転移には

$$
\Delta=2\min_{\mathbf k}|\mathbf d(\mathbf k)|=0.
$$

が必要です。この模型では、4 つの時間反転不変運動量で $d_x=d_y=0$ となり、それぞれの質量項は

$$
d_z(\Gamma)=m+2,
\qquad
d_z(X)=d_z(Y)=m,
\qquad
d_z(M)=m-2.
$$

です。したがって、$m=-2$ では $\Gamma=(0,0)$、$m=0$ では $X=(\pi,0)$ と $Y=(0,\pi)$ が同時に、$m=2$ では $M=(\pi,\pi)$ でギャップが閉じます。$m=0$ の二重閉鎖は本質的です。$A\lambda>0$ のとき Chern 数は $+1$ から $-1$ へ変わり、その跳びは $-2$ だからです。

各閉鎖点 $\mathbf K_i$ の近くでは、Hamiltonian は質量を持つ Dirac Hamiltonian

$$
H_i(\mathbf K_i+\mathbf q)
\simeq v_{x,i}q_x\sigma_x+v_{y,i}q_y\sigma_y+M_i\sigma_z.
$$

になります。各 Dirac cone の連続体としての半整数寄与は、質量の符号が変わると変化します。格子上ではすべての cone が一緒に現れるため、その総和は整数です。$s=\operatorname{sgn}(A\lambda)$ とおけば、寄与を合わせた結果は

$$
C=\frac{s}{2}
\left[\operatorname{sgn}(m+2)-2\operatorname{sgn}(m)+\operatorname{sgn}(m-2)\right],
\qquad m\ne-2,0,2.
$$

となります。

### 可視化：バンド閉鎖と相の並び

<iframe src="app/index.html?panel=transition&amp;lang=ja" title="QWZ バンドのギャップ閉鎖と占有バンド Chern 数の転移" data-auto-height scrolling="no" style="display: block; width: 100%; height: 770px; min-height: 620px; border: 0; overflow: hidden;" loading="eager"></iframe>

$m$ を各臨界値の前後でゆっくり動かすか、相と閉鎖点の preset を使ってください。$m=0$ では、表示経路上の X と Y の 2 か所で接触が起こります。高対称線上のプロットだけでは 2 次元バルクギャップの証明になりません。ギャップの数値は Brillouin zone 全体の格子を走査し、解析的に既知の臨界点は厳密に扱っています。エネルギーは連続に変わる一方、$C$ は閉鎖点で区切られた各開区間で一定に保たれることにも注目してください。

## 1 次元の類例：SSH winding

境界を論じる前に、トポロジーを 1 次元下げて考えると仕組みが見やすくなります。Su–Schrieffer–Heeger 模型は、各単位胞に 2 サイト $A,B$、単位胞内ホッピング $t_1$、単位胞間ホッピング $t_2$ を持ちます。基底 $(A,B)$ では

$$
H_{\mathrm{SSH}}(k)
=\begin{pmatrix}
0&t_1+t_2e^{-ik}\\
t_1+t_2e^{ik}&0
\end{pmatrix}
=d_x(k)\sigma_x+d_y(k)\sigma_y,
$$

であり、$d_x=t_1+t_2\cos k$、$d_y=t_2\sin k$ です。$\sigma_z$ 項がないため

$$
\{\sigma_z,H_{\mathrm{SSH}}(k)\}=0.
$$

という chiral 対称性が成り立ち、スペクトルは $\pm E$ の対になります。$q(k)=d_x+i d_y=t_1+t_2e^{ik}$ と定めると、バルク不変量は原点まわりの $q(k)$ の winding

$$
\nu=\frac{1}{2\pi i}\int_{-\pi}^{\pi}q^{-1}(k)\,\partial_kq(k)\,dk
=\frac{1}{2\pi}\int_{-\pi}^{\pi}\partial_k\arg q(k)\,dk.
$$

です。実数かつ正のホッピングでは、$q(k)$ は $(t_1,0)$ を中心とする半径 $t_2$ の円を描きます。$t_1<t_2$ なら原点を囲んで $\nu=1$、$t_1>t_2$ なら囲まず $\nu=0$ です。$t_1=t_2$ では円が $k=\pi$ で原点を通り、バンドギャップ

$$
\Delta_{\mathrm{SSH}}=2|t_1-t_2|
$$

が閉じます。整合する gauge では、占有バンドの Zak 位相は $\gamma=\pi\nu\pmod{2\pi}$ を満たします。

### 可視化：バンド分散と winding circle

<iframe src="app/index.html?panel=winding&amp;lang=ja" title="SSH バンド分散と Bloch Hamiltonian の winding" data-auto-height scrolling="no" style="display: block; width: 100%; height: 800px; min-height: 640px; border: 0; overflow: hidden;" loading="eager"></iframe>

$t_1/t_2$ を 1 より小さく、ちょうど 1 に、1 より大きく設定してください。左側では、バンドが接触するのは臨界比だけです。右側では、同じ出来事が閉曲線と原点の交差として現れます。バンド図上で $k$ に沿って動かすと winding circle 上の対応点も動き、2 つの図が同じ Bloch Hamiltonian を異なる形で読んだものであることが分かります。

## 開放 SSH 鎖のバルク・エッジ対応

ここで、上と同じ単位胞が整数個並ぶように 1 次元結晶を切ります。開放鎖の Hamiltonian は

$$
H_{\mathrm{open}}
=\sum_{n=1}^{N}t_1|n,A\rangle\langle n,B|
+\sum_{n=1}^{N-1}t_2|n+1,A\rangle\langle n,B|
+\mathrm{h.c.}
$$

です。トポロジカル領域 $|t_1/t_2|<1$ では、半無限鎖の左端に $A$ 副格子上のゼロモード、右端に $B$ 副格子上のゼロモードがあります。その振幅は

$$
\psi_L(n,A)\propto\left(-\frac{t_1}{t_2}\right)^{n-1},
\qquad
\psi_R(n,B)\propto\left(-\frac{t_1}{t_2}\right)^{N-n},
\qquad
\xi^{-1}=\ln\left|\frac{t_2}{t_1}\right|.
$$

のように減衰します。バルク相転移へ近づくと局在長 $\xi$ は発散します。有限鎖では左右から指数関数的に減衰する tail が重なるため、名目上のゼロモードは $\pm\varepsilon$ の chiral 対へ混成します。分裂は鎖長に対して指数関数的に小さくなりますが、$t_1=0$ の切断 dimer 極限または $N\to\infty$ を除けば厳密なゼロではありません。

### 可視化：スペクトルフローと中央 2 状態

<iframe src="app/index.html?panel=edge&amp;lang=ja" title="有限 SSH 鎖のスペクトルフローと端状態の確率分布" data-auto-height scrolling="no" style="display: block; width: 100%; height: 760px; min-height: 620px; border: 0; overflow: hidden;" loading="eager"></iframe>

$t_1/t_2=0$ から始めてください。中央 2 準位は厳密にゼロで、確率は端サイトだけにあります。比を 1 に近づけると、2 準位が分裂し、端の重みが減少して、分布が鎖の内側まで浸透します。1 を超えると、中央準位はバルクスペクトルへ合流します。分布図は中央 2 固有状態の確率密度を平均しています。有限鎖の固有ベクトルが左右に局在した状態の対称・反対称結合であっても、この表示なら両端を対称に観察できます。

## 4 つの図が示すことと、示さないこと

- QWZ 写像は、2 次元占有バンドの射影演算子がゼロでない Chern 数を持つ仕組みを示します。高対称線上のバンド図にはこの模型で既知の閉鎖点が現れますが、一般の模型では高対称線以外でギャップが閉じることもあります。

- SSH の winding と端状態パネルは、別の 1 次元 chiral 模型におけるバルク・エッジ対応を示します。バルク不変量が境界状態を予言する仕組みは明確になりますが、2 次元 Chern 絶縁体の端を分散する chiral edge band は表示していません。

- SSH の winding は指定した単位胞に依存し、見える端状態は対応する弱い結合で系を切ることに依存します。単位胞をずらすと終端も同時にずれるので、物理的予言は整合したままです。

- 計算対象は、不純物のない、相互作用を持たない、半充填の格子模型です。disorder、相互作用、有限温度、lead、動的輸送は含みません。Hall 応答の式は、孤立バンドが完全に占有され、断熱的な線形応答領域にあることを仮定します。

## 探索例

1. 球面写像で $m=-1$ を保ったまま $\lambda$ を反転し、エネルギーギャップが変わらず $C$ の符号だけが変わることを確かめます。

2. 相転移パネルで、$m=-2$ の 1 点閉鎖と $m=0$ の 2 点同時閉鎖を比較し、cone の個数と向きを $C$ の跳びに対応づけます。

3. SSH winding パネルで $t_1/t_2=1$ へ両側から近づき、最小バンドギャップと winding circle から原点までの距離を追います。

4. 有限鎖で $t_1/t_2=0.45$, $0.9$, $1.45$ を比較し、実空間局在の変化を $\xi^{-1}=\ln|t_2/t_1|$ およびスペクトルフローと結びつけます。

## 参考文献

- D. J. Thouless, M. Kohmoto, M. P. Nightingale, and M. den Nijs, “Quantized Hall Conductance in a Two-Dimensional Periodic Potential,” *Physical Review Letters* **49**, 405 (1982), [doi:10.1103/PhysRevLett.49.405](https://doi.org/10.1103/PhysRevLett.49.405).
- X.-L. Qi, Y.-S. Wu, and S.-C. Zhang, “Topological Quantization of the Spin Hall Effect in Two-Dimensional Paramagnetic Semiconductors,” *Physical Review B* **74**, 085308 (2006), [doi:10.1103/PhysRevB.74.085308](https://doi.org/10.1103/PhysRevB.74.085308).
- W. P. Su, J. R. Schrieffer, and A. J. Heeger, “Solitons in Polyacetylene,” *Physical Review Letters* **42**, 1698 (1979), [doi:10.1103/PhysRevLett.42.1698](https://doi.org/10.1103/PhysRevLett.42.1698).
