from __future__ import annotations

import os
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest


def test_qwz_periodicity_and_unit_vector(physics) -> None:
    parameters = {"mass": -0.73, "hopping": 1.25, "tr_breaking": 0.8}
    for kx, ky in ((0.2, -1.3), (2.7, 0.91), (-2.2, -2.8)):
        here = physics.qwz_d(kx, ky, **parameters)
        wrapped = physics.qwz_d(kx + 2 * np.pi, ky - 2 * np.pi, **parameters)
        assert here == pytest.approx(wrapped)
        assert np.linalg.norm(physics.qwz_unit_d(kx, ky, **parameters)) == pytest.approx(1.0)


def test_qwz_occupied_band_has_declared_chern_sequence(physics) -> None:
    for mass, expected in zip((-3.0, -1.0, 1.0, 3.0), (0, 1, -1, 0), strict=True):
        assert physics.qwz_chern_number(mass=mass) == expected
        assert physics.numerical_qwz_chern(mass=mass, resolution=36) == pytest.approx(
            expected, abs=1.0e-8
        )


def test_qwz_orientation_and_curvature_change_sign_together(physics) -> None:
    point = (0.41, -1.17)
    for mass in (-1.0, 1.0):
        positive = physics.qwz_chern_number(mass=mass, tr_breaking=0.7)
        negative = physics.qwz_chern_number(mass=mass, tr_breaking=-0.7)
        assert positive == -negative
        curvature_positive = physics.qwz_berry_curvature(*point, mass=mass, tr_breaking=0.7)
        curvature_negative = physics.qwz_berry_curvature(
            point[0], -point[1], mass=mass, tr_breaking=-0.7
        )
        assert curvature_positive == pytest.approx(-curvature_negative)


def test_qwz_gap_closings_include_both_x_and_y_at_zero_mass(physics) -> None:
    closing_points = {
        -2.0: ((0.0, 0.0),),
        0.0: ((np.pi, 0.0), (0.0, np.pi)),
        2.0: ((np.pi, np.pi),),
    }
    for mass, points in closing_points.items():
        assert physics.qwz_chern_number(mass=mass) is None
        assert physics.qwz_band_gap(mass=mass) == 0.0
        for kx, ky in points:
            assert physics.qwz_energy(kx, ky, mass=mass) == pytest.approx(0.0, abs=1.0e-12)


def test_qwz_curvature_formula_matches_projector_integrand(physics) -> None:
    kx, ky = 0.63, -0.47
    parameters = {"mass": -0.8, "hopping": 1.2, "tr_breaking": 0.7}
    step = 1.0e-5
    center = physics.qwz_unit_d(kx, ky, **parameters)
    derivative_x = (
        physics.qwz_unit_d(kx + step, ky, **parameters)
        - physics.qwz_unit_d(kx - step, ky, **parameters)
    ) / (2 * step)
    derivative_y = (
        physics.qwz_unit_d(kx, ky + step, **parameters)
        - physics.qwz_unit_d(kx, ky - step, **parameters)
    ) / (2 * step)
    expected = -0.5 * np.dot(center, np.cross(derivative_x, derivative_y))
    assert physics.qwz_berry_curvature(kx, ky, **parameters) == pytest.approx(expected, rel=2.0e-9)


def test_ssh_winding_gap_and_chiral_pairing(physics) -> None:
    assert physics.ssh_winding_number(t1=0.6, t2=1.0) == 1
    assert physics.ssh_winding_number(t1=1.4, t2=1.0) == 0
    assert physics.ssh_winding_number(t1=1.0, t2=1.0) is None
    assert physics.ssh_band_gap(t1=0.6, t2=1.0) == pytest.approx(0.8)
    assert physics.ssh_energy(np.pi, t1=1.0, t2=1.0) == pytest.approx(0.0, abs=1.0e-12)

    spectrum = physics.ssh_finite_spectrum(14, t1=0.55, t2=1.0)
    assert spectrum.energies == pytest.approx(-spectrum.energies[::-1], abs=2.0e-12)
    assert np.sum(spectrum.density) == pytest.approx(1.0)
    assert spectrum.edge_weight > 0.65
    assert np.max(np.abs(spectrum.central_energies)) < 0.001


def test_ssh_cut_dimer_limit_has_two_exact_end_modes(physics) -> None:
    spectrum = physics.ssh_finite_spectrum(8, t1=0.0, t2=1.0)
    assert spectrum.central_energies == pytest.approx((0.0, 0.0))
    assert spectrum.edge_weight == pytest.approx(1.0)


def test_browser_physics_invariants() -> None:
    node = shutil.which("node")
    if node is None:
        if os.environ.get("CI"):
            pytest.fail("Node.js is required for browser physics tests in CI")
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True)


def test_static_build_and_four_panel_contract(tmp_path, visualization) -> None:
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    app = (tmp_path / "app.mjs").read_text(encoding="utf-8")
    style = (tmp_path / "style.css").read_text(encoding="utf-8")
    for name in (
        "index.html",
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
    for panel in ("map", "transition", "winding", "edge"):
        assert f'id="view-{panel}"' in html
        assert f'html[data-panel="{panel}"]' in style
    assert "const MESSAGES" in app
    assert 'get("lang") === "ja"' in app
    assert "Brillouin torus" in app
    assert "Brillouin torus と Bloch 球" in app
    assert "X and Y" in app
    assert "X と Y" in app
    assert (
        "JavaScript is required for this visualization. / この可視化にはJavaScriptが必要です。"
        in html
    )
    assert "--paper: var(--atlas-viz-background)" in style
    assert "--panel: var(--atlas-viz-panel)" in style
    assert "--border: var(--atlas-viz-border)" in style


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


def test_bilingual_articles_are_aligned_and_distribute_the_panels() -> None:
    root = Path(__file__).resolve().parents[3]
    english = (
        root / "docs/condensed-matter-physics/quantum-hall-band-topology/index.md"
    ).read_text(encoding="utf-8")
    japanese = (
        root / "docs_ja/condensed-matter-physics/quantum-hall-band-topology/index.md"
    ).read_text(encoding="utf-8")

    def display_math(source: str) -> list[str]:
        return re.findall(r"\$\$\s*(.*?)\s*\$\$", source, re.DOTALL)

    assert display_math(english) == display_math(japanese)
    assert len(display_math(english)) >= 14
    for panel in ("map", "transition", "winding", "edge"):
        assert f"panel={panel}&amp;lang=en" in english
        assert f"panel={panel}&amp;lang=ja" in japanese
    for source in (english, japanese):
        assert source.count("<iframe ") == 4
        assert source.count("data-auto-height") == 4
        assert source.count('scrolling="no"') == 4
        assert "Workbench" not in source
    english_index = (root / "docs/condensed-matter-physics/index.md").read_text(encoding="utf-8")
    japanese_index = (root / "docs_ja/condensed-matter-physics/index.md").read_text(
        encoding="utf-8"
    )
    assert "[Chern Bands and Bulk–Edge Topology](quantum-hall-band-topology/)" in english_index
    assert (
        "[Chern バンドとバルク・エッジのトポロジー](quantum-hall-band-topology/)" in japanese_index
    )
