from __future__ import annotations

import importlib.util
import shutil
import subprocess
from pathlib import Path

import pytest

VISUALIZATION_DIR = Path(__file__).resolve().parents[1]


def _load_visualization_module():
    spec = importlib.util.spec_from_file_location(
        "mass_scale_visualization", VISUALIZATION_DIR / "visualization.py"
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_build_stages_standalone_application_and_shared_theme(tmp_path: Path) -> None:
    _load_visualization_module().build(tmp_path)

    for name in (
        "index.html",
        "style.css",
        "physics.js",
        "data.js",
        "app.js",
        "visualization-theme.css",
        "visualization-theme.js",
    ):
        assert (tmp_path / name).is_file()

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.js").read_text(encoding="utf-8")
    data = (tmp_path / "data.js").read_text(encoding="utf-8")
    assert 'href="../../"' in html
    assert "../../ja/particle-physics/mass-scale-atlas/" in app
    assert "../../../particle-physics/mass-scale-atlas/" in app
    assert "この試作" not in html + app + data
    assert "prototype" not in html + app + data
    assert "エネルギーの階層を、辿る。" in html
    assert "現在の宇宙膨張から Planck スケールまで</p>" in html
    assert "場の量子論と一般相対論のパッチワークが" in html
    assert "出典と規約" in html
    assert "日常世界の多様さが、ここから立ち上がる。" in data


@pytest.mark.skipif(shutil.which("node") is None, reason="Node.js is not installed")
def test_browser_physics_and_data_contracts() -> None:
    node = shutil.which("node")
    assert node is not None
    for test_file in ("physics.test.cjs", "data.test.cjs"):
        subprocess.run(
            [node, str(Path(__file__).with_name(test_file))],
            check=True,
        )
