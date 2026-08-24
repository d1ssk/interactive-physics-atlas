# Interactive Physics Atlas

## Project purpose

This repository contains rigorous interactive visualizations of
physical and mathematical concepts.

The primary goal is conceptual clarity and physical correctness.
Visual appeal is important, but must never override correctness.

## Repository architecture

- `workbench/`
  - local exploratory work
  - unrestricted
  - not publication quality
  - normally ignored by git

- `visualizations/`
  - publication-quality visualization source code

- `docs/`
  - public-facing explanatory material

- `src/physics_atlas/`
  - shared infrastructure and utilities

- generated site files must never be manually edited

## Development rules

1. Keep physics calculations separate from visualization/UI code.
2. Physics logic belongs in `physics.py`.
3. Rendering and interaction belong in `visualization.py`.
4. Add tests for meaningful physical or mathematical invariants.
5. Do not duplicate physical formulas across UI code when they can
   be called from the physics layer.
6. Prefer simple implementations over unnecessary framework complexity.
7. Prefer static browser-native outputs when possible.
8. Do not introduce a server dependency for published visualizations
   without an explicit architectural decision.
9. Do not modify unrelated visualizations when implementing one feature.

## Validation

Before considering a change complete, run:

    uv run ruff check .
    uv run ruff format --check .
    uv run pytest
    uv run python scripts/validate_metadata.py
    uv run python scripts/build_site.py

All must succeed.

## Physics policy

A visualization should test physically meaningful invariants whenever
possible.

Examples include:

- wavefunction normalization
- orthogonality
- conserved quantities
- known limiting behavior
- symmetry relations
- Lie-algebra root/weight identities
- embedding constraints
- unitarity relations

Never change an equation or physical convention merely to improve
the visual appearance.

If a convention is ambiguous, document the convention explicitly.

## Git policy

- `main` must remain publishable.
- Nontrivial work should be done on a feature branch.
- Do not commit generated site output.