# Cosmic Causal Structure

Publication source for the bilingual four-panel FLRW causal-structure visualization.

The physics layer integrates a flat radiation + matter + cosmological-constant background and
optionally prepends a finite constant-H inflationary stage. The browser application receives only
precomputed arrays and uses the repository's pinned Plotly bundle.

From the repository root:

```bash
uv run pytest visualizations/cosmic-causal-structure/tests
uv run python scripts/build_site.py
python -m http.server --bind 127.0.0.1 --directory site 8000
```

Then open the English or Japanese page over HTTP:

- `http://127.0.0.1:8000/cosmology/cosmic-causal-structure/`
- `http://127.0.0.1:8000/ja/cosmology/cosmic-causal-structure/`
