"""Versioned browser-transfer schemas for Lie-algebra calculation results."""

from __future__ import annotations

from collections import Counter
from collections.abc import Mapping

import numpy as np

from .physics import (
    RootSystem,
    TensorProduct,
    WeightDiagram,
    decomposition_residual_character,
    dynkin_coordinates,
    format_decomposition,
    get_root_system,
    representation_weights,
    weight_graph_edges,
)
from .protocol import KERNEL_VERSION, TENSOR_PRODUCT_RESULT_SCHEMA, WEIGHT_RESULT_SCHEMA

APPLICATION_SCHEMA = "physics-atlas.lie-application.v1"
ROOT_SYSTEM_SCHEMA = "physics-atlas.root-system.v1"
WEIGHT_DIAGRAM_SCHEMA = WEIGHT_RESULT_SCHEMA
CHARACTER_SCHEMA = "physics-atlas.character.v1"
TENSOR_PRODUCT_SCHEMA = TENSOR_PRODUCT_RESULT_SCHEMA
DISPLAY_COORDINATE_DECIMALS = 12


def weight_diagram_key(system: str, labels: tuple[int, ...]) -> str:
    """Return the stable registry key for one highest-weight diagram."""

    return f"{system}|{','.join(map(str, labels))}"


def _root_length_classes(points: np.ndarray) -> tuple[list[int], int]:
    lengths = np.linalg.norm(points, axis=1)
    unique = sorted({round(float(value), 8) for value in lengths})
    classes = [
        min(range(len(unique)), key=lambda index: abs(float(value) - unique[index]))
        for value in lengths
    ]
    return classes, len(unique)


def _display_coordinates(points: np.ndarray) -> list[list[int | float]]:
    """Canonicalize non-authoritative display floats across NumPy runtimes."""

    rounded = np.round(np.asarray(points, dtype=float), DISPLAY_COORDINATE_DECIMALS)
    rounded[np.abs(rounded) < 10 ** (-DISPLAY_COORDINATE_DECIMALS)] = 0.0
    return [[0 if value == 0.0 else float(value) for value in row] for row in rounded]


def root_system_domain(system: RootSystem | str) -> dict[str, object]:
    """Serialize one root system without any Plotly-specific structures."""

    root_system = get_root_system(system) if isinstance(system, str) else system
    display_roots = root_system.display_roots
    length_classes, length_class_count = _root_length_classes(display_roots)
    return {
        "schema": ROOT_SYSTEM_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "system": root_system.key,
        "rank": root_system.rank,
        "displayRoots": _display_coordinates(display_roots),
        "rootDynkinCoordinates": dynkin_coordinates(root_system, root_system.roots).tolist(),
        "rootLengthClasses": length_classes,
        "rootLengthClassCount": length_class_count,
        "displaySimpleRoots": _display_coordinates(root_system.display_simple_roots),
        "displayFundamentalWeights": _display_coordinates(
            root_system.to_display(root_system.fundamental_weights)
        ),
    }


def weight_diagram_domain(diagram: WeightDiagram) -> dict[str, object]:
    """Serialize an irreducible character for static or runtime browser rendering."""

    result = {
        "schema": WEIGHT_DIAGRAM_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "system": diagram.system_key,
        "highestDynkin": list(diagram.highest_dynkin),
        "displayWeights": _display_coordinates(diagram.display_weights),
        "dynkinCoordinates": diagram.dynkin_coordinates.tolist(),
        "multiplicities": diagram.multiplicities.tolist(),
        "levels": diagram.levels.tolist(),
        "edges": [list(edge) for edge in weight_graph_edges(diagram)],
        "dimension": diagram.dimension,
        "weylDimension": diagram.weyl_dimension,
    }
    validate_weight_diagram_domain(result)
    return result


def validate_weight_diagram_domain(result: Mapping[str, object]) -> None:
    """Validate the schema shape and mathematical invariants of a weight result."""

    if result.get("schema") != WEIGHT_DIAGRAM_SCHEMA:
        raise ArithmeticError("Unexpected weight-diagram schema")
    if result.get("kernelVersion") != KERNEL_VERSION:
        raise ArithmeticError("Unexpected Lie kernel version")
    highest = result.get("highestDynkin")
    coordinates = result.get("dynkinCoordinates")
    display = result.get("displayWeights")
    multiplicities = result.get("multiplicities")
    levels = result.get("levels")
    edges = result.get("edges")
    if not all(
        isinstance(value, list)
        for value in (highest, coordinates, display, multiplicities, levels, edges)
    ):
        raise ArithmeticError("Weight-diagram arrays are missing")
    size = len(coordinates)
    if not (len(display) == len(multiplicities) == len(levels) == size):
        raise ArithmeticError("Weight-diagram arrays have inconsistent lengths")
    if any(
        isinstance(value, bool) or not isinstance(value, int) or value <= 0
        for value in multiplicities
    ):
        raise ArithmeticError("Weight multiplicities must be positive integers")
    dimension = result.get("dimension")
    weyl_dimension_value = result.get("weylDimension")
    if not isinstance(dimension, int) or dimension != sum(multiplicities):
        raise ArithmeticError("Weight multiplicities do not sum to the dimension")
    if dimension != weyl_dimension_value:
        raise ArithmeticError("Freudenthal and Weyl dimensions disagree")
    if highest not in coordinates:
        raise ArithmeticError("Requested highest weight is absent")
    if any(
        not isinstance(edge, list)
        or len(edge) != 2
        or any(
            isinstance(index, bool) or not isinstance(index, int) or not 0 <= index < size
            for index in edge
        )
        for edge in edges
    ):
        raise ArithmeticError("Weight graph contains an invalid edge")


def residual_character_domain(
    product: TensorProduct,
    extraction_step: int,
    max_candidates: int = 250_000,
) -> dict[str, object]:
    """Serialize one residual tensor-product character in display coordinates."""

    residual = decomposition_residual_character(
        product,
        extraction_step,
        max_candidates=max_candidates,
    )
    ordered = sorted(residual)
    display_lookup = {
        tuple(int(value) for value in labels): point
        for labels, point in zip(
            product.dynkin_coordinates,
            _display_coordinates(product.display_weights),
            strict=True,
        )
    }
    return {
        "schema": CHARACTER_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "system": product.system_key,
        "dynkinCoordinates": [list(labels) for labels in ordered],
        "displayWeights": [display_lookup[labels] for labels in ordered],
        "multiplicities": [int(residual[labels]) for labels in ordered],
    }


def tensor_product_domain(
    product: TensorProduct,
    max_candidates: int = 250_000,
) -> dict[str, object]:
    """Serialize a tensor product and its complete extraction sequence."""

    result = {
        "schema": TENSOR_PRODUCT_SCHEMA,
        "kernelVersion": KERNEL_VERSION,
        "system": product.system_key,
        "factors": [list(labels) for labels in product.factor_highest],
        "factorWeightKeys": [
            weight_diagram_key(product.system_key, labels) for labels in product.factor_highest
        ],
        "summary": format_decomposition(product),
        "distinctWeights": product.distinct_weight_count,
        "dimension": product.dimension,
        "decompositionDimension": product.decomposition_dimension,
        "steps": [
            residual_character_domain(product, step, max_candidates=max_candidates)
            for step in range(len(product.components) + 1)
        ],
        "components": [
            {
                "name": (
                    f"V{component.highest_dynkin}, dim {component.dimension}"
                    + (f" x {component.multiplicity}" if component.multiplicity > 1 else "")
                ),
                "highestDynkin": list(component.highest_dynkin),
                "multiplicity": component.multiplicity,
                "dimension": component.dimension,
                "weightKey": weight_diagram_key(
                    product.system_key,
                    component.highest_dynkin,
                ),
            }
            for component in product.components
        ],
    }
    validate_tensor_product_domain(result)
    return result


def tensor_product_weight_dependencies(
    product: TensorProduct,
    max_candidates: int = 250_000,
) -> dict[str, dict[str, object]]:
    """Return the weight diagrams referenced by one tensor-product DTO."""

    labels = sorted(
        {
            *product.factor_highest,
            *(component.highest_dynkin for component in product.components),
        }
    )
    return {
        weight_diagram_key(product.system_key, highest): weight_diagram_domain(
            representation_weights(
                product.system_key,
                highest,
                max_candidates=max_candidates,
            )
        )
        for highest in labels
    }


def _character_from_domain(character: Mapping[str, object]) -> Counter[tuple[int, ...]]:
    coordinates = character.get("dynkinCoordinates")
    display_weights = character.get("displayWeights")
    multiplicities = character.get("multiplicities")
    if not all(isinstance(value, list) for value in (coordinates, display_weights, multiplicities)):
        raise ArithmeticError("Tensor-product character arrays are missing")
    if len(coordinates) != len(display_weights) or len(coordinates) != len(multiplicities):
        raise ArithmeticError("Tensor-product character arrays have inconsistent lengths")
    if any(
        not isinstance(coordinate, list)
        or any(isinstance(value, bool) or not isinstance(value, int) for value in coordinate)
        for coordinate in coordinates
    ):
        raise ArithmeticError("Tensor-product Dynkin coordinates are invalid")
    if any(
        isinstance(value, bool) or not isinstance(value, int) or value <= 0
        for value in multiplicities
    ):
        raise ArithmeticError("Tensor-product multiplicities must be positive integers")
    result = Counter(
        {
            tuple(coordinate): multiplicity
            for coordinate, multiplicity in zip(coordinates, multiplicities, strict=True)
        }
    )
    if len(result) != len(coordinates):
        raise ArithmeticError("Tensor-product character contains duplicate weights")
    return result


def validate_tensor_product_domain(
    result: Mapping[str, object],
    weight_diagrams: Mapping[str, Mapping[str, object]] | None = None,
) -> None:
    """Validate tensor-product DTO shape, dimensions, residuals, and reconstruction."""

    if result.get("schema") != TENSOR_PRODUCT_SCHEMA:
        raise ArithmeticError("Unexpected tensor-product schema")
    if result.get("kernelVersion") != KERNEL_VERSION:
        raise ArithmeticError("Unexpected Lie kernel version")
    factors = result.get("factors")
    factor_keys = result.get("factorWeightKeys")
    components = result.get("components")
    steps = result.get("steps")
    if not isinstance(factors, list) or not 2 <= len(factors) <= 3:
        raise ArithmeticError("Tensor product must contain two or three factors")
    if not isinstance(factor_keys, list) or len(factor_keys) != len(factors):
        raise ArithmeticError("Tensor-product factor references are inconsistent")
    if not isinstance(components, list) or not components:
        raise ArithmeticError("Tensor-product components are missing")
    if not isinstance(steps, list) or len(steps) != len(components) + 1:
        raise ArithmeticError("Tensor-product extraction steps are inconsistent")

    if any(
        not isinstance(step, Mapping)
        or step.get("schema") != CHARACTER_SCHEMA
        or step.get("kernelVersion") != KERNEL_VERSION
        or step.get("system") != result.get("system")
        for step in steps
    ):
        raise ArithmeticError("Tensor-product character schema is inconsistent")
    characters = [_character_from_domain(step) for step in steps]
    dimension = result.get("dimension")
    if not isinstance(dimension, int) or sum(characters[0].values()) != dimension:
        raise ArithmeticError("Tensor-product character dimension is inconsistent")
    if result.get("distinctWeights") != len(characters[0]):
        raise ArithmeticError("Tensor-product distinct-weight count is inconsistent")
    if characters[-1]:
        raise ArithmeticError("Final tensor-product residual is not empty")
    component_dimension = 0
    for component in components:
        if not isinstance(component, Mapping):
            raise ArithmeticError("Tensor-product component is invalid")
        multiplicity = component.get("multiplicity")
        irrep_dimension = component.get("dimension")
        if any(
            isinstance(value, bool) or not isinstance(value, int) or value <= 0
            for value in (multiplicity, irrep_dimension)
        ):
            raise ArithmeticError("Tensor-product component dimensions are invalid")
        component_dimension += multiplicity * irrep_dimension
    if component_dimension != dimension or result.get("decompositionDimension") != dimension:
        raise ArithmeticError("Tensor-product decomposition dimension is inconsistent")

    if weight_diagrams is None:
        return
    references = [
        *zip(factor_keys, factors, strict=True),
        *((component.get("weightKey"), component.get("highestDynkin")) for component in components),
    ]
    for key, expected_highest in references:
        diagram = weight_diagrams.get(key) if isinstance(key, str) else None
        if diagram is None:
            raise ArithmeticError("Referenced tensor-product weight diagram is missing")
        validate_weight_diagram_domain(diagram)
        if (
            diagram.get("system") != result.get("system")
            or diagram.get("highestDynkin") != expected_highest
        ):
            raise ArithmeticError("Referenced tensor-product weight diagram does not match")

    reconstructed: Counter[tuple[int, ...]] = Counter()
    expected_residual = characters[0].copy()
    for index, component in enumerate(components):
        diagram = weight_diagrams[component["weightKey"]]
        irrep_character = _character_from_domain(diagram)
        copies = component["multiplicity"]
        for weight, multiplicity in irrep_character.items():
            reconstructed[weight] += copies * multiplicity
            expected_residual[weight] -= copies * multiplicity
            if expected_residual[weight] < 0:
                raise ArithmeticError("Tensor-product residual became negative")
            if expected_residual[weight] == 0:
                del expected_residual[weight]
        if expected_residual != characters[index + 1]:
            raise ArithmeticError("Tensor-product extraction step is inconsistent")
    if reconstructed != characters[0]:
        raise ArithmeticError("Irreducible characters do not reconstruct the product")
