# Thermodynamic Functions of a One-Component System

A standalone bilingual browser application connecting quasistatic operations
on a one-mole system with the natural-variable surfaces of the molar
thermodynamic functions. The browser runtime uses a module worker and a Canvas
2D surface renderer, with no server-side runtime.

The ideal-gas model uses the Sackur–Tetrode entropy of argon. The educational
water model takes the stable lower envelope of solid, liquid, and vapor molar
Gibbs functions and preserves coexistence folds rather than smoothing them.

## Build and test

```bash
uv run pytest visualizations/single-component-thermodynamic-functions/tests
node --test visualizations/single-component-thermodynamic-functions/tests/physics.test.mjs
uv run python scripts/build_visualizations.py
```
