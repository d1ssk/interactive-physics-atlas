#!/usr/bin/env python3
"""Validate metadata for all publication-quality visualizations."""

from pathlib import Path

from physics_atlas.metadata import MetadataValidationError, discover_visualizations, load_metadata

ROOT = Path(__file__).resolve().parents[1]
VISUALIZATIONS_DIR = ROOT / "visualizations"


def validate_all() -> list[Path]:
    """Validate every discovered visualization and return its directory."""

    directories = discover_visualizations(VISUALIZATIONS_DIR)
    errors: list[str] = []
    for directory in directories:
        try:
            load_metadata(directory)
        except MetadataValidationError as exc:
            errors.append(str(exc))
    if errors:
        raise MetadataValidationError("\n".join(errors))
    return directories


def main() -> int:
    try:
        directories = validate_all()
    except MetadataValidationError as exc:
        print(f"Metadata validation failed:\n{exc}")
        return 1
    print(f"Metadata valid ({len(directories)} visualization(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
