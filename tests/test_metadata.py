from pathlib import Path

import pytest
import yaml

from physics_atlas.metadata import (
    MetadataValidationError,
    discover_visualizations,
    load_metadata,
)


def valid_metadata(identifier: str = "test-visualization") -> dict[str, object]:
    return {
        "id": identifier,
        "title": "Test Visualization",
        "field": "quantum-mechanics",
        "topics": ["states"],
        "level": ["advanced undergraduate"],
        "runtime": "plotly-static",
        "page": f"quantum-mechanics/{identifier}",
        "summary": "A focused test visualization.",
    }


def write_metadata(
    tmp_path: Path, data: dict[str, object], dirname: str = "test-visualization"
) -> Path:
    directory = tmp_path / dirname
    directory.mkdir()
    (directory / "metadata.yml").write_text(yaml.safe_dump(data), encoding="utf-8")
    return directory


def test_valid_metadata_passes(tmp_path: Path) -> None:
    metadata = load_metadata(write_metadata(tmp_path, valid_metadata()))

    assert metadata.id == "test-visualization"
    assert metadata.topics == ("states",)


def test_missing_required_keys_fail(tmp_path: Path) -> None:
    data = valid_metadata()
    del data["summary"]

    with pytest.raises(MetadataValidationError, match="missing required keys: summary"):
        load_metadata(write_metadata(tmp_path, data))


def test_invalid_field_fails(tmp_path: Path) -> None:
    data = valid_metadata()
    data["field"] = "alchemy"

    with pytest.raises(MetadataValidationError, match="field 'alchemy' is unsupported"):
        load_metadata(write_metadata(tmp_path, data))


def test_id_must_match_directory(tmp_path: Path) -> None:
    with pytest.raises(MetadataValidationError, match="must match directory name"):
        load_metadata(write_metadata(tmp_path, valid_metadata("different-id")))


@pytest.mark.parametrize("identifier", ["Uppercase", "two words", "under_score", "-leading"])
def test_id_must_be_slug(tmp_path: Path, identifier: str) -> None:
    with pytest.raises(MetadataValidationError, match="URL-safe lowercase slug"):
        load_metadata(write_metadata(tmp_path, valid_metadata(identifier)))


def test_discovery_excludes_template_and_private_directories(tmp_path: Path) -> None:
    (tmp_path / "_template").mkdir()
    (tmp_path / "_draft").mkdir()
    published = tmp_path / "published"
    published.mkdir()
    (tmp_path / "not-a-directory").write_text("ignored", encoding="utf-8")

    assert discover_visualizations(tmp_path) == [published]


@pytest.mark.parametrize("page", ["/absolute/path", "field/../escaped", "../escaped", "."])
def test_page_must_stay_under_docs(tmp_path: Path, page: str) -> None:
    data = valid_metadata()
    data["page"] = page

    with pytest.raises(MetadataValidationError, match="relative path under docs"):
        load_metadata(write_metadata(tmp_path, data))
