"use strict";
  const PI = Math.PI;
  const BOHR_ENERGY_EV = 13.605693122994;
  const HARTREE_ENERGY_EV = 2 * BOHR_ENERGY_EV;
  const ATOMIC_TIME_AS = 24.188843265857;
  const DOMAIN_VERSION = "physics-atlas.hydrogen-domain.v1";
  const LIMITS = Object.freeze({maxN: 5, maxComponents: 6, maxPointCount: 12000});

  function factorial(value) {
    let result = 1;
    for (let index = 2; index <= value; index += 1) result *= index;
    return result;
  }

  function validateQuantumNumbers(n, l, m) {
    if (!Number.isInteger(n) || n < 1) throw new RangeError("n must be a positive integer");
    if (!Number.isInteger(l) || l < 0 || l >= n) throw new RangeError("l must satisfy 0 <= l < n");
    if (!Number.isInteger(m) || Math.abs(m) > l) throw new RangeError("m must satisfy |m| <= l");
  }

  function generalizedLaguerre(order, alpha, x) {
    if (order === 0) return 1;
    if (order === 1) return 1 + alpha - x;
    let previous = 1;
    let current = 1 + alpha - x;
    for (let k = 2; k <= order; k += 1) {
      const next = ((2 * k - 1 + alpha - x) * current - (k - 1 + alpha) * previous) / k;
      previous = current;
      current = next;
    }
    return current;
  }

  // Includes the Condon-Shortley phase (-1)^m.
  function associatedLegendre(l, m, x) {
    const absM = Math.abs(m);
    let pmm = 1;
    if (absM > 0) {
      const root = Math.sqrt(Math.max(0, 1 - x * x));
      let factor = 1;
      for (let index = 1; index <= absM; index += 1) {
        pmm *= -factor * root;
        factor += 2;
      }
    }
    if (l === absM) return pmm;
    let pmmp1 = x * (2 * absM + 1) * pmm;
    if (l === absM + 1) return pmmp1;
    for (let degree = absM + 2; degree <= l; degree += 1) {
      const pll = (
        (2 * degree - 1) * x * pmmp1 - (degree + absM - 1) * pmm
      ) / (degree - absM);
      pmm = pmmp1;
      pmmp1 = pll;
    }
    return pmmp1;
  }

  function radialWavefunction(n, l, r) {
    validateQuantumNumbers(n, l, 0);
    const rho = (2 * r) / n;
    const normalization = Math.pow(2 / n, 1.5) * Math.sqrt(
      factorial(n - l - 1) / (2 * n * factorial(n + l)),
    );
    return normalization
      * Math.exp(-rho / 2)
      * Math.pow(rho, l)
      * generalizedLaguerre(n - l - 1, 2 * l + 1, rho);
  }

  function complexSphericalHarmonic(l, m, theta, phi) {
    if (!Number.isInteger(l) || l < 0 || !Number.isInteger(m) || Math.abs(m) > l) {
      throw new RangeError("spherical harmonic requires l >= 0 and |m| <= l");
    }
    const absM = Math.abs(m);
    const normalization = Math.sqrt(
      ((2 * l + 1) / (4 * PI)) * (factorial(l - absM) / factorial(l + absM)),
    );
    const amplitude = normalization * associatedLegendre(l, absM, Math.cos(theta));
    const baseReal = amplitude * Math.cos(absM * phi);
    const baseImaginary = amplitude * Math.sin(absM * phi);
    if (m >= 0) return {re: baseReal, im: baseImaginary};
    const parity = absM % 2 === 0 ? 1 : -1;
    return {re: parity * baseReal, im: -parity * baseImaginary};
  }

  function realSphericalHarmonic(l, m, theta, phi) {
    if (m === 0) return complexSphericalHarmonic(l, 0, theta, phi).re;
    const harmonic = complexSphericalHarmonic(l, Math.abs(m), theta, phi);
    return Math.SQRT2 * (m > 0 ? harmonic.re : harmonic.im);
  }

  function wavefunctionSpherical(n, l, m, r, theta, phi, basis = "real") {
    validateQuantumNumbers(n, l, m);
    const radial = radialWavefunction(n, l, r);
    if (basis === "real") {
      return {re: radial * realSphericalHarmonic(l, m, theta, phi), im: 0};
    }
    const angular = complexSphericalHarmonic(l, m, theta, phi);
    return {re: radial * angular.re, im: radial * angular.im};
  }

  function probabilityDensity(n, l, m, r, theta, phi, basis = "real") {
    const psi = wavefunctionSpherical(n, l, m, r, theta, phi, basis);
    return psi.re * psi.re + psi.im * psi.im;
  }

  function complexMultiply(left, right) {
    return {
      re: left.re * right.re - left.im * right.im,
      im: left.re * right.im + left.im * right.re,
    };
  }

  function complexAbsSquared(value) {
    return value.re * value.re + value.im * value.im;
  }

  function normalizeComponents(components) {
    if (!Array.isArray(components)) throw new TypeError("components must be an array");
    if (components.length > LIMITS.maxComponents) {
      throw new RangeError(`at most ${LIMITS.maxComponents} components are supported`);
    }
    const combined = new Map();
    const bases = new Set();
    for (const component of components) {
      const {n, l, m, basis = "real"} = component;
      validateQuantumNumbers(n, l, m);
      if (basis !== "real" && basis !== "complex") {
        throw new RangeError('basis must be "real" or "complex"');
      }
      bases.add(basis);
      const amplitude = Number(component.amplitude);
      const phase = Number(component.phase || 0);
      if (!Number.isFinite(amplitude) || amplitude < 0) {
        throw new RangeError("component amplitude must be finite and non-negative");
      }
      if (!Number.isFinite(phase)) throw new RangeError("component phase must be finite");
      if (amplitude === 0) continue;
      const key = `${basis}:${n}:${l}:${m}`;
      const previous = combined.get(key) || {n, l, m, basis, re: 0, im: 0};
      previous.re += amplitude * Math.cos(phase);
      previous.im += amplitude * Math.sin(phase);
      combined.set(key, previous);
    }
    if (bases.size > 1) throw new RangeError("all components must use the same angular basis");
    const values = [...combined.values()].filter(value => complexAbsSquared(value) > 1e-24);
    const normSquared = values.reduce((sum, value) => sum + complexAbsSquared(value), 0);
    if (!(normSquared > 0)) throw new RangeError("at least one non-zero component is required");
    const norm = Math.sqrt(normSquared);
    return values.map(value => {
      const coefficient = {re: value.re / norm, im: value.im / norm};
      return {
        n: value.n,
        l: value.l,
        m: value.m,
        basis: value.basis,
        coefficient,
        weight: complexAbsSquared(coefficient),
      };
    });
  }

  function energyHartree(n) {
    if (!Number.isInteger(n) || n < 1) throw new RangeError("n must be a positive integer");
    return -1 / (2 * n * n);
  }

  function timeEvolvedCoefficient(component, timeAu) {
    if (!Number.isFinite(timeAu)) throw new RangeError("time must be finite");
    const angle = -energyHartree(component.n) * timeAu;
    return complexMultiply(component.coefficient, {re: Math.cos(angle), im: Math.sin(angle)});
  }

  function normalizedComponents(components) {
    return components.length > 0 && components.every(component => component.coefficient)
      ? components
      : normalizeComponents(components);
  }

  function superpositionWavefunction(components, r, theta, phi, timeAu = 0) {
    const normalized = normalizedComponents(components);
    const total = {re: 0, im: 0};
    for (const component of normalized) {
      const basisValue = wavefunctionSpherical(
        component.n,
        component.l,
        component.m,
        r,
        theta,
        phi,
        component.basis,
      );
      const term = complexMultiply(timeEvolvedCoefficient(component, timeAu), basisValue);
      total.re += term.re;
      total.im += term.im;
    }
    return total;
  }

  function superpositionDensity(components, r, theta, phi, timeAu = 0) {
    return complexAbsSquared(superpositionWavefunction(components, r, theta, phi, timeAu));
  }

  function radialExtent(n) {
    return 4 * n * n + 2 * n;
  }

  function makeRadialDistribution(n, l, sampleCount = 4096) {
    validateQuantumNumbers(n, l, 0);
    const rMax = radialExtent(n);
    const radii = new Float64Array(sampleCount + 1);
    const probabilities = new Float64Array(sampleCount + 1);
    const cdf = new Float64Array(sampleCount + 1);
    const step = rMax / sampleCount;
    for (let index = 0; index <= sampleCount; index += 1) {
      const r = index * step;
      const radial = radialWavefunction(n, l, r);
      radii[index] = r;
      probabilities[index] = r * r * radial * radial;
      if (index > 0) {
        cdf[index] = cdf[index - 1]
          + 0.5 * step * (probabilities[index - 1] + probabilities[index]);
      }
    }
    const capturedProbability = cdf[sampleCount];
    for (let index = 1; index <= sampleCount; index += 1) cdf[index] /= capturedProbability;
    return {rMax, radii, probabilities, cdf, capturedProbability};
  }

  function angularValue(l, m, theta, phi, basis) {
    if (basis === "real") return realSphericalHarmonic(l, m, theta, phi);
    return complexSphericalHarmonic(l, m, theta, phi);
  }

  function angularDensity(l, m, theta, phi, basis) {
    const value = angularValue(l, m, theta, phi, basis);
    return basis === "real" ? value * value : value.re * value.re + value.im * value.im;
  }

  function angularDensityMaximum(l, m, basis) {
    let maximum = 0;
    const thetaSteps = 100;
    const phiSteps = Math.max(72, 48 * (Math.abs(m) + 1));
    for (let ti = 0; ti <= thetaSteps; ti += 1) {
      const theta = PI * ti / thetaSteps;
      for (let pi = 0; pi < phiSteps; pi += 1) {
        maximum = Math.max(maximum, angularDensity(l, m, theta, 2 * PI * pi / phiSteps, basis));
      }
    }
    return maximum * 1.002 + Number.EPSILON;
  }

  function seededRandom(seed) {
    let state = seed >>> 0 || 0x6d2b79f5;
    return function random() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function inverseCdf(distribution, probability) {
    const {cdf, radii} = distribution;
    let low = 0;
    let high = cdf.length - 1;
    while (low + 1 < high) {
      const middle = (low + high) >> 1;
      if (cdf[middle] < probability) low = middle;
      else high = middle;
    }
    const width = cdf[high] - cdf[low];
    const fraction = width > 0 ? (probability - cdf[low]) / width : 0;
    return radii[low] + fraction * (radii[high] - radii[low]);
  }

  function sampleOrbital({n, l, m, basis = "real", count = 7000, seed = 1}) {
    validateQuantumNumbers(n, l, m);
    const distribution = makeRadialDistribution(n, l);
    const maximum = angularDensityMaximum(l, m, basis);
    const random = seededRandom(seed);
    const points = [];
    let attempts = 0;
    const attemptLimit = count * 120;
    while (points.length < count && attempts < attemptLimit) {
      attempts += 1;
      const cosTheta = 2 * random() - 1;
      const theta = Math.acos(cosTheta);
      const phi = 2 * PI * random();
      if (random() * maximum > angularDensity(l, m, theta, phi, basis)) continue;
      const r = inverseCdf(distribution, random());
      const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
      const psi = wavefunctionSpherical(n, l, m, r, theta, phi, basis);
      points.push({
        x: r * sinTheta * Math.cos(phi),
        y: r * sinTheta * Math.sin(phi),
        z: r * cosTheta,
        phase: Math.atan2(psi.im, psi.re),
        sign: psi.re >= 0 ? 1 : -1,
      });
    }
    return {points, distribution, attempts};
  }

  function sampleBasisPosition(component, cache, random) {
    const entry = cache.get(`${component.basis}:${component.n}:${component.l}:${component.m}`);
    for (;;) {
      const cosTheta = 2 * random() - 1;
      const theta = Math.acos(cosTheta);
      const phi = 2 * PI * random();
      if (random() * entry.maximum > angularDensity(
        component.l,
        component.m,
        theta,
        phi,
        component.basis,
      )) continue;
      const r = inverseCdf(entry.distribution, random());
      const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
      return {
        x: r * sinTheta * Math.cos(phi),
        y: r * sinTheta * Math.sin(phi),
        z: r * cosTheta,
        r,
        theta,
        phi,
      };
    }
  }

  // Positions are drawn from q = sum_i |c_i|^2 |phi_i|^2.  The viewer uses
  // density/q as an importance weight, so interference can evolve without
  // resampling the cloud on every animation frame.
  function sampleSuperposition({components, count = 7000, seed = 1}) {
    if (!Number.isInteger(count) || count < 1 || count > LIMITS.maxPointCount) {
      throw new RangeError(`count must be between 1 and ${LIMITS.maxPointCount}`);
    }
    const normalized = normalizeComponents(components);
    if (normalized.some(component => component.n > LIMITS.maxN)) {
      throw new RangeError(`n must not exceed ${LIMITS.maxN} in the renderer`);
    }
    const random = seededRandom(seed);
    const cache = new Map();
    for (const component of normalized) {
      const key = `${component.basis}:${component.n}:${component.l}:${component.m}`;
      cache.set(key, {
        distribution: makeRadialDistribution(component.n, component.l),
        maximum: angularDensityMaximum(component.l, component.m, component.basis),
      });
    }
    const points = [];
    for (let index = 0; index < count; index += 1) {
      let choice = random();
      let selected = normalized[normalized.length - 1];
      for (const component of normalized) {
        choice -= component.weight;
        if (choice <= 0) {
          selected = component;
          break;
        }
      }
      const point = sampleBasisPosition(selected, cache, random);
      point.values = normalized.map(component => wavefunctionSpherical(
        component.n,
        component.l,
        component.m,
        point.r,
        point.theta,
        point.phi,
        component.basis,
      ));
      point.proposalDensity = normalized.reduce(
        (sum, component, componentIndex) => {
          const entry = cache.get(
            `${component.basis}:${component.n}:${component.l}:${component.m}`,
          );
          if (point.r > entry.distribution.rMax) return sum;
          return sum + component.weight
            * complexAbsSquared(point.values[componentIndex])
            / entry.distribution.capturedProbability;
        },
        0,
      );
      points.push(point);
    }
    return {
      points,
      components: normalized,
      rMax: Math.max(...normalized.map(component => radialExtent(component.n))),
    };
  }

  function wavefunctionAtSample(point, components, timeAu = 0) {
    const normalized = normalizedComponents(components);
    if (!point.values || point.values.length !== normalized.length) {
      return superpositionWavefunction(normalized, point.r, point.theta, point.phi, timeAu);
    }
    const total = {re: 0, im: 0};
    for (let index = 0; index < normalized.length; index += 1) {
      const term = complexMultiply(
        timeEvolvedCoefficient(normalized[index], timeAu),
        point.values[index],
      );
      total.re += term.re;
      total.im += term.im;
    }
    return total;
  }

  function importanceWeightAtSample(point, components, timeAu = 0) {
    if (!(point.proposalDensity > 0)) return 0;
    return complexAbsSquared(wavefunctionAtSample(point, components, timeAu))
      / point.proposalDensity;
  }

  function radialProbability(components, r, timeAu = 0) {
    const normalized = normalizedComponents(components);
    const angularChannels = new Map();
    for (const component of normalized) {
      const key = `${component.basis}:${component.l}:${component.m}`;
      const total = angularChannels.get(key) || {re: 0, im: 0};
      const coefficient = timeEvolvedCoefficient(component, timeAu);
      const radial = radialWavefunction(component.n, component.l, r);
      total.re += coefficient.re * radial;
      total.im += coefficient.im * radial;
      angularChannels.set(key, total);
    }
    let probability = 0;
    for (const value of angularChannels.values()) probability += complexAbsSquared(value);
    return r * r * probability;
  }

  function expectationEnergyHartree(components) {
    return normalizedComponents(components).reduce(
      (sum, component) => sum + component.weight * energyHartree(component.n),
      0,
    );
  }

  function energyUncertaintyHartree(components) {
    const normalized = normalizedComponents(components);
    const mean = expectationEnergyHartree(normalized);
    const meanSquare = normalized.reduce(
      (sum, component) => sum + component.weight * energyHartree(component.n) ** 2,
      0,
    );
    const variance = Math.max(0, meanSquare - mean * mean);
    if (variance <= 16 * Number.EPSILON * Math.max(1, meanSquare)) return 0;
    return Math.sqrt(variance);
  }

  function shortestBeatPeriodAu(components) {
    const energies = [...new Set(normalizedComponents(components).map(
      component => energyHartree(component.n),
    ))];
    let maximumDifference = 0;
    for (const left of energies) {
      for (const right of energies) maximumDifference = Math.max(maximumDifference, Math.abs(left - right));
    }
    return maximumDifference > 0 ? 2 * PI / maximumDifference : Infinity;
  }

  function energyEv(n) {
    if (!Number.isInteger(n) || n < 1) throw new RangeError("n must be a positive integer");
    return -BOHR_ENERGY_EV / (n * n);
  }

  function expectationRadius(n, l) {
    validateQuantumNumbers(n, l, 0);
    return (3 * n * n - l * (l + 1)) / 2;
  }

  export {
    ATOMIC_TIME_AS,
    DOMAIN_VERSION,
    HARTREE_ENERGY_EV,
    LIMITS,
    angularDensity,
    associatedLegendre,
    complexAbsSquared,
    complexMultiply,
    complexSphericalHarmonic,
    energyEv,
    energyHartree,
    energyUncertaintyHartree,
    expectationRadius,
    expectationEnergyHartree,
    factorial,
    generalizedLaguerre,
    importanceWeightAtSample,
    makeRadialDistribution,
    normalizeComponents,
    probabilityDensity,
    radialExtent,
    radialProbability,
    radialWavefunction,
    realSphericalHarmonic,
    sampleOrbital,
    sampleSuperposition,
    shortestBeatPeriodAu,
    superpositionDensity,
    superpositionWavefunction,
    timeEvolvedCoefficient,
    validateQuantumNumbers,
    wavefunctionSpherical,
    wavefunctionAtSample,
  };
