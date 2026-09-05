export const EPSILON = 1e-12;
export const TAU = 2 * Math.PI;

export function complex(re = 0, im = 0) {
  if (!Number.isFinite(re) || !Number.isFinite(im)) {
    throw new RangeError("complex components must be finite");
  }
  return {re, im};
}

export function add(left, right) {
  return complex(left.re + right.re, left.im + right.im);
}

export function multiply(left, right) {
  return complex(
    left.re * right.re - left.im * right.im,
    left.re * right.im + left.im * right.re,
  );
}

export function scale(value, factor) {
  return complex(value.re * factor, value.im * factor);
}

export function conjugate(value) {
  return complex(value.re, -value.im);
}

export function absSquared(value) {
  return value.re * value.re + value.im * value.im;
}

export function polar(radius, phase) {
  if (!Number.isFinite(radius) || !Number.isFinite(phase)) {
    throw new RangeError("polar arguments must be finite");
  }
  return complex(radius * Math.cos(phase), radius * Math.sin(phase));
}

function assertState(state) {
  if (!Array.isArray(state) || state.length !== 2) {
    throw new TypeError("a qubit state must contain two amplitudes");
  }
  for (const amplitude of state) complex(amplitude.re, amplitude.im);
}

export function stateNormSquared(state) {
  assertState(state);
  return absSquared(state[0]) + absSquared(state[1]);
}

export function normalizeState(state) {
  const normSquared = stateNormSquared(state);
  if (normSquared <= EPSILON * EPSILON) {
    throw new RangeError("the zero state cannot be normalized");
  }
  const inverseNorm = 1 / Math.sqrt(normSquared);
  return state.map((amplitude) => scale(amplitude, inverseNorm));
}

export function innerProduct(left, right) {
  assertState(left);
  assertState(right);
  return add(multiply(conjugate(left[0]), right[0]), multiply(conjugate(left[1]), right[1]));
}

const R = Math.SQRT1_2;

export const BASES = Object.freeze({
  z: Object.freeze({
    label: "Z",
    ketLabels: Object.freeze(["0", "1"]),
    vectors: Object.freeze([
      Object.freeze([complex(1, 0), complex(0, 0)]),
      Object.freeze([complex(0, 0), complex(1, 0)]),
    ]),
  }),
  x: Object.freeze({
    label: "X",
    ketLabels: Object.freeze(["+", "-" ]),
    vectors: Object.freeze([
      Object.freeze([complex(R, 0), complex(R, 0)]),
      Object.freeze([complex(R, 0), complex(-R, 0)]),
    ]),
  }),
  y: Object.freeze({
    label: "Y",
    ketLabels: Object.freeze(["+y", "-y"]),
    vectors: Object.freeze([
      Object.freeze([complex(R, 0), complex(0, R)]),
      Object.freeze([complex(R, 0), complex(0, -R)]),
    ]),
  }),
});

export function stateFromBasis(basisKey, theta, relativePhase) {
  const basis = BASES[basisKey];
  if (!basis) throw new RangeError(`unknown basis: ${basisKey}`);
  if (!Number.isFinite(theta) || theta < 0 || theta > Math.PI) {
    throw new RangeError("theta must lie in [0, pi]");
  }
  if (!Number.isFinite(relativePhase)) throw new RangeError("relative phase must be finite");

  const coefficient0 = complex(Math.cos(theta / 2), 0);
  const coefficient1 = polar(Math.sin(theta / 2), relativePhase);
  return normalizeState([
    add(scale(basis.vectors[0][0], coefficient0.re), multiply(coefficient1, basis.vectors[1][0])),
    add(scale(basis.vectors[0][1], coefficient0.re), multiply(coefficient1, basis.vectors[1][1])),
  ]);
}

export function probabilities(state) {
  const normalized = normalizeState(state);
  return normalized.map(absSquared);
}

export function blochVector(state) {
  const [alpha, beta] = normalizeState(state);
  const cross = multiply(conjugate(alpha), beta);
  return {
    x: 2 * cross.re,
    y: 2 * cross.im,
    z: absSquared(alpha) - absSquared(beta),
  };
}

export function vectorNorm(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

export function canonicalizeGlobalPhase(state) {
  const normalized = normalizeState(state);
  const anchor = absSquared(normalized[0]) > EPSILON * EPSILON ? normalized[0] : normalized[1];
  const phase = Math.atan2(anchor.im, anchor.re);
  return normalized.map((amplitude) => multiply(polar(1, -phase), amplitude));
}

export function superposeStates(first, second, relativePhase) {
  if (!Number.isFinite(relativePhase)) throw new RangeError("relative phase must be finite");
  const a = normalizeState(first);
  const b = normalizeState(second);
  const phase = polar(1, relativePhase);
  const raw = [add(a[0], multiply(phase, b[0])), add(a[1], multiply(phase, b[1]))];
  const normSquared = stateNormSquared(raw);
  if (normSquared <= EPSILON * EPSILON) {
    throw new RangeError("the selected states interfere to the zero vector");
  }
  return {
    state: normalizeState(raw),
    unnormalizedNorm: Math.sqrt(normSquared),
  };
}

const I = complex(0, 1);
const MINUS_I = complex(0, -1);
const ZERO = complex(0, 0);
const ONE = complex(1, 0);

export const GATES = Object.freeze({
  I: Object.freeze({
    label: "I",
    matrix: Object.freeze([Object.freeze([ONE, ZERO]), Object.freeze([ZERO, ONE])]),
    axis: Object.freeze({x: 0, y: 0, z: 1}),
    angle: 0,
  }),
  X: Object.freeze({
    label: "X",
    matrix: Object.freeze([Object.freeze([ZERO, ONE]), Object.freeze([ONE, ZERO])]),
    axis: Object.freeze({x: 1, y: 0, z: 0}),
    angle: Math.PI,
  }),
  Y: Object.freeze({
    label: "Y",
    matrix: Object.freeze([Object.freeze([ZERO, MINUS_I]), Object.freeze([I, ZERO])]),
    axis: Object.freeze({x: 0, y: 1, z: 0}),
    angle: Math.PI,
  }),
  Z: Object.freeze({
    label: "Z",
    matrix: Object.freeze([Object.freeze([ONE, ZERO]), Object.freeze([ZERO, complex(-1, 0)])]),
    axis: Object.freeze({x: 0, y: 0, z: 1}),
    angle: Math.PI,
  }),
  H: Object.freeze({
    label: "H",
    matrix: Object.freeze([
      Object.freeze([complex(R, 0), complex(R, 0)]),
      Object.freeze([complex(R, 0), complex(-R, 0)]),
    ]),
    axis: Object.freeze({x: R, y: 0, z: R}),
    angle: Math.PI,
  }),
  S: Object.freeze({
    label: "S",
    matrix: Object.freeze([Object.freeze([ONE, ZERO]), Object.freeze([ZERO, I])]),
    axis: Object.freeze({x: 0, y: 0, z: 1}),
    angle: Math.PI / 2,
  }),
  T: Object.freeze({
    label: "T",
    matrix: Object.freeze([
      Object.freeze([ONE, ZERO]),
      Object.freeze([ZERO, polar(1, Math.PI / 4)]),
    ]),
    axis: Object.freeze({x: 0, y: 0, z: 1}),
    angle: Math.PI / 4,
  }),
});

export function applyGate(gateKey, state) {
  const gate = GATES[gateKey];
  if (!gate) throw new RangeError(`unknown gate: ${gateKey}`);
  const normalized = normalizeState(state);
  return normalizeState(gate.matrix.map((row) => (
    add(multiply(row[0], normalized[0]), multiply(row[1], normalized[1]))
  )));
}

export function rotateBlochVector(vector, axis, angle) {
  const axisNorm = Math.hypot(axis.x, axis.y, axis.z);
  if (axisNorm <= EPSILON) throw new RangeError("rotation axis must be non-zero");
  if (!Number.isFinite(angle)) throw new RangeError("rotation angle must be finite");
  const k = {x: axis.x / axisNorm, y: axis.y / axisNorm, z: axis.z / axisNorm};
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const dot = k.x * vector.x + k.y * vector.y + k.z * vector.z;
  const cross = {
    x: k.y * vector.z - k.z * vector.y,
    y: k.z * vector.x - k.x * vector.z,
    z: k.x * vector.y - k.y * vector.x,
  };
  return {
    x: vector.x * cosine + cross.x * sine + k.x * dot * (1 - cosine),
    y: vector.y * cosine + cross.y * sine + k.y * dot * (1 - cosine),
    z: vector.z * cosine + cross.z * sine + k.z * dot * (1 - cosine),
  };
}

export function interpolateGateBlochVector(gateKey, state, progress) {
  const gate = GATES[gateKey];
  if (!gate) throw new RangeError(`unknown gate: ${gateKey}`);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
    throw new RangeError("progress must lie in [0, 1]");
  }
  return rotateBlochVector(blochVector(state), gate.axis, gate.angle * progress);
}
