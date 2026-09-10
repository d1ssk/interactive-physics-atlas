import assert from "node:assert/strict";
import test from "node:test";

import {
  DOMAIN_HALF_HEIGHT,
  DOMAIN_WIDTH,
  advectDyeField,
  advectTracerParticles,
  criticalWavenumber,
  createDyeField,
  createTracerParticles,
  densityCoupling,
  farFieldVelocities,
  growthRate,
  growthRateSquared,
  initialInterface,
  mostUnstableWavenumber,
  phaseSpeed,
  stuartVelocity,
} from "../static/physics.mjs";

const defaults = {
  velocityDifference: 1.6,
  densityRatio: 1,
  surfaceTension: 0.15,
  wavelength: 4,
};

test("equal densities maximize symmetric density coupling", () => {
  assert.ok(Math.abs(densityCoupling(defaults) - 0.25) < 1e-14);
  const lightTop = { ...defaults, densityRatio: 0.2 };
  const heavyTop = { ...defaults, densityRatio: 5 };
  assert.ok(Math.abs(densityCoupling(lightTop) - densityCoupling(heavyTop)) < 1e-14);
  assert.ok(densityCoupling(lightTop) < densityCoupling(defaults));
});

test("continuous dye field separates the two initial fluids", () => {
  const dye = createDyeField(defaults, 80, 40);
  assert.equal(dye.values.length, 3200);
  const bottom = dye.values.slice(0, 80);
  const top = dye.values.slice(-80);
  assert.ok([...bottom].every((value) => value < 0));
  assert.ok([...top].every((value) => value > 0));
});

test("viewport stays fixed while wavelength changes the visible cycle count", () => {
  const shortWave = { ...defaults, wavelength: 2 };
  const longWave = { ...defaults, wavelength: 8 };
  assert.equal(DOMAIN_WIDTH / shortWave.wavelength, 4);
  assert.equal(DOMAIN_WIDTH / longWave.wavelength, 1);
  assert.notEqual(initialInterface(0.5, shortWave), initialInterface(0.5, longWave));

  const shortDye = createDyeField(shortWave, 80, 40);
  const longDye = createDyeField(longWave, 80, 40);
  assert.equal(shortDye.columns, longDye.columns);
  assert.equal(shortDye.rows, longDye.rows);
  assert.equal(DOMAIN_HALF_HEIGHT, 1.68);
});

test("zero velocity leaves the continuous dye field unchanged", () => {
  const parameters = { ...defaults, velocityDifference: 0 };
  const dye = createDyeField(parameters, 80, 40);
  const initial = dye.values.slice();
  advectDyeField(dye, 0, 0.8, parameters);
  let maximumDifference = 0;
  for (let index = 0; index < initial.length; index += 1) {
    maximumDifference = Math.max(maximumDifference, Math.abs(dye.values[index] - initial[index]));
  }
  assert.ok(maximumDifference < 1e-6);
});

test("symmetric advection preserves equal color areas", () => {
  const dye = createDyeField(defaults, 100, 48);
  advectDyeField(dye, 0, 1.2, defaults);
  let topCount = 0;
  for (const value of dye.values) {
    if (value >= 0) topCount += 1;
  }
  assert.ok(Math.abs(topCount / dye.values.length - 0.5) < 0.01);
});

test("surface tension produces the analytic cutoff and peak", () => {
  const parameters = { ...defaults, densityRatio: 0.7, surfaceTension: 0.24 };
  const cutoff = criticalWavenumber(parameters);
  assert.ok(Math.abs(growthRateSquared(cutoff, parameters)) < 1e-12);
  assert.ok(Math.abs(mostUnstableWavenumber(parameters) - (2 * cutoff) / 3) < 1e-14);
  assert.ok(growthRate(0.5 * cutoff, parameters) > 0);
  assert.equal(growthRate(1.5 * cutoff, parameters), 0);
});

test("phase speed is the density-weighted far-field mean", () => {
  const parameters = { ...defaults, velocityDifference: 2, densityRatio: 3 };
  const velocity = farFieldVelocities(parameters);
  const expected = (3 * velocity.top + velocity.bottom) / 4;
  assert.ok(Math.abs(phaseSpeed(parameters) - expected) < 1e-14);
});

test("Stuart field is numerically incompressible and has correct far-field speeds", () => {
  const x = 0.37 * defaults.wavelength;
  const y = 0.11 * defaults.wavelength;
  const h = 1e-5;
  const uPlus = stuartVelocity(x + h, y, 0.8, defaults, 0.55).u;
  const uMinus = stuartVelocity(x - h, y, 0.8, defaults, 0.55).u;
  const vPlus = stuartVelocity(x, y + h, 0.8, defaults, 0.55).v;
  const vMinus = stuartVelocity(x, y - h, 0.8, defaults, 0.55).v;
  const divergence = (uPlus - uMinus + vPlus - vMinus) / (2 * h);
  assert.ok(Math.abs(divergence) < 2e-9);

  const velocity = farFieldVelocities(defaults);
  const top = stuartVelocity(x, 8 * defaults.wavelength, 0, defaults).u;
  const bottom = stuartVelocity(x, -8 * defaults.wavelength, 0, defaults).u;
  assert.ok(Math.abs(top - velocity.top) < 1e-8);
  assert.ok(Math.abs(bottom - velocity.bottom) < 1e-8);
});

test("optional tracer particles remain in the fixed viewport", () => {
  const parameters = { ...defaults, velocityDifference: 0, wavelength: 2 };
  const particles = createTracerParticles(parameters, 20, 10);
  const initialX = particles.x.slice();
  const initialY = particles.y.slice();
  advectTracerParticles(particles, 0, 0.8, parameters);

  assert.equal(particles.x.length, 200);
  assert.ok([...particles.x].every((value) => value >= 0 && value < DOMAIN_WIDTH));
  assert.ok(
    [...particles.y].every(
      (value) => value >= -DOMAIN_HALF_HEIGHT && value <= DOMAIN_HALF_HEIGHT,
    ),
  );
  assert.deepEqual(particles.x, initialX);
  assert.deepEqual(particles.y, initialY);
});
