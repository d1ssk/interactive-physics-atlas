from __future__ import annotations

from collections import Counter
from pathlib import Path

import numpy as np
import pytest


def component_map(product):
    return {
        component.highest_dynkin: (component.multiplicity, component.dimension)
        for component in product.components
    }


@pytest.mark.parametrize(
    ("system", "left", "right", "expected"),
    [
        ("A2", (1, 0), (1, 0), {(2, 0): (1, 6), (0, 1): (1, 3)}),
        ("A2", (1, 0), (0, 1), {(1, 1): (1, 8), (0, 0): (1, 1)}),
        (
            "G2",
            (1, 0),
            (1, 0),
            {(2, 0): (1, 27), (0, 1): (1, 14), (1, 0): (1, 7), (0, 0): (1, 1)},
        ),
        (
            "B3",
            (0, 0, 1),
            (0, 0, 1),
            {(0, 0, 2): (1, 35), (0, 1, 0): (1, 21), (1, 0, 0): (1, 7), (0, 0, 0): (1, 1)},
        ),
    ],
)
def test_known_tensor_product_decompositions(physics, system, left, right, expected):
    assert component_map(physics.tensor_product(system, left, right)) == expected


def test_three_fundamentals_preserve_character_and_outer_multiplicity(physics):
    product = physics.tensor_product_many("A2", [(1, 0), (1, 0), (1, 0)])

    assert component_map(product) == {
        (3, 0): (1, 10),
        (1, 1): (2, 8),
        (0, 0): (1, 1),
    }
    assert product.dimension == product.decomposition_dimension == 27
    assert physics.reconstructed_character(product) == product.character()
    assert [
        sum(physics.decomposition_residual_character(product, step).values())
        for step in range(len(product.components) + 1)
    ] == [27, 17, 1, 0]


def test_tensor_product_is_commutative(physics):
    left_right = physics.tensor_product("C3", (1, 0, 0), (0, 1, 0))
    right_left = physics.tensor_product("C3", (0, 1, 0), (1, 0, 0))

    assert left_right.character() == right_left.character()
    assert Counter(
        (item.highest_dynkin, item.multiplicity) for item in left_right.components
    ) == Counter((item.highest_dynkin, item.multiplicity) for item in right_left.components)


def test_all_supported_root_system_conventions(physics):
    expected_counts = {
        "A2": 6,
        "B2": 8,
        "C2": 8,
        "D2": 4,
        "G2": 12,
        "A3": 12,
        "B3": 18,
        "C3": 18,
        "D3": 12,
    }
    for key in (*physics.RANK2_SYSTEMS, *physics.RANK3_SYSTEMS):
        system = physics.get_root_system(key)
        assert len(system.roots) == expected_counts[key]
        positive_display = system.to_display(system.positive_roots)
        assert len(positive_display) * 2 == len(system.roots)
        for root in positive_display:
            assert next(value for value in root if abs(value) > 1e-9) > 0
        squared_lengths = np.einsum("ij,ij->i", system.simple_roots, system.simple_roots)
        pairings = (
            2.0
            * system.fundamental_weights
            @ system.simple_roots.T
            / squared_lengths[np.newaxis, :]
        )
        assert np.allclose(pairings, np.eye(system.rank))
    assert physics.get_root_system("G2").cartan_matrix.tolist() == [[2, -1], [-3, 2]]


@pytest.mark.parametrize("system", ["A2", "B2", "C2", "D2", "G2", "A3", "B3", "C3", "D3"])
def test_first_preset_square_preserves_dimension_and_character(physics, system):
    labels = next(iter(physics.REPRESENTATION_PRESETS[system].values()))
    factor = physics.representation_weights(system, labels)
    product = physics.tensor_product(system, labels, labels)

    assert factor.dimension == factor.weyl_dimension
    assert product.dimension == factor.dimension**2
    assert product.decomposition_dimension == product.dimension
    assert physics.reconstructed_character(product) == product.character()


@pytest.mark.parametrize("factor_count", [0, 1, 4])
def test_product_accepts_only_two_or_three_factors(physics, factor_count):
    with pytest.raises(ValueError, match="two or three"):
        physics.tensor_product_many("A2", [(1, 0)] * factor_count)


def test_physics_module_has_no_rendering_dependency(physics):
    source = Path(physics.__file__).read_text(encoding="utf-8").lower()
    for forbidden_import in (
        "import plotly",
        "import matplotlib",
        "import ipywidgets",
        "import nbformat",
    ):
        assert forbidden_import not in source
