from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATHEMATICS_DOCS = ROOT / "docs" / "mathematics-for-physics"
JAPANESE_MATHEMATICS_DOCS = ROOT / "docs_ja" / "mathematics-for-physics"


def test_visualization_iframes_opt_in_to_dynamic_height() -> None:
    pages = (
        (MATHEMATICS_DOCS / "lie-roots-weights-products" / "index.md", 2300, 1120),
        (MATHEMATICS_DOCS / "dynkin-diagram-game" / "index.md", 2200, 1380),
        (
            JAPANESE_MATHEMATICS_DOCS / "lie-roots-weights-products" / "index.md",
            2300,
            1120,
        ),
        (JAPANESE_MATHEMATICS_DOCS / "dynkin-diagram-game" / "index.md", 2200, 1380),
    )

    for page, initial_height, minimum_height in pages:
        source = page.read_text(encoding="utf-8")
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "overflow: hidden" in source
        assert f"height: {initial_height}px" in source
        assert f"min-height: {minimum_height}px" in source
        assert 'loading="eager"' in source


def test_visualization_pages_use_latex_and_omit_developer_checklists() -> None:
    pages = (
        MATHEMATICS_DOCS / "lie-roots-weights-products" / "index.md",
        MATHEMATICS_DOCS / "dynkin-diagram-game" / "index.md",
        JAPANESE_MATHEMATICS_DOCS / "lie-roots-weights-products" / "index.md",
        JAPANESE_MATHEMATICS_DOCS / "dynkin-diagram-game" / "index.md",
    )

    for page in pages:
        source = page.read_text(encoding="utf-8")
        assert "Checks performed" not in source
        assert "## 実施したチェック" not in source
        assert "A_{ij}" in source
        assert "$$" in source

    assert "?lang=en" in pages[0].read_text(encoding="utf-8")
    assert "?lang=ja" in pages[2].read_text(encoding="utf-8")


def test_lie_algebra_category_orders_roots_before_builder() -> None:
    source = (MATHEMATICS_DOCS / "index.md").read_text(encoding="utf-8")
    japanese = (JAPANESE_MATHEMATICS_DOCS / "index.md").read_text(encoding="utf-8")

    assert "## Visualizations" not in source
    assert "## Lie Algebras and Their Representations" in source
    assert source.index("Lie Roots, Weights, and Tensor Products") < source.index(
        "Dynkin Diagram Builder"
    )
    assert ")**<br>\n  Explore rank-2" in source
    assert ")**<br>\n  階数2・3" in japanese


def test_japanese_copy_and_typography_follow_site_style() -> None:
    japanese_pages = (ROOT / "docs_ja").rglob("index.md")
    combined = "\n".join(page.read_text(encoding="utf-8") for page in japanese_pages)
    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")

    assert "対話的" not in combined
    assert "相対性理論" not in combined
    assert "量子場理論" not in combined
    assert "物理学のための数学" not in combined
    assert "font-size: 0.78rem" in stylesheet
    assert 'html[lang="ja"] .md-typeset' in stylesheet


def test_shared_iframe_resizer_tracks_content_height() -> None:
    source = (ROOT / "docs" / "javascripts" / "visualization-frame-resizer.js").read_text(
        encoding="utf-8"
    )

    assert 'querySelectorAll("iframe[data-auto-height]")' in source
    assert "event.data?.type !== FRAME_HEIGHT_MESSAGE" in source
    assert "candidate.contentWindow === event.source" in source
    assert "frame.style.height" in source
    assert 'frame.setAttribute("scrolling", "no")' in source
    assert 'frame.style.overflow = "hidden"' in source
    assert 'frame.style.minHeight = "0"' in source
    assert "new frameWindow.ResizeObserver" in source
    assert 'content.querySelector("main")' in source
    assert "Math.max(mainBottom, bodyHeight)" not in source
    assert "Math.max(mainBounds.height, main.scrollHeight)" in source
    assert "observer.observe(content.body)" in source
    assert "if (main) observer.observe(main)" in source

    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")
    assert "box-sizing: content-box" in stylesheet
