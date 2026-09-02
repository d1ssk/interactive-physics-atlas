# Cosmic Causal Structure

## Physical idea

In a spatially flat Friedmann–Lemaître–Robertson–Walker spacetime, the radial part of the metric is

$$
ds^2=-c^2dt^2+a(t)^2d\chi^2.
$$

The comoving radial coordinate $\chi$ stays fixed for an observer moving with the Hubble flow.
The proper distance to that observer on a constant-cosmic-time slice is

$$
D(t)=a(t)\chi.
$$

Conformal time is defined by

$$
d\eta=\frac{dt}{a(t)}.
$$

The visualization measures $c\eta$ in Gpc. Radial null rays therefore satisfy

$$
\frac{d\chi}{d(c\eta)}=\pm1.
$$

Changing between cosmic and conformal time, or between comoving and proper distance, changes the
shape of a curve on the page. It does not change which events can be connected by light.

## Interactive visualization

<iframe src="app/index.html?lang=en" title="Cosmic causal structure in four coordinate choices" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1420px; min-height: 1180px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Suggested explorations

1. Start with the hot Big Bang history and linear time. Compare the straight null rays in the
   comoving-distance/conformal-time panel with their curved images in the other three panels.
2. Enable logarithmic time. Recombination and the radiation era become visible without changing
   the distance axes. In the hot Big Bang view, the displayed time range begins at $10^{-12}$ in
   the units of each time axis.
3. Include inflation while keeping time linear. Notice how strongly the inflationary interval is
   compressed in cosmic time and proper distance.
4. Keep inflation enabled and switch time to logarithmic. The conformal-time panels use a signed
   logarithmic scale because the chosen conformal-time origin places inflation at $c\eta<0$.
5. Follow the two blue past-directed rays from opposite points on the last-scattering sphere. With
   inflation included, their first intersection lies inside the finite inflationary stage.

## What to notice

The upper-left panel uses comoving distance and conformal time. Null rays have slopes $\pm1$ there,
so causal relations are easiest to read. In proper distance, the same comoving separation is
multiplied by $a(t)$; the expansion of the spatial slice bends the plotted curves. Cosmic time
stretches late-time history and compresses early epochs.

The orange curve is the comoving Hubble radius $c/(aH)$. During radiation and matter domination it
mostly grows, whereas during the constant-$H$ inflationary stage it shrinks. This behavior explains
horizon exit and re-entry for perturbation modes, but the Hubble radius is not itself an integrated
causal horizon.

The green intersection marker appears only in the inflationary model. Its label is kept in the
legend so that it does not obscure the null-ray geometry.

## Horizons shown

For the hot Big Bang history, the particle horizon is

$$
\chi_{\mathrm p}(t)=c\int_0^t\frac{dt'}{a(t')}=c\eta(t).
$$

It is the greatest comoving distance from which a signal could have reached an observer by time
$t$, assuming the model is extrapolated to the hot Big Bang boundary. When finite inflation is
included, the lower limit is instead the beginning of the displayed toy model:

$$
\chi_{\mathrm p}(t)=c\left[\eta(t)-\eta_{\mathrm start}\right].
$$

The event horizon is

$$
\chi_{\mathrm e}(t)=c\int_t^\infty\frac{dt'}{a(t')}
=c\left[\eta_\infty-\eta(t)\right].
$$

It depends on the assumed future expansion. The visualization assumes that the cosmological
constant remains unchanged. The comoving Hubble radius is the local expansion scale

$$
\chi_H(t)=\frac{c}{a(t)H(t)}.
$$

Unlike $\chi_{\mathrm p}$ and $\chi_{\mathrm e}$, it is not defined by integrating the propagation
of light over the past or future.

## Inflation and the CMB horizon problem

The background after reheating is a flat radiation + pressureless matter + cosmological-constant
model,

$$
\frac{H(a)^2}{H_0^2}
=\Omega_r a^{-4}+\Omega_m a^{-3}+\Omega_\Lambda.
$$

The inflation option prepends a finite constant-$H$ de Sitter stage with $62$ e-folds. It ends at
$a_{\mathrm{reh}}=10^{-28}$ and is joined so that $H$ is continuous at reheating. During this stage,

$$
\frac{c}{aH}\propto a^{-1}.
$$

Let $\chi_{\mathrm{LSS}}$ be the comoving distance from us to the last-scattering sphere, and let
$\eta_{\mathrm{rec}}$ be the conformal time at recombination. The inward past light rays from
opposite CMB points first meet at

$$
c\eta_{\mathrm{int}}
=c\eta_{\mathrm{rec}}-\chi_{\mathrm{LSS}}.
$$

For the hot Big Bang solution this value is negative, outside the domain $c\eta\geq0$. The finite
inflationary extension reaches sufficiently far into negative conformal time that the intersection
is included. Geometrically, regions that appear disconnected in the hot Big Bang extrapolation can
therefore share a causal past before reheating.

## Conventions and limitations

The numerical background uses

$$
H_0=67.4\ \mathrm{km\,s^{-1}\,Mpc^{-1}},
\qquad
(\Omega_r,\Omega_m,\Omega_\Lambda)
=(9.2\times10^{-5},0.315,0.684908).
$$

Recombination is placed at $z_{\mathrm{rec}}=1099$. The plotted CMB rays are photon null rays, not
the baryon–photon sound horizon. Proper distance means distance on the selected FLRW
constant-cosmic-time slice; it is not a coordinate-independent distance between arbitrary events.

The inflationary stage is a causal-structure toy model. Its instantaneous connection to the hot
Big Bang history does not model reheating microphysics, the onset of inflation, slow-roll dynamics,
or primordial perturbation amplitudes. The event horizon is likewise model-dependent because it
uses the assumed infinite future of the cosmological-constant background.
