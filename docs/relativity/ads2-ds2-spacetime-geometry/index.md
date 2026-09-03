# AdS₂ and dS₂ Spacetime Geometry

Anti-de Sitter and de Sitter spacetimes are the maximally symmetric Lorentzian geometries of
negative and positive curvature. In two dimensions they can be displayed as quadrics in a
three-dimensional ambient space, making coordinate patches and geodesics concrete. A separate
conformal diagram is needed to read their causal structure correctly.

## Visualization

<iframe src="app/index.html?lang=en" title="AdS2 and dS2 ambient embeddings, coordinate patches, geodesics, and conformal diagrams" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1900px; min-height: 1250px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Ambient-space definitions

Let the spacetime dimension be $D=d+1$ and the curvature radius be $L>0$. Anti-de Sitter
spacetime is the quadric in $\mathbb R^{2,d}$

$$
-X_{-1}^2-X_0^2+\sum_{i=1}^{d}X_i^2=-L^2,
$$

whereas de Sitter spacetime is the quadric in $\mathbb R^{1,d+1}$

$$
-X_0^2+\sum_{i=1}^{d+1}X_i^2=L^2.
$$

The metrics on AdS and dS are induced from these indefinite ambient metrics. With
$\varepsilon=-1$ for AdS and $\varepsilon=+1$ for dS, the sign convention is

$$
R^\rho{}_{\sigma\mu\nu}
=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}
+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}
-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma},
$$

and therefore

$$
R_{\mu\nu\rho\sigma}
=\frac{\varepsilon}{L^2}
\left(g_{\mu\rho}g_{\nu\sigma}-g_{\mu\sigma}g_{\nu\rho}\right),
\qquad
R=\frac{\varepsilon d(d+1)}{L^2}.
$$

The visualization specializes the surfaces to $d=1$, so $R=-2/L^2$ for AdS₂ and $R=+2/L^2$
for dS₂.

The displayed axes are ordinary screen coordinates for the ambient components. Their Euclidean
lengths and angles do not determine causal type. A tangent $U$ is timelike, null, or spacelike
according to whether its ambient norm is negative, zero, or positive.

## AdS₂ coordinate systems

For global AdS₂ coordinates, the embedding is

$$
X_{-1}=L\cosh\rho\cos\tau,
\qquad
X_0=L\cosh\rho\sin\tau,
\qquad
X_1=L\sinh\rho,
$$

and the induced metric is

$$
ds^2=L^2\left(-\cosh^2\rho\,d\tau^2+d\rho^2\right).
$$

On the embedded quadric, $\tau$ is periodic and closed timelike curves are present. The spacetime
normally called AdS is its universal cover, obtained by unwrapping $\tau$.

The Poincaré patch uses $z>0$ and

$$
X_{-1}=\frac{L^2+z^2-t^2}{2z},
\qquad
X_0=\frac{Lt}{z},
\qquad
X_1=\frac{L^2-z^2+t^2}{2z},
$$

which gives

$$
ds^2=\frac{L^2}{z^2}\left(-dt^2+dz^2\right).
$$

This chart covers only one region of global AdS. The limit $z\to0$ approaches its conformal
boundary, while $z\to\infty$ approaches the Poincaré horizon.

## dS₂ coordinate systems

Global dS₂ coordinates cover the complete hyperboloid:

$$
X_0=L\sinh(\tau/L),
\qquad
X_1=L\cosh(\tau/L)\cos\theta,
\qquad
X_2=L\cosh(\tau/L)\sin\theta,
$$

with metric

$$
ds^2=-d\tau^2+L^2\cosh^2(\tau/L)\,d\theta^2.
$$

The expanding flat patch instead has

$$
ds^2=-dt^2+e^{2t/L}dx^2,
$$

and covers only one planar half of global dS₂. The static patch adapted to one inertial observer
has

$$
ds^2=-\left(1-\frac{r^2}{L^2}\right)dt_s^2
+\frac{dr^2}{1-r^2/L^2},
\qquad |r|<L.
$$

Its boundaries $|r|=L$ are cosmological horizons. They limit what the central observer can both
influence and receive signals from.

## Local frames and geodesics

At every selected point, the visualization constructs an orthonormal pair $(e_0,e_1)$ tangent
to the quadric, with

$$
e_0\mathbin{\cdot}e_0=-1,
\qquad
e_1\mathbin{\cdot}e_1=+1,
\qquad
e_0\mathbin{\cdot}e_1=0.
$$

A local Lorentz boost of rapidity $\chi$ acts as

$$
e'_0=\cosh\chi\,e_0+\sinh\chi\,e_1,
\qquad
e'_1=\sinh\chi\,e_0+\cosh\chi\,e_1.
$$

The null directions $e'_0\pm e'_1$ remain null. The three emphasized geodesics are intersections
of the quadric with suitable two-planes through the ambient origin. Their timelike, null, and
spacelike labels come from the induced Lorentzian metric, not their visual curvature on screen.

## Conformal diagrams

For AdS₂, define $\tan\sigma=\sinh\rho$. The global metric becomes

$$
ds^2=\frac{L^2}{\cos^2\sigma}
\left(-d\tau^2+d\sigma^2\right),
\qquad
-\frac{\pi}{2}<\sigma<\frac{\pi}{2}.
$$

After omitting the conformal factor, the universal cover is a vertical strip. Its two boundaries
are timelike, so signals can reach the boundary and return in finite global coordinate time.

For dS₂, define $\tan\eta=\sinh(\tau/L)$. Then

$$
ds^2=\frac{L^2}{\cos^2\eta}
\left(-d\eta^2+d\theta^2\right),
\qquad
-\frac{\pi}{2}<\eta<\frac{\pi}{2}.
$$

The past and future conformal boundaries are spacelike. The shaded diamond is one static patch;
its diagonal edges are cosmological horizons.

## Suggested explorations

1. Compare global and Poincaré coordinates on AdS₂. Follow the selected point and identify which
   part of the quadric the Poincaré patch covers.

2. Compare the global, flat, and static charts on dS₂. Notice that changing charts changes the
   coordinate grid, not the underlying hyperboloid.

3. Vary the rapidity $\chi$. Check that the orthonormal frame changes while its two null
   directions retain the same causal character.

4. Compare the ambient plot with the conformal diagram. In particular, do not infer horizons or
   the causal character of infinity from the Euclidean appearance of the 3D surface.

## Conventions and limitations

The ambient component order in the implementation is $(X_0,X_1,X_2)$. For readability, the
Plotly axes display $(X_1,X_2,X_0)$. The AdS₂ ambient signature is $(-,+,-)$ and the dS₂ signature
is $(-,+,+)$.

The 3D plot necessarily draws an indefinite-metric geometry on a Euclidean screen. It shows the
embedding constraint and coordinate placement, but it does not preserve Lorentzian lengths or
angles. The AdS₂ surface overlaps itself when interpreted as the universal cover; only the
conformal panel unwraps global time.

In two dimensions the Einstein tensor vanishes identically. These spaces are treated here as
constant-curvature Lorentzian manifolds; the usual higher-dimensional vacuum Einstein equation
does not by itself determine their curvature radius.

AdS geometry is central to holography and string theory, which is why this page is also linked
from the String Theory section. The visualization does not model strings, branes, a boundary
CFT, or an AdS/CFT dictionary.

## References

- S. M. Carroll, *Spacetime and Geometry*.
- R. M. Wald, *General Relativity*.
- M. Ammon and J. Erdmenger, *Gauge/Gravity Duality*.
