"""Shared infrastructure for Interactive Physics Atlas."""

from physics_atlas.metadata import (
    CANONICAL_FIELDS,
    SUPPORTED_RUNTIMES,
    MetadataValidationError,
    VisualizationMetadata,
    discover_visualizations,
    load_metadata,
)

__all__ = [
    "CANONICAL_FIELDS",
    "SUPPORTED_RUNTIMES",
    "MetadataValidationError",
    "VisualizationMetadata",
    "discover_visualizations",
    "load_metadata",
]
