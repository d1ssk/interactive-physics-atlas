const TAU = 2 * Math.PI;
const EPSILON = 1e-11;

function assertFinite(value, name) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

function norm3(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** Coefficient vector for H(k) = d(k).sigma in the declared QWZ convention. */
export function qwzD(kx, ky, parameters = {}) {
  const mass = parameters.mass ?? -1;
  const hopping = parameters.hopping ?? 1;
  const trBreaking = parameters.trBreaking ?? 1;
  for (const [value, name] of [
    [kx, "kx"],
    [ky, "ky"],
    [mass, "mass"],
    [hopping, "hopping"],
    [trBreaking, "trBreaking"],
  ]) assertFinite(value, name);

  return {
    x: hopping * Math.sin(kx),
    y: -trBreaking * Math.sin(ky),
    z: mass + Math.cos(kx) + Math.cos(ky),
  };
}

export function qwzEnergy(kx, ky, parameters = {}) {
  return norm3(qwzD(kx, ky, parameters));
}

export function unitD(kx, ky, parameters = {}) {
  const vector = qwzD(kx, ky, parameters);
  const length = norm3(vector);
  if (length < EPSILON) return null;
  return {x: vector.x / length, y: vector.y / length, z: vector.z / length};
}

/** Berry curvature of the occupied (negative-energy) band. */
export function qwzBerryCurvature(kx, ky, parameters = {}) {
  const mass = parameters.mass ?? -1;
  const hopping = parameters.hopping ?? 1;
  const trBreaking = parameters.trBreaking ?? 1;
  const vector = qwzD(kx, ky, parameters);
  const length = norm3(vector);
  if (length < EPSILON) return null;

  const numerator = hopping * trBreaking * (
    Math.sin(kx) ** 2 * Math.cos(ky)
    + Math.cos(kx) * Math.sin(ky) ** 2
    + (mass + Math.cos(kx) + Math.cos(ky)) * Math.cos(kx) * Math.cos(ky)
  );
  return numerator / (2 * length ** 3);
}

/** Exact phase classification away from a bulk gap closing. */
export function qwzChernNumber(parameters = {}) {
  const mass = parameters.mass ?? -1;
  const hopping = parameters.hopping ?? 1;
  const trBreaking = parameters.trBreaking ?? 1;
  for (const [value, name] of [
    [mass, "mass"],
    [hopping, "hopping"],
    [trBreaking, "trBreaking"],
  ]) assertFinite(value, name);
  if ([-2, 0, 2].some(critical => Math.abs(mass - critical) < EPSILON)) return null;
  const flattened = Math.abs(hopping) < EPSILON || Math.abs(trBreaking) < EPSILON;
  if (flattened && Math.abs(mass) < 2) return null;
  if (Math.abs(mass) > 2 || flattened) return 0;
  const orientation = Math.sign(hopping * trBreaking);
  return mass < 0 ? orientation : -orientation;
}

function orientedSolidAngle(a, b, c) {
  const numerator = dot3(a, cross3(b, c));
  const denominator = 1 + dot3(a, b) + dot3(b, c) + dot3(c, a);
  return 2 * Math.atan2(numerator, denominator);
}

/** Gauge-free lattice estimate from oriented spherical triangle areas. */
export function numericalQwzChern(parameters = {}, resolution = 45) {
  if (!Number.isInteger(resolution) || resolution < 4) {
    throw new RangeError("resolution must be an integer >= 4");
  }
  const points = Array.from({length: resolution}, (_, ix) => (
    Array.from({length: resolution}, (_, iy) => unitD(
      -Math.PI + TAU * ix / resolution,
      -Math.PI + TAU * iy / resolution,
      parameters,
    ))
  ));
  if (points.some(row => row.some(point => point === null))) return null;

  let solidAngle = 0;
  for (let ix = 0; ix < resolution; ix += 1) {
    for (let iy = 0; iy < resolution; iy += 1) {
      const a = points[ix][iy];
      const b = points[(ix + 1) % resolution][iy];
      const c = points[(ix + 1) % resolution][(iy + 1) % resolution];
      const d = points[ix][(iy + 1) % resolution];
      solidAngle += orientedSolidAngle(a, b, c) + orientedSolidAngle(a, c, d);
    }
  }
  return -solidAngle / (4 * Math.PI);
}

/** Grid estimate of the full gap, with all known closing manifolds exact. */
export function qwzBandGap(parameters = {}, resolution = 121) {
  const mass = parameters.mass ?? -1;
  const hopping = parameters.hopping ?? 1;
  const trBreaking = parameters.trBreaking ?? 1;
  if ([-2, 0, 2].some(critical => Math.abs(mass - critical) < EPSILON)) return 0;
  const flattened = Math.abs(hopping) < EPSILON || Math.abs(trBreaking) < EPSILON;
  if (flattened && Math.abs(mass) <= 2) return 0;

  let minimum = Infinity;
  for (let ix = 0; ix < resolution; ix += 1) {
    const kx = -Math.PI + TAU * ix / (resolution - 1);
    for (let iy = 0; iy < resolution; iy += 1) {
      const ky = -Math.PI + TAU * iy / (resolution - 1);
      minimum = Math.min(minimum, qwzEnergy(kx, ky, parameters));
    }
  }
  return 2 * minimum;
}

export function qwzBandPath(parameters = {}, samplesPerSegment = 80) {
  const points = [
    {label: "Γ", kx: 0, ky: 0},
    {label: "X", kx: Math.PI, ky: 0},
    {label: "M", kx: Math.PI, ky: Math.PI},
    {label: "Y", kx: 0, ky: Math.PI},
    {label: "Γ", kx: 0, ky: 0},
  ];
  const samples = [];
  for (let segment = 0; segment < points.length - 1; segment += 1) {
    const start = points[segment];
    const end = points[segment + 1];
    for (let index = 0; index < samplesPerSegment; index += 1) {
      const fraction = index / samplesPerSegment;
      const kx = start.kx + fraction * (end.kx - start.kx);
      const ky = start.ky + fraction * (end.ky - start.ky);
      samples.push({x: segment + fraction, energy: qwzEnergy(kx, ky, parameters)});
    }
  }
  samples.push({x: 4, energy: qwzEnergy(0, 0, parameters)});
  return {samples, ticks: points.map((point, index) => ({x: index, label: point.label}))};
}

export function sshD(k, parameters = {}) {
  const t1 = parameters.t1 ?? 0.65;
  const t2 = parameters.t2 ?? 1;
  for (const [value, name] of [[k, "k"], [t1, "t1"], [t2, "t2"]]) {
    assertFinite(value, name);
  }
  return {x: t1 + t2 * Math.cos(k), y: t2 * Math.sin(k), z: 0};
}

export function sshEnergy(k, parameters = {}) {
  const vector = sshD(k, parameters);
  return Math.hypot(vector.x, vector.y);
}

export function sshBandGap(parameters = {}) {
  const t1 = parameters.t1 ?? 0.65;
  const t2 = parameters.t2 ?? 1;
  return 2 * Math.abs(Math.abs(t1) - Math.abs(t2));
}

export function sshWindingNumber(parameters = {}) {
  const t1 = parameters.t1 ?? 0.65;
  const t2 = parameters.t2 ?? 1;
  if (Math.abs(Math.abs(t1) - Math.abs(t2)) < EPSILON) return null;
  return Math.abs(t1) < Math.abs(t2) ? 1 : 0;
}

export function sshPath(parameters = {}, samples = 241) {
  if (!Number.isInteger(samples) || samples < 3) throw new RangeError("samples must be >= 3");
  return Array.from({length: samples}, (_, index) => {
    const k = -Math.PI + TAU * index / (samples - 1);
    const d = sshD(k, parameters);
    return {k, ...d, energy: Math.hypot(d.x, d.y)};
  });
}

export function sshFiniteHamiltonian(cells = 18, parameters = {}) {
  if (!Number.isInteger(cells) || cells < 2) throw new RangeError("cells must be >= 2");
  const t1 = parameters.t1 ?? 0.65;
  const t2 = parameters.t2 ?? 1;
  const size = 2 * cells;
  const matrix = Array.from({length: size}, () => Array(size).fill(0));
  for (let site = 0; site < size - 1; site += 1) {
    const hopping = site % 2 === 0 ? t1 : t2;
    matrix[site][site + 1] = hopping;
    matrix[site + 1][site] = hopping;
  }
  return matrix;
}

/** Jacobi diagonalization for the small real-symmetric matrices used here. */
export function diagonalizeSymmetric(matrix, tolerance = 1e-12, maxSweeps = 80) {
  const size = matrix.length;
  if (!size || matrix.some(row => row.length !== size)) {
    throw new RangeError("matrix must be non-empty and square");
  }
  const a = matrix.map(row => row.slice());
  const vectors = Array.from({length: size}, (_, row) => (
    Array.from({length: size}, (_, column) => Number(row === column))
  ));

  for (let sweep = 0; sweep < maxSweeps; sweep += 1) {
    let maximum = 0;
    for (let p = 0; p < size - 1; p += 1) {
      for (let q = p + 1; q < size; q += 1) {
        const apq = a[p][q];
        maximum = Math.max(maximum, Math.abs(apq));
        if (Math.abs(apq) < tolerance) continue;
        const tau = (a[q][q] - a[p][p]) / (2 * apq);
        const tangent = tau === 0
          ? 1
          : Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
        const cosine = 1 / Math.sqrt(1 + tangent * tangent);
        const sine = tangent * cosine;
        const app = a[p][p];
        const aqq = a[q][q];

        for (let row = 0; row < size; row += 1) {
          if (row === p || row === q) continue;
          const arp = a[row][p];
          const arq = a[row][q];
          a[row][p] = cosine * arp - sine * arq;
          a[p][row] = a[row][p];
          a[row][q] = sine * arp + cosine * arq;
          a[q][row] = a[row][q];
        }
        a[p][p] = cosine ** 2 * app - 2 * sine * cosine * apq + sine ** 2 * aqq;
        a[q][q] = sine ** 2 * app + 2 * sine * cosine * apq + cosine ** 2 * aqq;
        a[p][q] = 0;
        a[q][p] = 0;

        for (let row = 0; row < size; row += 1) {
          const vrp = vectors[row][p];
          const vrq = vectors[row][q];
          vectors[row][p] = cosine * vrp - sine * vrq;
          vectors[row][q] = sine * vrp + cosine * vrq;
        }
      }
    }
    if (maximum < tolerance) break;
  }

  const order = Array.from({length: size}, (_, index) => index)
    .sort((left, right) => a[left][left] - a[right][right]);
  return {
    values: order.map(index => a[index][index]),
    vectors: order.map(column => vectors.map(row => row[column])),
  };
}

export function sshFiniteSpectrum(cells = 18, parameters = {}) {
  const decomposition = diagonalizeSymmetric(sshFiniteHamiltonian(cells, parameters));
  const centralIndices = Array.from({length: decomposition.values.length}, (_, index) => index)
    .sort((left, right) => (
      Math.abs(decomposition.values[left]) - Math.abs(decomposition.values[right])
    ))
    .slice(0, 2);
  const density = Array(2 * cells).fill(0);
  for (const index of centralIndices) {
    decomposition.vectors[index].forEach((amplitude, site) => {
      density[site] += amplitude ** 2 / centralIndices.length;
    });
  }
  const edgeWeight = density[0] + density[1] + density.at(-2) + density.at(-1);
  const inverseParticipation = density.reduce((sum, probability) => sum + probability ** 2, 0);
  return {
    ...decomposition,
    centralIndices,
    centralEnergies: centralIndices.map(index => decomposition.values[index]).sort((a, b) => a - b),
    density,
    edgeWeight,
    inverseParticipation,
  };
}

export {TAU};
