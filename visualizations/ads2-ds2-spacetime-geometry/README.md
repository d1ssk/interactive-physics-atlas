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

AdS arrays store ambient coordinates as $(X_{-1},X_1,X_0)$ and Plotly shows
them as $(X_1,X_0,X_{-1})$; dS arrays store $(X_0,X_1,X_2)$ and Plotly shows
$(X_1,X_2,X_0)$.  This places a spacelike direction on the horizontal axis in
both cases.  The AdS ambient metric is $\operatorname{diag}(-,+,-)$ and the dS
ambient metric is $\operatorname{diag}(-,+,+)$ in their respective stored orders.

The AdS quadric itself has periodic global time and therefore closed timelike
curves.  The causal panel explicitly displays the universal cover normally
meant by “AdS spacetime”; it is not another embedding of the same quadric.

## Build and test

From the repository root:

```bash
uv run pytest visualizations/ads2-ds2-spacetime-geometry/tests
uv run python scripts/build_visualizations.py
```
