/** Lazy, bounded Worker provider for versioned JSON calculations. */

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${stableStringify(value[key])}`
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export class PyodideComputeProvider {
  #workerUrl;
  #workerFactory;
  #worker = null;
  #active = null;
  #cache = new Map();
  #cacheEntries;
  #maximumTimeoutMs;
  #resultSchemas;
  #runtime;

  constructor({
    workerUrl,
    resultSchemas,
    runtime,
    cacheEntries = 12,
    maximumTimeoutMs = 60000,
    workerFactory = url => new Worker(url, {type:"module", name:"partial-wave-kernel"}),
  }) {
    if (!resultSchemas || !runtime?.name || !runtime?.version) {
      throw new TypeError("provider configuration is incomplete");
    }
    this.#workerUrl = workerUrl;
    this.#resultSchemas = cloneJson(resultSchemas);
    this.#runtime = cloneJson(runtime);
    this.#cacheEntries = cacheEntries;
    this.#maximumTimeoutMs = maximumTimeoutMs;
    this.#workerFactory = workerFactory;
  }

  #ensureWorker() {
    if (this.#worker) return this.#worker;
    const worker = this.#workerFactory(this.#workerUrl);
    worker.addEventListener("message", event => this.#handleMessage(worker, event.data));
    worker.addEventListener("error", () => {
      if (worker !== this.#worker) return;
      if (!this.#stopActive("RUNTIME_LOAD_FAILED")) {
        worker.terminate();
        this.#worker = null;
      }
    });
    this.#worker = worker;
    return worker;
  }

  #cacheKey(request) {
    return stableStringify({
      protocol:request.protocol,
      resultSchema:this.#resultSchemas[request.operation],
      kernelVersion:request.kernelVersion,
      runtime:this.#runtime,
      operation:request.operation,
      input:request.input,
    });
  }

  #errorResponse(request, code) {
    return {
      protocol:request.protocol,
      requestId:request.requestId,
      kernelVersion:request.kernelVersion,
      operation:request.operation,
      ok:false,
      error:{code},
    };
  }

  #handleMessage(worker, message) {
    if (worker !== this.#worker || !this.#active) return;
    if (message.requestId !== this.#active.request.requestId) return;
    if (message?.type === "phase") {
      this.#active.onPhase?.(message.phase);
      return;
    }
    if (message?.type !== "response") return;
    const active = this.#active;
    clearTimeout(active.timer);
    this.#active = null;
    if (message.response?.ok && this.#cacheEntries > 0) {
      this.#cache.delete(active.cacheKey);
      this.#cache.set(active.cacheKey, cloneJson(message.response));
      while (this.#cache.size > this.#cacheEntries) this.#cache.delete(this.#cache.keys().next().value);
    }
    active.resolve({...message.response, provider:{cacheHit:false}});
  }

  #stopActive(code) {
    if (!this.#active) return false;
    const active = this.#active;
    this.#active = null;
    clearTimeout(active.timer);
    this.#worker?.terminate();
    this.#worker = null;
    active.resolve({...this.#errorResponse(active.request, code), provider:{cacheHit:false}});
    return true;
  }

  compute(request, {onPhase} = {}) {
    if (!request || typeof request.requestId !== "string" || !request.requestId) {
      return Promise.reject(new TypeError("requestId is required"));
    }
    if (!this.#resultSchemas[request.operation]) {
      return Promise.resolve(this.#errorResponse(request, "UNSUPPORTED_OPERATION"));
    }
    const timeoutMs = request.limits?.maxElapsedMs;
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > this.#maximumTimeoutMs) {
      return Promise.resolve(this.#errorResponse(request, "LIMIT_EXCEEDED"));
    }
    if (this.#active) this.#stopActive("SUPERSEDED");
    const cacheKey = this.#cacheKey(request);
    const cached = this.#cache.get(cacheKey);
    if (cached) {
      this.#cache.delete(cacheKey);
      this.#cache.set(cacheKey, cached);
      onPhase?.("cache-hit");
      return Promise.resolve({...cloneJson(cached), requestId:request.requestId, provider:{cacheHit:true}});
    }
    return new Promise(resolve => {
      const timer = setTimeout(() => this.#stopActive("TIMEOUT"), timeoutMs);
      this.#active = {request, resolve, onPhase, cacheKey, timer};
      try {
        this.#ensureWorker().postMessage(request);
      } catch {
        this.#stopActive("RUNTIME_LOAD_FAILED");
      }
    });
  }

  cancel(requestId) {
    if (!this.#active || this.#active.request.requestId !== requestId) return false;
    return this.#stopActive("CANCELLED");
  }

  dispose() {
    this.#stopActive("CANCELLED");
    this.#worker?.terminate();
    this.#worker = null;
    this.#cache.clear();
  }
}
