"""Plotly rendering and static builder for 2D conformal transformations."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import plotly.graph_objects as go
from plotly.offline import get_plotlyjs
from plotly.subplots import make_subplots
from plotly.utils import PlotlyJSONEncoder

from physics_atlas.assets import copy_mathjax_assets, copy_visualization_theme_assets

from .physics import (
    MobiusTransformation,
    analytic_wirtinger,
    complex_map,
    conformal_diagnostics,
    differential_circle,
    mobius_iwasawa,
    sphere_spinor,
    spinor_to_sphere,
    witt_flow,
    witt_vector_field,
)

SOURCE_DIR = Path(__file__).resolve().parent

PALETTE = {
    "blue": "#376fa8",
    "gold": "#c78b1b",
    "violet": "#7655a5",
    "green": "#23856d",
    "red": "#c24d43",
    "ink": "#26343f",
    "muted": "#73808b",
    "grid": "#dbe1e6",
    "paper": "rgba(0,0,0,0)",
}

LOCAL_PRESETS = {
    "square": {
        "label": "holomorphic: f(z)=z²",
        "mixing": 0.4,
        "point": 0.72 + 0.38j,
    },
    "conjugate": {
        "label": "antiholomorphic: f(z)=z̄",
        "mixing": 0.4,
        "point": 0.72 + 0.38j,
    },
    "mixed": {
        "label": "nonconformal: f(z)=z+0.4z̄",
        "mixing": 0.4,
        "point": 0.72 + 0.38j,
    },
    "exponential": {
        "label": "holomorphic: f(z)=exp(z)",
        "mixing": 0.4,
        "point": 0.35 + 0.48j,
    },
    "special-conformal": {
        "label": "Möbius/SCT: f(z)=z/(1+0.4z)",
        "mixing": 0.4,
        "point": 0.45 + 0.35j,
    },
}


def _base_layout(title: str, height: int = 570) -> dict[str, object]:
    return {
        "template": None,
        "title": {"text": title, "x": 0.01, "xanchor": "left"},
        "paper_bgcolor": PALETTE["paper"],
        "plot_bgcolor": PALETTE["paper"],
        "font": {"family": "Arial, sans-serif", "color": PALETTE["ink"]},
        "margin": {"l": 55, "r": 25, "b": 65, "t": 65},
        "height": height,
        "dragmode": "pan",
        "showlegend": False,
    }


def _grid_curves(
    limit: float = 1.55, lines: int = 9, samples: int = 320
) -> list[tuple[str, np.ndarray]]:
    values = np.linspace(-limit, limit, lines)
    parameter = np.linspace(-limit, limit, samples)
    curves: list[tuple[str, np.ndarray]] = []
    for value in values:
        curves.append(("vertical", value + 1j * parameter))
        curves.append(("horizontal", parameter + 1j * value))
    return curves


def _break_singular_curve(curve: np.ndarray, limit: float = 5.5) -> np.ndarray:
    curve = np.asarray(curve, dtype=complex).copy()
    valid = np.isfinite(curve.real) & np.isfinite(curve.imag) & (np.abs(curve) < limit)
    jumps = np.zeros_like(valid)
    jumps[1:] = np.abs(np.diff(curve)) > 0.45 * limit
    curve[~valid | jumps] = np.nan + 1j * np.nan
    return curve


def local_map_figure(name: str, *, mixing: complex | None = None) -> go.Figure:
    """Compare an input grid and its image, including exact and linearized circles."""

    preset = LOCAL_PRESETS[name]
    mixing = preset["mixing"] if mixing is None else mixing
    point = preset["point"]

    def function(z):
        return complex_map(name, z, mixing=mixing)

    figure = make_subplots(rows=1, cols=2, subplot_titles=("z-plane", "w=f(z) plane"))
    for family, curve in _grid_curves():
        color = PALETTE["gold"] if family == "vertical" else PALETTE["blue"]
        figure.add_trace(
            go.Scatter(
                x=curve.real,
                y=curve.imag,
                mode="lines",
                line={"color": color, "width": 1.5},
                hoverinfo="skip",
                showlegend=False,
            ),
            row=1,
            col=1,
        )
        image = _break_singular_curve(function(curve))
        figure.add_trace(
            go.Scatter(
                x=image.real,
                y=image.imag,
                mode="lines",
                line={"color": color, "width": 2},
                hoverinfo="skip",
                showlegend=False,
            ),
            row=1,
            col=2,
        )
    angle = np.linspace(0.0, 2.0 * np.pi, 321)
    radius = 0.17
    circle = point + radius * np.exp(1j * angle)
    image_circle = _break_singular_curve(function(circle))
    partial_z, partial_zbar = analytic_wirtinger(name, point, mixing=mixing)
    linearized = differential_circle(function(point), radius, partial_z, partial_zbar)
    figure.add_trace(
        go.Scatter(
            x=circle.real,
            y=circle.imag,
            mode="lines",
            line={"color": PALETTE["violet"], "width": 5},
            hoverinfo="skip",
        ),
        row=1,
        col=1,
    )
    figure.add_trace(
        go.Scatter(
            x=image_circle.real,
            y=image_circle.imag,
            mode="lines",
            line={"color": PALETTE["violet"], "width": 5},
            hoverinfo="skip",
        ),
        row=1,
        col=2,
    )
    figure.add_trace(
        go.Scatter(
            x=linearized.real,
            y=linearized.imag,
            mode="lines",
            line={"color": PALETTE["green"], "width": 3, "dash": "dash"},
            hoverinfo="skip",
        ),
        row=1,
        col=2,
    )
    title = (
        f"nonconformal: f(z)=z+{float(np.real(mixing)):.2f}z̄"
        if name == "mixed"
        else str(preset["label"])
    )
    figure.update_layout(**_base_layout(title, height=560))
    figure.update_xaxes(title_text="Re", gridcolor=PALETTE["grid"], zerolinecolor=PALETTE["muted"])
    figure.update_yaxes(title_text="Im", gridcolor=PALETTE["grid"], zerolinecolor=PALETTE["muted"])
    figure.update_yaxes(scaleanchor="x", scaleratio=1, row=1, col=1)
    figure.update_yaxes(scaleanchor="x2", scaleratio=1, row=1, col=2)
    return figure


def _sphere_surface() -> go.Surface:
    theta = np.linspace(0.0, np.pi, 48)
    phi = np.linspace(-np.pi, np.pi, 72)
    tt, pp = np.meshgrid(theta, phi)
    xyz = spinor_to_sphere(sphere_spinor(tt, pp))
    return go.Surface(
        x=xyz[0],
        y=xyz[1],
        z=xyz[2],
        surfacecolor=xyz[2],
        colorscale=[[0, "#eef1f4"], [1, "#dce3e8"]],
        showscale=False,
        opacity=0.6,
        hoverinfo="skip",
        name="Riemann sphere",
    )


def _sphere_curve(spinors: np.ndarray, transformation: MobiusTransformation) -> np.ndarray:
    return spinor_to_sphere(transformation.transform_homogeneous(spinors))


def mobius_sphere_figure(transformation: MobiusTransformation, title: str) -> go.Figure:
    """Show fixed and transformed orthogonal grids on the Riemann sphere."""

    figure = go.Figure([_sphere_surface()])
    theta_arc = np.linspace(0.0, np.pi, 260)
    phi_arc = np.linspace(-np.pi, np.pi, 320)
    original = MobiusTransformation()
    latitude_spinors = [
        sphere_spinor(np.full_like(phi_arc, theta), phi_arc)
        for theta in np.linspace(0.2, np.pi - 0.2, 9)
    ]
    longitude_spinors = [
        sphere_spinor(theta_arc, np.full_like(theta_arc, phi))
        for phi in np.linspace(-np.pi, np.pi, 12, endpoint=False)
    ]
    for spinors in latitude_spinors + longitude_spinors:
        xyz = _sphere_curve(spinors, original)
        figure.add_trace(
            go.Scatter3d(
                x=xyz[0],
                y=xyz[1],
                z=xyz[2],
                mode="lines",
                line={"color": "rgba(95,105,115,.34)", "width": 2},
                hoverinfo="skip",
                showlegend=False,
            )
        )
    for color, spinor_family in (
        (PALETTE["blue"], latitude_spinors),
        (PALETTE["gold"], longitude_spinors),
    ):
        for spinors in spinor_family:
            xyz = _sphere_curve(spinors, transformation)
            figure.add_trace(
                go.Scatter3d(
                    x=xyz[0],
                    y=xyz[1],
                    z=xyz[2],
                    mode="lines",
                    line={"color": color, "width": 5},
                    hoverinfo="skip",
                    showlegend=False,
                )
            )
    if not np.allclose(transformation.matrix, np.eye(2)):
        fixed = spinor_to_sphere(transformation.fixed_point_spinors())
        figure.add_trace(
            go.Scatter3d(
                x=fixed[0],
                y=fixed[1],
                z=fixed[2],
                mode="markers",
                marker={"size": 6, "color": PALETTE["red"]},
                name="fixed points",
                hovertemplate="fixed point<extra></extra>",
            )
        )
    figure.update_layout(
        template=None,
        title={"text": title, "x": 0.01, "xanchor": "left"},
        paper_bgcolor=PALETTE["paper"],
        font={"family": "Arial, sans-serif", "color": PALETTE["ink"]},
        height=650,
        margin={"l": 5, "r": 5, "b": 10, "t": 55},
        scene={
            "xaxis": {"visible": False},
            "yaxis": {"visible": False},
            "zaxis": {"visible": False},
            "aspectmode": "data",
            "dragmode": "turntable",
            "camera": {"eye": {"x": 1.45, "y": 1.45, "z": 1.1}},
        },
        showlegend=False,
        uirevision="mobius-sphere-camera",
    )
    return figure


def _mobius_presets() -> dict[str, tuple[str, MobiusTransformation]]:
    return {
        "identity": ("identity", MobiusTransformation()),
        "translation": (
            "translation z ↦ z + b",
            mobius_iwasawa(translation=0.65 + 0.25j),
        ),
        "dilation": (
            "dilation z ↦ exp(ρ)z",
            mobius_iwasawa(rho=0.9),
        ),
        "rotation": (
            "PSU(2) sphere rotation",
            mobius_iwasawa(alpha=0.8, beta=0.9, gamma=-0.25),
        ),
        "special": (
            "special conformal z ↦ z/(1+cz)",
            MobiusTransformation(1.0, 0.0, 0.55 + 0.15j, 1.0),
        ),
        "loxodromic": (
            "generic loxodromic transformation",
            mobius_iwasawa(alpha=0.55, beta=0.32, gamma=0.18, rho=0.75, translation=0.4 + 0.18j),
        ),
    }


def _add_plane_curve(figure: go.Figure, curve: np.ndarray, color: str, width: float) -> None:
    curve = _break_singular_curve(curve, limit=4.2)
    figure.add_trace(
        go.Scatter(
            x=curve.real,
            y=curve.imag,
            mode="lines",
            line={"color": color, "width": width},
            hoverinfo="skip",
            showlegend=False,
        )
    )


def witt_flow_figure(mode: int, epsilon: float = 0.18) -> go.Figure:
    """Show a finite local Witt flow and its infinitesimal vector field."""

    figure = go.Figure()
    curves = _grid_curves(limit=1.5, lines=9, samples=260)
    for family, curve in curves:
        _add_plane_curve(figure, curve, "rgba(105,115,125,.25)", 1)
        image = witt_flow(curve, mode, epsilon)
        color = PALETTE["gold"] if family == "vertical" else PALETTE["blue"]
        _add_plane_curve(figure, image, color, 2.2)
    field_samples: list[tuple[complex, complex, float]] = []
    for x in np.linspace(-1.25, 1.25, 7):
        for y in np.linspace(-1.25, 1.25, 7):
            point = x + 1j * y
            if mode <= -2 and abs(point) < 0.35:
                continue
            vector = complex(witt_vector_field(mode, point))
            if not np.isfinite(vector) or abs(vector) < 1e-12:
                continue
            field_samples.append((point, vector, abs(vector)))

    maximum_magnitude = max(magnitude for _, _, magnitude in field_samples)
    arrow_x: list[float | None] = []
    arrow_y: list[float | None] = []
    sample_x: list[float] = []
    sample_y: list[float] = []
    magnitudes: list[float] = []
    for point, vector, magnitude in field_samples:
        unit = vector / magnitude
        displayed_length = 0.36 * magnitude / maximum_magnitude
        endpoint = point + displayed_length * unit
        perpendicular = 1j * unit
        head_length = 0.30 * displayed_length
        head_width = 0.18 * displayed_length
        head_left = endpoint - head_length * unit + head_width * perpendicular
        head_right = endpoint - head_length * unit - head_width * perpendicular
        arrow_x.extend(
            [
                point.real,
                endpoint.real,
                None,
                endpoint.real,
                head_left.real,
                None,
                endpoint.real,
                head_right.real,
                None,
            ]
        )
        arrow_y.extend(
            [
                point.imag,
                endpoint.imag,
                None,
                endpoint.imag,
                head_left.imag,
                None,
                endpoint.imag,
                head_right.imag,
                None,
            ]
        )
        sample_x.append(point.real)
        sample_y.append(point.imag)
        magnitudes.append(magnitude)
    figure.add_trace(
        go.Scatter(
            x=arrow_x,
            y=arrow_y,
            mode="lines",
            line={"color": PALETTE["red"], "width": 2},
            hoverinfo="skip",
            showlegend=False,
        )
    )
    figure.add_trace(
        go.Scatter(
            x=sample_x,
            y=sample_y,
            mode="markers",
            marker={
                "size": 5,
                "color": magnitudes,
                "cmin": 0.0,
                "cmax": maximum_magnitude,
                "colorscale": [[0.0, "#f8d7d3"], [1.0, "#9d2923"]],
                "colorbar": {"title": "|V_m(z)|", "thickness": 12, "len": 0.45},
            },
            customdata=magnitudes,
            hovertemplate="z=%{x:.2f}%{y:+.2f}i<br>|V_m(z)|=%{customdata:.4g}<extra></extra>",
            showlegend=False,
        )
    )
    figure.update_layout(
        **_base_layout(
            f"Witt mode m = {mode}; finite flow parameter ε = {epsilon:.3f}",
            height=590,
        )
    )
    figure.update_xaxes(
        title="Re z", range=[-2.35, 2.35], gridcolor=PALETTE["grid"], zerolinecolor="#98a3ad"
    )
    figure.update_yaxes(
        title="Im z",
        range=[-2.35, 2.35],
        gridcolor=PALETTE["grid"],
        zerolinecolor="#98a3ad",
        scaleanchor="x",
        scaleratio=1,
    )
    return figure


def _format_complex(value: complex) -> str:
    sign = "+" if value.imag >= 0 else "-"
    return f"{value.real:.3f} {sign} {abs(value.imag):.3f}i"


def _local_application_item(name: str, mixing: complex) -> dict[str, object]:
    preset = LOCAL_PRESETS[name]
    point = preset["point"]
    partial_z, partial_zbar = analytic_wirtinger(name, point, mixing=mixing)
    diagnostics = conformal_diagnostics(partial_z, partial_zbar)
    return {
        "grid": local_map_figure(name, mixing=mixing),
        "partialZ": _format_complex(complex(partial_z)),
        "partialZbar": _format_complex(complex(partial_zbar)),
        "distortion": (
            "infinite"
            if not np.isfinite(diagnostics["distortion"])
            else f"{diagnostics['distortion']:.3f}"
        ),
        "orientation": diagnostics["orientation"],
    }


def _build_application_data() -> dict[str, object]:
    local_data: dict[str, object] = {}
    for name, preset in LOCAL_PRESETS.items():
        local_data[name] = _local_application_item(name, preset["mixing"])
    mixing_values = tuple(np.linspace(0.0, 0.8, 9))
    mixing_keys = tuple(f"{value:.2f}" for value in mixing_values)
    local_variants = {
        key: _local_application_item("mixed", value)
        for key, value in zip(mixing_keys, mixing_values, strict=True)
    }
    mobius_data = {}
    for key, (label, transformation) in _mobius_presets().items():
        mobius_data[key] = {
            "figure": mobius_sphere_figure(transformation, label),
            "matrix": [
                [_format_complex(complex(value)) for value in row]
                for row in transformation.normalized_matrix()
            ],
        }
    epsilon_values = tuple(np.linspace(-0.3, 0.3, 7))
    epsilon_keys = tuple(f"{value:+.3f}" for value in epsilon_values)
    return {
        "local": local_data,
        "localVariants": local_variants,
        "mixingKeys": mixing_keys,
        "mixingValues": mixing_values,
        "mobius": mobius_data,
        "witt": {
            str(mode): {
                key: witt_flow_figure(mode, epsilon=value)
                for key, value in zip(epsilon_keys, epsilon_values, strict=True)
            }
            for mode in range(-2, 3)
        },
        "epsilonKeys": epsilon_keys,
        "epsilonValues": epsilon_values,
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
