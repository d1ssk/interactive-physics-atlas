# Visualization-specific instructions

Each visualization lives in:

    visualizations/<slug>/

Required files:

    metadata.yml
    physics.py
    visualization.py
    tests/

## physics.py

Must contain physical or mathematical computation only.

Do not import Plotly or site-generation code here.

Functions should be independently testable.

## visualization.py

Must expose:

    build(output_dir: pathlib.Path) -> None

The build function must produce:

    output_dir/index.html

Published output must work as a static website without a Python server.

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