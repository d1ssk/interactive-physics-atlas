from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path

import pytest


def _assert_event(actual, expected, tolerance: float = 1e-11) -> None:
    assert actual.x == pytest.approx(expected.x, abs=tolerance)
    assert actual.ct == pytest.approx(expected.ct, abs=tolerance)


def test_known_factors_and_domain_validation(physics) -> None:
    assert physics.gamma(0) == 1
    assert physics.gamma(0.6) == pytest.approx(1.25)
    assert physics.rapidity(math.tanh(0.7)) == pytest.approx(0.7)
    with pytest.raises(ValueError, match=r"\|beta\| < 1"):
        physics.gamma(1)


@pytest.mark.parametrize("beta", [-0.82, -0.35, 0, 0.42, 0.8])
@pytest.mark.parametrize(
    "event",
    [
        pytest.param((1.4, 2.2), id="timelike"),
        pytest.param((-2.3, 0.7), id="spacelike"),
        pytest.param((1.5, 1.5), id="lightlike"),
    ],
)
def test_boost_is_invertible_and_preserves_interval(physics, beta, event) -> None:
    original = physics.Event(*event)
    transformed = physics.boost(original, beta)
    recovered = physics.inverse_boost(transformed, beta)

    _assert_event(recovered, original)
    assert physics.interval(transformed) == pytest.approx(physics.interval(original), abs=1e-11)


def test_coordinate_guides_recover_both_primed_coordinates(physics) -> None:
    event = physics.Event(1.3, 2.4)
    beta = 0.63
    primed = physics.boost(event, beta)
    guides = physics.coordinate_guides(event, beta)
    x_foot = physics.boost(guides["prime"].x_foot, beta)
    ct_foot = physics.boost(guides["prime"].ct_foot, beta)

    assert x_foot.x == pytest.approx(primed.x)
    assert x_foot.ct == pytest.approx(0, abs=1e-12)
    assert ct_foot.x == pytest.approx(0, abs=1e-12)
    assert ct_foot.ct == pytest.approx(primed.ct)


@pytest.mark.parametrize("beta", [-0.8, 0, 0.73])
def test_hyperbolic_constructions_preserve_invariants(physics, beta) -> None:
    for progress in (0, 0.25, 0.6, 1):
        timelike = physics.hyperbolic_timelike_point(1.7, beta, progress)
        spacelike = physics.hyperbolic_spacelike_point(2.1, beta, progress)
        assert physics.interval(timelike) == pytest.approx(1.7**2)
        assert physics.interval(spacelike) == pytest.approx(-(2.1**2))


@pytest.mark.parametrize("beta", [-0.8, 0, 0.73])
def test_time_dilation_and_length_contraction_are_reciprocal(physics, beta) -> None:
    time = physics.time_dilation_construction(beta, 1.7)
    length = physics.length_contraction_construction(beta, 2.1)

    assert time.coordinate_time / 1.7 == pytest.approx(physics.gamma(beta))
    assert 2.1 / length.coordinate_length == pytest.approx(physics.gamma(beta))
    assert time.moving_clock_end.x == pytest.approx(beta * time.moving_clock_end.ct)
    assert length.moving_rest_end.ct == pytest.approx(beta * length.moving_rest_end.x)


def test_browser_domain_matches_python_reference_vectors(physics) -> None:
    node = shutil.which("node")
    if node is None:
        pytest.skip("Node.js is unavailable")
    probe = Path(__file__).with_name("domain-probe-v1.mjs")
    result = subprocess.run([node, str(probe)], check=True, capture_output=True, text=True)
    browser = json.loads(result.stdout)
    beta = 0.57
    event = physics.Event(1.35, 2.15)
    guides = physics.coordinate_guides(event, beta)

    assert browser["gamma"] == pytest.approx(physics.gamma(beta))
    assert browser["rapidity"] == pytest.approx(physics.rapidity(beta))
    assert browser["interval"] == pytest.approx(physics.interval(event))
    for key, expected in (
        ("boost", physics.boost(event, beta)),
        ("inverse", physics.inverse_boost(physics.Event(-0.7, 1.9), beta)),
        ("primeXFoot", guides["prime"].x_foot),
        ("primeCtFoot", guides["prime"].ct_foot),
        ("timelike", physics.hyperbolic_timelike_point(2, beta, 0.43)),
        ("spacelike", physics.hyperbolic_spacelike_point(2, beta, 0.43)),
    ):
        assert browser[key]["x"] == pytest.approx(expected.x)
        assert browser[key]["ct"] == pytest.approx(expected.ct)

    time = physics.time_dilation_construction(beta, 2)
    length = physics.length_contraction_construction(beta, 2)
    assert browser["time"]["coordinateTime"] == pytest.approx(time.coordinate_time)
    assert browser["length"]["coordinateLength"] == pytest.approx(length.coordinate_length)
