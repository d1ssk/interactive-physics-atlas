export const PROTOCOL = "physics-atlas.ising.v1";
export const KERNEL_VERSION = "1.0.0";
export const SNAPSHOT_SCHEMA = "physics-atlas.ising-snapshot.v1";
export const MAX_SITES = 9216;
export const MAX_SWEEPS_PER_BATCH = 8;
export const MAX_SEED = 0xffffffff;
export const PUBLISHED_SIZES = {
  1: new Set([128, 256, 512]),
  2: new Set([32, 48, 64, 96]),
  3: new Set([10, 14, 18, 20]),
};

const UINT32_SCALE = 4294967296;
const ZERO_SEED_REPLACEMENT = 0x6d2b79f5;

export class XorShift32 {
  constructor(seed) {
    const state = Number(seed) >>> 0;
    this.state = state || ZERO_SEED_REPLACEMENT;
  }

  nextUint32() {
    let value = this.state >>> 0;
    value = (value ^ (value << 13)) >>> 0;
    value = (value ^ (value >>> 17)) >>> 0;
    value = (value ^ (value << 5)) >>> 0;
    this.state = value >>> 0;
    return this.state;
  }

  random() {
    return this.nextUint32() / UINT32_SCALE;
  }

  randBelow(upper) {
    if (!Number.isSafeInteger(upper) || upper <= 0) throw new RangeError("invalid upper bound");
    return Math.floor((this.nextUint32() * upper) / UINT32_SCALE);
  }
}

function requireInteger(value, name, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) throw new RangeError(`invalid ${name}`);
  return value;
}

function requireTemperature(value) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError("invalid temperature");
  return Number(value);
}

function validateLattice(dimension, size) {
  if (!PUBLISHED_SIZES[dimension]?.has(size)) throw new RangeError("unsupported lattice shape");
  if (size ** dimension > MAX_SITES) throw new RangeError("lattice exceeds site limit");
}

export class IsingModel {
  constructor({dimension, size, temperature, seed, initialState = "random"}) {
    validateLattice(dimension, size);
    this.dimension = dimension;
    this.size = size;
    this.siteCount = size ** dimension;
    this.temperature = requireTemperature(temperature);
    const validatedSeed = requireInteger(seed, "seed");
    if (validatedSeed > MAX_SEED) throw new RangeError("invalid seed");
    this.rng = new XorShift32(validatedSeed);
    this.spins = new Int8Array(this.siteCount);
    if (initialState === "random") {
      for (let index = 0; index < this.siteCount; index += 1) {
        this.spins[index] = this.rng.random() < 0.5 ? -1 : 1;
      }
    } else if (initialState === "aligned-up" || initialState === "aligned-down") {
      this.spins.fill(initialState === "aligned-up" ? 1 : -1);
    } else {
      throw new RangeError("unsupported initial state");
    }
    this.magnetizationTotal = this.spins.reduce((total, spin) => total + spin, 0);
    this.energyTotal = this.computeTotalEnergy();
    this.sweeps = 0;
    this.acceptanceRate = 0;
  }

  setTemperature(temperature) {
    this.temperature = requireTemperature(temperature);
  }

  neighborSum(index) {
    let total = 0;
    let stride = 1;
    for (let axis = 0; axis < this.dimension; axis += 1) {
      const coordinate = Math.floor(index / stride) % this.size;
      const negative = coordinate === 0 ? index + (this.size - 1) * stride : index - stride;
      const positive = coordinate === this.size - 1 ? index - (this.size - 1) * stride : index + stride;
      total += this.spins[negative] + this.spins[positive];
      stride *= this.size;
    }
    return total;
  }

  deltaEnergy(index) {
    return 2 * this.spins[index] * this.neighborSum(index);
  }

  attemptFlip() {
    const index = this.rng.randBelow(this.siteCount);
    const oldSpin = this.spins[index];
    const deltaEnergy = this.deltaEnergy(index);
    const accepted = deltaEnergy <= 0 || this.rng.random() < Math.exp(-deltaEnergy / this.temperature);
    if (accepted) {
      this.spins[index] = -oldSpin;
      this.magnetizationTotal -= 2 * oldSpin;
      this.energyTotal += deltaEnergy;
    }
    return {index, deltaEnergy, oldSpin, accepted};
  }

  metropolisSweep() {
    let accepted = 0;
    for (let attempt = 0; attempt < this.siteCount; attempt += 1) {
      if (this.attemptFlip().accepted) accepted += 1;
    }
    this.sweeps += 1;
    this.acceptanceRate = accepted / this.siteCount;
    return this.acceptanceRate;
  }

  advance(sweeps) {
    requireInteger(sweeps, "sweep count", 1);
    if (sweeps > MAX_SWEEPS_PER_BATCH) throw new RangeError("sweep batch exceeds limit");
    for (let sweep = 0; sweep < sweeps; sweep += 1) this.metropolisSweep();
  }

  computeTotalEnergy() {
    let energy = 0;
    for (let index = 0; index < this.siteCount; index += 1) {
      let stride = 1;
      for (let axis = 0; axis < this.dimension; axis += 1) {
        const coordinate = Math.floor(index / stride) % this.size;
        const positive = coordinate === this.size - 1 ? index - (this.size - 1) * stride : index + stride;
        energy -= this.spins[index] * this.spins[positive];
        stride *= this.size;
      }
    }
    return energy;
  }

  invariantReport() {
    const magnetization = this.spins.reduce((total, spin) => total + spin, 0);
    return {
      spinsValid: this.spins.every(spin => spin === -1 || spin === 1),
      magnetizationConsistent: magnetization === this.magnetizationTotal,
      energyConsistent: this.computeTotalEnergy() === this.energyTotal,
    };
  }
}

export class IsingKernel {
  constructor() {
    this.model = null;
    this.generationId = -1;
    this.snapshotId = 0;
  }

  handle(request) {
    if (request?.protocol !== PROTOCOL) throw new RangeError("unsupported protocol");
    if (request?.kernelVersion !== KERNEL_VERSION) throw new RangeError("unsupported kernel version");
    requireInteger(request.requestId, "request ID");
    const generationId = requireInteger(request.generationId, "generation ID");
    const input = request.input;
    if (!input || typeof input !== "object") throw new TypeError("input must be an object");

    if (request.operation === "ising.initialize.v1" || request.operation === "ising.reset.v1") {
      this.model = new IsingModel(input);
      this.generationId = generationId;
      this.snapshotId = 0;
    } else {
      if (!this.model) throw new Error("kernel is not initialized");
      if (generationId !== this.generationId) throw new Error("stale generation");
      if (request.operation === "ising.configure.v1") {
        this.model.setTemperature(input.temperature);
      } else if (request.operation === "ising.advance.v1") {
        this.model.advance(input.sweeps);
        this.snapshotId += 1;
      } else {
        throw new RangeError("unsupported operation");
      }
    }

    const model = this.model;
    const spins = model.spins.slice();
    return {
      protocol: PROTOCOL,
      kernelVersion: KERNEL_VERSION,
      operation: request.operation,
      requestId: request.requestId,
      generationId: this.generationId,
      ok: true,
      snapshot: {
        schema: SNAPSHOT_SCHEMA,
        dimension: model.dimension,
        shape: Array(model.dimension).fill(model.size),
        siteCount: model.siteCount,
        temperature: model.temperature,
        sweeps: model.sweeps,
        magnetizationTotal: model.magnetizationTotal,
        magnetization: model.magnetizationTotal / model.siteCount,
        energyTotal: model.energyTotal,
        energyPerSpin: model.energyTotal / model.siteCount,
        acceptanceRate: model.acceptanceRate,
        snapshotId: this.snapshotId,
      },
      spinsBuffer: spins.buffer,
    };
  }
}
