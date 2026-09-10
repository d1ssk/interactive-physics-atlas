import {loadPyodide} from "./pyodide/pyodide.mjs";

const PROTOCOL = "__COMPUTE_PROTOCOL__";
const KERNEL_VERSION = "__KERNEL_VERSION__";
const SAMPLE_OPERATION = "__SAMPLE_OPERATION__";
const SAMPLE_RESULT_SCHEMA = "__SAMPLE_RESULT_SCHEMA__";
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
    operation:typeof request?.operation === "string" ? request.operation : "",
    ok:false,
    error:{code},
    runtime:RUNTIME,
  };
}

async function createRuntime(requestId) {
  reportPhase(requestId, "runtime-loading");
  const pyodide = await loadPyodide({indexURL:new URL("./pyodide/", import.meta.url).href});
  await pyodide.loadPackage("numpy");
  reportPhase(requestId, "kernel-loading");
  await pyodide.loadPackage(new URL(`./${KERNEL_WHEEL}`, import.meta.url).href);
  return pyodide;
}

function ensureRuntime(requestId) {
  if (!runtimePromise) runtimePromise = createRuntime(requestId);
  return runtimePromise;
}

function validateResponse(request, response) {
  if (response?.protocol !== PROTOCOL || response.requestId !== request.requestId
      || response.kernelVersion !== KERNEL_VERSION || response.operation !== SAMPLE_OPERATION) {
    throw new Error("invalid response envelope");
  }
  if (!response.ok) return;
  const result = response.result;
  if (result?.schema !== SAMPLE_RESULT_SCHEMA || result.kernelVersion !== KERNEL_VERSION) {
    throw new Error("invalid result schema");
  }
  const n = result.parameters?.gridSize;
  const nt = result.parameters?.timeSlices;
  if (!Number.isInteger(n) || !Number.isInteger(nt)
      || result.axis?.length !== n || result.times?.length !== nt
      || result.spacetime?.field?.length !== nt * n * n
      || result.space3d?.field?.length !== n * n * n
      || result.correlation?.dimension2?.length !== Math.floor(n / 2) + 1
      || result.correlation?.dimension2Error?.length !== Math.floor(n / 2) + 1
      || result.correlation?.dimension3?.length !== Math.floor(n / 2) + 1
      || result.correlation?.dimension3Error?.length !== Math.floor(n / 2) + 1) {
    throw new Error("invalid result dimensions");
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
from physics_atlas_scalar_vacuum_kernel.kernel import handle_request_json
handle_request_json(__atlas_request_json)
      `);
    } finally {
      pyodide.globals.delete("__atlas_request_json");
    }
    reportPhase(requestId, "validating");
    const response = JSON.parse(responseJson);
    validateResponse(request, response);
    response.runtime = RUNTIME;
    self.postMessage({type:"response", requestId, response});
  } catch (error) {
    console.error(error);
    if (loading) runtimePromise = null;
    self.postMessage({
      type:"response",
      requestId,
      response:errorResponse(request, loading ? "RUNTIME_LOAD_FAILED" : "CALCULATION_FAILED"),
    });
  }
});
