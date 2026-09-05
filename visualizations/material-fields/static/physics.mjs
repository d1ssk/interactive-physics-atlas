const DEFAULT_BOUNDS = Object.freeze({xMin: -5, xMax: 5, yMin: -3.2, yMax: 3.2});
const MIN_COEFFICIENT = 0.05;
const MAX_COEFFICIENT = 5000;

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function positiveNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function shapeSignedDistance(shape, u, v) {
  if (shape === "circle") return Math.hypot(u, v) - 1;

  if (shape === "rounded-rectangle") {
    const radius = 0.27;
    const qx = Math.abs(u) - (1 - radius);
    const qy = Math.abs(v) - (1 - radius);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
      + Math.min(Math.max(qx, qy), 0) - radius;
  }

  if (shape === "rounded-triangle") {
    // A smooth intersection of the three inward half-planes.  Unlike a
    // display-only Bézier approximation, this same implicit contour is used
    // for material rasterization, hit testing, and surface sampling.
    const distances = [
      -v - 1,
      (2 * u + v - 1) / Math.sqrt(5),
      (-2 * u + v - 1) / Math.sqrt(5),
    ];
    const sharpest = Math.max(...distances);
    const roundness = 10;
    return sharpest + Math.log(
      distances.reduce((sum, distance) => sum + Math.exp(roundness * (distance - sharpest)), 0),
    ) / roundness;
  }

  throw new RangeError(`Unknown shape: ${shape}`);
}

export function localCoordinates(x, y, object) {
  const angle = object.rotation ?? 0;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const dx = x - object.x;
  const dy = y - object.y;
  const halfWidth = positiveNumber(object.width, 1) / 2;
  const halfHeight = positiveNumber(object.height, 1) / 2;
  return {
    u: (cosine * dx + sine * dy) / halfWidth,
    v: (-sine * dx + cosine * dy) / halfHeight,
  };
}

export function pointInObject(x, y, object) {
  const {u, v} = localCoordinates(x, y, object);
  return shapeSignedDistance(object.shape, u, v) <= 0;
}

export function pointInMaterial(x, y, object) {
  const {u, v} = localCoordinates(x, y, object);
  if (shapeSignedDistance(object.shape, u, v) > 0) return false;
  if (!object.hollow) return true;
  const innerScale = clamp(1 - positiveNumber(object.wall, 0.25), 0.35, 0.9);
  return shapeSignedDistance(object.shape, u / innerScale, v / innerScale) >= 0;
}

function validateOptions(options) {
  const nx = Math.max(20, Math.round(options.nx ?? 150));
  const ny = Math.max(14, Math.round(options.ny ?? 96));
  const bounds = {...DEFAULT_BOUNDS, ...(options.bounds ?? {})};
  if (!(bounds.xMax > bounds.xMin && bounds.yMax > bounds.yMin)) {
    throw new RangeError("The field bounds must have positive width and height");
  }
  if (options.mode !== "electric" && options.mode !== "magnetic") {
    throw new RangeError(`Unknown mode: ${options.mode}`);
  }
  return {nx, ny, bounds};
}

function coefficientFor(object, mode) {
  const raw = mode === "electric" ? object.epsilon : object.mu;
  return clamp(positiveNumber(raw, 1), MIN_COEFFICIENT, MAX_COEFFICIENT);
}

export function rasterizeMaterials(options) {
  const {nx, ny, bounds} = validateOptions(options);
  const objects = options.objects ?? [];
  const size = nx * ny;
  const kappa = new Float64Array(size);
  const objectMask = new Int32Array(size);
  const conductorMask = new Int32Array(size);
  kappa.fill(1);

  const dx = (bounds.xMax - bounds.xMin) / (nx - 1);
  const dy = (bounds.yMax - bounds.yMin) / (ny - 1);
  for (let row = 0; row < ny; row += 1) {
    const y = bounds.yMin + row * dy;
    for (let column = 0; column < nx; column += 1) {
      const x = bounds.xMin + column * dx;
      const index = row * nx + column;
      for (let objectIndex = objects.length - 1; objectIndex >= 0; objectIndex -= 1) {
        const object = objects[objectIndex];
        if (!pointInMaterial(x, y, object)) continue;
        objectMask[index] = object.id;
        if (options.mode === "electric" && object.electricKind === "conductor") {
          conductorMask[index] = object.id;
          kappa[index] = 1;
        } else {
          kappa[index] = coefficientFor(object, options.mode);
        }
        break;
      }
    }
  }

  return {nx, ny, bounds, dx, dy, kappa, objectMask, conductorMask};
}

function harmonicMean(left, right) {
  return 2 * left * right / Math.max(left + right, Number.EPSILON);
}

function neighborWeight(materials, index, neighbor, horizontal) {
  const conductor = materials.conductorMask[index];
  const neighborConductor = materials.conductorMask[neighbor];
  if (conductor !== 0 && conductor === neighborConductor) return 0;

  let coefficient;
  if (conductor !== 0 && neighborConductor === 0) coefficient = materials.kappa[neighbor];
  else if (neighborConductor !== 0 && conductor === 0) coefficient = materials.kappa[index];
  else coefficient = harmonicMean(materials.kappa[index], materials.kappa[neighbor]);

  return horizontal
    ? coefficient * materials.dy / materials.dx
    : coefficient * materials.dx / materials.dy;
}

function conductorIds(mask) {
  const ids = new Set();
  for (const id of mask) if (id !== 0) ids.add(id);
  return [...ids];
}

function appliedPotentialForColumn(column, nx, leftPotential, rightPotential) {
  const fraction = column / (nx - 1);
  return leftPotential + fraction * (rightPotential - leftPotential);
}

function setAppliedBoundaries(potential, nx, ny, leftPotential, rightPotential) {
  for (let row = 0; row < ny; row += 1) {
    potential[row * nx] = leftPotential;
    potential[row * nx + nx - 1] = rightPotential;
  }
  const topOffset = (ny - 1) * nx;
  for (let column = 0; column < nx; column += 1) {
    const applied = appliedPotentialForColumn(column, nx, leftPotential, rightPotential);
    potential[column] = applied;
    potential[topOffset + column] = applied;
  }
}

function initialPotential(materials, leftPotential, rightPotential, previous) {
  const {nx, ny} = materials;
  const size = nx * ny;
  if (previous instanceof Float64Array && previous.length === size) {
    const copied = new Float64Array(previous);
    setAppliedBoundaries(copied, nx, ny, leftPotential, rightPotential);
    return copied;
  }

  const potential = new Float64Array(size);
  for (let row = 0; row < ny; row += 1) {
    for (let column = 0; column < nx; column += 1) {
      potential[row * nx + column] = appliedPotentialForColumn(
        column,
        nx,
        leftPotential,
        rightPotential,
      );
    }
  }
  return potential;
}

function initializeConductorPotentials(materials, potential, ids) {
  const sums = new Map(ids.map(id => [id, {sum: 0, count: 0}]));
  for (let index = 0; index < potential.length; index += 1) {
    const id = materials.conductorMask[index];
    if (id === 0) continue;
    const entry = sums.get(id);
    entry.sum += potential[index];
    entry.count += 1;
  }
  return new Map(ids.map(id => {
    const entry = sums.get(id);
    return [id, entry.count > 0 ? entry.sum / entry.count : 0];
  }));
}

function updateConductors(materials, potential, voltages) {
  const {nx, ny, conductorMask} = materials;
  const weightedSums = new Map([...voltages].map(([id]) => [id, {value: 0, weight: 0}]));
  const offsets = [
    {delta: -1, horizontal: true, allowed: column => column > 0},
    {delta: 1, horizontal: true, allowed: column => column < nx - 1},
    {delta: -nx, horizontal: false, allowed: (_column, row) => row > 0},
    {delta: nx, horizontal: false, allowed: (_column, row) => row < ny - 1},
  ];

  for (let row = 0; row < ny; row += 1) {
    for (let column = 1; column < nx - 1; column += 1) {
      const index = row * nx + column;
      const id = conductorMask[index];
      if (id === 0) continue;
      const sum = weightedSums.get(id);
      for (const offset of offsets) {
        if (!offset.allowed(column, row)) continue;
        const neighbor = index + offset.delta;
        if (conductorMask[neighbor] === id) continue;
        const weight = neighborWeight(materials, index, neighbor, offset.horizontal);
        sum.value += weight * potential[neighbor];
        sum.weight += weight;
      }
    }
  }

  let maximumChange = 0;
  for (const [id, sum] of weightedSums) {
    if (sum.weight === 0) continue;
    const next = sum.value / sum.weight;
    maximumChange = Math.max(maximumChange, Math.abs(next - voltages.get(id)));
    voltages.set(id, next);
  }
  for (let index = 0; index < potential.length; index += 1) {
    const id = conductorMask[index];
    if (id !== 0) potential[index] = voltages.get(id);
  }
  return maximumChange;
}

export function solveField(options) {
  const materials = rasterizeMaterials(options);
  const {nx, ny, conductorMask} = materials;
  const leftPotential = Number.isFinite(options.leftPotential) ? options.leftPotential : 0.5;
  const rightPotential = Number.isFinite(options.rightPotential) ? options.rightPotential : -0.5;
  const tolerance = positiveNumber(options.tolerance, 2e-5);
  const maxIterations = Math.max(1, Math.round(options.maxIterations ?? 900));
  const omega = clamp(positiveNumber(options.omega, 1.76), 0.2, 1.95);
  const potential = initialPotential(materials, leftPotential, rightPotential, options.previousPotential);
  const ids = conductorIds(conductorMask);
  const voltages = initializeConductorPotentials(materials, potential, ids);
  updateConductors(materials, potential, voltages);

  let residual = Infinity;
  let iterations = 0;
  for (; iterations < maxIterations; iterations += 1) {
    let maximumChange = 0;
    for (let parity = 0; parity < 2; parity += 1) {
      for (let row = 1; row < ny - 1; row += 1) {
        const rowOffset = row * nx;
        for (let column = 1; column < nx - 1; column += 1) {
          if (((column + row) & 1) !== parity) continue;
          const index = rowOffset + column;
          if (conductorMask[index] !== 0) continue;

          let sum = 0;
          let totalWeight = 0;
          const west = index - 1;
          const east = index + 1;
          const westWeight = neighborWeight(materials, index, west, true);
          const eastWeight = neighborWeight(materials, index, east, true);
          sum += westWeight * potential[west] + eastWeight * potential[east];
          totalWeight += westWeight + eastWeight;
          const south = index - nx;
          const southWeight = neighborWeight(materials, index, south, false);
          sum += southWeight * potential[south];
          totalWeight += southWeight;
          const north = index + nx;
          const northWeight = neighborWeight(materials, index, north, false);
          sum += northWeight * potential[north];
          totalWeight += northWeight;
          const old = potential[index];
          const next = old + omega * (sum / totalWeight - old);
          potential[index] = next;
          maximumChange = Math.max(maximumChange, Math.abs(next - old));
        }
      }
    }
    maximumChange = Math.max(maximumChange, updateConductors(materials, potential, voltages));
    setAppliedBoundaries(potential, nx, ny, leftPotential, rightPotential);
    residual = maximumChange;
    if (residual < tolerance) {
      iterations += 1;
      break;
    }
  }

  return {
    ...materials,
    potential,
    mode: options.mode,
    leftPotential,
    rightPotential,
    iterations,
    residual,
    tolerance,
    maxIterations,
    conductorVoltages: Object.fromEntries(voltages),
  };
}

function gridCell(solution, x, y) {
  const column = clamp((x - solution.bounds.xMin) / solution.dx, 0, solution.nx - 1.000001);
  const row = clamp((y - solution.bounds.yMin) / solution.dy, 0, solution.ny - 1.000001);
  const left = Math.min(solution.nx - 2, Math.floor(column));
  const bottom = Math.min(solution.ny - 2, Math.floor(row));
  return {left, bottom, tx: column - left, ty: row - bottom};
}

export function samplePotential(solution, x, y) {
  const {left, bottom, tx, ty} = gridCell(solution, x, y);
  const offset = bottom * solution.nx + left;
  const v00 = solution.potential[offset];
  const v10 = solution.potential[offset + 1];
  const v01 = solution.potential[offset + solution.nx];
  const v11 = solution.potential[offset + solution.nx + 1];
  return (1 - ty) * ((1 - tx) * v00 + tx * v10)
    + ty * ((1 - tx) * v01 + tx * v11);
}

export function appliedPotentialAt(solution, x) {
  const fraction = (x - solution.bounds.xMin) / (solution.bounds.xMax - solution.bounds.xMin);
  return solution.leftPotential + fraction * (solution.rightPotential - solution.leftPotential);
}

export function sampleDisplayedPotential(solution, x, y, inducedOnly = false) {
  const total = samplePotential(solution, x, y);
  return inducedOnly ? total - appliedPotentialAt(solution, x) : total;
}

export function sampleIntensity(solution, x, y) {
  const {left, bottom, tx, ty} = gridCell(solution, x, y);
  const offset = bottom * solution.nx + left;
  const v00 = solution.potential[offset];
  const v10 = solution.potential[offset + 1];
  const v01 = solution.potential[offset + solution.nx];
  const v11 = solution.potential[offset + solution.nx + 1];
  const derivativeX = ((1 - ty) * (v10 - v00) + ty * (v11 - v01)) / solution.dx;
  const derivativeY = ((1 - tx) * (v01 - v00) + tx * (v11 - v10)) / solution.dy;
  return {x: -derivativeX, y: -derivativeY};
}

export function sampleCoefficient(solution, x, y) {
  const column = clamp(Math.round((x - solution.bounds.xMin) / solution.dx), 0, solution.nx - 1);
  const row = clamp(Math.round((y - solution.bounds.yMin) / solution.dy), 0, solution.ny - 1);
  return solution.kappa[row * solution.nx + column];
}

export function sampleDisplayedField(solution, x, y, inducedOnly = false) {
  const intensity = sampleIntensity(solution, x, y);
  const total = solution.mode === "electric"
    ? intensity
    : {
      x: sampleCoefficient(solution, x, y) * intensity.x,
      y: sampleCoefficient(solution, x, y) * intensity.y,
    };
  if (!inducedOnly) return total;
  const appliedX = (solution.leftPotential - solution.rightPotential)
    / (solution.bounds.xMax - solution.bounds.xMin);
  return {x: total.x - appliedX, y: total.y};
}

function localBoundaryPoint(shape, angle) {
  const direction = {x: Math.cos(angle), y: Math.sin(angle)};
  let low = 0;
  let high = 1.6;
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const middle = (low + high) / 2;
    if (shapeSignedDistance(shape, middle * direction.x, middle * direction.y) <= 0) low = middle;
    else high = middle;
  }
  const u = low * direction.x;
  const v = low * direction.y;
  const delta = 1e-4;
  const nx = shapeSignedDistance(shape, u + delta, v) - shapeSignedDistance(shape, u - delta, v);
  const ny = shapeSignedDistance(shape, u, v + delta) - shapeSignedDistance(shape, u, v - delta);
  const magnitude = Math.hypot(nx, ny) || 1;
  return {u, v, nu: nx / magnitude, nv: ny / magnitude};
}

export function localShapeBoundaryPoints(shape, count = 128) {
  const pointCount = Math.max(12, Math.round(count));
  return Array.from({length: pointCount}, (_unused, index) => {
    const point = localBoundaryPoint(shape, 2 * Math.PI * index / pointCount);
    return {u: point.u, v: point.v};
  });
}

function transformBoundaryPoint(object, local, scale, normalSign) {
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;
  const angle = object.rotation ?? 0;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const localX = scale * halfWidth * local.u;
  const localY = scale * halfHeight * local.v;
  const x = object.x + cosine * localX - sine * localY;
  const y = object.y + sine * localX + cosine * localY;

  const unrotatedNormalX = local.nu / halfWidth;
  const unrotatedNormalY = local.nv / halfHeight;
  const rotatedNormalX = cosine * unrotatedNormalX - sine * unrotatedNormalY;
  const rotatedNormalY = sine * unrotatedNormalX + cosine * unrotatedNormalY;
  const normalMagnitude = Math.hypot(rotatedNormalX, rotatedNormalY) || 1;
  return {
    x,
    y,
    nx: normalSign * rotatedNormalX / normalMagnitude,
    ny: normalSign * rotatedNormalY / normalMagnitude,
  };
}

const LOCAL_BOUNDARY_RING_CACHE = new Map();

function localBoundaryRing(shape, count) {
  const key = `${shape}:${count}`;
  if (!LOCAL_BOUNDARY_RING_CACHE.has(key)) {
    LOCAL_BOUNDARY_RING_CACHE.set(
      key,
      Array.from({length: count}, (_, index) => (
        localBoundaryPoint(shape, 2 * Math.PI * index / count)
      )),
    );
  }
  return LOCAL_BOUNDARY_RING_CACHE.get(key);
}

export function objectSurfaceSamples(solution, object, count = 144) {
  const samples = [];
  const boundaries = [{scale: 1, normalSign: 1, boundary: "outer"}];
  if (object.hollow) {
    boundaries.push({
      scale: clamp(1 - positiveNumber(object.wall, 0.25), 0.35, 0.9),
      normalSign: -1,
      boundary: "inner",
    });
  }
  const offset = 1.45 * Math.max(solution.dx, solution.dy);
  const localRing = localBoundaryRing(object.shape, count);
  for (const boundary of boundaries) {
    for (const local of localRing) {
      const point = transformBoundaryPoint(object, local, boundary.scale, boundary.normalSign);
      const insideField = sampleIntensity(
        solution,
        point.x - point.nx * offset,
        point.y - point.ny * offset,
      );
      const outsideField = sampleIntensity(
        solution,
        point.x + point.nx * offset,
        point.y + point.ny * offset,
      );
      let density;
      if (solution.mode === "electric") {
        density = object.electricKind === "conductor"
          ? outsideField.x * point.nx + outsideField.y * point.ny
          : (coefficientFor(object, "electric") - 1)
            * (insideField.x * point.nx + insideField.y * point.ny);
      } else {
        density = (coefficientFor(object, "magnetic") - 1)
          * (insideField.x * point.nx + insideField.y * point.ny);
      }
      samples.push({...point, density, boundary: boundary.boundary});
    }
  }
  return samples;
}

export function conductorFluxes(solution) {
  const fluxes = {};
  const {nx, ny, conductorMask, potential} = solution;
  for (let row = 0; row < ny; row += 1) {
    for (let column = 1; column < nx - 1; column += 1) {
      const index = row * nx + column;
      const id = conductorMask[index];
      if (id === 0) continue;
      if (!(id in fluxes)) fluxes[id] = 0;
      const neighbors = [];
      if (column > 0) neighbors.push({index: index - 1, horizontal: true});
      if (column < nx - 1) neighbors.push({index: index + 1, horizontal: true});
      if (row > 0) neighbors.push({index: index - nx, horizontal: false});
      if (row < ny - 1) neighbors.push({index: index + nx, horizontal: false});
      for (const neighbor of neighbors) {
        if (conductorMask[neighbor.index] === id) continue;
        const weight = neighborWeight(solution, index, neighbor.index, neighbor.horizontal);
        fluxes[id] += weight * (potential[index] - potential[neighbor.index]);
      }
    }
  }
  return fluxes;
}

export {DEFAULT_BOUNDS};
