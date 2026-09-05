import assert from "node:assert/strict";
import test from "node:test";

import {
  GATES,
  applyGate,
  blochVector,
  innerProduct,
  interpolateGateBlochVector,
  probabilities,
  stateFromBasis,
  stateNormSquared,
  superposeStates,
  vectorNorm,
} from "../static/physics.mjs";

const close = (actual, expected, tolerance = 1e-12) => {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
};

const vectorClose = (actual, expected, tolerance = 1e-12) => {
  close(actual.x, expected.x, tolerance);
  close(actual.y, expected.y, tolerance);
  close(actual.z, expected.z, tolerance);
};

test("basis parameterization produces the six Bloch cardinal states", () => {
  vectorClose(blochVector(stateFromBasis("z", 0, 1.7)), {x: 0, y: 0, z: 1});
  vectorClose(blochVector(stateFromBasis("z", Math.PI, 0.4)), {x: 0, y: 0, z: -1});
  vectorClose(blochVector(stateFromBasis("x", 0, 2.1)), {x: 1, y: 0, z: 0});
  vectorClose(blochVector(stateFromBasis("x", Math.PI, 0.7)), {x: -1, y: 0, z: 0});
  vectorClose(blochVector(stateFromBasis("y", 0, 1.2)), {x: 0, y: 1, z: 0});
  vectorClose(blochVector(stateFromBasis("y", Math.PI, 0.2)), {x: 0, y: -1, z: 0});
});

test("every parameterized pure state remains normalized and lies on the unit sphere", () => {
  for (const basis of ["z", "x", "y"]) {
    for (const theta of [0, 0.23, 1.1, Math.PI / 2, Math.PI]) {
      for (const phase of [-Math.PI, -0.4, 0, 2.7, 2 * Math.PI]) {
        const state = stateFromBasis(basis, theta, phase);
        close(stateNormSquared(state), 1);
        close(probabilities(state).reduce((sum, value) => sum + value, 0), 1);
        close(vectorNorm(blochVector(state)), 1);
      }
    }
  }
});

test("global phase does not change the Bloch vector", () => {
  const state = stateFromBasis("z", 1.14, 0.73);
  const phase = {re: Math.cos(1.9), im: Math.sin(1.9)};
  const phased = state.map((value) => ({
    re: value.re * phase.re - value.im * phase.im,
    im: value.re * phase.im + value.im * phase.re,
  }));
  vectorClose(blochVector(phased), blochVector(state));
});

test("coherent addition respects relative phase and normalizes the result", () => {
  const zero = stateFromBasis("z", 0, 0);
  const one = stateFromBasis("z", Math.PI, 0);
  const plus = superposeStates(zero, one, 0).state;
  const plusI = superposeStates(zero, one, Math.PI / 2).state;
  vectorClose(blochVector(plus), {x: 1, y: 0, z: 0});
  vectorClose(blochVector(plusI), {x: 0, y: 1, z: 0});
  close(stateNormSquared(plus), 1);
});

test("exact destructive interference is rejected as an undefined ray", () => {
  const state = stateFromBasis("x", 0.61, -0.8);
  assert.throws(() => superposeStates(state, state, Math.PI), /zero vector/);
});

test("all declared gate matrices preserve norm and Bloch-vector length", () => {
  const input = stateFromBasis("z", 1.2, -0.7);
  for (const gateKey of Object.keys(GATES)) {
    const output = applyGate(gateKey, input);
    close(stateNormSquared(output), 1);
    close(vectorNorm(blochVector(output)), 1);
    close(innerProduct(output, output).re, 1);
    close(innerProduct(output, output).im, 0);
  }
});

test("gate actions agree with the corresponding Bloch rotations", () => {
  const input = stateFromBasis("z", 1.07, 0.38);
  for (const gateKey of Object.keys(GATES)) {
    const matrixResult = blochVector(applyGate(gateKey, input));
    const rotationResult = interpolateGateBlochVector(gateKey, input, 1);
    vectorClose(rotationResult, matrixResult, 2e-12);
  }
});

test("familiar gate mappings follow the stated conventions", () => {
  const zero = stateFromBasis("z", 0, 0);
  const plus = stateFromBasis("x", 0, 0);
  vectorClose(blochVector(applyGate("X", zero)), {x: 0, y: 0, z: -1});
  vectorClose(blochVector(applyGate("H", zero)), {x: 1, y: 0, z: 0});
  vectorClose(blochVector(applyGate("S", plus)), {x: 0, y: 1, z: 0});
  const tPlus = blochVector(applyGate("T", plus));
  vectorClose(tPlus, {x: Math.SQRT1_2, y: Math.SQRT1_2, z: 0});
});
