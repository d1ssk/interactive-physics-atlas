import {IsingKernel, KERNEL_VERSION, PROTOCOL} from "./ising-kernel-v1.mjs";

const kernel = new IsingKernel();

self.addEventListener("message", event => {
  const request = event.data;
  try {
    const response = kernel.handle(request);
    self.postMessage(response, [response.spinsBuffer]);
  } catch (error) {
    self.postMessage({
      protocol: request?.protocol ?? PROTOCOL,
      kernelVersion: KERNEL_VERSION,
      operation: request?.operation ?? "unknown",
      requestId: request?.requestId ?? -1,
      generationId: request?.generationId ?? -1,
      ok: false,
      error: {code: error instanceof RangeError ? "LIMIT_EXCEEDED" : "CALCULATION_FAILED"},
    });
  }
});
