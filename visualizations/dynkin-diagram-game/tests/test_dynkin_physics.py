from __future__ import annotations

from pathlib import Path

import pytest


def test_catalog_contains_all_finite_exceptional_types(physics):
    catalog = {diagram.name: diagram for diagram in physics.diagram_catalog()}

    assert len(catalog) == 31
    assert {"E6", "E7", "E8", "F4", "G2"} <= catalog.keys()
    assert catalog["A1"].rank == 1
    assert catalog["D8"].rank == 8


def test_every_catalog_entry_is_finite_and_self_classifies(physics):
    for diagram in physics.diagram_catalog():
        assert physics.is_finite_cartan(diagram.cartan)
        assert physics.classify_cartan(diagram.cartan) == (diagram.name,)


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("A3", "SU(4)"),
        ("B3", "SO(7) / Spin(7)"),
        ("C3", "Sp(3)"),
        ("D4", "SO(8) / Spin(8)"),
        ("B2/C2", "SO(5) / Spin(5) ≅ Sp(2)"),
        ("E6", None),
    ],
)
def test_classical_group_labels(physics, name, expected):
    diagram = next(item for item in physics.diagram_catalog() if item.name == name)

    assert diagram.group_label == expected


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("B3", (1, 1, 2)),
        ("C3", (2, 2, 1)),
        ("G2", (3, 1)),
        ("F4", (1, 1, 2, 2)),
    ],
)
def test_known_primitive_symmetrizers(physics, name, expected):
    diagram = next(item for item in physics.diagram_catalog() if item.name == name)

    assert physics.symmetrizer(diagram.cartan) == expected


def test_classification_is_invariant_under_node_relabeling(physics):
    b3 = next(item.cartan for item in physics.diagram_catalog() if item.name == "B3")
    permutation = (2, 0, 1)
    relabeled = tuple(tuple(b3[row][column] for column in permutation) for row in permutation)

    assert physics.classify_cartan(relabeled) == ("B3",)


def test_disconnected_diagram_classifies_as_semisimple_product(physics):
    a2_plus_a1 = ((2, -1, 0), (-1, 2, 0), (0, 0, 2))

    assert physics.classify_cartan(a2_plus_a1) == ("A2", "A1")
    assert physics.is_finite_cartan(a2_plus_a1)


@pytest.mark.parametrize(
    "cartan",
    [
        ((2, -1, -1), (-1, 2, -1), (-1, -1, 2)),  # affine A2 cycle
        ((2, -1), (-4, 2)),  # non-finite quadruple bond
        ((2, -1), (0, 2)),  # one-sided vanishing entry
        ((1, -1), (-1, 2)),  # invalid diagonal
    ],
)
def test_non_finite_or_invalid_cartan_matrices_are_rejected(physics, cartan):
    assert not physics.is_finite_cartan(cartan)
    assert physics.classify_cartan(cartan) is None


def test_bond_direction_encodes_short_root_convention(physics):
    b3 = next(item for item in physics.diagram_catalog() if item.name == "B3")
    c3 = next(item for item in physics.diagram_catalog() if item.name == "C3")

    assert physics.cartan_edges(b3.cartan)[-1] == {
        "source": 1,
        "target": 2,
        "multiplicity": 2,
        "arrowToward": 2,
    }
    assert physics.cartan_edges(c3.cartan)[-1] == {
        "source": 1,
        "target": 2,
        "multiplicity": 2,
        "arrowToward": 1,
    }


def test_physics_module_has_no_rendering_dependency(physics):
    source = Path(physics.__file__).read_text(encoding="utf-8").lower()

    for forbidden_import in ("plotly", "matplotlib", "javascript", "html"):
        assert forbidden_import not in source
