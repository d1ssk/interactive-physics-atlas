# Visualization template

Copy this structure with `scripts/new_visualization.py`. For a small visualization, put testable
physics or mathematics in `physics.py`, rendering and interaction in `visualization.py`, and
meaningful scientific invariants in `tests/`.

As the visualization grows, split its implementation into meaningfully named modules or packages
inside this directory. Keep `visualization.py` as the build entry point, and keep scientific
computation independent from rendering and interaction code. Promote code to `src/physics_atlas/`
only when it is genuinely reusable across visualizations.

The template is a developer reference and is never discovered or published as a visualization.
