export const DOMAIN_VERSION = "physics-atlas.lorentz-domain.v1";

function assertBeta(beta) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1) {
    throw new RangeError("beta must be finite and satisfy |beta| < 1");
  }
}

function assertPositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be finite and positive`);
  }
}

export function gamma(beta) {
  assertBeta(beta);
  return 1 / Math.sqrt(1 - beta * beta);
}

export function rapidity(beta) {
  assertBeta(beta);
  return Math.atanh(beta);
}

export function boost(event, beta) {
  const factor = gamma(beta);
  return {
    x: factor * (event.x - beta * event.ct),
    ct: factor * (event.ct - beta * event.x),
  };
}

export function inverseBoost(event, beta) {
  return boost(event, -beta);
}

export function interval(event) {
  return event.ct * event.ct - event.x * event.x;
}

export function framePoint(frame, coordinates, beta) {
  if (frame === "base") return {x: coordinates.x, ct: coordinates.ct};
  if (frame === "prime") return inverseBoost(coordinates, beta);
  throw new RangeError("frame must be 'base' or 'prime'");
}

export function coordinatesInFrames(event, beta) {
  return {
    base: {x: event.x, ct: event.ct},
    prime: boost(event, beta),
  };
}

export function coordinateGuides(event, beta) {
  const coordinates = coordinatesInFrames(event, beta);
  return {
    base: {
      xFoot: {x: coordinates.base.x, ct: 0},
      ctFoot: {x: 0, ct: coordinates.base.ct},
    },
    prime: {
      xFoot: inverseBoost({x: coordinates.prime.x, ct: 0}, beta),
      ctFoot: inverseBoost({x: 0, ct: coordinates.prime.ct}, beta),
    },
  };
}

function assertProgress(progress) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
    throw new RangeError("progress must satisfy 0 <= progress <= 1");
  }
}

export function hyperbolicTimelikePoint(properTime, beta, progress = 1) {
  assertPositive(properTime, "properTime");
  assertProgress(progress);
  const angle = rapidity(beta) * progress;
  return {
    x: properTime * Math.sinh(angle),
    ct: properTime * Math.cosh(angle),
  };
}

export function hyperbolicSpacelikePoint(properLength, beta, progress = 1) {
  assertPositive(properLength, "properLength");
  assertProgress(progress);
  const angle = rapidity(beta) * progress;
  return {
    x: properLength * Math.cosh(angle),
    ct: properLength * Math.sinh(angle),
  };
}

export function timeDilationConstruction(beta, properTime) {
  assertPositive(properTime, "properTime");
  const factor = gamma(beta);
  return {
    referenceEnd: {x: 0, ct: properTime},
    simultaneousIntersection: {x: beta * properTime, ct: properTime},
    movingClockEnd: {
      x: factor * beta * properTime,
      ct: factor * properTime,
    },
    coordinateTime: factor * properTime,
  };
}

export function lengthContractionConstruction(beta, properLength) {
  assertPositive(properLength, "properLength");
  const factor = gamma(beta);
  return {
    referenceEnd: {x: properLength, ct: 0},
    movingRestEnd: {
      x: factor * properLength,
      ct: factor * beta * properLength,
    },
    simultaneousEndpoint: {x: properLength / factor, ct: 0},
    coordinateLength: properLength / factor,
  };
}
