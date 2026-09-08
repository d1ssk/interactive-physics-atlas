/** Thermodynamic model used by the browser application.
 * All extensive state values are molar quantities in SI. Rendering stays outside this module.
 */
export const R=8.31446261815324, T0=273.16, P0=611.657;
export const T_MIN=200, T_MAX=620, P_MIN=1, P_MAX=50e6;
export const AVOGADRO=6.02214076e23, PLANCK=6.62607015e-34, ARGON_MOLAR_MASS=39.948e-3;
export function sackurTetrode(u,v){
  const particleMass=ARGON_MOLAR_MASS/AVOGADRO,particleEnergy=u/AVOGADRO,particleVolume=v/AVOGADRO;
  return R*(Math.log(particleVolume*(4*Math.PI*particleMass*particleEnergy/(3*PLANCK**2))**1.5)+2.5);
}
// The water value is chosen so this constant-cp model gives 69.95 J/(mol K)
// for liquid water at 298.15 K and 1 bar.
export const S_IDEAL_REF=sackurTetrode(1.5*R*300,R*300/1e5);
export const S_ICE_REF=69.95-75.3*Math.log(298.15/T0)-6010/T0;
const CP=[37,75.3,34], SREF=[S_ICE_REF,S_ICE_REF+6010/T0,S_ICE_REF+51010/T0], VREF=[19.65e-6,18.02e-6], KAPPA=[1.2e-10,4.5e-10];
export const AXES={U:['S','V','U'],S:['U','V','S'],F:['T','V','F'],H:['S','P','H'],G:['T','P','G']};
export const SCALE={T:1,S:1,V:1000,P:.001,U:.001,F:.001,H:.001,G:.001};
export const SYMBOL={T:'T',S:'s',V:'v',P:'P',U:'u',F:'f',H:'h',G:'g'};
export const UNITS={T:'K',S:'J/(mol K)',V:'L/mol',P:'kPa',U:'kJ/mol',F:'kJ/mol',H:'kJ/mol',G:'kJ/mol'};
const rangeError=()=>new Error('モデルの温度・圧力範囲外です（200–620 K、1 Pa–50 MPa）。');
function finish(T,P,V,S,H,fractions){const U=H-P*V;return {T,P,V,S,H,U,F:U-T*S,G:H-T*S,fractions};}
export function ideal(t,p){
  if(!(T_MIN-1e-9<=t&&t<=T_MAX+1e-9&&P_MIN-1e-6<=p&&p<=P_MAX+1e-6))throw rangeError();
  t=Math.max(T_MIN,Math.min(T_MAX,t));p=Math.max(P_MIN,Math.min(P_MAX,p));
  const cv=1.5*R,v=R*t/p,s=sackurTetrode(cv*t,v);
  return finish(t,p,v,s,(cv+R)*t,[0,0,1]);
}
export function phase(t,p,i){
  const cp=CP[i],sr=SREF[i];let g=cp*(t-T0-t*Math.log(t/T0))-sr*(t-T0),s=sr+cp*Math.log(t/T0),v;
  if(i===2){g+=R*t*Math.log(p/P0);s-=R*Math.log(p/P0);v=R*t/p;}
  else{const dp=p-P0;v=VREF[i]*(1-KAPPA[i]*dp);g+=VREF[i]*(dp-.5*KAPPA[i]*dp*dp);}
  return finish(t,p,v,s,g+t*s,[0,1,2].map(j=>+(j===i)));
}
export function tp(model,t,p){
  if(model==='ideal')return ideal(t,p);
  if(!(T_MIN-1e-9<=t&&t<=T_MAX+1e-9&&P_MIN-1e-6<=p&&p<=P_MAX+1e-6))throw rangeError();
  t=Math.max(T_MIN,Math.min(T_MAX,t));p=Math.max(P_MIN,Math.min(P_MAX,p));
  return [0,1,2].map(i=>phase(t,p,i)).reduce((a,b)=>a.G<=b.G?a:b);
}
export function mix(a,b,f){
  f=Math.min(1,Math.max(0,f));const out={};
  for(const key of Object.keys(a))out[key]=key==='fractions'?a[key].map((x,i)=>x*(1-f)+b[key][i]*f):a[key]*(1-f)+b[key]*f;
  return out;
}
export function invert(fn,key,target,lo,hi,increasing=true,logarithmic=false){
  let a=fn(lo),b=fn(hi);const lower=Math.min(a[key],b[key]),upper=Math.max(a[key],b[key]),tol=Math.max(Math.abs(target),1e-9)*1e-10;
  if(!(lower-tol<=target&&target<=upper+tol))throw Error('この自然変数の組はモデルの計算範囲外です。範囲を狭めるか別の点を選んでください。');
  for(let i=0;i<48;i++){const mid=logarithmic?Math.sqrt(lo*hi):(lo+hi)/2,c=fn(mid);if((c[key]<target)===increasing){lo=mid;a=c;}else{hi=mid;b=c;}}
  const gap=b[key]-a[key];return Math.abs(gap)>1e-20?mix(a,b,(target-a[key])/gap):a;
}
// Bounded memoization; returned states are immutable to the UI (structured clone).
const tvCache=new Map(),intervalCache=new Map();
function memo(cache,key,fn,limit){if(cache.has(key))return cache.get(key);const value=fn();if(cache.size>=limit)cache.delete(cache.keys().next().value);cache.set(key,value);return value;}
export function tv(model,t,v){return memo(tvCache,`${model}|${t}|${v}`,()=>model==='ideal'?ideal(t,R*t/v):invert(p=>tp(model,t,p),'V',v,P_MIN,P_MAX,false,true),8192);}
export function temperatureInterval(model,v){return memo(intervalCache,`${model}|${v}`,()=>{
  if(model==='ideal'){const lo=Math.max(T_MIN,P_MIN*v/R),hi=Math.min(T_MAX,P_MAX*v/R);if(lo>hi)throw Error('この体積では安定な平衡状態を計算できません。');return [lo,hi];}
  const feasible=t=>tp(model,t,P_MAX).V<=v&&v<=tp(model,t,P_MIN).V;
  const ts=Array.from({length:81},(_,i)=>T_MIN+(T_MAX-T_MIN)*i/80),valid=ts.map((t,i)=>feasible(t)?i:-1).filter(i=>i>=0);
  if(!valid.length)throw Error('この体積では安定な平衡状態を計算できません。');
  let lo=ts[valid[0]],hi=ts[valid.at(-1)];
  if(valid[0]>0){let left=ts[valid[0]-1],right=lo;for(let i=0;i<40;i++){const mid=(left+right)/2;if(feasible(mid))right=mid;else left=mid;}lo=right;}
  if(valid.at(-1)<80){let left=hi,right=ts[valid.at(-1)+1];for(let i=0;i<40;i++){const mid=(left+right)/2;if(feasible(mid))left=mid;else right=mid;}hi=left;}
  return [lo,hi];
},4096);}
export function fixedV(model,key,value,v){
  if(model==='ideal'){const t=key==='S'?300*Math.exp((value-S_IDEAL_REF-R*Math.log(v/(R*300/1e5)))/(1.5*R)):value/(1.5*R);return tv(model,t,v);}
  const [lo,hi]=temperatureInterval(model,v);return invert(t=>tv(model,t,v),key,value,lo,hi);
}
export const fixedP=(model,key,value,p)=>invert(t=>tp(model,t,p),key,value,T_MIN,T_MAX);
export const coordinates=(state,potential)=>AXES[potential].map(k=>state[k]*SCALE[k]);
export function siSlopes(state,potential){const {T:t,P:p,V:v,S:s}=state;return {U:[t,-p],S:[1/t,p/t],F:[-s,-p],H:[t,v],G:[-s,v]}[potential];}
export function slopes(state,potential){const si=siSlopes(state,potential),[x,y,z]=AXES[potential];return [si[0]*SCALE[z]/SCALE[x],si[1]*SCALE[z]/SCALE[y]];}
export function fromXY(model,potential,x,y){
  const [a,b]=AXES[potential];x/=SCALE[a];y/=SCALE[b];
  switch(potential){case'U':return fixedV(model,'S',x,y);case'S':return fixedV(model,'U',x,y);case'F':return tv(model,x,y);case'H':return fixedP(model,'S',x,y);default:return tp(model,x,y);}
}
export function entropyEnvelope(model,potential,yBounds,count=41){
  if(!['U','H'].includes(potential))throw Error('エントロピーが第1軸の曲面だけに使用できます。');
  const values=[];
  for(let index=0;index<count;index++){
    const fraction=index/(count-1),y=Math.exp(Math.log(yBounds[0])+Math.log(yBounds[1]/yBounds[0])*fraction);
    try{
      if(potential==='U'){
        const volume=y/SCALE.V,[lo,hi]=temperatureInterval(model,volume);
        values.push(tv(model,lo,volume).S,tv(model,hi,volume).S);
      }else{
        const pressure=y/SCALE.P;
        values.push(tp(model,T_MIN,pressure).S,tp(model,T_MAX,pressure).S);
      }
    }catch{}
  }
  if(!values.length)throw Error('表示する第2自然変数の範囲に平衡状態がありません。');
  return [Math.min(...values),Math.max(...values)];
}
export function bounds(model,potential,state){
  const [x,y]=coordinates(state,potential);let xb;
  let yb=[Math.max(.000001,y*.35),y*1.8];
  if(AXES[potential][1]==='P')yb=[Math.max(.001,y*.35),Math.min(50000,y*1.8)];
  else if(model==='water'&&y<.03)yb=[.0176,Math.max(.020,y+(y-.0176)*.25)];
  if(['U','H'].includes(potential)){
    const envelope=entropyEnvelope(model,potential,yb),span=envelope[1]-envelope[0],padding=Math.max(.5,span*.06);
    xb=[Math.min(envelope[0],x)-padding,Math.max(envelope[1],x)+padding];
  }else{
    if(model==='ideal')xb={S:[2.5,7.7],F:[200,620],G:[200,620]}[potential];
    else xb={S:[Math.max(-4,x-10),Math.min(65,x+18)],F:[220,550],G:[220,550]}[potential];
    const margin=Math.max(1,xb[1]-xb[0])*.1;xb=[Math.min(xb[0],x-margin),Math.max(xb[1],x+margin)];
    if(AXES[potential][0]==='T')xb=[Math.max(T_MIN,xb[0]),Math.min(T_MAX,xb[1])];
  }
  return [xb,yb];
}
const globalBoundsCache=new Map();
export function globalBounds(model,potential){
  const cacheKey=`${model}|${potential}`;if(globalBoundsCache.has(cacheKey))return globalBoundsCache.get(cacheKey);
  const [xkey,ykey]=AXES[potential],yb=ykey==='P'?[P_MIN*SCALE.P,P_MAX*SCALE.P]:volumeDomain(model).map(value=>value*SCALE.V);let xb;
  if(xkey==='T')xb=[T_MIN,T_MAX];
  else if(xkey==='S'){
    const envelope=entropyEnvelope(model,potential,yb,61),padding=(envelope[1]-envelope[0])*.025;xb=[envelope[0]-padding,envelope[1]+padding];
  }else{
    const values=[];
    for(let ti=0;ti<=32;ti++)for(let pi=0;pi<=32;pi++){
      const temperature=T_MIN+(T_MAX-T_MIN)*ti/32,pressure=Math.exp(Math.log(P_MIN)+Math.log(P_MAX/P_MIN)*pi/32);
      values.push(tp(model,temperature,pressure)[xkey]*SCALE[xkey]);
    }
    const low=Math.min(...values),high=Math.max(...values),padding=(high-low)*.025;xb=[low-padding,high+padding];
  }
  const result=[xb,yb];globalBoundsCache.set(cacheKey,result);return result;
}
export function rowInterval(model,potential,y,limits){
  const [xkey,ykey]=AXES[potential],actualY=y/SCALE[ykey];let a,b;
  if(ykey==='V'){const [lo,hi]=temperatureInterval(model,actualY);a=tv(model,lo,actualY);b=tv(model,hi,actualY);}
  else{a=tp(model,T_MIN,actualY);b=tp(model,T_MAX,actualY);}
  const left=Math.max(limits[0][0],a[xkey]*SCALE[xkey]),right=Math.min(limits[0][1],b[xkey]*SCALE[xkey]);
  if(left>right)throw Error('表示範囲との交差がありません。');return [left,right];
}
export function gibbsPhaseBoundaries(limits,count=121,patches=waterPatches('G',limits,25,count)){
  // Read the actual sheet edges. A separately sampled curve bends differently
  // after logarithmic projection even when both sets of vertices are physical.
  const boundaries=[];
  for(const patch of patches){
    const a=Number(patch.region);if(a===2)continue;
    let points=[],pair=null;
    const flush=()=>{if(points.length>1)boundaries.push({phases:pair,points});points=[];};
    for(let row=0;row<patch.x.length;row++){
      const column=patch.x[row].length-1;
      const point=[patch.x[row][column],patch.y[row][column],patch.z[row][column]];
      const [t,displayedP]=point,p=displayedP/SCALE.P;
      // Below the triple point solid meets vapor; above it solid meets liquid.
      const b=a===1?2:(patch.y[0][0]<P0*SCALE.P?2:1);
      const valid=Math.abs(phase(t,p,a).G-phase(t,p,b).G)<1e-5;
      if(!valid){flush();continue;}
      pair=[a,b];points.push(point);
    }
    flush();
  }
  return boundaries;
}
// The entropy difference of each ordered pair stays positive on this model's
// domain, so g_i-g_j increases monotonically with T. Endpoints outside the
// domain collapse to its edge; no metastable extension is rendered.
export function coexistenceTemperature(p, a, b) {
  let lo=T_MIN,hi=T_MAX;
  const difference=t=>phase(t,p,a).G-phase(t,p,b).G;
  if(difference(lo)>=0)return lo;
  if(difference(hi)<=0)return hi;
  for(let i=0;i<44;i++){const mid=(lo+hi)/2;if(difference(mid)>0)hi=mid;else lo=mid;}
  return (lo+hi)/2;
}
const waterMeshCache=new Map();
export function waterPatches(potential,limits,count=45,yCount=121) {
  count=Math.min(count,25);
  const pressureAxis=AXES[potential][1]==='P';
  const low=pressureAxis?Math.max(P_MIN,limits[1][0]/SCALE.P):P_MIN;
  const high=pressureAxis?Math.min(P_MAX,limits[1][1]/SCALE.P):P_MAX;
  const key=JSON.stringify([potential,limits,count,yCount]);
  return memo(waterMeshCache,key,()=>{
    const n=Math.max(61,Math.ceil(yCount/2)),pressures=[low,high];
    for(let i=0;i<n;i++){
      pressures.push(low*(high/low)**(i/(n-1)),low+(high-low)*i/(n-1));
    }
    // Resolve the small condensed-volume window without densifying the gas.
    if(!pressureAxis)for(let phaseIndex=0;phaseIndex<2;phaseIndex++){
      const ends=limits[1].map(v=>P0+(1-v/SCALE.V/VREF[phaseIndex])/KAPPA[phaseIndex]);
      const a=Math.max(low,Math.min(...ends)),b=Math.min(high,Math.max(...ends));
      if(a<b)for(let i=0;i<n;i++)pressures.push(a+(b-a)*i/(n-1));
    }
    if(low<P0&&P0<high)pressures.push(P0);
    // Include where coexistence enters/exits the model's temperature domain.
    for(const t of [T_MIN,T_MAX])for(const [a,b] of [[0,1],[0,2],[1,2]]){
      const d=p=>phase(t,p,a).G-phase(t,p,b).G;
      if(d(low)*d(high)<0){let l=low,h=high;for(let i=0;i<44;i++){const m=Math.sqrt(l*h);if(d(l)*d(m)<=0)h=m;else l=m;}pressures.push(Math.sqrt(l*h));}
    }
    const ps=[...new Set(pressures)].sort((a,b)=>a-b),patches=[];
    const makePatch=(rows,region)=>{
      if(rows.some(row=>row===null)){
        let run=[];for(const row of [...rows,null]){if(row)run.push(row);else{if(run.length)makePatch(run,region);run=[];}}return;
      }
      if(rows.length<2)return;
      patches.push({region,x:rows.map(row=>row.map(s=>coordinates(s,potential)[0])),
        y:rows.map(row=>row.map(s=>coordinates(s,potential)[1])),
        z:rows.map(row=>row.map(s=>coordinates(s,potential)[2])),fractions:rows.map(row=>row.map(s=>s.fractions))});
    };
    for(const below of [true,false]){
      const segment=ps.filter(p=>below?p<=P0:p>=P0);
      const phases=below?[0,2]:[0,1,2];
      const rows=phases.map(()=>[]),coexist=phases.slice(1).map(()=>[]);
      for(const p of segment){
        const transitions=phases.slice(1).map((b,i)=>coexistenceTemperature(p,phases[i],b));
        const ts=[T_MIN,...transitions,T_MAX];
        phases.forEach((a,i)=>{
          const stable=phase((ts[i]+ts[i+1])/2,p,a).G<=tp('water',(ts[i]+ts[i+1])/2,p).G+1e-5;
          rows[i].push(stable?Array.from({length:count},(_,j)=>phase(ts[i]+(ts[i+1]-ts[i])*j/(count-1),p,a)):null);
        });
        phases.slice(1).forEach((b,i)=>{
          const t=transitions[i],a=phase(t,p,phases[i]),end=phase(t,p,b);
          // At domain-clamped endpoints the ruled sheet has zero width.
          const valid=Math.abs(a.G-end.G)<1e-5;
          coexist[i].push(valid?Array.from({length:count},(_,j)=>{
            let f=j/(count-1);
            if(!pressureAxis&&a.V!==end.V)f=(a.V*(end.V/a.V)**f-a.V)/(end.V-a.V);
            return mix(a,end,f);
          }):null);
        });
      }
      rows.forEach((row,i)=>makePatch(row,String(phases[i])));
      if(potential!=='G')coexist.forEach((row,i)=>makePatch(row,`${phases[i]}${phases[i+1]}`));
    }
    // In (s,v) and (u,v) the triple set is a genuine planar triangle.
    if(['U','S'].includes(potential)){
      const [a,b,c]=[0,1,2].map(i=>phase(T0,P0,i));
      const rows=Array.from({length:count},(_,i)=>{
        const f=(a.V*(c.V/a.V)**(i/(count-1))-a.V)/(c.V-a.V);
        return [mix(a,c,f),mix(b,c,f)];
      });makePatch(rows,'012');
    }
    return patches;
  },12);
}
export function surface(model,potential,limits,state,count=45,logarithmicY=false,yCount=count){
  const cy=state?coordinates(state,potential)[1]:NaN,[low,high]=limits[1];
  const yAt=fraction=>logarithmicY?Math.exp(Math.log(low)+Math.log(high/low)*fraction):low+(high-low)*fraction;
  const ys=[...new Set([...Array.from({length:yCount},(_,i)=>yAt(i/(yCount-1))),...(low<=cy&&cy<=high?[cy]:[])])].sort((a,b)=>a-b);
  const interval=y=>{try{return rowInterval(model,potential,y,limits);}catch{return null;}};
  const edge=(good,bad)=>{for(let i=0;i<32;i++){const mid=(good+bad)/2;if(interval(mid)===null)bad=mid;else good=mid;}return good;};
  const strips=[];let current=[],previous=null;
  for(const y of model==='water'?[]:ys){const valid=interval(y)!==null;if(valid){if(!current.length&&previous!==null)current.push(edge(y,previous));current.push(y);}else if(current.length){current.push(edge(previous,y));strips.push(current);current=[];}previous=y;}
  if(current.length)strips.push(current);
  const patches=[];
  for(const strip of model==='water'?[]:strips){const x=[],y=[],z=[],fractions=[];for(const yy of [...new Set(strip)].sort((a,b)=>a-b)){
    const [left,right]=interval(yy),inset=(right-left)*1e-10,row=Array.from({length:count},(_,i)=>left+inset+(right-left-2*inset)*i/(count-1));
    const states=row.map(xx=>fromXY(model,potential,xx,yy));
    x.push(row);y.push(Array(count).fill(yy));z.push(states.map(value=>coordinates(value,potential)[2]));fractions.push(states.map(value=>value.fractions));
  }if(x.length>=2)patches.push({x,y,z,fractions});}
  if(model==='water')patches.push(...waterPatches(potential,limits,count,yCount));
  if(!patches.length)throw Error('この表示範囲に曲面がありません。現在点に表示範囲を合わせてください。');
  const annotations=[];
  if(model==='water'){
    const triple=[0,1,2].map(index=>phase(T0,P0,index));
    if(potential==='G')annotations.push({point:coordinates(triple[0],potential),label:'Triple point'});
    else for(const [index,label] of ['Triple point (solid end)','Triple point (liquid end)','Triple point (vapor end)'].entries()){
      annotations.push({point:coordinates(triple[index],potential),label});
    }
  }
  const visibleAnnotations=annotations.filter(({point})=>limits.every((range,index)=>range[0]<=point[index]&&point[index]<=range[1]));
  const volumeScale=model==='water'&&logarithmicY&&AXES[potential][1]==='V'?{axis:1,knee:.020,linearFraction:.42}:null;
  const labels=AXES[potential].map(k=>`${SYMBOL[k]} (${UNITS[k]})`);if(logarithmicY)labels[1]+=volumeScale?' · linear / log':' · log';
  return {patches,limits,annotations:visibleAnnotations,phaseBoundaries:model==='water'&&potential==='G'?gibbsPhaseBoundaries(limits,yCount,patches):[],collapsedCoexistence:potential==='G',volumeScale,logAxes:logarithmicY&&!volumeScale?[1]:[],labels};
}
export function operate(model,mode,state,action,value){
  let out,qControl=0,qBath=0;
  if(action==='heat'){
    qControl=value;
    if(mode==='adiabatic')out=fixedV(model,'U',state.U+value,state.V);
    else if(mode==='isobaric')out=fixedP(model,'H',state.H+value,state.P);
    else throw Error('この熱力学関数には dS または dU がないため、熱を独立に指定できません。温度を操作してください。');
  }else if(action==='volume'){
    if(mode==='adiabatic')out=fixedV(model,'S',state.S,value);
    else if(mode==='isothermal'){out=tv(model,state.T,value);qBath=state.T*(out.S-state.S);}
    else throw Error('等圧ではピストンは自由に動くため、体積を独立に指定できません。');
  }else if(action==='temperature'&&['isothermal','bath'].includes(mode)){
    if(mode==='isothermal'){out=tv(model,value,state.V);qBath=out.U-state.U;}
    else{out=tp(model,value,state.P);qBath=out.H-state.H;}
  }else if(action==='pressure'){
    if(mode==='isobaric')out=fixedP(model,'S',state.S,value);
    else if(mode==='bath'){out=tp(model,state.T,value);qBath=state.T*(out.S-state.S);}
    else throw Error('この熱力学関数には外圧が自然変数として含まれません。');
  }else throw Error('この境界条件では利用できない操作です。');
  const du=out.U-state.U,q=qControl+qBath;
  return {state:out,Q:q,Q_control:qControl,Q_bath:qBath,W:q-du,dU:du};
}
export function thermalTarget(model,mode,state,coordinate,value){
  const target=value/SCALE[coordinate];let out;
  if(mode==='adiabatic'&&['S','U'].includes(coordinate))out=fixedV(model,coordinate,target,state.V);
  else if(mode==='isobaric'&&coordinate==='S')out=fixedP(model,'S',target,state.P);
  else throw Error('この境界条件では熱方向の自然変数を操作できません。');
  const heat=mode==='adiabatic'?out.U-state.U:out.H-state.H;
  return operate(model,mode,state,'heat',heat);
}
function sampleValid(fn,min,max,logarithmic=false,count=161){
  const values=[],valid=[];
  for(let index=0;index<count;index++){
    const fraction=index/(count-1);
    const value=logarithmic?Math.exp(Math.log(min)+(Math.log(max)-Math.log(min))*fraction):min+(max-min)*fraction;
    values.push(value);try{fn(value);valid.push(true);}catch{valid.push(false);}
  }
  return {min,max,logarithmic,values,valid};
}
export function volumeDomain(model){
  const states=[];
  for(let index=0;index<161;index++){
    const temperature=T_MIN+(T_MAX-T_MIN)*index/160;
    for(const pressure of [P_MIN,P_MAX])states.push(tp(model,temperature,pressure));
  }
  return [Math.min(...states.map(state=>state.V)),Math.max(...states.map(state=>state.V))];
}
export function validity(model,mode,state,potential,limits,logarithmicDirectY=false){
  const controls={};
  if(['adiabatic','isothermal'].includes(mode)){
    const [min,max]=volumeDomain(model);
    controls.volume=sampleValid(value=>operate(model,mode,state,'volume',value),min,max,true);
  }
  if(['isothermal','bath'].includes(mode)){
    controls.temperature=sampleValid(value=>operate(model,mode,state,'temperature',value),T_MIN,T_MAX);
  }
  if(['isobaric','bath'].includes(mode)){
    controls.pressure=sampleValid(value=>operate(model,mode,state,'pressure',value),P_MIN,P_MAX,true);
  }
  const point=coordinates(state,potential);
  const rows=[],ys=[...new Set([
    ...Array.from({length:161},(_,index)=>limits[1][0]+(limits[1][1]-limits[1][0])*index/160),
    ...(limits[1][0]<=point[1]&&point[1]<=limits[1][1]?[point[1]]:[]),
  ])].sort((a,b)=>a-b);
  for(const y of ys){
    try{rows.push([y,rowInterval(model,potential,y,limits)]);}catch{}
  }
  if(!rows.length)throw Error('この表示範囲には選択できる平衡状態がありません。');
  const domains=[
    [Math.min(...rows.map(row=>row[1][0])),Math.max(...rows.map(row=>row[1][1]))],
    [rows[0][0],rows.at(-1)[0]],
  ];
  for(const [axis,name] of [[0,'x'],[1,'y']]){
    const other=point[1-axis],[min,max]=domains[axis];
    controls[name]=sampleValid(value=>axis===0?fromXY(model,potential,value,other):fromXY(model,potential,other,value),min,max,axis===1&&logarithmicDirectY);
  }
  if(['adiabatic','isobaric'].includes(mode))controls.thermal={...controls.x};
  return controls;
}
export function tangentInfo(model,state,potential){
  const out={point:coordinates(state,potential),slopes:slopes(state,potential),si_slopes:siSlopes(state,potential)};
  const candidates=model==='water'?[0,1,2].map(i=>phase(state.T,state.P,i)):[];
  out.volume_fractions=candidates.length?candidates.map((s,i)=>state.fractions[i]*s.V/state.V):[0,0,1];
  const active=candidates.filter(s=>Math.abs(s.G-state.G)<1e-4);out.coexistence=active.length>1;
  const limitingStates=potential==='G'&&active.length>1?[...active]:[];
  if(active.length===3&&['F','H'].includes(potential)){
    const key=potential==='F'?'V':'S';
    active.forEach((a,i)=>{for(const b of active.slice(i+1)){if(Math.min(a[key],b[key])<=state[key]&&state[key]<=Math.max(a[key],b[key]))limitingStates.push(mix(a,b,(state[key]-a[key])/(b[key]-a[key])));}});
  }
  out.limits=limitingStates.map(s=>slopes(s,potential));out.nonunique=limitingStates.length>1;return out;
}
export function dispatch(r){
  const model=r.model||'ideal',potential=r.potential||'U';
  switch(r.kind){
    case'initial':return tp(model,model==='ideal'?300:260,1e5);
    case'surface':return surface(model,potential,r.bounds||bounds(model,potential,r.state),r.state,r.count||45,false,r.yCount||r.count||45);
    case'globalSurface':return surface(model,potential,globalBounds(model,potential),null,r.count||35,true,r.yCount||81);
    case'direct':return fromXY(model,potential,r.x,r.y);
    case'info':return tangentInfo(model,r.state,potential);
    case'validity':return validity(model,r.mode,r.state,potential,r.limits,r.logarithmicDirectY);
    case'operate':{
      const result=operate(model,r.mode,r.state,r.action,r.value),start=r.action==='heat'?0:r.state[{volume:'V',temperature:'T',pressure:'P'}[r.action]];
      result.path=Array.from({length:11},(_,i)=>operate(model,r.mode,r.state,r.action,start+(r.value-start)*(i+1)/12).state).concat([result.state]);return result;
    }
    case'thermal':{
      const coordinate=AXES[potential][0],start=r.state[coordinate]*SCALE[coordinate];
      const result=thermalTarget(model,r.mode,r.state,coordinate,r.value);
      result.path=Array.from({length:11},(_,i)=>thermalTarget(model,r.mode,r.state,coordinate,start+(r.value-start)*(i+1)/12).state).concat([result.state]);return result;
    }
    default:throw Error('Unknown request');
  }
}
