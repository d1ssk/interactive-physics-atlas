# Energy Scale Atlas

A dependency-free standalone bilingual application comparing physical mass and energy scales from
the present Hubble energy to the conventional Planck mass. The vertical coordinate is linear in
`log10(E / eV)` and the live cursor converts energy to the reduced natural-unit scales
`hbar*c/E`, `hbar/E`, and `E/k_B`.

Thin rules represent point values. Soft bands represent object-dependent, unresolved, conventional,
or model-dependent ranges rather than necessarily statistical error bars. Rest masses, thermal
energies, collision energies, and fourth roots of energy densities share the axis but are identified
separately in their details.

The cosmic-age readout is an orientation aid based on a radiation-dominated approximation with a
coarse step model for effective relativistic degrees of freedom; it is not a precision cosmology
calculation. The endpoint is the conventional Planck mass, with the reduced Planck scale shown
separately.

Build through `uv run python scripts/build_site.py`; serve `site/` over loopback HTTP for browser QA.
