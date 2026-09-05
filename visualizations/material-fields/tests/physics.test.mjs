import assert from "node:assert/strict";
import test from "node:test";

import {
  conductorFluxes,
  localShapeBoundaryPoints,
  pointInMaterial,
  rasterizeMaterials,
  sampleDisplayedField,
  sampleDisplayedPotential,
  sampleIntensity,
  solveField,
} from "../static/physics.mjs";

const bounds = {xMin: -5, xMax: 5, yMin: -3, yMax: 3};

function object(overrides = {}) {
  return {
    id: 1,
    shape: "circle",
    x: 0,
    y: 0,
    width: 2.4,
    height: 2.4,
    rotation: 0,
    hollow: false,
    wall: 0.25,
    electricKind: "dielectric",
    epsilon: 4,
    mu: 20,
    ...overrides,
  };
}

test("an empty domain reproduces the uniform applied field", () => {
  const solution = solveField({mode: "electric", objects: [], bounds, nx: 101, ny: 61});
  const field = sampleIntensity(solution, 0.1, -0.4);
  assert.ok(Math.abs(field.x - 0.1) < 1e-10);
  assert.ok(Math.abs(field.y) < 1e-10);
  assert.ok(solution.residual < 2e-5);
});

test("subtracting the applied solution leaves no induced field in an empty domain", () => {
  const solution = solveField({
    mode: "magnetic",
    objects: [],
    bounds,
    nx: 101,
    ny: 61,
    leftPotential: 5,
    rightPotential: -5,
  });
  const field = sampleDisplayedField(solution, -1.3, 0.7, true);
  const potential = sampleDisplayedPotential(solution, -1.3, 0.7, true);
  assert.ok(Math.hypot(field.x, field.y) < 1e-10);
  assert.ok(Math.abs(potential) < 1e-10);
});

test("all outer boundaries continue the uniform applied potential", () => {
  const solution = solveField({
    mode: "electric",
    objects: [object()],
    bounds,
    nx: 101,
    ny: 61,
    leftPotential: 5,
    rightPotential: -5,
    maxIterations: 1400,
    tolerance: 8e-6,
  });
  for (let column = 0; column < solution.nx; column += 1) {
    const expected = 5 - 10 * column / (solution.nx - 1);
    assert.ok(Math.abs(solution.potential[column] - expected) < 1e-13);
    const top = (solution.ny - 1) * solution.nx + column;
    assert.ok(Math.abs(solution.potential[top] - expected) < 1e-13);
  }
});

test("applied and induced fields add pointwise to the total field", () => {
  const expandedBounds = {xMin: -9, xMax: 9, yMin: -7, yMax: 7};
  const solution = solveField({
    mode: "electric",
    objects: [object()],
    bounds: expandedBounds,
    nx: 181,
    ny: 141,
    leftPotential: 9,
    rightPotential: -9,
    maxIterations: 1800,
    tolerance: 2.2e-5,
  });
  const appliedX = 1;
  for (const [x, y] of [[-4, 2], [0, 2], [3, -1.5]]) {
    const total = sampleDisplayedField(solution, x, y);
    const induced = sampleDisplayedField(solution, x, y, true);
    assert.ok(Math.abs(total.x - (appliedX + induced.x)) < 1e-12);
    assert.ok(Math.abs(total.y - induced.y) < 1e-12);
  }
});

test("the induced field decays away from a dielectric object", () => {
  const expandedBounds = {xMin: -9, xMax: 9, yMin: -7, yMax: 7};
  const solution = solveField({
    mode: "electric",
    objects: [object()],
    bounds: expandedBounds,
    nx: 181,
    ny: 141,
    leftPotential: 9,
    rightPotential: -9,
    maxIterations: 1800,
    tolerance: 2.2e-5,
  });
  const magnitudeAt = (x, y) => {
    const field = sampleDisplayedField(solution, x, y, true);
    return Math.hypot(field.x, field.y);
  };
  assert.ok(magnitudeAt(5, 0) < 0.2 * magnitudeAt(1.5, 0));
  assert.ok(magnitudeAt(0, 5) < 0.1 * magnitudeAt(0, 1.5));
});

test("a hollow object contains a cavity rather than material", () => {
  const shell = object({hollow: true, wall: 0.25});
  assert.equal(pointInMaterial(0, 0, shell), false);
  assert.equal(pointInMaterial(1.05, 0, shell), true);
  assert.equal(pointInMaterial(1.3, 0, shell), false);
});

test("the rounded triangle uses a closed, rounded material contour", () => {
  const triangle = object({shape: "rounded-triangle", width: 2, height: 2});
  assert.equal(pointInMaterial(0, 0, triangle), true);
  assert.equal(pointInMaterial(0, 0.78, triangle), true);
  assert.equal(pointInMaterial(0, 0.98, triangle), false);
  assert.equal(pointInMaterial(0.94, -0.94, triangle), false);
  const boundary = localShapeBoundaryPoints("rounded-triangle", 72);
  assert.equal(boundary.length, 72);
  assert.ok(boundary.every(point => Number.isFinite(point.u) && Number.isFinite(point.v)));
});

test("magnetic material rasterization retains permeabilities in the thousands", () => {
  const materials = rasterizeMaterials({
    mode: "magnetic",
    objects: [object({mu: 3000})],
    bounds,
    nx: 61,
    ny: 37,
  });
  const center = Math.floor(materials.ny / 2) * materials.nx + Math.floor(materials.nx / 2);
  assert.equal(materials.kappa[center], 3000);
});

test("an isolated conductor is equipotential and carries zero net charge", () => {
  const solution = solveField({
    mode: "electric",
    objects: [object({electricKind: "conductor"})],
    bounds,
    nx: 101,
    ny: 61,
    maxIterations: 1400,
    tolerance: 8e-6,
  });
  const conductorValues = [];
  for (let index = 0; index < solution.potential.length; index += 1) {
    if (solution.conductorMask[index] === 1) conductorValues.push(solution.potential[index]);
  }
  assert.ok(conductorValues.length > 0);
  assert.ok(Math.max(...conductorValues) - Math.min(...conductorValues) < 1e-13);
  assert.ok(Math.abs(conductorFluxes(solution)[1]) < 1e-10);
});

test("a high-permeability hollow shell reduces the field in its cavity", () => {
  const baseline = solveField({mode: "magnetic", objects: [], bounds, nx: 121, ny: 73});
  const shielded = solveField({
    mode: "magnetic",
    objects: [object({hollow: true, wall: 0.23, mu: 3000})],
    bounds,
    nx: 121,
    ny: 73,
    maxIterations: 1700,
    tolerance: 8e-6,
  });
  const baselineB = sampleDisplayedField(baseline, 0, 0);
  const shieldedB = sampleDisplayedField(shielded, 0, 0);
  assert.ok(shielded.residual <= shielded.tolerance);
  assert.ok(Math.hypot(shieldedB.x, shieldedB.y) < 0.45 * Math.hypot(baselineB.x, baselineB.y));
});
