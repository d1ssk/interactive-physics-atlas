const VALID_OPERATIONS = new Set([
  "ising.initialize.v1",
  "ising.advance.v1",
  "ising.configure.v1",
  "ising.reset.v1",
]);

export class IsingWorkerProvider {
  constructor({
    workerUrl = new URL("./ising-compute-worker-v1.mjs", import.meta.url),
    workerFactory = url => new Worker(url, {type: "module"}),
    protocol = "physics-atlas.ising.v1",
    kernelVersion = "1.0.0",
    snapshotSchema = "physics-atlas.ising-snapshot.v1",
  } = {}) {
    this.protocol = protocol;
    this.kernelVersion = kernelVersion;
    this.snapshotSchema = snapshotSchema;
    this.workerUrl = workerUrl;
    this.workerFactory = workerFactory;
    this.pending = new Map();
    this.disposed = false;
    this.startWorker();
  }

  startWorker() {
    const worker = this.workerFactory(this.workerUrl);
    this.worker = worker;
    worker.addEventListener("message", event => {
      if (worker === this.worker) this.receive(event.data);
    });
    worker.addEventListener("error", () => {
      if (worker !== this.worker || this.disposed) return;
      worker.terminate();
      this.failAll("WORKER_FAILED");
      this.startWorker();
    });
  }

  compute(request) {
    if (this.disposed) return Promise.reject(new Error("provider is disposed"));
    this.validateRequest(request);
    return new Promise((resolve, reject) => {
      this.pending.set(request.requestId, {request, resolve, reject});
      this.worker.postMessage(request);
    });
  }

  validateRequest(request) {
    if (request?.protocol !== this.protocol) throw new TypeError("invalid protocol");
    if (request?.kernelVersion !== this.kernelVersion) throw new TypeError("invalid kernel version");
    if (!VALID_OPERATIONS.has(request.operation)) throw new TypeError("invalid operation");
    if (!Number.isSafeInteger(request.requestId) || request.requestId < 0) throw new TypeError("invalid request ID");
    if (!Number.isSafeInteger(request.generationId) || request.generationId < 0) throw new TypeError("invalid generation ID");
  }

  receive(response) {
    const pending = this.pending.get(response?.requestId);
    if (!pending) return;
    this.pending.delete(response.requestId);
    try {
      this.validateResponse(response, pending.request);
      pending.resolve({...response, spins: new Int8Array(response.spinsBuffer)});
    } catch (error) {
      pending.reject(error);
    }
  }

  validateResponse(response, request) {
    if (response?.protocol !== this.protocol || response.kernelVersion !== this.kernelVersion) throw new TypeError("runtime version mismatch");
    if (response.operation !== request.operation || response.generationId !== request.generationId) throw new TypeError("response identity mismatch");
    if (!response.ok) {
      const error = new Error(response.error?.code ?? "CALCULATION_FAILED");
      error.code = response.error?.code ?? "CALCULATION_FAILED";
      throw error;
    }
    const snapshot = response.snapshot;
    if (snapshot?.schema !== this.snapshotSchema) throw new TypeError("snapshot schema mismatch");
    if (!Number.isSafeInteger(snapshot.siteCount) || snapshot.siteCount <= 0) throw new TypeError("invalid site count");
    if (!(response.spinsBuffer instanceof ArrayBuffer) || response.spinsBuffer.byteLength !== snapshot.siteCount) throw new TypeError("invalid spin buffer");
    const spins = new Int8Array(response.spinsBuffer);
    if (!spins.every(spin => spin === -1 || spin === 1)) throw new TypeError("invalid spin value");
    if (!Number.isFinite(snapshot.acceptanceRate) || snapshot.acceptanceRate < 0 || snapshot.acceptanceRate > 1) throw new TypeError("invalid acceptance rate");
  }

  failAll(code) {
    for (const {reject} of this.pending.values()) reject(new Error(code));
    this.pending.clear();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.terminate();
    this.failAll("PROVIDER_DISPOSED");
  }
}
