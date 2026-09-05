import {solveField} from "./physics.mjs";

let previousPotential = null;
let previousDimensions = "";

self.addEventListener("message", event => {
  const {requestId, options} = event.data;
  const dimensions = `${options.nx}x${options.ny}:${options.mode}`;
  if (dimensions !== previousDimensions) previousPotential = null;

  try {
    const solution = solveField({...options, previousPotential});
    previousPotential = new Float64Array(solution.potential);
    previousDimensions = dimensions;
    self.postMessage(
      {requestId, solution},
      [
        solution.potential.buffer,
        solution.kappa.buffer,
        solution.objectMask.buffer,
        solution.conductorMask.buffer,
      ],
    );
  } catch (error) {
    self.postMessage({requestId, error: error instanceof Error ? error.message : String(error)});
  }
});
