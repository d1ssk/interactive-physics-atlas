from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATHEMATICS_DOCS = ROOT / "docs" / "mathematics-for-physics"
JAPANESE_MATHEMATICS_DOCS = ROOT / "docs_ja" / "mathematics-for-physics"
COSMOLOGY_DOCS = ROOT / "docs" / "cosmology"
JAPANESE_COSMOLOGY_DOCS = ROOT / "docs_ja" / "cosmology"
RELATIVITY_DOCS = ROOT / "docs" / "relativity"
JAPANESE_RELATIVITY_DOCS = ROOT / "docs_ja" / "relativity"


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
        (COSMOLOGY_DOCS / "cosmic-causal-structure" / "index.md", 1420, 1180),
        (
            JAPANESE_COSMOLOGY_DOCS / "cosmic-causal-structure" / "index.md",
            1420,
            1180,
        ),
        (RELATIVITY_DOCS / "lorentz-transformation" / "index.md", 1450, 1000),
        (
            JAPANESE_RELATIVITY_DOCS / "lorentz-transformation" / "index.md",
            1450,
            1000,
        ),
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

    english_lie = pages[0].read_text(encoding="utf-8")
    japanese_lie = pages[2].read_text(encoding="utf-8")
    assert "## Mathematical background" in english_lie
    assert "## Mathematics shown here" in english_lie
    assert "## 数学的背景" in japanese_lie
    assert "## ここで見える数学" in japanese_lie
    tensor_product_character = r"\operatorname{ch}(V_\lambda\otimes V_\nu)"
    assert tensor_product_character in english_lie
    assert tensor_product_character in japanese_lie


def test_bilingual_visualization_pages_share_display_math() -> None:
    page_pairs = (
        "lie-roots-weights-products",
        "dynkin-diagram-game",
    )

    for page_name in page_pairs:
        english = (MATHEMATICS_DOCS / page_name / "index.md").read_text(encoding="utf-8")
        japanese = (JAPANESE_MATHEMATICS_DOCS / page_name / "index.md").read_text(encoding="utf-8")
        english = re.sub(r"<!--.*?-->", "", english, flags=re.DOTALL)
        japanese = re.sub(r"<!--.*?-->", "", japanese, flags=re.DOTALL)
        english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
        japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)
        locale_only_labels = {
            r"\text{元の積指標}": r"\text{original product character}",
            r"\text{抽出済みの既約指標}": r"\text{extracted irreducible characters}",
            r"\text{残差指標}": r"\text{residual character}",
        }
        for japanese_label, english_label in locale_only_labels.items():
            japanese_math = [
                expression.replace(japanese_label, english_label) for expression in japanese_math
            ]

        assert english_math == japanese_math


def test_cosmic_causal_structure_pages_are_aligned_and_linked() -> None:
    english_page = COSMOLOGY_DOCS / "cosmic-causal-structure" / "index.md"
    japanese_page = JAPANESE_COSMOLOGY_DOCS / "cosmic-causal-structure" / "index.md"
    english = english_page.read_text(encoding="utf-8")
    japanese = japanese_page.read_text(encoding="utf-8")
    english = re.sub(r"<!--.*?-->", "", english, flags=re.DOTALL)
    japanese = re.sub(r"<!--.*?-->", "", japanese, flags=re.DOTALL)
    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)

    assert english_math == japanese_math
    assert len(english_math) == 15
    assert "## Coordinates and causal structure" in english
    assert "## 座標と因果構造" in japanese
    assert "## Suggested explorations" in english
    assert "## 探索例" in japanese
    assert "## Model parameters" in english
    assert "## モデルの設定" in japanese
    assert "?lang=en" in english
    assert "?lang=ja" in japanese
    assert "data-auto-height" in english
    assert "data-auto-height" in japanese
    assert "Checks performed" not in english
    assert "実施したチェック" not in japanese

    english_index = (COSMOLOGY_DOCS / "index.md").read_text(encoding="utf-8")
    japanese_index = (JAPANESE_COSMOLOGY_DOCS / "index.md").read_text(encoding="utf-8")
    assert ")**<br>\n  Light cones" in english_index
    assert ")**<br>\n  4通りの座標" in japanese_index


def test_lie_algebra_category_orders_roots_before_builder() -> None:
    source = (MATHEMATICS_DOCS / "index.md").read_text(encoding="utf-8")
    japanese = (JAPANESE_MATHEMATICS_DOCS / "index.md").read_text(encoding="utf-8")

    assert "## Visualizations" not in source
    assert "## Lie Algebras and Their Representations" in source
    assert source.index("Lie Roots, Weights, and Tensor Products") < source.index(
        "Dynkin Diagram Builder"
    )
    assert ")**<br>\n  Rank-2 and rank-3" in source
    assert ")**<br>\n  階数2・3" in japanese


def test_legendre_transform_is_linked_from_mathematics_and_thermodynamics() -> None:
    pages = (
        ROOT / "docs" / "mathematics-for-physics" / "index.md",
        ROOT / "docs" / "thermodynamics" / "index.md",
        ROOT / "docs_ja" / "mathematics-for-physics" / "index.md",
        ROOT / "docs_ja" / "thermodynamics" / "index.md",
    )

    for page, locale in zip(pages, ("en", "en", "ja", "ja"), strict=True):
        source = page.read_text(encoding="utf-8")
        assert f"legendre-transform/?lang={locale}" in source
        assert ")**<br>\n  " in source


def test_mass_scale_atlas_is_primary_in_particle_physics_and_cross_linked_from_cosmology() -> None:
    pages = (
        ROOT / "docs" / "particle-physics" / "index.md",
        ROOT / "docs_ja" / "particle-physics" / "index.md",
        ROOT / "docs" / "cosmology" / "index.md",
        ROOT / "docs_ja" / "cosmology" / "index.md",
    )

    for page, locale in zip(pages, ("en", "ja", "en", "ja"), strict=True):
        source = page.read_text(encoding="utf-8")
        assert f"mass-scale-atlas/?lang={locale}" in source
        assert ")**<br>\n  " in source

    assert "../particle-physics/mass-scale-atlas/" in pages[2].read_text(encoding="utf-8")
    assert "../particle-physics/mass-scale-atlas/" in pages[3].read_text(encoding="utf-8")


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
    assert "const FRAME_TARGET_ORIGIN = window.location.origin" in source
    assert "event.origin === FRAME_TARGET_ORIGIN" in source
    assert "postMessage({type: FRAME_HEIGHT_REQUEST}, FRAME_TARGET_ORIGIN)" in source
    assert 'window.location.protocol === "file:"' not in source
    assert 'event.origin === "null"' not in source
    assert 'FRAME_TARGET_ORIGIN = "*"' not in source
    assert "frame.style.height" in source
    assert 'frame.setAttribute("scrolling", "no")' in source
    assert 'frame.style.overflow = "hidden"' in source
    assert 'frame.style.minHeight = "0"' in source
    assert "new frameWindow.ResizeObserver" in source
    assert 'content.querySelector("main")' in source
    assert "Math.max(mainBottom, bodyHeight)" in source
    assert "main.scrollHeight" not in source
    assert "observer.observe(content.body)" in source
    assert "if (main) observer.observe(main)" in source

    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")
    assert "box-sizing: content-box" in stylesheet


def test_repository_documents_http_visualization_preview() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    root_contract = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    visualization_contract = (ROOT / "visualizations" / "AGENTS.md").read_text(encoding="utf-8")

    assert "python -m http.server --bind 127.0.0.1 --directory site 8000" in readme
    assert "http://127.0.0.1:8000/" in readme
    assert "direct `file://` viewing is unsupported" in root_contract
    assert "local browser QA must serve the built site over" in visualization_contract
    assert "copy_visualization_theme_assets(output_dir)" in visualization_contract
    assert "Keep colors with scientific or status meaning local" in visualization_contract
    assert "--atlas-viz-panel-subtle" in visualization_contract
    assert "Do not tint ordinary body text" in visualization_contract
    assert "the other to a local neutral gray" in visualization_contract


def test_docs_mathjax_callbacks_wait_for_startup() -> None:
    source = (ROOT / "docs" / "javascripts" / "mathjax.js").read_text(encoding="utf-8")

    assert "MathJax.startup.promise.then" in source
    assert 'new Event("physics-atlas:mathjax-ready")' in source
    assert "const mathJaxReady = new Promise" in source
    assert "let mathJaxQueue = mathJaxReady" in source
    assert "const task = mathJaxQueue.then" in source
    assert "void withMathJax" in source
    assert "MathJax.typesetPromise([ref])" not in source


def test_mobile_display_math_preserves_svg_content_width() -> None:
    stylesheet = (ROOT / "docs" / "stylesheets" / "extra.css").read_text(encoding="utf-8")

    assert '.md-typeset div.arithmatex > mjx-container[jax="SVG"][display="true"]' in stylesheet
    assert "width: max-content;" in stylesheet
