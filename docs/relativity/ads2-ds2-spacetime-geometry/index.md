# AdS₂ and dS₂ Spacetime Geometry

Anti-de Sitter (AdS) and de Sitter (dS) spacetimes are maximally symmetric Lorentzian spacetimes
with constant negative and positive curvature, respectively. In two dimensions they can be
represented as quadrics in a flat three-dimensional embedding space, making coordinate patches
and geodesics geometrically visible. Conformal diagrams are better suited to studying their
causal structure.

## Visualization

<iframe src="app/index.html?lang=en" title="AdS2 and dS2 ambient embeddings, coordinate patches, geodesics, and conformal diagrams" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1900px; min-height: 1250px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Definitions via embedding spaces

Let the spacetime dimension be $D=d+1$ and the curvature radius be $L>0$. Anti-de Sitter
spacetime is the quadric in $\mathbb R^{2,d}$ whose embedding-space metric is

$$
ds_{\rm emb}^2
=
-dX_{-1}^2-dX_0^2+\sum_{i=1}^{d}dX_i^2
$$

and which satisfies

$$
-X_{-1}^2-X_0^2+\sum_{i=1}^{d}X_i^2=-L^2,
$$

De Sitter spacetime is the quadric in $\mathbb R^{1,d+1}$ whose embedding-space metric is

$$
ds_{\rm emb}^2
=
-dX_0^2+\sum_{i=1}^{d+1}dX_i^2
$$

and which satisfies

$$
-X_0^2+\sum_{i=1}^{d+1}X_i^2=L^2
$$

The metrics on AdS and dS are induced from their respective embedding-space metrics.

Assign $\varepsilon=-1$ to AdS and $\varepsilon=+1$ to dS. With the curvature-tensor sign
convention

$$
R^\rho{}_{\sigma\mu\nu}
=
\partial_\mu\Gamma^\rho_{\nu\sigma}
-\partial_\nu\Gamma^\rho_{\mu\sigma}
+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}
-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}
$$

the curvature is

$$
R_{\mu\nu\rho\sigma}
=
\frac{\varepsilon}{L^2}
\left(
g_{\mu\rho}g_{\nu\sigma}
-g_{\mu\sigma}g_{\nu\rho}
\right),
\qquad
R=\frac{\varepsilon d(d+1)}{L^2}.
$$

The visualization uses $d=1$, so

$$
R_{\mathrm{AdS}_2}=-\frac{2}{L^2},
\qquad
R_{\mathrm{dS}_2}=+\frac{2}{L^2}
$$

The embedding diagram draws the embedding-space coordinates on an ordinary three-dimensional
screen. Euclidean lengths and angles on the screen therefore do not reveal the causal structure
of the spacetime. A tangent vector $U$ is timelike, null, or spacelike according to whether its
norm $U\cdot U$ in the indefinite embedding-space metric is negative, zero, or positive.

## AdS₂ coordinate systems

Global AdS₂ coordinates $(\tau,\rho)$ are related to the embedding coordinates by

$$
X_{-1}=L\cosh\rho\cos\tau,
\qquad
X_0=L\cosh\rho\sin\tau,
\qquad
X_1=L\sinh\rho
$$

The induced metric is

$$
ds^2
=
L^2\left(
-\cosh^2\rho\,d\tau^2+d\rho^2
\right)
$$

On the embedded quadric itself, $\tau$ is periodic and closed timelike curves are present. In
physics, “AdS spacetime” normally means the universal cover obtained by unwrapping this
periodicity.

In the Poincaré patch, take $z>0$ and set

$$
X_{-1}
=
\frac{L^2+z^2-t^2}{2z},
\qquad
X_0=\frac{Lt}{z},
\qquad
X_1
=
\frac{L^2-z^2+t^2}{2z}
$$

The metric is then

$$
ds^2
=
\frac{L^2}{z^2}
\left(
-dt^2+dz^2
\right)
$$

Poincaré coordinates cover only part of global AdS₂. The limit $z\to0$ approaches the
conformal boundary, while $z\to\infty$ approaches the Poincaré horizon.

## dS₂ coordinate systems

Global dS₂ coordinates $(\tau,\theta)$ cover the complete hyperboloid and are given by

$$
X_0=L\sinh(\tau/L),
\qquad
X_1=L\cosh(\tau/L)\cos\theta,
\qquad
X_2=L\cosh(\tau/L)\sin\theta
$$

The induced metric is

$$
ds^2
=
-d\tau^2
+
L^2\cosh^2(\tau/L)\,d\theta^2
$$

In the expanding flat patch,

$$
ds^2
=
-dt^2+e^{2t/L}dx^2
$$

This coordinate system covers only part of global dS₂.

In the static patch centered on a particular inertial observer,

$$
ds^2
=
-\left(1-\frac{r^2}{L^2}\right)dt_s^2
+
\frac{dr^2}{1-r^2/L^2},
\qquad
|r|<L
$$

The surfaces $|r|=L$ are cosmological horizons and form the boundary of the region that can be
causally connected to the central observer.

## Local frames and geodesics

At each selected point, the visualization constructs an orthonormal frame $(e_0,e_1)$ tangent
to the quadric. It satisfies

$$
e_0\cdot e_0=-1,
\qquad
e_1\cdot e_1=+1,
\qquad
e_0\cdot e_1=0
$$

After a local Lorentz boost of rapidity $\chi$,

$$
e'_0
=
\cosh\chi\,e_0+\sinh\chi\,e_1,
\qquad
e'_1
=
\sinh\chi\,e_0+\cosh\chi\,e_1
$$

The null directions $e'_0\pm e'_1$ remain null after the boost.

The displayed timelike, null, and spacelike geodesics arise as intersections of the quadric with
appropriate two-dimensional planes through the origin of the embedding space. Their causal
classification is determined by the induced Lorentzian metric, not by how the curves appear on
the screen.

## Conformal diagrams

In global AdS₂ coordinates, define

$$
\tan\sigma=\sinh\rho
$$

Then

$$
ds^2
=
\frac{L^2}{\cos^2\sigma}
\left(
-d\tau^2+d\sigma^2
\right),
\qquad
-\frac{\pi}{2}<\sigma<\frac{\pi}{2}
$$

After removing the conformal factor $L^2/\cos^2\sigma$, the universal cover of AdS₂ is a
vertical strip. Its left and right conformal boundaries are timelike, and null signals can reach
the boundary in finite global coordinate time.

For dS₂, define

$$
\tan\eta=\sinh(\tau/L)
$$

Then

$$
ds^2
=
\frac{L^2}{\cos^2\eta}
\left(
-d\eta^2+d\theta^2
\right),
\qquad
-\frac{\pi}{2}<\eta<\frac{\pi}{2}
$$

The past and future conformal boundaries of dS₂ are spacelike. The shaded diamond represents one
static patch, and its null edges correspond to cosmological horizons.

## Suggested explorations

1. Switch between global and Poincaré coordinates on AdS₂ and identify the part of the quadric
   covered by the Poincaré patch.

2. Compare global, flat, and static coordinates on dS₂. The coordinate grid changes with the
   coordinate system, but each grid describes the same underlying dS₂ spacetime.

3. Vary the rapidity $\chi$ to examine a Lorentz boost of the local frame. The frame changes,
   while the causal character of the null directions does not.

4. Compare the embedding diagram with the conformal diagram. In particular, distinguish the
   Euclidean appearance on a three-dimensional screen from the causal character of spacetime
   horizons and infinity.
