# Two-dimensional conformal transformations

Published visualization consolidating the former `complex_func`,
`mobius_sphere_visualization`, `virasoro`, and `sct` notebooks.

## Learning structure

1. **Local:** `delta w = A delta z + B delta zbar`; small-circle distortion,
   local singular values, and orientation.
2. **Global:** homogeneous CP1 coordinates and the action of `PSL(2,C)` on the
   Riemann sphere, including fixed points and cross-ratio invariance.
3. **Infinitesimal:** Witt generators `ell_m=-z^(m+1) partial_z` and their
   finite local flows, with arrow direction and relative vector-field magnitude.

Range sliders vary the antiholomorphic mixing coefficient in
`f(z)=z+lambda zbar` and the finite Witt-flow parameter.  Slider states are
precomputed through `physics.py`, so the standalone browser app does not carry
a second, divergent copy of the mathematical formulas.

The app deliberately distinguishes two claims that were blurred in the old
notebooks.  Every holomorphic map with nonzero derivative is locally conformal,
but only the modes `m=-1,0,1` generate globally defined holomorphic
automorphisms of the Riemann sphere.  Finite plots for other modes select the
principal complex-power branch and must be read locally.

The old 2D/3D real-vector-field SCT notebook is represented here by the
holomorphic two-dimensional special conformal map `z -> z/(1+epsilon z)`.
Higher-dimensional Euclidean SCTs should become a separate future visualization
because their parameter count and geometry are different.

## Build and test

From the repository root:

```bash
uv run pytest visualizations/conformal-transformations-2d/tests
uv run python scripts/build_visualizations.py
```
