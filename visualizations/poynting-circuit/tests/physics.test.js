"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
require("../static/physics.js");

const P = globalThis.PoyntingCircuitPhysics;

function nearlyEqual(actual, expected, tolerance = 1e-10) {
  return Math.abs(actual - expected) <= tolerance;
}

test("the quadratic wire interpolation preserves both endpoints", () => {
  const start = {x: 0.1, y: 0.7};
  const control = {x: 0.4, y: 0.9};
  const end = {x: 0.9, y: 0.6};
  assert.deepEqual(P.quadraticPoint(start, control, end, 0), start);
  assert.deepEqual(P.quadraticPoint(start, control, end, 1), end);
});

test("the cubic wire interpolation preserves endpoints and exposes independent handles", () => {
  const start = {x: 0.1, y: 0.6};
  const control1 = {x: 0.25, y: 0.9};
  const control2 = {x: 0.75, y: 0.5};
  const end = {x: 0.9, y: 0.7};
  assert.deepEqual(P.cubicPoint(start, control1, control2, end, 0), start);
  assert.deepEqual(P.cubicPoint(start, control1, control2, end, 1), end);
  const initialTangent = P.cubicTangent(start, control1, control2, end, 0);
  assert.ok(nearlyEqual(initialTangent.x, 3 * (control1.x - start.x)));
  assert.ok(nearlyEqual(initialTangent.y, 3 * (control1.y - start.y)));
});

test("source and fixed-size load retain a closed circuit", () => {
  const geometry = P.defaultGeometry();
  const paths = P.circuitPaths(geometry);
  assert.ok(nearlyEqual(paths.sourceTop.y - paths.sourceBottom.y, geometry.sourceLength));
  assert.ok(nearlyEqual(
    paths.loadTop.y - paths.loadBottom.y,
    geometry.loadElementLength,
  ));
  assert.deepEqual(paths.top[0], paths.sourceTop);
  assert.deepEqual(paths.top.at(-1), paths.loadTop);
  assert.deepEqual(paths.bottom[0], paths.sourceBottom);
  assert.deepEqual(paths.bottom.at(-1), paths.loadBottom);
});

test("two independently placed loads and their middle wire retain loop closure", () => {
  const geometry = P.defaultGeometry();
  geometry.loadCount = 2;
  geometry.sourceX = 0.23;
  geometry.sourceY = 0.62;
  geometry.loads[0] = {x: 0.72, y: 0.66};
  geometry.loads[1] = {x: 0.88, y: 0.27};
  geometry.topControl1 = {x: 0.36, y: 0.84};
  geometry.topControl2 = {x: 0.64, y: 0.7};
  geometry.middleControl1 = {x: 0.64, y: 0.48};
  geometry.middleControl2 = {x: 0.94, y: 0.43};
  geometry.bottomControl1 = {x: 0.36, y: 0.3};
  geometry.bottomControl2 = {x: 0.64, y: 0.14};
  const paths = P.circuitPaths(geometry);
  const segments = P.circuitSegments(geometry);
  assert.deepEqual(paths.middle[0], paths.loadElements[0].bottom);
  assert.deepEqual(paths.middle.at(-1), paths.loadElements[1].top);
  const startTangent = P.cubicTangent(
    paths.loadElements[0].bottom,
    paths.middleControl1,
    paths.middleControl2,
    paths.loadElements[1].top,
    0,
  );
  const endTangent = P.cubicTangent(
    paths.loadElements[0].bottom,
    paths.middleControl1,
    paths.middleControl2,
    paths.loadElements[1].top,
    1,
  );
  assert.ok(nearlyEqual(startTangent.x, 0));
  assert.ok(nearlyEqual(endTangent.x, 0));
  for (const load of paths.loadElements) {
    assert.ok(nearlyEqual(load.top.y - load.bottom.y, geometry.loadElementLength));
  }
  assert.deepEqual(segments[0].start, paths.sourceTop);
  assert.deepEqual(segments.at(-1).end, paths.sourceTop);
  const solution = P.solvePotential(geometry, {width: 45, height: 33, iterations: 360});
  const field = P.sampleElectricField(solution, 0.5, 0.5);
  assert.ok(Number.isFinite(field.x));
  assert.ok(Number.isFinite(field.y));
});

test("the closed clockwise circuit produces magnetic field into the page at its center", () => {
  const geometry = P.defaultGeometry();
  const field = P.magneticFieldZ(0.5, 0.5, P.circuitSegments(geometry), 1);
  assert.ok(field < 0);
});

test("E cross H points from source toward load between straight rails", () => {
  const result = P.poyntingVector(0, -2, -3);
  assert.ok(nearlyEqual(result.x, 6));
  assert.ok(nearlyEqual(result.y, 0));
});

test("a resistor has in-phase current and the expected average AC power", () => {
  const response = P.seriesResponse([{type: "r", resistance: 6}], 50, 12);
  assert.ok(nearlyEqual(response.currentPeak, 2));
  assert.ok(nearlyEqual(response.currentPhase, 0));
  assert.ok(nearlyEqual(response.averagePower, 12));
});

test("current leads in RC and lags in RL series loads", () => {
  const rc = P.seriesResponse([
    {type: "r", resistance: 8},
    {type: "c", capacitance: 220},
  ], 60, 12);
  const rl = P.seriesResponse([
    {type: "r", resistance: 8},
    {type: "l", inductance: 80},
  ], 60, 12);
  assert.ok(rc.currentPhase > 0);
  assert.ok(rl.currentPhase < 0);
  assert.ok(rc.powerFactor > 0 && rc.powerFactor < 1);
  assert.ok(rl.powerFactor > 0 && rl.powerFactor < 1);
});

test("two DC resistors add in series and partition the dissipated power", () => {
  const state = P.circuitState({
    mode: "dc",
    voltage: 12,
    components: [
      {type: "r", resistance: 4},
      {type: "r", resistance: 8},
    ],
  });
  assert.ok(nearlyEqual(state.current, 1));
  assert.ok(nearlyEqual(state.instantaneousPower, 12));
  assert.deepEqual(state.componentAveragePowers, [4, 8]);
});

test("ideal inductors and capacitors contribute no real AC loss", () => {
  const response = P.seriesResponse([
    {type: "l", inductance: 70},
    {type: "c", capacitance: 180},
  ], 60, 10);
  assert.ok(nearlyEqual(response.impedance.real, 0));
  assert.deepEqual(response.componentAveragePowers, [0, 0]);
  assert.ok(nearlyEqual(response.averagePower, 0));
});

test("the numerical potential solver fixes conductor potentials and points E downward", () => {
  const geometry = P.defaultGeometry();
  const solution = P.solvePotential(geometry, {width: 61, height: 41, iterations: 450});
  const paths = P.circuitPaths(geometry);
  const topMiddle = P.cubicPoint(
    paths.sourceTop,
    geometry.topControl1,
    geometry.topControl2,
    paths.loadTop,
    0.5,
  );
  const bottomMiddle = P.cubicPoint(
    paths.sourceBottom,
    geometry.bottomControl1,
    geometry.bottomControl2,
    paths.loadBottom,
    0.5,
  );
  const topPotential = P.bilinearSample(
    solution.potential,
    solution.width,
    solution.height,
    topMiddle.x,
    topMiddle.y,
  );
  const bottomPotential = P.bilinearSample(
    solution.potential,
    solution.width,
    solution.height,
    bottomMiddle.x,
    bottomMiddle.y,
  );
  const centerField = P.sampleElectricField(solution, 0.5, 0.5);
  assert.ok(Math.abs(topPotential - 0.5) < 0.03);
  assert.ok(Math.abs(bottomPotential + 0.5) < 0.03);
  assert.ok(centerField.y < 0);
  assert.ok(Math.abs(centerField.x) < 0.08 * Math.abs(centerField.y));
});

test("Poynting flow enters the load from both sides and leaves both sides of the source", () => {
  const geometry = P.defaultGeometry();
  const solution = P.solvePotential(geometry, {width: 61, height: 41, iterations: 450});
  const segments = P.circuitSegments(geometry);
  function flowAt(x) {
    const electric = P.sampleElectricField(solution, x, 0.5);
    const magnetic = P.magneticFieldZ(x, 0.5, segments);
    return P.poyntingVector(electric.x, electric.y, magnetic);
  }
  assert.ok(flowAt(geometry.loads[0].x - 0.08).x > 0);
  assert.ok(flowAt(geometry.loads[0].x + 0.08).x < 0);
  assert.ok(flowAt(geometry.sourceX - 0.08).x < 0);
  assert.ok(flowAt(geometry.sourceX + 0.08).x > 0);
});

test("a reactive load returns energy during part of an AC cycle", () => {
  const parameters = {
    mode: "ac",
    frequency: 60,
    voltage: 12,
    components: [
      {type: "r", resistance: 2},
      {type: "l", inductance: 160},
    ],
  };
  const powers = Array.from({length: 720}, (_, index) => P.circuitState(
    parameters,
    2 * Math.PI * index / 720,
  ).instantaneousPower);
  assert.ok(Math.min(...powers) < 0);
  assert.ok(Math.max(...powers) > 0);
});

test("the AC average from phase sampling matches the phasor result", () => {
  const parameters = {
    mode: "ac",
    frequency: 60,
    voltage: 12,
    components: [
      {type: "r", resistance: 8},
      {type: "l", inductance: 80},
    ],
  };
  const samples = 20000;
  let sum = 0;
  for (let index = 0; index < samples; index += 1) {
    sum += P.circuitState(parameters, 2 * Math.PI * index / samples).instantaneousPower;
  }
  const expected = P.circuitState(parameters, 0).averagePower;
  assert.ok(Math.abs(sum / samples - expected) < 1e-9);
});

test("complex node voltages obey KVL and component instantaneous powers balance", () => {
  for (const reactiveComponent of [
    {type: "l", inductance: 80},
    {type: "c", capacitance: 220},
  ]) {
    const parameters = {
      mode: "ac",
      frequency: 60,
      voltage: 12,
      components: [{type: "r", resistance: 8}, reactiveComponent],
    };
    const phasors = P.circuitPhasors(parameters);
    assert.ok(phasors.valid);
    assert.ok(P.complexMagnitude(phasors.nodeVoltages.at(-1)) < 1e-12);
    for (let index = 0; index < 180; index += 1) {
      const state = P.circuitState(parameters, 2 * Math.PI * index / 180);
      const componentPower = state.componentInstantaneousPowers.reduce(
        (sum, value) => sum + value,
        0,
      );
      assert.ok(nearlyEqual(componentPower, state.instantaneousPower, 1e-9));
      assert.ok(state.componentInstantaneousPowers[0] >= -1e-12);
    }
  }
});

test("field bases reproduce independent top and middle conductor potentials", () => {
  const geometry = P.defaultGeometry();
  geometry.loadCount = 2;
  const basis = P.solveFieldBasis(geometry, {
    width: 61,
    height: 43,
    iterations: 520,
  });
  const nodeVoltages = [P.complex(12, 0), P.complex(3, -4), P.complex(0, 0)];
  const field = P.combineFieldBasis(basis, nodeVoltages);
  const paths = P.circuitPaths(geometry);
  const topPoint = paths.top[Math.floor(paths.top.length / 2)];
  const middlePoint = paths.middle[Math.floor(paths.middle.length / 2)];
  const sample = (values, point) => P.bilinearSample(
    values,
    field.width,
    field.height,
    point.x,
    point.y,
  );
  assert.ok(Math.abs(sample(field.potentialReal, topPoint) - 12) < 0.35);
  assert.ok(Math.abs(sample(field.potentialReal, middlePoint) - 3) < 0.2);
  assert.ok(Math.abs(sample(field.potentialImaginary, middlePoint) + 4) < 0.2);
});

test("instantaneous field multiplies real E and H rather than a global power sign", () => {
  const electricX = P.complex(2, -1);
  const electricY = P.complex(-3, 4);
  const current = P.complex(0.5, 2);
  const phase = 0.73;
  const field = P.instantaneousField(electricX, electricY, -1.7, current, phase);
  const expected = P.poyntingVector(
    P.realAtPhase(electricX, phase),
    P.realAtPhase(electricY, phase),
    -1.7 * P.realAtPhase(current, phase),
  );
  assert.ok(nearlyEqual(field.poynting.x, expected.x));
  assert.ok(nearlyEqual(field.poynting.y, expected.y));
});

test("an ideal undamped LC series resonance is reported as undefined", () => {
  const frequency = 60;
  const inductanceHenry = 0.08;
  const resonantCapacitanceMicrofarad = 1e6
    / ((2 * Math.PI * frequency) ** 2 * inductanceHenry);
  const phasors = P.circuitPhasors({
    mode: "ac",
    frequency,
    voltage: 12,
    components: [
      {type: "l", inductance: 1000 * inductanceHenry},
      {type: "c", capacitance: resonantCapacitanceMicrofarad},
    ],
  });
  assert.equal(phasors.valid, false);
  assert.ok(nearlyEqual(P.complexMagnitude(phasors.current), 0));
});

test("a small positive resistance is not misclassified as resonance", () => {
  const phasors = P.circuitPhasors({
    mode: "ac",
    frequency: 60,
    voltage: 12,
    components: [{type: "r", resistance: 1e-7}],
  });
  assert.equal(phasors.valid, true);
  assert.ok(Number.isFinite(P.complexMagnitude(phasors.current)));
  assert.ok(nearlyEqual(phasors.current.real, 1.2e8, 1e-5));
});

test("the local field-flux audit keeps a resistor absorptive in mixed AC circuits", () => {
  const geometry = P.defaultGeometry();
  geometry.loadCount = 2;
  const basis = P.solveFieldBasis(geometry, {
    width: 91,
    height: 63,
    iterations: 720,
    tolerance: 7e-6,
  });
  const segments = P.circuitSegments(geometry, 68);
  for (const reactiveComponent of [
    {type: "l", inductance: 80},
    {type: "c", capacitance: 220},
  ]) {
    const parameters = {
      mode: "ac",
      frequency: 60,
      voltage: 12,
      components: [reactiveComponent, {type: "r", resistance: 8}],
    };
    const circuit = P.circuitState(parameters, 0);
    const field = P.combineFieldBasis(basis, circuit.phasors.nodeVoltages);
    const sampleComplex = (realValues, imaginaryValues, x, y) => P.complex(
      P.bilinearSample(realValues, field.width, field.height, x, y),
      P.bilinearSample(imaginaryValues, field.width, field.height, x, y),
    );
    for (let phaseIndex = 0; phaseIndex < 72; phaseIndex += 1) {
      const phase = 2 * Math.PI * phaseIndex / 72;
      const state = P.circuitState(parameters, phase);
      if (state.componentInstantaneousPowers[1] < 0.01) continue;
      const flux = P.rectangularInwardFlux((x, y) => {
        const instantaneous = P.instantaneousField(
          sampleComplex(field.electricXReal, field.electricXImaginary, x, y),
          sampleComplex(field.electricYReal, field.electricYImaginary, x, y),
          P.magneticFieldZ(x, y, segments),
          circuit.phasors.current,
          phase,
        );
        return instantaneous.poynting;
      }, geometry.loads[1], 0.058, geometry.loadElementLength / 2 + 0.014, 22);
      assert.ok(flux > 0, `expected resistor influx, got ${flux} at phase ${phase}`);
    }
  }
});
