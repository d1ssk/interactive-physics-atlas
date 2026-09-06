"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
require("../static/physics.js");

const P = globalThis.BlackbodyPhysics;

function relativeError(actual, expected) {
  return Math.abs(actual - expected) / Math.abs(expected);
}

test("the one-AU solar disk has the expected angular size", () => {
  const radius = P.solarAngularRadius();
  assert.ok(Math.abs(radius * 180 / Math.PI - 0.26645) < 0.001);
  assert.ok(Math.abs(P.circularConeSolidAngle(radius) - 6.80e-5) < 0.02e-5);
});

test("integrated photon density obeys temperature-cubed scaling", () => {
  const base = P.photonDensityInSolidAngle(300, 4 * Math.PI);
  const hotter = P.photonDensityInSolidAngle(600, 4 * Math.PI);
  assert.ok(relativeError(hotter / base, 8) < 1e-12);
});

test("band integration approaches the analytic photon density", () => {
  const analytic = P.photonDensityInSolidAngle(300, 4 * Math.PI);
  const numerical = P.photonDensityInFrequencyBand(300, 4 * Math.PI, 1e8, 1e17);
  assert.ok(relativeError(numerical, analytic) < 2e-6);
});

test("integrated energy density obeys temperature-fourth scaling", () => {
  const ratio = P.energyDensityInSolidAngle(550, 4 * Math.PI)
    / P.energyDensityInSolidAngle(275, 4 * Math.PI);
  assert.ok(relativeError(ratio, 16) < 1e-12);
});

test("Bond albedo removes the reflected energy fraction", () => {
  const total = P.energyDensityInSolidAngle(5800, 1);
  const absorbed = P.absorbedEnergyDensityInSolidAngle(5800, 1, 0.30);
  assert.ok(relativeError(absorbed, 0.70 * total) < 1e-12);
  assert.equal(P.absorbedEnergyDensityInSolidAngle(5800, 1, 1), 0);
  assert.throws(() => P.absorbedEnergyDensityInSolidAngle(5800, 1, -0.01), RangeError);
});

test("the photon-number log-spectrum peak is locally maximal", () => {
  const peak = P.frequencyForPhotonLogPeak(275);
  const atPeak = P.photonNumberPerLogFrequencySolidAngle(peak, 275);
  assert.ok(atPeak > P.photonNumberPerLogFrequencySolidAngle(peak * 0.99, 275));
  assert.ok(atPeak > P.photonNumberPerLogFrequencySolidAngle(peak * 1.01, 275));
});
