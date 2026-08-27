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

All controls, instructions, status messages, errors, and accessibility labels must support
English and Japanese. Keep user-facing strings in locale dictionaries rather than scattering
language-specific branches through interaction code. Test that both locale paths are present.

Use LaTeX rendering for mathematical expressions in the application UI. Plot-internal text,
including axes, legends, hover text, and Plotly controls, remains English in both site languages
so that one scientifically identical figure payload can be shared.

## MathJax application contract

- Use the vendored MathJax TeX-to-SVG bundle. Do not add a CDN dependency.
- Stage MathJax with `physics_atlas.assets.copy_mathjax_assets(output_dir)` and load the copied
  `mathjax-tex-svg.js` as a deferred external asset. Do not inline the multi-megabyte bundle into
  `index.html`; doing so delays parsing, height reporting, and first content display.
- Define the MathJax configuration before loading the bundle.
- Dynamic UI text that contains LaTeX must be passed through MathJax after every relevant update.
  Wait for `MathJax.startup.promise`, clear previous typesetting for changed targets, and use
  `typesetPromise` rather than assuming initial page typesetting covers later content.
- Long dynamic equations must remain usable at narrow widths. Because one MathJax inline
  expression does not wrap naturally, split it into structured LaTeX chunks at mathematically
  valid breakpoints such as `\oplus`, keep each operator with its continuation term, and allow
  the chunks to wrap. Do not clip the equation or expose raw LaTeX as a fallback.
- Emit or handle `physics-atlas:mathjax-ready` when MathJax completion can change application
  height. Raw commands such as `\begin{pmatrix}` must never remain visible in either locale.
- Keep structural code notation only where it is genuinely code-like. Mathematical Lie types,
  weights, tensor products, matrices, and variables should normally be rendered as mathematics.

## Embedded frame sizing contract

New visualizations must follow the existing parent/child auto-height protocol. Do not introduce a
second measurement formula without an explicit repository-wide change.

1. Wrap the complete application content in `main`.
2. Report height from the child with the `physics-atlas:frame-height` message and accept
   `physics-atlas:request-frame-height` requests from the parent.
3. Measure content as the maximum of `main.getBoundingClientRect().bottom` and
   `document.body.getBoundingClientRect().height`, rounded up. Do not use `main.scrollHeight` or
   `document.documentElement.scrollHeight`; those values can depend on the current iframe viewport
   and preserve an oversized fallback.
4. On the first valid measurement, set the iframe `min-height` to zero, set its exact height,
   disable scrolling, and keep overflow hidden. The large inline height in the Markdown page is a
   loading fallback, not a permanent minimum.
5. Report synchronously after the `main` markup and before parsing large application data. Report
   again on load, resize, MathJax readiness, font readiness, and explicit parent requests.
6. Observe body and main size changes with `ResizeObserver`, retain the observer for the page
   lifetime, and disconnect it on `pagehide`.
7. Support the published HTTP/HTTPS execution contract. Visualization iframes and their parent
   pages are same-origin in the built site. Therefore:
   - send messages to the explicit `window.location.origin`, never `"*"`
   - require both the expected origin and expected parent/frame window when receiving messages
   - retain both the child height report and parent same-origin measurement paths
   - use `ResizeObserver` for content-size changes; do not add a second `file://`-only observer or
     loader path
   - treat direct `file://` opening as unsupported; local browser QA must serve the built site over
     loopback HTTP
8. Any interaction that changes application height—tabs, expanding details, localized text,
   responsive reflow, or dynamically rendered mathematics—must trigger the reporting lifecycle.

Height QA must exercise the built site, not a manually edited generated file. At minimum, serve
`site/` over loopback HTTP, verify English and Japanese, change every height-changing panel at
least once, and compare the iframe client height with the rounded bottom of `main`. Also inspect the
rendered bottom edge visually; equality with `documentElement.scrollHeight` alone can miss the
original trailing-whitespace failure.

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

When a published visualization does require Pyodide, Wasm, or another browser
calculation runtime, follow `BROWSER_COMPUTE.md`. In particular, preserve the
authoritative physics/domain/protocol/provider boundaries, define limits and
cache invalidation before implementation, and exercise the final built Worker
path over loopback HTTP in the required browser matrix.

Unless a visualization has a documented interaction-specific reason to do
otherwise, Cartesian 2D plots must start with `dragmode="pan"`, and 3D scenes
must start with `dragmode="turntable"`. Keep zoom available through the wheel,
trackpad, or mode bar. Selection, lasso, drawing, or box zoom may be the initial
drag mode only when that gesture is part of the intended scientific interaction.
