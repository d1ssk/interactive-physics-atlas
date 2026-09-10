# Kelvin–Helmholtz instability

This article-embedded browser visualization compares the linear instability
spectrum of an inviscid two-fluid interface with a schematic nonlinear roll-up.

The linear model uses two incompressible, semi-infinite fluids, neglects gravity
and viscosity, and retains interfacial tension. The flow panel advects a signed
passive-scalar field with a divergence-free Kelvin–Stuart cat's-eye velocity
field whose bounded amplitude is driven by the selected linear growth rate.
This bridge is illustrative; it is not an exact nonlinear solution of the
two-fluid initial-value problem.

From the repository root:

```bash
uv run pytest visualizations/kelvin-helmholtz-instability/tests
uv run python scripts/build_visualizations.py
```
