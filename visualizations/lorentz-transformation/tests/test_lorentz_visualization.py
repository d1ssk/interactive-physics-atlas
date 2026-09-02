from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path


def test_static_build_stages_localized_application_assets(tmp_path, visualization) -> None:
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")
    domain = (tmp_path / "runtime" / "lorentz-domain-v1.mjs").read_text(encoding="utf-8")
    assert "__APPLICATION_CSS__" not in html
    assert 'type="module" src="app-v1.mjs"' in html
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert (tmp_path / "visualization-theme.css").is_file()
    assert (tmp_path / "visualization-theme.js").is_file()
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "mathjax-LICENSE.txt").is_file()
    assert 'src="https://' not in html
    assert 'const LOCALE = new URLSearchParams(window.location.search).get("lang")' in application
    assert 'title: "Lorentz Transformation"' in application
    assert 'title: "Lorentz変換"' in application
    assert 'timeDilation: "Time dilation"' in application
    assert 'timeDilation: "時間の遅れ"' in application
    assert 'DOMAIN_VERSION = "physics-atlas.lorentz-domain.v1"' in domain


def test_application_separates_physics_from_rendering(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")
    domain = (tmp_path / "runtime" / "lorentz-domain-v1.mjs").read_text(encoding="utf-8")

    assert 'import * as Physics from "./runtime/lorentz-domain-v1.mjs"' in application
    assert "Physics.boost(" in application
    assert "Physics.coordinateGuides(" in application
    assert "Physics.timeDilationConstruction(" in application
    assert "Physics.lengthContractionConstruction(" in application
    assert "function boost(" not in application
    assert "export function boost(" in domain


def test_application_uses_reciprocal_axes_and_smoothed_controls(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")

    assert "const AXIS_EXTENT = 3.5" in application
    assert 'for (const axis of ["x", "ct"])' in application
    assert "button.dataset.frame === frame" in application
    assert "const duration = 760 * distance" in application
    assert "const smoothing = 1 - Math.exp(-deltaTime / 72)" in application
    assert "drawPill(\n    `ct${prime} = ${format(coordinates.ct)}`" in application
    assert "{x: -48, y: 0}" in application
    assert "particle" not in application.lower()


def test_application_uses_shared_theme_and_same_origin_height_contract(
    tmp_path, visualization
) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert "--background: var(--atlas-viz-background)" in html
    assert "--panel: var(--atlas-viz-panel)" in html
    assert "--panel-subtle: var(--atlas-viz-panel-subtle)" in html
    assert "--border: var(--atlas-viz-border)" in html
    assert "--accent: var(--atlas-viz-accent)" in html
    assert 'type: "physics-atlas:frame-height"' in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "Math.max(contentBottom, document.body.getBoundingClientRect().height)" in html
    assert "main.scrollHeight" not in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert 'window.addEventListener("pagehide", () => observer.disconnect()' in html


def test_browser_domain_node_suite() -> None:
    node = shutil.which("node")
    if node is None:
        return
    test_file = Path(__file__).with_name("domain-v1.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_bilingual_articles_put_visualization_before_detailed_explanation() -> None:
    root = Path(__file__).resolve().parents[3]
    english_path = root / "docs" / "relativity" / "lorentz-transformation" / "index.md"
    japanese_path = root / "docs_ja" / "relativity" / "lorentz-transformation" / "index.md"
    english = english_path.read_text(encoding="utf-8")
    japanese = japanese_path.read_text(encoding="utf-8")
    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)

    assert english_math == japanese_math
    assert len(english_math) == 5
    assert english.index("<iframe") < english.index("## What to notice")
    assert japanese.index("<iframe") < japanese.index("## 図から読み取れること")
    for source, locale in ((english, "en"), (japanese, "ja")):
        assert f"app/index.html?lang={locale}" in source
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "height: 1450px" in source
        assert "min-height: 1000px" in source
        assert 'loading="eager"' in source
        assert "Checks performed" not in source
        assert "実施したチェック" not in source

    english_index = (root / "docs" / "relativity" / "index.md").read_text(encoding="utf-8")
    japanese_index = (root / "docs_ja" / "relativity" / "index.md").read_text(encoding="utf-8")
    assert "[Lorentz Transformation](lorentz-transformation/)" in english_index
    assert "[Lorentz変換](lorentz-transformation/)" in japanese_index
    assert ")**<br>\n  One event" in english_index
    assert ")**<br>\n  二つの慣性系" in japanese_index
