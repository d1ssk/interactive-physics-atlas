#!/usr/bin/env python3
"""Build all publication-quality visualizations into the documentation tree."""

from __future__ import annotations

import hashlib
import importlib.util
import shutil
import sys
from collections.abc import Callable
from pathlib import Path
from types import ModuleType

from validate_metadata import validate_all

from physics_atlas.assets import (
    VISUALIZATION_THEME_CSS_NAME,
    VISUALIZATION_THEME_SCRIPT_NAME,
)
from physics_atlas.metadata import MetadataValidationError, load_metadata

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"


class VisualizationBuildError(RuntimeError):
    """Raised when a visualization does not satisfy the build contract."""


def _load_build_function(directory: Path) -> tuple[Callable[[Path], None], str]:
    source = directory / "visualization.py"
    if not source.is_file():
        raise VisualizationBuildError(f"{source}: missing visualization.py")

    digest = hashlib.sha256(str(directory.resolve()).encode()).hexdigest()[:12]
    package_name = f"_physics_atlas_visualization_{digest}"
    module_name = f"{package_name}.visualization"

    package = ModuleType(package_name)
    package.__path__ = [str(directory)]  # type: ignore[attr-defined]
    sys.modules[package_name] = package

    spec = importlib.util.spec_from_file_location(module_name, source)
    if spec is None or spec.loader is None:
        _discard_modules(package_name)
        raise VisualizationBuildError(f"{source}: could not create an import specification")

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
    except Exception as exc:
        _discard_modules(package_name)
        raise VisualizationBuildError(f"{source}: import failed: {exc}") from exc

    build = getattr(module, "build", None)
    if not callable(build):
        _discard_modules(package_name)
        raise VisualizationBuildError(f"{source}: must expose callable build(output_dir: Path)")
    return build, package_name


def _discard_modules(package_name: str) -> None:
    for name in tuple(sys.modules):
        if name == package_name or name.startswith(f"{package_name}."):
            del sys.modules[name]


def _validate_theme_contract(directory: Path, output_dir: Path, index: Path) -> None:
    """Require every published application to consume the shared foundational theme."""

    html = index.read_text(encoding="utf-8")
    for asset_name in (VISUALIZATION_THEME_CSS_NAME, VISUALIZATION_THEME_SCRIPT_NAME):
        asset = output_dir / asset_name
        if not asset.is_file():
            raise VisualizationBuildError(
                f"{directory}: build() did not stage required theme asset {asset_name}"
            )
        if asset_name not in html:
            raise VisualizationBuildError(
                f"{directory}: {index.name} does not load required theme asset {asset_name}"
            )


def build_all(directories: list[Path] | None = None, docs_dir: Path = DOCS_DIR) -> list[Path]:
    """Build every visualization and return the generated index files."""

    if directories is None:
        directories = validate_all()

    outputs: list[Path] = []
    for directory in directories:
        metadata = load_metadata(directory)
        output_dir = docs_dir.joinpath(*metadata.page.parts) / "app"
        build, package_name = _load_build_function(directory)
        try:
            if output_dir.exists():
                shutil.rmtree(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            try:
                build(output_dir)
            except Exception as exc:
                raise VisualizationBuildError(f"{directory}: build() failed: {exc}") from exc
        finally:
            _discard_modules(package_name)
        index = output_dir / "index.html"
        if not index.is_file():
            raise VisualizationBuildError(
                f"{directory}: build() did not create required output {index}"
            )
        _validate_theme_contract(directory, output_dir, index)
        outputs.append(index)
        print(f"Built {metadata.id}: {index.relative_to(ROOT)}")
    return outputs


def main() -> int:
    try:
        outputs = build_all()
    except (MetadataValidationError, VisualizationBuildError) as exc:
        print(f"Visualization build failed:\n{exc}")
        return 1
    print(f"Visualization build complete ({len(outputs)} visualization(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
