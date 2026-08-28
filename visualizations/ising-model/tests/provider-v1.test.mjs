import assert from "node:assert/strict";
import test from "node:test";

import {IsingWorkerProvider} from "../static/runtime/ising-worker-provider-v1.mjs";

class FakeWorker {
  constructor() { this.listeners = new Map(); this.requests = []; this.terminated = false; }
  addEventListener(type, callback) { this.listeners.set(type, callback); }
  postMessage(request) { this.requests.push(request); }
  terminate() { this.terminated = true; }
  emit(response) { this.listeners.get("message")?.({data: response}); }
  emitError() { this.listeners.get("error")?.(new Error("worker failed")); }
}

const request = (requestId, generationId = 1) => ({
  protocol: "physics-atlas.ising.v1", kernelVersion: "1.0.0", operation: "ising.advance.v1",
  requestId, generationId, input: {sweeps: 1},
});

function response(value, overrides = {}) {
  const spins = new Int8Array([1, -1, 1, -1]);
  return {
    protocol: value.protocol, kernelVersion: value.kernelVersion, operation: value.operation,
    requestId: value.requestId, generationId: value.generationId, ok: true,
    snapshot: {schema: "physics-atlas.ising-snapshot.v1", siteCount: 4, acceptanceRate: .5},
    spinsBuffer: spins.buffer, ...overrides,
  };
}

function harness() {
  const workers = [];
  const provider = new IsingWorkerProvider({workerFactory: () => {
    const worker = new FakeWorker(); workers.push(worker); return worker;
  }});
  return {provider, worker: workers[0], workers};
}

test("typed snapshots are validated and returned as Int8Array", async () => {
  const {provider, worker} = harness();
  const value = request(1);
  const pending = provider.compute(value);
  worker.emit(response(value));
  const result = await pending;
  assert.ok(result.spins instanceof Int8Array);
  assert.deepEqual([...result.spins], [1, -1, 1, -1]);
});

test("a response from a stale generation cannot satisfy the request", async () => {
  const {provider, worker} = harness();
  const value = request(2, 9);
  const pending = provider.compute(value);
  worker.emit(response(value, {generationId: 8}));
  await assert.rejects(pending, /identity mismatch/);
});

test("unknown and superseded request identities are ignored", async () => {
  const {provider, worker} = harness();
  const value = request(3, 10);
  const pending = provider.compute(value);
  worker.emit(response(request(999, 9)));
  worker.emit(response(value));
  assert.equal((await pending).generationId, 10);
});

test("malformed spin buffers are rejected", async () => {
  const {provider, worker} = harness();
  const value = request(4);
  const pending = provider.compute(value);
  worker.emit(response(value, {spinsBuffer: new Int8Array([1, 0, 1, -1]).buffer}));
  await assert.rejects(pending, /invalid spin value/);
});

test("dispose terminates the Worker and rejects pending work", async () => {
  const {provider, worker} = harness();
  const pending = provider.compute(request(5));
  provider.dispose();
  assert.equal(worker.terminated, true);
  await assert.rejects(pending, /PROVIDER_DISPOSED/);
});

test("a Worker failure rejects current work and creates a clean replacement", async () => {
  const {provider, worker, workers} = harness();
  const pending = provider.compute(request(6));
  worker.emitError();
  assert.equal(worker.terminated, true);
  await assert.rejects(pending, /WORKER_FAILED/);
  assert.equal(workers.length, 2);

  const recoveryRequest = request(7);
  const recovery = provider.compute(recoveryRequest);
  workers[1].emit(response(recoveryRequest));
  assert.equal((await recovery).ok, true);
});
