import numpy as np
import pytest
from scipy.spatial import ConvexHull


@pytest.mark.parametrize("lattice_key", ("sc", "bcc", "fcc", "hexagonal"))
def test_reciprocal_basis_satisfies_duality(physics, lattice_key):
    primitive = physics.LATTICES[lattice_key].primitive
    reciprocal = physics.reciprocal_basis(primitive)
    assert np.allclose(primitive.T @ reciprocal, 2.0 * np.pi * np.eye(3))


@pytest.mark.parametrize("lattice_key", ("sc", "bcc", "fcc", "hexagonal"))
def test_real_and_reciprocal_cell_volumes_have_fixed_product(physics, lattice_key):
    primitive = physics.LATTICES[lattice_key].primitive
    reciprocal = physics.reciprocal_basis(primitive)
    product = abs(np.linalg.det(primitive) * np.linalg.det(reciprocal))
    assert product == pytest.approx((2.0 * np.pi) ** 3)


@pytest.mark.parametrize("lattice_key", ("sc", "bcc", "fcc", "hexagonal"))
def test_brillouin_zone_volume_equals_reciprocal_primitive_volume(physics, lattice_key):
    primitive = physics.LATTICES[lattice_key].primitive
    vertices, _ = physics.first_brillouin_zone(primitive)
    expected = abs(np.linalg.det(physics.reciprocal_basis(primitive)))
    assert ConvexHull(vertices).volume == pytest.approx(expected, rel=1e-9)


@pytest.mark.parametrize("lattice_key", ("sc", "bcc", "fcc", "hexagonal"))
def test_zone_vertices_satisfy_every_bisector_halfspace(physics, lattice_key):
    primitive = physics.LATTICES[lattice_key].primitive
    reciprocal = physics.reciprocal_basis(primitive)
    reciprocal_points = physics.lattice_points(reciprocal, shell=2)
    reciprocal_points = reciprocal_points[np.linalg.norm(reciprocal_points, axis=1) > 1e-12]
    vertices, _ = physics.first_brillouin_zone(primitive)
    left = vertices @ reciprocal_points.T
    right = 0.5 * np.einsum("ij,ij->i", reciprocal_points, reciprocal_points)
    assert np.all(left <= right + 1e-8)


@pytest.mark.parametrize(
    ("lattice_key", "expected_vertices", "expected_edges", "expected_faces"),
    [
        ("sc", 8, 12, 6),
        ("bcc", 14, 24, 12),
        ("fcc", 24, 36, 14),
        ("hexagonal", 12, 18, 8),
    ],
)
def test_known_zone_combinatorics(
    physics, lattice_key, expected_vertices, expected_edges, expected_faces
):
    vertices, faces = physics.first_brillouin_zone(physics.LATTICES[lattice_key].primitive)
    edges = physics.polyhedron_edges(faces)
    assert (len(vertices), len(edges), len(faces)) == (
        expected_vertices,
        expected_edges,
        expected_faces,
    )
    assert len(vertices) - len(edges) + len(faces) == 2


def test_invalid_shells_are_rejected(physics):
    with pytest.raises(ValueError):
        physics.lattice_points(np.eye(3), shell=-1)
    with pytest.raises(ValueError):
        physics.first_brillouin_zone(np.eye(3), reciprocal_shell=0)
