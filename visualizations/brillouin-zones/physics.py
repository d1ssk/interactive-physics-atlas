"""Lattice and reciprocal-space calculations for first Brillouin zones."""

from __future__ import annotations

from dataclasses import dataclass
from itertools import product

import numpy as np
from numpy.typing import NDArray
from scipy.spatial import ConvexHull, HalfspaceIntersection

Array = NDArray[np.float64]


@dataclass(frozen=True, slots=True)
class Lattice:
    """A three-dimensional Bravais lattice with primitive vectors as columns."""

    key: str
    primitive: Array


SQRT3 = np.sqrt(3.0)
LATTICES = {
    "sc": Lattice(key="sc", primitive=np.eye(3)),
    "bcc": Lattice(
        key="bcc",
        primitive=np.column_stack(
            (
                (-0.5, 0.5, 0.5),
                (0.5, -0.5, 0.5),
                (0.5, 0.5, -0.5),
            )
        ),
    ),
    "fcc": Lattice(
        key="fcc",
        primitive=np.column_stack(
            (
                (0.0, 0.5, 0.5),
                (0.5, 0.0, 0.5),
                (0.5, 0.5, 0.0),
            )
        ),
    ),
    "hexagonal": Lattice(
        key="hexagonal",
        primitive=np.column_stack(
            (
                (1.0, 0.0, 0.0),
                (0.5, SQRT3 / 2.0, 0.0),
                (0.0, 0.0, 1.6),
            )
        ),
    ),
}


def reciprocal_basis(primitive: Array) -> Array:
    """Return reciprocal vectors satisfying ``a_i dot b_j = 2*pi delta_ij``."""

    return 2.0 * np.pi * np.linalg.inv(primitive).T


def lattice_points(primitive: Array, shell: int = 2) -> Array:
    """Generate lattice points with integer primitive coordinates in ``[-shell, shell]``."""

    if shell < 0:
        raise ValueError("shell must be non-negative")
    indices = np.asarray(list(product(range(-shell, shell + 1), repeat=3)), dtype=float)
    return indices @ primitive.T


def cell_vertices(primitive: Array) -> Array:
    """Return vertices of the primitive parallelepiped centered on the origin."""

    signs = np.asarray(list(product((-0.5, 0.5), repeat=3)), dtype=float)
    return signs @ primitive.T


def cell_edges() -> list[tuple[int, int]]:
    """Return edges for the ordering produced by :func:`cell_vertices`."""

    signs = list(product((-0.5, 0.5), repeat=3))
    edges: list[tuple[int, int]] = []
    for left_index, left in enumerate(signs):
        for right_index in range(left_index + 1, len(signs)):
            right = signs[right_index]
            if sum(a != b for a, b in zip(left, right, strict=True)) == 1:
                edges.append((left_index, right_index))
    return edges


def _order_face(vertices: Array, indices: list[int], normal: Array) -> tuple[int, ...]:
    points = vertices[indices]
    center = points.mean(axis=0)
    unit_normal = normal / np.linalg.norm(normal)
    trial = np.array([1.0, 0.0, 0.0])
    if abs(np.dot(trial, unit_normal)) > 0.9:
        trial = np.array([0.0, 1.0, 0.0])
    axis_u = np.cross(unit_normal, trial)
    axis_u /= np.linalg.norm(axis_u)
    axis_v = np.cross(unit_normal, axis_u)
    relative = points - center
    order = np.argsort(np.arctan2(relative @ axis_v, relative @ axis_u))
    return tuple(indices[index] for index in order)


def first_brillouin_zone(
    primitive: Array, reciprocal_shell: int = 2
) -> tuple[Array, list[tuple[int, ...]]]:
    """Construct the first Brillouin zone as a reciprocal Wigner–Seitz cell.

    Every nonzero reciprocal vector ``G`` contributes the bisector half-space
    ``k dot G <= |G|^2 / 2``. The origin is a strict interior point.
    """

    if reciprocal_shell < 1:
        raise ValueError("reciprocal_shell must be at least one")
    reciprocal = reciprocal_basis(primitive)
    points = lattice_points(reciprocal, shell=reciprocal_shell)
    points = points[np.linalg.norm(points, axis=1) > 1e-12]
    offsets = -0.5 * np.einsum("ij,ij->i", points, points)
    halfspaces = np.column_stack((points, offsets))
    intersection = HalfspaceIntersection(halfspaces, np.zeros(3))
    hull = ConvexHull(intersection.intersections)
    vertices = intersection.intersections[hull.vertices]

    # Recover polygonal faces from their bisector planes instead of retaining hull diagonals.
    faces_by_vertices: dict[frozenset[int], tuple[int, ...]] = {}
    scale = max(np.linalg.norm(points, axis=1).max(), 1.0)
    tolerance = 2e-7 * scale**2
    for point in points:
        residual = vertices @ point - 0.5 * np.dot(point, point)
        face_indices = np.flatnonzero(np.abs(residual) < tolerance).tolist()
        if len(face_indices) < 3:
            continue
        key = frozenset(face_indices)
        faces_by_vertices.setdefault(key, _order_face(vertices, face_indices, point))
    return vertices, list(faces_by_vertices.values())


def polyhedron_edges(faces: list[tuple[int, ...]]) -> list[tuple[int, int]]:
    """Return the unique boundary edges of polygonal faces."""

    edges: set[tuple[int, int]] = set()
    for face in faces:
        for left, right in zip(face, face[1:] + face[:1], strict=True):
            edges.add(tuple(sorted((left, right))))
    return sorted(edges)


def polyhedron_triangles(faces: list[tuple[int, ...]]) -> list[tuple[int, int, int]]:
    """Fan-triangulate polygonal faces for Plotly's triangular mesh."""

    triangles: list[tuple[int, int, int]] = []
    for face in faces:
        triangles.extend(
            (face[0], face[index], face[index + 1]) for index in range(1, len(face) - 1)
        )
    return triangles
