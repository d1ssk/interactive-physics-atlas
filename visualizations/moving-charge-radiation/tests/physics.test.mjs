import assert from "node:assert/strict";
import test from "node:test";

import {
  fieldMagnitude,
  lienardWiechertField,
  retardedState,
  stateAtTime,
} from "../static/physics.js";

const close = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};

function staticHistory() {
  return [
    {t: -20, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0},
    {t: 20, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0},
  ];
}

test("a stationary charge produces a Coulomb field and no magnetic field", () => {
  const field = lienardWiechertField({x: 2, y: 0}, 0, staticHistory(), {
    propagationSpeed: 4,
    softening: 0,
  });
  close(field.electric.x, 0.25);
  close(field.electric.y, 0);
  close(fieldMagnitude(field.magnetic), 0);
  close(fieldMagnitude(field.radiationElectric), 0);
});

test("the retarded source lies on the observer's past light cone", () => {
  const history = [
    {t: -5, x: -0.5, y: 0, vx: 0.1, vy: 0, ax: 0, ay: 0},
    {t: 5, x: 0.5, y: 0, vx: 0.1, vy: 0, ax: 0, ay: 0},
  ];
  const observation = {x: 2, y: 1};
  const source = retardedState(observation, 1.3, history, 3);
  const distance = Math.hypot(observation.x - source.x, observation.y - source.y);
  close(source.t + distance / 3, 1.3, 2e-8);
});

test("radiation is transverse and falls as inverse distance", () => {
  const history = [
    {t: -20, x: 0, y: 0, vx: 0, vy: 0, ax: 1, ay: 0},
    {t: 20, x: 0, y: 0, vx: 0, vy: 0, ax: 1, ay: 0},
  ];
  const near = lienardWiechertField({x: 0, y: 2}, 0, history, {
    propagationSpeed: 4,
    softening: 0,
  });
  const far = lienardWiechertField({x: 0, y: 4}, 0, history, {
    propagationSpeed: 4,
    softening: 0,
  });
  close(near.radiationElectric.y, 0);
  close(fieldMagnitude(near.radiationElectric) / fieldMagnitude(far.radiationElectric), 2);
});

test("trajectory interpolation preserves the midpoint", () => {
  const history = [
    {t: 0, x: 0, y: 0, vx: 1, vy: 0, ax: 0, ay: 0},
    {t: 1, x: 1, y: 1, vx: 1, vy: 0, ax: 2, ay: 0},
  ];
  const middle = stateAtTime(history, 0.5);
  close(middle.x, 0.5);
  close(middle.y, 0.5);
  close(middle.ax, 1);
});
