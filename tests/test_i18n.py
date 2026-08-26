from __future__ import annotations

import tomllib
from pathlib import Path

from build_site import stage_english_docs, stage_japanese_docs

ROOT = Path(__file__).resolve().parents[1]


def _public_pages(root: Path) -> set[Path]:
    return {path.relative_to(root) for path in root.rglob("index.md")}


def test_japanese_tree_has_a_counterpart_for_every_english_page() -> None:
    english = _public_pages(ROOT / "docs")
    japanese = _public_pages(ROOT / "docs_ja")

    assert japanese == english


def test_configs_define_distinct_canonical_languages_and_mathjax() -> None:
    with (ROOT / "zensical.toml").open("rb") as file:
        english = tomllib.load(file)["project"]
    with (ROOT / "zensical.ja.toml").open("rb") as file:
        japanese = tomllib.load(file)["project"]

    assert english["theme"]["language"] == "en"
    assert japanese["theme"]["language"] == "ja"
    assert english["site_url"].endswith("interactive-physics-atlas/")
    assert japanese["site_url"].endswith("interactive-physics-atlas/ja/")
    assert english["markdown_extensions"]["pymdownx"]["arithmatex"]["generic"] is True
    assert "javascripts/mathjax-tex-svg.js" in english["extra_javascript"]
    assert "javascripts/mathjax-tex-svg.js" in japanese["extra_javascript"]
    assert not any(source.startswith("http") for source in english["extra_javascript"])


def test_header_uses_linked_brand_without_default_logo() -> None:
    header = (ROOT / "overrides" / "partials" / "header.html").read_text(encoding="utf-8")

    assert 'class="atlas-header-title-link"' in header
    assert "nav.homepage.url" in header
    assert "alternate_base_url" in header
    assert 'class="md-header__button md-logo"' not in header
    assert 'include "partials/logo.html"' not in header


def test_japanese_staging_overlays_pages_and_keeps_shared_assets(
    tmp_path: Path, monkeypatch
) -> None:
    english = tmp_path / "docs"
    english_build = tmp_path / "build" / "docs-en"
    japanese = tmp_path / "docs_ja"
    output = tmp_path / "build" / "docs-ja"
    mathjax = tmp_path / "vendor" / "tex-svg.js"
    mathjax_license = tmp_path / "vendor" / "LICENSE"
    (english / "stylesheets").mkdir(parents=True)
    japanese.mkdir()
    (english / "index.md").write_text("English", encoding="utf-8")
    (english / "stylesheets" / "extra.css").write_text("body {}", encoding="utf-8")
    (japanese / "index.md").write_text("日本語", encoding="utf-8")
    mathjax.parent.mkdir()
    mathjax.write_text("window.MathJax = {};", encoding="utf-8")
    mathjax_license.write_text("MathJax license", encoding="utf-8")

    monkeypatch.setattr("build_site.ENGLISH_DOCS_DIR", english)
    monkeypatch.setattr("build_site.ENGLISH_BUILD_DOCS_DIR", english_build)
    monkeypatch.setattr("build_site.JAPANESE_DOCS_DIR", japanese)
    monkeypatch.setattr("build_site.JAPANESE_BUILD_DOCS_DIR", output)
    monkeypatch.setattr("build_site.MATHJAX_SVG_PATH", mathjax)
    monkeypatch.setattr("build_site.MATHJAX_LICENSE_PATH", mathjax_license)

    assert stage_english_docs() == english_build
    assert stage_japanese_docs() == output
    assert (output / "index.md").read_text(encoding="utf-8") == "日本語"
    assert (output / "stylesheets" / "extra.css").is_file()
    assert (output / "javascripts" / "mathjax-tex-svg.js").is_file()
    assert (output / "javascripts" / "mathjax-LICENSE.txt").is_file()
