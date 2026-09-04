# Asymmetric rigid body

Publication source for the torque-free asymmetric rigid-body visualization.

The browser app integrates the Euler equations and a body-to-space quaternion with RK4. It shows
the inertial-space attitude beside the angular-momentum sphere, energy ellipsoid, their
intersection, and the tangent Euler vector in the body frame. A second hands-on panel starts the
same body at rest and converts a screen-plane impulse at one of six principal-axis grip points into
the angular impulse $\mathbf r\times\mathbf J$, with the center of mass constrained.

Build with:

```bash
uv run python scripts/build_site.py
```

Run focused tests with:

```bash
uv run pytest visualizations/asymmetric-rigid-body/tests
```
