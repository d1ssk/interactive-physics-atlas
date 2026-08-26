#!/usr/bin/env python3
"""Create a new visualization and its matching documentation page."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

import yaml

from physics_atlas.metadata import CANONICAL_FIELDS, is_valid_slug

ROOT = Path(__file__).resolve().parents[1]
VISUALIZATIONS_DIR = ROOT / "visualizations"
DOCS_DIR = ROOT / "docs"
JAPANESE_DOCS_DIR = ROOT / "docs_ja"
TEMPLATE_DIR = VISUALIZATIONS_DIR / "_template"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("slug", help="URL-safe lowercase visualization identifier")
    parser.add_argument("--field", required=True, choices=CANONICAL_FIELDS)
    parser.add_argument("--title", required=True, help="Human-readable visualization title")
    parser.add_argument("--title-ja", required=True, help="Japanese visualization title")
    return parser.parse_args()


def create_visualization(
    slug: str, field: str, title: str, title_ja: str = "TODO: add Japanese title"
) -> tuple[Path, Path]:
    """Create a visualization scaffold and docs page without overwriting existing work."""

    if not is_valid_slug(slug):
        raise ValueError(f"invalid slug {slug!r}; use lowercase letters, numbers, and hyphens")
    if field not in CANONICAL_FIELDS:
        raise ValueError(f"unknown field {field!r}")
    if not title.strip():
        raise ValueError("title must be non-empty")

    visualization_dir = VISUALIZATIONS_DIR / slug
    docs_dir = DOCS_DIR / field / slug
    japanese_docs_dir = JAPANESE_DOCS_DIR / field / slug
    if visualization_dir.exists():
        raise FileExistsError(f"refusing to overwrite {visualization_dir}")
    if docs_dir.exists():
        raise FileExistsError(f"refusing to overwrite {docs_dir}")
    if japanese_docs_dir.exists():
        raise FileExistsError(f"refusing to overwrite {japanese_docs_dir}")

    shutil.copytree(TEMPLATE_DIR, visualization_dir)
    docs_dir.mkdir(parents=True)
    japanese_docs_dir.mkdir(parents=True)

    metadata = {
        "id": slug,
        "title": title.strip(),
        "title_ja": title_ja.strip(),
        "field": field,
        "topics": ["TODO: add scientific topics"],
        "level": ["TODO: specify audience level"],
        "runtime": "plotly-static",
        "page": f"{field}/{slug}",
        "summary": "TODO: summarize the scientific idea without overstating the visualization.",
        "summary_ja": "TODO: 数学的・物理的内容を正確に要約する。",
    }
    (visualization_dir / "metadata.yml").write_text(
        yaml.safe_dump(metadata, sort_keys=False), encoding="utf-8"
    )
    (docs_dir / "index.md").write_text(_docs_page(title.strip()), encoding="utf-8")
    (japanese_docs_dir / "index.md").write_text(
        _japanese_docs_page(title_ja.strip()), encoding="utf-8"
    )
    return visualization_dir, docs_dir


def _docs_page(title: str) -> str:
    return f"""# {title}

## Physical idea

TODO: Explain the physical idea precisely.

## Relevant equations / construction

TODO: State the equations, definitions, and assumptions.

## Interactive visualization

TODO: Embed or link the generated application at `app/index.html`.

## Things to try

TODO: Suggest informative parameter choices or interactions.

## What to notice

TODO: Identify the behavior the visualization actually demonstrates.

## Conventions and limitations

TODO: Document conventions, approximations, and limitations.

## References

TODO: Add authoritative references.
"""


def _japanese_docs_page(title: str) -> str:
    return f"""# {title}

## 物理的背景

TODO: 物理的内容を正確に説明する。

## 関連する方程式・構成

TODO: 方程式、定義、仮定をLaTeXで記述する。

## インタラクティブ可視化

TODO: `app/index.html?lang=ja` に生成されたアプリケーションを埋め込む。

## 試してみること

TODO: 理解に役立つパラメーターや操作を提案する。

## 注目する点

TODO: 可視化が実際に示している振る舞いを説明する。

## 規約と制限

TODO: 規約、近似、制限を記述する。

## 参考文献

TODO: 信頼できる参考文献を追加する。
"""


def main() -> int:
    args = parse_args()
    try:
        visualization_dir, docs_dir = create_visualization(
            args.slug, args.field, args.title, args.title_ja
        )
    except (ValueError, FileExistsError) as exc:
        print(f"Could not create visualization: {exc}")
        return 1
    print(f"Created {visualization_dir.relative_to(ROOT)}")
    print(f"Created {docs_dir.relative_to(ROOT) / 'index.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
