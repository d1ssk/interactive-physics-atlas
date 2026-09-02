import {
  complexSphericalHarmonic,
  normalizeComponents,
  radialProbability,
  radialWavefunction,
  superpositionWavefunction,
  wavefunctionSpherical,
} from "../static/runtime/hydrogen-domain-v1.mjs";

const components = normalizeComponents([
  {n: 1, l: 0, m: 0, basis: "real", amplitude: 1, phase: 0},
  {n: 2, l: 0, m: 0, basis: "real", amplitude: 1, phase: 0},
]);
const harmonic = complexSphericalHarmonic(3, -2, 0.7, 1.1);
const wavefunction = wavefunctionSpherical(4, 2, -1, 5.2, 0.9, 2.4, "real");
const superposition = superpositionWavefunction(components, 1.4, 0.8, 0.3, 5.7);

process.stdout.write(JSON.stringify({
  radial3d: radialWavefunction(3, 2, 4.2),
  harmonic: [harmonic.re, harmonic.im],
  wavefunction: [wavefunction.re, wavefunction.im],
  superposition: [superposition.re, superposition.im],
  radialProbability: radialProbability(components, 2.3, 5.7),
}));
