# Visualization-specific instructions

Each published visualization owns one directory:

    visualizations/<slug>/

Required files:

    metadata.yml
    visualization.py
    tests/

The directory is the ownership boundary for that visualization's
implementation, tests, and visualization-specific assets. A visualization
must not import implementation code from another visualization directory.

## Internal structure

For a small visualization, prefer the simple layout:

    physics.py
    visualization.py

As a visualization grows, split physics, mathematics, rendering, or
interaction code into meaningfully named modules or packages within the same
directory. `visualization.py` is a stable build entry point, not a requirement
that all rendering and interaction code live in one file.

Avoid catch-all modules such as `common.py`. Name modules after the concepts or
responsibilities they implement.

## Physics and mathematics

Physics and mathematical computation must be kept separate from rendering and
interaction code. It may live in `physics.py` or in multiple dedicated modules
or a package.

Do not import Plotly or site-generation code into the scientific computation
layer.

Functions should be independently testable.

## visualization.py

Must expose:

    build(output_dir: pathlib.Path) -> None

The build function must produce:

    output_dir/index.html

Published output must work as a static website without a Python server.

`visualization.py` may delegate to rendering, interaction, or asset-generation
modules in the same visualization directory.

## Shared code

Implement visualization-specific code locally first. Reuse suitable utilities
from `src/physics_atlas/` when they already exist.

Move code to `src/physics_atlas/` when it represents a stable abstraction that
is genuinely useful across visualizations. Keep scientific computation and
rendering infrastructure separated in the shared layer as well. Do not create
shared abstractions solely in anticipation of possible future reuse.

## Tests

Tests should prioritize physical correctness rather than implementation
details.

Whenever practical, test:

- normalization
- symmetry
- analytic limits
- dimensional consistency
- known special cases

## Plotly

Prefer Plotly for standard interactive 2D/3D visualizations.

Avoid using browser-side Python unless runtime numerical computation is
genuinely required.
