# Browser computation architecture

This guide records the reusable architecture established by the C8-3 redesign
of the Lie roots, weights, and tensor-products visualization. Follow it when a
published visualization needs numerical or symbolic work that cannot be
represented by a small static preset payload.

## Decision boundary

Static browser-native output remains the default. Add an in-browser computation
runtime only when the interaction genuinely requires values that cannot be
prepared as a compact, explicit preset set. Published applications remain
statically hosted over HTTP/HTTPS; a computation Worker does not imply an
application server. Direct `file://` execution is unsupported and must not
produce an alternate loader, data format, origin policy, or test path.

Before adopting Pyodide or Wasm, record why ordinary JavaScript, compact static
domain data, or a smaller algorithm-specific implementation is insufficient.
Vendor only the runtime files and packages the selected calculation actually
loads.

## Required boundaries

Keep these layers distinct:

```text
authoritative physics/math -> versioned domain DTO -> compute protocol -> provider
                                                               |
                                                               v
main-thread renderer <- validated JSON response <- module Worker/runtime
```

- `physics.py` owns equations, conventions, algorithms, and mathematical limits.
- `domain.py` owns versioned, renderer-independent JSON data and invariant
  validation.
- `protocol.py` owns language-neutral operation names, request envelopes,
  versions, limits, and error codes.
- `kernel.py` validates every request again and invokes the authoritative
  physics/domain functions. UI validation is only an early usability check.
- The module Worker owns runtime loading and validates the returned JSON before
  handing it to the main thread.
- The provider owns cancellation, supersession, timeout, recovery, and caching.
- `visualization.py` owns controls, localization, rendering, and stale-response
  suppression. It must not contain a second mathematical implementation.

Static presets and runtime results must use the same result schema. If a runtime
result references other domain objects, return those objects in a separate
language-neutral dependency registry; do not change or embed the result schema
only for one provider.

## Protocol and versioning

Every request includes a protocol version, request ID, kernel/physics version,
operation name, mathematical input, and applicable resource limits. Responses
use structured success or stable language-neutral error codes. Pyodide proxies,
typed provider instances, Plotly figures, and localized strings never cross the
boundary.

Version deliberately:

- bump the protocol schema for a breaking envelope or error-contract change;
- bump the kernel version when authoritative calculations, validation, packaged
  sources, or result semantics change;
- bump a result schema when its data shape or meaning changes;
- use a new cacheable provider/Worker asset name when its public behavior or
  validation contract changes;
- include protocol, result schema, kernel, complete runtime identity, operation,
  input, and result-affecting limits in cache identity.

An operation registry is preferable to provider-specific conditionals in UI
code. A future provider must implement the same JSON `compute(request)` seam.

## Bounded execution and recovery

Define hard limits before exposing an input. Relevant dimensions can include
labels or grid resolution, candidate states, pairwise work, output size, memory,
and elapsed time. Forward each applicable limit to the authoritative algorithm;
do not enforce it only in UI code. Add invariant tests at the limit boundary and
return `LIMIT_EXCEEDED` rather than silently raising a budget.

Only report progress the algorithm can substantiate. Runtime loading,
calculating, validating, and rendering are appropriate coarse phases for a
synchronous kernel.

For synchronous Pyodide or Wasm work in a Worker:

- a newer valid request supersedes the older request;
- explicit cancellation and timeout terminate the Worker;
- the next request lazily creates a fresh Worker and runtime;
- messages from terminated or stale Worker generations are ignored;
- UI state is keyed by request ID so an older promise cannot overwrite a newer
  result.

## Cache policy

Start with a bounded, page-lifetime in-memory LRU cache of successful validated
responses. Do not cache errors. Exclude request IDs and elapsed-time budgets from
result identity; include every version and input that can change the result.
Clear page-lifetime state on provider disposal.

Do not add IndexedDB merely to avoid a cold calculation. Persistent caching
requires an explicit storage cap, eviction policy, schema/kernel/runtime
invalidation rules, privacy assessment, and a measured benefit large enough to
justify the added state.

## Scientific validation

Validate at three levels:

1. physics tests cover known results, symmetry, limits, and conserved or
   reconstructible quantities;
2. domain validation covers DTO shape and mathematical invariants before
   serialization;
3. Worker validation treats the runtime response as untrusted JSON before the UI
   renders it.

Applicable invariants include positive integral multiplicities, dimension
equality, highest-weight presence, valid graph indices, symmetry relations,
tensor-product dimension equality, non-negative residual characters, and exact
reconstruction of a product character from its irreducible components.

## Assets, localization, and QA

Self-host and pin computation runtimes, packages, shared renderers, licenses, and
provenance. Keep heavy assets lazy and verify that an ordinary preset view does
not request them. Record deterministic raw sizes in tests and raw/compressed
transfer sizes plus cold/warm timing in the PR that changes a runtime.

All controls, phases, terminal states, errors, cancellation text, accessibility
labels, and recovery guidance must be aligned in English and Japanese. Plot
internals remain English when the repository policy permits a shared figure
payload.

Use the transient runtime status for active phases, errors, cancellation, and
recovery guidance. After a successful static, calculated, or cached result has
rendered, clear that status and let the visible validated result confirm
completion. Do not keep calculation timing or cache provenance on screen unless
it supports a specific user decision.

Browser QA uses the final generated site served from `site/` over loopback HTTP.
For a runtime change, verify at minimum:

- the repository-wide lint, format, test, metadata, and production-build checks;
- executable provider lifecycle tests with deterministic fake Workers/timers;
- cold calculation, warm calculation or cache reuse, supersession, explicit
  cancellation, timeout, and post-termination recovery;
- English and Japanese controls and terminal states;
- Chromium and Firefox Worker paths, with Safari checked when available;
- usable MIME types for `.mjs`, `.js`, JSON, wheels/archives, and `.wasm`;
- same-origin iframe sizing and the absence of runtime requests on static presets;
- initial HTML/bootstrap, runtime/package, and response-size budgets.

## Future Wasm providers

Do not create a hand-maintained Wasm rewrite alongside authoritative Python
formulas. Before implementation, make and document an architecture decision for
one source of truth—for example, a Wasm-native core with Python bindings or
generated Python/Wasm implementations from a shared specification. Then add a
provider behind the existing protocol and compare complete domain DTOs and
invariants across providers.

Threaded Wasm or `SharedArrayBuffer` requires a separate hosting decision for
COOP/COEP headers. Static hosting compatibility must be verified before those
features become a requirement.
