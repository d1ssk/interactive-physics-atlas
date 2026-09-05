from __future__ import annotations

import math
import os
import re
import shutil
import subprocess
from pathlib import Path

import pytest


def test_bloch_vector_is_unit_length(physics) -> None:
    for theta, phi in ((0.0, 0.0), (math.pi / 2, 0.3), (2.2, -1.4), (math.pi, 0.0)):
        vector = physics.bloch_vector(physics.state_from_angles(theta, phi))
        assert sum(component * component for component in vector) == pytest.approx(1.0)


def test_basis_states_and_global_phase(physics) -> None:
    assert physics.bloch_vector((1, 0)) == pytest.approx((0, 0, 1))
    assert physics.bloch_vector((0, 1)) == pytest.approx((0, 0, -1))
    assert physics.bloch_vector((1j, 0)) == pytest.approx((0, 0, 1))


def test_normalization_handles_large_finite_amplitudes(physics) -> None:
    state = physics.normalize((1e308 + 0j, 1e308 + 0j))
    assert state == pytest.approx((1 / math.sqrt(2), 1 / math.sqrt(2)))


def test_nonfinite_states_and_angles_are_rejected(physics) -> None:
    for state in ((complex(math.nan, 0), 1), (complex(math.inf, 0), 1)):
        with pytest.raises(ValueError, match="finite"):
            physics.normalize(state)
    for theta, phi in ((math.nan, 0), (0, math.inf)):
        with pytest.raises(ValueError, match="finite"):
            physics.state_from_angles(theta, phi)


def test_pauli_gates_rotate_expected_axes(physics) -> None:
    zero = (1, 0)
    plus = physics.normalize((1, 1))
    assert physics.bloch_vector(physics.apply_unitary(physics.PAULI_X, zero)) == pytest.approx(
        (0, 0, -1)
    )
    assert physics.bloch_vector(physics.apply_unitary(physics.PAULI_Z, plus)) == pytest.approx(
        (-1, 0, 0)
    )
    assert physics.bloch_vector(physics.apply_unitary(physics.HADAMARD, zero)) == pytest.approx(
        (1, 0, 0)
    )


def test_destructive_interference_is_not_normalizable(physics) -> None:
    with pytest.raises(ValueError, match="zero vector"):
        physics.coherent_sum((1, 0), (1, 0), math.pi)


def test_browser_physics_invariants() -> None:
    node = shutil.which("node")
    if node is None:
        if os.environ.get("CI"):
            pytest.fail("Node.js is required for browser physics tests in CI")
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_static_build_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.mjs").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")
    for name in (
        "style.css",
        "physics.mjs",
        "app.mjs",
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
    ):
        assert (tmp_path / name).is_file()
    assert 'href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert 'src="app.mjs"' in html
    assert 'from "./physics.mjs"' in app
    assert "const TRANSLATIONS" in app
    assert 'get("lang") === "ja"' in app
    assert "State and Bloch vector" in app
    assert "状態とBloch vector" in app
    assert "renderedGateKetSignature" in app
    assert "gateKetSignature !== renderedGateKetSignature" in app
    assert (
        "JavaScript is required for this visualization. / この可視化にはJavaScriptが必要です。"
        in html
    )
    assert "gradient" not in style
    assert "shadow" not in style
    assert "createRadialGradient" not in app
    assert "ctx.lineTo(shaftEnd.x, shaftEnd.y)" in app
    assert "const positiveLabel" in app
    assert "background: #fff" in style
    assert "--paper: var(--atlas-viz-background)" in style


def test_frame_height_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    for expected in (
        'type: "physics-atlas:frame-height"',
        "const PARENT_TARGET_ORIGIN = window.location.origin",
        "event.source === window.parent",
        "event.origin === PARENT_TARGET_ORIGIN",
        'window.frameElement.style.minHeight = "0"',
        "Math.max(contentBottom, document.body.getBoundingClientRect().height)",
        "observer.observe(document.body)",
        "if (main) observer.observe(main)",
        'window.addEventListener("pagehide", () => observer.disconnect()',
    ):
        assert expected in html


def test_bilingual_articles_are_aligned_and_embedded() -> None:
    root = Path(__file__).resolve().parents[3]
    english = (root / "docs/quantum-mechanics/bloch-sphere/index.md").read_text(encoding="utf-8")
    japanese = (root / "docs_ja/quantum-mechanics/bloch-sphere/index.md").read_text(
        encoding="utf-8"
    )

    def extract_math(source: str) -> list[str]:
        return re.findall(r"\$\$\s*(.*?)\s*\$\$", source, re.DOTALL)

    assert extract_math(english) == extract_math(japanese)
    assert "app/index.html?lang=en" in english
    assert "app/index.html?lang=ja" in japanese
    for source in (english, japanese):
        assert "data-auto-height" in source
        assert 'scrolling="no"' in source
        assert "min-height: 1000px" in source
        assert "Workbench" not in source

    english_index = (root / "docs/quantum-mechanics/index.md").read_text(encoding="utf-8")
    japanese_index = (root / "docs_ja/quantum-mechanics/index.md").read_text(encoding="utf-8")
    assert "[Bloch Sphere](bloch-sphere/)" in english_index
    assert "[Bloch球](bloch-sphere/)" in japanese_index
