from pathlib import Path

import new_visualization
import pytest
import yaml


@pytest.fixture
def scaffold_root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> tuple[Path, Path]:
    visualizations = tmp_path / "visualizations"
    docs = tmp_path / "docs"
    visualizations.mkdir()
    docs.mkdir()
    docs_ja = tmp_path / "docs_ja"
    docs_ja.mkdir()
    monkeypatch.setattr(new_visualization, "VISUALIZATIONS_DIR", visualizations)
    monkeypatch.setattr(new_visualization, "DOCS_DIR", docs)
    monkeypatch.setattr(new_visualization, "JAPANESE_DOCS_DIR", docs_ja)
    return visualizations, docs


def test_create_visualization_populates_contract(scaffold_root: tuple[Path, Path]) -> None:
    visualizations, docs = scaffold_root

    visualization_dir, docs_dir = new_visualization.create_visualization(
        "test-visualization", "quantum-mechanics", "Test Visualization"
    )

    metadata = yaml.safe_load((visualization_dir / "metadata.yml").read_text(encoding="utf-8"))
    page = (docs_dir / "index.md").read_text(encoding="utf-8")
    assert visualization_dir == visualizations / "test-visualization"
    assert docs_dir == docs / "quantum-mechanics" / "test-visualization"
    assert metadata["id"] == "test-visualization"
    assert metadata["page"] == "quantum-mechanics/test-visualization"
    assert "TODO" in metadata["summary"]
    assert "## Physical idea" in page
    assert "## Conventions and limitations" in page
    japanese_page = (
        docs.parent / "docs_ja" / "quantum-mechanics" / "test-visualization" / "index.md"
    ).read_text(encoding="utf-8")
    assert "## 規約と制限" in japanese_page
    assert (visualization_dir / "tests" / "test_physics.py").is_file()
    visualization_source = (visualization_dir / "visualization.py").read_text(encoding="utf-8")
    assert "copy_visualization_theme_assets(output_dir)" in visualization_source


def test_create_visualization_refuses_existing_docs_page(
    scaffold_root: tuple[Path, Path],
) -> None:
    visualizations, docs = scaffold_root
    (docs / "relativity" / "existing").mkdir(parents=True)

    with pytest.raises(FileExistsError, match="refusing to overwrite"):
        new_visualization.create_visualization("existing", "relativity", "Existing")

    assert not (visualizations / "existing").exists()


@pytest.mark.parametrize("slug", ["Uppercase", "two words", "under_score"])
def test_create_visualization_rejects_invalid_slug(
    scaffold_root: tuple[Path, Path], slug: str
) -> None:
    with pytest.raises(ValueError, match="invalid slug"):
        new_visualization.create_visualization(slug, "relativity", "Invalid")
