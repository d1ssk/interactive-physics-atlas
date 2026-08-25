"""Exact finite-type Dynkin-diagram data and Cartan-matrix checks.

The convention is ``A_ij = <alpha_i, alpha_j^vee>``.  On a multiple
bond the arrow points toward the shorter simple root.  Thus, if an arrow
on the bond ``i--j`` points to ``j``, ``A_ij`` has the larger magnitude.

This module contains no rendering code.  The browser application receives
its authoritative diagram catalogue from :func:`catalog_payload` at build
time and only performs graph matching against that catalogue.
"""

from __future__ import annotations

import math
from collections import deque
from collections.abc import Sequence
from dataclasses import dataclass
from fractions import Fraction

CartanMatrix = tuple[tuple[int, ...], ...]


@dataclass(frozen=True, slots=True)
class DynkinDiagram:
    """A connected finite crystallographic Dynkin diagram."""

    name: str
    cartan: CartanMatrix

    @property
    def rank(self) -> int:
        return len(self.cartan)


def _matrix(values: Sequence[Sequence[int]]) -> CartanMatrix:
    return tuple(tuple(int(value) for value in row) for row in values)


def _chain(rank: int, multiple: tuple[int, int, int] | None = None) -> CartanMatrix:
    matrix = [[2 if i == j else 0 for j in range(rank)] for i in range(rank)]
    for index in range(rank - 1):
        matrix[index][index + 1] = -1
        matrix[index + 1][index] = -1
    if multiple is not None:
        left, right, arrow_toward = multiple
        multiplicity = 2
        matrix[left][right] = -multiplicity if arrow_toward == right else -1
        matrix[right][left] = -multiplicity if arrow_toward == left else -1
    return _matrix(matrix)


def _simply_laced(rank: int, edges: Sequence[tuple[int, int]]) -> CartanMatrix:
    matrix = [[2 if i == j else 0 for j in range(rank)] for i in range(rank)]
    for left, right in edges:
        matrix[left][right] = -1
        matrix[right][left] = -1
    return _matrix(matrix)


def diagram_catalog(max_rank: int = 8) -> tuple[DynkinDiagram, ...]:
    """Return all connected finite types through ``max_rank``.

    The default includes every exceptional finite crystallographic type.
    Classical families are included from their non-duplicated ranks:
    ``A_1``, the isomorphic ``B_2/C_2``, and ``D_4`` onward.
    """

    if not 1 <= max_rank <= 8:
        raise ValueError("max_rank must be between 1 and 8")

    diagrams = [DynkinDiagram(f"A{rank}", _chain(rank)) for rank in range(1, max_rank + 1)]
    if max_rank >= 2:
        diagrams.append(DynkinDiagram("B2/C2", _chain(2, (0, 1, 1))))
    for rank in range(3, max_rank + 1):
        diagrams.append(DynkinDiagram(f"B{rank}", _chain(rank, (rank - 2, rank - 1, rank - 1))))
        diagrams.append(DynkinDiagram(f"C{rank}", _chain(rank, (rank - 2, rank - 1, rank - 2))))
    for rank in range(4, max_rank + 1):
        edges = [(index, index + 1) for index in range(rank - 3)]
        edges.extend([(rank - 3, rank - 2), (rank - 3, rank - 1)])
        diagrams.append(DynkinDiagram(f"D{rank}", _simply_laced(rank, edges)))

    exceptional: list[DynkinDiagram] = []
    if max_rank >= 2:
        exceptional.append(DynkinDiagram("G2", ((2, -1), (-3, 2))))
    if max_rank >= 4:
        exceptional.append(
            DynkinDiagram(
                "F4",
                (
                    (2, -1, 0, 0),
                    (-1, 2, -2, 0),
                    (0, -1, 2, -1),
                    (0, 0, -1, 2),
                ),
            )
        )
    for rank in range(6, max_rank + 1):
        chain_edges = [(index, index + 1) for index in range(rank - 2)]
        exceptional.append(
            DynkinDiagram(f"E{rank}", _simply_laced(rank, [*chain_edges, (2, rank - 1)]))
        )
    return tuple([*diagrams, *exceptional])


def cartan_edges(cartan: Sequence[Sequence[int]]) -> tuple[dict[str, int | None], ...]:
    """Convert a Cartan matrix to editor edge records."""

    matrix = _matrix(cartan)
    _validate_square(matrix)
    edges: list[dict[str, int | None]] = []
    for left in range(len(matrix)):
        for right in range(left + 1, len(matrix)):
            if matrix[left][right] == matrix[right][left] == 0:
                continue
            multiplicity = max(abs(matrix[left][right]), abs(matrix[right][left]))
            arrow_toward = None
            if multiplicity > 1:
                arrow_toward = (
                    right if abs(matrix[left][right]) > abs(matrix[right][left]) else left
                )
            edges.append(
                {
                    "source": left,
                    "target": right,
                    "multiplicity": multiplicity,
                    "arrowToward": arrow_toward,
                }
            )
    return tuple(edges)


def symmetrizer(cartan: Sequence[Sequence[int]]) -> tuple[int, ...]:
    """Return the primitive positive diagonal symmetrizer ``D`` for ``D A``."""

    matrix = _matrix(cartan)
    _validate_generalized_cartan(matrix)
    factors: list[Fraction | None] = [None] * len(matrix)
    for start in range(len(matrix)):
        if factors[start] is not None:
            continue
        factors[start] = Fraction(1)
        queue = deque([start])
        while queue:
            left = queue.popleft()
            for right in range(len(matrix)):
                if matrix[left][right] == 0:
                    continue
                candidate = factors[left] * Fraction(matrix[left][right], matrix[right][left])
                if candidate <= 0:
                    raise ValueError("Cartan matrix is not positively symmetrizable")
                if factors[right] is None:
                    factors[right] = candidate
                    queue.append(right)
                elif factors[right] != candidate:
                    raise ValueError("Cartan matrix is not symmetrizable")
    resolved = [factor for factor in factors if factor is not None]
    common_denominator = math.lcm(*(factor.denominator for factor in resolved))
    integers = [int(factor * common_denominator) for factor in resolved]
    divisor = math.gcd(*integers)
    return tuple(value // divisor for value in integers)


def is_finite_cartan(cartan: Sequence[Sequence[int]]) -> bool:
    """Return whether ``cartan`` is a symmetrizable positive-definite GCM."""

    try:
        matrix = _matrix(cartan)
        _validate_generalized_cartan(matrix)
        diagonal = symmetrizer(matrix)
    except ValueError:
        return False
    symmetric = tuple(
        tuple(Fraction(diagonal[row] * matrix[row][column]) for column in range(len(matrix)))
        for row in range(len(matrix))
    )
    if symmetric != tuple(
        tuple(symmetric[column][row] for column in range(len(matrix))) for row in range(len(matrix))
    ):
        return False
    return all(
        _determinant(tuple(row[:size] for row in symmetric[:size])) > 0
        for size in range(1, len(matrix) + 1)
    )


def classify_cartan(cartan: Sequence[Sequence[int]]) -> tuple[str, ...] | None:
    """Classify a finite Cartan matrix up to simultaneous node permutation.

    Disconnected matrices are returned as a tuple of their simple components.
    ``None`` denotes a matrix outside the rank-eight finite catalogue.
    """

    try:
        matrix = _matrix(cartan)
        _validate_generalized_cartan(matrix)
    except ValueError:
        return None
    if not matrix or len(matrix) > 8 or not is_finite_cartan(matrix):
        return None

    names: list[str] = []
    catalog = diagram_catalog()
    for component in _components(matrix):
        block = tuple(tuple(matrix[row][column] for column in component) for row in component)
        match = next(
            (
                diagram.name
                for diagram in catalog
                if diagram.rank == len(block) and _isomorphic(block, diagram.cartan)
            ),
            None,
        )
        if match is None:
            return None
        names.append(match)
    return tuple(names)


def catalog_payload(max_rank: int = 8) -> dict[str, object]:
    """Return JSON-serializable authoritative data for the static application."""

    diagrams = diagram_catalog(max_rank)
    return {
        "schemaVersion": 1,
        "maxRank": max_rank,
        "convention": "A_ij = <alpha_i, alpha_j^vee>; arrows point to short roots",
        "diagrams": [
            {
                "name": diagram.name,
                "rank": diagram.rank,
                "cartan": diagram.cartan,
                "edges": cartan_edges(diagram.cartan),
            }
            for diagram in diagrams
        ],
    }


def _validate_square(matrix: CartanMatrix) -> None:
    if not matrix or any(len(row) != len(matrix) for row in matrix):
        raise ValueError("Cartan matrix must be non-empty and square")


def _validate_generalized_cartan(matrix: CartanMatrix) -> None:
    _validate_square(matrix)
    for row in range(len(matrix)):
        if matrix[row][row] != 2:
            raise ValueError("Cartan diagonal entries must equal 2")
        for column in range(len(matrix)):
            if row == column:
                continue
            if matrix[row][column] > 0:
                raise ValueError("off-diagonal Cartan entries must be non-positive")
            if (matrix[row][column] == 0) != (matrix[column][row] == 0):
                raise ValueError("opposite Cartan entries must vanish together")


def _determinant(matrix: Sequence[Sequence[Fraction]]) -> Fraction:
    size = len(matrix)
    work = [list(row) for row in matrix]
    determinant = Fraction(1)
    for column in range(size):
        pivot = next((row for row in range(column, size) if work[row][column]), None)
        if pivot is None:
            return Fraction(0)
        if pivot != column:
            work[column], work[pivot] = work[pivot], work[column]
            determinant *= -1
        pivot_value = work[column][column]
        determinant *= pivot_value
        for entry in range(column, size):
            work[column][entry] /= pivot_value
        for row in range(column + 1, size):
            factor = work[row][column]
            for entry in range(column, size):
                work[row][entry] -= factor * work[column][entry]
    return determinant


def _components(matrix: CartanMatrix) -> tuple[tuple[int, ...], ...]:
    unseen = set(range(len(matrix)))
    components: list[tuple[int, ...]] = []
    while unseen:
        start = min(unseen)
        queue = [start]
        unseen.remove(start)
        component: list[int] = []
        while queue:
            node = queue.pop()
            component.append(node)
            neighbors = {index for index in unseen if matrix[node][index] != 0}
            unseen.difference_update(neighbors)
            queue.extend(sorted(neighbors, reverse=True))
        components.append(tuple(sorted(component)))
    return tuple(components)


def _node_signature(matrix: CartanMatrix, node: int) -> tuple[tuple[int, int], ...]:
    return tuple(
        sorted(
            (matrix[node][other], matrix[other][node])
            for other in range(len(matrix))
            if other != node and matrix[node][other] != 0
        )
    )


def _isomorphic(left: CartanMatrix, right: CartanMatrix) -> bool:
    if len(left) != len(right):
        return False
    candidates = {
        node: [
            target
            for target in range(len(right))
            if _node_signature(left, node) == _node_signature(right, target)
        ]
        for node in range(len(left))
    }
    if any(not values for values in candidates.values()):
        return False
    order = sorted(range(len(left)), key=lambda node: len(candidates[node]))
    mapping: dict[int, int] = {}
    used: set[int] = set()

    def search(position: int) -> bool:
        if position == len(order):
            return True
        node = order[position]
        for target in candidates[node]:
            if target in used:
                continue
            if any(
                left[node][known] != right[target][mapped]
                or left[known][node] != right[mapped][target]
                for known, mapped in mapping.items()
            ):
                continue
            mapping[node] = target
            used.add(target)
            if search(position + 1):
                return True
            used.remove(target)
            del mapping[node]
        return False

    return search(0)
