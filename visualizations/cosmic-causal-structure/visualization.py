"""Static Plotly application builder for cosmic causal structure."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from physics_atlas.assets import (
    PLOTLY_GL3D_ASSET_NAME,
    copy_mathjax_assets,
    copy_visualization_theme_assets,
)

from .physics import (
    CausalSummary,
    CoordinateHistory,
    InflationStage,
    causal_summary,
    cmb_past_light_rays,
    combine_inflation_and_hot_big_bang,
    compute_history,
    hot_big_bang_coordinate_history,
)

SOURCE_DIR = Path(__file__).resolve().parent


def _sample_indices(model: CoordinateHistory, samples: int) -> np.ndarray:
    if np.any(model.inflation_mask):
        inflation = np.flatnonzero(model.inflation_mask)
        post = np.flatnonzero(~model.inflation_mask)
        positions = np.unique(np.linspace(0, len(post) - 1, samples, dtype=int))
        return np.concatenate((inflation, post[positions]))
    positions = np.unique(np.linspace(0, len(model.scale_factor) - 1, samples, dtype=int))
    return positions


def _model_payload(
    model: CoordinateHistory,
    summary: CausalSummary,
    *,
    include_inflation: bool,
) -> dict[str, object]:
    indices = _sample_indices(model, 1400 if include_inflation else 1800)
    a = model.scale_factor[indices]
    eta = model.eta_gpc[indices]
    time = model.cosmic_time_gyr[indices]
    ray_eta, ray_right, ray_left = cmb_past_light_rays(
        eta_start_gpc=model.eta_start_gpc,
        eta_recombination_gpc=summary.eta_recombination_gpc,
        chi_last_scattering_gpc=summary.chi_last_scattering_gpc,
        samples=700 if include_inflation else 500,
    )
    ray_a = np.interp(ray_eta, model.eta_gpc, model.scale_factor)
    ray_time = np.interp(ray_eta, model.eta_gpc, model.cosmic_time_gyr)
    series = (
        (
            "Past light cone received now",
            model.past_light_cone_comoving_gpc[indices],
            "light",
            "solid",
        ),
        (
            (
                "Particle horizon from toy-model start"
                if include_inflation
                else "Particle horizon from hot Big Bang boundary"
            ),
            model.particle_horizon_comoving_gpc[indices],
            "particle",
            "dash",
        ),
        (
            "Event horizon",
            model.event_horizon_comoving_gpc[indices],
            "event",
            "dashdot",
        ),
        (
            "Comoving Hubble radius (not a causal horizon)",
            model.hubble_radius_comoving_gpc[indices],
            "hubble",
            "dot",
        ),
    )
    intersection_time = (
        model.at_eta(model.cosmic_time_gyr, summary.past_cone_intersection_eta_gpc)
        if include_inflation
        else None
    )
    return {
        "hasInflation": include_inflation,
        "main": {
            "a": a.tolist(),
            "eta": eta.tolist(),
            "time": time.tolist(),
            "phase": np.where(model.inflation_mask[indices], "inflation", "hot Big Bang").tolist(),
        },
        "series": [
            {
                "name": name,
                "x": values.tolist(),
                "colorKey": color_key,
                "dash": dash,
            }
            for name, values, color_key, dash in series
        ],
        "rays": {
            "a": ray_a.tolist(),
            "eta": ray_eta.tolist(),
            "time": ray_time.tolist(),
            "right": ray_right.tolist(),
            "left": ray_left.tolist(),
        },
        "events": {
            "etaStart": model.eta_start_gpc,
            "etaReheating": model.eta_reheating_gpc,
            "timeReheating": model.time_reheating_gyr,
            "aRecombination": summary.a_recombination,
            "etaRecombination": summary.eta_recombination_gpc,
            "timeRecombination": model.at_eta(model.cosmic_time_gyr, summary.eta_recombination_gpc),
            "chiLastScattering": summary.chi_last_scattering_gpc,
            "etaIntersection": (
                summary.past_cone_intersection_eta_gpc if include_inflation else None
            ),
            "timeIntersection": intersection_time,
            "presentTime": float(time[-1]),
            "eFolds": 62.0,
        },
    }


def application_payload() -> dict[str, object]:
    """Return the complete, locale-independent figure payload."""

    history = compute_history()
    inflation = InflationStage(history)
    summary = causal_summary(history, inflation)
    return {
        "schema": 1,
        "hotBigBang": _model_payload(
            hot_big_bang_coordinate_history(history),
            summary,
            include_inflation=False,
        ),
        "inflation": _model_payload(
            combine_inflation_and_hot_big_bang(history, inflation),
            summary,
            include_inflation=True,
        ),
    }


def build(output_dir: Path) -> None:
    """Build the standalone bilingual browser application."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_mathjax_assets(output_dir)
    copy_visualization_theme_assets(output_dir)
    payload = json.dumps(application_payload(), separators=(",", ":")).replace("</", "<\\/")
    html = (
        (SOURCE_DIR / "static" / "index.html")
        .read_text(encoding="utf-8")
        .replace("__PLOTLY_ASSET__", PLOTLY_GL3D_ASSET_NAME)
        .replace(
            "__APPLICATION_CSS__",
            (SOURCE_DIR / "static" / "style.css").read_text(encoding="utf-8"),
        )
        .replace("__APPLICATION_DATA__", payload)
        .replace(
            "__APPLICATION_JS__",
            (SOURCE_DIR / "static" / "app.js").read_text(encoding="utf-8"),
        )
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")
