# Partial-Wave Scattering

## Partial-wave expansion and phase shifts

Consider a particle of mass $\mu$ scattered by a central potential $U(r)$. The time-independent
Schrödinger equation is

$$
\left[
-\frac{\hbar^2}{2\mu}\nabla^2
+U(r)
\right]\psi(\mathbf r)
=
E\psi(\mathbf r)
$$

Because the potential depends only on $r$, angular momentum is conserved and the wavefunction can
be decomposed into partial waves of definite angular momentum $\ell$.

An incident plane wave traveling in the $z$ direction has the expansion

$$
e^{ikz}
=
e^{ikr\cos\theta}
=
\sum_{\ell=0}^{\infty}
i^\ell(2\ell+1)
j_\ell(kr)
P_\ell(\cos\theta)
$$

where $j_\ell$ is a spherical Bessel function and $P_\ell$ is a Legendre polynomial. A single
plane wave can therefore be regarded as a superposition of infinitely many partial waves with
different angular momenta.

Partial waves with different $\ell$ do not mix in a central potential, so each can be treated as
an independent one-dimensional radial scattering problem. Writing the wavefunction as

$$
\psi(\mathbf r)
=
\sum_{\ell}
\frac{u_\ell(r)}{r}
P_\ell(\cos\theta)
$$

gives the radial equation

$$
\left[
-\frac{\hbar^2}{2\mu}
\frac{d^2}{dr^2}
+
U(r)
+
\frac{\hbar^2\ell(\ell+1)}{2\mu r^2}
\right]
u_\ell(r)
=
E u_\ell(r)
$$

for each reduced radial wavefunction $u_\ell(r)$.

The third term,

$$
\frac{\hbar^2\ell(\ell+1)}{2\mu r^2}
$$

is the centrifugal barrier. The barrier rises with $\ell$, making high-angular-momentum partial
waves less able to penetrate to the central region of the potential. Low partial waves therefore
provide the main contribution, particularly in low-energy scattering.

Suppose that the potential decays sufficiently rapidly. At radii much larger than its range,
$U(r)\simeq0$, and the radial wavefunction has the asymptotic form

$$
u_\ell(r)
\propto
\sin\left(
kr-\frac{\ell\pi}{2}+\delta_\ell
\right)
$$

For a free particle $\delta_\ell=0$. In the presence of the potential, the wave is shifted in
phase by $\delta_\ell$, called the **phase shift** of partial wave $\ell$. In elastic scattering,
the asymptotic effect of the potential is a change of phase in each partial wave rather than a
loss of amplitude.

Separating the incoming and outgoing waves gives

$$
u_\ell(r)
\propto
\frac{1}{2i}
\left[
e^{2i\delta_\ell}
e^{i(kr-\ell\pi/2)}
-
e^{-i(kr-\ell\pi/2)}
\right]
$$

The phase change of the outgoing component relative to the incoming component is therefore

$$
S_\ell
=
e^{2i\delta_\ell}
$$

This is the partial-wave $S$ matrix. For elastic scattering by a real potential,

$$
|S_\ell|=1
$$

so probability flux is conserved separately in every angular-momentum channel.

Far from the scattering center, the complete scattering state can be written as

$$
\psi(\mathbf r)
\underset{r\to\infty}{\sim}
e^{ikz}
+
f(\theta)\frac{e^{ikr}}{r}
$$

The first term is the incident plane wave and the second is the outgoing spherical wave produced
by scattering. In terms of the partial-wave phase shifts, the scattering amplitude is

$$
f(\theta)
=
\frac{1}{2ik}
\sum_{\ell=0}^{\infty}
(2\ell+1)
\left(S_\ell-1\right)
P_\ell(\cos\theta)
$$

Substituting $S_\ell=e^{2i\delta_\ell}$ gives

$$
f(\theta)
=
\frac{1}{k}
\sum_{\ell=0}^{\infty}
(2\ell+1)
e^{i\delta_\ell}
\sin\delta_\ell
P_\ell(\cos\theta)
$$

Thus, for elastic scattering by a central potential, the information about the potential is
encoded in the phase shifts $\delta_\ell$ of the angular-momentum channels. The differential
cross section is

$$
\frac{d\sigma}{d\Omega}
=
|f(\theta)|^2
$$

Using the orthogonality of the Legendre polynomials, the total elastic cross section becomes

$$
\sigma_{\mathrm{tot}}
=
\frac{4\pi}{k^2}
\sum_{\ell=0}^{\infty}
(2\ell+1)
\sin^2\delta_\ell
$$

The contribution from each partial wave is

$$
\sigma_\ell
=
\frac{4\pi}{k^2}
(2\ell+1)
\sin^2\delta_\ell
$$

Consequently, when

$$
\delta_\ell
=
\frac{\pi}{2}
\pmod{\pi}
$$

the cross section of that partial wave is maximal. This property is also important for
understanding resonant scattering below.

## Visualization

The first panel shows how a plane wave is reconstructed as angular-momentum channels are added
one at a time. The second shows the phase shifts, angular distribution, selected partial-wave
radial function, and scattering field produced by an attractive Gaussian well or repulsive
barrier.

<iframe
  src="app/index.html?lang=en"
  title="Interactive partial-wave scattering visualization"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2300px; min-height: 1200px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Suggested things to try

1. Increase $\ell_{\max}$ in the plane-wave panel and compare the newly added partial wave with the
   updated sum.
2. Switch between the attractive well and repulsive barrier and observe how the low-$\ell$ phase
   shifts change.
3. Increase the number of channels contributing to the scattering field and compare the complete
   wavefield with the scattered wave alone.
4. Change the resonance channel and look for energies where $\sin^2\delta_\ell$ approaches 1.

## What partial waves reveal

At low energies, where the wavelength is longer than the range of the potential, scattering is
dominated by low-angular-momentum partial waves. Contributions from high $\ell$ are suppressed
because the centrifugal barrier prevents those waves from reaching the neighborhood of the
potential.

Near $\delta_\ell=\pi/2\pmod{\pi}$,

$$
\sin^2\delta_\ell\simeq 1
$$

and the elastic cross section of that partial wave approaches the maximum allowed by unitarity.
When a particular partial wave meets this condition, the angular dependence associated with its
$P_\ell(\cos\theta)$ appears strongly in the scattering amplitude.

## Model and conventions

The scattering panel uses

$$
\frac{\hbar^2}{2\mu}=1
$$

and hence $E=k^2$. The incident plane wave travels in the $+z$ direction.

If $L$ denotes the model length unit, radii are displayed in $L$, energies and potentials in
$L^{-2}$, and cross sections in $L^2$. The potential is

$$
U(r)
=
U_0e^{-(r/a)^2}
+
U_c e^{-(r/a_c)^4},
\qquad
a_c=\max(0.12,0.34a)
$$

Only elastic scattering by a real central potential is considered.

The two-dimensional scattering-field view uses the asymptotic incident plane wave and outgoing
spherical wave valid outside the potential. The interior of the potential is therefore excluded
from the display.

For the selected partial wave, the concentration of the radial wavefunction near the potential is
measured by

$$
\mathcal R_{\mathrm{int}}
=
\frac{
\int_0^{2a}|u_\ell(r)|^2\,dr
}{
\int_0^{2a}|u_\ell^{(0)}(r)|^2\,dr
}
$$

Here $u_\ell(r)$ is the interacting radial wavefunction and $u_\ell^{(0)}(r)$ is the corresponding
free wave. Their amplitudes are normalized to agree outside the potential before the comparison
is made.

When $\mathcal R_{\mathrm{int}}>1$, the probability weight of that partial wave is more
concentrated near the potential than for the free wave. A large $\mathcal R_{\mathrm{int}}$
together with $\sin^2\delta_\ell\simeq1$ is a characteristic signature of resonant scattering
associated with a quasibound state.
