"""Static rendering entry point for the visualization."""

from pathlib import Path

from physics_atlas.assets import copy_visualization_theme_assets


def build(output_dir: Path) -> None:
    """Build a standalone application at ``output_dir/index.html``."""

    output_dir.mkdir(parents=True, exist_ok=True)
    copy_visualization_theme_assets(output_dir)
    raise NotImplementedError("TODO: implement a static Plotly visualization")
