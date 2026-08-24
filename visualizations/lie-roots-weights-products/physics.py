"""Pure representation-theory calculations for the Lie-algebra visualization.

This module deliberately has no Plotly, Matplotlib, Jupyter, or site-builder
dependency. Rendering and static-site generation remain in ``visualization.py``.

Weights are keyed by Dynkin coordinates.  This is exact integer data, so the
character arithmetic below does not rely on rounded plotting coordinates.
"""

from __future__ import annotations

import itertools
import math
from collections import Counter
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from functools import cache, lru_cache

import numpy as np

SYSTEM_INFO: Mapping[str, Mapping[str, object]] = {
    "A2": {"groups": "SU(3)", "rank": 2, "note": "simple, simply laced"},
    "B2": {
        "groups": "SO(5), Spin(5)",
        "rank": 2,
        "note": "isomorphic to C2; the long/short convention is dual",
    },
    "C2": {
        "groups": "Sp(2)",
        "rank": 2,
        "note": "isomorphic to B2; the long/short convention is dual",
    },
    "D2": {"groups": "SO(4), Spin(4)", "rank": 2, "note": "A1 x A1"},
    "G2": {"groups": "G2", "rank": 2, "note": "exceptional"},
    "A3": {"groups": "SU(4)", "rank": 3, "note": "isomorphic to D3"},
    "B3": {"groups": "SO(7), Spin(7)", "rank": 3, "note": "odd orthogonal"},
    "C3": {"groups": "Sp(3)", "rank": 3, "note": "compact symplectic"},
    "D3": {"groups": "SO(6), Spin(6)", "rank": 3, "note": "isomorphic to A3"},
}

# Positivity is defined in displayed orthonormal coordinates: scan
# (v_1, ..., v_r) from left to right and require the first nonzero entry to be
# positive.  Simple roots are the indecomposable positive roots.
CARTAN_CONVENTION = (
    "positive iff first nonzero display coordinate is positive; A_ij = <alpha_i, alpha_j^vee>"
)

RANK2_SYSTEMS = ("A2", "B2", "C2", "D2", "G2")
RANK3_SYSTEMS = ("A3", "B3", "C3", "D3")

REPRESENTATION_PRESETS: Mapping[str, Mapping[str, tuple[int, ...]]] = {
    "A2": {
        "fundamental 3": (1, 0),
        "antifundamental 3bar": (0, 1),
        "symmetric 6": (2, 0),
        "adjoint 8": (1, 1),
    },
    "B2": {"vector 5": (1, 0), "spinor 4": (0, 1), "adjoint 10": (0, 2)},
    "C2": {
        "defining 4": (1, 0),
        "traceless antisymmetric 5": (0, 1),
        "adjoint 10": (2, 0),
    },
    "D2": {
        "positive half-spinor 2": (1, 0),
        "negative half-spinor 2": (0, 1),
        "vector 4": (1, 1),
    },
    "G2": {"fundamental 7": (1, 0), "adjoint 14": (0, 1)},
    "A3": {
        "fundamental 4": (1, 0, 0),
        "antisymmetric 6": (0, 1, 0),
        "antifundamental 4bar": (0, 0, 1),
        "adjoint 15": (1, 0, 1),
    },
    "B3": {
        "vector 7": (1, 0, 0),
        "adjoint 21": (0, 1, 0),
        "spinor 8": (0, 0, 1),
    },
    "C3": {
        "defining 6": (1, 0, 0),
        "fundamental 14": (0, 1, 0),
        "third fundamental 14prime": (0, 0, 1),
        "adjoint 21": (2, 0, 0),
    },
    "D3": {
        "vector 6": (1, 0, 0),
        "half-spinor 4 plus": (0, 1, 0),
        "half-spinor 4 minus": (0, 0, 1),
        "adjoint 15": (0, 1, 1),
    },
}


@dataclass(frozen=True)
class RootSystem:
    """Numerical data for a finite crystallographic root system."""

    key: str
    rank: int
    groups: str
    note: str
    simple_roots: np.ndarray
    roots: np.ndarray
    positive_roots: np.ndarray
    positive_root_coefficients: np.ndarray
    cartan_matrix: np.ndarray
    fundamental_weights: np.ndarray
    display_basis: np.ndarray

    def to_display(self, vectors: np.ndarray) -> np.ndarray:
        return np.asarray(vectors, dtype=float) @ self.display_basis

    @property
    def display_roots(self) -> np.ndarray:
        return self.to_display(self.roots)

    @property
    def display_simple_roots(self) -> np.ndarray:
        return self.to_display(self.simple_roots)


@dataclass(frozen=True)
class WeightDiagram:
    """Weights and multiplicities of an irreducible highest-weight module."""

    system_key: str
    highest_dynkin: tuple[int, ...]
    ambient_weights: np.ndarray
    display_weights: np.ndarray
    dynkin_coordinates: np.ndarray
    multiplicities: np.ndarray
    levels: np.ndarray
    dimension: int
    weyl_dimension: int

    def character(self) -> dict[tuple[int, ...], int]:
        return {
            tuple(int(value) for value in labels): int(multiplicity)
            for labels, multiplicity in zip(
                self.dynkin_coordinates, self.multiplicities, strict=True
            )
        }


def _canonical_key(system: str) -> str:
    key = system.strip().upper()
    aliases = {
        "SU3": "A2",
        "SU(3)": "A2",
        "SO4": "D2",
        "SO(4)": "D2",
        "SPIN4": "D2",
        "SPIN(4)": "D2",
        "SO5": "B2",
        "SO(5)": "B2",
        "SPIN5": "B2",
        "SPIN(5)": "B2",
        "SP2": "C2",
        "SP(2)": "C2",
        "SU4": "A3",
        "SU(4)": "A3",
        "SO6": "D3",
        "SO(6)": "D3",
        "SPIN6": "D3",
        "SPIN(6)": "D3",
        "SO7": "B3",
        "SO(7)": "B3",
        "SPIN7": "B3",
        "SPIN(7)": "B3",
        "SP3": "C3",
        "SP(3)": "C3",
    }
    key = aliases.get(key, key)
    if key not in SYSTEM_INFO:
        raise ValueError(f"Unknown system {system!r}; supported: {', '.join(SYSTEM_INFO)}")
    return key


def _simple_roots(key: str) -> np.ndarray:
    family, rank = key[0], int(key[1:])
    if family == "A":
        basis = np.eye(rank + 1)
        return np.asarray([basis[index] - basis[index + 1] for index in range(rank)])
    if family in ("B", "C"):
        basis = np.eye(rank)
        roots = [basis[index] - basis[index + 1] for index in range(rank - 1)]
        roots.append(basis[-1] if family == "B" else 2.0 * basis[-1])
        return np.asarray(roots)
    if family == "D":
        basis = np.eye(rank)
        roots = [basis[index] - basis[index + 1] for index in range(max(0, rank - 2))]
        roots.extend([basis[-2] - basis[-1], basis[-2] + basis[-1]])
        return np.asarray(roots)
    if key == "G2":
        return np.asarray(
            [
                [math.sqrt(2.0), 0.0],
                [-3.0 / math.sqrt(2.0), math.sqrt(3.0 / 2.0)],
            ]
        )
    raise ValueError(f"No simple-root construction for {key}")


def _reflection(vector: np.ndarray, root: np.ndarray) -> np.ndarray:
    return vector - 2.0 * np.dot(vector, root) / np.dot(root, root) * root


def _weyl_closure(simple_roots: np.ndarray, decimals: int = 10) -> np.ndarray:
    roots: dict[tuple[float, ...], np.ndarray] = {}
    frontier: list[np.ndarray] = []
    for root in simple_roots:
        for signed_root in (root, -root):
            key = tuple(np.round(signed_root, decimals))
            roots[key] = signed_root.copy()
            frontier.append(signed_root.copy())
    while frontier:
        root = frontier.pop()
        for simple in simple_roots:
            reflected = _reflection(root, simple)
            key = tuple(np.round(reflected, decimals))
            if key not in roots:
                roots[key] = reflected
                frontier.append(reflected)
    return np.asarray(sorted(roots.values(), key=lambda item: tuple(np.round(item, decimals))))


def _coordinates_in_simple_basis(vectors: np.ndarray, simple_roots: np.ndarray) -> np.ndarray:
    return np.asarray(
        [
            np.linalg.lstsq(simple_roots.T, vector, rcond=None)[0]
            for vector in np.atleast_2d(np.asarray(vectors, dtype=float))
        ]
    )


def _cartan_matrix(simple_roots: np.ndarray) -> np.ndarray:
    squared_lengths = np.einsum("ij,ij->i", simple_roots, simple_roots)
    gram = simple_roots @ simple_roots.T
    return np.rint(2.0 * gram / squared_lengths[np.newaxis, :]).astype(int)


def _is_lexicographically_positive(vector: np.ndarray, tolerance: float = 1e-9) -> bool:
    for value in vector:
        if abs(float(value)) > tolerance:
            return bool(value > 0)
    raise ValueError("The zero vector is not a root")


def _indecomposable_positive_roots(
    positive_roots: np.ndarray, tolerance: float = 1e-8
) -> np.ndarray:
    simple = []
    for root in positive_roots:
        decomposable = any(
            np.linalg.norm(root - left - right) < tolerance
            for left in positive_roots
            for right in positive_roots
        )
        if not decomposable:
            simple.append(root)
    return np.asarray(simple)


def _order_simple_roots(
    candidates: np.ndarray,
    target_cartan: np.ndarray,
    display_basis: np.ndarray,
) -> np.ndarray:
    valid = [
        np.asarray(permutation)
        for permutation in itertools.permutations(candidates)
        if np.array_equal(_cartan_matrix(np.asarray(permutation)), target_cartan)
    ]
    if not valid:
        raise ArithmeticError("Could not order lexicographic simple roots by Cartan type")
    return max(
        valid,
        key=lambda roots: tuple(np.round((roots @ display_basis).ravel(), 10)),
    )


@cache
def get_root_system(system: str) -> RootSystem:
    """Return exact-convention numerical data for a supported root system."""

    key = _canonical_key(system)
    info = SYSTEM_INFO[key]
    reference_simple = _simple_roots(key)
    roots = _weyl_closure(reference_simple)
    reference_gram = reference_simple @ reference_simple.T
    reference_coordinates = np.linalg.cholesky(reference_gram)
    display_basis = reference_simple.T @ np.linalg.inv(reference_gram) @ reference_coordinates
    display_roots = roots @ display_basis
    positive_mask = np.asarray(
        [_is_lexicographically_positive(root) for root in display_roots], dtype=bool
    )
    positive = roots[positive_mask]
    candidates = _indecomposable_positive_roots(positive)
    if len(candidates) != int(info["rank"]):
        raise ArithmeticError(f"Expected {info['rank']} simple roots, found {len(candidates)}")
    simple = _order_simple_roots(candidates, _cartan_matrix(reference_simple), display_basis)
    squared_lengths = np.einsum("ij,ij->i", simple, simple)
    gram = simple @ simple.T
    cartan = _cartan_matrix(simple)
    positive_coefficients = np.rint(_coordinates_in_simple_basis(positive, simple)).astype(int)
    if np.any(positive_coefficients < 0):
        raise ArithmeticError("Positive roots are not generated by selected simple roots")
    order = np.argsort(np.sum(positive_coefficients, axis=1), kind="stable")
    fundamental = np.diag(squared_lengths / 2.0) @ np.linalg.inv(gram) @ simple
    return RootSystem(
        key=key,
        rank=int(info["rank"]),
        groups=str(info["groups"]),
        note=str(info["note"]),
        simple_roots=simple,
        roots=roots,
        positive_roots=positive[order],
        positive_root_coefficients=positive_coefficients[order],
        cartan_matrix=cartan,
        fundamental_weights=fundamental,
        display_basis=display_basis,
    )


def dynkin_coordinates(system: RootSystem, vectors: np.ndarray) -> np.ndarray:
    """Pair ambient vectors with the ordered simple coroots."""

    squared_lengths = np.einsum("ij,ij->i", system.simple_roots, system.simple_roots)
    pairings = 2.0 * np.asarray(vectors) @ system.simple_roots.T / squared_lengths[np.newaxis, :]
    return np.rint(pairings).astype(int)


def _lowest_weight(system: RootSystem, highest_weight: np.ndarray) -> np.ndarray:
    weight = highest_weight.copy()
    for _ in range(10_000):
        labels = dynkin_coordinates(system, weight[np.newaxis, :])[0]
        positive = np.flatnonzero(labels > 0)
        if len(positive) == 0:
            return weight
        weight = _reflection(weight, system.simple_roots[int(positive[0])])
    raise RuntimeError("Failed to reach the anti-dominant Weyl-orbit weight")


def _validated_labels(system: RootSystem, labels: Sequence[int]) -> np.ndarray:
    return np.asarray(_labels_tuple(system, labels), dtype=int)


def weyl_dimension(system: str, dynkin_labels: Sequence[int]) -> int:
    """Compute the Weyl dimension of a dominant integral highest weight."""

    root_system = get_root_system(system)
    labels = _validated_labels(root_system, dynkin_labels)
    highest = labels @ root_system.fundamental_weights
    rho = np.sum(root_system.fundamental_weights, axis=0)
    dimension = 1.0
    for root in root_system.positive_roots:
        dimension *= np.dot(highest + rho, root) / np.dot(rho, root)
    return int(round(dimension))


@lru_cache(maxsize=512)
def _representation_weights_cached(
    system_key: str, labels_tuple: tuple[int, ...], max_candidates: int
) -> WeightDiagram:
    root_system = get_root_system(system_key)
    labels = np.asarray(labels_tuple, dtype=int)
    highest = labels @ root_system.fundamental_weights
    rho = np.sum(root_system.fundamental_weights, axis=0)
    lowest = _lowest_weight(root_system, highest)
    maxima = np.rint(
        _coordinates_in_simple_basis(highest - lowest, root_system.simple_roots)[0]
    ).astype(int)
    maxima = np.maximum(maxima, 0)
    candidate_count = int(np.prod(maxima + 1))
    if candidate_count > max_candidates:
        raise ValueError(
            f"Candidate lattice has {candidate_count:,} points, exceeding "
            f"max_candidates={max_candidates:,}."
        )

    candidates = sorted(
        itertools.product(*(range(int(maximum) + 1) for maximum in maxima)),
        key=lambda item: (sum(item), item),
    )
    multiplicities: dict[tuple[int, ...], int] = {tuple(0 for _ in range(root_system.rank)): 1}
    highest_norm = float(np.dot(highest + rho, highest + rho))
    for candidate in candidates[1:]:
        coefficients = np.asarray(candidate, dtype=int)
        weight = highest - coefficients @ root_system.simple_roots
        denominator = highest_norm - float(np.dot(weight + rho, weight + rho))
        if denominator <= 1e-10:
            continue
        numerator = 0.0
        for root, root_coefficients in zip(
            root_system.positive_roots,
            root_system.positive_root_coefficients,
            strict=True,
        ):
            step = 1
            while True:
                upstream = coefficients - step * root_coefficients
                if np.any(upstream < 0):
                    break
                upstream_multiplicity = multiplicities.get(tuple(upstream), 0)
                if upstream_multiplicity:
                    upstream_weight = highest - upstream @ root_system.simple_roots
                    numerator += upstream_multiplicity * float(np.dot(upstream_weight, root))
                step += 1
        raw = 2.0 * numerator / denominator
        rounded = int(round(raw))
        if rounded > 0 and math.isclose(raw, rounded, abs_tol=2e-7):
            multiplicities[candidate] = rounded

    items = sorted(multiplicities.items(), key=lambda item: (sum(item[0]), item[0]))
    levels = np.asarray([sum(key) for key, _ in items], dtype=int)
    ambient = np.asarray([highest - np.asarray(key) @ root_system.simple_roots for key, _ in items])
    multiplicity_array = np.asarray([value for _, value in items], dtype=int)
    dimension = int(np.sum(multiplicity_array))
    expected = weyl_dimension(system_key, labels_tuple)
    if dimension != expected:
        raise ArithmeticError(f"Freudenthal dimension {dimension} != Weyl dimension {expected}")
    return WeightDiagram(
        system_key=system_key,
        highest_dynkin=labels_tuple,
        ambient_weights=ambient,
        display_weights=root_system.to_display(ambient),
        dynkin_coordinates=dynkin_coordinates(root_system, ambient),
        multiplicities=multiplicity_array,
        levels=levels,
        dimension=dimension,
        weyl_dimension=expected,
    )


def representation_weights(
    system: str,
    dynkin_labels: Sequence[int],
    max_candidates: int = 250_000,
) -> WeightDiagram:
    """Compute an irreducible weight character with Freudenthal recursion."""

    root_system = get_root_system(system)
    labels = _labels_tuple(root_system, dynkin_labels)
    if max_candidates <= 0:
        raise ValueError("max_candidates must be positive")
    return _representation_weights_cached(root_system.key, labels, max_candidates)


WeightKey = tuple[int, ...]


@dataclass(frozen=True)
class IrreducibleComponent:
    """One irreducible summand in a tensor-product decomposition."""

    highest_dynkin: WeightKey
    multiplicity: int
    dimension: int

    @property
    def total_dimension(self) -> int:
        return self.multiplicity * self.dimension


@dataclass(frozen=True)
class TensorProduct:
    """Weight character and irreducible decomposition of a 2- or 3-factor product."""

    system_key: str
    factor_highest: tuple[WeightKey, ...]
    dynkin_coordinates: np.ndarray
    ambient_weights: np.ndarray
    display_weights: np.ndarray
    multiplicities: np.ndarray
    components: tuple[IrreducibleComponent, ...]
    dimension: int

    @property
    def left_highest(self) -> WeightKey:
        """First factor, retained for the original two-factor API."""

        return self.factor_highest[0]

    @property
    def right_highest(self) -> WeightKey:
        """Second factor, retained for the original two-factor API."""

        return self.factor_highest[1]

    @property
    def distinct_weight_count(self) -> int:
        return len(self.multiplicities)

    @property
    def decomposition_dimension(self) -> int:
        return sum(component.total_dimension for component in self.components)

    def character(self) -> dict[WeightKey, int]:
        """Return the tensor-product character as an integer weight map."""

        return {
            tuple(int(value) for value in labels): int(multiplicity)
            for labels, multiplicity in zip(
                self.dynkin_coordinates, self.multiplicities, strict=True
            )
        }


def _labels_tuple(system: RootSystem, labels: Sequence[int]) -> WeightKey:
    """Validate and canonicalize dominant integral Dynkin labels."""

    array = np.asarray(labels)
    if array.shape != (system.rank,):
        raise ValueError(
            f"{system.key} has rank {system.rank}; expected {system.rank} Dynkin labels"
        )
    if not np.issubdtype(array.dtype, np.number):
        raise ValueError("Dynkin labels must be integers")
    if not np.issubdtype(array.dtype, np.integer):
        if not np.allclose(array, np.rint(array)):
            raise ValueError("Dynkin labels must be integers")
        array = np.rint(array)
    integer_labels = array.astype(int)
    if np.any(integer_labels < 0):
        raise ValueError("A highest weight must have non-negative Dynkin labels")
    return tuple(int(value) for value in integer_labels)


def _diagram_character(diagram: WeightDiagram) -> Counter[WeightKey]:
    return Counter(
        {
            tuple(int(value) for value in labels): int(multiplicity)
            for labels, multiplicity in zip(
                diagram.dynkin_coordinates, diagram.multiplicities, strict=True
            )
        }
    )


def _convolve_characters(
    left: Mapping[WeightKey, int], right: Mapping[WeightKey, int]
) -> Counter[WeightKey]:
    product: Counter[WeightKey] = Counter()
    for left_weight, left_multiplicity in left.items():
        for right_weight, right_multiplicity in right.items():
            weight = tuple(a + b for a, b in zip(left_weight, right_weight, strict=True))
            product[weight] += left_multiplicity * right_multiplicity
    return product


def _rho_score(system: RootSystem, dynkin_weight: WeightKey) -> float:
    """Return ``(weight, rho)``, a strictly dominance-increasing score."""

    weight = np.asarray(dynkin_weight, dtype=float) @ system.fundamental_weights
    rho = np.sum(system.fundamental_weights, axis=0)
    return float(np.dot(weight, rho))


def _highest_dominant_weight(system: RootSystem, character: Mapping[WeightKey, int]) -> WeightKey:
    """Find a highest weight in a nonzero Weyl-invariant character."""

    dominant = [
        weight
        for weight, multiplicity in character.items()
        if multiplicity > 0 and all(label >= 0 for label in weight)
    ]
    if not dominant:
        raise ArithmeticError("Residual character has no dominant weight")
    return max(dominant, key=lambda weight: (_rho_score(system, weight), weight))


def _subtract_irrep(residual: Counter[WeightKey], diagram: WeightDiagram, copies: int) -> None:
    for weight, multiplicity in _diagram_character(diagram).items():
        residual[weight] -= copies * multiplicity
        if residual[weight] < 0:
            raise ArithmeticError(
                "Irreducible subtraction produced a negative weight multiplicity "
                f"at {weight}: {residual[weight]}"
            )
        if residual[weight] == 0:
            del residual[weight]


@lru_cache(maxsize=256)
def _tensor_product_many_cached(
    system_key: str,
    factor_highest: tuple[WeightKey, ...],
    max_weight_pairs: int,
) -> TensorProduct:
    system = get_root_system(system_key)
    diagrams = [representation_weights(system.key, labels) for labels in factor_highest]
    product_character = _diagram_character(diagrams[0])
    work = 0
    for diagram in diagrams[1:]:
        next_character = _diagram_character(diagram)
        work += len(product_character) * len(next_character)
        if work > max_weight_pairs:
            raise ValueError(
                f"Tensor convolution needs more than {max_weight_pairs:,} weight pairs. "
                "Use smaller highest weights or increase max_weight_pairs deliberately."
            )
        product_character = _convolve_characters(product_character, next_character)
    residual = product_character.copy()
    components: list[IrreducibleComponent] = []

    while residual:
        highest = _highest_dominant_weight(system, residual)
        copies = residual[highest]
        diagram = representation_weights(system.key, highest)
        components.append(
            IrreducibleComponent(
                highest_dynkin=highest,
                multiplicity=copies,
                dimension=diagram.dimension,
            )
        )
        _subtract_irrep(residual, diagram, copies)

    ordered_weights = sorted(
        product_character,
        key=lambda weight: (-_rho_score(system, weight), weight),
    )
    dynkin_coordinates = np.asarray(ordered_weights, dtype=int)
    multiplicities = np.asarray(
        [product_character[weight] for weight in ordered_weights], dtype=int
    )
    ambient_weights = dynkin_coordinates @ system.fundamental_weights
    dimension = math.prod(diagram.dimension for diagram in diagrams)
    result = TensorProduct(
        system_key=system.key,
        factor_highest=tuple(diagram.highest_dynkin for diagram in diagrams),
        dynkin_coordinates=dynkin_coordinates,
        ambient_weights=ambient_weights,
        display_weights=system.to_display(ambient_weights),
        multiplicities=multiplicities,
        components=tuple(components),
        dimension=dimension,
    )
    if int(np.sum(multiplicities)) != dimension:
        raise ArithmeticError("Tensor character does not have dim(V) * dim(W)")
    if result.decomposition_dimension != dimension:
        raise ArithmeticError("Irreducible dimensions do not sum to dim(V) * dim(W)")
    if reconstructed_character(result) != result.character():
        raise ArithmeticError("Irreducible characters do not reconstruct the product")
    return result


def tensor_product(
    system: str,
    left_dynkin: Sequence[int],
    right_dynkin: Sequence[int],
    max_weight_pairs: int = 2_000_000,
) -> TensorProduct:
    """Compute the weight character and irreducible decomposition of ``V ⊗ W``.

    The two factors must be dominant integral highest weights for the same
    supported rank-2 or rank-3 root system.
    """

    return tensor_product_many(
        system,
        (left_dynkin, right_dynkin),
        max_weight_pairs=max_weight_pairs,
    )


def tensor_product_many(
    system: str,
    factors: Sequence[Sequence[int]],
    max_weight_pairs: int = 2_000_000,
) -> TensorProduct:
    """Decompose a product of two or three highest-weight representations."""

    root_system = get_root_system(system)
    factor_tuple = tuple(_labels_tuple(root_system, labels) for labels in factors)
    if not 2 <= len(factor_tuple) <= 3:
        raise ValueError("Choose two or three tensor factors")
    if max_weight_pairs <= 0:
        raise ValueError("max_weight_pairs must be positive")
    return _tensor_product_many_cached(root_system.key, factor_tuple, max_weight_pairs)


def reconstructed_character(product: TensorProduct) -> dict[WeightKey, int]:
    """Rebuild a product character from its listed irreducible components."""

    reconstructed: Counter[WeightKey] = Counter()
    for component in product.components:
        diagram = representation_weights(product.system_key, component.highest_dynkin)
        for weight, multiplicity in _diagram_character(diagram).items():
            reconstructed[weight] += component.multiplicity * multiplicity
    return dict(reconstructed)


def decomposition_residual_character(
    product: TensorProduct, extracted_components: int
) -> dict[WeightKey, int]:
    """Return the residual character after the first decomposition steps.

    One step removes all copies of one listed highest-weight component.  Step
    zero is the original product character; the final step is the empty map.
    """

    if not 0 <= extracted_components <= len(product.components):
        raise ValueError(f"extracted_components must lie in [0, {len(product.components)}]")
    residual = Counter(product.character())
    for component in product.components[:extracted_components]:
        diagram = representation_weights(product.system_key, component.highest_dynkin)
        _subtract_irrep(residual, diagram, component.multiplicity)
    return dict(residual)


def format_irrep(highest_dynkin: Sequence[int], dimension: int | None = None) -> str:
    """Format one irrep compactly without assuming group-specific names."""

    labels = tuple(int(value) for value in highest_dynkin)
    dimension_text = f"dim {dimension}, " if dimension is not None else ""
    return f"V({labels}; {dimension_text}highest weight)"


def format_decomposition(product: TensorProduct) -> str:
    """Return a readable, convention-independent decomposition equation."""

    factors = " ⊗ ".join(
        f"V{labels}[{weyl_dimension(product.system_key, labels)}]"
        for labels in product.factor_highest
    )
    terms = []
    for component in product.components:
        prefix = f"{component.multiplicity}·" if component.multiplicity > 1 else ""
        terms.append(f"{prefix}V{component.highest_dynkin}[{component.dimension}]")
    return f"{factors} = " + " ⊕ ".join(terms)
