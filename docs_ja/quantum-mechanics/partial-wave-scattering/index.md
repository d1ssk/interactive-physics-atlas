# 部分波散乱

## 物理的な考え方

平面波は、散乱中心まわりの角運動量が確定した状態ではありません。平面波は部分波へ
展開できます。

$$
e^{ikz}=\sum_{\ell=0}^{\infty}i^\ell(2\ell+1)j_\ell(kr)P_\ell(\cos\theta)
$$

中心力ポテンシャルでは角運動量が保存され、各チャネルは独立に発展します。弾性散乱は
各チャネルの漸近位相を $\delta_\ell$ だけ変化させます。

$$
S_\ell=e^{2i\delta_\ell},\qquad
f(\theta)=\frac{1}{k}\sum_{\ell=0}^{\infty}(2\ell+1)
e^{i\delta_\ell}\sin\delta_\ell P_\ell(\cos\theta)
$$

全弾性散乱断面積は

$$
\sigma_{\mathrm{tot}}=\frac{4\pi}{k^2}\sum_{\ell=0}^{\infty}
(2\ell+1)\sin^2\delta_\ell
$$

です。

## インタラクティブ可視化

第1パネルでは、角運動量チャネルを一つずつ加えて平面波を構成します。第2パネルでは、
可変Gaussian井戸または障壁に対する動径Schrödinger方程式を解きます。計算はブラウザ内の
Pythonで実行され、表示データは事前生成したアニメーションフレームではありません。

<iframe
  src="app/index.html?lang=ja"
  title="部分波散乱のインタラクティブ可視化"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1200px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## 試してみること

1. 平面波パネルの $\ell_{\max}$ を増やし、次のチャネルと更新後の和を比較する。
2. 引力井戸と斥力障壁を切り替え、低い $\ell$ の位相シフトの符号を観察する。
3. 散乱チャネルを加え、全波動場と散乱波のみの表示を比較する。
4. 共鳴チャネルを切り替え、$\sin^2\delta_\ell$ が1に近づくエネルギーを探す。

## 注目する点

波長がポテンシャルの到達距離より長いときは、低い角運動量が支配的です。高い $\ell$ の
チャネルは遠心力障壁によって抑制されます。$\pi$ を法として $\delta_\ell=\pi/2$ の近傍では、
そのチャネルが弾性ユニタリティ上限に近づき、外向き散乱場に強い角度依存性が現れます。

## 規約と制限

散乱パネルでは $\hbar^2/(2\mu)=1$、したがって $E=k^2$ とし、入射波は $+z$ 方向へ進みます。
模型ポテンシャルは

$$
U(r)=U_0e^{-(r/a)^2}+U_c e^{-(r/a_c)^4},\qquad
a_c=\max(0.12,0.34a)
$$

です。実数の中心力ポテンシャルによる弾性散乱だけを扱います。二次元場表示では入射波と
外向き波の漸近形を用い、ポテンシャル内部を除外します。選択中の共鳴チャネルについて
表示する内部動径重み比は

$$
\mathcal R_{\mathrm{int}}=
\frac{\int_0^{2a}|u_\ell(r)|^2\,dr}
{\int_0^{2a}|u_\ell^{(0)}(r)|^2\,dr}
$$

です。相互作用波と自由波の外部振幅を同じ規格化にそろえて比較します。1より大きければ、
そのチャネルの動径方向の重みが自由波よりポテンシャル近傍に集中していることを表します。
大きな $\mathcal R_{\mathrm{int}}$ や $\sin^2\delta_\ell\simeq1$ は共鳴散乱の指標になりえますが、
それだけで正エネルギー束縛状態を意味するわけではありません。

## 参考文献

- J. J. Sakurai and J. Napolitano, *Modern Quantum Mechanics*.
- R. G. Newton, *Scattering Theory of Waves and Particles*.
