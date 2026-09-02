# 宇宙の因果構造

## 座標と因果構造

空間的に平坦な Friedmann–Lemaître–Robertson–Walker（FLRW）時空では、動径方向の計量は

$$
ds^2=-c^2dt^2+a(t)^2d\chi^2
$$

と書けます。ここで、共動動径座標 $\chi$ は 宇宙膨張に対する固有運動をもたない共動観測者に対して一定です。

共動座標 $\chi$ が一定の観測者までの、時刻 $t$ における固有距離は

$$
D(t)=a(t)\chi
$$

で与えられます。

一方、共形時間 $\eta$ を

$$
d\eta=\frac{dt}{a(t)}
$$

によって定義すると、動径方向に進む光線（null ray）は

$$
\frac{d\chi}{d(c\eta)}=\pm1
$$

を満たします。この visualization では $c\eta$ を Gpc 単位で表示します。

宇宙時 $t$ と共形時間 $\eta$、あるいは共動距離 $\chi$ と固有距離 $D$ の間で座標を変換すると、図上での光線や地平線の形は変化します。しかし、どの事象どうしが光によって因果的に結ばれ得るかという因果構造そのものは変わりません。

## Visualization

<iframe src="app/index.html?lang=ja" title="4通りの座標で表した宇宙の因果構造" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1420px; min-height: 1180px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 探索例

1. まず、Hot Big Bang のみを含む宇宙史と線形時間表示を選びます。共動距離–共形時間パネルでは直線となる null ray が、ほかの3つの座標表示でどのように曲がって見えるかを比較してください。

2. 次に、時間軸を対数表示に切り替えます。距離軸を変えることなく、再結合期や放射優勢期などの初期宇宙を詳しく見ることができます。Hot Big Bang のみを表示する場合、各時間軸の下限は、それぞれの単位系で $10^{-12}$ としています。

3. 時間軸を線形表示に戻し、インフレーションを含む宇宙史を選びます。宇宙時や固有距離を用いた表示では、インフレーション期が強く圧縮されることを確認できます。

4. インフレーションを含めたまま時間軸を対数表示にします。この visualization で採用している共形時間の原点では、インフレーション期は $c\eta<0$ に位置するため、共形時間パネルでは符号付き対数表示を用いています。

5. 最終散乱面上の互いに反対方向にある2点から、過去に向かって伸びる青色の光線を追ってください。インフレーションを含むモデルでは、この2本の過去光円錐の交点がインフレーション期の内部に現れます。

左上のパネルでは、横軸に共動距離、縦軸に共形時間を用いています。この座標では null ray の傾きが常に $\pm1$ となるため、因果関係を最も直接的に読み取ることができます。

固有距離を用いると、同じ共動距離に対して $D=a(t)\chi$ とスケール因子が掛かるため、宇宙膨張の影響によって光線の軌跡は曲線になります。また、宇宙時をそのまま用いる表示では、長く続く後期宇宙が相対的に引き伸ばされる一方、初期宇宙は強く圧縮されます。

橙色の曲線は、共動 Hubble 半径

$$
\frac{c}{aH}
$$

を表します。これは放射優勢期や物質優勢期にはおおむね増大しますが、$H$ が一定の de Sitter 型インフレーションでは

$$
\frac{c}{aH}\propto a^{-1}
$$

となり、時間とともに減少します。

この性質は、宇宙論的摂動の Fourier モードがインフレーション中に Hubble 半径の外へ出て、その後の宇宙膨張の過程で再び内側へ入る、いわゆる horizon exit と horizon re-entry を理解するうえで重要です。ただし、Hubble 半径そのものは、光の伝播を時間方向に積分して定義される因果的地平線ではありません。

## 粒子的地平線・事象の地平線・Hubble 半径

Hot Big Bang から始まる宇宙史では、粒子的地平線の共動距離は

$$
\chi_{\mathrm p}(t)
=
c\int_0^t\frac{dt'}{a(t')}
=
c\eta(t)
$$

です。これは、モデルを Hot Big Bang の始点まで外挿したとき、宇宙の始まりから時刻 $t$ までの間に観測者へ信号を届けることができた最大の共動距離を表します。

インフレーション期を含む場合には、積分の下限を、この toy model における宇宙史の開始時刻に置き換えます。このとき

$$
\chi_{\mathrm p}(t)
=
c\left[\eta(t)-\eta_{\mathrm{start}}\right]
$$

となります。

一方、事象の地平線は

$$
\chi_{\mathrm e}(t)
=
c\int_t^\infty\frac{dt'}{a(t')}
=
c\left[\eta_\infty-\eta(t)\right]
$$

で定義されます。これは、時刻 $t$ に放たれた信号が無限の未来までに到達できる最大共動距離を表す量であり、宇宙の将来の膨張史に依存します。この visualization では、宇宙定数が将来にわたって一定であると仮定しています。

これらに対して、共動 Hubble 半径

$$
\chi_H(t)=\frac{c}{a(t)H(t)}
$$

は、その時刻における局所的な膨張率によって決まる長さスケールです。$\chi_{\mathrm p}$ や $\chi_{\mathrm e}$ とは異なり、過去または未来への光の伝播を積分して定義される因果的地平線ではありません。

## インフレーションと CMB の horizon problem

Reheating 後の背景宇宙には、空間的に平坦な「放射 + 圧力なし物質 + 宇宙定数」の宇宙モデル

$$
\frac{H(a)^2}{H_0^2}
=
\Omega_r a^{-4}
+
\Omega_m a^{-3}
+
\Omega_\Lambda
$$

を用います。

インフレーションを含む設定では、その前に $62$ e-fold 続く有限の de Sitter 期を付け加えます。この期間では $H$ を一定とし、$a_{\mathrm{reh}}=10^{-28}$ で終了するものとします。また、reheating の時点で $H$ が連続になるように、後続するHot Big Bang 宇宙へ接続します。

de Sitter 期では

$$
\frac{c}{aH}\propto a^{-1}
$$

であるため、共動 Hubble 半径はインフレーションの進行とともに縮小します。

現在の観測者から最終散乱面までの共動距離を $\chi_{\mathrm{LSS}}$、再結合時の共形時間を $\eta_{\mathrm{rec}}$ とします。最終散乱面上の互いに反対方向にある2点から過去へたどった光線が最初に交わる共形時間は

$$
c\eta_{\mathrm{int}}
=
c\eta_{\mathrm{rec}}
-
\chi_{\mathrm{LSS}}
$$

です。

Hot Big Bang のみを含む宇宙史では、この値は負となり、$c\eta\geq0$ としたモデルの領域外に位置します。したがって、このモデルの範囲内では、CMB の対向する領域は共通の因果的過去を持ちません。これが CMB の horizon problem の幾何学的な表現です。

一方、有限のインフレーション期を過去側に付け加えると、宇宙史は十分に負の共形時間まで延長され、この交点をモデル内部に含めることができます。したがって、Hot Big Bang 宇宙だけを外挿すると因果的に分離して見える CMB の領域も、reheating より前には共通の因果的過去を持つことが可能になります。

## モデルの設定

数値計算には

$$
H_0
=
67.4\ \mathrm{km\,s^{-1}\,Mpc^{-1}},
\qquad
(\Omega_r,\Omega_m,\Omega_\Lambda)
=
(9.2\times10^{-5},\,0.315,\,0.684908)
$$

を用い、再結合の赤方偏移を

$$
z_{\mathrm{rec}}=1099
$$

としています。

図に表示する CMB の光線は photon の null ray であり、baryon–photon 流体中を伝わる音波の sound horizon を表すものではありません。また、ここでいう固有距離は、選択した FLRW の一定宇宙時超曲面上で定義される空間距離であり、任意の2事象の間に定義される座標不変な距離ではありません。

ここで用いるインフレーション期は、因果構造を visualization するための単純化された toy model です。Hot Big Bang 宇宙への瞬間的な接続は、reheating の microphysics、インフレーションの開始機構、slow-roll dynamics、あるいは原始揺らぎの生成と振幅を記述するものではありません。

同様に、事象の地平線の位置も、宇宙定数が一定のまま無限の未来まで宇宙膨張を支配し続けるという仮定に依存しており、モデル依存の量であることに注意が必要です。


<!-- # 宇宙の因果構造

## 物理的な考え方

空間的に平坦な Friedmann–Lemaître–Robertson–Walker 時空では、計量の動径部分は

$$
ds^2=-c^2dt^2+a(t)^2d\chi^2.
$$

で与えられます。共動動径座標 $\chi$ は Hubble 流とともに運動する観測者について一定です。
同じ観測者までの一定宇宙時超曲面上の固有距離は

$$
D(t)=a(t)\chi.
$$

です。共形時間は

$$
d\eta=\frac{dt}{a(t)}.
$$

で定義します。この visualization では $c\eta$ を Gpc 単位で測るため、動径方向の null ray は

$$
\frac{d\chi}{d(c\eta)}=\pm1.
$$

を満たします。宇宙時と共形時間、または共動距離と固有距離の間で座標を変えると、ページ上の
曲線の形は変わります。しかし、どの事象が光で結ばれるかは変わりません。

## インタラクティブ visualization

<iframe src="app/index.html?lang=ja" title="4通りの座標で表した宇宙の因果構造" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1420px; min-height: 1180px; border: 0; overflow: hidden;" loading="eager"></iframe>

## 探索例

1. hot Big Bang 履歴と線形時間から始めます。共動距離・共形時間パネルで直線となる null ray が、
   他の3パネルでどのような曲線になるかを比較します。
2. 時間の対数表示を有効にします。距離軸を変えずに再結合期と放射優勢期を確認できます。
   hot Big Bang 表示では、それぞれの時間軸の表示下限を単位系ごとの $10^{-12}$ とします。
3. 時間を線形に戻したまま inflation を含めます。宇宙時と固有距離では inflation 期が強く圧縮
   されることを確認します。
4. inflation を含めたまま時間を対数表示にします。選んだ共形時間原点では inflation が
   $c\eta<0$ にあるため、共形時間パネルには符号付き対数を使います。
5. 最終散乱面上の対向点から過去へ向かう2本の青線を追います。inflation を含めると、その最初の
   交点は有限な inflation 期の内部に入ります。

## 注目する点

左上のパネルは共動距離と共形時間を使います。この座標では null ray の傾きが $\pm1$ となるため、
因果関係を最も直接に読み取れます。固有距離では同じ共動距離に $a(t)$ が掛かるので、空間超曲面の
膨張によって表示曲線が曲がります。宇宙時は後期宇宙を引き伸ばし、初期宇宙を圧縮します。

橙色の曲線は共動 Hubble 半径 $c/(aH)$ です。放射優勢期と物質優勢期にはおおむね成長しますが、
一定 $H$ の inflation 期には縮小します。この振る舞いは摂動モードの horizon exit と re-entry を
説明しますが、Hubble 半径自体は積分的な因果的地平線ではありません。

緑の交点マーカーは inflation を含むモデルでのみ現れます。null ray の幾何を隠さないよう、名称は
凡例にだけ表示します。

## 表示する地平線

hot Big Bang 履歴の粒子的地平線は

$$
\chi_{\mathrm p}(t)=c\int_0^t\frac{dt'}{a(t')}=c\eta(t).
$$

です。これはモデルを hot Big Bang 境界まで外挿したとき、時刻 $t$ までに信号が観測者へ到達
できる最大共動距離です。有限な inflation を含めた場合、積分下限は表示する toy model の開始点へ
変わります：

$$
\chi_{\mathrm p}(t)=c\left[\eta(t)-\eta_{\mathrm start}\right].
$$

事象の地平線は

$$
\chi_{\mathrm e}(t)=c\int_t^\infty\frac{dt'}{a(t')}
=c\left[\eta_\infty-\eta(t)\right].
$$

です。これは仮定した将来の膨張に依存します。この visualization では宇宙定数が将来も変化しないと仮定
します。共動 Hubble 半径は局所的な膨張スケール

$$
\chi_H(t)=\frac{c}{a(t)H(t)}.
$$

です。$\chi_{\mathrm p}$ や $\chi_{\mathrm e}$ と異なり、過去または未来への光の伝播を積分して
定義する量ではありません。

## Inflation と CMB horizon problem

reheating 後の背景には、空間的に平坦な放射 + 圧力なし物質 + 宇宙定数モデル

$$
\frac{H(a)^2}{H_0^2}
=\Omega_r a^{-4}+\Omega_m a^{-3}+\Omega_\Lambda.
$$

を使います。inflation のオプションは、$62$ e-fold の有限な一定 $H$ de Sitter 期を前置します。
$a_{\mathrm{reh}}=10^{-28}$ で終了し、reheating において $H$ が連続となるよう接続します。この期間は

$$
\frac{c}{aH}\propto a^{-1}.
$$

です。$\chi_{\mathrm{LSS}}$ を現在から最終散乱面までの共動距離、$\eta_{\mathrm{rec}}$ を再結合時の
共形時間とします。CMB 対向点から内向きに遡る過去光線が最初に交わる時刻は

$$
c\eta_{\mathrm{int}}
=c\eta_{\mathrm{rec}}-\chi_{\mathrm{LSS}}.
$$

です。hot Big Bang 解ではこの値は負となり、$c\eta\geq0$ の領域外にあります。有限な inflation
による拡張は負の共形時間側へ十分遠く達するため、この交点を含みます。したがって hot Big Bang
外挿では分離して見える領域も、reheating より前に共通の因果的過去をもち得ます。

## 規約と制限

数値計算には

$$
H_0=67.4\ \mathrm{km\,s^{-1}\,Mpc^{-1}},
\qquad
(\Omega_r,\Omega_m,\Omega_\Lambda)
=(9.2\times10^{-5},0.315,0.684908).
$$

を使い、再結合を $z_{\mathrm{rec}}=1099$ に置きます。表示する CMB 光線は photon の null ray であり、
baryon–photon sound horizon ではありません。固有距離は選んだ FLRW 一定宇宙時超曲面上の距離で
あり、任意の事象間の座標不変な距離ではありません。

inflation 期は因果構造を調べる toy model です。hot Big Bang 履歴への瞬間的な接続は、reheating
の microphysics、inflation の開始、slow-roll dynamics、原始摂動の振幅を記述しません。また、
事象の地平線も宇宙定数背景の無限の将来を仮定するためモデル依存です。 -->
