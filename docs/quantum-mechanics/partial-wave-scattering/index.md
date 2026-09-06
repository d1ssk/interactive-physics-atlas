# Partial-Wave Scattering

## Physical idea

A plane wave is not a state of definite angular momentum about the scattering center. It can be
resolved into partial waves,

$$
e^{ikz}=\sum_{\ell=0}^{\infty}i^\ell(2\ell+1)j_\ell(kr)P_\ell(\cos\theta)
$$

For a central potential, angular momentum is conserved and each channel evolves independently.
Elastic scattering changes its asymptotic phase by $\delta_\ell$,

$$
S_\ell=e^{2i\delta_\ell},\qquad
f(\theta)=\frac{1}{k}\sum_{\ell=0}^{\infty}(2\ell+1)
e^{i\delta_\ell}\sin\delta_\ell P_\ell(\cos\theta)
$$

The total elastic cross section is

$$
\sigma_{\mathrm{tot}}=\frac{4\pi}{k^2}\sum_{\ell=0}^{\infty}
(2\ell+1)\sin^2\delta_\ell
$$

## Interactive visualization

The first panel constructs a plane wave one angular-momentum channel at a time. The second solves
the radial Schrödinger equation for an adjustable Gaussian well or barrier. Calculations run in
Python inside the browser; the displayed data are not precomputed animation frames.

<iframe
  src="app/index.html?lang=en"
  title="Interactive partial-wave scattering visualization"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1200px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Suggested things to try

1. Increase $\ell_{\max}$ in the plane-wave panel and compare the next channel with the updated sum.
2. Switch between an attractive well and a repulsive barrier while watching the signs of the
   low-$\ell$ phase shifts.
3. Add scattering channels and compare the total field with the scattered field alone.
4. Select different resonance channels and look for energies where $\sin^2\delta_\ell$ approaches
   one.

## What to notice

Low angular momenta dominate when the wavelength is large compared with the potential range.
Higher-$\ell$ channels are suppressed by the centrifugal barrier. Near
$\delta_\ell=\pi/2$ modulo $\pi$, that channel approaches its elastic unitarity limit and produces
strong angular structure in the outgoing field.

## Conventions and limitations

The scattering panel uses $\hbar^2/(2\mu)=1$, so $E=k^2$, with the incident wave traveling in the
$+z$ direction. The model potential is

$$
U(r)=U_0e^{-(r/a)^2}+U_c e^{-(r/a_c)^4},\qquad
a_c=\max(0.12,0.34a)
$$

Only elastic scattering by a real central potential is included. The two-dimensional field view
uses the asymptotic incident-plus-outgoing form and masks the potential interior. For the selected
resonance channel, the displayed interior radial-weight ratio is

$$
\mathcal R_{\mathrm{int}}=
\frac{\int_0^{2a}|u_\ell(r)|^2\,dr}
{\int_0^{2a}|u_\ell^{(0)}(r)|^2\,dr}
$$

where the interacting and free reduced radial waves have the same exterior normalization. A value
above one means that this channel carries more radial weight near the potential than the free wave.
A large $\mathcal R_{\mathrm{int}}$ or $\sin^2\delta_\ell\simeq1$ can signal resonant scattering; it
does not by itself imply a positive-energy bound state.

## References

- J. J. Sakurai and J. Napolitano, *Modern Quantum Mechanics*.
- R. G. Newton, *Scattering Theory of Waves and Particles*.
