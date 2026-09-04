import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_INERTIA,
  angularMomentum,
  angularVelocity,
  axisStability,
  invariantGeometry,
  makeInitialState,
  momentumDerivative,
  momentumSquaredFromOmega,
  norm,
  rk4Step,
  rotateVector,
  rotationalEnergyFromMomentum,
  rotationalEnergyFromOmega,
  sampleMomentumTrajectory,
} from "../static/physics.js";

const close = (actual, expected, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};

const vectorClose = (actual, expected, tolerance = 1e-10) => {
  actual.forEach((value, index) => close(value, expected[index], tolerance));
};

test("momentum and angular velocity conversions are inverse", () => {
  const omega = [0.31, -0.48, 0.77];
  vectorClose(angularVelocity(angularMomentum(omega)), omega);
  close(rotationalEnergyFromOmega(omega), rotationalEnergyFromMomentum(angularMomentum(omega)));
});

test("Euler vector is tangent to both invariant surfaces", () => {
  const omega = [0.31, -0.48, 0.77];
  const momentum = angularMomentum(omega);
  const derivative = momentumDerivative(omega);
  const omegaDerivative = derivative.map((value, index) => value / DEFAULT_INERTIA[index]);
  vectorClose(omegaDerivative, [
    ((DEFAULT_INERTIA[1] - DEFAULT_INERTIA[2]) / DEFAULT_INERTIA[0]) * omega[1] * omega[2],
    ((DEFAULT_INERTIA[2] - DEFAULT_INERTIA[0]) / DEFAULT_INERTIA[1]) * omega[2] * omega[0],
    ((DEFAULT_INERTIA[0] - DEFAULT_INERTIA[1]) / DEFAULT_INERTIA[2]) * omega[0] * omega[1],
  ]);
  close(momentum.reduce((sum, value, index) => sum + value * derivative[index], 0), 0);
  close(omega.reduce((sum, value, index) => sum + value * derivative[index], 0), 0);
});

test("principal-axis stability classifies only the intermediate axis as unstable", () => {
  assert.deepEqual([0, 1, 2].map((axis) => axisStability(axis)), ["stable", "unstable", "stable"]);
});

test("a small finite perturbation flips only the intermediate-axis rotation", () => {
  const maximumDeparture = [];
  for (const axis of [0, 1, 2]) {
    let state = makeInitialState(axis, 3);
    let largestAngle = 0;
    for (let index = 0; index < 20000; index += 1) {
      state = rk4Step(state, DEFAULT_INERTIA, 0.003);
      const momentum = angularMomentum(state.omega);
      const cosine = Math.max(-1, Math.min(1, momentum[axis] / norm(momentum)));
      largestAngle = Math.max(largestAngle, Math.acos(cosine));
    }
    maximumDeparture.push(largestAngle);
  }
  assert.ok(maximumDeparture[0] < 10 * Math.PI / 180);
  assert.ok(maximumDeparture[1] > 170 * Math.PI / 180);
  assert.ok(maximumDeparture[2] < 10 * Math.PI / 180);
});

test("all initial presets lie on the same unit angular-momentum sphere", () => {
  for (const axis of [0, 1, 2]) {
    const state = makeInitialState(axis, 6);
    close(norm(angularMomentum(state.omega)), 1, 2e-15);
  }
});

test("RK4 integration conserves angular-momentum magnitude and rotational energy", () => {
  let state = makeInitialState(1, 5);
  const initialL2 = momentumSquaredFromOmega(state.omega);
  const initialEnergy = rotationalEnergyFromOmega(state.omega);
  for (let index = 0; index < 30000; index += 1) state = rk4Step(state, DEFAULT_INERTIA, 0.002);
  close(momentumSquaredFromOmega(state.omega), initialL2, 2e-11);
  close(rotationalEnergyFromOmega(state.omega), initialEnergy, 2e-11);
  close(norm(state.quaternion), 1, 2e-15);
});

test("space-frame angular momentum remains fixed while the body tumbles", () => {
  let state = makeInitialState(1, 7);
  const initialSpaceMomentum = rotateVector(state.quaternion, angularMomentum(state.omega));
  for (let index = 0; index < 12000; index += 1) state = rk4Step(state, DEFAULT_INERTIA, 0.003);
  const finalSpaceMomentum = rotateVector(state.quaternion, angularMomentum(state.omega));
  vectorClose(finalSpaceMomentum, initialSpaceMomentum, 2e-10);
});

test("sampled Euler trajectory lies on both invariant surfaces", () => {
  const state = makeInitialState(1, 8);
  const geometry = invariantGeometry(state.omega);
  const points = sampleMomentumTrajectory(state, DEFAULT_INERTIA, {duration: 25, dt: 0.01, stride: 37});
  for (const momentum of points) {
    close(norm(momentum), geometry.sphereRadius, 2e-10);
    close(rotationalEnergyFromMomentum(momentum), geometry.energy, 2e-10);
  }
});

test("trajectory sampling rejects non-finite and excessive step counts", () => {
  const state = makeInitialState(1, 8);
  for (const options of [
    {duration: Infinity, dt: 0.01},
    {duration: 1, dt: Infinity},
    {duration: 1, dt: Number.MIN_VALUE},
    {duration: 1, dt: 1e-6},
  ]) {
    assert.throws(
      () => sampleMomentumTrajectory(state, DEFAULT_INERTIA, options),
      RangeError,
    );
  }
});
