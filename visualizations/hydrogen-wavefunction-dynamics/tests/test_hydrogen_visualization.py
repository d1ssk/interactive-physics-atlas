from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path


def test_static_build_stages_localized_application_assets(tmp_path, visualization) -> None:
    visualization.build(tmp_path)

    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")
    domain = (tmp_path / "runtime" / "hydrogen-domain-v1.mjs").read_text(encoding="utf-8")
    assert "__APPLICATION_CSS__" not in html
    assert 'type="module" src="app-v1.mjs"' in html
    assert (tmp_path / "runtime" / "z-up-camera-v1.mjs").is_file()
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert (tmp_path / "visualization-theme.css").is_file()
    assert (tmp_path / "visualization-theme.js").is_file()
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert (tmp_path / "mathjax-tex-svg.js").is_file()
    assert (tmp_path / "mathjax-LICENSE.txt").is_file()
    assert 'src="https://' not in html

    assert 'const LOCALE = new URLSearchParams(window.location.search).get("lang")' in application
    assert 'title: "Hydrogen Wavefunction"' in application
    assert 'title: "水素原子の波動関数"' in application
    assert 'play: "Play"' in application
    assert 'play: "再生"' in application
    assert "pendingMathTargets" in application
    assert "typesetPromise(targets)" in application
    assert 'new Event("physics-atlas:mathjax-ready")' in application
    assert "sampleSuperposition" in domain
    assert 'DOMAIN_VERSION = "physics-atlas.hydrogen-domain.v1"' in domain
    assert "maxPointCount: 12000" in domain
    assert "HARTREE_ENERGY_EV" in domain


def test_application_uses_shared_theme_and_restrained_layout(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")

    assert "--background: var(--atlas-viz-background)" in html
    assert "--panel: var(--atlas-viz-panel)" in html
    assert "--panel-subtle: var(--atlas-viz-panel-subtle)" in html
    assert "--border: var(--atlas-viz-border)" in html
    assert "--accent: var(--atlas-viz-accent)" in html
    assert "width: min(1360px" in html
    assert 'class="eyebrow"' not in html
    assert "box-shadow" not in html
    assert "radial-gradient" not in html
    assert "#faf8f4" not in html
    assert "#713c42" not in html
    assert "overflow-y: auto" not in html
    assert "max-height: 820px" not in html
    assert 'class="visual-column"' in html
    assert 'class="about-display"' in html


def test_application_uses_readable_state_controls_and_ev_diagnostics(
    tmp_path, visualization
) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")

    assert 'step="0.2"' in application
    assert 'step="15"' in application
    assert "grid-template-columns: repeat(6, minmax(0, 1fr))" in html
    assert "position: absolute" in html
    assert 'id="basis-select"' not in html
    assert 'basis: "complex"' in application
    assert 'complexBasis: "複素"' in application
    assert 'eigenstates: "固有状態"' in application
    assert "\\(Y_\\ell^m\\) · \\(L_z\\)" in html
    assert "setComponentRows(presets.complex2p)" in application
    assert "setComponentRows(presets.sp3" not in application
    assert "\\(2p,\\ m=1\\)" in html
    assert "\\mathsf" not in html
    assert 'beatWord: "ビート"' in application
    assert "beatPreset" not in html
    assert 'expectedEnergy: "エネルギー期待値"' in application
    assert "Physics.HARTREE_ENERGY_EV" in application
    assert "Hartree`" not in application


def test_application_implements_z_up_camera_and_same_origin_height_contract(
    tmp_path, visualization
) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    camera = (tmp_path / "runtime" / "z-up-camera-v1.mjs").read_text(encoding="utf-8")

    assert "horizontal: -sineAzimuth * point.x + cosineAzimuth * point.y" in camera
    assert "+ cosineElevation * point.z" in camera
    application = (tmp_path / "app-v1.mjs").read_text(encoding="utf-8")
    assert "state.azimuth -= dx * .008" in application
    assert "state.elevation + dy * .008" in application
    assert 'type: "physics-atlas:frame-height"' in html
    assert "Math.max(contentBottom, document.body.getBoundingClientRect().height)" in html
    assert 'window.frameElement.style.minHeight = "0"' in html
    assert "observer.observe(document.body)" in html
    assert "if (main) observer.observe(main)" in html
    assert "main.scrollHeight" not in html
    assert "const PARENT_TARGET_ORIGIN = window.location.origin" in html
    assert "event.source === window.parent" in html
    assert "event.origin === PARENT_TARGET_ORIGIN" in html
    assert 'window.location.protocol === "file:"' not in html
    assert (
        'postMessage(\n        {type: "physics-atlas:frame-height", height: frameHeight},\n'
        "        PARENT_TARGET_ORIGIN,"
    ) in html


def test_browser_domain_node_suite() -> None:
    node = shutil.which("node")
    if node is None:
        return
    test_file = Path(__file__).with_name("domain-v1.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_bilingual_pages_align_equations_embedding_and_category_links() -> None:
    root = Path(__file__).resolve().parents[3]
    english_path = (
        root / "docs" / "quantum-mechanics" / "hydrogen-wavefunction-dynamics" / "index.md"
    )
    japanese_path = (
        root / "docs_ja" / "quantum-mechanics" / "hydrogen-wavefunction-dynamics" / "index.md"
    )
    english = english_path.read_text(encoding="utf-8")
    japanese = japanese_path.read_text(encoding="utf-8")
    english_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", english, flags=re.DOTALL)
    japanese_math = re.findall(r"\$\$\s*(.*?)\s*\$\$", japanese, flags=re.DOTALL)

    assert english_math == japanese_math
    assert len(english_math) == 9
    for source, locale in ((english, "en"), (japanese, "ja")):
        assert f"app/index.html?lang={locale}" in source
        physical_idea_heading = "## Physical idea" if locale == "en" else "## 物理的背景"
        assert source.index("<iframe") < source.index(physical_idea_heading)
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "height: 2000px" in source
        assert "min-height: 1200px" in source
        assert 'loading="eager"' in source
        assert "Checks performed" not in source
        assert "実施したチェック" not in source

    english_index = (root / "docs" / "quantum-mechanics" / "index.md").read_text(encoding="utf-8")
    japanese_index = (root / "docs_ja" / "quantum-mechanics" / "index.md").read_text(
        encoding="utf-8"
    )
    assert "[Hydrogen Wavefunction](hydrogen-wavefunction-dynamics/)" in english_index
    assert "[水素原子の波動関数](hydrogen-wavefunction-dynamics/)" in japanese_index
    assert ")**<br>\n  Three-dimensional orbitals" in english_index
    assert ")**<br>\n  三次元軌道" in japanese_index
