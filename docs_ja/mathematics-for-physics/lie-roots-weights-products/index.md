# リー代数のルート・ウェイト・テンソル積

## 数学的背景

コンパクト半単純リー代数の有限次元表現は、ウェイトによって整理できます。この可視化は、
支配的整最高ウェイトから内部ウェイトの多重度を含む完全なウェイト図を構成し、テンソル積の
指標を既約成分へ分解します。

## インタラクティブ可視化

<iframe
  src="app/index.html?lang=ja"
  title="リー代数のルート、ウェイト、テンソル積のインタラクティブ可視化"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1120px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## 試してみること

1. $B_2$ と $C_2$ を比較し、長ルート・短ルートの規約のもとでルート系が双対になることを確認します。
2. 基本ウェイトを表示し、各 $\omega_i$ が対応する単純コルートと双対になることを確認します。
3. $A_2$ の随伴表現 $(1,1)$ を選び、零ウェイトの多重度を調べます。
4. $A_2$ の $\mathbf{3}\otimes\mathbf{3}\otimes\mathbf{3}$ を段階的に進め、残余指標がゼロになる様子を観察します。
5. $B_3$ のスピノル表現のテンソル平方を、4つの既約成分の次元と比較します。

## 規約と制限

表示座標で最初に現れる非零成分が正であるルートを正ルートとします。単純ルートは分解不能な
正ルートであり、標準的なカルタン型を保つ順序で並べます。規約は

$$
A_{ij}=\langle\alpha_i,\alpha_j^\vee\rangle
$$

です。したがって $B_r$ の最後の単純ルートは短く、$C_r$ の最後の単純ルートは長くなります。
$G_2$ では $\alpha_1$ を短ルートとし、カルタン行列は

$$
\begin{pmatrix}2&-1\\-3&2\end{pmatrix}
$$

です。

最高ウェイト・エクスプローラーではディンキンラベルの各成分を0から3まで事前計算しています。
テンソル積エクスプローラーでは、公開アプリケーションを静的かつ応答性の高いものに保ち、
Pythonサーバーを不要にするため、小さな表現を選んで収録しています。これらは計算上の安全域であり、
数学的な制限ではありません。

## 参考文献

- J. E. Humphreys, *Introduction to Lie Algebras and Representation Theory*.
- W. Fulton and J. Harris, *Representation Theory: A First Course*.
