import tomllib
from pathlib import Path

from physics_atlas.fields import CANONICAL_FIELDS, FIELD_BY_SLUG, FIELDS
from physics_atlas.metadata import is_valid_slug

ROOT = Path(__file__).resolve().parents[1]


def test_field_catalog_is_unique_and_url_safe() -> None:
    slugs = [field.slug for field in FIELDS]

    assert len(slugs) == len(set(slugs))
    assert all(is_valid_slug(slug) for slug in slugs)
    assert tuple(slugs) == CANONICAL_FIELDS
    assert set(slugs) == set(FIELD_BY_SLUG)


def test_field_catalog_uses_agreed_labels() -> None:
    assert FIELD_BY_SLUG["statistical-physics"].label == "Statistical Physics"
    assert FIELD_BY_SLUG["condensed-matter-physics"].label == "Condensed Matter Physics"
    assert FIELD_BY_SLUG["supersymmetry"].label == "Supersymmetry"
    assert FIELD_BY_SLUG["mathematics-for-physics"].label == "Mathematics for Physics"
    assert (
        FIELD_BY_SLUG["mathematics-for-physics"].image
        == "assets/images/mathematics-for-physics.png"
    )


def test_field_catalog_matches_navigation_and_documentation() -> None:
    with (ROOT / "zensical.toml").open("rb") as file:
        navigation = tomllib.load(file)["project"]["nav"]

    expected = [{field.label: f"{field.slug}/index.md"} for field in FIELDS]

    assert navigation[0] == {"Home": "index.md"}
    assert navigation[1:] == expected
    assert all((ROOT / "docs" / field.slug / "index.md").is_file() for field in FIELDS)
    assert all(field.image is None or (ROOT / "docs" / field.image).is_file() for field in FIELDS)
    assert (ROOT / "docs" / "assets" / "images" / "topic-default.svg").is_file()
