from __future__ import annotations

import math
import os
import shutil
import subprocess
from pathlib import Path

import pytest


def assert_legendre_identities(state) -> None:
    assert math.isclose(state.enthalpy, state.internal_energy + state.pressure * state.volume)
    assert math.isclose(
        state.helmholtz_energy,
        state.internal_energy - state.temperature * state.entropy,
    )
    assert math.isclose(
        state.gibbs_energy,
        state.enthalpy - state.temperature * state.entropy,
    )


def test_ideal_argon_obeys_equation_of_state_and_legendre_identities(physics):
    state = physics.ideal_argon_state(300.0, 100_000.0)

    assert math.isclose(state.pressure * state.volume, physics.R * state.temperature)
    assert math.isclose(state.internal_energy, 1.5 * physics.R * state.temperature)
    assert math.isclose(state.entropy, 154.9742, abs_tol=5e-4)
    assert_legendre_identities(state)


def test_water_triple_point_has_equal_gibbs_energies_and_latent_heats(physics):
    phases = [
        physics.water_phase_state(physics.T_TRIPLE, physics.P_TRIPLE, index) for index in range(3)
    ]

    assert all(math.isclose(phase.gibbs_energy, 0.0, abs_tol=1e-10) for phase in phases)
    assert math.isclose(phases[1].enthalpy - phases[0].enthalpy, 6010.0, abs_tol=1e-9)
    assert math.isclose(phases[2].enthalpy - phases[0].enthalpy, 51010.0, abs_tol=1e-9)
    assert physics.clapeyron_slope(phases[0], phases[1]) < 0.0
    assert physics.clapeyron_slope(phases[1], phases[2]) > 0.0
    for phase in phases:
        assert_legendre_identities(phase)


def test_stable_water_state_is_on_the_lower_gibbs_envelope(physics):
    for temperature, pressure in ((230.0, 100_000.0), (300.0, 100_000.0), (500.0, 100_000.0)):
        phases = [physics.water_phase_state(temperature, pressure, index) for index in range(3)]
        stable = physics.stable_water_state(temperature, pressure)
        assert stable.gibbs_energy == min(phase.gibbs_energy for phase in phases)


def test_static_build_contract(tmp_path, visualization):
    visualization.build(tmp_path)
    html = (tmp_path / "index.html").read_text(encoding="utf-8")
    i18n = (tmp_path / "i18n.mjs").read_text(encoding="utf-8")
    renderer = (tmp_path / "surface_canvas.mjs").read_text(encoding="utf-8")

    for name in (
        "index.html",
        "i18n.mjs",
        "physics.mjs",
        "surface_canvas.mjs",
        "worker.mjs",
        "visualization-theme.css",
        "visualization-theme.js",
        "mathjax-tex-svg.js",
        "mathjax-LICENSE.txt",
    ):
        assert (tmp_path / name).is_file()
    assert 'rel="stylesheet" href="visualization-theme.css"' in html
    assert 'src="visualization-theme.js"' in html
    assert 'defer src="mathjax-tex-svg.js"' in html
    assert "physics-atlas:frame-height" not in html
    assert "相転移の入口へ移動" not in html
    assert "data-preset" not in html
    assert "pick:p=>{if(!locked)direct(p.x,p.y);}" in html
    assert 'this.drawLine(edge.map(project),"#737b7e",2)' in renderer
    assert "focusBoundarySegments(this.geometry,data.focusSurface.limits)" in renderer
    assert "rgba(115,87,175,.13)" not in renderer
    assert 'scalarFill.addColorStop(0,"#b9d9d3")' in renderer
    assert "const before=state" in html
    assert "historyEntry(action,before,state)" in html
    assert "断熱壁。ピストン操作は準静的で、操作後は壁を固定します。" in i18n
    assert "直接的加熱・冷却" in i18n
    assert "熱浴との熱交換" in i18n
    assert "灰色の線" in html
    assert "熱力学では、巨視的な平衡状態を少数の状態変数で記述します。" in html
    assert "In the internal-energy representation" in i18n
    assert "ヘルムホルツ" not in html + i18n
    assert "ギブズ" not in html + i18n
    assert "Helmholtz 自由エネルギー" in i18n
    assert "Gibbs 自由エネルギー" in i18n
    assert "wallLimit=.62" in html
    assert "g.moveTo(left,top-24)" in html
    assert ".system-card,.viewer-card{height:100%!important}" in html
    assert '<nav class="site-nav" aria-label="サイトナビゲーション">' in html
    assert 'font-family:Georgia,"Times New Roman","Yu Mincho",serif' in html
    assert ".viewer-card #plot{height:575px}" in html
    assert ".viewer-card #overviewPlot{height:520px}" in html
    assert 'documentTitle: "Thermodynamic Functions of a One-Component System' in i18n
    assert 'documentTitle: "一成分系の熱力学関数' in i18n
    assert '"v (L/mol) · linear / log",8,15' not in renderer


def test_browser_physics_invariants():
    node = shutil.which("node")
    if node is None:
        if os.environ.get("CI"):
            pytest.fail("Node.js is required for browser physics tests in CI")
        pytest.skip("Node.js is not installed")
    test_file = Path(__file__).with_name("physics.test.mjs")
    subprocess.run([node, "--test", str(test_file)], check=True, timeout=300)
