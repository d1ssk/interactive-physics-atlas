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
