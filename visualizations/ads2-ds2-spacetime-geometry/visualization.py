"""Plotly rendering and static builder for the AdS2/dS2 explorer."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import plotly.graph_objects as go
from plotly.offline import get_plotlyjs
from plotly.utils import PlotlyJSONEncoder

from physics_atlas.assets import copy_mathjax_assets, copy_visualization_theme_assets

from .physics import AntiDeSitter2, DeSitter2

SOURCE_DIR = Path(__file__).resolve().parent

PALETTE = {
    "ads": "#7357a3",
    "ds": "#168a80",
    "chart_time": "#d59624",
    "chart_space": "#4b81bd",
    "timelike": "#c8463a",
    "spacelike": "#376fb0",
    "null": "#2e8b57",
    "point": "#18212b",
    "grid": "#d9dee5",
    "ink": "#25313c",
    "paper": "rgba(0,0,0,0)",
}


def _plot_coordinates(points: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Map ambient (X0,X1,X2) to displayed (X1,X2,X0)."""

    points = np.asarray(points)
    return points[..., 1], points[..., 2], points[..., 0]


def _line(points: np.ndarray, *, name: str, color: str, width: float = 3, dash: str = "solid"):
    x, y, z = _plot_coordinates(points)
    return go.Scatter3d(
        x=x,
        y=y,
        z=z,
        mode="lines",
        line={"color": color, "width": width, "dash": dash},
        name=name,
        hoverinfo="skip",
        showlegend=False,
    )


def _surface_trace(kind: str) -> go.Surface:
    if kind == "ads":
        geometry = AntiDeSitter2()
        tau = np.linspace(-np.pi, np.pi, 96)
        rho = np.linspace(-2.0, 2.0, 72)
        tt, rr = np.meshgrid(tau, rho)
        points = geometry.global_to_embedding(tt, rr)
        surface_color = rr
        color = PALETTE["ads"]
        name = "AdS2 quadric"
    elif kind == "ds":
        geometry = DeSitter2()
        tau = np.linspace(-2.15, 2.15, 82)
        theta = np.linspace(-np.pi, np.pi, 96)
        tt, aa = np.meshgrid(tau, theta)
        points = geometry.global_to_embedding(tt, aa)
        surface_color = tt
        color = PALETTE["ds"]
        name = "dS2 hyperboloid"
    else:
        raise ValueError(f"Unknown spacetime kind: {kind}")
    x, y, z = _plot_coordinates(points)
    return go.Surface(
        x=x,
        y=y,
        z=z,
        surfacecolor=surface_color,
        colorscale=[[0, color], [1, color]],
        opacity=0.28,
        showscale=False,
        name=name,
        hoverinfo="skip",
    )


def _ads_chart_traces(chart: str) -> list[go.Scatter3d]:
    geometry = AntiDeSitter2()
    traces: list[go.Scatter3d] = []
    if chart == "global":
        tau = np.linspace(-np.pi, np.pi, 320)
        rho = np.linspace(-2.0, 2.0, 260)
        for value in np.linspace(-1.6, 1.6, 7):
            traces.append(
                _line(
                    geometry.global_to_embedding(tau, np.full_like(tau, value)),
                    name="rho constant",
                    color=PALETTE["chart_time"],
                    width=2,
                )
            )
        for value in np.linspace(-np.pi, np.pi, 9, endpoint=False):
            traces.append(
                _line(
                    geometry.global_to_embedding(np.full_like(rho, value), rho),
                    name="tau constant",
                    color=PALETTE["chart_space"],
                    width=2,
                )
            )
    elif chart == "poincare":
        times = np.linspace(-2.2, 2.2, 320)
        radii = np.geomspace(0.25, 4.0, 280)
        for value in np.geomspace(0.32, 3.2, 7):
            traces.append(
                _line(
                    geometry.poincare_to_embedding(times, np.full_like(times, value)),
                    name="z constant",
                    color=PALETTE["chart_time"],
                    width=2,
                )
            )
        for value in np.linspace(-1.8, 1.8, 8):
            traces.append(
                _line(
                    geometry.poincare_to_embedding(np.full_like(radii, value), radii),
                    name="t constant",
                    color=PALETTE["chart_space"],
                    width=2,
                )
            )
    else:
        raise ValueError(f"Unknown AdS2 chart: {chart}")
    return traces


def _ds_chart_traces(chart: str) -> list[go.Scatter3d]:
    geometry = DeSitter2()
    traces: list[go.Scatter3d] = []
    if chart == "global":
        tau = np.linspace(-2.0, 2.0, 260)
        theta = np.linspace(-np.pi, np.pi, 340)
        for value in np.linspace(-1.8, 1.8, 7):
            traces.append(
                _line(
                    geometry.global_to_embedding(np.full_like(theta, value), theta),
                    name="tau constant",
                    color=PALETTE["chart_space"],
                    width=2,
                )
            )
        for value in np.linspace(-np.pi, np.pi, 10, endpoint=False):
            traces.append(
                _line(
                    geometry.global_to_embedding(tau, np.full_like(tau, value)),
                    name="theta constant",
                    color=PALETTE["chart_time"],
                    width=2,
                )
            )
    elif chart == "flat":
        time = np.linspace(-1.5, 1.2, 260)
        space = np.linspace(-2.2, 2.2, 320)
        for value in np.linspace(-1.25, 1.0, 7):
            traces.append(
                _line(
                    geometry.flat_to_embedding(np.full_like(space, value), space),
                    name="t constant",
                    color=PALETTE["chart_space"],
                    width=2,
                )
            )
        for value in np.linspace(-1.8, 1.8, 8):
            traces.append(
                _line(
                    geometry.flat_to_embedding(time, np.full_like(time, value)),
                    name="x constant",
                    color=PALETTE["chart_time"],
                    width=2,
                )
            )
    elif chart == "static":
        time = np.linspace(-2.2, 2.2, 260)
        radius = np.linspace(-0.97, 0.97, 280)
        for value in np.linspace(-1.8, 1.8, 7):
            traces.append(
                _line(
                    geometry.static_to_embedding(np.full_like(radius, value), radius),
                    name="ts constant",
                    color=PALETTE["chart_space"],
                    width=2,
                )
            )
        for value in np.linspace(-0.85, 0.85, 8):
            traces.append(
                _line(
                    geometry.static_to_embedding(time, np.full_like(time, value)),
                    name="r constant",
                    color=PALETTE["chart_time"],
                    width=2,
                )
            )
    else:
        raise ValueError(f"Unknown dS2 chart: {chart}")
    return traces


def _geodesic_traces(kind: str, chart: str, rapidity: float) -> list[go.Scatter3d]:
    if kind == "ads":
        geometry = AntiDeSitter2()
        coordinates = {"global": (0.0, 0.0), "poincare": (0.0, 1.0)}[chart]
        point, time, space, null_plus, _ = geometry.frame(chart, *coordinates, rapidity)
        parameters = {
            "timelike": np.linspace(-np.pi, np.pi, 320),
            "spacelike": np.linspace(-1.65, 1.65, 300),
            "null": np.linspace(-2.4, 2.4, 260),
        }
    else:
        geometry = DeSitter2()
        coordinates = {"global": (0.0, 0.0), "flat": (0.0, 0.0), "static": (0.0, 0.0)}[chart]
        point, time, space, null_plus, _ = geometry.frame(chart, *coordinates, rapidity)
        parameters = {
            "timelike": np.linspace(-1.65, 1.65, 300),
            "spacelike": np.linspace(-np.pi, np.pi, 320),
            "null": np.linspace(-2.4, 2.4, 260),
        }
    traces = [
        _line(
            geometry.geodesic(point, time, parameters["timelike"]),
            name="timelike geodesic",
            color=PALETTE["timelike"],
            width=7,
        ),
        _line(
            geometry.geodesic(point, space, parameters["spacelike"]),
            name="spacelike geodesic",
            color=PALETTE["spacelike"],
            width=7,
        ),
        _line(
            geometry.geodesic(point, null_plus, parameters["null"]),
            name="null geodesic",
            color=PALETTE["null"],
            width=6,
            dash="dash",
        ),
    ]
    x, y, z = _plot_coordinates(point)
    traces.append(
        go.Scatter3d(
            x=[x],
            y=[y],
            z=[z],
            mode="markers",
            marker={"size": 5, "color": PALETTE["point"]},
            name="initial point",
            showlegend=False,
        )
    )
    return traces


def _coordinate_control_data(kind: str, chart: str, boost_keys: tuple[str, ...]):
    """Precompute slider-selected points, coordinate lines, and local frames."""

    if kind == "ads":
        geometry = AntiDeSitter2()
        if chart == "global":
            coordinate_map = geometry.global_to_embedding
            q1_values = np.linspace(-np.pi, np.pi, 13)
            q2_values = np.linspace(-1.8, 1.8, 13)
            q1_dense = np.linspace(-np.pi, np.pi, 320)
            q2_dense = np.linspace(-2.0, 2.0, 260)
            labels = ("global time τ", "radial coordinate ρ")
        else:
            coordinate_map = geometry.poincare_to_embedding
            q1_values = np.linspace(-2.0, 2.0, 13)
            q2_values = np.geomspace(0.25, 4.0, 13)
            q1_dense = np.linspace(-2.2, 2.2, 320)
            q2_dense = np.geomspace(0.22, 4.2, 280)
            labels = ("Poincaré time t", "radial coordinate z")
    else:
        geometry = DeSitter2()
        if chart == "global":
            coordinate_map = geometry.global_to_embedding
            q1_values = np.linspace(-1.8, 1.8, 13)
            q2_values = np.linspace(-np.pi, np.pi, 13)
            q1_dense = np.linspace(-2.0, 2.0, 280)
            q2_dense = np.linspace(-np.pi, np.pi, 340)
            labels = ("global time τ", "periodic angle θ")
        elif chart == "flat":
            coordinate_map = geometry.flat_to_embedding
            q1_values = np.linspace(-1.4, 1.1, 13)
            q2_values = np.linspace(-1.8, 1.8, 13)
            q1_dense = np.linspace(-1.5, 1.2, 280)
            q2_dense = np.linspace(-2.0, 2.0, 320)
            labels = ("flat time t", "comoving position x")
        else:
            coordinate_map = geometry.static_to_embedding
            q1_values = np.linspace(-1.8, 1.8, 13)
            q2_values = np.linspace(-0.85, 0.85, 13)
            q1_dense = np.linspace(-2.0, 2.0, 280)
            q2_dense = np.linspace(-0.95, 0.95, 300)
            labels = ("static time tₛ", "static radius r")

    q1_grid, q2_grid = np.meshgrid(q1_values, q2_values, indexing="ij")
    points = coordinate_map(q1_grid, q2_grid)
    point_x, point_y, point_z = _plot_coordinates(points)
    plotted_points = np.stack([point_x, point_y, point_z], axis=-1)

    q1_curves = []
    for q2 in q2_values:
        curve = coordinate_map(q1_dense, np.full_like(q1_dense, q2))
        trace = _line(
            curve,
            name=f"vary {labels[0]}",
            color=PALETTE["chart_time"],
            width=6,
        )
        trace.opacity = 0.95
        q1_curves.append(trace)
    q2_curves = []
    for q1 in q1_values:
        curve = coordinate_map(np.full_like(q2_dense, q1), q2_dense)
        trace = _line(
            curve,
            name=f"vary {labels[1]}",
            color=PALETTE["chart_space"],
            width=6,
        )
        trace.opacity = 0.95
        q2_curves.append(trace)

    frames: dict[str, np.ndarray] = {}
    frame_scales = (0.34, 0.34, 0.23, 0.23)
    for boost_key in boost_keys:
        boost = float(boost_key)
        frame_data = np.empty((len(q1_values), len(q2_values), 4, 2, 3))
        for q1_index, q1 in enumerate(q1_values):
            for q2_index, q2 in enumerate(q2_values):
                point, time, space, null_plus, null_minus = geometry.frame(
                    chart, float(q1), float(q2), boost
                )
                for vector_index, (vector, scale) in enumerate(
                    zip((time, space, null_plus, null_minus), frame_scales, strict=True)
                ):
                    segment = np.stack([point, point + scale * vector])
                    x, y, z = _plot_coordinates(segment)
                    frame_data[q1_index, q2_index, vector_index] = np.stack([x, y, z], axis=-1)
        frames[boost_key] = frame_data

    return {
        "q1Values": q1_values,
        "q2Values": q2_values,
        "defaultQ1": int(np.argmin(np.abs(q1_values))),
        "defaultQ2": int(np.argmin(np.abs(q2_values - (1.0 if chart == "poincare" else 0.0)))),
        "points": plotted_points,
        "q1Curves": q1_curves,
        "q2Curves": q2_curves,
        "frames": frames,
    }


def _embedding_layout(kind: str) -> go.Layout:
    title = "AdS₂ ambient embedding" if kind == "ads" else "dS₂ ambient embedding"
    return go.Layout(
        template=None,
        title={"text": title, "x": 0.01, "xanchor": "left"},
        paper_bgcolor=PALETTE["paper"],
        font={"family": "Arial, sans-serif", "color": PALETTE["ink"]},
        margin={"l": 10, "r": 10, "b": 10, "t": 54},
        height=650,
        scene={
            "xaxis": {"title": "X1", "showbackground": False},
            "yaxis": {"title": "X2", "showbackground": False},
            "zaxis": {"title": "X0", "showbackground": False},
            "aspectmode": "data",
            "dragmode": "turntable",
            "camera": {"eye": {"x": 1.45, "y": 1.35, "z": 1.05}},
        },
        showlegend=False,
        uirevision=f"{kind}-camera",
    )


def penrose_figure(kind: str) -> go.Figure:
    """Return a causal/conformal diagram for AdS2 or dS2."""

    figure = go.Figure()
    if kind == "ads":
        boundary = np.pi / 2
        time_limit = np.pi
        for sigma in (-boundary, boundary):
            figure.add_trace(
                go.Scatter(
                    x=[sigma, sigma],
                    y=[-time_limit, time_limit],
                    mode="lines",
                    line={"color": PALETTE["ads"], "width": 7},
                    name="timelike conformal boundary",
                    showlegend=sigma < 0,
                )
            )
        for sign in (-1, 1):
            figure.add_trace(
                go.Scatter(
                    x=[-boundary, boundary],
                    y=[-sign * boundary, sign * boundary],
                    mode="lines",
                    line={"color": PALETTE["null"], "dash": "dash", "width": 3},
                    name="null ray" if sign == 1 else None,
                    showlegend=sign == 1,
                )
            )
        title = "AdS₂ universal cover: conformal strip"
        x_title = "compact radius σ"
        y_title = "unwrapped global time τ"
        x_range = [-1.78, 1.78]
        y_range = [-time_limit, time_limit]
        annotation = "The embedded quadric closes in tau; physical AdS usually unwraps it."
    elif kind == "ds":
        boundary = np.pi / 2
        theta_limit = np.pi
        for eta in (-boundary, boundary):
            figure.add_trace(
                go.Scatter(
                    x=[-theta_limit, theta_limit],
                    y=[eta, eta],
                    mode="lines",
                    line={"color": PALETTE["ds"], "width": 7},
                    name="spacelike conformal boundary",
                    showlegend=eta < 0,
                )
            )
        diamond_x = [0.0, np.pi / 2, 0.0, -np.pi / 2, 0.0]
        diamond_y = [-np.pi / 2, 0.0, np.pi / 2, 0.0, -np.pi / 2]
        figure.add_trace(
            go.Scatter(
                x=diamond_x,
                y=diamond_y,
                mode="lines",
                fill="toself",
                fillcolor="rgba(22,138,128,0.10)",
                line={"color": PALETTE["null"], "dash": "dash", "width": 3},
                name="one static patch",
            )
        )
        title = "dS₂: conformal cylinder cut open"
        x_title = "periodic angle θ"
        y_title = "conformal time η"
        x_range = [-theta_limit, theta_limit]
        y_range = [-1.76, 1.76]
        annotation = (
            "Left and right edges are identified; the shaded diamond "
            "is one observer's static patch."
        )
    else:
        raise ValueError(f"Unknown spacetime kind: {kind}")
    figure.update_layout(
        template=None,
        title={"text": title, "x": 0.01, "xanchor": "left"},
        paper_bgcolor=PALETTE["paper"],
        plot_bgcolor=PALETTE["paper"],
        font={"family": "Arial, sans-serif", "color": PALETTE["ink"]},
        height=520,
        margin={"l": 64, "r": 25, "b": 62, "t": 58},
        dragmode="pan",
        xaxis={
            "title": x_title,
            "range": x_range,
            "scaleanchor": "y",
            "scaleratio": 1,
            "gridcolor": PALETTE["grid"],
        },
        yaxis={"title": y_title, "range": y_range, "gridcolor": PALETTE["grid"]},
        legend={"orientation": "h", "y": -0.18},
        annotations=[
            {
                "text": annotation,
                "xref": "paper",
                "yref": "paper",
                "x": 0.01,
                "y": 1.0,
                "showarrow": False,
                "xanchor": "left",
                "yanchor": "bottom",
                "font": {"size": 12},
            }
        ],
    )
    return figure


def _build_application_data() -> dict[str, object]:
    boosts = tuple(np.linspace(-1.2, 1.2, 9))
    boost_keys = tuple(f"{boost:+.1f}" for boost in boosts)
    charts = {"ads": ("global", "poincare"), "ds": ("global", "flat", "static")}
    return {
        "surfaces": {kind: _surface_trace(kind) for kind in charts},
        "charts": {f"ads|{chart}": _ads_chart_traces(chart) for chart in charts["ads"]}
        | {f"ds|{chart}": _ds_chart_traces(chart) for chart in charts["ds"]},
        "geodesics": {
            f"{kind}|{chart}|{boost_key}": _geodesic_traces(kind, chart, boost)
            for kind, chart_names in charts.items()
            for chart in chart_names
            for boost, boost_key in zip(boosts, boost_keys, strict=True)
        },
        "coordinateControls": {
            f"{kind}|{chart}": _coordinate_control_data(kind, chart, boost_keys)
            for kind, chart_names in charts.items()
            for chart in chart_names
        },
        "boostKeys": boost_keys,
        "boostValues": boosts,
        "layouts": {kind: _embedding_layout(kind) for kind in charts},
        "penrose": {kind: penrose_figure(kind) for kind in charts},
        "chartOptions": charts,
    }


def build(output_dir: Path) -> None:
    """Build the localized, same-origin static application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    payload = json.dumps(
        _build_application_data(), cls=PlotlyJSONEncoder, separators=(",", ":")
    ).replace("</", "<\\/")
    html = (
        (SOURCE_DIR / "static" / "index.html")
        .read_text(encoding="utf-8")
        .replace("__APPLICATION_CSS__", (SOURCE_DIR / "static" / "style.css").read_text())
        .replace("__PLOTLY_JS__", get_plotlyjs())
        .replace("__APPLICATION_DATA__", payload)
        .replace("__APPLICATION_JS__", (SOURCE_DIR / "static" / "app.js").read_text())
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")
