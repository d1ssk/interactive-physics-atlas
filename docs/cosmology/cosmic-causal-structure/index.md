# Cosmic Causal Structure

## Coordinates and causal structure

In a spatially flat Friedmann–Lemaître–Robertson–Walker (FLRW) spacetime, the radial metric can be written as

$$
ds^2=-c^2dt^2+a(t)^2d\chi^2
$$

Here the comoving radial coordinate $\chi$ is constant for a comoving observer with no peculiar motion relative to the cosmic expansion.

The proper distance at time $t$ to an observer at fixed comoving coordinate $\chi$ is

$$
D(t)=a(t)\chi
$$

On the other hand, if conformal time $\eta$ is defined by

$$
d\eta=\frac{dt}{a(t)}
$$

then a radially propagating light ray (null ray) satisfies

$$
\frac{d\chi}{d(c\eta)}=\pm1
$$

This visualization displays $c\eta$ in Gpc.

Changing coordinates between cosmic time $t$ and conformal time $\eta$, or between comoving distance $\chi$ and proper distance $D$, changes the shapes of light rays and horizons in the figure. It does not, however, change the causal structure itself: which pairs of events can be causally connected by light.

## Visualization

<iframe src="app/index.html?lang=en" title="Cosmic causal structure in four coordinate choices" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1420px; min-height: 1180px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Suggested explorations

1. First select the hot Big Bang-only history and linear time. Compare the null rays, which are straight in the comoving-distance–conformal-time panel, with how they curve in the other three coordinate views.

2. Next switch the time axes to logarithmic. This reveals the early universe, including recombination and the radiation-dominated era, without changing the distance axes. In the hot Big Bang-only view, each time axis has a lower bound of $10^{-12}$ in its respective units.

3. Return the time axes to linear and select the history that includes inflation. Notice how strongly the inflationary era is compressed in views that use cosmic time or proper distance.

4. Keep inflation included and switch the time axes to logarithmic. With the conformal-time origin used in this visualization, inflation lies at $c\eta<0$, so the conformal-time panels use a signed logarithmic scale.

5. Follow the blue past-directed light rays from two opposite points on the last-scattering surface. In the model that includes inflation, the intersection of these two past light cones appears inside the inflationary era.

The upper-left panel uses comoving distance on the horizontal axis and conformal time on the vertical axis. In these coordinates, null rays always have slopes $\pm1$, making causal relations most direct to read.

When proper distance is used, the same comoving distance is multiplied by the scale factor according to $D=a(t)\chi$, so cosmic expansion bends the light-ray trajectories into curves. In views that use cosmic time directly, the long-lasting late universe is relatively stretched while the early universe is strongly compressed.

The orange curve shows the comoving Hubble radius

$$
\frac{c}{aH}
$$

It generally grows during radiation and matter domination, but during de Sitter-like inflation with constant $H$,

$$
\frac{c}{aH}\propto a^{-1}
$$

and therefore decreases with time.

This behavior is important for understanding the horizon exit of Fourier modes of cosmological perturbations during inflation and their later horizon re-entry as the universe expands. The Hubble radius itself, however, is not a causal horizon defined by integrating light propagation over time.

## Particle horizon, event horizon, and Hubble radius

For a cosmic history beginning with the hot Big Bang, the comoving particle-horizon distance is

$$
\chi_{\mathrm p}(t)
=
c\int_0^t\frac{dt'}{a(t')}
=
c\eta(t)
$$

When the model is extrapolated to the hot Big Bang boundary, this is the greatest comoving distance from which a signal could have reached an observer between the beginning of the universe and time $t$.

When the inflationary era is included, the lower integration limit is instead the starting time of the cosmic history in this toy model. In that case,

$$
\chi_{\mathrm p}(t)
=
c\left[\eta(t)-\eta_{\mathrm{start}}\right]
$$

The event horizon, on the other hand, is defined by

$$
\chi_{\mathrm e}(t)
=
c\int_t^\infty\frac{dt'}{a(t')}
=
c\left[\eta_\infty-\eta(t)\right]
$$

This is the greatest comoving distance that a signal emitted at time $t$ can reach by the infinite future, and it depends on the future expansion history of the universe. This visualization assumes that the cosmological constant remains constant into the future.

By contrast, the comoving Hubble radius

$$
\chi_H(t)=\frac{c}{a(t)H(t)}
$$

is a length scale set by the local expansion rate at that time. Unlike $\chi_{\mathrm p}$ and $\chi_{\mathrm e}$, it is not a causal horizon defined by integrating light propagation into the past or future.

## Inflation and the CMB horizon problem

After reheating, the background universe is modeled as a spatially flat universe containing radiation, pressureless matter, and a cosmological constant:

$$
\frac{H(a)^2}{H_0^2}
=
\Omega_r a^{-4}
+
\Omega_m a^{-3}
+
\Omega_\Lambda
$$

When inflation is included, a finite de Sitter stage lasting $62$ e-folds is prepended to this history. During this stage $H$ is constant, and inflation ends at $a_{\mathrm{reh}}=10^{-28}$. It is joined to the subsequent hot Big Bang universe so that $H$ is continuous at reheating.

During the de Sitter stage,

$$
\frac{c}{aH}\propto a^{-1}
$$

so the comoving Hubble radius shrinks as inflation proceeds.

Let $\chi_{\mathrm{LSS}}$ be the comoving distance from the present observer to the last-scattering surface, and let $\eta_{\mathrm{rec}}$ be the conformal time at recombination. The conformal time at which the past-directed light rays from two opposite points on the last-scattering surface first meet is

$$
c\eta_{\mathrm{int}}
=
c\eta_{\mathrm{rec}}
-
\chi_{\mathrm{LSS}}
$$

For a cosmic history containing only the hot Big Bang, this value is negative and lies outside the model domain $c\eta\geq0$. Thus, within this model, opposite regions of the CMB have no shared causal past. This is the geometric expression of the CMB horizon problem.

Adding a finite inflationary stage to the past extends the cosmic history to sufficiently negative conformal time to include this intersection within the model. CMB regions that appear causally disconnected when only the hot Big Bang universe is extrapolated can therefore share a common causal past before reheating.

## Model parameters

The numerical calculation uses

$$
H_0
=
67.4\ \mathrm{km\,s^{-1}\,Mpc^{-1}},
\qquad
(\Omega_r,\Omega_m,\Omega_\Lambda)
=
(9.2\times10^{-5},\,0.315,\,0.684908)
$$

and takes the recombination redshift to be

$$
z_{\mathrm{rec}}=1099
$$

The CMB rays shown in the figure are photon null rays, not sound waves propagating through the baryon–photon fluid and hence not the sound horizon. Proper distance here is the spatial distance defined on a selected constant-cosmic-time hypersurface of the FLRW spacetime; it is not a coordinate-invariant distance defined between arbitrary events.

The inflationary era used here is a simplified toy model for visualizing causal structure. Its instantaneous connection to the hot Big Bang universe does not describe the microphysics of reheating, the mechanism that initiates inflation, slow-roll dynamics, or the generation and amplitude of primordial perturbations.

Likewise, the location of the event horizon is model-dependent because it assumes that the cosmological constant remains constant and continues to dominate cosmic expansion into the infinite future.
