import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AXES, P0, P_MAX, R, S_IDEAL_REF, T0, T_MAX, T_MIN, bounds, coordinates, dispatch, entropyEnvelope, fixedP, fixedV,
  fromXY, gibbsPhaseBoundaries, globalBounds, ideal, mix, operate, phase, slopes, surface, tangentInfo, thermalTarget, tp, tv, validity,
} from '../static/physics.mjs';

const near = (actual, expected, relative = 1e-8, absolute = 1e-7) => {
  const tolerance = Math.max(absolute, Math.abs(expected) * relative);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected} ± ${tolerance}`);
};
const rejects = fn => assert.throws(fn);

test('Legendre identities hold for both models', () => {
  for (const model of ['ideal', 'water']) for (const temperature of [250, 300, 450]) {
    const state = tp(model, temperature, 1e5);
    near(state.H, state.U + state.P * state.V);
    near(state.F, state.U - state.T * state.S);
    near(state.G, state.H - state.T * state.S);
    near(state.fractions.reduce((sum, value) => sum + value, 0), 1);
  }
});

test('molar Gibbs derivatives give entropy and volume', () => {
  for (let index = 0; index < 3; index += 1) {
    const temperature = 310, pressure = 1e5, dt = 0.001, dp = 10;
    const state = phase(temperature, pressure, index);
    const derivativeT = (phase(temperature + dt, pressure, index).G - phase(temperature - dt, pressure, index).G) / (2 * dt);
    const derivativeP = (phase(temperature, pressure + dp, index).G - phase(temperature, pressure - dp, index).G) / (2 * dp);
    near(derivativeT, -state.S, 1e-7);
    near(derivativeP, state.V, 1e-7, 1e-12);
  }
});

test('absolute-entropy anchors match the stated reference data', () => {
  near(ideal(300, 1e5).S, S_IDEAL_REF, 0, 1e-12);
  near(ideal(298.15, 1e5).S, 154.846, 0, 1e-3);
  near(phase(298.15, 1e5, 1).S, 69.95, 0, 1e-10);
});

test('entropy is positive and equilibrium Gibbs energy decreases with temperature', () => {
  for (const model of ['ideal', 'water']) for (const pressure of [1, P0, 1e5, 1e7, P_MAX]) {
    let previous = null;
    for (let index = 0; index <= 84; index += 1) {
      const temperature = T_MIN + (T_MAX - T_MIN) * index / 84;
      const state = tp(model, temperature, pressure);
      assert.ok(state.S > 0, `${model}: s=${state.S} at ${temperature} K, ${pressure} Pa`);
      assert.ok(state.V > 0 && Object.values(state).slice(0, 8).every(Number.isFinite));
      near(state.fractions.reduce((sum, value) => sum + value, 0), 1);
      if (previous) {
        assert.ok(state.G < previous.G, `${model}: g must decrease at fixed P`);
        assert.ok(state.S > previous.S, `${model}: s must increase at fixed P`);
      }
      previous = state;
    }
  }
  for (let phaseIndex = 0; phaseIndex < 3; phaseIndex += 1) for (const temperature of [T_MIN, T_MAX]) for (const pressure of [1, P_MAX]) {
    assert.ok(phase(temperature, pressure, phaseIndex).S > 0);
  }
});

test('equilibrium Gibbs energy increases and molar volume decreases with pressure', () => {
  for (const model of ['ideal', 'water']) for (const temperature of [220, 273.16, 300, 450, 600]) {
    let previous = null;
    for (let index = 0; index <= 100; index += 1) {
      const pressure = Math.exp(Math.log(1) + Math.log(P_MAX) * index / 100);
      const state = tp(model, temperature, pressure);
      if (previous) {
        assert.ok(state.G > previous.G, `${model}: g must increase at fixed T`);
        assert.ok(state.V <= previous.V * (1 + 1e-12), `${model}: v must not increase with P`);
      }
      previous = state;
    }
  }
});

test('heat capacities, compressibilities, and Maxwell relation have stable signs', () => {
  const samples = [
    temperature => ideal(temperature, 1e5),
    ...[0, 1, 2].map(phaseIndex => temperature => phase(temperature, 1e5, phaseIndex)),
  ];
  for (const sample of samples) {
    const temperature = 310, dt = 1e-3, dp = 10;
    const state = sample(temperature);
    const cp = (sample(temperature + dt).H - sample(temperature - dt).H) / (2 * dt);
    assert.ok(cp > 0);
    const phaseIndex = samples.indexOf(sample) - 1;
    const atPressure = pressure => phaseIndex < 0 ? ideal(temperature, pressure) : phase(temperature, pressure, phaseIndex);
    const dVdP = (atPressure(1e5 + dp).V - atPressure(1e5 - dp).V) / (2 * dp);
    assert.ok(dVdP < 0);
    const dSdP = (atPressure(1e5 + dp).S - atPressure(1e5 - dp).S) / (2 * dp);
    const atTemperature = value => phaseIndex < 0 ? ideal(value, 1e5) : phase(value, 1e5, phaseIndex);
    const dVdT = (atTemperature(temperature + dt).V - atTemperature(temperature - dt).V) / (2 * dt);
    near(dSdP, -dVdT, 2e-5, 1e-10);
    const dSdT = (atTemperature(temperature + dt).S - atTemperature(temperature - dt).S) / (2 * dt);
    near(dSdT, cp / state.T, 2e-7, 1e-8);
  }
});

test('triple-point latent heats and molar volumes match the model definition', () => {
  const phases = [0, 1, 2].map(index => phase(T0, P0, index));
  for (const state of phases) near(state.G, 0, 0, 1e-10);
  near(phases[1].H - phases[0].H, 6010);
  near(phases[2].H - phases[1].H, 45000);
  assert.ok(phases[0].V > phases[1].V);
});

test('all ideal-gas natural-coordinate inversions and tangent slopes agree', () => {
  const state = ideal(330, 1.2e5);
  for (const potential of Object.keys(AXES)) {
    const [x, y] = coordinates(state, potential);
    const recovered = fromXY('ideal', potential, x, y);
    for (const key of ['T', 'P', 'S', 'V', 'U']) near(recovered[key], state[key], 1e-8);
    for (let axis = 0; axis < 2; axis += 1) {
      const delta = 1e-4, upperArgs = [x, y], lowerArgs = [x, y];
      upperArgs[axis] += delta; lowerArgs[axis] -= delta;
      const upper = coordinates(fromXY('ideal', potential, ...upperArgs), potential)[2];
      const lower = coordinates(fromXY('ideal', potential, ...lowerArgs), potential)[2];
      near((upper - lower) / (2 * delta), slopes(state, potential)[axis], 1e-5);
    }
  }
});

test('reversible piston and heat operations preserve their stated constraints', () => {
  const state = ideal(300, 1e5);
  const adiabatic = operate('ideal', 'adiabatic', state, 'volume', state.V * 0.8);
  near(adiabatic.state.S, state.S, 0, 1e-10);
  near(adiabatic.state.T, 300 * 0.8 ** (-2 / 3));
  near(adiabatic.Q, 0); near(adiabatic.W, -adiabatic.dU);
  const isothermal = operate('ideal', 'isothermal', state, 'volume', state.V * 1.2);
  near(isothermal.state.T, state.T);
  near(isothermal.W, R * 300 * Math.log(1.2));
  const isobaric = operate('ideal', 'isobaric', state, 'heat', 1000);
  near(isobaric.state.P, state.P); near(isobaric.Q, 1000);
  near(isobaric.state.T, 300 + 1000 / (2.5 * R));
  const fixedVolumeHeat = operate('ideal', 'adiabatic', state, 'heat', 100);
  near(fixedVolumeHeat.state.V, state.V); near(fixedVolumeHeat.dU, 100);
  assert.ok(fixedVolumeHeat.state.S > state.S);
});

test('heat is available only for potentials with ds or du', () => {
  const state = ideal(300, 1e5);
  operate('ideal', 'adiabatic', state, 'heat', 100);
  operate('ideal', 'isobaric', state, 'heat', 100);
  rejects(() => operate('ideal', 'isothermal', state, 'heat', 100));
  rejects(() => operate('ideal', 'bath', state, 'heat', 100));
});

test('thermal-coordinate targets are physical heat operations', () => {
  const idealState = ideal(300, 1e5);
  for (const [mode, coordinate, delta] of [['adiabatic','S',1], ['adiabatic','U',.1], ['isobaric','S',1]]) {
    const initial = idealState[coordinate] * ({S:1,U:.001})[coordinate];
    const result = thermalTarget('ideal', mode, idealState, coordinate, initial + delta);
    near(result.state[coordinate] * ({S:1,U:.001})[coordinate], initial + delta);
    near(result.dU, result.Q - result.W, 1e-8, 1e-6);
    near(result.Q_control, mode === 'adiabatic' ? result.state.U - idealState.U : result.state.H - idealState.H);
  }
  const waterState = tp('water', 270, 1e5);
  const result = thermalTarget('water', 'isobaric', waterState, 'S', waterState.S + 3);
  near(result.state.S, waterState.S + 3);
  near(result.Q_control, result.state.H - waterState.H);
});

test('temperature, volume, and pressure operations follow natural variables', () => {
  const state = ideal(300, 1e5);
  const fTemperature = operate('ideal', 'isothermal', state, 'temperature', 320).state;
  near(fTemperature.T, 320); near(fTemperature.V, state.V);
  const hPressure = operate('ideal', 'isobaric', state, 'pressure', 1.1e5).state;
  near(hPressure.P, 1.1e5); near(hPressure.S, state.S);
  const gTemperature = operate('ideal', 'bath', state, 'temperature', 320).state;
  near(gTemperature.T, 320); near(gTemperature.P, state.P);
  const gPressure = operate('ideal', 'bath', state, 'pressure', 1.1e5).state;
  near(gPressure.P, 1.1e5); near(gPressure.T, state.T);
  for (const [mode, action, value] of [
    ['adiabatic', 'temperature', 320], ['adiabatic', 'pressure', 1.1e5],
    ['isothermal', 'pressure', 1.1e5], ['isobaric', 'temperature', 320],
    ['isobaric', 'volume', 0.03], ['bath', 'volume', 0.03],
  ]) rejects(() => operate('ideal', mode, state, action, value));
});

test('water latent-heat plateaus and coexistence tangents are present', () => {
  const enthalpyOffset = phase(T0, P0, 0).H;
  for (const [enthalpies, pair] of [[ [2000, 4000], [0, 1] ], [ [22000, 33000], [1, 2] ]]) {
    const [a, b] = enthalpies.map(enthalpy => fixedP('water', 'H', enthalpy + enthalpyOffset, 1e5));
    near(a.T, b.T, 0, 1e-8);
    near(b.S - a.S, (b.H - a.H) / a.T);
    assert.ok(a.fractions[pair[0]] > 0 && a.fractions[pair[1]] > 0);
    assert.ok(b.fractions[pair[1]] > a.fractions[pair[1]]);
    const info = tangentInfo('water', a, 'G');
    assert.equal(info.coexistence, true); assert.equal(info.limits.length, 2);
  }
});

test('water coexistence can be inverted through T-v and fixed-v coordinates', () => {
  const state = fixedP('water', 'H', 28000, 1e5);
  const recovered = tv('water', state.T, state.V);
  near(recovered.P, 1e5); near(recovered.S, state.S);
  for (const key of ['S', 'U']) {
    const back = fixedV('water', key, state[key], state.V);
    near(back.T, state.T); back.fractions.forEach((value, index) => near(value, state.fractions[index]));
  }
});

test('water natural-coordinate tangents agree through coexistence transformations', () => {
  const state = fixedP('water', 'H', 28000, 1e5);
  for (const potential of ['U', 'S', 'F', 'H']) {
    const [x, y] = coordinates(state, potential);
    for (let axis = 0; axis < 2; axis += 1) {
      const delta = 1e-4, upperArgs = [x, y], lowerArgs = [x, y];
      upperArgs[axis] += delta; lowerArgs[axis] -= delta;
      const upper = coordinates(fromXY('water', potential, ...upperArgs), potential)[2];
      const lower = coordinates(fromXY('water', potential, ...lowerArgs), potential)[2];
      near((upper - lower) / (2 * delta), slopes(state, potential)[axis], 2e-5, 1e-6);
    }
  }
});

test('melting line obeys the Clapeyron slope and has negative sign', () => {
  const target = phase(T0, P0, 0).H + 3000;
  const a = fixedP('water', 'H', target, 1e5), b = fixedP('water', 'H', target, 1.01e5);
  const [solid, liquid] = [0, 1].map(index => phase(a.T, a.P, index));
  const clapeyron = (liquid.V - solid.V) / (liquid.S - solid.S);
  assert.ok(clapeyron < 0);
  near((b.T - a.T) / 1000, clapeyron, 1e-4, 1e-12);
});

test('sampled paths and first-law accounting remain physical', () => {
  const state = ideal(300, 1e5);
  const result = dispatch({kind:'operate', model:'ideal', potential:'U', mode:'adiabatic', state, action:'volume', value:state.V * 1.3});
  assert.equal(result.path.length, 12);
  for (const point of result.path) near(point.S, state.S, 0, 1e-9);
  for (const [mode, action, value] of [['adiabatic','heat',100], ['isothermal','volume',state.V*1.1], ['isobaric','pressure',1.1e5], ['bath','temperature',320]]) {
    const operation = operate('ideal', mode, state, action, value);
    near(operation.dU, operation.Q - operation.W, 1e-8, 1e-6);
  }
});

test('every allowed operation obeys its constraint and the first law in both models', () => {
  for (const model of ['ideal', 'water']) {
    const state = tp(model, 300, 1e5);
    const cases = [
      ['adiabatic', 'heat', 100, 'V'],
      ['adiabatic', 'volume', state.V * (model === 'water' ? 0.999 : 0.98), 'S'],
      ['isothermal', 'temperature', 301, 'V'],
      ['isothermal', 'volume', state.V * (model === 'water' ? 0.999 : 0.98), 'T'],
      ['isobaric', 'heat', 100, 'P'],
      ['isobaric', 'pressure', 1.01e5, 'S'],
      ['bath', 'temperature', 301, 'P'],
      ['bath', 'pressure', 1.01e5, 'T'],
    ];
    for (const [mode, action, value, fixed] of cases) {
      const result = operate(model, mode, state, action, value);
      near(result.state[fixed], state[fixed], 2e-7, 1e-7);
      near(result.dU, result.Q - result.W, 2e-8, 2e-6);
    }
  }
});

test('validity specifications expose exactly the allowed controls', () => {
  const state = ideal(300, 1e5);
  for (const [mode, potential, expected] of [
    ['adiabatic','U',['thermal','volume','x','y']], ['isothermal','F',['temperature','volume','x','y']],
    ['isobaric','H',['pressure','thermal','x','y']], ['bath','G',['temperature','pressure','x','y']],
  ]) {
    const result = validity('ideal', mode, state, potential, bounds('ideal', potential, state));
    assert.deepEqual(Object.keys(result).sort(), expected.sort());
    for (const spec of Object.values(result)) {
      assert.ok(spec.min < spec.max); assert.equal(spec.values.length, 161);
      assert.equal(spec.valid.length, 161); assert.ok(spec.valid.some(Boolean));
    }
  }
  const local = validity('ideal', 'bath', state, 'G', bounds('ideal', 'G', state));
  const global = validity('ideal', 'bath', state, 'G', globalBounds('ideal', 'G'), true);
  assert.equal(global.y.logarithmic, true);
  assert.ok(global.x.min <= local.x.min && global.x.max >= local.x.max);
  assert.ok(global.y.min <= local.y.min && global.y.max >= local.y.max);
});

test('boundary-fitted surfaces contain finite, physically invertible cells', () => {
  for (const model of ['ideal', 'water']) for (const potential of Object.keys(AXES)) {
    const state = tp(model, model === 'ideal' ? 300 : 260, 1e5);
    const result = surface(model, potential, bounds(model, potential, state), state, 11);
    assert.ok(result.patches.length > 0);
    for (const patch of result.patches) for (let row = 0; row < patch.z.length; row += 1) {
      for (let column = 0; column < patch.z[row].length; column += 1) {
        const z = patch.z[row][column]; assert.ok(Number.isFinite(z));
        assert.equal(patch.fractions[row][column].length, 3);
        near(patch.fractions[row][column].reduce((sum, value) => sum + value, 0), 1);
        // Parametric water sheets include exact pressure-domain endpoints.
        // Test inversion in their interior: at a coexistence endpoint the
        // TP tie-breaking convention can exclude the other pure endpoint.
        if(model==='ideal'||(row>0&&row<patch.z.length-1&&column>0&&column<patch.z[row].length-1))
          near(coordinates(fromXY(model, potential, patch.x[row][column], patch.y[row][column]), potential)[2], z);
      }
    }
  }
});

test('water surfaces carry phase composition and visible triple-point annotations', () => {
  const coexistence = fixedP('water', 'H', 28000, 1e5);
  const enthalpySurface = surface('water', 'H', bounds('water', 'H', coexistence), coexistence, 25);
  assert.ok(enthalpySurface.patches.some(patch => patch.fractions.flat().some(values => values.filter(value => value > 1e-4).length > 1)));

  const triple = phase(T0, P0, 0), limits = [[270, 276], [0.4, 0.9]];
  const gibbsSurface = surface('water', 'G', limits, triple, 17);
  assert.equal(gibbsSurface.collapsedCoexistence, true);
  assert.equal(gibbsSurface.annotations.length, 1);
  assert.equal(gibbsSurface.annotations[0].label, 'Triple point');
  near(gibbsSurface.annotations[0].point[0], T0);
  near(gibbsSurface.annotations[0].point[1], P0 * 0.001);
});

test('collapsed Gibbs coexistence sets are stable colored boundary curves', () => {
  const limits = [[250, 450], [0.2, 200]], boundaries = gibbsPhaseBoundaries(limits, 61);
  assert.ok(boundaries.length >= 2);
  for (const boundary of boundaries) for (const [temperature, displayedPressure, gibbs] of boundary.points) {
    const pressure=displayedPressure/0.001,states=boundary.phases.map(index=>phase(temperature,pressure,index));
    near(states[0].G,states[1].G,0,1e-5);
    near(gibbs,states[0].G*0.001,0,1e-8);
    assert.ok(tp('water',temperature,pressure).G>=states[0].G-1e-5);
  }
});

test('global bounds contain the full sampled domain and use a logarithmic second axis', () => {
  for(const model of ['ideal','water'])for(const potential of Object.keys(AXES)){
    const limits=globalBounds(model,potential),[xkey,ykey]=AXES[potential];
    for(const temperature of [T_MIN,300,T_MAX])for(const pressure of [1,1e5,P_MAX]){
      const state=tp(model,temperature,pressure),x=state[xkey]*({T:1,S:1,U:.001})[xkey],y=state[ykey]*({V:1000,P:.001})[ykey];
      assert.ok(limits[0][0]<=x&&x<=limits[0][1]);assert.ok(limits[1][0]<=y&&y<=limits[1][1]);
    }
  }
  const result=dispatch({kind:'globalSurface',model:'water',potential:'G',count:9,yCount:17});
  assert.deepEqual(result.logAxes,[1]);assert.ok(result.patches.some(patch=>patch.y.length>=17));
});

test('u and h entropy axes closely frame the attainable envelope', () => {
  for (const model of ['ideal', 'water']) for (const potential of ['U', 'H']) {
    const state = tp(model, model === 'ideal' ? 300 : 260, 1e5);
    const limits = bounds(model, potential, state), envelope = entropyEnvelope(model, potential, limits[1]);
    assert.ok(limits[0][0] < envelope[0] && limits[0][1] > envelope[1]);
    const ratio = (limits[0][1] - limits[0][0]) / (envelope[1] - envelope[0]);
    near(ratio, 1.12, 0, 1e-10);
    assert.ok(limits[0][0] <= state.S && state.S <= limits[0][1]);
  }
});

test('triple-point tangent ambiguity appears only in transformed potentials', () => {
  const [solid, liquid, vapor] = [0, 1, 2].map(index => phase(T0, P0, index));
  const state = mix(mix(solid, liquid, 0.5), vapor, 0.2);
  for (const potential of ['F', 'H', 'G']) assert.equal(tangentInfo('water', state, potential).nonunique, true);
  for (const potential of ['S', 'U']) assert.equal(tangentInfo('water', state, potential).nonunique, false);
});

test('values outside the thermodynamic model are rejected', () => {
  rejects(() => tp('water', 700, 1e5));
  const minimum = tp('water', 300, P_MAX).V;
  rejects(() => tv('water', 300, minimum * 0.9999));
});


test('phase-fitted sheets share coexistence edges and the triple plane', async () => {
  const {waterPatches,coexistenceTemperature}=await import('../static/physics.mjs');
  const {surfaceGeometry}=await import('../static/surface_canvas.mjs');
  for(const p of [10,P0,1e5,1e7])for(const [a,b] of (p<P0?[[0,2]]:[[0,1],[1,2]])){
    const t=coexistenceTemperature(p,a,b);
    if(t===T_MIN||t===T_MAX)continue;
    const left=phase(t,p,a),right=phase(t,p,b);
    near(left.G,right.G,0,1e-7);
    assert.ok(left.G<=tp('water',t,p).G+1e-7);
    for(const f of [.1,.5,.9]){
      const st=mix(left,right,f);
      near(st.U,st.T*st.S-st.P*st.V+st.G,0,1e-7);
    }
  }
  for(const potential of ['U','S','F','H','G']){
    const limits=globalBounds('water',potential),patches=waterPatches(potential,limits,11,31);
    assert.ok(patches.every(p=>p.region));
    for(const patch of patches.filter(p=>p.region.length===2)){
      for(const side of [0,patch.x[0].length-1]){
        const pure=patches.filter(p=>p.region===patch.region[side===0?0:1]);
        for(let row=0;row<patch.x.length;row++){
          const target=[patch.x[row][side],patch.y[row][side],patch.z[row][side]];
          assert.ok(pure.some(p=>p.x.some((xs,r)=>[0,xs.length-1].some(c=>
            [p.x[r][c],p.y[r][c],p.z[r][c]].every((v,i)=>Math.abs(v-target[i])<1e-7*Math.max(1,Math.abs(v)))))));
        }
      }
    }
    const geometry=surfaceGeometry({patches,limits,collapsedCoexistence:potential==='G'});
    assert.ok(geometry.length>0);
    assert.ok(geometry.every(cell=>cell.raw.every(p=>p.every(Number.isFinite)&&limits.every((r,i)=>p[i]>=r[0]-1e-8&&p[i]<=r[1]+1e-8))));
    if(['U','S'].includes(potential)){
      const triple=patches.find(p=>p.region==='012');assert.ok(triple);
      for(let r=0;r<triple.x.length;r++)for(let c=0;c<2;c++){
        const x=triple.x[r][c],v=triple.y[r][c]/1000,z=triple.z[r][c];
        const u=potential==='U'?z*1000:x*1000,entropy=potential==='U'?x:z;
        near(u,T0*entropy-P0*v+phase(T0,P0,0).G,0,1e-7);
      }
    }else assert.ok(!patches.some(p=>p.region==='012'));
  }
});

test('Gibbs boundary polylines use the sheet edge vertices on a logarithmic global view', () => {
  const surf=dispatch({kind:'globalSurface',model:'water',potential:'G'});
  for(const boundary of surf.phaseBoundaries){
    const patches=surf.patches.filter(p=>p.region===String(boundary.phases[0]));
    for(const point of boundary.points)assert.ok(patches.some(p=>p.x.some((row,r)=>{
      const c=row.length-1;return [p.x[r][c],p.y[r][c],p.z[r][c]].every((v,i)=>v===point[i]);
    })));
  }
  assert.ok(surf.phaseBoundaries.some(b=>b.phases.join('')==='12'));
});

test('mixed volume scale is continuous, invertible, and reserves condensed-phase width', async () => {
  const {axisCoordinate,axisInverse,surfaceGeometry}=await import('../static/surface_canvas.mjs');
  for(const potential of ['U','S','F']){
    const surf=dispatch({kind:'globalSurface',model:'water',potential});
    const [low,high]=surf.limits[1],{knee,linearFraction}=surf.volumeScale;
    near(axisCoordinate(low,surf,1),0);near(axisCoordinate(high,surf,1),1);
    near(axisCoordinate(knee,surf,1),linearFraction);
    assert.ok(linearFraction>=.4);
    const values=[low,(low+knee)/2,knee,knee*(1+1e-10),.1,1,100,high];
    values.forEach(v=>near(axisInverse(axisCoordinate(v,surf,1),surf,1),v));
    for(let i=1;i<values.length;i++)assert.ok(axisCoordinate(values[i],surf,1)>axisCoordinate(values[i-1],surf,1));
    const cells=surfaceGeometry(surf);
    assert.ok(cells.every(c=>Math.max(...c.raw.map(p=>p[1]))<=knee+1e-10||Math.min(...c.raw.map(p=>p[1]))>=knee-1e-10));
  }
});

test('local volume windows contain the state throughout the former 0.020–0.030 gap', async () => {
  const {surfaceGeometry}=await import('../static/surface_canvas.mjs');
  const initial=tp('water',260,1e5);
  for(const potential of ['U','S','F'])for(const volume of [.0198,.0201,.021,.025,.0299,.0301,.04]){
    const st=operate('water',potential==='F'?'isothermal':'adiabatic',initial,'volume',volume/1000).state;
    const limits=bounds('water',potential,st),point=coordinates(st,potential);
    limits.forEach((range,i)=>assert.ok(range[0]<=point[i]&&point[i]<=range[1]));
    const surf=surface('water',potential,limits,st,17);
    const cells=surfaceGeometry(surf),zs=cells.flatMap(c=>c.raw.map(p=>p[2]));
    assert.ok(point[2]>=Math.min(...zs)-.02&&point[2]<=Math.max(...zs)+.02);
  }
});
