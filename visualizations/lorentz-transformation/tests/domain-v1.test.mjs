import assert from "node:assert/strict";
import test from "node:test";

import * as Physics from "../static/runtime/lorentz-domain-v1.mjs";

const close = (actual, expected, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
};

test("known Lorentz factors and invalid speeds", () => {
  close(Physics.gamma(0), 1);
  close(Physics.gamma(0.6), 1.25);
  close(Physics.rapidity(Math.tanh(0.7)), 0.7);
  assert.throws(() => Physics.gamma(1), RangeError);
});

test("boosts preserve the interval and invert exactly", () => {
  for (const beta of [-0.82, -0.35, 0, 0.42, 0.8]) {
    for (const event of [
      {x: 1.4, ct: 2.2},
      {x: -2.3, ct: 0.7},
      {x: 1.5, ct: 1.5},
    ]) {
      const transformed = Physics.boost(event, beta);
      const recovered = Physics.inverseBoost(transformed, beta);
      close(recovered.x, event.x);
      close(recovered.ct, event.ct);
      close(Physics.interval(transformed), Physics.interval(event));
    }
  }
});

test("coordinate guides meet the appropriate primed axes", () => {
  const beta = 0.63;
  const event = {x: 1.3, ct: 2.4};
  const transformed = Physics.boost(event, beta);
  const guides = Physics.coordinateGuides(event, beta);
  const xFoot = Physics.boost(guides.prime.xFoot, beta);
  const ctFoot = Physics.boost(guides.prime.ctFoot, beta);

  close(xFoot.x, transformed.x);
  close(xFoot.ct, 0);
  close(ctFoot.x, 0);
  close(ctFoot.ct, transformed.ct);
});

test("hyperbolic rotations preserve proper time and proper length", () => {
  for (const beta of [-0.8, 0, 0.73]) {
    for (const progress of [0, 0.25, 0.6, 1]) {
      const timelike = Physics.hyperbolicTimelikePoint(1.7, beta, progress);
      const spacelike = Physics.hyperbolicSpacelikePoint(2.1, beta, progress);
      close(Physics.interval(timelike), 1.7 ** 2);
      close(Physics.interval(spacelike), -(2.1 ** 2));
    }
  }
});

test("time dilation and length contraction have reciprocal gamma factors", () => {
  for (const beta of [-0.8, 0, 0.73]) {
    const time = Physics.timeDilationConstruction(beta, 1.7);
    const length = Physics.lengthContractionConstruction(beta, 2.1);
    close(time.coordinateTime / 1.7, Physics.gamma(beta));
    close(2.1 / length.coordinateLength, Physics.gamma(beta));
    close(time.movingClockEnd.x, beta * time.movingClockEnd.ct);
    close(length.movingRestEnd.ct, beta * length.movingRestEnd.x);
  }
});
