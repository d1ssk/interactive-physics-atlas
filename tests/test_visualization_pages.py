from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATHEMATICS_DOCS = ROOT / "docs" / "mathematics-for-physics"


def test_visualization_iframes_opt_in_to_dynamic_height() -> None:
    pages = (
        MATHEMATICS_DOCS / "lie-roots-weights-products" / "index.md",
        MATHEMATICS_DOCS / "dynkin-diagram-game" / "index.md",
    )

    for page in pages:
        source = page.read_text(encoding="utf-8")
        assert "data-auto-height" in source
        assert "min-height:" in source


def test_lie_algebra_category_orders_roots_before_builder() -> None:
    source = (MATHEMATICS_DOCS / "index.md").read_text(encoding="utf-8")

    assert "## Visualizations" not in source
    assert "## Lie Algebras and Their Representations" in source
    assert source.index("Lie Roots, Weights, and Tensor Products") < source.index(
        "Dynkin Diagram Builder"
    )


def test_shared_iframe_resizer_tracks_content_height() -> None:
    source = (ROOT / "docs" / "javascripts" / "iframe-resizer.js").read_text(encoding="utf-8")

    assert 'querySelectorAll("iframe[data-auto-height]")' in source
    assert "event.data?.type !== FRAME_HEIGHT_MESSAGE" in source
    assert "candidate.contentWindow === event.source" in source
    assert "frame.style.height" in source
    assert 'frame.setAttribute("scrolling", "no")' in source
    assert 'frame.style.overflow = "hidden"' in source
    assert "new frameWindow.ResizeObserver" in source
    assert 'content.querySelector("main")' in source
