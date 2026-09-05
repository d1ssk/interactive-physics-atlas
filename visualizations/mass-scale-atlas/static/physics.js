(function exposeMassScalePhysics(root) {
  "use strict";

  const K_B_EV_PER_K = 8.617333262e-5;
  const HBAR_EV_S = 6.582119569e-16;
  const SPEED_OF_LIGHT_M_PER_S = 299792458;
  const HBAR_C_EV_M = HBAR_EV_S * SPEED_OF_LIGHT_M_PER_S;
  const MPC_IN_METERS = 3.0856775814913673e22;
  const REDUCED_PLANCK_MASS_EV = 2.435e27;

  function logEnergy(energyEv) {
    if (!(energyEv > 0)) throw new RangeError("energy must be positive on a logarithmic axis");
    return Math.log10(energyEv);
  }

  function energyToY(energyEv, scale) {
    return scale.paddingTop + (logEnergy(energyEv) - scale.minLog) * scale.pxPerDecade;
  }

  function yToEnergy(y, scale) {
    return 10 ** (scale.minLog + (y - scale.paddingTop) / scale.pxPerDecade);
  }

  function temperatureKelvin(energyEv) {
    logEnergy(energyEv);
    return energyEv / K_B_EV_PER_K;
  }

  function reducedLengthMeters(energyEv) {
    logEnergy(energyEv);
    return HBAR_C_EV_M / energyEv;
  }

  function quantumTimeSeconds(energyEv) {
    logEnergy(energyEv);
    return HBAR_EV_S / energyEv;
  }

  function hubbleEnergyEv(h0KmPerSecondPerMpc) {
    const hubblePerSecond = h0KmPerSecondPerMpc * 1000 / MPC_IN_METERS;
    return HBAR_EV_S * hubblePerSecond;
  }

  function vacuumEnergyScaleEv(h0KmPerSecondPerMpc, omegaLambda) {
    const hbarH0 = hubbleEnergyEv(h0KmPerSecondPerMpc);
    const rhoLambdaEv4 = 3 * omegaLambda * (hbarH0 * REDUCED_PLANCK_MASS_EV) ** 2;
    return rhoLambdaEv4 ** 0.25;
  }

  function effectiveRelativisticDegreesOfFreedom(temperatureMev) {
    const temperatureGev = temperatureMev / 1000;
    if (temperatureGev >= 300) return 106.75;
    if (temperatureGev >= 80) return 96.25;
    if (temperatureGev >= 4.2) return 86.25;
    if (temperatureGev >= 1.3) return 75.75;
    if (temperatureGev >= 0.2) return 61.75;
    if (temperatureGev >= 0.1) return 17.25;
    return 10.75;
  }

  // Radiation-dominated estimate: t = 2.42 / (sqrt(g*) (T / MeV)^2) seconds.
  function radiationEraAgeSeconds(energyEv) {
    const temperatureMev = energyEv / 1e6;
    if (temperatureMev < 1 || energyEv > 1e26) return null;
    const gStar = effectiveRelativisticDegreesOfFreedom(temperatureMev);
    return 2.42 / (Math.sqrt(gStar) * temperatureMev ** 2);
  }

  root.MassScalePhysics = Object.freeze({
    K_B_EV_PER_K,
    HBAR_EV_S,
    HBAR_C_EV_M,
    SPEED_OF_LIGHT_M_PER_S,
    REDUCED_PLANCK_MASS_EV,
    logEnergy,
    energyToY,
    yToEnergy,
    temperatureKelvin,
    reducedLengthMeters,
    quantumTimeSeconds,
    hubbleEnergyEv,
    vacuumEnergyScaleEv,
    effectiveRelativisticDegreesOfFreedom,
    radiationEraAgeSeconds,
  });
})(typeof window === "undefined" ? globalThis : window);
