from pathlib import Path

from physics_atlas.docs_macros import render_topic_cards, visualization_counts


def test_topic_cards_count_field_listings(tmp_path: Path) -> None:
    directory = tmp_path / "docs" / "mathematics-for-physics"
    directory.mkdir(parents=True)
    (directory / "index.md").write_text(
        "# Mathematics for Physics\n\n- **[Example](example/)**<br>\n  Summary.\n",
        encoding="utf-8",
    )

    counts = visualization_counts(tmp_path)
    cards = render_topic_cards(tmp_path)
    japanese_cards = render_topic_cards(tmp_path, "ja")

    assert counts["mathematics-for-physics"] == 1
    assert 'href="mathematics-for-physics/"' in cards
    assert "background-image: url('assets/images/classical-mechanics.png')" in cards
    assert "background-image: url('assets/images/cosmology.png')" in cards
    assert "background-image: url('assets/images/quantum-mechanics.png')" in cards
    assert "background-image: url('assets/images/thermodynamics.png')" in cards
    assert "background-image: url('assets/images/mathematics-for-physics.png')" in cards
    assert "background-image: url('assets/images/statistical-physics.png')" in cards
    assert "background-image: url('assets/images/relativity.png')" in cards
    assert "background-image: url('assets/images/quantum-field-theory.png')" in cards
    assert "background-image: url('assets/images/string-theory.png')" in cards
    assert "background-image: url('assets/images/electromagnetism.png')" in cards
    assert "background-image: url('assets/images/fluid-mechanics.png')" in cards
    assert "background-image: url('assets/images/particle-physics.png')" in cards
    assert "background-image: url('assets/images/condensed-matter-physics.png')" in cards
    assert cards.count("background-image:") == 13
    assert japanese_cards.count("background-image:") == 13
    assert "1 visualization" in cards
    assert "0 visualizations" in cards
    assert cards.count('class="topic-card"') == 14
    assert 'class="topic-card__summary"' not in cards
    assert 'class="topic-card__summary"' not in japanese_cards
    assert "An example visualization." not in cards
    assert "物理数学" in japanese_cards
    assert "1 visualization" in japanese_cards


def test_counts_include_cross_field_and_external_listings(tmp_path: Path) -> None:
    directory = tmp_path / "docs" / "cosmology"
    directory.mkdir(parents=True)
    (directory / "index.md").write_text(
        "# Cosmology\n\n"
        "- **[Local](local/)**<br>\n  A local application.\n"
        "- **[External](https://example.com/app/?lang=en)**<br>\n  An external app.\n"
        "- **[Cross-field](../particle-physics/example/?lang=en)**<br>\n"
        "  Related reading [source](https://example.com/source).\n",
        encoding="utf-8",
    )

    assert visualization_counts(tmp_path)["cosmology"] == 3
    for locale in ("en", "ja"):
        assert "3 visualizations" in render_topic_cards(tmp_path, locale)


def test_published_field_counts_include_all_listings() -> None:
    root = Path(__file__).resolve().parents[1]
    counts = visualization_counts(root)
    assert counts["cosmology"] == 3
    assert counts["thermodynamics"] == 2
    assert counts["string-theory"] == 2
