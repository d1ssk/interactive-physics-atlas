import test from "node:test";
import assert from "node:assert/strict";
import * as physics from "../static/runtime/hydrogen-domain-v1.mjs";
import * as camera from "../static/runtime/z-up-camera-v1.mjs";

test("browser domain preserves analytic hydrogen values", () => {
  assert.ok(Math.abs(physics.radialWavefunction(1, 0, 0) - 2) < 1e-14);
  assert.ok(Math.abs(physics.radialWavefunction(2, 0, 2)) < 1e-14);
  assert.equal(physics.energyHartree(2), -1 / 8);
  assert.equal(physics.HARTREE_ENERGY_EV, 27.211386245988);
});

test("importance sampling remains normalized during a quantum beat", () => {
  const components = [
    {n: 1, l: 0, m: 0, basis: "real", amplitude: 1, phase: 0},
    {n: 2, l: 0, m: 0, basis: "real", amplitude: 1, phase: 0},
  ];
  const sampled = physics.sampleSuperposition({components, count: 5000, seed: 8147});
  for (const time of [0, 5, 11]) {
    const average = sampled.points.reduce(
      (sum, point) => sum + physics.importanceWeightAtSample(point, sampled.components, time),
      0,
    ) / sampled.points.length;
    assert.ok(Math.abs(average - 1) < .035, `mean importance weight was ${average}`);
  }
});

test("complex m states reproduce the directional p orbitals used by hybrid presets", () => {
  const realPx = physics.normalizeComponents([
    {n: 2, l: 1, m: 1, basis: "real", amplitude: 1, phase: 0},
  ]);
  const complexPx = physics.normalizeComponents([
    {n: 2, l: 1, m: 1, basis: "complex", amplitude: 1, phase: 0},
    {n: 2, l: 1, m: -1, basis: "complex", amplitude: 1, phase: Math.PI},
  ]);
  const realPy = physics.normalizeComponents([
    {n: 2, l: 1, m: -1, basis: "real", amplitude: 1, phase: 0},
  ]);
  const complexPy = physics.normalizeComponents([
    {n: 2, l: 1, m: 1, basis: "complex", amplitude: 1, phase: -Math.PI / 2},
    {n: 2, l: 1, m: -1, basis: "complex", amplitude: 1, phase: -Math.PI / 2},
  ]);
  for (const [r, theta, phi] of [[.7, .3, .2], [2.1, 1.2, 2.4], [4.6, 2.2, 5.1]]) {
    const pxReal = physics.superpositionWavefunction(realPx, r, theta, phi);
    const pxComplex = physics.superpositionWavefunction(complexPx, r, theta, phi);
    const pyReal = physics.superpositionWavefunction(realPy, r, theta, phi);
    const pyComplex = physics.superpositionWavefunction(complexPy, r, theta, phi);
    assert.ok(Math.hypot(pxReal.re - pxComplex.re, pxReal.im - pxComplex.im) < 1e-14);
    assert.ok(Math.hypot(pyReal.re - pyComplex.re, pyReal.im - pyComplex.im) < 1e-14);
  }
});

test("browser domain enforces renderer resource limits", () => {
  assert.throws(
    () => physics.sampleSuperposition({
      components: [{n: 1, l: 0, m: 0, basis: "real", amplitude: 1, phase: 0}],
      count: physics.LIMITS.maxPointCount + 1,
    }),
    /count must be between/,
  );
  const tooMany = Array.from({length: physics.LIMITS.maxComponents + 1}, () => (
    {n: 1, l: 0, m: 0, basis: "real", amplitude: 1, phase: 0}
  ));
  assert.throws(() => physics.normalizeComponents(tooMany), /at most 6 components/);
  assert.throws(
    () => physics.sampleSuperposition({
      components: [{n: physics.LIMITS.maxN + 1, l: 0, m: 0, basis: "real", amplitude: 1}],
      count: 10,
    }),
    /n must not exceed/,
  );
});

test("world +z remains vertically upward in the supported camera orbit", () => {
  for (const azimuth of [-2.4, -.65, 0, 1.8]) {
    for (const elevation of [-1.3, 0, .32, 1.3]) {
      const projected = camera.coordinates({x: 0, y: 0, z: 1}, azimuth, elevation);
      assert.ok(Math.abs(projected.horizontal) < 1e-15);
      assert.ok(projected.vertical > 0);
    }
  }
});

test("pointer deltas move the camera orbit in the direct-manipulation direction", () => {
  const dragged = camera.dragOrbit(-.65, .32, 25, 10);
  assert.ok(Math.abs(dragged.azimuth - (-.85)) < 1e-15);
  assert.ok(Math.abs(dragged.elevation - .4) < 1e-15);
  assert.equal(camera.dragOrbit(0, 1.29, 0, 10).elevation, 1.3);
  assert.equal(camera.dragOrbit(0, -1.29, 0, -10).elevation, -1.3);
});
