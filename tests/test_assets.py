from __future__ import annotations

import hashlib
import tomllib
from pathlib import Path

import build_site

from physics_atlas.assets import (
    PLOTLY_GL3D_ASSET_NAME,
    PLOTLY_GL3D_PATH,
    PLOTLY_GL3D_SHA256,
    PLOTLY_LICENSE_ASSET_NAME,
    PYODIDE_NUMPY_VERSION,
    PYODIDE_NUMPY_WHEEL,
    PYODIDE_PYTHON_VERSION,
    PYODIDE_RUNTIME_SHA256,
    PYODIDE_VENDOR_DIR,
    PYODIDE_VERSION,
    VISUALIZATION_THEME_CSS_NAME,
    VISUALIZATION_THEME_SCRIPT_NAME,
    copy_pyodide_runtime_assets,
    copy_shared_plotly_assets,
    copy_visualization_theme_assets,
)

ROOT = Path(__file__).resolve().parents[1]


def test_shared_visualization_theme_stages_only_foundational_palette_tokens(tmp_path):
    copy_visualization_theme_assets(tmp_path)

    stylesheet = (tmp_path / VISUALIZATION_THEME_CSS_NAME).read_text(encoding="utf-8")
    script = (tmp_path / VISUALIZATION_THEME_SCRIPT_NAME).read_text(encoding="utf-8")

    for token in (
        "--atlas-viz-background",
        "--atlas-viz-panel",
        "--atlas-viz-border",
        "--atlas-viz-accent",
        "--atlas-viz-focus",
    ):
        assert token in stylesheet
    for semantic_token in ("--spin", "--success", "--warning", "--error", "--root-color"):
        assert semantic_token not in stylesheet

    assert "window.parent.getComputedStyle" in script
    assert '"--atlas-viz-background": "--atlas-paper"' in script
    assert '"--atlas-viz-accent": "--atlas-accent"' in script
    assert 'window.location.protocol === "file:"' in script
    assert "postMessage" not in script


def test_pinned_plotly_gl3d_asset_has_expected_version_and_digest():
    contents = PLOTLY_GL3D_PATH.read_bytes()

    assert b"plotly.js (gl3d - minified) v3.7.0" in contents[:200]
    assert hashlib.sha256(contents).hexdigest() == PLOTLY_GL3D_SHA256


def test_shared_plotly_assets_are_staged_at_site_root(tmp_path):
    copy_shared_plotly_assets(tmp_path)

    javascript_dir = tmp_path / "javascripts"
    assert (javascript_dir / PLOTLY_GL3D_ASSET_NAME).read_bytes() == PLOTLY_GL3D_PATH.read_bytes()
    assert (
        (javascript_dir / PLOTLY_LICENSE_ASSET_NAME)
        .read_text(encoding="utf-8")
        .startswith("MIT License")
    )


def test_plotly_bundle_is_not_duplicated_in_japanese_site_assets(tmp_path, monkeypatch):
    english_dir = tmp_path / "docs-en"
    japanese_dir = tmp_path / "docs-ja"
    monkeypatch.setattr(build_site, "ENGLISH_BUILD_DOCS_DIR", english_dir)
    monkeypatch.setattr(build_site, "JAPANESE_BUILD_DOCS_DIR", japanese_dir)

    build_site.stage_english_docs()
    lie_runtime = english_dir / build_site.LIE_RUNTIME_RELATIVE_DIR
    lie_runtime.mkdir(parents=True)
    (lie_runtime / "worker.mjs").write_text("worker", encoding="utf-8")
    build_site.stage_japanese_docs()

    assert (english_dir / "javascripts" / PLOTLY_GL3D_ASSET_NAME).is_file()
    assert not (japanese_dir / "javascripts" / PLOTLY_GL3D_ASSET_NAME).exists()
    assert not (japanese_dir / "javascripts" / PLOTLY_LICENSE_ASSET_NAME).exists()
    assert not (japanese_dir / build_site.LIE_RUNTIME_RELATIVE_DIR).exists()


def test_pinned_pyodide_subset_has_expected_versions_and_digests():
    assert PYODIDE_VERSION == "314.0.6"
    assert PYODIDE_PYTHON_VERSION == "3.14.2"
    assert PYODIDE_NUMPY_VERSION == "2.4.6"
    assert PYODIDE_NUMPY_WHEEL in PYODIDE_RUNTIME_SHA256

    for name, expected_digest in PYODIDE_RUNTIME_SHA256.items():
        assert (
            hashlib.sha256((PYODIDE_VENDOR_DIR / name).read_bytes()).hexdigest() == expected_digest
        )
    assert sum((PYODIDE_VENDOR_DIR / name).stat().st_size for name in PYODIDE_RUNTIME_SHA256) < (
        16 * 1024 * 1024
    )

    retained = {path.name for path in PYODIDE_VENDOR_DIR.iterdir() if path.is_file()}
    assert retained == {
        *PYODIDE_RUNTIME_SHA256,
        "LICENSE",
        "NUMPY-LICENSE.txt",
        "README.md",
    }
    assert not any("scipy" in name or "micropip" in name for name in retained)


def test_pyodide_subset_stages_with_local_licenses(tmp_path):
    copy_pyodide_runtime_assets(tmp_path)

    assert (tmp_path / "pyodide.mjs").is_file()
    assert (tmp_path / PYODIDE_NUMPY_WHEEL).is_file()
    assert "Mozilla Public License" in (tmp_path / "LICENSE").read_text(encoding="utf-8")
    assert "Redistribution and use" in (tmp_path / "NUMPY-LICENSE.txt").read_text(encoding="utf-8")


def test_body_fonts_are_self_hosted_woff2_assets_with_local_licenses():
    fonts_dir = ROOT / "docs" / "assets" / "fonts"
    font_paths = (
        fonts_dir / "source-serif-4" / "source-serif-4-roman.woff2",
        fonts_dir / "source-serif-4" / "source-serif-4-italic.woff2",
    )

    assert all(path.read_bytes().startswith(b"wOF2") for path in font_paths)
    license_text = (fonts_dir / "source-serif-4" / "OFL.txt").read_text(encoding="utf-8")
    assert "SIL OPEN FONT LICENSE Version 1.1" in license_text

    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")
    assert "Atlas Source Serif 4" in stylesheet
    assert "Atlas Japanese System" in stylesheet
    assert "Atlas Japanese Display" in stylesheet
    assert "unicode-range:" in stylesheet
    assert 'font-family: "Atlas Japanese System", var(--md-text-font-family);' in stylesheet
    assert 'font-family: "Atlas Japanese Display", "Atlas Source Serif 4", serif;' in stylesheet
    assert 'html[lang="ja"] .atlas-language-switch' in stylesheet
    assert "font-family: var(--md-text-font-family);" in stylesheet
    assert ".md-footer .md-copyright__highlight" in stylesheet
    assert ".md-footer .md-copyright a" in stylesheet
    assert ".md-footer-meta.md-typeset .md-copyright a:not(:focus, :hover)" in stylesheet
    assert "opacity: 1" in stylesheet
    assert "fonts.googleapis.com" not in stylesheet
    assert "fonts.gstatic.com" not in stylesheet


def test_desktop_grid_expands_article_between_the_sidebars():
    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")

    assert "--atlas-desktop-grid-width: 73.1rem;" in stylesheet
    assert "@media screen and (min-width: 76.25em)" in stylesheet
    assert "max-width: var(--atlas-desktop-grid-width);" in stylesheet
    assert "width: min(100% - 2rem, var(--atlas-desktop-grid-width));" in stylesheet


def test_home_topic_grid_keeps_the_original_article_width_and_is_centered():
    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")

    topic_grid = stylesheet.split(".topic-grid {", maxsplit=1)[1].split("}", maxsplit=1)[0]
    assert "width: 100%;" in topic_grid
    assert "max-width: 36.8rem;" in topic_grid
    assert "margin: 1.5rem auto;" in topic_grid


def test_named_site_palettes_default_to_burgundy_and_share_one_switch():
    stylesheets_dir = ROOT / "docs" / "stylesheets"
    palette_entrypoint = (stylesheets_dir / "palette.css").read_text(encoding="utf-8")
    expected_palettes = {
        "burgundy": (
            "#e2d3d0",
            "#713c42",
            "#3f2529",
            "#faf8f4",
            "#fdfcf9",
            "#292525",
            "#ded6cc",
        ),
        "dusty-blue": (
            "#d6dee3",
            "#35576a",
            "#26353c",
            "#fafbf9",
            "#fdfefd",
            "#242522",
            "#ddd8cd",
        ),
        "terracotta": (
            "#e7d8cd",
            "#865345",
            "#412e29",
            "#faf8f4",
            "#fdfcf9",
            "#2b2926",
            "#ddd5ca",
        ),
        "deep-navy": (
            "#193843",
            "#f7f8f6",
            "#fafbf9",
            "#293943",
            "#ccd7de",
            "#fdfefd",
            "#697985",
            "#d9dddf",
        ),
    }

    active_imports = [
        line for line in palette_entrypoint.splitlines() if line.startswith("@import ")
    ]
    assert active_imports == ['@import "palettes/burgundy.css";']
    assert "palettes/deep-navy.css" in palette_entrypoint
    for name, colors in expected_palettes.items():
        palette = (stylesheets_dir / "palettes" / f"{name}.css").read_text(encoding="utf-8")
        assert all(color in palette for color in colors)

    stylesheet = (stylesheets_dir / "extra.css").read_text(encoding="utf-8")
    assert "--atlas-content-heading" in stylesheet
    assert "--atlas-header-text" in stylesheet
    assert "--atlas-header-control" in stylesheet
    assert ".md-typeset :is(h1, h2, h3, h4, h5, h6)" in stylesheet
    assert "color: var(--atlas-content-heading);" in stylesheet

    favicon = (ROOT / "docs" / "assets" / "images" / "favicon.svg").read_text(encoding="utf-8")
    favicon_script = (ROOT / "docs" / "javascripts" / "palette-favicon.js").read_text(
        encoding="utf-8"
    )
    assert 'fill="#713c42"' in favicon
    assert "--atlas-palette-heading" in favicon_script

    for config_name in ("zensical.toml", "zensical.ja.toml"):
        config = tomllib.loads((ROOT / config_name).read_text(encoding="utf-8"))["project"]
        assert config["extra_css"][:2] == ["stylesheets/palette.css", "stylesheets/extra.css"]
        assert "javascripts/palette-favicon.js" in config["extra_javascript"]
