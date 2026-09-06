# Partial-wave scattering

Publication implementation of the Python/Plotly workbench prototype. All
physical formulas and numerical work live in `physics.py`. `domain.py` converts
only the currently requested state to compact, Plotly-independent arrays.
`protocol.py` and `kernel.py` expose the same versioned JSON boundary to native
tests and to the self-hosted Pyodide module Worker.

The initial page contains no figure frames or numerical field grids. The
browser builds Plotly traces from one Python result at a time. Plane-wave and
potential controls supersede obsolete work, and successful results use a
page-lifetime LRU cache. The Worker loads only Pyodide core, NumPy, and the
deterministically built authoritative kernel wheel; SciPy is intentionally not
part of the browser payload.

The scattering convention is
$\hbar^2/(2\mu)=1$, hence $E=k^2$, with an incident wave in the positive
$z$ direction. The displayed scattering field is the asymptotic exterior form;
the potential interior is masked.
