"""Static SVG application builder for the Dynkin-diagram game."""

from __future__ import annotations

import json
from pathlib import Path

from .physics import catalog_payload

SOURCE_DIR = Path(__file__).resolve().parent


def build(output_dir: Path) -> None:
    """Build the standalone browser application at ``output_dir/index.html``."""

    output_dir.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(catalog_payload(), separators=(",", ":")).replace("</", "<\\/")
    html = (
        (SOURCE_DIR / "static" / "index.html")
        .read_text(encoding="utf-8")
        .replace(
            "__APPLICATION_CSS__",
            (SOURCE_DIR / "static" / "style.css").read_text(encoding="utf-8"),
        )
        .replace("__APPLICATION_DATA__", payload)
        .replace(
            "__APPLICATION_JS__",
            (SOURCE_DIR / "static" / "app.js").read_text(encoding="utf-8"),
        )
    )
    (output_dir / "index.html").write_text(html, encoding="utf-8")
