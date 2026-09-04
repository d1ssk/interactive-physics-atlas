import assert from "node:assert/strict";
import test from "node:test";

import {
  TAU,
  branchOffsetsFromContinuation,
  compileExpression,
  complex,
  continuationSummary,
  createContinuationState,
  integratePolyline,
  magnitude,
  multiply,
  subtract,
} from "../static/physics.mjs";

const closeTo = (actual, expected, tolerance = 1e-10) => {
  assert.ok(
    magnitude(subtract(actual, expected)) < tolerance,
    `${actual.re} + ${actual.im}i is not close to ${expected.re} + ${expected.im}i`,
  );
};

test("complex multiplication follows i squared equals minus one", () => {
  closeTo(multiply(complex(0, 1), complex(0, 1)), complex(-1, 0));
});

test("parser supports implicit multiplication and right-associative powers", () => {
  const polynomial = compileExpression("2z + (z-1)(z+1)");
  closeTo(polynomial.evaluateAt(complex(2, 0)), complex(7, 0));
  const powerTower = compileExpression("z^2^3");
  closeTo(powerTower.evaluateAt(complex(2, 0)), complex(256, 0), 1e-8);
});

test("Cartesian and conjugate modes represent non-holomorphic functions", () => {
  const cartesian = compileExpression("x^2 + i*y", "xy");
  closeTo(cartesian.evaluateAt(complex(2, -3)), complex(4, -3));
  const conjugateProduct = compileExpression("z*zbar", "zbar");
  closeTo(conjugateProduct.evaluateAt(complex(2, -3)), complex(13, 0));
});

test("holomorphic input mode rejects conjugate variables", () => {
  assert.throws(
    () => compileExpression("z + zbar", "holomorphic"),
    (error) => error.code === "invalid-variables" && error.details.variables[0] === "zbar",
  );
});

test("holomorphic input mode rejects non-holomorphic operations", () => {
  for (const source of ["conj(z)", "bar(z)", "re(z)", "im(z)", "abs(z)", "arg(z)"]) {
    assert.throws(
      () => compileExpression(source, "holomorphic"),
      (error) => error.code === "invalid-functions" && error.details.functions.length === 1,
      source,
    );
  }
  assert.doesNotThrow(() => compileExpression("sqrt(z) + log(z) + sin(z)", "holomorphic"));
});

test("a continued square root changes sign after one circuit", () => {
  const squareRoot = compileExpression("sqrt(z)");
  const continuationState = createContinuationState();
  let value;
  for (let step = 0; step <= 128; step += 1) {
    const angle = (TAU * step) / 128;
    value = squareRoot.evaluateAt(complex(Math.cos(angle), Math.sin(angle)), {
      continuationState,
    });
  }
  closeTo(value, complex(-1, 0), 1e-10);
  assert.equal(continuationSummary(continuationState).maximumTurns, 1);
});

test("a continued logarithm gains two pi i after one circuit", () => {
  const logarithm = compileExpression("log(z)");
  const continuationState = createContinuationState();
  let value;
  for (let step = 0; step <= 128; step += 1) {
    const angle = (TAU * step) / 128;
    value = logarithm.evaluateAt(complex(Math.cos(angle), Math.sin(angle)), {
      continuationState,
    });
  }
  closeTo(value, complex(0, TAU), 1e-10);
});

test("the fixed sheet selector changes sqrt and log by their expected branches", () => {
  const squareRoot = compileExpression("sqrt(z)");
  closeTo(squareRoot.evaluateAt(complex(1, 0), {branchIndex: 1}), complex(-1, 0));
  const logarithm = compileExpression("log(z)");
  closeTo(logarithm.evaluateAt(complex(1, 0), {branchIndex: -1}), complex(0, -TAU));
});

test("cut crossing direction selects the corresponding square-root sheet", () => {
  const squareRoot = compileExpression("sqrt(z)");

  const positiveState = createContinuationState();
  let positiveContinuation;
  for (const angle of [Math.PI - 0.2, Math.PI - 0.05, -Math.PI + 0.05]) {
    positiveContinuation = squareRoot.evaluateAt(complex(Math.cos(angle), Math.sin(angle)), {
      continuationState: positiveState,
    });
  }
  const positiveOffsets = branchOffsetsFromContinuation(positiveState);
  assert.deepEqual([...positiveOffsets.values()], [1]);
  closeTo(
    squareRoot.evaluateAt(complex(Math.cos(-Math.PI + 0.05), Math.sin(-Math.PI + 0.05)), {
      branchOffsets: positiveOffsets,
    }),
    positiveContinuation,
  );

  const negativeState = createContinuationState();
  for (const angle of [-Math.PI + 0.2, -Math.PI + 0.05, Math.PI - 0.05]) {
    squareRoot.evaluateAt(complex(Math.cos(angle), Math.sin(angle)), {
      continuationState: negativeState,
    });
  }
  assert.deepEqual([...branchOffsetsFromContinuation(negativeState).values()], [-1]);
});

test("different multivalued nodes retain independent sheet offsets", () => {
  const twoRoots = compileExpression("sqrt(z) + sqrt(z-1)");
  const continuationState = createContinuationState();
  let continuedValue;
  for (let step = 0; step <= 256; step += 1) {
    const angle = Math.PI / 2 + (TAU * step) / 256;
    continuedValue = twoRoots.evaluateAt(
      complex(0.4 * Math.cos(angle), 0.4 * Math.sin(angle)),
      {continuationState},
    );
  }
  const offsets = branchOffsetsFromContinuation(continuationState);
  assert.deepEqual([...offsets.values()].sort(), [0, 1]);
  closeTo(twoRoots.evaluateAt(complex(0, 0.4), {branchOffsets: offsets}), continuedValue);
});

test("sqrt((1-z)(1+z)) has a principal-value jump beyond its branch points", () => {
  const functionWithTwoBranchPoints = compileExpression("sqrt((1-z)*(1+z))");
  const above = functionWithTwoBranchPoints.evaluateAt(complex(1.5, 1e-8));
  const below = functionWithTwoBranchPoints.evaluateAt(complex(1.5, -1e-8));
  closeTo(above, complex(0, -Math.sqrt(1.25)), 3e-8);
  closeTo(below, complex(0, Math.sqrt(1.25)), 3e-8);
});

test("the contour integral of 1/z is two pi i", () => {
  const reciprocal = compileExpression("1/z");
  const circle = [];
  for (let step = 0; step <= 2048; step += 1) {
    const angle = (TAU * step) / 2048;
    circle.push(complex(Math.cos(angle), Math.sin(angle)));
  }
  const {integral} = integratePolyline(circle, reciprocal);
  closeTo(integral, complex(0, TAU), 2e-5);
});

test("the closed contour integral of an entire polynomial vanishes", () => {
  const polynomial = compileExpression("z^3 - 2z + 1");
  const circle = [];
  for (let step = 0; step <= 512; step += 1) {
    const angle = (TAU * step) / 512;
    circle.push(complex(1.4 * Math.cos(angle), 1.4 * Math.sin(angle)));
  }
  const {integral} = integratePolyline(circle, polynomial);
  closeTo(integral, complex(0, 0), 1e-10);
});

test("a conjugate field has a nonzero closed contour integral", () => {
  const conjugate = compileExpression("zbar", "zbar");
  const circle = [];
  for (let step = 0; step <= 2048; step += 1) {
    const angle = (TAU * step) / 2048;
    circle.push(complex(Math.cos(angle), Math.sin(angle)));
  }
  const {integral} = integratePolyline(circle, conjugate);
  closeTo(integral, complex(0, TAU), 2e-5);
});
