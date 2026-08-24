"""Plotly rendering and static application builder for Lie-algebra structures."""

# ruff: noqa: E501 -- embedded HTML/CSS/JavaScript is kept readable in its native syntax.

from __future__ import annotations

import itertools
import json
from pathlib import Path

import numpy as np
import plotly.graph_objects as go
from plotly.offline import get_plotlyjs
from plotly.utils import PlotlyJSONEncoder

from .physics import (
    RANK2_SYSTEMS,
    RANK3_SYSTEMS,
    REPRESENTATION_PRESETS,
    TensorProduct,
    WeightDiagram,
    decomposition_residual_character,
    format_decomposition,
    get_root_system,
    representation_weights,
    tensor_product_many,
)

PALETTE = {
    "blue": "#3B6FB6",
    "blue_light": "#83A6D6",
    "blue_dark": "#244A73",
    "gold": "#C69214",
    "violet": "#6A4C93",
    "ink": "#263238",
    "muted": "#687078",
    "grid": "#DDE2E6",
    "background": "#FCFCFD",
}

PLOTLY_CONFIG = {"scrollZoom": True, "displaylogo": False, "responsive": True}


def _axis_style(title: str, *, three_dimensional: bool = False) -> dict[str, object]:
    style: dict[str, object] = {
        "title": title,
        "gridcolor": PALETTE["grid"],
        "zerolinecolor": PALETTE["muted"],
        "showspikes": False,
    }
    if three_dimensional:
        style["showbackground"] = False
    else:
        style["automargin"] = True
    return style


def _apply_layout(figure: go.Figure, rank: int, title: str) -> go.Figure:
    common = {
        "template": None,
        "title": {
            "text": title,
            "x": 0.01,
            "xanchor": "left",
            "y": 0.98,
            "yanchor": "top",
            "font": {"size": 18},
        },
        "paper_bgcolor": PALETTE["background"],
        "plot_bgcolor": PALETTE["background"],
        "font": {"family": "Arial, sans-serif", "color": PALETTE["ink"]},
        "legend": {
            "orientation": "h",
            "yanchor": "top",
            "y": -0.1,
            "xanchor": "left",
            "x": 0.0,
        },
        "margin": {"l": 55, "r": 25, "b": 125, "t": 90},
        "height": 700,
    }
    if rank == 2:
        figure.update_layout(
            **common,
            dragmode="pan",
            xaxis={**_axis_style("v1"), "scaleanchor": "y", "scaleratio": 1},
            yaxis=_axis_style("v2"),
        )
    else:
        figure.update_layout(
            **common,
            scene={
                "xaxis": _axis_style("v1", three_dimensional=True),
                "yaxis": _axis_style("v2", three_dimensional=True),
                "zaxis": _axis_style("v3", three_dimensional=True),
                "aspectmode": "data",
                "camera": {"eye": {"x": 1.55, "y": 1.45, "z": 1.15}},
                "dragmode": "turntable",
            },
        )
    return figure


def _length_classes(vectors: np.ndarray) -> tuple[np.ndarray, list[float]]:
    lengths = np.linalg.norm(vectors, axis=1)
    unique = sorted({round(float(value), 8) for value in lengths})
    classes = np.asarray(
        [min(range(len(unique)), key=lambda index: abs(value - unique[index])) for value in lengths]
    )
    return classes, unique


def _segments(points: np.ndarray, rank: int):
    coordinates: list[list[float | None]] = [[] for _ in range(rank)]
    for point in points:
        for axis in range(rank):
            coordinates[axis].extend([0.0, float(point[axis]), None])
    return coordinates


def _integer_tuple(values: np.ndarray) -> tuple[int, ...]:
    return tuple(int(value) for value in values)


def plot_root_system(
    system: str,
    show_fundamental_weights: bool = False,
) -> go.Figure:
    """Return a Plotly root-system figure for rank 2 or rank 3."""

    root_system = get_root_system(system)
    points = root_system.display_roots
    classes, lengths = _length_classes(points)
    figure = go.Figure()
    for class_index in range(len(lengths)):
        mask = classes == class_index
        selected = points[mask]
        name = (
            "roots" if len(lengths) == 1 else ("short roots" if class_index == 0 else "long roots")
        )
        color = (
            PALETTE["blue"]
            if len(lengths) == 1
            else (PALETTE["blue_light"] if class_index == 0 else PALETTE["blue_dark"])
        )
        coordinates = _segments(selected, root_system.rank)
        coroot_labels = np.asarray(
            [
                np.rint(
                    2.0
                    * root
                    @ root_system.simple_roots.T
                    / np.einsum("ij,ij->i", root_system.simple_roots, root_system.simple_roots)
                ).astype(int)
                for root in root_system.roots[mask]
            ]
        )
        hover = []
        for point, labels in zip(selected, coroot_labels, strict=True):
            first_nonzero = next(value for value in point if abs(value) > 1e-9)
            sign = "positive" if first_nonzero > 0 else "negative"
            vector_text = tuple(round(float(value), 4) for value in point)
            hover.append(
                f"v = {vector_text}<br>{sign} root<br>coroot coordinates: {_integer_tuple(labels)}"
            )
        if root_system.rank == 2:
            figure.add_trace(
                go.Scatter(
                    x=coordinates[0],
                    y=coordinates[1],
                    mode="lines",
                    line={"color": color, "width": 2},
                    name=name,
                    hoverinfo="skip",
                )
            )
            figure.add_trace(
                go.Scatter(
                    x=selected[:, 0],
                    y=selected[:, 1],
                    mode="markers",
                    marker={"size": 7, "color": color},
                    text=hover,
                    hovertemplate="%{text}<extra></extra>",
                    showlegend=False,
                )
            )
        else:
            figure.add_trace(
                go.Scatter3d(
                    x=coordinates[0],
                    y=coordinates[1],
                    z=coordinates[2],
                    mode="lines",
                    line={"color": color, "width": 4},
                    name=name,
                    hoverinfo="skip",
                )
            )
            figure.add_trace(
                go.Scatter3d(
                    x=selected[:, 0],
                    y=selected[:, 1],
                    z=selected[:, 2],
                    mode="markers",
                    marker={"size": 2, "color": color},
                    text=hover,
                    hovertemplate="%{text}<extra></extra>",
                    showlegend=False,
                )
            )

    simple = root_system.display_simple_roots
    for index, point in enumerate(simple):
        coordinates = _segments(point[np.newaxis, :], root_system.rank)
        common = {
            "mode": "lines+markers",
            "line": {"color": PALETTE["gold"], "width": 7},
            "marker": {
                "size": 8 if root_system.rank == 2 else 3,
                "color": PALETTE["gold"],
            },
            "name": f"simple root alpha{index + 1}",
            "hovertemplate": f"alpha{index + 1}<extra></extra>",
        }
        if root_system.rank == 2:
            figure.add_trace(go.Scatter(x=coordinates[0][:-1], y=coordinates[1][:-1], **common))
        else:
            figure.add_trace(
                go.Scatter3d(
                    x=coordinates[0][:-1], y=coordinates[1][:-1], z=coordinates[2][:-1], **common
                )
            )

    if show_fundamental_weights:
        fundamental = root_system.to_display(root_system.fundamental_weights)
        for index, point in enumerate(fundamental):
            coordinates = _segments(point[np.newaxis, :], root_system.rank)
            common = {
                "mode": "lines+markers",
                "line": {"color": PALETTE["violet"], "width": 5, "dash": "dot"},
                "marker": {
                    "size": 9 if root_system.rank == 2 else 3,
                    "color": PALETTE["violet"],
                },
                "name": f"fundamental weight omega{index + 1}",
                "hovertemplate": (
                    f"omega{index + 1}<br>Dynkin coordinates: "
                    f"{tuple(1 if j == index else 0 for j in range(root_system.rank))}"
                    "<extra></extra>"
                ),
            }
            if root_system.rank == 2:
                figure.add_trace(go.Scatter(x=coordinates[0][:-1], y=coordinates[1][:-1], **common))
            else:
                figure.add_trace(
                    go.Scatter3d(
                        x=coordinates[0][:-1],
                        y=coordinates[1][:-1],
                        z=coordinates[2][:-1],
                        **common,
                    )
                )
    return _apply_layout(
        figure,
        root_system.rank,
        f"{root_system.key}: {root_system.groups} — {len(root_system.roots)} roots",
    )


def _weight_edges(diagram: WeightDiagram) -> list[tuple[int, int]]:
    system = get_root_system(diagram.system_key)
    lookup = {
        tuple(int(value) for value in labels): index
        for index, labels in enumerate(diagram.dynkin_coordinates)
    }
    edges: set[tuple[int, int]] = set()
    for source_index, labels in enumerate(diagram.dynkin_coordinates):
        for root_index in range(system.rank):
            target = tuple(int(value) for value in labels - system.cartan_matrix[root_index])
            if target in lookup:
                edges.add(tuple(sorted((source_index, lookup[target]))))
    return sorted(edges)


def _edge_coordinates(points: np.ndarray, edges: list[tuple[int, int]], rank: int):
    coordinates: list[list[float | None]] = [[] for _ in range(rank)]
    for source, target in edges:
        for axis in range(rank):
            coordinates[axis].extend(
                [float(points[source, axis]), float(points[target, axis]), None]
            )
    return coordinates


def plot_weight_diagram(
    diagram: WeightDiagram,
    connect: bool = True,
) -> go.Figure:
    """Plot an irreducible weight diagram with multiplicities."""

    system = get_root_system(diagram.system_key)
    points = diagram.display_weights
    figure = go.Figure()
    if connect:
        coordinates = _edge_coordinates(points, _weight_edges(diagram), system.rank)
        common = {
            "mode": "lines",
            "line": {"color": PALETTE["grid"], "width": 2},
            "hoverinfo": "skip",
            "name": "simple-root steps",
        }
        if system.rank == 2:
            figure.add_trace(go.Scatter(x=coordinates[0], y=coordinates[1], **common))
        else:
            figure.add_trace(
                go.Scatter3d(x=coordinates[0], y=coordinates[1], z=coordinates[2], **common)
            )

    hover = [
        f"Dynkin: {_integer_tuple(labels)}<br>multiplicity: {multiplicity}<br>level: {level}"
        for labels, multiplicity, level in zip(
            diagram.dynkin_coordinates,
            diagram.multiplicities,
            diagram.levels,
            strict=True,
        )
    ]
    marker = {
        "size": 8 + 3 * np.sqrt(diagram.multiplicities),
        "color": diagram.multiplicities,
        "colorscale": [[0.0, PALETTE["blue_light"]], [1.0, PALETTE["blue_dark"]]],
        "line": {"color": PALETTE["ink"], "width": 1},
        "colorbar": {"title": "multiplicity", "thickness": 14},
        "showscale": bool(np.max(diagram.multiplicities) > 1),
    }
    common = {
        "mode": "markers",
        "marker": marker,
        "text": hover,
        "hovertemplate": "%{text}<extra></extra>",
        "name": "weights",
    }
    if system.rank == 2:
        figure.add_trace(go.Scatter(x=points[:, 0], y=points[:, 1], **common))
    else:
        figure.add_trace(go.Scatter3d(x=points[:, 0], y=points[:, 1], z=points[:, 2], **common))

    highest_index = int(np.argmin(diagram.levels))
    highest = points[highest_index]
    highest_common = {
        "mode": "markers",
        "marker": {"size": 14, "symbol": "diamond-open", "color": PALETTE["gold"]},
        "name": "highest weight",
        "hovertemplate": f"highest weight {diagram.highest_dynkin}<extra></extra>",
    }
    if system.rank == 2:
        figure.add_trace(go.Scatter(x=[highest[0]], y=[highest[1]], **highest_common))
    else:
        figure.add_trace(
            go.Scatter3d(x=[highest[0]], y=[highest[1]], z=[highest[2]], **highest_common)
        )

    return _apply_layout(
        figure,
        system.rank,
        f"{system.key} weights: highest {diagram.highest_dynkin} — dim {diagram.dimension}",
    )


def plot_weights(system: str, dynkin_labels, **kwargs) -> go.Figure:
    return plot_weight_diagram(representation_weights(system, dynkin_labels), **kwargs)


def plot_tensor_product(
    product: TensorProduct,
    extraction_step: int | None = None,
    show_factor_weights: bool = True,
) -> go.Figure:
    """Plot the product or a residual character during decomposition."""

    system = get_root_system(product.system_key)
    if extraction_step is None:
        dynkin_labels = product.dynkin_coordinates
        multiplicities = product.multiplicities
        points = product.display_weights
        shown_components = product.components
        step_suffix = "final decomposition overview"
    else:
        residual = decomposition_residual_character(product, extraction_step)
        ordered = sorted(residual)
        dynkin_labels = np.asarray(ordered, dtype=int)
        multiplicities = np.asarray([residual[labels] for labels in ordered], dtype=int)
        ambient = (
            dynkin_labels @ system.fundamental_weights
            if ordered
            else np.empty((0, system.simple_roots.shape[1]))
        )
        points = system.to_display(ambient)
        shown_components = (
            (product.components[extraction_step],)
            if extraction_step < len(product.components)
            else ()
        )
        step_suffix = f"extraction step {extraction_step}/{len(product.components)}"

    figure = go.Figure()
    hover = [
        f"Dynkin: {_integer_tuple(labels)}<br>residual multiplicity: {multiplicity}"
        for labels, multiplicity in zip(dynkin_labels, multiplicities, strict=True)
    ]
    if len(points):
        common = {
            "mode": "markers",
            "marker": {
                "size": 8 + 2.5 * np.sqrt(multiplicities),
                "color": multiplicities,
                "colorscale": [
                    [0.0, PALETTE["blue_light"]],
                    [1.0, PALETTE["blue_dark"]],
                ],
                "line": {"color": PALETTE["ink"], "width": 1},
                "colorbar": {"title": "multiplicity", "thickness": 14},
            },
            "text": hover,
            "hovertemplate": "%{text}<extra></extra>",
            "name": "residual weights" if extraction_step is not None else "product weights",
        }
        if system.rank == 2:
            figure.add_trace(go.Scatter(x=points[:, 0], y=points[:, 1], **common))
        else:
            figure.add_trace(go.Scatter3d(x=points[:, 0], y=points[:, 1], z=points[:, 2], **common))

    if show_factor_weights:
        factor_colors = ("#2A9D8F", "#E76F51", "#8F5DA2")
        factor_symbols = ("circle-open", "square-open", "diamond-open")
        for factor_index, highest_labels in enumerate(product.factor_highest):
            diagram = representation_weights(product.system_key, highest_labels)
            factor_points = diagram.display_weights
            factor_hover = [
                f"factor {factor_index + 1}: V{highest_labels}<br>"
                f"Dynkin: {_integer_tuple(labels)}<br>multiplicity: {multiplicity}"
                for labels, multiplicity in zip(
                    diagram.dynkin_coordinates, diagram.multiplicities, strict=True
                )
            ]
            factor_common = {
                "mode": "markers",
                "marker": {
                    "size": 7,
                    "symbol": factor_symbols[factor_index],
                    "color": factor_colors[factor_index],
                    "line": {"color": factor_colors[factor_index], "width": 2},
                },
                "text": factor_hover,
                "hovertemplate": "%{text}<extra></extra>",
                "name": f"factor {factor_index + 1} weights: V{highest_labels}",
            }
            if system.rank == 2:
                figure.add_trace(
                    go.Scatter(x=factor_points[:, 0], y=factor_points[:, 1], **factor_common)
                )
            else:
                figure.add_trace(
                    go.Scatter3d(
                        x=factor_points[:, 0],
                        y=factor_points[:, 1],
                        z=factor_points[:, 2],
                        **factor_common,
                    )
                )

    if shown_components:
        component_labels = np.asarray([component.highest_dynkin for component in shown_components])
        highest = system.to_display(component_labels @ system.fundamental_weights)
        highest_hover = [
            f"highest: {component.highest_dynkin}<br>"
            f"dim: {component.dimension}<br>copies: {component.multiplicity}"
            for component in shown_components
        ]
        highest_common = {
            "mode": "markers",
            "marker": {
                "size": 14,
                "symbol": "diamond-open",
                "color": PALETTE["gold"],
            },
            "text": highest_hover,
            "hovertemplate": "%{text}<extra></extra>",
            "name": (
                "next highest weight" if extraction_step is not None else "summand highest weights"
            ),
        }
        if system.rank == 2:
            figure.add_trace(go.Scatter(x=highest[:, 0], y=highest[:, 1], **highest_common))
        else:
            figure.add_trace(
                go.Scatter3d(x=highest[:, 0], y=highest[:, 1], z=highest[:, 2], **highest_common)
            )
    elif extraction_step is not None:
        figure.add_annotation(
            text="Residual character is zero: decomposition complete",
            x=0.5,
            y=0.5,
            xref="paper",
            yref="paper",
            showarrow=False,
            font={"size": 16, "color": PALETTE["ink"]},
        )

    factors = " ⊗ ".join(f"V{labels}" for labels in product.factor_highest)
    return _apply_layout(
        figure,
        system.rank,
        f"{system.key}: {factors}<br><sup>dimension {product.dimension}; {step_suffix}</sup>",
    )


PRODUCT_CASES = {
    "A2": (
        ("3 x 3", ((1, 0), (1, 0))),
        ("3 x 3bar", ((1, 0), (0, 1))),
        ("8 x 8", ((1, 1), (1, 1))),
        ("3 x 3 x 3", ((1, 0), (1, 0), (1, 0))),
    ),
    "B2": (
        ("vector 5 x vector 5", ((1, 0), (1, 0))),
        ("spinor 4 x spinor 4", ((0, 1), (0, 1))),
    ),
    "C2": (
        ("defining 4 x defining 4", ((1, 0), (1, 0))),
        ("defining 4 x fundamental 5", ((1, 0), (0, 1))),
    ),
    "D2": (
        ("half-spinor 2+ x half-spinor 2-", ((1, 0), (0, 1))),
        ("vector 4 x vector 4", ((1, 1), (1, 1))),
    ),
    "G2": (
        ("fundamental 7 x fundamental 7", ((1, 0), (1, 0))),
        ("fundamental 7 x fundamental 7 x fundamental 7", ((1, 0),) * 3),
    ),
    "A3": (
        ("fundamental 4 x fundamental 4", ((1, 0, 0), (1, 0, 0))),
        ("fundamental 4 x antifundamental 4bar", ((1, 0, 0), (0, 0, 1))),
        ("fundamental 4 x fundamental 4 x fundamental 4", ((1, 0, 0),) * 3),
    ),
    "B3": (
        ("spinor 8 x spinor 8", ((0, 0, 1), (0, 0, 1))),
        ("vector 7 x vector 7", ((1, 0, 0), (1, 0, 0))),
    ),
    "C3": (
        ("defining 6 x defining 6", ((1, 0, 0), (1, 0, 0))),
        ("defining 6 x fundamental 14", ((1, 0, 0), (0, 1, 0))),
    ),
    "D3": (
        ("half-spinor 4+ x half-spinor 4-", ((0, 1, 0), (0, 0, 1))),
        ("vector 6 x vector 6", ((1, 0, 0), (1, 0, 0))),
    ),
}


def _figure_data(figure: go.Figure) -> dict[str, object]:
    return figure.to_plotly_json()


def _build_application_data() -> dict[str, object]:
    systems = (*RANK2_SYSTEMS, *RANK3_SYSTEMS)
    catalog: dict[str, object] = {
        "systems": {},
        "roots": {},
        "weights": {},
        "products": {},
    }
    for system_key in systems:
        system = get_root_system(system_key)
        catalog["systems"][system_key] = {
            "rank": system.rank,
            "groups": system.groups,
            "note": system.note,
            "cartan": system.cartan_matrix.tolist(),
            "presets": [
                {"name": name, "labels": labels}
                for name, labels in REPRESENTATION_PRESETS[system_key].items()
            ],
        }
        for show_fundamental in (False, True):
            key = f"{system_key}|{int(show_fundamental)}"
            catalog["roots"][key] = _figure_data(
                plot_root_system(
                    system_key,
                    show_fundamental_weights=show_fundamental,
                )
            )
        for labels in itertools.product(range(4), repeat=system.rank):
            key = f"{system_key}|{','.join(map(str, labels))}"
            catalog["weights"][key] = _figure_data(
                plot_weight_diagram(representation_weights(system_key, labels))
            )

        product_cases = []
        for case_index, (name, factors) in enumerate(PRODUCT_CASES[system_key]):
            product = tensor_product_many(system_key, factors)
            product_cases.append(
                {
                    "id": str(case_index),
                    "name": name,
                    "factors": factors,
                    "summary": format_decomposition(product),
                    "distinctWeights": product.distinct_weight_count,
                    "dimension": product.dimension,
                    "decompositionDimension": product.decomposition_dimension,
                    "steps": [
                        _figure_data(plot_tensor_product(product, extraction_step=step))
                        for step in range(len(product.components) + 1)
                    ],
                    "components": [
                        {
                            "name": (
                                f"V{component.highest_dynkin}, dim {component.dimension}"
                                + (
                                    f" x {component.multiplicity}"
                                    if component.multiplicity > 1
                                    else ""
                                )
                            ),
                            "figure": _figure_data(
                                plot_weights(system_key, component.highest_dynkin)
                            ),
                        }
                        for component in product.components
                    ],
                }
            )
        catalog["products"][system_key] = product_cases
    return catalog


def build(output_dir: Path) -> None:
    """Build a self-contained static Plotly application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(
        _build_application_data(),
        cls=PlotlyJSONEncoder,
        separators=(",", ":"),
    ).replace("</", "<\\/")
    html = _APPLICATION_HTML.replace("__PLOTLY_JS__", get_plotlyjs()).replace(
        "__APPLICATION_DATA__", payload
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")


_APPLICATION_HTML = r"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lie Roots, Weights, and Tensor Products</title>
  <style>
    :root { color-scheme: light; --ink:#263238; --muted:#687078; --line:#dde2e6;
      --blue:#3b6fb6; --paper:#fcfcfd; --gold:#c69214; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--paper); color:var(--ink);
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { max-width:1480px; margin:0 auto; padding:20px; }
    h1 { margin:0 0 8px; font-size:clamp(1.5rem,3vw,2.35rem); }
    .lede { margin:0 0 18px; color:var(--muted); max-width:76ch; line-height:1.5; }
    .tabs { display:flex; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--line); }
    .tab { appearance:none; border:1px solid var(--line); border-bottom:0; border-radius:8px 8px 0 0;
      padding:10px 16px; background:#f2f5f7; color:var(--ink); cursor:pointer; font-weight:650; }
    .tab[aria-selected="true"] { background:white; color:var(--blue); }
    .panel { display:none; background:white; border:1px solid var(--line); border-top:0;
      padding:16px; min-height:790px; }
    .panel.active { display:block; }
    .controls { display:flex; flex-wrap:wrap; align-items:end; gap:12px; padding:12px;
      border:1px solid var(--line); border-radius:8px; background:#f7f9fa; }
    label { display:grid; gap:5px; color:var(--muted); font-size:.82rem; font-weight:650; }
    label.inline { display:flex; align-items:center; gap:7px; padding-bottom:8px; }
    select, input[type="range"] { min-width:150px; }
    select { padding:7px 9px; border:1px solid #bac3c9; border-radius:5px; background:white; }
    .label-sliders { display:flex; flex-wrap:wrap; gap:10px; }
    .label-sliders output { color:var(--ink); font-variant-numeric:tabular-nums; }
    .plot { width:100%; min-height:700px; }
    .product-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(380px,.85fr); gap:12px; }
    .status { white-space:pre-wrap; margin:12px 0 0; padding:10px 12px; border-left:3px solid var(--gold);
      background:#fffaf0; line-height:1.45; }
    .hint { color:var(--muted); font-size:.9rem; margin:10px 0 0; }
    @media (max-width:960px) { .product-grid { grid-template-columns:1fr; } main { padding:10px; }
      .panel { padding:10px; } }
  </style>
  <script>__PLOTLY_JS__</script>
</head>
<body>
<main>
  <h1>Lie Roots, Weights, and Tensor Products</h1>
  <p class="lede">Explore rank-2 and rank-3 root systems, irreducible highest-weight
    characters, and the stepwise extraction of tensor-product summands. All numerical
    characters were computed and checked at build time; the page needs no Python server.</p>
  <nav class="tabs" aria-label="Explorer sections">
    <button class="tab" data-panel="roots-panel" aria-selected="true">1. Root systems</button>
    <button class="tab" data-panel="weights-panel" aria-selected="false">2. Representation weights</button>
    <button class="tab" data-panel="products-panel" aria-selected="false">3. Tensor products</button>
  </nav>

  <section id="roots-panel" class="panel active">
    <div class="controls">
      <label>Cartan type <select id="root-system"></select></label>
      <label class="inline"><input id="root-fundamental" type="checkbox"> Show fundamental weights</label>
    </div>
    <p id="root-note" class="hint"></p>
    <div id="root-plot" class="plot" role="img" aria-label="Root-system diagram"></div>
  </section>

  <section id="weights-panel" class="panel">
    <div class="controls">
      <label>Cartan type <select id="weight-system"></select></label>
      <label>Preset <select id="weight-preset"></select></label>
      <div id="weight-labels" class="label-sliders"></div>
    </div>
    <p id="weight-status" class="hint"></p>
    <div id="weight-plot" class="plot" role="img" aria-label="Weight diagram"></div>
  </section>

  <section id="products-panel" class="panel">
    <div class="controls">
      <label>Cartan type <select id="product-system"></select></label>
      <label>Product <select id="product-case"></select></label>
      <label>Extraction step <input id="product-step" type="range" min="0" value="0"><output id="product-step-value">0</output></label>
      <label>Inspect summand <select id="product-component"></select></label>
      <label class="inline"><input id="product-factors" type="checkbox" checked> Show factor weights</label>
    </div>
    <div id="product-status" class="status"></div>
    <div class="product-grid">
      <div id="product-plot" class="plot" role="img" aria-label="Residual tensor-product character"></div>
      <div id="component-plot" class="plot" role="img" aria-label="Irreducible summand weight diagram"></div>
    </div>
  </section>
</main>
<script id="application-data" type="application/json">__APPLICATION_DATA__</script>
<script>
  "use strict";
  const DATA = JSON.parse(document.getElementById("application-data").textContent);
  const CONFIG = {scrollZoom:true, displaylogo:false, responsive:true};
  const systemKeys = Object.keys(DATA.systems);
  const byId = id => document.getElementById(id);
  const fillSystems = select => {
    select.replaceChildren(...systemKeys.map(key => new Option(`${key} — ${DATA.systems[key].groups}`, key)));
  };
  [byId("root-system"), byId("weight-system"), byId("product-system")].forEach(fillSystems);
  const draw = (target, figure, filterFactors=false) => {
    const traces = filterFactors
      ? figure.data.filter(trace => !(trace.name || "").startsWith("factor "))
      : figure.data;
    Plotly.react(target, traces, figure.layout, CONFIG);
  };

  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(item => item.setAttribute("aria-selected", String(item === tab)));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === tab.dataset.panel));
    window.setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  }));

  function renderRoots() {
    const system = byId("root-system").value;
    const fundamental = Number(byId("root-fundamental").checked);
    draw("root-plot", DATA.roots[`${system}|${fundamental}`]);
    const info = DATA.systems[system];
    byId("root-note").textContent = `${info.groups}; ${info.note}. Cartan matrix: ${JSON.stringify(info.cartan)}`;
  }
  byId("root-system").addEventListener("change", renderRoots);
  byId("root-fundamental").addEventListener("change", renderRoots);

  function configureWeightControls() {
    const system = byId("weight-system").value;
    const info = DATA.systems[system];
    const preset = byId("weight-preset");
    preset.replaceChildren(new Option("Custom Dynkin labels", ""), ...info.presets.map((item, i) => new Option(`${item.name} — (${item.labels.join(", ")})`, i)));
    byId("weight-labels").replaceChildren(...Array.from({length:info.rank}, (_, i) => {
      const label = document.createElement("label");
      label.textContent = `a${i + 1}`;
      const input = Object.assign(document.createElement("input"), {type:"range", min:0, max:3, step:1, value:i === 0 ? 1 : 0});
      input.dataset.index = i;
      const output = document.createElement("output");
      output.textContent = input.value;
      input.addEventListener("input", () => { output.textContent = input.value; preset.value = ""; renderWeights(); });
      label.append(input, output);
      return label;
    }));
    renderWeights();
  }
  function currentWeightLabels() {
    return [...byId("weight-labels").querySelectorAll("input")].map(input => Number(input.value));
  }
  function renderWeights() {
    const system = byId("weight-system").value;
    const labels = currentWeightLabels();
    const figure = DATA.weights[`${system}|${labels.join(",")}`];
    draw("weight-plot", figure);
    byId("weight-status").textContent = `${system} highest weight (${labels.join(", ")}); labels are precomputed for 0..3.`;
  }
  byId("weight-system").addEventListener("change", configureWeightControls);
  byId("weight-preset").addEventListener("change", event => {
    if (event.target.value === "") return;
    const item = DATA.systems[byId("weight-system").value].presets[Number(event.target.value)];
    [...byId("weight-labels").querySelectorAll("input")].forEach((input, i) => {
      input.value = item.labels[i]; input.nextElementSibling.textContent = item.labels[i];
    });
    renderWeights();
  });

  function currentProduct() {
    return DATA.products[byId("product-system").value][Number(byId("product-case").value)];
  }
  function configureProductCases() {
    const cases = DATA.products[byId("product-system").value];
    byId("product-case").replaceChildren(...cases.map((item, i) => new Option(item.name, i)));
    configureProductState();
  }
  function configureProductState() {
    const product = currentProduct();
    const step = byId("product-step");
    step.max = product.steps.length - 1; step.value = 0;
    const component = byId("product-component");
    component.replaceChildren(...product.components.map((item, i) => new Option(item.name, i)));
    renderProduct(); renderComponent();
  }
  function renderProduct() {
    const product = currentProduct();
    const step = Number(byId("product-step").value);
    byId("product-step-value").textContent = `${step} / ${product.steps.length - 1}`;
    draw("product-plot", product.steps[step], !byId("product-factors").checked);
    byId("product-status").textContent = `${product.summary}\n${product.distinctWeights} distinct weights; dimension invariant: ${product.dimension} = ${product.decompositionDimension}.`;
  }
  function renderComponent() {
    const product = currentProduct();
    draw("component-plot", product.components[Number(byId("product-component").value)].figure);
  }
  byId("product-system").addEventListener("change", configureProductCases);
  byId("product-case").addEventListener("change", configureProductState);
  byId("product-step").addEventListener("input", renderProduct);
  byId("product-component").addEventListener("change", renderComponent);
  byId("product-factors").addEventListener("change", renderProduct);

  renderRoots();
  configureWeightControls();
  configureProductCases();
</script>
</body>
</html>
"""
