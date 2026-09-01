from pathlib import Path

import build_visualizations
import pytest


def test_theme_contract_accepts_staged_and_loaded_assets(tmp_path: Path) -> None:
    index = tmp_path / "index.html"
    index.write_text(
        '<link rel="stylesheet" href="visualization-theme.css">'
        '<script src="visualization-theme.js"></script>',
        encoding="utf-8",
    )
    (tmp_path / "visualization-theme.css").write_text(":root {}", encoding="utf-8")
    (tmp_path / "visualization-theme.js").write_text("", encoding="utf-8")

    build_visualizations._validate_theme_contract(tmp_path, tmp_path, index)


@pytest.mark.parametrize(
    ("missing", "expected_message"),
    (
        ("visualization-theme.css", "did not stage required theme asset"),
        ("visualization-theme.js", "did not stage required theme asset"),
    ),
)
def test_theme_contract_rejects_missing_asset(
    tmp_path: Path, missing: str, expected_message: str
) -> None:
    index = tmp_path / "index.html"
    index.write_text(
        '<link rel="stylesheet" href="visualization-theme.css">'
        '<script src="visualization-theme.js"></script>',
        encoding="utf-8",
    )
    for asset_name in ("visualization-theme.css", "visualization-theme.js"):
        if asset_name != missing:
            (tmp_path / asset_name).write_text("", encoding="utf-8")

    with pytest.raises(build_visualizations.VisualizationBuildError, match=expected_message):
        build_visualizations._validate_theme_contract(tmp_path, tmp_path, index)


def test_theme_contract_rejects_unloaded_asset(tmp_path: Path) -> None:
    index = tmp_path / "index.html"
    index.write_text('<link rel="stylesheet" href="visualization-theme.css">', encoding="utf-8")
    (tmp_path / "visualization-theme.css").write_text(":root {}", encoding="utf-8")
    (tmp_path / "visualization-theme.js").write_text("", encoding="utf-8")

    with pytest.raises(build_visualizations.VisualizationBuildError, match="does not load"):
        build_visualizations._validate_theme_contract(tmp_path, tmp_path, index)
