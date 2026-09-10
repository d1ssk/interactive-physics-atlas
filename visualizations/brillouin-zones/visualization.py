"""Build the static bilingual crystal-lattice and Brillouin-zone application."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np

from physics_atlas.assets import (
    PLOTLY_GL3D_ASSET_NAME,
    copy_mathjax_assets,
    copy_visualization_theme_assets,
)

from .physics import (
    LATTICES,
    cell_edges,
    cell_vertices,
    first_brillouin_zone,
    lattice_points,
    polyhedron_edges,
    polyhedron_triangles,
    reciprocal_basis,
)

SOURCE_DIR = Path(__file__).resolve().parent
STATIC_DIR = SOURCE_DIR / "static"


def _line_coordinates(points: np.ndarray, edges: list[tuple[int, int]]) -> list[list[float | None]]:
    coordinates: list[list[float | None]] = [[], [], []]
    for left, right in edges:
        for axis in range(3):
            coordinates[axis].extend([float(points[left, axis]), float(points[right, axis]), None])
    return coordinates


def _payload() -> dict[str, dict[str, object]]:
    payload: dict[str, dict[str, object]] = {}
    for key, lattice in LATTICES.items():
        primitive = lattice.primitive
        reciprocal = reciprocal_basis(primitive)
        zone_vertices, zone_faces = first_brillouin_zone(primitive)
        primitive_cell = cell_vertices(primitive)
        payload[key] = {
            "primitive": primitive.T.tolist(),
            "reciprocal": reciprocal.T.tolist(),
            "realPoints": lattice_points(primitive, shell=2).tolist(),
            "reciprocalPoints": lattice_points(reciprocal, shell=1).tolist(),
            "cellLines": _line_coordinates(primitive_cell, cell_edges()),
            "zoneVertices": zone_vertices.tolist(),
            "zoneLines": _line_coordinates(zone_vertices, polyhedron_edges(zone_faces)),
            "triangles": polyhedron_triangles(zone_faces),
            "cellVolume": abs(float(np.linalg.det(primitive))),
            "zoneVolume": abs(float(np.linalg.det(reciprocal))),
        }
    return payload


def build(output_dir: Path) -> None:
    """Build the bilingual same-origin static application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    for name in ("style.css", "app.js"):
        shutil.copy2(STATIC_DIR / name, output_dir / name)

    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    html = html.replace("__PLOTLY_ASSET__", PLOTLY_GL3D_ASSET_NAME)
    if "__PLOTLY_ASSET__" in html:
        raise ValueError("unresolved Plotly asset placeholder")
    (output_dir / "index.html").write_text(html, encoding="utf-8")

    serialized = json.dumps(_payload(), separators=(",", ":"), sort_keys=True)
    (output_dir / "data.js").write_text(
        f"window.BRILLOUIN_DATA = {serialized};\n", encoding="utf-8"
    )
