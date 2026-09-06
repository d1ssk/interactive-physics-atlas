"""Build the self-hosted Pyodide runtime and partial-wave kernel wheel."""

from __future__ import annotations

import base64
import hashlib
import shutil
import zipfile
from pathlib import Path

from physics_atlas.assets import (
    PYODIDE_NUMPY_VERSION,
    PYODIDE_PYTHON_VERSION,
    PYODIDE_VERSION,
    copy_pyodide_runtime_assets,
)

from .protocol import (
    COMPUTE_PROTOCOL_SCHEMA,
    DEFAULT_MAX_ELAPSED_MS,
    ERROR_CODES,
    HARD_MAX_ELAPSED_MS,
    KERNEL_VERSION,
    MAX_ELL,
    MAX_SCATTER_ELL,
    MEMORY_CACHE_MAX_ENTRIES,
    PLANE_OPERATION,
    PLANE_RESULT_SCHEMA,
    RESULT_SCHEMAS,
    SCATTER_OPERATION,
    SCATTER_RESULT_SCHEMA,
)

RUNTIME_DIRECTORY_NAME = "runtime"
PROVIDER_ASSET_NAME = "pyodide-compute-provider-v1.mjs"
WORKER_ASSET_NAME = "partial-wave-compute-worker-v1.mjs"
KERNEL_DISTRIBUTION = "physics_atlas_partial_wave_kernel"
KERNEL_WHEEL_NAME = f"{KERNEL_DISTRIBUTION}-{KERNEL_VERSION}-py3-none-any.whl"
KERNEL_SOURCE_NAMES = ("physics.py", "domain.py", "protocol.py", "kernel.py")
_ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def runtime_manifest() -> dict[str, object]:
    """Return lightweight configuration embedded in the initial HTML."""

    return {
        "protocol": COMPUTE_PROTOCOL_SCHEMA,
        "operations": {
            "plane": {"name": PLANE_OPERATION, "resultSchema": PLANE_RESULT_SCHEMA},
            "scattering": {
                "name": SCATTER_OPERATION,
                "resultSchema": SCATTER_RESULT_SCHEMA,
            },
        },
        "resultSchemas": dict(RESULT_SCHEMAS),
        "kernelVersion": KERNEL_VERSION,
        "providerAsset": PROVIDER_ASSET_NAME,
        "workerAsset": WORKER_ASSET_NAME,
        "pyodideVersion": PYODIDE_VERSION,
        "pythonVersion": PYODIDE_PYTHON_VERSION,
        "numpyVersion": PYODIDE_NUMPY_VERSION,
        "limits": {
            "maxEll": MAX_ELL,
            "maxScatterEll": MAX_SCATTER_ELL,
            "maxElapsedMs": DEFAULT_MAX_ELAPSED_MS,
            "hardMaxElapsedMs": HARD_MAX_ELAPSED_MS,
            "memoryCacheEntries": MEMORY_CACHE_MAX_ENTRIES,
        },
        "errorCodes": list(ERROR_CODES),
    }


def _zip_info(name: str) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, _ZIP_TIMESTAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    return info


def _record_entry(name: str, contents: bytes) -> str:
    digest = base64.urlsafe_b64encode(hashlib.sha256(contents).digest()).rstrip(b"=").decode()
    return f"{name},sha256={digest},{len(contents)}"


def build_kernel_wheel(source_dir: Path, output_path: Path) -> None:
    """Build a deterministic pure-Python wheel from the authoritative sources."""

    dist_info = f"{KERNEL_DISTRIBUTION}-{KERNEL_VERSION}.dist-info"
    entries: dict[str, bytes] = {
        f"{KERNEL_DISTRIBUTION}/__init__.py": (
            '"""Interactive Physics Atlas partial-wave kernel."""\n\n'
            f'__version__ = "{KERNEL_VERSION}"\n'
        ).encode(),
        f"{dist_info}/METADATA": (
            "Metadata-Version: 2.1\n"
            "Name: physics-atlas-partial-wave-kernel\n"
            f"Version: {KERNEL_VERSION}\n"
            "Summary: Partial-wave computation kernel for Interactive Physics Atlas\n"
            "License: MIT\n"
            "Requires-Python: >=3.12\n"
            "Requires-Dist: numpy\n"
        ).encode(),
        f"{dist_info}/WHEEL": (
            b"Wheel-Version: 1.0\n"
            b"Generator: Interactive Physics Atlas\n"
            b"Root-Is-Purelib: true\n"
            b"Tag: py3-none-any\n"
        ),
        f"{dist_info}/licenses/LICENSE": (source_dir.parents[1] / "LICENSE").read_bytes(),
    }
    for source_name in KERNEL_SOURCE_NAMES:
        entries[f"{KERNEL_DISTRIBUTION}/{source_name}"] = (source_dir / source_name).read_bytes()
    record_path = f"{dist_info}/RECORD"
    entries[record_path] = (
        "\n".join(
            [
                *(_record_entry(name, contents) for name, contents in sorted(entries.items())),
                f"{record_path},,",
            ]
        )
        + "\n"
    ).encode()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_path, "w") as wheel:
        for name, contents in sorted(entries.items()):
            wheel.writestr(_zip_info(name), contents)


def build_runtime_assets(output_dir: Path, source_dir: Path) -> Path:
    """Stage provider, Worker, minimal Pyodide/NumPy subset, and kernel wheel."""

    runtime_dir = output_dir / RUNTIME_DIRECTORY_NAME
    if runtime_dir.exists():
        shutil.rmtree(runtime_dir)
    runtime_dir.mkdir(parents=True)
    source_runtime = source_dir / "runtime"
    shutil.copy2(source_runtime / PROVIDER_ASSET_NAME, runtime_dir / PROVIDER_ASSET_NAME)
    worker = (source_runtime / WORKER_ASSET_NAME).read_text(encoding="utf-8")
    replacements = {
        "__COMPUTE_PROTOCOL__": COMPUTE_PROTOCOL_SCHEMA,
        "__KERNEL_VERSION__": KERNEL_VERSION,
        "__PLANE_OPERATION__": PLANE_OPERATION,
        "__PLANE_RESULT_SCHEMA__": PLANE_RESULT_SCHEMA,
        "__SCATTER_OPERATION__": SCATTER_OPERATION,
        "__SCATTER_RESULT_SCHEMA__": SCATTER_RESULT_SCHEMA,
        "__KERNEL_WHEEL__": KERNEL_WHEEL_NAME,
        "__PYODIDE_VERSION__": PYODIDE_VERSION,
        "__PYTHON_VERSION__": PYODIDE_PYTHON_VERSION,
        "__NUMPY_VERSION__": PYODIDE_NUMPY_VERSION,
    }
    for placeholder, value in replacements.items():
        worker = worker.replace(placeholder, value)
    if any(placeholder in worker for placeholder in replacements):
        raise ValueError("unresolved partial-wave Worker placeholder")
    (runtime_dir / WORKER_ASSET_NAME).write_text(worker, encoding="utf-8")
    copy_pyodide_runtime_assets(runtime_dir / "pyodide")
    build_kernel_wheel(source_dir, runtime_dir / KERNEL_WHEEL_NAME)
    return runtime_dir
