from __future__ import annotations

import numpy as np
import pytest


@pytest.mark.parametrize(
    "name,mixing",
    [
        ("identity", 0.4),
        ("square", 0.4),
        ("conjugate", 0.4),
        ("mixed", 0.3 - 0.2j),
        ("exponential", 0.4),
        ("special-conformal", 0.25),
    ],
)
def test_analytic_and_numerical_wirtinger_derivatives_agree(physics, name, mixing):
    point = 0.7 + 0.35j

    def function(z):
        return physics.complex_map(name, z, mixing=mixing)

    expected = physics.analytic_wirtinger(name, point, mixing=mixing)
    actual = physics.numerical_wirtinger(function, point)

    assert np.allclose(actual, expected, rtol=1e-7, atol=1e-8)


def test_wirtinger_jacobian_and_distortion(physics):
    jacobian = physics.jacobian_from_wirtinger(1.0, 0.4)
    diagnostics = physics.conformal_diagnostics(1.0, 0.4)

    assert np.allclose(jacobian, [[1.4, 0.0], [0.0, 0.6]])
    assert np.isclose(np.linalg.det(jacobian), diagnostics["determinant"])
    assert np.isclose(diagnostics["distortion"], 1.4 / 0.6)
    assert diagnostics["orientation"] == "preserving"

    anti = physics.conformal_diagnostics(0.0, 1.0)
    assert anti["orientation"] == "reversing"
    assert anti["distortion"] == 1.0


def test_differential_circle_has_predicted_singular_radii(physics):
    curve = physics.differential_circle(0.0, 1.0, 1.0, 0.35, samples=1001)
    covariance = np.cov(np.vstack([curve.real, curve.imag]))
    eigenvalues = np.linalg.eigvalsh(covariance)
    measured_ratio = np.sqrt(eigenvalues[-1] / eigenvalues[0])
    expected = physics.conformal_diagnostics(1.0, 0.35)["distortion"]
    assert np.isclose(measured_ratio, expected, rtol=3e-3)


def test_mobius_cross_ratio_and_projective_scaling_invariance(physics):
    transformation = physics.MobiusTransformation(1.2 + 0.3j, -0.4j, 0.25, 0.9 - 0.1j)
    scaled = physics.MobiusTransformation(
        -2.5 * transformation.a,
        -2.5 * transformation.b,
        -2.5 * transformation.c,
        -2.5 * transformation.d,
    )
    points = np.asarray([-0.8 + 0.1j, 0.2 - 0.4j, 0.7 + 0.6j, 1.4 - 0.2j])
    images = transformation(points)

    assert np.allclose(transformation(points), scaled(points))
    assert np.allclose(
        physics.cross_ratio(*points), physics.cross_ratio(*images), rtol=1e-11, atol=1e-11
    )
    assert np.isclose(np.linalg.det(transformation.normalized_matrix()), 1.0)


def test_mobius_fixed_points_are_distinct_projective_eigenlines(physics):
    identity = physics.MobiusTransformation(2.0, 0.0, 0.0, 2.0)
    translation = physics.MobiusTransformation(1.0, 0.7 - 0.2j, 0.0, 1.0)
    dilation = physics.MobiusTransformation(2.0, 0.0, 0.0, 0.5)
    near_identity = physics.MobiusTransformation(1.0, 0.0, 0.0, 1.0 + 5e-11)

    assert identity.fixed_point_spinors().shape == (2, 0)
    assert translation.fixed_point_spinors().shape == (2, 1)
    assert dilation.fixed_point_spinors().shape == (2, 2)
    assert near_identity.fixed_point_spinors().shape == (2, 2)

    for transformation in (translation, dilation):
        fixed_points = transformation.fixed_point_spinors()
        images = transformation.transform_homogeneous(fixed_points)
        projective_wedge = fixed_points[0] * images[1] - fixed_points[1] * images[0]
        assert np.allclose(projective_wedge, 0.0, atol=1e-12)


def test_sphere_spinors_lie_on_unit_sphere_and_action_is_well_defined(physics):
    theta = np.linspace(0.0, np.pi, 15)
    phi = np.linspace(-np.pi, np.pi, 15)
    spinors = physics.sphere_spinor(theta, phi)
    transformation = physics.mobius_iwasawa(
        alpha=0.3, beta=-0.6, gamma=0.2, rho=0.5, translation=0.2 + 0.1j
    )
    points = physics.spinor_to_sphere(transformation.transform_homogeneous(spinors))
    assert np.allclose(np.sum(points**2, axis=0), 1.0)
    assert np.isclose(transformation.determinant, 1.0)


@pytest.mark.parametrize(
    "name", ["identity", "translation", "dilation", "rotation", "special", "loxodromic"]
)
def test_mobius_parameter_families_pass_through_identity_and_stay_nonsingular(physics, name):
    points = np.asarray([-0.6 + 0.2j, 0.3 + 0.5j, 1.1 - 0.3j])
    identity = physics.mobius_parameter_family(name, 0.0)
    transformed = physics.mobius_parameter_family(name, 0.73)

    assert np.allclose(identity(points), points)
    assert abs(transformed.determinant) > 1e-12


@pytest.mark.parametrize("mode", [-2, -1, 0, 1, 2])
def test_witt_flow_has_correct_infinitesimal_generator(physics, mode):
    point = 0.7 + 0.4j
    step = 1e-7
    numerical = (physics.witt_flow(point, mode, step) - point) / step
    expected = physics.witt_vector_field(mode, point)
    assert np.allclose(numerical, expected, rtol=2e-6, atol=2e-7)


def test_global_witt_modes_are_mobius_transformations(physics):
    points = np.asarray([-0.6 + 0.2j, 0.3 + 0.5j, 1.1 - 0.3j])
    epsilon = 0.22
    expected = {
        -1: physics.MobiusTransformation(1.0, -epsilon, 0.0, 1.0),
        0: physics.MobiusTransformation(np.exp(-epsilon), 0.0, 0.0, 1.0),
        1: physics.MobiusTransformation(1.0, 0.0, epsilon, 1.0),
    }
    for mode, transformation in expected.items():
        assert np.allclose(physics.witt_flow(points, mode, epsilon), transformation(points))


@pytest.mark.parametrize("mode", [-4, -3, -2, -1, 0, 1, 2, 3, 4])
def test_zero_witt_flow_is_identity_including_at_singular_origin(physics, mode):
    points = np.asarray([0.0, 0.5 + 0.2j, -0.3j])
    assert np.array_equal(physics.witt_flow(points, mode, 0.0), points)


def test_witt_bracket_identity(physics):
    assert physics.witt_bracket_coefficient(2, -1) == (3, 1)
    assert physics.witt_bracket_coefficient(-1, 1) == (-2, 0)
