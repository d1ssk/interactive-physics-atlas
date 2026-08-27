/** Lazy worker-backed compute provider with no Pyodide objects in its public API. */
export class PyodideComputeProvider {
  #workerUrl;
  #workerFactory;
  #worker = null;
  #pending = new Map();

  constructor({workerUrl, workerFactory = url => new Worker(url, {type:"module", name:"lie-weight-kernel"})}) {
    this.#workerUrl = workerUrl;
    this.#workerFactory = workerFactory;
  }

  #ensureWorker() {
    if (this.#worker) return this.#worker;
    const worker = this.#workerFactory(this.#workerUrl);
    worker.addEventListener("message", event => this.#handleMessage(event.data));
    worker.addEventListener("error", () => this.#failPending("RUNTIME_LOAD_FAILED"));
    this.#worker = worker;
    return worker;
  }

  #handleMessage(message) {
    if (!message || typeof message.requestId !== "string") return;
    const pending = this.#pending.get(message.requestId);
    if (!pending) return;
    if (message.type === "phase") {
      pending.onPhase?.(message.phase);
      return;
    }
    if (message.type !== "response") return;
    this.#pending.delete(message.requestId);
    pending.resolve(message.response);
  }

  #failPending(code) {
    for (const [requestId, pending] of this.#pending) {
      pending.resolve({
        protocol:pending.request.protocol,
        requestId,
        kernelVersion:pending.request.kernelVersion,
        operation:pending.request.operation,
        ok:false,
        error:{code},
      });
    }
    this.#pending.clear();
    this.#worker?.terminate();
    this.#worker = null;
  }

  compute(request, {onPhase} = {}) {
    if (!request || typeof request.requestId !== "string" || !request.requestId) {
      return Promise.reject(new TypeError("A compute request requires requestId"));
    }
    if (this.#pending.has(request.requestId)) {
      return Promise.reject(new TypeError("Duplicate compute requestId"));
    }
    return new Promise(resolve => {
      this.#pending.set(request.requestId, {request, resolve, onPhase});
      this.#ensureWorker().postMessage(request);
    });
  }

  dispose() {
    this.#failPending("RUNTIME_LOAD_FAILED");
  }
}
