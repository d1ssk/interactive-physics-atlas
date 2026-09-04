# Complex Function Lab

A standalone bilingual browser application for complex-valued functions. It
supports domain coloring, paired real/imaginary plots, expressions in `z`,
`x,y`, or `z,zbar`, pathwise analytic continuation, and incremental contour
integration.

The background sheet can follow the path automatically. Each multivalued
syntax node tracks its own unwrapped argument, so crossing a displayed cut in
opposite directions selects opposite sheet offsets. This is analytic
continuation along a lifted path; the cut itself is only a convention for a
single-valued chart.

The numerical kernel in `static/physics.mjs` has no DOM dependencies and is
tested directly with Node. `physics.py` supplies reference calculations for
the same continuation and trapezoidal-integration conventions.

## Build and test

```bash
uv run pytest visualizations/complex-functions/tests
node --test visualizations/complex-functions/tests/physics.test.mjs
uv run python scripts/build_visualizations.py
```
