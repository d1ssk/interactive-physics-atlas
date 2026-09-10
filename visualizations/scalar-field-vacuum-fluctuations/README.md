# Scalar-field vacuum fluctuations

Publication implementation promoted from `workbench/vacuum-fluctuation-lab`.
The browser runs the authoritative NumPy calculation in a self-hosted Pyodide
module Worker and renders its versioned, Plotly-independent arrays with the
shared Plotly `gl3d` bundle.

`physics.py` defines the regulated free-vacuum Wigner sample and exact lattice
evolution. `domain.py` returns one 2+1-dimensional spacetime history, one
independent three-spatial-dimensional equal-time draw, and their ensemble
equal-time correlations. `protocol.py`, `kernel.py`, and the runtime provider
form the bounded browser-compute boundary described in
`visualizations/BROWSER_COMPUTE.md`.

The fixed numerical domain is an `18^d` periodic spatial lattice of side 12.
The 2+1-dimensional view contains 17 time slices from -3 to 3. Runtime inputs
are limited to mass 0.15–1.60, cutoff fraction 0.25–0.85, and a non-negative
31-bit seed. Successful responses use a six-entry page-lifetime LRU cache;
new work supersedes old synchronous Worker work, and a 45-second timeout
terminates the Worker so that the next request can recover.

The initial HTML contains no field arrays. Built runtime assets include only
the vendored Pyodide core, NumPy, and a deterministic wheel containing the four
authoritative Python sources. The point and excursion-surface views within each
dimension use the same returned realization and synchronize their cameras.
