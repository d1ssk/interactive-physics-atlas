# Documentation instructions

Documentation should explain the physics, not merely describe controls.

Each visualization page should contain:

1. the physical idea
2. the relevant equations
3. the interactive visualization
4. suggested things to try
5. what the reader should notice
6. conventions and limitations
7. references when useful

Every English page under `docs/` must have a Japanese counterpart at the same relative path
under `docs_ja/`. Keep the section structure, equations, links, and iframe behavior aligned.

Use LaTeX math delimiters for mathematical symbols, relations, matrices, and displayed
equations. Reserve code formatting for literal commands, file names, identifiers, and user
input that is genuinely code-like.

Prefer `$...$` for inline mathematics and `$$...$$` for display mathematics in Markdown unless
the surrounding renderer specifically requires `\(...\)` or `\[...\]`. Confirm the production
build renders the expression; source containing LaTeX is not sufficient evidence. Never replace
an equation with a plain-text or code-formatted approximation merely to avoid a rendering issue.

For Japanese prose:

- use the repository-wide terminology in the root `AGENTS.md`
- use `インタラクティブ`, not `対話的`
- prefer concise noun-ending summaries where natural instead of repeatedly writing
  `を対話的に探究します。`
- keep equations, links, section order, and visualization behavior identical to the English page

## Visualization embeds

Every published visualization iframe must:

- use `data-auto-height` and `scrolling="no"`
- provide a conservative inline initial `height` and `min-height` only as a loading fallback
- use the shared `javascripts/visualization-frame-resizer.js`
- load the corresponding static application for the current language

The fallback height is not the final layout. The child application must replace it with a measured
height using the contract in `visualizations/AGENTS.md`. Do not remove the fallback to hide blank
space, and do not increase it to hide clipping, without verifying the complete resize lifecycle.

After changing an embed or its surrounding layout, build the complete site and verify all of the
following:

- English and Japanese pages
- the built site served over loopback HTTP and the production HTTP/HTTPS path
- initial load and every UI state that materially changes height
- a desktop width and a narrow mobile width
- the iframe bottom is aligned with the last meaningful child element, not merely that
  `iframe.clientHeight === document.documentElement.scrollHeight`

`documentElement.scrollHeight` alone is not a sufficient QA signal because it can inherit the
iframe viewport height and conceal trailing blank space.

Do not add a public `Checks performed` section or another developer-oriented test checklist.
Keep verification in tests and developer documentation. A scientifically meaningful invariant
may still be explained where it helps the reader understand the subject.

Prefer natural technical Japanese over word-for-word translation. Keep established terminology
and all mathematical conventions consistent across languages.

Assume a technically sophisticated reader.

Prefer concise mathematical explanation over introductory textbook
padding.

Do not claim that a visualization demonstrates more than it actually
does.
