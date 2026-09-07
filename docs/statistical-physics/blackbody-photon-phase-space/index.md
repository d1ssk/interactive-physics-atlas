# Phase Space of Terrestrial and Solar Radiation

## What do we receive from the Sun?

What does Earth receive from the Sun? The first answer that comes to mind is **energy**. But the amount of energy alone misses the essential point.

For Earth to maintain an approximately constant temperature on climatic timescales, it must return almost as much power to space as it absorbs from solar radiation. In fact, Earth reflects about 30% of the incoming solar radiation, absorbs the rest, and emits nearly the same amount of energy to space as thermal infrared radiation.[^energy-imbalance]

[^energy-imbalance]: Earth is not currently in perfect radiative equilibrium: the radiative energy it absorbs slightly exceeds the energy it emits. Increasing greenhouse-gas concentrations shift the new radiative equilibrium toward a higher temperature, but the Earth system—especially the oceans—has substantial thermal inertia, so it is presently in a transient state approaching that equilibrium.

What drives Earth's nonequilibrium phenomena is therefore not primarily the **difference in quantity** between the energy arriving from the Sun and the energy leaving for space, but the **difference in quality** between them.

Solar radiation reaching Earth is close to blackbody radiation at about $5800\,\mathrm K$, concentrated at high frequencies and within a restricted range of directions. Earth, by contrast, dissipates the absorbed energy and emits it to space in every direction as low-temperature thermal radiation with an effective radiating temperature of about $255\,\mathrm K$.

Even when the two energy flows are nearly balanced in magnitude, the entropy they carry differs greatly. This contrast between hot solar radiation and cool terrestrial radiation provides the **radiative exergy** available to Earth's environment. Its flow drives life, weather, ocean circulation, and other nonequilibrium dynamics on Earth.

## Similar energy, radically different phase space

For blackbody radiation at temperature $T$, the photon number per physical volume, solid angle, and logarithmic frequency interval is

$$
\frac{\mathrm dN}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}
=
\frac{2\nu^3}{c^3}
\frac{1}{\exp(h\nu/k_{\mathrm B}T)-1}
$$

Multiplying this by the energy $h\nu$ of one photon gives

$$
\frac{\mathrm dE}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}
=
h\nu
\frac{\mathrm dN}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}
$$

If blackbody radiation uniformly occupies a solid angle $\Omega$, its photon number and energy integrated over frequency and solid angle scale as

$$
N\propto \Omega T^3,
\qquad
E\propto \Omega T^4
$$

The Sun's photospheric temperature is

$$
T_\odot\simeq5800\,\mathrm K
$$

but the solid angle of the solar disk as seen from Earth is only

$$
\Omega_\odot\simeq6.8\times10^{-5}\,\mathrm{sr}
$$

The effective radiating temperature of Earth, meanwhile, is

$$
T_\oplus\simeq255\,\mathrm K
$$

and, when thermal radiation emitted to space from the whole globe is considered together, its propagation directions span nearly the full sky of $4\pi$.

About 30% of the solar radiation incident on Earth is reflected back to space by clouds, the atmosphere, and the surface. This global mean reflectivity is the Bond albedo $A$, so the fraction absorbed by Earth is $1-A$. Under this idealization,

$$
\frac{E_{\odot,\mathrm{abs}}}{E_\oplus}
=
(1-A)
\frac{\Omega_\odot}{4\pi}
\left(\frac{T_\odot}{T_\oplus}\right)^4
\simeq1.
$$

This relation is also the global-mean radiative equilibrium of Earth,

$$
\frac{(1-A)S_\odot}{4}
\simeq
\sigma T_\oplus^4
$$

rewritten in terms of the phase space occupied by terrestrial and solar radiation.

Although their total energies are nearly equal, their distributions in $(\nu,\Omega)$ are entirely different. Absorbed solar radiation is concentrated at high frequencies and within a minute angular region, whereas terrestrial radiation is shifted to low frequencies and emitted from the globe across a broad range of directions.

For blackbody radiation, the ratio of entropy $S$ to energy $E$ is

$$
\frac{S}{E}
=
\frac{4}{3T}
$$

Cooler radiation therefore carries more entropy for the same energy. Earth dissipates the low-entropy radiation received from the Sun and returns nearly the same energy to space as higher-entropy thermal radiation.

**What matters between the Sun and Earth is not merely that energy flows. It is that nearly the same energy flows in and out in radically different regions of phase space.**

## What phase-space structure produces on Earth

The high radiation temperature of sunlight first appears in its spectrum. Visible solar photons carry energies of a few electronvolts and can directly excite electronic states in molecules. Photosynthesis stores part of this radiant energy as chemical free energy. Living processes and ecosystems use it in stages, maintaining nonequilibrium states while dissipating energy.

The strong directionality of solar radiation, meanwhile, appears in Earth's heating pattern. Once sunlight is absorbed by matter and thermalized, the information about the direction from which each photon arrived is lost. Nevertheless, because sunlight arrives from essentially one direction while Earth is spherical and rotating, heating varies with latitude, day and night, and season. Clouds and surface albedo further modify this spatial heterogeneity.

The resulting temperature and pressure gradients drive winds, weather, and ocean circulation.

This does not decompose radiative exergy into two independent quantities, a frequency component and an angular component. High radiation temperature and strong directionality are two aspects of the same phase-space structure of sunlight. That structure manifests as a spectrum in photochemical reactions and as nonuniform heating in the climate system.

## Visualization

<iframe
  src="app/index.html?lang=en"
  title="Frequency-direction phase space of idealized solar and terrestrial blackbody photons"
  style="display: block; width: 100%; height: 1240px; min-height: 760px; border: 0; overflow: hidden;"
  loading="eager"
  scrolling="no"
  data-auto-height
></iframe>

Each rendered point represents the same photon number. Point density therefore corresponds to

$$
\frac{\mathrm dN}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}
$$

Radius represents frequency $\nu$, while direction from the origin represents the photon propagation direction $\Omega$.

## Suggested explorations

* Begin with the default linear radial scale and observe the large frequency separation between solar photons and low-temperature blackbody photons. At the same time, compare the extreme angular difference between the full sky and the solar disk.

* Switch to the logarithmic scale. The outer edge remains at $1.5\,\mathrm{PHz}$, but stretching the low-frequency region makes the two spectral shapes easier to compare in one figure.

* Change the solar-disk angular magnification from $\times1$ to $\times10$. The cone becomes easier to see, but its physical solid angle, point count, and integrated values do not change.

* Vary the two temperatures and the Bond albedo, then compare the photon-number and energy ratios. Because photon number scales as $T^3$ while energy scales as $T^4$, comparable energy does not imply comparable photon number. The Bond albedo changes only the absorbed solar energy used in the energy ratio; it does not change the displayed photon distribution.

## What this model idealizes

This visualization approximates solar and terrestrial radiation as blackbodies and compares their distributions in frequency $\nu$ and propagation direction $\Omega$. Reflection of solar radiation by Earth is included through a global-mean albedo, while terrestrial radiation is treated as a blackbody at its effective radiating temperature.

Terrestrial radiation is displayed by combining the propagation directions of photons emitted to space from the whole globe into a distribution spanning $4\pi$. This does not mean that every location emits in every direction; it is a superposition of global emission in a single angular space.

Real radiation includes wavelength-dependent reflection and absorption, atmospheric absorption bands, distributions of cloud and surface temperatures, and diurnal and seasonal variations. Here these effects are reduced to a global-mean blackbody radiation field and reflectivity.

The point of this model is that **nearly the same amount of energy enters from the Sun as hot radiation concentrated in a narrow phase-space region, and leaves Earth as cool radiation dispersed across a broad region of phase space**.

## References and videos

* [NASA Earth Observatory: Climate and Earth's Energy Budget](https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/)

* [IPCC AR6 Working Group I, Chapter 7: The Earth's Energy Budget, Climate Feedbacks, and Climate Sensitivity](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/)

* [NASA Technical Reports Server: The Far Infrared Earth](https://ntrs.nasa.gov/citations/20100033490)

* [Entropy of radiation: the unseen side of light](https://www.nature.com/articles/s41598-017-01622-6)

* [Veritasium: The Most Misunderstood Concept in Physics](https://youtu.be/DxL2HoqLbyA?si=fRnODBoAv4wURXsQ)
