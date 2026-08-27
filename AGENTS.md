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
  - English public-facing explanatory material and shared site assets

- `docs_ja/`
  - Japanese counterparts of every public page in `docs/`

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
10. Published content supports English (`en`) and Japanese (`ja`). Every public page and
    every user-facing string must be available in both languages.
11. The site brand is always `Interactive Physics Atlas`. It links to the home page for
    the current language and is displayed without a separate logo icon.
12. Language switches must point to the corresponding page, not merely the other-language
    home page.
13. Translation must never change a physical equation, mathematical convention, numerical
    result, or plot data.
14. Published applications are supported over HTTP/HTTPS. Use a loopback HTTP server for local
    browser QA; direct `file://` viewing is unsupported and must not drive alternate loaders,
    wildcard messaging, or browser-specific fallback paths.

## Bilingual content policy

- English pages live under `docs/`; Japanese pages live at the same relative paths under
  `docs_ja/`. Add or revise both languages in the same change.
- Keep section structure, equations, links, visualization embeds, and scientific scope aligned
  across languages. Translation must not create a second scientific or figure-data variant.
- Localize every user-facing control, instruction, status, error, and accessibility label.
  Plot-internal text—including axes, legends, hover text, and Plotly controls—remains English in
  both languages so a single figure payload can be shared.
- `Interactive Physics Atlas` is the untranslated site brand and home link. Do not place a logo
  icon beside it. Page headings and visualization UI titles may be localized.
- Write natural technical Japanese rather than translating English syntax mechanically. For
  short summaries and card descriptions, prefer concise noun-ending phrases when natural; avoid
  repeatedly ending descriptions with `を対話的に探究します。`.
- Use `インタラクティブ`, not `対話的`, when that adjective is needed.
- Use these established section names consistently:
  - Relativity: `相対論`
  - Quantum Field Theory: `場の量子論`
  - Mathematics for Physics: `物理数学`
- When a listing contains both a title and a description, render them as distinct lines with the
  same left edge. Do not simulate the line break with trailing spaces or encoded whitespace.

## Mathematical typography policy

- Mathematical notation in prose or application UI must be authored as LaTeX and rendered as
  mathematics. Raw LaTeX commands must not be exposed to readers.
- Reserve code formatting for literal commands, file names, identifiers, and genuinely code-like
  input. A Lie type, weight, matrix, equation, or mathematical variable is normally mathematics,
  not code.
- Translation must preserve the exact equation, convention, indices, symbols, and numerical
  result. Only surrounding prose may change.
- Follow the more specific rendering rules in `docs/AGENTS.md` and
  `visualizations/AGENTS.md` when editing those trees.

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
