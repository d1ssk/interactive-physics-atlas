"""Loading, discovery, and validation for visualization metadata."""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

import yaml

CANONICAL_FIELDS = (
    "quantum-mechanics",
    "electromagnetism",
    "statistical-mechanics",
    "condensed-matter",
    "quantum-field-theory",
    "relativity",
    "string-theory",
    "mathematical-physics",
)
SUPPORTED_RUNTIMES = ("plotly-static",)
REQUIRED_KEYS = (
    "id",
    "title",
    "field",
    "topics",
    "level",
    "runtime",
    "page",
    "summary",
)

_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class MetadataValidationError(ValueError):
    """Raised when visualization metadata violates the repository contract."""


@dataclass(frozen=True, slots=True)
class VisualizationMetadata:
    """Validated metadata for one visualization."""

    id: str
    title: str
    field: str
    topics: tuple[str, ...]
    level: tuple[str, ...]
    runtime: str
    page: PurePosixPath
    summary: str


def is_valid_slug(value: str) -> bool:
    """Return whether *value* is a URL-safe lowercase slug."""

    return bool(_SLUG_PATTERN.fullmatch(value))


def discover_visualizations(root: Path) -> list[Path]:
    """Return real visualization directories, excluding private/template entries."""

    if not root.exists():
        return []
    return sorted(
        path for path in root.iterdir() if path.is_dir() and not path.name.startswith("_")
    )


def load_metadata(visualization_dir: Path) -> VisualizationMetadata:
    """Load and validate ``metadata.yml`` from *visualization_dir*."""

    metadata_path = visualization_dir / "metadata.yml"
    try:
        raw = yaml.safe_load(metadata_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise _error(metadata_path, "metadata.yml is missing") from exc
    except yaml.YAMLError as exc:
        raise _error(metadata_path, f"invalid YAML: {exc}") from exc

    if not isinstance(raw, Mapping):
        raise _error(metadata_path, "metadata must be a YAML mapping")

    missing = [key for key in REQUIRED_KEYS if key not in raw]
    if missing:
        raise _error(metadata_path, f"missing required keys: {', '.join(missing)}")

    identifier = _non_empty_string(raw, "id", metadata_path)
    if not is_valid_slug(identifier):
        raise _error(metadata_path, f"id {identifier!r} must be a URL-safe lowercase slug")
    if identifier != visualization_dir.name:
        raise _error(
            metadata_path,
            f"id {identifier!r} must match directory name {visualization_dir.name!r}",
        )

    title = _non_empty_string(raw, "title", metadata_path)
    field = _non_empty_string(raw, "field", metadata_path)
    if field not in CANONICAL_FIELDS:
        allowed = ", ".join(CANONICAL_FIELDS)
        raise _error(metadata_path, f"field {field!r} is unsupported; choose one of: {allowed}")

    topics = _string_list(raw, "topics", metadata_path)
    level = _string_list(raw, "level", metadata_path)

    runtime = _non_empty_string(raw, "runtime", metadata_path)
    if runtime not in SUPPORTED_RUNTIMES:
        allowed = ", ".join(SUPPORTED_RUNTIMES)
        raise _error(metadata_path, f"runtime {runtime!r} is unsupported; choose one of: {allowed}")

    page_value = _non_empty_string(raw, "page", metadata_path)
    page = _validate_page(page_value, metadata_path)
    summary = _non_empty_string(raw, "summary", metadata_path)

    return VisualizationMetadata(
        id=identifier,
        title=title,
        field=field,
        topics=topics,
        level=level,
        runtime=runtime,
        page=page,
        summary=summary,
    )


def _non_empty_string(raw: Mapping[str, Any], key: str, path: Path) -> str:
    value = raw[key]
    if not isinstance(value, str) or not value.strip():
        raise _error(path, f"{key} must be a non-empty string")
    return value.strip()


def _string_list(raw: Mapping[str, Any], key: str, path: Path) -> tuple[str, ...]:
    value = raw[key]
    if (
        not isinstance(value, list)
        or not value
        or any(not isinstance(item, str) or not item.strip() for item in value)
    ):
        raise _error(path, f"{key} must be a non-empty list of non-empty strings")
    return tuple(item.strip() for item in value)


def _validate_page(value: str, path: Path) -> PurePosixPath:
    if "\\" in value:
        raise _error(path, "page must use forward slashes")
    page = PurePosixPath(value)
    if page.is_absolute() or not page.parts or any(part in {"", ".", ".."} for part in page.parts):
        raise _error(path, "page must be a relative path under docs/ without traversal")
    return page


def _error(path: Path, message: str) -> MetadataValidationError:
    return MetadataValidationError(f"{path}: {message}")
