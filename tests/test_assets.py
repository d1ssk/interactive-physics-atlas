from __future__ import annotations

import hashlib

import build_site

from physics_atlas.assets import (
    PLOTLY_GL3D_ASSET_NAME,
    PLOTLY_GL3D_PATH,
    PLOTLY_GL3D_SHA256,
    PLOTLY_LICENSE_ASSET_NAME,
    copy_shared_plotly_assets,
)


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
    build_site.stage_japanese_docs()

    assert (english_dir / "javascripts" / PLOTLY_GL3D_ASSET_NAME).is_file()
    assert not (japanese_dir / "javascripts" / PLOTLY_GL3D_ASSET_NAME).exists()
    assert not (japanese_dir / "javascripts" / PLOTLY_LICENSE_ASSET_NAME).exists()
