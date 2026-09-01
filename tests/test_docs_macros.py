from pathlib import Path

import yaml

from physics_atlas.docs_macros import render_topic_cards, visualization_counts


def test_topic_cards_count_visualizations_from_metadata(tmp_path: Path) -> None:
    directory = tmp_path / "visualizations" / "example"
    directory.mkdir(parents=True)
    metadata = {
        "id": "example",
        "title": "Example",
        "title_ja": "例",
        "field": "mathematics-for-physics",
        "topics": ["examples"],
        "level": ["undergraduate"],
        "runtime": "plotly-static",
        "page": "mathematics-for-physics/example",
        "summary": "An example visualization.",
        "summary_ja": "可視化の例です。",
    }
    (directory / "metadata.yml").write_text(
        yaml.safe_dump(metadata, sort_keys=False), encoding="utf-8"
    )

    counts = visualization_counts(tmp_path)
    cards = render_topic_cards(tmp_path)
    japanese_cards = render_topic_cards(tmp_path, "ja")

    assert counts["mathematics-for-physics"] == 1
    assert 'href="mathematics-for-physics/"' in cards
    assert "background-image: url('assets/images/mathematics-for-physics.png')" in cards
    assert cards.count("background-image:") == 1
    assert "1 visualization" in cards
    assert "0 visualizations" in cards
    assert cards.count('class="topic-card"') == 14
    assert 'class="topic-card__summary"' not in cards
    assert 'class="topic-card__summary"' not in japanese_cards
    assert "An example visualization." not in cards
    assert "物理数学" in japanese_cards
    assert "1 visualization" in japanese_cards
