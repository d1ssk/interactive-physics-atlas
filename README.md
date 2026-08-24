# Interactive Physics Atlas

An interactive visual atlas of physical and mathematical concepts.

## Purpose

Interactive Physics Atlas collects rigorous interactive visualizations designed to make
physical ideas, mathematical structures, symmetries, and dynamics directly explorable.

The atlas is organized around:

- Quantum mechanics
- Electromagnetism
- Statistical mechanics
- Condensed matter physics
- Quantum field theory
- Relativity
- String theory
- Mathematical physics

## Development

The project uses Python 3.12 and [uv](https://docs.astral.sh/uv/) for its development
environment. The essential commands are:

```bash
uv sync --frozen
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run python scripts/validate_metadata.py
uv run python scripts/build_site.py
uv run zensical serve
```

The main repository areas are:

```text
workbench/       local exploration
visualizations/  publication-quality visualization source
docs/            public-facing explanations
site/            generated output; never edit or commit
```

Repository-specific development rules live in `AGENTS.md`.

## License

This project is available under the MIT License.
