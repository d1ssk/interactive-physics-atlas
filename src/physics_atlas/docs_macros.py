"""Build-time macros for atlas documentation pages."""

from __future__ import annotations

from collections import Counter
from html import escape
from pathlib import Path
from typing import Any

from .fields import FIELDS
from .metadata import discover_visualizations, load_metadata


def visualization_counts(project_root: Path) -> Counter[str]:
    """Count published visualizations by canonical field."""

    directories = discover_visualizations(project_root / "visualizations")
    return Counter(load_metadata(directory).field for directory in directories)


def render_topic_cards(project_root: Path, locale: str = "en") -> str:
    """Return the home-page topic card grid as static HTML."""

    if locale not in {"en", "ja"}:
        raise ValueError(f"unsupported locale: {locale}")

    counts = visualization_counts(project_root)
    cards: list[str] = ['<div class="topic-grid">']
    for field in FIELDS:
        count = counts[field.slug]
        noun = "visualization" if count == 1 else "visualizations"
        image_style = (
            f" style=\"background-image: url('{escape(field.image, quote=True)}')\""
            if field.image
            else ""
        )
        cards.extend(
            [
                f'<a class="topic-card" href="{escape(field.slug, quote=True)}/">',
                f'  <span class="topic-card__media"{image_style} aria-hidden="true"></span>',
                '  <span class="topic-card__body">',
                '    <strong class="topic-card__title">'
                f"{escape(field.localized_label(locale))}</strong>",
                f'    <span class="topic-card__count">{count} {noun}</span>',
                "  </span>",
                "</a>",
            ]
        )
    cards.append("</div>")
    return "\n".join(cards)


def define_env(env: Any) -> None:
    """Register project macros with Zensical."""

    project_root = Path(env.conf["root_dir"])
    env.macro(lambda locale="en": render_topic_cards(project_root, locale), "topic_cards")
