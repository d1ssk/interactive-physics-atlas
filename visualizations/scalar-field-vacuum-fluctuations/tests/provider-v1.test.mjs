import assert from "node:assert/strict";
import test from "node:test";

import {PyodideComputeProvider} from "../runtime/pyodide-compute-provider-v1.mjs";

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

  emit(type, data) {
    this.listeners.get(type)?.(type === "message" ? {data} : data);
  }
}

function fakeClock() {
  let now = 0;
  let nextTimer = 0;
  const timers = new Map();
  return {
    now:() => now,
    setTimeoutFn(callback, delay) {
      const timer = ++nextTimer;
      timers.set(timer, {callback, deadline:now + delay});
      return timer;
    },
    clearTimeoutFn:timer => timers.delete(timer),
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

function request(requestId, seed = 7, timeout = 45000) {
  return {
    protocol:"physics-atlas.compute.v1",
    requestId,
    kernelVersion:"1.0.0",
    operation:"scalar-vacuum.sample.v1",
    input:{mass:.45, cutoffFraction:.49, seed},
    limits:{maxElapsedMs:timeout},
  };
}

function success(value) {
  return {
    protocol:value.protocol,
    requestId:value.requestId,
    kernelVersion:value.kernelVersion,
    operation:value.operation,
    ok:true,
    result:{schema:"physics-atlas.scalar-vacuum.sample.v1", seed:value.input.seed},
  };
}

function harness(options = {}) {
  const workers = [];
  const clock = fakeClock();
  const provider = new PyodideComputeProvider({
    workerUrl:new URL("https://example.test/worker.mjs"),
    resultSchemas:{"scalar-vacuum.sample.v1":"physics-atlas.scalar-vacuum.sample.v1"},
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

test("successful responses use the bounded page-lifetime cache", async () => {
  const {provider, workers} = harness({cacheEntries:1});
  const firstRequest = request("first");
  const first = provider.compute(firstRequest);
  workers[0].emit("message", {
    type:"response",
    requestId:"first",
    response:success(firstRequest),
  });
  assert.equal((await first).provider.cacheHit, false);
  assert.equal(provider.cacheSize, 1);

  const cached = await provider.compute(request("cached"));
  assert.equal(cached.provider.cacheHit, true);
  assert.equal(cached.requestId, "cached");
  assert.equal(workers[0].requests.length, 1);

  const secondRequest = request("second", 8);
  const second = provider.compute(secondRequest);
  workers[0].emit("message", {
    type:"response",
    requestId:"second",
    response:success(secondRequest),
  });
  await second;
  assert.equal(provider.cacheSize, 1);
});

test("new work supersedes old synchronous Worker work and then recovers", async () => {
  const {provider, workers} = harness();
  const firstRequest = request("first");
  const secondRequest = request("second", 8);
  const first = provider.compute(firstRequest);
  const second = provider.compute(secondRequest);

  assert.equal(workers.length, 2);
  assert.equal(workers[0].terminated, true);
  assert.equal((await first).error.code, "SUPERSEDED");
  workers[0].emit("message", {
    type:"response",
    requestId:"first",
    response:success(firstRequest),
  });
  workers[1].emit("message", {
    type:"response",
    requestId:"second",
    response:success(secondRequest),
  });
  assert.equal((await second).ok, true);
});

test("timeout terminates the Worker and a later request succeeds", async () => {
  const {provider, workers, clock} = harness();
  const timedOut = provider.compute(request("slow", 7, 25));
  clock.advance(25);
  assert.equal((await timedOut).error.code, "TIMEOUT");
  assert.equal(workers[0].terminated, true);

  const recoveryRequest = request("recovery", 9);
  const recovery = provider.compute(recoveryRequest);
  workers[1].emit("message", {
    type:"response",
    requestId:"recovery",
    response:success(recoveryRequest),
  });
  assert.equal((await recovery).ok, true);
});

test("invalid budgets fail before a Worker is created", async () => {
  const {provider, workers} = harness({maximumTimeoutMs:60000});
  assert.equal((await provider.compute(request("zero", 1, 0))).error.code, "INVALID_REQUEST");
  assert.equal((await provider.compute(request("large", 1, 60001))).error.code, "LIMIT_EXCEEDED");
  assert.equal(workers.length, 0);
});
