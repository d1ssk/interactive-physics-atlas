import * as Physics from "../static/runtime/lorentz-domain-v1.mjs";

const beta = 0.57;
const event = {x: 1.35, ct: 2.15};
const guides = Physics.coordinateGuides(event, beta);

process.stdout.write(JSON.stringify({
  gamma: Physics.gamma(beta),
  rapidity: Physics.rapidity(beta),
  boost: Physics.boost(event, beta),
  inverse: Physics.inverseBoost({x: -0.7, ct: 1.9}, beta),
  interval: Physics.interval(event),
  primeXFoot: guides.prime.xFoot,
  primeCtFoot: guides.prime.ctFoot,
  timelike: Physics.hyperbolicTimelikePoint(2, beta, 0.43),
  spacelike: Physics.hyperbolicSpacelikePoint(2, beta, 0.43),
  time: Physics.timeDilationConstruction(beta, 2),
  length: Physics.lengthContractionConstruction(beta, 2),
}));
