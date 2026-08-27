# Pyodide weight-runtime subset

- Pyodide: 314.0.6
- Python: 3.14.2
- Emscripten ABI: `pyemscripten_2026_0_wasm32`
- NumPy: 2.4.6
- Pyodide release: <https://github.com/pyodide/pyodide/releases/tag/314.0.6>
- Core archive: `pyodide-core-314.0.6.tar.bz2`
- Core archive SHA-256: `1016c31e39ce3764d9a418cbb491a392c802c1b86ccc1367f009f5c59bf8f5fd`
- NumPy wheel source: <https://cdn.jsdelivr.net/pyodide/v314.0.6/full/numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl>

Only the files required to start Pyodide and load NumPy are retained. The
package lock records NumPy wheel SHA-256
`32959d4137cec8143d75016d029281df3d2e80a232896ed903c2b59e1c44ee9f`.
The same digest is verified by repository tests.

Pyodide is licensed under MPL-2.0; see `LICENSE`. NumPy is BSD-3-Clause;
see `NUMPY-LICENSE.txt`. The NumPy wheel also retains licenses for bundled
components under its `.dist-info/licenses/` tree.
