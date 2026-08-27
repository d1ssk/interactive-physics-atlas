/**
 * Bounded, lazy Worker-backed compute provider.
 *
 * The public boundary contains only language-neutral JSON. Because Pyodide's
 * Python execution is synchronous inside the Worker, cancellation, timeout,
 * and supersession terminate that Worker and recreate it on the next request.
 */

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
  #resultSchema;
  #runtime;
  #now;
  #setTimeout;
  #clearTimeout;

  constructor({
    workerUrl,
    resultSchema,
    runtime,
    cacheEntries = 16,
    maximumTimeoutMs = 60000,
    workerFactory = url => new Worker(url, {type:"module", name:"lie-weight-kernel"}),
    now = () => performance.now(),
    setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    clearTimeoutFn = timer => clearTimeout(timer),
  }) {
    if (!resultSchema || !runtime?.name || !runtime?.version) {
      throw new TypeError("The provider requires resultSchema and runtime identity");
    }
    if (!Number.isInteger(cacheEntries) || cacheEntries < 0) {
      throw new TypeError("cacheEntries must be a non-negative integer");
    }
    if (!Number.isInteger(maximumTimeoutMs) || maximumTimeoutMs <= 0) {
      throw new TypeError("maximumTimeoutMs must be a positive integer");
    }
    this.#workerUrl = workerUrl;
    this.#resultSchema = resultSchema;
    this.#runtime = cloneJson(runtime);
    this.#cacheEntries = cacheEntries;
    this.#maximumTimeoutMs = maximumTimeoutMs;
    this.#workerFactory = workerFactory;
    this.#now = now;
    this.#setTimeout = setTimeoutFn;
    this.#clearTimeout = clearTimeoutFn;
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
      resultSchema:this.#resultSchema,
      kernelVersion:request.kernelVersion,
      runtime:this.#runtime,
      operation:request.operation,
      input:request.input,
      limits:{
        maxCandidates:request.limits?.maxCandidates,
        maxResultWeights:request.limits?.maxResultWeights,
      },
    });
  }

  #readCache(key) {
    const cached = this.#cache.get(key);
    if (!cached) return null;
    this.#cache.delete(key);
    this.#cache.set(key, cached);
    return cloneJson(cached);
  }

  #writeCache(key, response) {
    if (!this.#cacheEntries) return;
    this.#cache.delete(key);
    this.#cache.set(key, cloneJson(response));
    while (this.#cache.size > this.#cacheEntries) {
      this.#cache.delete(this.#cache.keys().next().value);
    }
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

  #decorate(response, requestId, cacheHit, elapsedMs) {
    return {
      ...response,
      requestId,
      provider:{cacheHit, elapsedMs:Math.max(0, Math.round(elapsedMs))},
    };
  }

  #handleMessage(worker, message) {
    if (worker !== this.#worker || !this.#active) return;
    if (!message || message.requestId !== this.#active.request.requestId) return;
    if (message.type === "phase") {
      this.#active.onPhase?.(message.phase);
      return;
    }
    if (message.type !== "response") return;
    const active = this.#active;
    this.#clearTimeout(active.timer);
    this.#active = null;
    const elapsedMs = this.#now() - active.startedAt;
    if (message.response?.ok) this.#writeCache(active.cacheKey, message.response);
    active.resolve(this.#decorate(message.response, active.request.requestId, false, elapsedMs));
  }

  #stopActive(code) {
    if (!this.#active) return false;
    const active = this.#active;
    this.#active = null;
    this.#clearTimeout(active.timer);
    this.#worker?.terminate();
    this.#worker = null;
    const response = this.#errorResponse(active.request, code);
    active.resolve(this.#decorate(
      response, active.request.requestId, false, this.#now() - active.startedAt,
    ));
    return true;
  }

  compute(request, {onPhase} = {}) {
    if (!request || typeof request.requestId !== "string" || !request.requestId) {
      return Promise.reject(new TypeError("A compute request requires requestId"));
    }
    const timeoutMs = request.limits?.maxElapsedMs;
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
      return Promise.resolve(this.#errorResponse(request, "INVALID_REQUEST"));
    }
    if (timeoutMs > this.#maximumTimeoutMs) {
      return Promise.resolve(this.#errorResponse(request, "LIMIT_EXCEEDED"));
    }

    if (this.#active) this.#stopActive("SUPERSEDED");
    const cacheKey = this.#cacheKey(request);
    const cached = this.#readCache(cacheKey);
    if (cached) {
      onPhase?.("cache-hit");
      return Promise.resolve(this.#decorate(cached, request.requestId, true, 0));
    }

    return new Promise(resolve => {
      const startedAt = this.#now();
      const timer = this.#setTimeout(() => this.#stopActive("TIMEOUT"), timeoutMs);
      this.#active = {request, resolve, onPhase, cacheKey, startedAt, timer};
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

  clearCache() {
    this.#cache.clear();
  }

  get cacheSize() {
    return this.#cache.size;
  }

  dispose() {
    this.#stopActive("CANCELLED");
    this.#worker?.terminate();
    this.#worker = null;
    this.clearCache();
  }
}
