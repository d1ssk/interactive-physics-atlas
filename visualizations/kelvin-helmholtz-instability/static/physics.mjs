const TWO_PI = 2 * Math.PI;
export const DOMAIN_WIDTH = 8;
export const DOMAIN_HALF_HEIGHT = 1.68;
export const INITIAL_INTERFACE_AMPLITUDE = 0.072;

export function validateParameters(parameters) {
  const values = [
    parameters.velocityDifference,
    parameters.densityRatio,
    parameters.surfaceTension,
    parameters.wavelength,
  ];
  if (!values.every(Number.isFinite)) {
    throw new RangeError("All parameters must be finite.");
  }
  if (parameters.velocityDifference < 0) {
    throw new RangeError("velocityDifference must be non-negative.");
  }
  if (parameters.densityRatio <= 0) {
    throw new RangeError("densityRatio must be positive.");
  }
  if (parameters.surfaceTension < 0) {
    throw new RangeError("surfaceTension must be non-negative.");
  }
  if (parameters.wavelength <= 0) {
    throw new RangeError("wavelength must be positive.");
  }
}

export function densities(parameters) {
  validateParameters(parameters);
  return { top: parameters.densityRatio, bottom: 1, sum: parameters.densityRatio + 1 };
}

export function farFieldVelocities(parameters) {
  validateParameters(parameters);
  return {
    top: 0.5 * parameters.velocityDifference,
    bottom: -0.5 * parameters.velocityDifference,
  };
}

export function wavenumber(parameters) {
  validateParameters(parameters);
  return TWO_PI / parameters.wavelength;
}

export function densityCoupling(parameters) {
  const rho = densities(parameters);
  return (rho.top * rho.bottom) / rho.sum ** 2;
}

export function growthRateSquared(k, parameters) {
  validateParameters(parameters);
  if (!Number.isFinite(k) || k < 0) {
    throw new RangeError("k must be finite and non-negative.");
  }
  const rho = densities(parameters);
  const shear = densityCoupling(parameters) * parameters.velocityDifference ** 2 * k ** 2;
  const capillary = (parameters.surfaceTension * k ** 3) / rho.sum;
  return shear - capillary;
}

export function growthRate(k, parameters) {
  return Math.sqrt(Math.max(growthRateSquared(k, parameters), 0));
}

export function oscillationFrequency(k, parameters) {
  return Math.sqrt(Math.max(-growthRateSquared(k, parameters), 0));
}

export function phaseSpeed(parameters) {
  const rho = densities(parameters);
  const velocity = farFieldVelocities(parameters);
  return (rho.top * velocity.top + rho.bottom * velocity.bottom) / rho.sum;
}

export function criticalWavenumber(parameters) {
  validateParameters(parameters);
  if (parameters.velocityDifference === 0) return 0;
  if (parameters.surfaceTension === 0) return Number.POSITIVE_INFINITY;
  const rho = densities(parameters);
  return (
    (rho.top * rho.bottom * parameters.velocityDifference ** 2) /
    (parameters.surfaceTension * rho.sum)
  );
}

export function mostUnstableWavenumber(parameters) {
  const cutoff = criticalWavenumber(parameters);
  return Number.isFinite(cutoff) ? (2 * cutoff) / 3 : Number.POSITIVE_INFINITY;
}

export function modeSummary(parameters) {
  const k = wavenumber(parameters);
  const gamma = growthRate(k, parameters);
  const omegaCapillary = oscillationFrequency(k, parameters);
  let status = "neutral";
  if (gamma > 1e-12) status = "unstable";
  else if (omegaCapillary > 1e-12) status = "stable";
  return {
    k,
    gamma,
    omegaCapillary,
    phaseSpeed: phaseSpeed(parameters),
    criticalK: criticalWavenumber(parameters),
    mostUnstableK: mostUnstableWavenumber(parameters),
    status,
  };
}

export function rollupParameter(time, parameters, initial = 0.035, maximum = 0.92) {
  validateParameters(parameters);
  if (!Number.isFinite(time) || time < 0) {
    throw new RangeError("time must be finite and non-negative.");
  }
  if (!(initial > 0 && initial < maximum && maximum < 1)) {
    throw new RangeError("Require 0 < initial < maximum < 1.");
  }
  const gamma = growthRate(wavenumber(parameters), parameters);
  return Math.min(maximum, initial * Math.exp(gamma * time));
}

export function stuartVelocity(x, y, time, parameters, epsilon = null) {
  validateParameters(parameters);
  const selectedEpsilon = epsilon ?? rollupParameter(time, parameters);
  if (!Number.isFinite(selectedEpsilon) || Math.abs(selectedEpsilon) >= 1) {
    throw new RangeError("epsilon must be finite and satisfy abs(epsilon) < 1.");
  }
  const k = wavenumber(parameters);
  const phase = k * (x - phaseSpeed(parameters) * time);
  const scaledY = k * y;
  const denominator = Math.cosh(scaledY) + selectedEpsilon * Math.cos(phase);
  const scale = 0.5 * parameters.velocityDifference;
  return {
    u: (scale * Math.sinh(scaledY)) / denominator,
    v: (scale * selectedEpsilon * Math.sin(phase)) / denominator,
  };
}

export function stuartVorticity(x, y, time, parameters, epsilon = null) {
  validateParameters(parameters);
  const selectedEpsilon = epsilon ?? rollupParameter(time, parameters);
  if (!Number.isFinite(selectedEpsilon) || Math.abs(selectedEpsilon) >= 1) {
    throw new RangeError("epsilon must be finite and satisfy abs(epsilon) < 1.");
  }
  const k = wavenumber(parameters);
  const phase = k * (x - phaseSpeed(parameters) * time);
  const denominator = Math.cosh(k * y) + selectedEpsilon * Math.cos(phase);
  const scale = 0.5 * parameters.velocityDifference;
  return (-scale * k * (1 - selectedEpsilon ** 2)) / denominator ** 2;
}

export function initialInterface(x, parameters) {
  validateParameters(parameters);
  return INITIAL_INTERFACE_AMPLITUDE * Math.sin(wavenumber(parameters) * x);
}

function validateDyeShape(columns, rows) {
  if (!Number.isInteger(columns) || columns < 2 || !Number.isInteger(rows) || rows < 2) {
    throw new RangeError("Dye field columns and rows must be integers of at least two.");
  }
}

export function createDyeField(parameters, columns = 360, rows = 202) {
  validateParameters(parameters);
  validateDyeShape(columns, rows);
  const values = new Float32Array(columns * rows);
  const k = wavenumber(parameters);

  for (let row = 0; row < rows; row += 1) {
    const y = -DOMAIN_HALF_HEIGHT + ((row + 0.5) / rows) * 2 * DOMAIN_HALF_HEIGHT;
    for (let column = 0; column < columns; column += 1) {
      const x = ((column + 0.5) / columns) * DOMAIN_WIDTH;
      const interfaceY = INITIAL_INTERFACE_AMPLITUDE * Math.sin(k * x);
      values[row * columns + column] = y - interfaceY;
    }
  }
  return { columns, rows, values, scratch: new Float32Array(values.length) };
}

function sampleDye(values, columns, rows, x, y, width, halfHeight) {
  let gridX = (x / width) * columns - 0.5;
  gridX = ((gridX % columns) + columns) % columns;
  const gridY = Math.max(
    0,
    Math.min(rows - 1, ((y + halfHeight) / (2 * halfHeight)) * rows - 0.5),
  );
  const x0 = Math.floor(gridX);
  const y0 = Math.floor(gridY);
  const x1 = (x0 + 1) % columns;
  const y1 = Math.min(y0 + 1, rows - 1);
  const xFraction = gridX - x0;
  const yFraction = gridY - y0;
  const lower =
    values[y0 * columns + x0] * (1 - xFraction) +
    values[y0 * columns + x1] * xFraction;
  const upper =
    values[y1 * columns + x0] * (1 - xFraction) +
    values[y1 * columns + x1] * xFraction;
  return lower * (1 - yFraction) + upper * yFraction;
}

function velocityAt(x, y, time, epsilon, k, c, scale) {
  const phase = k * (x - c * time);
  const scaledY = k * y;
  const denominator = Math.cosh(scaledY) + epsilon * Math.cos(phase);
  return {
    u: (scale * Math.sinh(scaledY)) / denominator,
    v: (scale * epsilon * Math.sin(phase)) / denominator,
  };
}

export function advectDyeField(
  dyeField,
  startTime,
  duration,
  parameters,
  maximumStep = 0.025,
) {
  validateParameters(parameters);
  validateDyeShape(dyeField.columns, dyeField.rows);
  if (!(dyeField.values instanceof Float32Array)) {
    throw new TypeError("dyeField.values must be a Float32Array.");
  }
  if (dyeField.values.length !== dyeField.columns * dyeField.rows) {
    throw new RangeError("Dye field shape does not match its value count.");
  }
  if (!Number.isFinite(startTime) || startTime < 0 || !Number.isFinite(duration) || duration < 0) {
    throw new RangeError("startTime and duration must be finite and non-negative.");
  }
  if (!Number.isFinite(maximumStep) || maximumStep <= 0) {
    throw new RangeError("maximumStep must be finite and positive.");
  }
  if (duration === 0) return dyeField;

  const { columns, rows } = dyeField;
  const k = wavenumber(parameters);
  const c = phaseSpeed(parameters);
  const scale = 0.5 * parameters.velocityDifference;
  const steps = Math.max(1, Math.ceil(duration / maximumStep));
  const step = duration / steps;
  let source = dyeField.values;
  let target = dyeField.scratch instanceof Float32Array && dyeField.scratch.length === source.length
    ? dyeField.scratch
    : new Float32Array(source.length);
  let time = startTime;

  for (let substep = 0; substep < steps; substep += 1) {
    const endTime = time + step;
    const midpointTime = time + 0.5 * step;
    const epsilonEnd = rollupParameter(endTime, parameters);
    const epsilonMidpoint = rollupParameter(midpointTime, parameters);
    for (let row = 0; row < rows; row += 1) {
      const y = -DOMAIN_HALF_HEIGHT + ((row + 0.5) / rows) * 2 * DOMAIN_HALF_HEIGHT;
      for (let column = 0; column < columns; column += 1) {
        const x = ((column + 0.5) / columns) * DOMAIN_WIDTH;
        const endVelocity = velocityAt(x, y, endTime, epsilonEnd, k, c, scale);
        const midpointX = x - 0.5 * step * endVelocity.u;
        const midpointY = y - 0.5 * step * endVelocity.v;
        const midpointVelocity = velocityAt(
          midpointX,
          midpointY,
          midpointTime,
          epsilonMidpoint,
          k,
          c,
          scale,
        );
        const departureX = x - step * midpointVelocity.u;
        const departureY = y - step * midpointVelocity.v;
        target[row * columns + column] = sampleDye(
          source,
          columns,
          rows,
          departureX,
          departureY,
          DOMAIN_WIDTH,
          DOMAIN_HALF_HEIGHT,
        );
      }
    }
    [source, target] = [target, source];
    time = endTime;
  }
  dyeField.values = source;
  dyeField.scratch = target;
  return dyeField;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function createTracerParticles(parameters, columns = 64, rows = 30, seed = 20260906) {
  validateParameters(parameters);
  validateDyeShape(columns, rows);
  const count = columns * rows;
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const startedAbove = new Uint8Array(count);
  const random = seededRandom(seed);
  const cellWidth = DOMAIN_WIDTH / columns;
  const cellHeight = (2 * DOMAIN_HALF_HEIGHT) / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const centreX = (column + 0.5) * cellWidth;
      const centreY = -DOMAIN_HALF_HEIGHT + (row + 0.5) * cellHeight;
      x[index] = (centreX + (random() - 0.5) * 0.68 * cellWidth + DOMAIN_WIDTH) % DOMAIN_WIDTH;
      y[index] = Math.max(
        -DOMAIN_HALF_HEIGHT,
        Math.min(DOMAIN_HALF_HEIGHT, centreY + (random() - 0.5) * 0.68 * cellHeight),
      );
      startedAbove[index] = y[index] >= initialInterface(x[index], parameters) ? 1 : 0;
    }
  }
  return { x, y, startedAbove };
}

export function advectTracerParticles(
  particles,
  startTime,
  duration,
  parameters,
  maximumStep = 0.025,
) {
  validateParameters(parameters);
  if (
    !(particles.x instanceof Float32Array) ||
    !(particles.y instanceof Float32Array) ||
    particles.x.length !== particles.y.length
  ) {
    throw new TypeError("Particle x and y must be equally sized Float32Arrays.");
  }
  if (!Number.isFinite(startTime) || startTime < 0 || !Number.isFinite(duration) || duration < 0) {
    throw new RangeError("startTime and duration must be finite and non-negative.");
  }
  if (!Number.isFinite(maximumStep) || maximumStep <= 0) {
    throw new RangeError("maximumStep must be finite and positive.");
  }
  if (duration === 0) return particles;

  const k = wavenumber(parameters);
  const c = phaseSpeed(parameters);
  const scale = 0.5 * parameters.velocityDifference;
  const steps = Math.max(1, Math.ceil(duration / maximumStep));
  const step = duration / steps;
  let time = startTime;
  for (let substep = 0; substep < steps; substep += 1) {
    const midpointTime = time + 0.5 * step;
    const epsilonStart = rollupParameter(time, parameters);
    const epsilonMidpoint = rollupParameter(midpointTime, parameters);
    for (let index = 0; index < particles.x.length; index += 1) {
      const velocity = velocityAt(particles.x[index], particles.y[index], time, epsilonStart, k, c, scale);
      const midpointX = particles.x[index] + 0.5 * step * velocity.u;
      const midpointY = particles.y[index] + 0.5 * step * velocity.v;
      const midpointVelocity = velocityAt(
        midpointX,
        midpointY,
        midpointTime,
        epsilonMidpoint,
        k,
        c,
        scale,
      );
      particles.x[index] = (
        (particles.x[index] + step * midpointVelocity.u) % DOMAIN_WIDTH + DOMAIN_WIDTH
      ) % DOMAIN_WIDTH;
      particles.y[index] = Math.max(
        -DOMAIN_HALF_HEIGHT,
        Math.min(DOMAIN_HALF_HEIGHT, particles.y[index] + step * midpointVelocity.v),
      );
    }
    time += step;
  }
  return particles;
}

export function curveExtent(parameters) {
  const selected = wavenumber(parameters);
  const cutoff = criticalWavenumber(parameters);
  if (Number.isFinite(cutoff)) {
    return Math.max(2.4 * selected, Math.min(1.15 * cutoff, 8 * selected));
  }
  return 4 * selected;
}
