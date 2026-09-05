"use strict";

const assert = require("node:assert/strict");
require("../static/physics.js");

const physics = globalThis.MassScalePhysics;
const scale = {minLog: -33, maxLog: 28.1, pxPerDecade: 210, paddingTop: 280};

for (const energy of [1e-33, 2.24e-3, 0.51099895e6, 1.220890e28]) {
  const y = physics.energyToY(energy, scale);
  assert.ok(Math.abs(physics.yToEnergy(y, scale) / energy - 1) < 1e-12);
}

assert.ok(physics.energyToY(1e9, scale) > physics.energyToY(1e6, scale));
assert.throws(() => physics.logEnergy(0), RangeError);
assert.ok(Math.abs(physics.temperatureKelvin(2.34865e-4) - 2.7255) < 0.001);
assert.ok(Math.abs(physics.reducedLengthMeters(1) / physics.quantumTimeSeconds(1) - physics.SPEED_OF_LIGHT_M_PER_S) < 1e-6);
assert.ok(Math.abs(physics.hubbleEnergyEv(67.4) - 1.438e-33) / 1.438e-33 < 0.002);
assert.ok(Math.abs(physics.vacuumEnergyScaleEv(67.4, 0.685) - 2.24e-3) / 2.24e-3 < 0.01);
assert.ok(Math.abs(physics.radiationEraAgeSeconds(1e6) - 0.738) < 0.01);
assert.equal(physics.radiationEraAgeSeconds(1e5), null);
