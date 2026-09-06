# Blackbody Photon Phase Space

## What do we receive from the Sun?

What does Earth actually receive from the Sun? The first answer is usually **energy**. But energy alone misses the essential point.

On climate timescales, Earth cannot keep receiving a large net supply of energy while maintaining an approximately steady temperature. It absorbs part of the incoming sunlight and returns almost the same power to space as thermal infrared radiation. The present balance is not exact: rising greenhouse-gas concentrations, including carbon dioxide, have reduced outgoing radiation relative to absorbed sunlight, so the Earth system is now gaining a modest amount of energy and warming. Nevertheless, this imbalance is small compared with the continuously exchanged incoming and outgoing powers.

The enduring resource supplied by the Sun is therefore not net energy, but **free energy**—more precisely, radiative exergy or available work: energy arriving in a low-entropy, highly structured form. Earth degrades that structure and exports the same order of energy in a higher-entropy form. The resulting throughput drives the planet's nonequilibrium dynamics.

## Similar energy, radically different phase space

For a blackbody at temperature $T$, the photon number per physical volume, solid angle, and logarithmic frequency interval is

$$
\frac{\mathrm dN}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}
=\frac{2\nu^3}{c^3}\frac{1}{\exp(h\nu/k_{\mathrm B}T)-1}.
$$

Multiplication by $h\nu$ gives the corresponding energy distribution:

$$
\frac{\mathrm dE}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}
=h\nu\frac{\mathrm dN}{\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu}.
$$

After integration over frequency and an occupied solid angle $\Omega$, the photon number and energy scale as

$$
N\propto \Omega T^3,
\qquad
E\propto \Omega T^4.
$$

The Sun is hot, $T_\odot\simeq 5800\,\mathrm K$, but its disk occupies only
$\Omega_\odot\simeq 6.8\times10^{-5}\,\mathrm{sr}$. Terrestrial radiation is cool, with a characteristic temperature near $275\,\mathrm K$, and spreads over nearly the whole directional phase space. In the idealized comparison used here,

$$
\frac{E_\odot}{E_\oplus}
=\frac{\Omega_\odot}{4\pi}
\left(\frac{T_\odot}{T_\oplus}\right)^4
\simeq 1.
$$

The integrated energies are comparable, yet their distributions in $(\nu,\Omega)$ are not. Solar radiation is concentrated at higher frequencies and into a tiny cone; terrestrial radiation occupies lower frequencies and almost every direction. For ideal blackbody radiation, the entropy-to-energy ratio is

$$
\frac{S}{E}=\frac{4}{3T}.
$$

Thus the cooler outgoing radiation carries much more entropy per unit energy. The compact incoming distribution is precisely what makes sunlight thermodynamically valuable.

## Two ways Earth spends that free energy

Life uses the frequency structure directly. Visible solar photons carry energies of order a few electronvolts, enough to drive specific molecular transitions. Photosynthesis captures part of that radiative free energy as chemical free energy. Metabolism and ecosystems then consume it step by step, maintaining organized, nonequilibrium activity while dissipating energy and increasing total entropy.

Atmospheric and oceanic motion uses a different feature. Once sunlight is absorbed and thermalized, the identity of an individual high-energy photon is lost. What remains dynamically important is that the radiation arrived from a sharply selected direction. Together with planetary geometry, rotation, clouds, albedo, and the day-night cycle, this directionality creates uneven heating. Temperature and pressure gradients then drive winds, weather, and ocean circulation.

These are two uses of the same low-entropy input: spectral concentration can be converted into chemical free energy, while angular concentration produces spatially and temporally uneven heating.

## Visualization

<iframe
  src="app/index.html?lang=en"
  title="Frequency-direction phase space of idealized solar and terrestrial blackbody photons"
  style="display: block; width: 100%; height: 1240px; min-height: 760px; border: 0; overflow: hidden;"
  loading="eager"
  scrolling="no"
  data-auto-height
></iframe>

Each rendered point represents the same photon number. Point density therefore shows
$\mathrm dN/(\mathrm dV\,\mathrm d\Omega\,\mathrm d\ln\nu)$; brightness is not a second encoding. Radius represents frequency and direction from the origin represents $\Omega$.

## Suggested explorations

- Start with the linear radial scale. Notice the broad radial separation between terrestrial and solar photons, and the enormous angular contrast between a full sky and the solar disk.
- Switch to the logarithmic scale. The radial map changes, but both scales end at $1.5\,\mathrm{PHz}$ so the overall cloud remains comparable in size.
- Change the solar-disk magnification from $\times1$ to $\times10$. The cone becomes easier to see, while the solar solid angle, point count, and integrated ratios remain unchanged.
- Vary either temperature and compare the photon-number and energy ratios. The different $T^3$ and $T^4$ scalings explain why comparable energy does not imply comparable photon number.

## Conventions and limitations

This is a phase-space comparison, not a complete terrestrial radiation-budget model. It superposes an isotropic, uniform-temperature blackbody Earth and a uniform blackbody solar disk at $1\,\mathrm{AU}$. It omits reflection, wavelength-dependent absorption and emissivity, atmospheric transfer, limb darkening, surface geometry, horizon occultation, and day-night structure. The displayed frequency band is $1\,\mathrm{THz}$ to $1.5\,\mathrm{PHz}$, while the diagnostics use analytic integrals over all frequencies. Angular magnification is purely visual. Here “free energy” means availability relative to the terrestrial environment, not one particular Helmholtz or Gibbs state function.

Accordingly, the near-unity energy ratio should be read as the central scaling argument, not as a precision estimate of Earth's energy balance. A realistic calculation must include albedo, emitting area, effective radiating temperature, and atmospheric transfer.

## References

- [NASA Earth Observatory: Climate and Earth's Energy Budget](https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/)
- [IPCC AR6 Working Group I, Chapter 7: The Earth's Energy Budget, Climate Feedbacks, and Climate Sensitivity](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/)
