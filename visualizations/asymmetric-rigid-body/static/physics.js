const EPSILON = 1e-12;
const MAX_TRAJECTORY_STEPS = 250_000;

export const DEFAULT_INERTIA = Object.freeze([1, 1.7, 2.4]);

export function validateInertia(inertia) {
  if (!Array.isArray(inertia) || inertia.length !== 3 || !inertia.every(Number.isFinite)) {
    throw new TypeError("inertia must contain three finite principal moments");
  }
  if (!(0 < inertia[0] && inertia[0] < inertia[1] && inertia[1] < inertia[2])) {
    throw new RangeError("principal moments must satisfy 0 < I1 < I2 < I3");
  }
  return inertia;
}

export function norm(vector) {
  return Math.hypot(...vector);
}

export function normalize(vector) {
  const length = norm(vector);
  if (length <= EPSILON) throw new RangeError("cannot normalize a zero vector");
  return vector.map((component) => component / length);
}

export function angularMomentum(omega, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  return omega.map((component, index) => inertia[index] * component);
}

export function angularVelocity(momentum, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  return momentum.map((component, index) => component / inertia[index]);
}

// Euler equation in angular-momentum form: dL/dt = L × omega.
export function momentumDerivative(omega, inertia = DEFAULT_INERTIA) {
  const [L1, L2, L3] = angularMomentum(omega, inertia);
  const [w1, w2, w3] = omega;
  return [L2 * w3 - L3 * w2, L3 * w1 - L1 * w3, L1 * w2 - L2 * w1];
}

export function momentumSquaredFromOmega(omega, inertia = DEFAULT_INERTIA) {
  const momentum = angularMomentum(omega, inertia);
  return momentum.reduce((sum, component) => sum + component * component, 0);
}

export function rotationalEnergyFromOmega(omega, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  return 0.5 * omega.reduce(
    (sum, component, index) => sum + inertia[index] * component * component,
    0,
  );
}

export function rotationalEnergyFromMomentum(momentum, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  return 0.5 * momentum.reduce(
    (sum, component, index) => sum + component * component / inertia[index],
    0,
  );
}

// Torque-free Euler equations in the principal-axis body frame.
export function eulerDerivative(omega, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  const [I1, I2, I3] = inertia;
  const [w1, w2, w3] = omega;
  return [
    ((I2 - I3) / I1) * w2 * w3,
    ((I3 - I1) / I2) * w3 * w1,
    ((I1 - I2) / I3) * w1 * w2,
  ];
}

export function quaternionMultiply(left, right) {
  const [aw, ax, ay, az] = left;
  const [bw, bx, by, bz] = right;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

export function normalizeQuaternion(quaternion) {
  return normalize(quaternion);
}

// q maps body-frame coordinates to inertial-space coordinates.
export function quaternionDerivative(quaternion, omega) {
  return quaternionMultiply(quaternion, [0, ...omega]).map((value) => 0.5 * value);
}

export function rotateVector(quaternion, vector) {
  const [w, x, y, z] = normalizeQuaternion(quaternion);
  const [vx, vy, vz] = vector;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [
    vx + w * tx + (y * tz - z * ty),
    vy + w * ty + (z * tx - x * tz),
    vz + w * tz + (x * ty - y * tx),
  ];
}

function stateDerivative(state, inertia) {
  return {
    omega: eulerDerivative(state.omega, inertia),
    quaternion: quaternionDerivative(state.quaternion, state.omega),
  };
}

function offsetState(state, derivative, amount) {
  return {
    omega: state.omega.map((value, index) => value + amount * derivative.omega[index]),
    quaternion: state.quaternion.map(
      (value, index) => value + amount * derivative.quaternion[index],
    ),
    time: state.time,
  };
}

export function rk4Step(state, inertia = DEFAULT_INERTIA, dt) {
  validateInertia(inertia);
  if (!Number.isFinite(dt) || dt === 0) throw new RangeError("dt must be finite and non-zero");
  const k1 = stateDerivative(state, inertia);
  const k2 = stateDerivative(offsetState(state, k1, dt / 2), inertia);
  const k3 = stateDerivative(offsetState(state, k2, dt / 2), inertia);
  const k4 = stateDerivative(offsetState(state, k3, dt), inertia);
  const combine = (key) => state[key].map((value, index) => value + (dt / 6) * (
    k1[key][index] + 2 * k2[key][index] + 2 * k3[key][index] + k4[key][index]
  ));
  return {
    omega: combine("omega"),
    quaternion: normalizeQuaternion(combine("quaternion")),
    time: state.time + dt,
  };
}

export function makeInitialState(axis = 1, tiltDegrees = 6, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  if (!Number.isInteger(axis) || axis < 0 || axis > 2) {
    throw new RangeError("axis must be 0, 1, or 2");
  }
  if (!Number.isFinite(tiltDegrees) || tiltDegrees < 0 || tiltDegrees >= 90) {
    throw new RangeError("tilt must lie in [0, 90) degrees");
  }
  const tilt = tiltDegrees * Math.PI / 180;
  const phase = 0.63;
  const perturbation = [Math.cos(phase) * Math.sin(tilt), Math.sin(phase) * Math.sin(tilt)];
  const direction = [0, 0, 0];
  direction[axis] = Math.cos(tilt);
  direction[(axis + 1) % 3] = perturbation[0];
  direction[(axis + 2) % 3] = perturbation[1];

  // Compare all presets on the same angular-momentum sphere |L| = 1.
  const rawMomentum = angularMomentum(direction, inertia);
  const scale = 1 / norm(rawMomentum);
  return {
    omega: direction.map((component) => component * scale),
    quaternion: [1, 0, 0, 0],
    time: 0,
  };
}

export function axisStability(axis, inertia = DEFAULT_INERTIA) {
  validateInertia(inertia);
  if (!Number.isInteger(axis) || axis < 0 || axis > 2) {
    throw new RangeError("axis must be 0, 1, or 2");
  }
  const [I1, I2, I3] = inertia;
  const growthSquared = [
    ((I3 - I1) / I2) * ((I1 - I2) / I3),
    ((I2 - I3) / I1) * ((I1 - I2) / I3),
    ((I2 - I3) / I1) * ((I3 - I1) / I2),
  ][axis];
  return growthSquared > 0 ? "unstable" : "stable";
}

export function invariantGeometry(omega, inertia = DEFAULT_INERTIA) {
  const momentum = angularMomentum(omega, inertia);
  const momentumNorm = norm(momentum);
  const energy = rotationalEnergyFromMomentum(momentum, inertia);
  return {
    momentumNorm,
    energy,
    sphereRadius: momentumNorm,
    ellipsoidRadii: inertia.map((moment) => Math.sqrt(2 * energy * moment)),
  };
}

export function sampleMomentumTrajectory(
  initialState,
  inertia = DEFAULT_INERTIA,
  {duration = 100, dt = 0.01, stride = 5} = {},
) {
  if (
    !Number.isFinite(duration) || duration <= 0
    || !Number.isFinite(dt) || dt <= 0
    || !Number.isInteger(stride) || stride < 1
  ) {
    throw new RangeError("duration and dt must be finite and positive; stride must be a positive integer");
  }
  const steps = Math.ceil(duration / dt);
  if (!Number.isSafeInteger(steps) || steps > MAX_TRAJECTORY_STEPS) {
    throw new RangeError("trajectory sampling exceeds the step limit");
  }
  const sampleDirection = (sign) => {
    const points = [];
    let state = {
      omega: [...initialState.omega],
      quaternion: [...initialState.quaternion],
      time: initialState.time,
    };
    for (let step = 0; step <= steps; step += 1) {
      if (step % stride === 0) points.push(angularMomentum(state.omega, inertia));
      state = rk4Step(state, inertia, sign * dt);
    }
    return points;
  };
  const backward = sampleDirection(-1).reverse();
  const forward = sampleDirection(1);
  backward.pop();
  return backward.concat(forward);
}
