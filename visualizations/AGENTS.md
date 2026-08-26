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
7. Support direct `file://` viewing. In Chrome, a file parent reports `location.origin` as
   `file://`, child messages arrive with `event.origin === "null"`, the parent cannot read
   `iframe.contentDocument`, and the child can have `window.frameElement === null`. Therefore:
   - accept a `"null"` message origin only when the receiving page uses the `file:` protocol
   - on the parent, also require `event.source` to equal the target iframe's `contentWindow`
   - never rely exclusively on direct `frameElement` mutation or same-origin DOM inspection
   - use the existing file-only debounced `MutationObserver` fallback because Chrome may suppress
     `ResizeObserver` delivery in an opaque-origin child frame
8. Any interaction that changes application height—tabs, expanding details, localized text,
   responsive reflow, or dynamically rendered mathematics—must trigger the reporting lifecycle.

Height QA must exercise the built site, not a manually edited generated file. At minimum, verify
English and Japanese over both HTTP and `file:///.../site/...`, change every height-changing panel
at least once, and compare the iframe client height with the rounded bottom of `main`. Also inspect
the rendered bottom edge visually; equality with `documentElement.scrollHeight` alone can miss the
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

Unless a visualization has a documented interaction-specific reason to do
otherwise, Cartesian 2D plots must start with `dragmode="pan"`, and 3D scenes
must start with `dragmode="turntable"`. Keep zoom available through the wheel,
trackpad, or mode bar. Selection, lasso, drawing, or box zoom may be the initial
drag mode only when that gesture is part of the intended scientific interaction.
