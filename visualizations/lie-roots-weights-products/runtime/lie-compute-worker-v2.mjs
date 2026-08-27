import {loadPyodide} from "./pyodide/pyodide.mjs";

const PROTOCOL = "__COMPUTE_PROTOCOL__";
const KERNEL_VERSION = "__KERNEL_VERSION__";
const WEIGHT_OPERATION = "__WEIGHT_OPERATION__";
const WEIGHT_RESULT_SCHEMA = "__WEIGHT_RESULT_SCHEMA__";
const TENSOR_PRODUCT_OPERATION = "__TENSOR_PRODUCT_OPERATION__";
const TENSOR_PRODUCT_RESULT_SCHEMA = "__TENSOR_PRODUCT_RESULT_SCHEMA__";
const CHARACTER_SCHEMA = "__CHARACTER_SCHEMA__";
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

function invariant(message) {
  const error = new Error(message);
  error.code = "INVARIANT_FAILED";
  throw error;
}

function arraysEqual(left, right) {
  return Array.isArray(left) && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => Array.isArray(value)
      ? arraysEqual(value, right[index])
      : value === right[index]);
}

function validateEnvelope(request, response) {
  if (response?.protocol !== PROTOCOL || response.requestId !== request.requestId) {
    invariant("Invalid compute response envelope");
  }
  if (response.kernelVersion !== KERNEL_VERSION || response.operation !== request.operation) {
    invariant("Invalid compute response version");
  }
}

function characterMap(character, expectedSchema = null) {
  if (expectedSchema && character?.schema !== expectedSchema) {
    invariant("Invalid character schema");
  }
  if (character?.kernelVersion !== KERNEL_VERSION) invariant("Invalid character kernel");
  const arrays = [character.displayWeights, character.dynkinCoordinates, character.multiplicities];
  if (!arrays.every(Array.isArray) || !arrays.every(value => value.length === arrays[0].length)) {
    invariant("Inconsistent character arrays");
  }
  if (!character.multiplicities.every(value => Number.isInteger(value) && value > 0)) {
    invariant("Invalid character multiplicity");
  }
  if (!character.dynkinCoordinates.every(labels =>
    Array.isArray(labels) && labels.every(Number.isInteger)
  )) {
    invariant("Invalid character Dynkin coordinates");
  }
  const result = new Map();
  character.dynkinCoordinates.forEach((labels, index) => {
    const key = JSON.stringify(labels);
    if (result.has(key)) invariant("Duplicate character weight");
    result.set(key, character.multiplicities[index]);
  });
  return result;
}

function mapsEqual(left, right) {
  return left.size === right.size && [...left].every(([key, value]) => right.get(key) === value);
}

function validateWeightResult(result, expectedHighest = null) {
  if (result?.schema !== WEIGHT_RESULT_SCHEMA || result.kernelVersion !== KERNEL_VERSION) {
    invariant("Invalid weight result schema");
  }
  const character = characterMap(result);
  if (!Array.isArray(result.levels) || result.levels.length !== character.size) {
    invariant("Inconsistent weight levels");
  }
  if (!Array.isArray(result.edges) || result.edges.some(edge =>
    !Array.isArray(edge) || edge.length !== 2 || edge.some(index =>
      !Number.isInteger(index) || index < 0 || index >= character.size
    )
  )) {
    invariant("Invalid weight graph");
  }
  const dimension = [...character.values()].reduce((total, value) => total + value, 0);
  if (dimension !== result.dimension || dimension !== result.weylDimension) {
    invariant("Weight dimension invariant failed");
  }
  if (expectedHighest && !arraysEqual(result.highestDynkin, expectedHighest)) {
    invariant("Unexpected highest weight");
  }
  if (!result.dynkinCoordinates.some(labels => arraysEqual(labels, result.highestDynkin))) {
    invariant("Highest weight missing from result");
  }
  return character;
}

function validateTensorProductResult(request, response) {
  const result = response.result;
  if (result?.schema !== TENSOR_PRODUCT_RESULT_SCHEMA
      || result.kernelVersion !== KERNEL_VERSION) {
    invariant("Invalid tensor-product result schema");
  }
  if (!Array.isArray(request.input?.factors) || request.input.factors.length !== 2
      || !arraysEqual(result.factors, request.input.factors)) {
    invariant("Tensor-product factors do not match the request");
  }
  if (!Array.isArray(result.factorWeightKeys)
      || result.factorWeightKeys.length !== result.factors.length
      || !Array.isArray(result.components) || !result.components.length
      || !Array.isArray(result.steps) || result.steps.length !== result.components.length + 1) {
    invariant("Inconsistent tensor-product result structure");
  }

  const dependencies = response.dependencies?.weights;
  if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) {
    invariant("Tensor-product weight dependencies are missing");
  }
  result.factorWeightKeys.forEach((key, index) => {
    validateWeightResult(dependencies[key], result.factors[index]);
  });

  if (result.steps.some(step => step.system !== result.system)) {
    invariant("Tensor-product character system mismatch");
  }
  const characters = result.steps.map(step => characterMap(step, CHARACTER_SCHEMA));
  const productDimension = [...characters[0].values()].reduce((total, value) => total + value, 0);
  if (productDimension !== result.dimension || result.distinctWeights !== characters[0].size
      || characters.at(-1).size !== 0) {
    invariant("Tensor-product character invariant failed");
  }

  let decompositionDimension = 0;
  const reconstructed = new Map();
  const residual = new Map(characters[0]);
  result.components.forEach((component, componentIndex) => {
    if (!Number.isInteger(component.multiplicity) || component.multiplicity <= 0
        || !Number.isInteger(component.dimension) || component.dimension <= 0) {
      invariant("Invalid tensor-product component");
    }
    const diagram = dependencies[component.weightKey];
    const irrep = validateWeightResult(diagram, component.highestDynkin);
    if (diagram.dimension !== component.dimension) invariant("Component dimension mismatch");
    decompositionDimension += component.multiplicity * component.dimension;
    irrep.forEach((multiplicity, weight) => {
      const contribution = component.multiplicity * multiplicity;
      reconstructed.set(weight, (reconstructed.get(weight) ?? 0) + contribution);
      const remaining = (residual.get(weight) ?? 0) - contribution;
      if (remaining < 0) invariant("Negative tensor-product residual");
      if (remaining === 0) residual.delete(weight);
      else residual.set(weight, remaining);
    });
    if (!mapsEqual(residual, characters[componentIndex + 1])) {
      invariant("Tensor-product extraction step failed reconstruction");
    }
  });
  if (decompositionDimension !== result.dimension
      || result.decompositionDimension !== result.dimension
      || !mapsEqual(reconstructed, characters[0])) {
    invariant("Tensor-product decomposition invariant failed");
  }
}

function validateResponse(request, response) {
  validateEnvelope(request, response);
  if (!response.ok) return;
  if (request.operation === WEIGHT_OPERATION) {
    validateWeightResult(response.result, request.input.highestDynkin);
  } else if (request.operation === TENSOR_PRODUCT_OPERATION) {
    validateTensorProductResult(request, response);
  } else {
    invariant("Unsupported successful operation");
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
    validateResponse(request, response);
    response.runtime = RUNTIME;
    self.postMessage({type:"response", requestId, response});
  } catch (error) {
    console.error(error);
    if (loading) runtimePromise = null;
    const code = loading ? "RUNTIME_LOAD_FAILED" : (error?.code ?? "CALCULATION_FAILED");
    self.postMessage({type:"response", requestId, response:errorResponse(request, code)});
  }
});
