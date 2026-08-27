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

## Browser runtime policy

The provider executes at most one request at a time. A newer request supersedes
older work; explicit cancellation and the 30-second default timeout terminate
the module Worker because synchronous Python execution cannot be interrupted
reliably in place. The next request creates a fresh Worker and reloads the
self-hosted runtime. The protocol rejects elapsed-time budgets above 60 seconds,
Dynkin labels above 8, candidate lattices above 250,000 points, and results above
20,000 distinct weights. Runtime tensor products accept exactly two factors and
add a 250,000 weight-pair default budget with a 2,000,000 hard ceiling. Existing
three-factor examples remain explicit static presets.

Successful results use a page-lifetime, in-memory LRU cache with at most 16
entries. Its canonical key includes the compute and result schemas, kernel
version, Pyodide runtime identity, operation, mathematical input, and
result-affecting limits. Errors are never cached. Reloading the page, disposing
the provider, or changing any versioned identity invalidates the cache. There is
deliberately no IndexedDB persistence yet; a future persistent cache must define
its storage cap and eviction and invalidation rules before adoption.

The build keeps the provider below 24 KiB and Worker bootstrap below 12 KiB and
tests those limits. Local browser QA must serve the complete `site/` directory
over loopback HTTP rather than open generated files with `file:`. Verify the
module and wheel responses use a JavaScript-compatible MIME type and the Wasm
response uses `application/wasm`; exercise cold calculation, warm calculation,
cache reuse, cancellation/replacement, timeout recovery, and both locales.

The repository-wide form of these decisions—including versioning, dependency
registries, validation layers, IndexedDB prerequisites, and the future Wasm
source-of-truth requirement—is documented in `../BROWSER_COMPUTE.md`.

Conventions and usage are documented on the matching page under
`docs/mathematics-for-physics/lie-roots-weights-products/`.
