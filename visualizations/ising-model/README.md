# Ising model visualization

This visualization implements the zero-field ferromagnetic Ising model on
periodic 1D, 2D, and 3D hypercubic lattices.  The authoritative conventions and
seeded reference implementation live in `physics.py`; the JavaScript module
Worker mirrors that kernel and is checked against deterministic trajectories.

The 3D display is deliberately a selectable 2D slice of the simulated cubic
lattice.  This keeps main-thread rendering and Worker transfer bounded while
the observables are always computed from the complete 3D state.

## Runtime limits

- dimensions: 1, 2, 3
- maximum sites and snapshot bytes: 9,216
- maximum Worker batch: 8 sweeps
- display update rates: 5, 10, or 20 Hz
- recent-history samples: 240

Snapshots are transferred as `Int8Array` buffers.  Requests and responses use
`physics-atlas.ising.v1`, generation IDs suppress stale state, and rendering
remains on the main thread.  No Pyodide, Wasm, backend service, or `file://`
fallback is used.

The thermodynamic reference plot uses exact 1D expressions and the exact 2D
Onsager--Yang magnetization and energy.  Its 2D heat-capacity curve is a finite
difference of the exact energy curve, so the finite plotted peak represents the
logarithmic singularity only at the chart resolution.  No exact 3D curve is
shown.
