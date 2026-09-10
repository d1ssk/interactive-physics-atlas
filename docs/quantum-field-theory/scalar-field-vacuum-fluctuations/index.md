# Quantum Fluctuations of the Free Scalar-Field Vacuum

## From zero-point motion to field configurations

A free real scalar field can be decomposed into spatial Fourier modes, each of which behaves as an independent harmonic oscillator. In units where $\hbar=c=1$, the frequency of the mode with wavevector $\mathbf k$ is

$$
\omega_{\mathbf k}
=
\sqrt{\mathbf k^2+m^2}
$$

The vacuum contains no particle excitations. Nevertheless, the ground state of each harmonic oscillator has zero-point fluctuations. With the standard canonical normalization,

$$
\left\langle |q_{\mathbf k}|^2\right\rangle
=
\frac{1}{2\omega_{\mathbf k}},
\qquad
\left\langle |p_{\mathbf k}|^2\right\rangle
=
\frac{\omega_{\mathbf k}}{2}
$$

When the vacuum state is expressed in the field-configuration basis $\phi(\mathbf x)$, these zero-point fluctuations appear as a wavefunctional spread over many different field configurations. The vacuum is not concentrated on the single configuration $\phi(\mathbf x)=0$; instead, it is characterized by a quantum amplitude

$$
\Psi_0[\phi]
$$

for every configuration. For a free field, this vacuum wavefunctional is Gaussian, and its width determines the fluctuations of every Fourier mode.

Sampling the amplitude of each Fourier mode from this distribution and applying a Fourier transform gives one spatially correlated field

$$
\phi(\mathbf x)
$$

The visualization displays one realization drawn from this vacuum probability distribution. The field pattern changes from one realization to another, while the statistics of its amplitudes and spatial correlations are characterized by the vacuum two-point function.

## Visualization

The left and right views in each row show the same realization in two different ways.

In the point-cloud view, every point represents the field value at one lattice site. Color indicates the sign of $\phi$, and size represents $|\phi|$.

In the isosurface view, the orange and cyan surfaces bound the regions satisfying

$$
\phi>u\sigma,
\qquad
\phi<-u\sigma
$$

Here,

$$
\sigma^2=\langle\phi^2\rangle
$$

is the variance of the vacuum ensemble defined with the same regulator.

Changing the threshold $u$ does not resample the field itself. Because both views show the same realization, rotating either one rotates the other to the same viewpoint.

<iframe
  src="app/index.html?lang=en"
  title="Interactive visualization of quantum fluctuations of the scalar-field vacuum"
  data-auto-height
  scrolling="no"
  style="display: block; width: 100%; height: 2450px; min-height: 1300px; border: 0; overflow: hidden;"
  loading="eager"
></iframe>

## Vacuum fluctuations extended in time

The upper row evolves a free field with two spatial dimensions through time.

At $t=0$, the canonical variables $(\phi,\pi)$ are sampled once from the vacuum Wigner distribution. Each Fourier mode is then evolved freely according to

$$
q_{\mathbf k}(t)
=
q_{\mathbf k}(0)\cos(\omega_{\mathbf k}t)
+
\frac{p_{\mathbf k}(0)}{\omega_{\mathbf k}}
\sin(\omega_{\mathbf k}t)
$$

The field at each time is not generated independently. The initially selected $(\phi,\pi)$ determines the entire subsequent spacetime history. The displayed $2+1$-dimensional field is therefore one temporally correlated realization.

For a free Gaussian theory, the vacuum Wigner distribution is a positive Gaussian distribution, and the time evolution is linear. The two-point covariance of the resulting stochastic process is therefore the symmetrized two-point function

$$
C(x,x')
=
\frac{1}{2}
\left\langle
\left\{
\hat\phi(x),\hat\phi(x')
\right\}
\right\rangle
$$

This is often called the Hadamard function, or the symmetrized two-point function, depending on the convention concerning the factor of $1/2$.

This differs from the Feynman propagator and the Wightman function. The covariance of real random variables must be real and symmetric, whereas the Feynman propagator preserves time ordering and the Wightman function

$$
\langle\hat\phi(x)\hat\phi(x')\rangle
$$

preserves operator ordering; in general, they do not meet those requirements. The classical stochastic field generated here does not reproduce every operator correlation of the quantum vacuum. It represents the symmetrized correlations of the free field as a real stochastic process.

## The vacuum in two and three spatial dimensions

The lower row is an independent equal-time configuration drawn from the vacuum Gaussian measure in three spatial dimensions.

It may look as though one spatial direction has simply been added to the two-dimensional field in the upper row, but their probability distributions are not the same. Before regularization, the equal-time two-point function of a free field in $d$ spatial dimensions is

$$
C_d(r)
=
\int\frac{d^d k}{(2\pi)^d}
\frac{e^{i\mathbf k\cdot\mathbf r}}
{2\sqrt{\mathbf k^2+m^2}}
$$

For $r>0$,

$$
C_2(r)
=
\frac{e^{-mr}}{4\pi r},
$$

$$
C_3(r)
=
\frac{mK_1(mr)}{4\pi^2r}
$$

Here, $K_1$ is the modified Bessel function of the second kind.

Consequently, taking a planar slice through a vacuum configuration in three spatial dimensions does not produce the same statistics as the vacuum of a genuinely two-dimensional scalar field. Even when only points on the plane are examined, their correlations retain the mode structure of the original three-dimensional field.

The correlation plot in the visualization generates 48 independent realizations in each of two and three dimensions and estimates the regulated, normalized correlation by Monte Carlo sampling. At each lattice separation, the values are first averaged over lattice translations and spatial directions and then averaged across realizations. The error bar is the standard error of this ensemble mean.

Thus, the graph is not calculated from the single field displayed above. It is an ensemble average obtained from many independent samples drawn from the same vacuum measure.

## Things to explore

1. Keep the seed fixed and increase $m$. Observe how the long-distance correlation decays more rapidly, and compare the change in the correlation graph with the characteristic correlation length $\xi\sim m^{-1}$.

2. Keep $m$ fixed and move the UV window toward the Nyquist scale. As higher-wavevector modes are included, finer spatial structure appears in the field.

3. Move the threshold $u$ without changing the seed. The field values themselves remain unchanged, while the positive and negative excursion regions connect, split, or disappear.

4. Generate several realizations using the same parameters. Individual patterns change substantially, but all of them are samples from the same Gaussian ensemble. The Monte Carlo correlation estimates also fluctuate statistically around the same expectation value.

## The lattice and UV regularization

The numerical calculation uses a periodic spatial box with side length

$$
L_{\rm box}=12L
$$

discretized into 18 sites along each direction, giving the lattice spacing

$$
a=\frac{L_{\rm box}}{18}
$$

To make the spatial finite difference consistent with the free time evolution, the calculation uses the dispersion relation of the lattice Laplacian rather than the continuum relation

$$
\omega^2=\mathbf k^2+m^2
$$

Specifically, it uses

$$
\omega_{\rm lat}^2(\mathbf k)
=
m^2
+
\sum_i
\left[
\frac{2}{a}
\sin\left(\frac{k_i a}{2}\right)
\right]^2
$$

In addition, every sampled Fourier mode is multiplied by the smooth UV window

$$
W(\mathbf k)
=
\exp\left[
-\frac{1}{2}
\left(
\frac{|\mathbf k|}{\Lambda}
\right)^8
\right]
$$

The cutoff scale is

$$
\Lambda
=
f_{\rm UV}\frac{\pi}{a}
$$

and the slider changes

$$
f_{\rm UV}
=
\frac{\Lambda}{\Lambda_{\rm Ny}}
$$

The lattice itself already has a UV cutoff at the Nyquist scale, but this window begins to suppress high-wavevector modes before that scale is reached. This makes it possible to observe the spatial structure of the vacuum fluctuations without overemphasizing structures near the lattice scale or discretization artifacts.

## Regularization and Lorentz symmetry

The regulator used in this visualization is not Lorentz invariant. The spatial lattice, the UV window based on $|\mathbf k|$, and the Wigner distribution defined on one time slice all select a preferred time slicing.

This is not merely an implementation convenience. On the mass shell

$$
E^2-\mathbf k^2=m^2
$$

a Lorentz boost can make $E$ and $|\mathbf k|$ arbitrarily large while preserving the mass-shell condition. A cutoff that discards three-momenta above a fixed scale is therefore not invariant under Lorentz boosts.

Regularization schemes that more readily preserve Lorentz covariance, such as Pauli–Villars regularization, the proper-time method, or regularization in Euclidean space, are well suited to calculations of correlation functions and loop integrals. This visualization instead prioritizes generating realizations of a field from finitely many real degrees of freedom, and therefore introduces an explicit cutoff on a spatial lattice.

Finite volume, finite lattice spacing, the UV window, and interpolation of the isosurfaces all affect the displayed geometry. In particular, an isosurface is a geometric representation of a level set of the coarse-grained field; it does not describe a physical membrane.
