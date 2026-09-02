# 宇宙の因果構造

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

で定義します。この可視化では $c\eta$ を Gpc 単位で測るため、動径方向の null ray は

$$
\frac{d\chi}{d(c\eta)}=\pm1.
$$

を満たします。宇宙時と共形時間、または共動距離と固有距離の間で座標を変えると、ページ上の
曲線の形は変わります。しかし、どの事象が光で結ばれるかは変わりません。

## インタラクティブ可視化

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

です。これは仮定した将来の膨張に依存します。この可視化では宇宙定数が将来も変化しないと仮定
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
事象の地平線も宇宙定数背景の無限の将来を仮定するためモデル依存です。
