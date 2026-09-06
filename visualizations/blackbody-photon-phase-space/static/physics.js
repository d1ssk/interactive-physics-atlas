"use strict";

(function exposeBlackbodyPhysics(root) {
  const CONSTANTS = Object.freeze({
    planck: 6.62607015e-34,
    boltzmann: 1.380649e-23,
    lightSpeed: 299792458,
    astronomicalUnit: 149597870700,
    solarRadius: 6.957e8,
    zeta3: 1.202056903159594,
  });

  function occupationNumber(frequencyHz, temperatureK) {
    if (!(frequencyHz > 0) || !(temperatureK > 0)) return 0;
    const exponent = CONSTANTS.planck * frequencyHz / (CONSTANTS.boltzmann * temperatureK);
    if (exponent > 709) return 0;
    return 1 / Math.expm1(exponent);
  }

  function photonNumberPerLogFrequencySolidAngle(frequencyHz, temperatureK) {
    const coefficient = 2 * frequencyHz ** 3 / CONSTANTS.lightSpeed ** 3;
    return coefficient * occupationNumber(frequencyHz, temperatureK);
  }

  function energyPerLogFrequencySolidAngle(frequencyHz, temperatureK) {
    return CONSTANTS.planck * frequencyHz
      * photonNumberPerLogFrequencySolidAngle(frequencyHz, temperatureK);
  }

  function circularConeSolidAngle(angularRadiusRad) {
    return 2 * Math.PI * (1 - Math.cos(angularRadiusRad));
  }

  function solarAngularRadius(distanceMetres = CONSTANTS.astronomicalUnit) {
    return Math.asin(CONSTANTS.solarRadius / distanceMetres);
  }

  function photonDensityInSolidAngle(temperatureK, solidAngleSr) {
    const thermalFrequency = CONSTANTS.boltzmann * temperatureK / CONSTANTS.planck;
    return solidAngleSr * 4 * CONSTANTS.zeta3 * thermalFrequency ** 3
      / CONSTANTS.lightSpeed ** 3;
  }

  function photonDensityInFrequencyBand(
    temperatureK,
    solidAngleSr,
    minimumFrequencyHz,
    maximumFrequencyHz,
    steps = 4096,
  ) {
    if (!(temperatureK > 0) || !(solidAngleSr > 0)
      || !(minimumFrequencyHz > 0) || !(maximumFrequencyHz > minimumFrequencyHz)) return 0;
    const count = Math.max(32, Math.floor(steps));
    const logMinimum = Math.log(minimumFrequencyHz);
    const interval = (Math.log(maximumFrequencyHz) - logMinimum) / count;
    let integral = 0;
    let previous = photonNumberPerLogFrequencySolidAngle(minimumFrequencyHz, temperatureK);
    for (let index = 1; index <= count; index += 1) {
      const frequency = Math.exp(logMinimum + index * interval);
      const current = photonNumberPerLogFrequencySolidAngle(frequency, temperatureK);
      integral += 0.5 * (previous + current) * interval;
      previous = current;
    }
    return solidAngleSr * integral;
  }

  function energyDensityInSolidAngle(temperatureK, solidAngleSr) {
    const numerator = solidAngleSr * 2 * Math.PI ** 4 * CONSTANTS.boltzmann ** 4
      * temperatureK ** 4;
    const denominator = 15 * CONSTANTS.planck ** 3 * CONSTANTS.lightSpeed ** 3;
    return numerator / denominator;
  }

  function frequencyForPhotonLogPeak(temperatureK) {
    const dimensionlessPeak = 2.8214393721220787;
    return dimensionlessPeak * CONSTANTS.boltzmann * temperatureK / CONSTANTS.planck;
  }

  function directionFromAzimuthElevation(azimuthRad, elevationRad) {
    const horizontal = Math.cos(elevationRad);
    return {
      x: horizontal * Math.cos(azimuthRad),
      y: Math.sin(elevationRad),
      z: horizontal * Math.sin(azimuthRad),
    };
  }

  function angularSeparation(left, right) {
    const dot = left.x * right.x + left.y * right.y + left.z * right.z;
    return Math.acos(Math.max(-1, Math.min(1, dot)));
  }

  root.BlackbodyPhysics = Object.freeze({
    CONSTANTS,
    occupationNumber,
    photonNumberPerLogFrequencySolidAngle,
    energyPerLogFrequencySolidAngle,
    circularConeSolidAngle,
    solarAngularRadius,
    photonDensityInSolidAngle,
    photonDensityInFrequencyBand,
    energyDensityInSolidAngle,
    frequencyForPhotonLogPeak,
    directionFromAzimuthElevation,
    angularSeparation,
  });
}(typeof window === "undefined" ? globalThis : window));
