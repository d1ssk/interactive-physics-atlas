# AdS2 and dS2 spacetime geometry

Published visualization of the constant-curvature spacetime material from the
former `workbench/ads` notebooks.

## Scope

- AdS2 in global and Poincare coordinates
- dS2 in global, expanding-flat, and static coordinates
- orthonormal and null frames with a local Lorentz boost
- timelike, spacelike, and null geodesics from ambient-space formulas
- conformal diagrams distinguishing AdS timelike infinity from dS spacelike infinity
- range sliders for a selected coordinate point, its coordinate lines/local frame,
  and the frame rapidity
- camera-preserving Plotly updates, so slider interaction does not reset a
  user-selected 3D viewpoint
- in-app general-dimensional formulas and detailed global/Poincare/flat/static
  coordinate guides

The ambient-coordinate order is `(X0, X1, X2)`.  The Plotly axes are reordered
to `(X1, X2, X0)` for readability.  The AdS ambient metric is `diag(-,+,-)`;
the dS ambient metric is `diag(-,+,+)`.

The AdS quadric itself has periodic global time and therefore closed timelike
curves.  The causal panel explicitly displays the universal cover normally
meant by “AdS spacetime”; it is not another embedding of the same quadric.

## Build and test

From the repository root:

```bash
uv run pytest visualizations/ads2-ds2-spacetime-geometry/tests
uv run python scripts/build_visualizations.py
```
