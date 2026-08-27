"""Language-neutral protocol constants for Lie weight computation providers."""

COMPUTE_PROTOCOL_SCHEMA = "physics-atlas.compute.v1"
WEIGHT_OPERATION = "lie.weight-diagram.v1"
WEIGHT_RESULT_SCHEMA = "physics-atlas.weight-diagram.v1"
KERNEL_VERSION = "1.0.0"

MAX_DYNKIN_LABEL = 8
DEFAULT_MAX_CANDIDATES = 250_000
HARD_MAX_CANDIDATES = 250_000
DEFAULT_MAX_RESULT_WEIGHTS = 20_000
HARD_MAX_RESULT_WEIGHTS = 20_000
DEFAULT_MAX_ELAPSED_MS = 30_000
HARD_MAX_ELAPSED_MS = 60_000
MEMORY_CACHE_MAX_ENTRIES = 16

ERROR_CODES = (
    "PROTOCOL_MISMATCH",
    "KERNEL_MISMATCH",
    "UNSUPPORTED_OPERATION",
    "INVALID_REQUEST",
    "INVALID_INPUT",
    "LIMIT_EXCEEDED",
    "CALCULATION_FAILED",
    "INVARIANT_FAILED",
    "RUNTIME_LOAD_FAILED",
    "CANCELLED",
    "SUPERSEDED",
    "TIMEOUT",
)


def weight_compute_request(request_id: str, system: str, labels: list[int]) -> dict[str, object]:
    """Build one bounded, versioned weight-diagram request."""

    return {
        "protocol": COMPUTE_PROTOCOL_SCHEMA,
        "requestId": request_id,
        "kernelVersion": KERNEL_VERSION,
        "operation": WEIGHT_OPERATION,
        "input": {"system": system, "highestDynkin": labels},
        "limits": {
            "maxCandidates": DEFAULT_MAX_CANDIDATES,
            "maxResultWeights": DEFAULT_MAX_RESULT_WEIGHTS,
            "maxElapsedMs": DEFAULT_MAX_ELAPSED_MS,
        },
    }
