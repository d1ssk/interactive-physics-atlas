import assert from "node:assert/strict";
import test from "node:test";

import {
  numericalQwzChern,
  qwzBandGap,
  qwzBerryCurvature,
  qwzChernNumber,
  qwzD,
  qwzEnergy,
  sshBandGap,
  sshD,
  sshFiniteHamiltonian,
  sshFiniteSpectrum,
  sshWindingNumber,
  unitD,
} from "../static/physics.mjs";

const close = (actual, expected, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};

test("QWZ Hamiltonian is periodic and unit d lies on the sphere", () => {
  const parameters = {mass: -0.73, hopping: 1.25, trBreaking: 0.8};
  for (const [kx, ky] of [[0.2, -1.3], [2.7, 0.91], [-2.2, -2.8]]) {
    const here = qwzD(kx, ky, parameters);
    const wrapped = qwzD(kx + 2 * Math.PI, ky - 2 * Math.PI, parameters);
    for (const component of ["x", "y", "z"]) close(here[component], wrapped[component]);
    const unit = unitD(kx, ky, parameters);
    close(Math.hypot(unit.x, unit.y, unit.z), 1);
  }
});

test("occupied band follows the declared 0,+1,-1,0 convention", () => {
  const masses = [-3, -1, 1, 3];
  const expected = [0, 1, -1, 0];
  masses.forEach((mass, index) => {
    assert.equal(qwzChernNumber({mass}), expected[index]);
    close(numericalQwzChern({mass}, 36), expected[index], 1e-8);
  });
});

test("all QWZ gap closings and the double closing at zero are represented", () => {
  const closings = [
    {mass: -2, points: [[0, 0]]},
    {mass: 0, points: [[Math.PI, 0], [0, Math.PI]]},
    {mass: 2, points: [[Math.PI, Math.PI]]},
  ];
  for (const {mass, points} of closings) {
    assert.equal(qwzChernNumber({mass}), null);
    close(qwzBandGap({mass}), 0);
    for (const [kx, ky] of points) close(qwzEnergy(kx, ky, {mass}), 0);
  }
});

test("orientation reversal flips curvature and Chern number", () => {
  for (const mass of [-1, 1]) {
    assert.equal(
      qwzChernNumber({mass, trBreaking: 0.7}),
      -qwzChernNumber({mass, trBreaking: -0.7}),
    );
    close(
      qwzBerryCurvature(0.4, -0.8, {mass, trBreaking: 0.7}),
      -qwzBerryCurvature(0.4, 0.8, {mass, trBreaking: -0.7}),
    );
  }
});

test("SSH winding, gap, and finite-chain chiral pairing agree", () => {
  assert.equal(sshWindingNumber({t1: 0.6, t2: 1}), 1);
  assert.equal(sshWindingNumber({t1: 1.4, t2: 1}), 0);
  assert.equal(sshWindingNumber({t1: 1, t2: 1}), null);
  close(sshBandGap({t1: 0.6, t2: 1}), 0.8);
  const d = sshD(Math.PI, {t1: 1, t2: 1});
  close(Math.hypot(d.x, d.y), 0);

  const matrix = sshFiniteHamiltonian(14, {t1: 0.55, t2: 1});
  matrix.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    close(value, matrix[columnIndex][rowIndex]);
    if ((rowIndex - columnIndex) % 2 === 0) close(value, 0);
  }));
  const spectrum = sshFiniteSpectrum(14, {t1: 0.55, t2: 1});
  spectrum.values.forEach((value, index) => close(value, -spectrum.values.at(-index - 1), 2e-9));
  close(spectrum.density.reduce((sum, value) => sum + value, 0), 1, 1e-9);
  assert.ok(spectrum.edgeWeight > 0.65);
  assert.ok(Math.max(...spectrum.centralEnergies.map(Math.abs)) < 0.001);
});

test("cut-dimer limit has two exact end modes", () => {
  const spectrum = sshFiniteSpectrum(8, {t1: 0, t2: 1});
  close(spectrum.centralEnergies[0], 0);
  close(spectrum.centralEnergies[1], 0);
  close(spectrum.edgeWeight, 1);
});
