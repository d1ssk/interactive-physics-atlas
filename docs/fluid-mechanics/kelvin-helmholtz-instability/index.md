# Kelvin–Helmholtz Instability

The sky and planetary atmospheres sometimes display regular rows of shapes resembling breaking waves. They form when flows moving at different speeds meet and a slight disturbance of their boundary is amplified until it rolls up on a much larger scale.

This phenomenon is the Kelvin–Helmholtz instability. An initially small interfacial wave draws energy from the shear flow and grows, eventually developing into large wave crests called billows and rows of vortices.

<div class="phenomenon-photo-grid">

  <figure class="phenomenon-photo">

    <div class="phenomenon-photo-media"><img src="../../assets/images/kelvin-helmholtz-hartford-clouds.jpg" alt="A row of breaking-wave-shaped clouds above Hartford at sunset" width="960" height="840" loading="eager"></div>

    <figcaption>Kelvin–Helmholtz clouds above Hartford at sunset, 27 June 2022. Photograph: Paul Danese. <a href="https://commons.wikimedia.org/wiki/File:Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg">Wikimedia Commons</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>.</figcaption>

  </figure>

  <figure class="phenomenon-photo">

    <div class="phenomenon-photo-media"><img src="../../assets/images/kelvin-helmholtz-saturn.jpg" alt="A repeating row of curled waves along a boundary between light and dark cloud bands on Saturn" width="961" height="551" loading="eager"></div>

    <figcaption>Curling along a boundary between two of Saturn's atmospheric bands, recorded by Cassini's narrow-angle camera on 9 October 2004. Credit: NASA/JPL/Space Science Institute. <a href="https://science.nasa.gov/photojournal/rough-around-the-edges/">Source: NASA Photojournal PIA06502</a>.</figcaption>

  </figure>

</div>

Wave-shaped clouds like those on the left are observed in Earth's atmosphere, while Saturn's atmosphere exhibits the similar roll-up shown on the right. NASA interprets the row of structures along this cloud-band boundary on Saturn as a Kelvin–Helmholtz pattern.

The same instability appears in systems whose scales and materials differ greatly, including Earth's atmosphere, oceans, laboratory shear layers, and the atmospheres of giant planets. What they share is a velocity difference between adjacent flows. Why, then, can a velocity difference make a small disturbance of the interface grow spontaneously?

## Visualization

<iframe src="app/index.html?lang=en" title="Kelvin–Helmholtz interface roll-up and linear growth-rate spectrum" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1000px; min-height: 700px; border: 0; overflow: hidden;" loading="eager"></iframe>

### Suggested explorations

1. Keep the densities equal and reduce the velocity difference $\Delta U$. Observe how the selected mode's growth rate decreases and eventually crosses into the stable regime.

2. Increase the interfacial tension $\sigma$ or shorten the wavelength $\lambda$. Move the black point on the growth-rate spectrum across both sides of the cutoff wavenumber $k_c$, and compare the flow for unstable and stable modes.

3. Set the interfacial tension to $\sigma=0$, then vary the density ratio $\rho_1/\rho_2$ above and below one. Replacing the density ratio by its reciprocal does not change the shear-driven growth rate. With the symmetric velocities $U_1=+\Delta U/2$, $U_2=-\Delta U/2$, however, the density-weighted mean velocity $\bar U$ changes sign.

4. Turn on the tracers. Each point's color records the fluid to which it initially belonged. As the interface is stretched into thin, interleaved structures, the tracers reveal the advection of fluid parcels and the progress of mixing.

## Why does a small wave grow?

Let fluid 1 occupy $y>0$ and fluid 2 occupy $y<0$. Denote their densities and uniform far-field velocities by

$$
(\rho_1,U_1),\qquad (\rho_2,U_2)
$$

and apply a small perturbation to the initially flat interface,

$$
\eta(x,t)=\eta_0 e^{i(kx-\omega t)}
$$

The interface moves as a material surface separating the two fluids. Fluid parcels cannot pass through it to the other side; the interface must move together with the fluid located there.

If the interface height is $\eta(x,t)$, its rate of change as seen by a fluid parcel is

$$
(\partial_t+U_i\partial_x)\eta
$$

Here $U_i\partial_x$ represents the horizontal transport of the interface shape by the background flow $U_i$.

If $\delta\phi_i$ is the perturbation velocity potential, the vertical velocity perturbation is

$$
\delta v_{y,i}=\partial_y\delta\phi_i
$$

For the interface to move with the fluid, its vertical velocity must equal the fluid's vertical velocity. Therefore,

$$
(\partial_t+U_i\partial_x)\eta
=
\left.\partial_y\delta\phi_i\right|_{y=0}
$$

This is the linearized kinematic boundary condition.

Consequently, even a slight corrugation of the interface generates vertical velocities in both fluids as they follow the wave. The flow is no longer perfectly horizontal: it bends upward and downward around the crests and troughs.

This change in velocity is accompanied by a change in pressure. For an inviscid, incompressible fluid, the linearized unsteady Bernoulli equation gives

$$
\delta p_i
=
-\rho_i(\partial_t+U_i\partial_x)\delta\phi_i
$$

The reappearance of $(\partial_t+U_i\partial_x)$ is important. Even for the same interfacial disturbance, different background velocities $U_i$ make the two fluids experience different rates of change. Their pressure responses are therefore generally unequal, and the pressure jump acts on the interface. Under suitable conditions it pushes crests higher and troughs deeper instead of restoring the interface to a flat state.

In other words, a positive-feedback loop develops:

$$
\text{interface displacement}
\;\longrightarrow\;
\text{velocity perturbation}
\;\longrightarrow\;
\text{pressure difference}
\;\longrightarrow\;
\text{larger interface displacement}
$$

Viscosity is not the cause of this instability. Kelvin–Helmholtz instability can occur even in ideal inviscid fluids when the mean flow has a sufficiently large velocity difference.

## Dispersion relation and growth rate

Consider two inviscid, incompressible fluids of infinite depth. Let $\rho_2>\rho_1$, so that the denser fluid lies below in a stably stratified configuration.

Including gravity $g$ and interfacial tension $\sigma$, the dispersion relation is

$$
\omega
=
k\bar U
\pm
\sqrt{
\frac{(\rho_2-\rho_1)gk+\sigma k^3}{\rho_1+\rho_2}
-
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}
(U_1-U_2)^2k^2
},
$$

where

$$
\bar U
=
\frac{\rho_1U_1+\rho_2U_2}{\rho_1+\rho_2}
$$

The radicand contains two physically distinct effects:

- Gravity and interfacial tension provide restoring effects that tend to flatten the interface.
- The velocity difference provides a destabilizing effect that amplifies the disturbance.

When the radicand is negative, write

$$
\omega=k\bar U\pm i\gamma
$$

For the growing branch,

$$
\gamma^2
=
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}
(U_1-U_2)^2k^2
-
\frac{(\rho_2-\rho_1)gk+\sigma k^3}{\rho_1+\rho_2}.
$$

The amplitude therefore grows exponentially as

$$
\eta\propto e^{\gamma t}
$$

In particular, in the vortex-sheet limit

$$
g=\sigma=0
$$

the growth rate becomes

$$
\gamma
=
k
\frac{\sqrt{\rho_1\rho_2}}{\rho_1+\rho_2}
|U_1-U_2|
$$

In this limit every $k>0$ is unstable whenever $U_1\ne U_2$. Moreover, $\gamma\propto k$, so the growth rate increases without bound as the wavelength becomes shorter.

This does not mean that real fluids possess an instability at arbitrarily small scales. It is a singular feature of the vortex-sheet model, which assumes a velocity discontinuity of zero thickness. Real shear layers have finite thickness, and viscosity, interfacial tension, and compressibility also invalidate this idealization at sufficiently short wavelengths.

## Energy passes from the shear flow to vortices

The growing wave does not create energy. Its source is the kinetic energy stored in the velocity difference of the mean flow.

As the instability develops, motions span the upper and lower layers and momentum is exchanged between regions with different flow speeds. The mean velocity contrast consequently tends to decrease.

Schematically, the energy transfer is

$$
\text{mean shear flow}
\;\longrightarrow\;
\text{interfacial waves and large vortices}
\;\longrightarrow\;
\text{motion at smaller scales}
\;\longrightarrow\;
\text{heat}
$$

Viscosity is responsible for the final dissipation into heat, but the instability itself is already present at the inviscid stage.

## Why does a vortex sheet roll up?

Consider the idealized velocity profile

$$
U(y)=
\begin{cases}
U_1, & y>0,\\
U_2, & y<0
\end{cases}
$$

Its velocity gradient is concentrated entirely at the interface.

Because the vorticity of a two-dimensional flow is

$$
\omega_z=-\frac{dU}{dy}
$$

we obtain

$$
\omega_z
=
-(U_1-U_2)\delta(y)
$$

Thus, in this model the interface itself is a thin sheet carrying vorticity: a vortex sheet.

A perfectly straight sheet retains its shape because of translational symmetry. Once it bends slightly, however, the velocity field induced by each part of the sheet can move other parts in a way that strengthens the deformation.

In the linear regime this behavior appears as the exponential growth derived above. Once the amplitude becomes large, the linear approximation breaks down and the sheet gradually rolls up into the cat's-eye vortex structure characteristic of Kelvin–Helmholtz instability.

## Stabilization by gravity and interfacial tension

In a stable density stratification, gravity acts as a restoring force at long wavelengths. Interfacial tension strongly resists deformations with large curvature and therefore stabilizes the short-wavelength side.

The visualization sets $g=0$, giving

$$
\gamma^2
=
\frac{\rho_1\rho_2}{(\rho_1+\rho_2)^2}
(U_1-U_2)^2k^2
-
\frac{\sigma}{\rho_1+\rho_2}k^3.
$$

When $\sigma>0$ and $U_1\ne U_2$, the cutoff wavenumber is

$$
k_c
=
\frac{\rho_1\rho_2(U_1-U_2)^2}
{\sigma(\rho_1+\rho_2)}
$$

and the unstable interval is

$$
0<k<k_c
$$

The fastest-growing wavenumber is

$$
k_{\mathrm{max}}
=
\frac{2}{3}k_c
$$

The shortest wavelength is therefore not the fastest-growing one. When interfacial tension is present, its restoring effect becomes stronger toward shorter wavelengths. Modes with $k>k_c$ do not grow exponentially but instead oscillate as capillary waves.

## Finite-thickness shear layers

In real flows, velocity is almost never mathematically discontinuous. A common model is

$$
U(y)=U_0\tanh(y/L)
$$

where $L$ represents the thickness of the shear layer.

For a two-dimensional inviscid perturbation, define the phase speed by

$$
c=\frac{\omega}{k}
$$

The perturbation amplitude $\phi(y)$ then obeys Rayleigh's equation,

$$
(U-c)(\phi''-k^2\phi)-U''\phi=0
$$

Rayleigh's inflection-point theorem states that for such a parallel shear flow to be linearly unstable, the flow must contain an inflection point at which

$$
U''(y)=0
$$

This is a necessary rather than sufficient condition, but it demonstrates the close connection between instability and the curvature of the velocity profile.

The hyperbolic-tangent shear layer

$$
U(y)=U_0\tanh(y/L)
$$

has an inflection point at its center, $y=0$, and exhibits Kelvin–Helmholtz-type instability over a finite band of wavenumbers. Unlike a vortex sheet, it does not allow arbitrarily short wavelengths to grow arbitrarily fast: the shear-layer thickness $L$ supplies a natural length scale.

## Visualization model

The visualization uses dimensionless variables with

$$
\rho_2=1,\qquad
U_1=+\frac{\Delta U}{2},\qquad
U_2=-\frac{\Delta U}{2}
$$

The viewport width is fixed at $L_x=8$, and gravity and viscosity are omitted.

The growth rate and cutoff wavenumber come from the linear theory for a sharp, zero-thickness interface.

The displayed roll-up, however, is not a direct time integration of the two-fluid Euler equations. The visualization constructs an amplitude parameter from the linear growth

$$
e^{\gamma t}
$$

and connects it to a Kelvin–Stuart-type cat's-eye flow, schematically showing how a linear instability can develop into large vortices.

The tracers are advected as a passive scalar with a semi-Lagrangian method, so numerical diffusion affects fine structures. For modes classified as stable by the linear theory, the visualization does not separately solve the capillary-wave evolution and instead displays the initial perturbation.

## References

- NASA Photojournal, [*Rough Around the Edges* (PIA06502)](https://science.nasa.gov/photojournal/rough-around-the-edges/). See also NASA's [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

- Paul Danese, [*Kelvin Helmholtz cloud formation during Hartford sunset*](https://commons.wikimedia.org/wiki/File:Kelvin_Helmholtz_cloud_formation_during_Hartford_sunset.jpg), Wikimedia Commons, 27 June 2022, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

- Lord Rayleigh, [*On the Stability, or Instability, of Certain Fluid Motions*](https://doi.org/10.1112/plms/s1-11.1.57), *Proceedings of the London Mathematical Society* **s1-11** (1879), 57–72.

- J. T. Stuart, [*On Finite Amplitude Oscillations in Laminar Mixing Layers*](https://doi.org/10.1017/S0022112067000941), *Journal of Fluid Mechanics* **29** (1967), 417–440.

- S. Chandrasekhar, *Hydrodynamic and Hydromagnetic Stability*, Dover (1981), Chapter XI.
