# Lie roots, weights, and tensor products

Publication implementation of the rank-2/rank-3 Lie-algebra workbench. The
scientific calculations live in `physics.py`; versioned browser-transfer schemas
live in `domain.py`; the Plotly renderer and static application builder live in
`visualization.py`. `protocol.py` and `kernel.py` define the language-neutral
compute boundary used by native Python and the self-hosted Pyodide module Worker.
`runtime_build.py` packages those authoritative sources into a deterministic
wheel during the static build.

The application depends only on the provider's JSON `compute(request)` boundary.
A future Wasm provider may implement that protocol, but it must first adopt an
explicit single-source strategy for the mathematical formulas; a separately
maintained Wasm rewrite of `physics.py` is not an acceptable second authority.
Domain adapters round non-authoritative display coordinates to 12 decimal places
so native NumPy and Pyodide NumPy produce identical transfer data; exact Dynkin
coordinates, multiplicities, dimensions, and conventions are not rounded.

Conventions and usage are documented on the matching page under
`docs/mathematics-for-physics/lie-roots-weights-products/`.
