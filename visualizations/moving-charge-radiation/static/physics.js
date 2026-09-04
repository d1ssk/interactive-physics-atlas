const EPSILON = 1e-12;

function lerp(left, right, amount) {
  return left + (right - left) * amount;
}

function toVector3(vector) {
  return {x: vector.x ?? 0, y: vector.y ?? 0, z: vector.z ?? 0};
}

function cross(left, right) {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

export function stateAtTime(history, time) {
  if (!history.length) throw new Error("trajectory history must not be empty");
  const first = history[0];
  const last = history.at(-1);
  if (time <= first.t) return {...first, t: time, vx: 0, vy: 0, ax: 0, ay: 0};
  if (time >= last.t) return {...last, t: time};

  let lower = 0;
  let upper = history.length - 1;
  while (upper - lower > 1) {
    const middle = Math.floor((lower + upper) / 2);
    if (history[middle].t <= time) lower = middle;
    else upper = middle;
  }

  const left = history[lower];
  const right = history[upper];
  const duration = right.t - left.t;
  const u = duration > EPSILON ? (time - left.t) / duration : 0;
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;

  return {
    t: time,
    x: h00 * left.x + h10 * duration * left.vx + h01 * right.x + h11 * duration * right.vx,
    y: h00 * left.y + h10 * duration * left.vy + h01 * right.y + h11 * duration * right.vy,
    vx: lerp(left.vx, right.vx, u),
    vy: lerp(left.vy, right.vy, u),
    ax: lerp(left.ax, right.ax, u),
    ay: lerp(left.ay, right.ay, u),
  };
}

function arrivalResidual(point, observationTime, history, propagationSpeed, emissionTime) {
  const source = stateAtTime(history, emissionTime);
  const distance = Math.hypot(
    point.x - source.x,
    point.y - source.y,
    (point.z ?? 0) - (source.z ?? 0),
  );
  return emissionTime + distance / propagationSpeed - observationTime;
}

export function retardedState(point, observationTime, history, propagationSpeed) {
  if (!(propagationSpeed > 0)) throw new Error("propagation speed must be positive");
  if (!history.length) throw new Error("trajectory history must not be empty");

  const first = history[0];
  const last = history.at(-1);
  const firstResidual = arrivalResidual(
    point, observationTime, history, propagationSpeed, first.t,
  );
  if (firstResidual >= 0) {
    const distance = Math.hypot(
      point.x - first.x,
      point.y - first.y,
      (point.z ?? 0) - (first.z ?? 0),
    );
    return {...first, t: observationTime - distance / propagationSpeed, vx: 0, vy: 0, ax: 0, ay: 0};
  }

  const lastResidual = arrivalResidual(
    point, observationTime, history, propagationSpeed, last.t,
  );
  if (lastResidual <= 0) {
    const distance = Math.hypot(
      point.x - last.x,
      point.y - last.y,
      (point.z ?? 0) - (last.z ?? 0),
    );
    return {...last, t: observationTime - distance / propagationSpeed, vx: 0, vy: 0, ax: 0, ay: 0};
  }

  let lower = first.t;
  let upper = last.t;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const middle = (lower + upper) / 2;
    const residual = arrivalResidual(
      point, observationTime, history, propagationSpeed, middle,
    );
    if (residual > 0) upper = middle;
    else lower = middle;
  }
  return stateAtTime(history, (lower + upper) / 2);
}

function zeroField(source) {
  return {
    electric: {x: 0, y: 0, z: 0},
    magnetic: {x: 0, y: 0, z: 0},
    magneticZ: 0,
    velocityElectric: {x: 0, y: 0, z: 0},
    radiationElectric: {x: 0, y: 0, z: 0},
    velocityMagnetic: {x: 0, y: 0, z: 0},
    radiationMagnetic: {x: 0, y: 0, z: 0},
    velocityMagneticZ: 0,
    radiationMagneticZ: 0,
    source,
    retardedTime: source.t,
    distance: 0,
  };
}

export function lienardWiechertField(point, observationTime, history, options = {}) {
  const propagationSpeed = options.propagationSpeed ?? 3;
  const charge = options.charge ?? 1;
  const coulombConstant = options.coulombConstant ?? 1;
  const softening = options.softening ?? 0.12;
  const source = retardedState(point, observationTime, history, propagationSpeed);
  const observation = toVector3(point);
  const sourcePosition = toVector3(source);
  const displacement = {
    x: observation.x - sourcePosition.x,
    y: observation.y - sourcePosition.y,
    z: observation.z - sourcePosition.z,
  };
  const geometricDistance = Math.hypot(
    displacement.x,
    displacement.y,
    displacement.z,
  );
  if (geometricDistance < EPSILON) return zeroField(source);

  const distance = Math.max(softening, geometricDistance);
  const direction = {
    x: displacement.x / geometricDistance,
    y: displacement.y / geometricDistance,
    z: displacement.z / geometricDistance,
  };
  const beta = {
    x: source.vx / propagationSpeed,
    y: source.vy / propagationSpeed,
    z: (source.vz ?? 0) / propagationSpeed,
  };
  const betaSquared = Math.min(
    0.98,
    beta.x * beta.x + beta.y * beta.y + beta.z * beta.z,
  );
  const betaDot = {
    x: source.ax / propagationSpeed,
    y: source.ay / propagationSpeed,
    z: (source.az ?? 0) / propagationSpeed,
  };
  const kappa = Math.max(
    0.035,
    1 - direction.x * beta.x - direction.y * beta.y - direction.z * beta.z,
  );
  const denominator = kappa ** 3;
  const nMinusBeta = {
    x: direction.x - beta.x,
    y: direction.y - beta.y,
    z: direction.z - beta.z,
  };
  const velocityFactor = charge * coulombConstant * (1 - betaSquared)
    / (denominator * distance ** 2);
  const velocityElectric = {
    x: velocityFactor * nMinusBeta.x,
    y: velocityFactor * nMinusBeta.y,
    z: velocityFactor * nMinusBeta.z,
  };

  // n × ((n − β) × βdot), evaluated with the vector triple-product identity.
  const nDotBetaDot = direction.x * betaDot.x
    + direction.y * betaDot.y
    + direction.z * betaDot.z;
  const nDotNMinusBeta = direction.x * nMinusBeta.x
    + direction.y * nMinusBeta.y
    + direction.z * nMinusBeta.z;
  const radiationNumerator = {
    x: nMinusBeta.x * nDotBetaDot - betaDot.x * nDotNMinusBeta,
    y: nMinusBeta.y * nDotBetaDot - betaDot.y * nDotNMinusBeta,
    z: nMinusBeta.z * nDotBetaDot - betaDot.z * nDotNMinusBeta,
  };
  const radiationFactor = charge * coulombConstant
    / (propagationSpeed * denominator * distance);
  const radiationElectric = {
    x: radiationFactor * radiationNumerator.x,
    y: radiationFactor * radiationNumerator.y,
    z: radiationFactor * radiationNumerator.z,
  };
  const electric = {
    x: velocityElectric.x + radiationElectric.x,
    y: velocityElectric.y + radiationElectric.y,
    z: velocityElectric.z + radiationElectric.z,
  };
  const velocityMagneticCross = cross(direction, velocityElectric);
  const radiationMagneticCross = cross(direction, radiationElectric);
  const velocityMagnetic = {
    x: velocityMagneticCross.x / propagationSpeed,
    y: velocityMagneticCross.y / propagationSpeed,
    z: velocityMagneticCross.z / propagationSpeed,
  };
  const radiationMagnetic = {
    x: radiationMagneticCross.x / propagationSpeed,
    y: radiationMagneticCross.y / propagationSpeed,
    z: radiationMagneticCross.z / propagationSpeed,
  };
  const magnetic = {
    x: velocityMagnetic.x + radiationMagnetic.x,
    y: velocityMagnetic.y + radiationMagnetic.y,
    z: velocityMagnetic.z + radiationMagnetic.z,
  };

  return {
    electric,
    magnetic,
    magneticZ: magnetic.z,
    velocityElectric,
    radiationElectric,
    velocityMagnetic,
    radiationMagnetic,
    velocityMagneticZ: velocityMagnetic.z,
    radiationMagneticZ: radiationMagnetic.z,
    source,
    retardedTime: source.t,
    distance: geometricDistance,
  };
}

export function fieldMagnitude(vector) {
  return Math.hypot(vector.x, vector.y, vector.z ?? 0);
}

export function clampVector(vector, maximum) {
  const magnitude = fieldMagnitude(vector);
  if (magnitude <= maximum || magnitude < EPSILON) return {...vector};
  const scale = maximum / magnitude;
  return {x: vector.x * scale, y: vector.y * scale};
}

export function larmorPower(charge, acceleration, propagationSpeed) {
  const accelerationSquared = acceleration.x ** 2 + acceleration.y ** 2;
  return 2 * charge ** 2 * accelerationSquared / (3 * propagationSpeed ** 3);
}
