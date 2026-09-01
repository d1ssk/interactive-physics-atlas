# Visualization template

Copy this structure with `scripts/new_visualization.py`. Put testable physics or mathematics in
`physics.py`, rendering and interaction in `visualization.py`, and meaningful scientific
invariants in `tests/`.

Every application must load the staged `visualization-theme.css` and
`visualization-theme.js` assets. Use the shared `--atlas-viz-*` tokens only for foundational
surfaces, borders, controls, focus, and the basic accent. Keep colors with scientific or status
meaning in the visualization's own stylesheet or rendering code.

The template is a developer reference and is never discovered or published as a visualization.
