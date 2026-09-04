import numpy as np
import pytest


@pytest.mark.parametrize(
    "function", ["quadratic", "quartic", "exponential", "linear-section", "corner"]
)
def test_sampled_subgradients_define_supporting_lines(function, physics):
    function = physics.FUNCTIONS[function]
    sampled = physics.sample_transform(function)
    x = sampled["x"]
    for index in np.linspace(0, len(sampled["p"]) - 1, 19, dtype=int):
        line = physics.supporting_line(
            function,
            float(sampled["contact_x"][index]),
            x,
            float(sampled["p"][index]),
        )
        assert np.all(line <= sampled["f"] + 1e-11)


@pytest.mark.parametrize(
    "function", ["quadratic", "quartic", "exponential", "linear-section", "corner"]
)
def test_biconjugate_recovers_original_closed_convex_function(function, physics):
    function = physics.FUNCTIONS[function]
    sampled = physics.sample_transform(function)
    expected = function.value(sampled["double_x"])
    assert np.allclose(sampled["f_double"], expected, atol=1e-12)


@pytest.mark.parametrize("key", ["quadratic", "quartic", "exponential"])
def test_conjugate_derivative_recovers_original_coordinate_for_smooth_functions(key, physics):
    sampled = physics.sample_transform(physics.FUNCTIONS[key], samples=2001)
    numerical_derivative = np.gradient(sampled["f_star"], sampled["p"])
    assert np.allclose(numerical_derivative[5:-5], sampled["contact_x"][5:-5], atol=2e-3)


def test_quadratic_is_self_dual(physics):
    sampled = physics.sample_transform(physics.FUNCTIONS["quadratic"])
    assert np.allclose(sampled["f_star"], 0.5 * sampled["p"] ** 2)


def test_corner_expands_to_an_interval_of_dual_coordinates(physics):
    sampled = physics.sample_transform(physics.FUNCTIONS["corner"])
    at_corner = sampled["contact_x"] == 0.0
    assert np.allclose(sampled["p"][at_corner], np.linspace(-1.0, 1.0, 41))
    assert np.allclose(sampled["f_star"][at_corner], 0.0)


def test_linear_section_maps_many_contact_points_to_one_dual_point(physics):
    sampled = physics.sample_transform(physics.FUNCTIONS["linear-section"])
    in_linear_section = np.abs(sampled["contact_x"]) <= 1.0
    assert np.allclose(sampled["p"][in_linear_section], 0.5)
    assert np.allclose(sampled["f_star"][in_linear_section], 0.0)


def test_supporting_line_rejects_slope_outside_subdifferential(physics):
    with pytest.raises(ValueError, match="subdifferential"):
        physics.supporting_line(physics.FUNCTIONS["corner"], 0.0, np.array([-1.0, 1.0]), slope=1.1)
