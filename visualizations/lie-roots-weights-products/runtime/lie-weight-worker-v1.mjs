import {loadPyodide} from "./pyodide/pyodide.mjs";

const PROTOCOL = "__COMPUTE_PROTOCOL__";
const KERNEL_VERSION = "__KERNEL_VERSION__";
const WEIGHT_OPERATION = "__WEIGHT_OPERATION__";
const KERNEL_WHEEL = "__KERNEL_WHEEL__";
const RUNTIME = Object.freeze({
  name:"pyodide",
  version:"__PYODIDE_VERSION__",
  pythonVersion:"__PYTHON_VERSION__",
  numpyVersion:"__NUMPY_VERSION__",
});

let runtimePromise = null;

function reportPhase(requestId, phase) {
  self.postMessage({type:"phase", requestId, phase});
}

function errorResponse(request, code) {
  return {
    protocol:PROTOCOL,
    requestId:typeof request?.requestId === "string" ? request.requestId : "",
    kernelVersion:KERNEL_VERSION,
    operation:typeof request?.operation === "string" ? request.operation : WEIGHT_OPERATION,
    ok:false,
    error:{code},
    runtime:RUNTIME,
  };
}

async function createRuntime(requestId) {
  reportPhase(requestId, "runtime-loading");
  const indexURL = new URL("./pyodide/", import.meta.url).href;
  const pyodide = await loadPyodide({indexURL});
  await pyodide.loadPackage("numpy");
  reportPhase(requestId, "kernel-loading");
  await pyodide.loadPackage(new URL(`./${KERNEL_WHEEL}`, import.meta.url).href);
  return pyodide;
}

function ensureRuntime(requestId) {
  if (!runtimePromise) runtimePromise = createRuntime(requestId);
  return runtimePromise;
}

function validateWeightResult(request, response) {
  if (response?.protocol !== PROTOCOL || response.requestId !== request.requestId) {
    throw new Error("Invalid compute response envelope");
  }
  if (response.kernelVersion !== KERNEL_VERSION || response.operation !== WEIGHT_OPERATION) {
    throw new Error("Invalid compute response version");
  }
  if (!response.ok) return;
  const result = response.result;
  if (result?.schema !== "physics-atlas.weight-diagram.v1" || result.kernelVersion !== KERNEL_VERSION) {
    throw new Error("Invalid weight result schema");
  }
  const arrays = [
    result.displayWeights,
    result.dynkinCoordinates,
    result.multiplicities,
    result.levels,
  ];
  if (!arrays.every(Array.isArray) || !arrays.every(value => value.length === arrays[0].length)) {
    throw new Error("Inconsistent weight result arrays");
  }
  if (!result.multiplicities.every(value => Number.isInteger(value) && value > 0)) {
    throw new Error("Invalid weight multiplicity");
  }
  const dimension = result.multiplicities.reduce((total, value) => total + value, 0);
  if (dimension !== result.dimension || dimension !== result.weylDimension) {
    throw new Error("Weight dimension invariant failed");
  }
  if (!result.dynkinCoordinates.some(labels =>
    labels.length === request.input.highestDynkin.length
    && labels.every((value, index) => value === request.input.highestDynkin[index])
  )) {
    throw new Error("Highest weight missing from result");
  }
}

self.addEventListener("message", async event => {
  const request = event.data;
  const requestId = typeof request?.requestId === "string" ? request.requestId : "";
  let loading = false;
  try {
    loading = !runtimePromise;
    const pyodide = await ensureRuntime(requestId);
    loading = false;
    reportPhase(requestId, "calculating");
    pyodide.globals.set("__atlas_request_json", JSON.stringify(request));
    let responseJson;
    try {
      responseJson = pyodide.runPython(`
from physics_atlas_lie_kernel.kernel import handle_request_json
handle_request_json(__atlas_request_json)
      `);
    } finally {
      pyodide.globals.delete("__atlas_request_json");
    }
    reportPhase(requestId, "validating");
    const response = JSON.parse(responseJson);
    validateWeightResult(request, response);
    response.runtime = RUNTIME;
    self.postMessage({type:"response", requestId, response});
  } catch (error) {
    console.error(error);
    if (loading) runtimePromise = null;
    const response = errorResponse(request, loading ? "RUNTIME_LOAD_FAILED" : "CALCULATION_FAILED");
    self.postMessage({type:"response", requestId, response});
  }
});
