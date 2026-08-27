import assert from "node:assert/strict";
import test from "node:test";

import {PyodideComputeProvider} from "../runtime/pyodide-compute-provider-v3.mjs";

class FakeWorker {
  constructor() {
    this.listeners = new Map();
    this.requests = [];
    this.terminated = false;
  }

  addEventListener(type, callback) {
    this.listeners.set(type, callback);
  }

  postMessage(request) {
    this.requests.push(request);
  }

  terminate() {
    this.terminated = true;
  }

  emit(type, data = undefined) {
    this.listeners.get(type)?.(type === "message" ? {data} : data);
  }
}

function fakeClock() {
  let now = 0;
  let nextTimer = 0;
  const timers = new Map();
  return {
    now: () => now,
    setTimeoutFn(callback, delay) {
      const timer = ++nextTimer;
      timers.set(timer, {callback, deadline:now + delay});
      return timer;
    },
    clearTimeoutFn(timer) {
      timers.delete(timer);
    },
    advance(milliseconds) {
      now += milliseconds;
      for (const [timer, value] of [...timers]) {
        if (value.deadline <= now) {
          timers.delete(timer);
          value.callback();
        }
      }
    },
  };
}

function request(requestId, labels = [4, 0], overrides = {}) {
  return {
    protocol:"physics-atlas.compute.v1",
    requestId,
    kernelVersion:"1.1.0",
    operation:"lie.weight-diagram.v1",
    input:{system:"A2", highestDynkin:labels},
    limits:{maxCandidates:250000, maxResultWeights:20000, maxElapsedMs:30000},
    ...overrides,
  };
}

function tensorRequest(requestId) {
  return {
    protocol:"physics-atlas.compute.v1",
    requestId,
    kernelVersion:"1.1.0",
    operation:"lie.tensor-product.v1",
    input:{system:"A2", factors:[[2, 0], [1, 1]]},
    limits:{
      maxCandidates:250000,
      maxWeightPairs:250000,
      maxResultWeights:20000,
      maxElapsedMs:30000,
    },
  };
}

function successResponse(value) {
  return {
    protocol:value.protocol,
    requestId:value.requestId,
    kernelVersion:value.kernelVersion,
    operation:value.operation,
    ok:true,
    result:{schema:"physics-atlas.weight-diagram.v1", labels:value.input.highestDynkin},
    runtime:{name:"pyodide", version:"test", pythonVersion:"test", numpyVersion:"test"},
  };
}

function tensorSuccessResponse(value) {
  return {
    protocol:value.protocol,
    requestId:value.requestId,
    kernelVersion:value.kernelVersion,
    operation:value.operation,
    ok:true,
    result:{schema:"physics-atlas.tensor-product.v1"},
    dependencies:{weights:{}},
    runtime:{name:"pyodide", version:"test", pythonVersion:"test", numpyVersion:"test"},
  };
}

function harness(options = {}) {
  const workers = [];
  const clock = fakeClock();
  const provider = new PyodideComputeProvider({
    workerUrl:new URL("https://example.test/worker.mjs"),
    resultSchemas:{
      "lie.weight-diagram.v1":"physics-atlas.weight-diagram.v1",
      "lie.tensor-product.v1":"physics-atlas.tensor-product.v1",
    },
    runtime:{name:"pyodide", version:"test"},
    workerFactory:() => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    },
    now:clock.now,
    setTimeoutFn:clock.setTimeoutFn,
    clearTimeoutFn:clock.clearTimeoutFn,
    ...options,
  });
  return {provider, workers, clock};
}

test("successful responses are cached by versioned calculation identity", async () => {
  const {provider, workers, clock} = harness();
  const phases = [];
  const firstRequest = request("first");
  const first = provider.compute(firstRequest, {onPhase:phase => phases.push(phase)});
  clock.advance(17);
  workers[0].emit("message", {type:"phase", requestId:"first", phase:"calculating"});
  workers[0].emit("message", {
    type:"response", requestId:"first", response:successResponse(firstRequest),
  });

  const firstResponse = await first;
  assert.deepEqual(phases, ["calculating"]);
  assert.deepEqual(firstResponse.provider, {cacheHit:false, elapsedMs:17});
  assert.equal(provider.cacheSize, 1);

  const cachedPhases = [];
  const cachedResponse = await provider.compute(request("second"), {
    onPhase:phase => cachedPhases.push(phase),
  });
  assert.equal(workers.length, 1);
  assert.equal(workers[0].requests.length, 1);
  assert.equal(cachedResponse.requestId, "second");
  assert.deepEqual(cachedResponse.provider, {cacheHit:true, elapsedMs:0});
  assert.deepEqual(cachedPhases, ["cache-hit"]);
});

test("operation and result schema separate weight and tensor-product cache entries", async () => {
  const {provider, workers} = harness();
  const weight = request("weight");
  const weightResult = provider.compute(weight);
  workers[0].emit("message", {
    type:"response", requestId:"weight", response:successResponse(weight),
  });
  await weightResult;

  const tensor = tensorRequest("tensor");
  const tensorResult = provider.compute(tensor);
  assert.equal(workers[0].requests.length, 2);
  workers[0].emit("message", {
    type:"response", requestId:"tensor", response:tensorSuccessResponse(tensor),
  });
  assert.equal((await tensorResult).provider.cacheHit, false);

  const cached = await provider.compute({...tensor, requestId:"tensor-cached"});
  assert.equal(cached.provider.cacheHit, true);
  assert.equal(cached.requestId, "tensor-cached");
  assert.equal(workers[0].requests.length, 2);

  const weightCached = await provider.compute({...weight, requestId:"weight-cached"});
  assert.equal(weightCached.provider.cacheHit, true);
  assert.equal(weightCached.requestId, "weight-cached");
  assert.equal(workers[0].requests.length, 2);
});

test("a newer request supersedes synchronous Worker work and ignores stale messages", async () => {
  const {provider, workers} = harness();
  const firstRequest = request("first");
  const secondRequest = request("second", [5, 0]);
  const first = provider.compute(firstRequest);
  const second = provider.compute(secondRequest);

  assert.equal(workers.length, 2);
  assert.equal(workers[0].terminated, true);
  assert.equal((await first).error.code, "SUPERSEDED");
  workers[0].emit("message", {
    type:"response", requestId:"first", response:successResponse(firstRequest),
  });
  workers[1].emit("message", {
    type:"response", requestId:"second", response:successResponse(secondRequest),
  });
  assert.equal((await second).ok, true);
});

test("explicit cancellation terminates the Worker and the next request recovers", async () => {
  const {provider, workers} = harness();
  const first = provider.compute(request("cancelled"));

  assert.equal(provider.cancel("different"), false);
  assert.equal(provider.cancel("cancelled"), true);
  assert.equal(workers[0].terminated, true);
  assert.equal((await first).error.code, "CANCELLED");

  const recoveryRequest = request("recovery", [6, 0]);
  const recovery = provider.compute(recoveryRequest);
  assert.equal(workers.length, 2);
  workers[1].emit("message", {
    type:"response", requestId:"recovery", response:successResponse(recoveryRequest),
  });
  assert.equal((await recovery).ok, true);
});

test("timeout resets the Worker and permits a later successful request", async () => {
  const {provider, workers, clock} = harness();
  const timedOut = provider.compute(request("slow", [7, 0], {
    limits:{maxCandidates:250000, maxResultWeights:20000, maxElapsedMs:25},
  }));
  clock.advance(25);

  const timeoutResponse = await timedOut;
  assert.equal(timeoutResponse.error.code, "TIMEOUT");
  assert.equal(timeoutResponse.provider.elapsedMs, 25);
  assert.equal(workers[0].terminated, true);

  const recoveryRequest = request("after-timeout", [4, 1]);
  const recovery = provider.compute(recoveryRequest);
  workers[1].emit("message", {
    type:"response", requestId:"after-timeout", response:successResponse(recoveryRequest),
  });
  assert.equal((await recovery).ok, true);
});

test("the memory cache is bounded and disposal clears all page-lifetime state", async () => {
  const {provider, workers} = harness({cacheEntries:1});
  for (const [index, labels] of [[0, [4, 0]], [1, [5, 0]]]) {
    const value = request(`request-${index}`, labels);
    const result = provider.compute(value);
    workers[0].emit("message", {
      type:"response", requestId:value.requestId, response:successResponse(value),
    });
    await result;
  }
  assert.equal(provider.cacheSize, 1);
  provider.dispose();
  assert.equal(provider.cacheSize, 0);
  assert.equal(workers[0].terminated, true);
});

test("malformed and excessive elapsed-time budgets fail before Worker creation", async () => {
  const {provider, workers} = harness({maximumTimeoutMs:60000});
  const malformed = await provider.compute(request("bad", [4, 0], {
    limits:{maxCandidates:250000, maxResultWeights:20000, maxElapsedMs:0},
  }));
  const excessive = await provider.compute(request("large", [4, 0], {
    limits:{maxCandidates:250000, maxResultWeights:20000, maxElapsedMs:60001},
  }));
  const unsupported = await provider.compute(request("unsupported", [4, 0], {
    operation:"lie.unknown.v1",
  }));

  assert.equal(malformed.error.code, "INVALID_REQUEST");
  assert.equal(excessive.error.code, "LIMIT_EXCEEDED");
  assert.equal(unsupported.error.code, "UNSUPPORTED_OPERATION");
  assert.equal(workers.length, 0);
});
