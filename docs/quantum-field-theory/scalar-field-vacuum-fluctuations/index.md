# Scalar-Field Vacuum Fluctuations

## From zero-point motion to a field configuration

For a free real scalar field, every spatial Fourier mode is a harmonic oscillator. In units
$\hbar=c=1$, its frequency is

$$
\omega_{\mathbf k}=\sqrt{\mathbf k^2+m^2}
$$

The vacuum has no oscillator quanta, but its mode wavefunctions do not collapse to points. With a
standard canonical normalization,

$$
\left\langle |q_{\mathbf k}|^2\right\rangle
=
\frac{1}{2\omega_{\mathbf k}},
\qquad
\left\langle |p_{\mathbf k}|^2\right\rangle
=
\frac{\omega_{\mathbf k}}{2}
$$

Sampling all modes and Fourier transforming produces one field configuration $\phi(\mathbf x)$.
The correct interpretation is a draw from the probability distribution obtained by measuring the
field in the vacuum—not a movie of a literal classical random field filling empty space.

## The two samples in the visualization

The upper row uses a field with two spatial dimensions. The calculation samples the positive
vacuum Wigner distribution for the canonical pair $(\phi,\pi)$ once at $t=0$, then evolves each
free mode as

$$
q_{\mathbf k}(t)
=
q_{\mathbf k}(0)\cos(\omega_{\mathbf k}t)
+
\frac{p_{\mathbf k}(0)}{\omega_{\mathbf k}}
\sin(\omega_{\mathbf k}t)
$$

The complete 2+1-dimensional bulk is therefore one correlated history; its time slices are not
independent samples. For a free Gaussian theory, this construction is statistically equivalent to
drawing the complete real history from its symmetrized, or Hadamard, two-point function. It does
not turn the complex Feynman or Wightman function into an ordinary positive probability measure.

The lower row is an independent equal-time draw with three spatial dimensions. These two Gaussian
measures are genuinely different. In $d$ spatial dimensions their unregulated equal-time
correlation is

$$
C_d(r)
=
\int\frac{d^d k}{(2\pi)^d}
\frac{e^{i\mathbf k\cdot\mathbf r}}{2\sqrt{\mathbf k^2+m^2}}
$$

and, away from $r=0$,

$$
C_2(r)=\frac{e^{-mr}}{4\pi r},
\qquad
C_3(r)=\frac{mK_1(mr)}{4\pi^2r}
$$

Thus a planar slice through a three-dimensional field is not distributed like the vacuum of a
genuinely two-dimensional field. The correlation plot shows the normalized, regulated ensemble
curves for the two measures used here, rather than noisy estimates from the displayed single
realizations.

## Visualization

Both rows show the same realization in two encodings. In the point view, every dot is a lattice
sample, not a particle; color gives the sign of $\phi$ and size gives $|\phi|$. In the surface view,
the orange and cyan boundaries enclose the excursion regions
$\phi>u\sigma$ and $\phi<-u\sigma$, where $\sigma^2=\langle\phi^2\rangle$ for the regulated
ensemble. Changing $u$ changes only this representation and does not resample the field. Rotating
either view in a row rotates its partner to the same camera.

<iframe
  src="app/index.html?lang=en"
  title="Interactive scalar-field vacuum fluctuation visualization"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2450px; min-height: 1300px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Suggested things to try

1. Keep the seed fixed and increase $m$. Compare the change in spatial smoothness with the scale
   $\xi\sim m^{-1}$ and with both correlation curves.
2. Keep $m$ fixed and move the UV window toward the Nyquist scale. Fine structure appears because
   more short-wavelength modes contribute.
3. Move the boundary $u$ without changing the seed. The point values remain fixed while the
   connected components of the positive and negative excursion regions merge or disappear.
4. Generate several realizations with the same parameters. Individual shapes change while the
   ensemble correlation curve remains fixed.

## Regulator and conventions

The numerical model uses a periodic spatial box of side $L_{\rm box}=12L$ with $18^d$ sites and
lattice spacing $a=L_{\rm box}/18$. To keep the discretized free evolution consistent with the
spatial finite difference, it uses the lattice dispersion

$$
\omega_{\rm lat}^2(\mathbf k)
=
m^2
+
\sum_i
\left[
\frac{2}{a}\sin\left(\frac{k_i a}{2}\right)
\right]^2
$$

The sampled amplitudes are additionally multiplied by

$$
W(\mathbf k)
=
\exp\left[
-\frac{1}{2}
\left(\frac{|\mathbf k|}{\Lambda}\right)^8
\right],
\qquad
\Lambda
=
f_{\rm UV}\frac{\pi}{a}
$$

This smooth display window suppresses lattice-scale structure rather than hiding an implicit
cutoff. The slider changes $f_{\rm UV}=\Lambda/\Lambda_{\rm Ny}$.

This regulator is not Lorentz invariant: a spatial lattice, a cutoff on $|\mathbf k|$, and the
chosen equal-time Wigner distribution all select a time slicing. A hard cutoff that is both a
finite mode count and invariant under Lorentz boosts is unavailable on the real mass shell,
because fixed $k^2=m^2$ still permits arbitrarily large boosted energy and momentum. Covariant
schemes such as Pauli–Villars, proper-time, or Euclidean regulators are useful for correlation
functions, but they do not supply a positive probability distribution over real Lorentzian field
histories for this display.

Finite volume, finite lattice spacing, the extra window, and Plotly's interpolation of isosurfaces
all affect the appearance. The surfaces are descriptive level sets of one coarse-grained sample,
not physical membranes. No interacting vacuum, renormalized local energy density, particle
detection probability, or measurement dynamics is calculated here.

The browser runs the authoritative Python/NumPy sampling kernel in a Pyodide Worker. JavaScript
constructs Plotly traces from the returned versioned numerical arrays but contains no duplicate
field-theory calculation.
