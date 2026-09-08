/** Lightweight Canvas 2D renderer for the all-JavaScript implementation.
 *
 * It performs its own projection, depth sorting, orbit interaction, and
 * surface picking. Plotly is deliberately not used anywhere in this file.
 */
const PHASE_COLORS = {
  0: "#a9cad8", 1: "#80c5c1", 2: "#e4c88d",
  "01": "#b4a4d2", "12": "#e6a58b", "02": "#ce9eb3", "012": "#d7b456",
};

function phaseRegion(fractions, collapsed = false) {
  if (collapsed) return fractions.indexOf(Math.max(...fractions)).toString();
  const active = fractions.map((value, index) => value > 1e-4 ? index : -1).filter(index => index >= 0);
  return active.length ? active.join("") : fractions.indexOf(Math.max(...fractions)).toString();
}

// Clip in natural coordinates before projection; never join unrelated phase
// regions or interpolate their phase labels.
export function clipSurfacePolygon(points, limits) {
  for(let axis=0;axis<2;axis++)for(const side of [0,1]){
    const edge=limits[axis][side],inside=p=>side?p[axis]<=edge:p[axis]>=edge;
    const output=[];
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],ai=inside(a),bi=inside(b);
      if(ai)output.push(a);
      if(ai!==bi){const f=(edge-a[axis])/(b[axis]-a[axis]);output.push(a.map((v,j)=>v+(b[j]-v)*f));}
    }
    points=output;
  }
  return points;
}
export function axisCoordinate(value,surf,axis) {
  const scale=surf.volumeScale;
  if(scale?.axis===axis){
    const [low,high]=surf.limits[axis],{knee,linearFraction:f}=scale;
    return value<=knee?f*(value-low)/(knee-low):f+(1-f)*Math.log(value/knee)/Math.log(high/knee);
  }
  return surf.logAxes?.includes(axis)?Math.log10(value):value;
}
export function axisInverse(value,surf,axis) {
  const scale=surf.volumeScale;
  if(scale?.axis===axis){
    const [low,high]=surf.limits[axis],{knee,linearFraction:f}=scale;
    return value<=f?low+(knee-low)*value/f:knee*Math.exp((value-f)*Math.log(high/knee)/(1-f));
  }
  return surf.logAxes?.includes(axis)?10**value:value;
}
export function clipSurfacePolyline(points,limits) {
  const runs=[];let run=[];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];let lo=0,hi=1;
    for(let axis=0;axis<2;axis++){
      const d=b[axis]-a[axis];
      if(d===0){if(a[axis]<limits[axis][0]||a[axis]>limits[axis][1])hi=-1;}
      else{const ts=limits[axis].map(v=>(v-a[axis])/d);lo=Math.max(lo,Math.min(...ts));hi=Math.min(hi,Math.max(...ts));}
    }
    if(lo>hi){if(run.length>1)runs.push(run);run=[];continue;}
    const at=t=>a.map((v,j)=>v+(b[j]-v)*t);
    if(!run.length)run.push(at(lo));run.push(at(hi));
    if(hi<1){runs.push(run);run=[];}
  }
  if(run.length>1)runs.push(run);return runs;
}

export function surfaceGeometry(surf) {
  const cells=[];
  for(const patch of surf.patches)for(let r=0;r<patch.z.length-1;r++)for(let c=0;c<patch.z[r].length-1;c++){
    const ids=[[r,c],[r,c+1],[r+1,c+1],[r+1,c]];
    const corners=ids.map(([y,x])=>[patch.x[y][x],patch.y[y][x],patch.z[y][x]]);
    const fractions=[0,1,2].map(i=>ids.reduce((sum,[y,x])=>sum+patch.fractions[y][x][i],0)/4);
    for(const indices of [[0,1,2],[0,2,3]]){
      const triangle=indices.map(i=>corners[i]);
      const ranges=surf.volumeScale?[
        [surf.limits[0],[surf.limits[1][0],surf.volumeScale.knee]],
        [surf.limits[0],[surf.volumeScale.knee,surf.limits[1][1]]],
      ]:[surf.limits];
      // Split at the scale junction before transforming. Otherwise a face
      // bridges the two scales and covers the enlarged condensed region.
      for(const limits of ranges){
      const polygon=clipSurfacePolygon(triangle,limits);
      for(let i=1;i<polygon.length-1;i++){
        const raw=[polygon[0],polygon[i],polygon[i+1]];
        const area=(raw[1][0]-raw[0][0])*(raw[2][1]-raw[0][1])-(raw[2][0]-raw[0][0])*(raw[1][1]-raw[0][1]);
        if(Math.abs(area)<1e-24)continue;
        cells.push({raw,region:patch.region??phaseRegion(fractions,surf.collapsedCoexistence)});
      }}
    }
  }
  return cells;
}

export class SurfaceCanvas {
  constructor(container, {pick, camera, cameraChanged, ariaLabel="Three-dimensional thermodynamic-function surface"}) {
    this.container = container;
    this.pick = pick;
    this.camera = structuredClone(camera);
    this.cameraChanged = cameraChanged;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "surface-canvas";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-label", ariaLabel);
    container.replaceChildren(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.resizeObserver = new ResizeObserver(() => this.draw());
    this.resizeObserver.observe(container);
    this.gesture = null;
    this.onDown = (event) => this.pointerDown(event);
    this.onMove = (event) => this.pointerMove(event);
    this.onUp = (event) => this.pointerUp(event);
    this.onCancel = () => { this.gesture = null; };
    this.onWheel = (event) => this.wheel(event);
    this.canvas.addEventListener("pointerdown", this.onDown);
    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerup", this.onUp);
    this.canvas.addEventListener("pointercancel", this.onCancel);
    this.canvas.addEventListener("wheel", this.onWheel, {passive: false});
  }

  destroy() {
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onCancel);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.container.replaceChildren();
  }

  setCamera(camera) { this.camera = structuredClone(camera); }
  getCamera() { return structuredClone(this.camera); }
  render(data) {
    if(this.data?.surf!==data.surf){
      this.geometry=surfaceGeometry(data.surf);
      this.projected=null;
      this.zBounds=this.geometry.reduce(([lo,hi],cell)=>[
        Math.min(lo,...cell.raw.map(p=>p[2])),Math.max(hi,...cell.raw.map(p=>p[2]))],[Infinity,-Infinity]);
    }
    if(this.data?.surf!==data.surf||this.data?.focusSurface!==data.focusSurface){
      this.focusGeometry=data.focusSurface?this.geometry.map(cell=>
        clipSurfacePolygon(cell.raw,data.focusSurface.limits)).filter(p=>p.length>=3):[];
      const edges=new Map();
      const key=point=>point.map(value=>Number(value).toPrecision(12)).join(",");
      for(const polygon of this.focusGeometry)for(let index=0;index<polygon.length;index++){
        const points=[polygon[index],polygon[(index+1)%polygon.length]];
        const edgeKey=points.map(key).sort().join("|");
        const previous=edges.get(edgeKey);
        edges.set(edgeKey,previous?{...previous,count:previous.count+1}:{points,count:1});
      }
      this.focusBoundary=[...edges.values()].filter(edge=>edge.count===1).map(edge=>edge.points);
    }
    this.data = data; this.draw();
  }

  size() {
    const rect = this.container.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (this.canvas.width !== Math.round(width * ratio)
        || this.canvas.height !== Math.round(height * ratio)) {
      this.canvas.width = Math.round(width * ratio);
      this.canvas.height = Math.round(height * ratio);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    }
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return {width, height};
  }

  frame() {
    const {surf} = this.data;
    const [zMin,zMax] = this.zBounds;
    const zPad = Math.max(1e-9, (zMax - zMin) * 0.08);
    const center = [
      (this.axisCoordinate(surf.limits[0][0],0) + this.axisCoordinate(surf.limits[0][1],0)) / 2,
      (this.axisCoordinate(surf.limits[1][0],1) + this.axisCoordinate(surf.limits[1][1],1)) / 2,
      (zMin + zMax) / 2,
    ];
    const span = [
      Math.max(1e-12, this.axisCoordinate(surf.limits[0][1],0) - this.axisCoordinate(surf.limits[0][0],0)),
      Math.max(1e-12, this.axisCoordinate(surf.limits[1][1],1) - this.axisCoordinate(surf.limits[1][0],1)),
      Math.max(1e-12, zMax - zMin + 2 * zPad),
    ];
    return {center, span, zMin: zMin - zPad, zMax: zMax + zPad};
  }

  axisCoordinate(value, axis) { return axisCoordinate(value,this.data.surf,axis); }

  axisValue(range, fraction, axis) {
    const lo=this.axisCoordinate(range[0],axis),hi=this.axisCoordinate(range[1],axis);
    return axisInverse(lo+(hi-lo)*fraction,this.data.surf,axis);
  }

  basis() {
    const eye = this.camera.eye || {x: 1.5, y: 1.55, z: 1.05};
    const length = Math.hypot(eye.x, eye.y, eye.z) || 1;
    const view = [-eye.x / length, -eye.y / length, -eye.z / length];
    let right = [view[1], -view[0], 0];
    let rLength = Math.hypot(...right);
    if (rLength < 1e-8) { right = [1, 0, 0]; rLength = 1; }
    right = right.map((value) => value / rLength);
    const up = [
      right[1] * view[2],
      -right[0] * view[2],
      right[0] * view[1] - right[1] * view[0],
    ];
    return {eye, length, view, right, up};
  }

  normalized(point, frame) {
    return point.map((value, index) => ((index<2?this.axisCoordinate(value,index):value) - frame.center[index]) / frame.span[index] * 2);
  }

  project(point, frame, size, basis) {
    const p = this.normalized(point, frame);
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const scale = Math.min(size.width, size.height) * 0.30 * (2.38 / basis.length);
    return {
      x: size.width * 0.5 + dot(p, basis.right) * scale,
      y: size.height * 0.5 - dot(p, basis.up) * scale,
      depth: dot(p, basis.view),
      raw: point,
    };
  }

  drawLine(points, stroke, width = 1, dash = []) {
    if (!points.length) return;
    const g = this.context;
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) g.lineTo(point.x, point.y);
    g.strokeStyle = stroke;
    g.lineWidth = width;
    g.setLineDash(dash);
    g.stroke();
    g.setLineDash([]);
  }

  polygon(points, fill, stroke = null, width = 0.5) {
    const g = this.context;
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) g.lineTo(point.x, point.y);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
  }

  draw() {
    if (!this.data) return;
    const size = this.size(), g = this.context, frame = this.frame(), basis = this.basis();
    g.clearRect(0, 0, size.width, size.height);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, size.width, size.height);
    const project = (point) => this.project(point, frame, size, basis);

    const [xRange, yRange] = this.data.surf.limits;
    const floor = frame.zMin;
    const corners = [
      [xRange[0], yRange[0], floor], [xRange[1], yRange[0], floor],
      [xRange[1], yRange[1], floor], [xRange[0], yRange[1], floor],
    ].map(project);
    this.polygon(corners, "#f5f8f5", "#dce5e1", 1);
    for (let index = 1; index < 5; index += 1) {
      const tx = this.axisValue(xRange,index/5,0);
      const ty = this.axisValue(yRange,index/5,1);
      this.drawLine([project([tx, yRange[0], floor]), project([tx, yRange[1], floor])], "#dde6e2");
      this.drawLine([project([xRange[0], ty, floor]), project([xRange[1], ty, floor])], "#dde6e2");
    }

    const projectionKey=JSON.stringify([this.camera,size]);
    if(!this.projected||this.projectionKey!==projectionKey){
      this.projected=this.geometry.map(cell=>{
        const screen=cell.raw.map(project);
        return {...cell,screen,depth:screen.reduce((sum,p)=>sum+p.depth,0)/screen.length};
      }).sort((a,b)=>b.depth-a.depth);
      this.projectionKey=projectionKey;
    }
    const cells=this.projected;
    this.hitCells = cells;
    for (const cell of cells) {
      const normalizedZ = (cell.raw.reduce((sum, p) => sum + p[2], 0) / cell.raw.length - frame.zMin)
        / (frame.zMax - frame.zMin);
      const light = 82 - Math.max(0, Math.min(1, normalizedZ)) * 34;
      const fill = this.data.showPhaseColors ? PHASE_COLORS[cell.region] : `hsla(177,35%,${light}%,0.91)`;
      this.polygon(cell.screen, fill, fill, 0.8);
    }
    if (this.data.showPhaseColors && this.data.surf.collapsedCoexistence) {
      for (const boundary of this.data.surf.phaseBoundaries || []) {
        const color=PHASE_COLORS[boundary.phases.join("")];
        for(const run of clipSurfacePolyline(boundary.points,this.data.surf.limits))this.drawLine(run.map(project), color, 1.35);
      }
    }
    if (this.data.focusSurface) for(const edge of this.focusBoundary || []) {
      this.drawLine(edge.map(project),"#7357af",2.2);
    }

    const plane = (slopes, color) => {
      const [x, y, z] = this.data.info.point;
      const dx = (xRange[1] - xRange[0]) * 0.13, dy = (yRange[1] - yRange[0]) * 0.13;
      return [[x - dx, y - dy], [x + dx, y - dy], [x + dx, y + dy], [x - dx, y + dy]]
        .map(([xx, yy]) => project([xx, yy, z + slopes[0] * (xx - x) + slopes[1] * (yy - y)]))
        .map((point) => ({...point, color}));
    };
    if (this.data.showPlane) {
      for (const slopes of this.data.info.limits) this.polygon(plane(slopes), "rgba(130,136,143,.12)", "rgba(110,115,120,.35)");
      this.polygon(plane(this.data.info.slopes), "rgba(242,190,103,.38)", "rgba(190,126,36,.7)", 1);
    }
    if (this.data.showTangents) {
      const [x, y, z] = this.data.info.point;
      const distances = [(xRange[1] - xRange[0]) * 0.13, (yRange[1] - yRange[0]) * 0.13];
      for (let axis = 0; axis < 2; axis += 1) {
        const d = distances[axis], slope = this.data.info.slopes[axis];
        const ends = axis === 0
          ? [[x - d, y, z - slope * d], [x + d, y, z + slope * d]]
          : [[x, y - d, z - slope * d], [x, y + d, z + slope * d]];
        this.drawLine(ends.map(project), axis ? "#7357af" : "#087f82", 3);
      }
    }
    if (this.data.showTrail && this.data.path.length > 1) {
      this.drawLine(this.data.path.map(this.data.point).map(project), "#cb6d3e", 2.5);
    }
    const current = project(this.data.info.point);
    g.beginPath(); g.arc(current.x, current.y, 6, 0, Math.PI * 2);
    g.fillStyle = "#d65f32"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#fff"; g.stroke();

    for (const [index, annotation] of (this.data.showAnnotations===false?[]:(this.data.surf.annotations || [])).entries()) {
      const marker = project(annotation.point), offsetY = -12 + index * 19;
      g.save();
      g.translate(marker.x, marker.y); g.rotate(Math.PI / 4);
      g.fillStyle = "#f2b134"; g.fillRect(-4, -4, 8, 8);
      g.strokeStyle = "#704f13"; g.lineWidth = 1; g.strokeRect(-4, -4, 8, 8);
      g.restore();
      g.font = "10px system-ui";
      const textWidth = g.measureText(annotation.label).width;
      const labelX = Math.max(5, Math.min(size.width - textWidth - 9, marker.x + 11));
      const labelY = Math.max(14, Math.min(size.height - 5, marker.y + offsetY));
      this.drawLine([marker, {x: labelX - 2, y: labelY - 3}], "rgba(112,79,19,.65)", 1);
      g.fillStyle = "rgba(255,252,241,.92)"; g.fillRect(labelX - 3, labelY - 11, textWidth + 6, 14);
      g.fillStyle = "#66470e"; g.fillText(annotation.label, labelX, labelY);
    }

    const axisOrigin = project([xRange[0], yRange[0], floor]);
    const axes = [
      [project([xRange[1], yRange[0], floor]), this.data.surf.labels[0]],
      [project([xRange[0], yRange[1], floor]), this.data.surf.labels[1]],
      [project([xRange[0], yRange[0], frame.zMax]), this.data.surf.labels[2]],
    ];
    g.font = this.data.compact ? "8px system-ui" : "11px system-ui"; g.fillStyle = "#31515a";
    for (const [index,[end, label]] of axes.entries()) {
      this.drawLine([axisOrigin, end], "#607981", 1.25);
      const dx=end.x-axisOrigin.x,dy=end.y-axisOrigin.y,length=Math.hypot(dx,dy)||1;
      const labelX=end.x-dx/length*5+dy/length*5;
      const labelY=end.y-dy/length*5-dx/length*5;
      g.fillText(label,Math.max(3,Math.min(size.width-g.measureText(label).width-3,labelX)),Math.max(11,Math.min(size.height-4,labelY)));
    }
    const formatTick = (value) => {
      if (value !== 0 && (Math.abs(value) >= 1e4 || Math.abs(value) < 1e-2)) return value.toExponential(1);
      return Number(value.toPrecision(3)).toString();
    };
    g.font = "9px system-ui"; g.fillStyle = "#6c8086";
    const tickSets = [
      {axis:0,range: xRange, fractions: [0.14, 0.54, 0.9], raw: value => [value, yRange[0], floor], offset: [-5, 12]},
      {axis:1,range: yRange, fractions: [0.2, 0.58, 0.9], raw: value => [xRange[0], value, floor], offset: [-24, 3]},
      {axis:2,range: [frame.zMin, frame.zMax], fractions: [0.27, 0.62, 0.9], raw: value => [xRange[0], yRange[0], value], offset: [-30, 3]},
    ];
    if (!this.data.compact) for (const ticks of tickSets) for (const fraction of ticks.fractions) {
      const value = ticks.axis<2?this.axisValue(ticks.range,fraction,ticks.axis):ticks.range[0]+(ticks.range[1]-ticks.range[0])*fraction;
      const position = project(ticks.raw(value));
      g.fillText(formatTick(value), position.x + ticks.offset[0], position.y + ticks.offset[1]);
    }
    if(this.data.surf.volumeScale){
      const {knee,linearFraction:f}=this.data.surf.volumeScale;
      const edge=value=>project([xRange[0],value,floor]);
      const junction=edge(knee),a=edge(yRange[0]),b=edge(yRange[1]);
      const length=Math.hypot(b.x-a.x,b.y-a.y),normal={x:-(b.y-a.y)/length,y:(b.x-a.x)/length};
      const labelAt=(p,label,offset)=>{
        const width=g.measureText(label).width;
        g.fillText(label,Math.max(2,Math.min(size.width-width-2,p.x+normal.x*offset-width/2)),p.y+normal.y*offset);
      };
      this.drawLine([project([xRange[0],knee,floor]),project([xRange[1],knee,floor])],"#9b8ba9",1,[3,3]);
      g.font="8px system-ui";g.fillStyle="#526b75";
      for(const [value,label] of [[yRange[0],formatTick(yRange[0])],[knee,'0.020'],[yRange[1],formatTick(yRange[1])]]){
        const p=edge(value);labelAt(p,label,13);
      }
      for(const [fraction,label] of [[f/2,'linear'],[(1+f)/2,'log']]){
        const p=edge(this.axisValue(yRange,fraction,1));labelAt(p,label,30);
      }
      this.drawLine([{x:junction.x,y:junction.y-3},{x:junction.x,y:junction.y+3}],"#7357af",1.5);
    }
    if (!this.data.compact) { g.font = "10px system-ui"; g.fillStyle = "#74858a"; g.fillText("Canvas / JavaScript", 10, 17); }
  }

  pointerDown(event) {
    if (event.button !== 0 || event.isPrimary === false) return;
    this.canvas.setPointerCapture(event.pointerId);
    this.gesture = {id: event.pointerId, x: event.clientX, y: event.clientY,
      lastX: event.clientX, lastY: event.clientY, start: event.timeStamp, max: 0};
  }

  pointerMove(event) {
    const gesture = this.gesture;
    if (!gesture || gesture.id !== event.pointerId) return;
    gesture.max = Math.max(gesture.max,
      Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y));
    const dx = event.clientX - gesture.lastX, dy = event.clientY - gesture.lastY;
    gesture.lastX = event.clientX; gesture.lastY = event.clientY;
    if (gesture.max <= 3) return;
    const eye = this.camera.eye, radius = Math.hypot(eye.x, eye.y, eye.z);
    let azimuth = Math.atan2(eye.y, eye.x) - dx * 0.008;
    let elevation = Math.asin(eye.z / radius) + dy * 0.006;
    elevation = Math.max(-1.35, Math.min(1.35, elevation));
    this.camera.eye = {x: radius * Math.cos(elevation) * Math.cos(azimuth),
      y: radius * Math.cos(elevation) * Math.sin(azimuth), z: radius * Math.sin(elevation)};
    this.cameraChanged(this.getCamera());
    this.draw();
  }

  pointerUp(event) {
    const gesture = this.gesture;
    if (!gesture || gesture.id !== event.pointerId) return;
    gesture.max = Math.max(gesture.max,
      Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y));
    this.gesture = null;
    if (gesture.max > 6 || event.timeStamp - gesture.start > 700) return;
    const rect = this.canvas.getBoundingClientRect();
    const picked = this.pickSurface(event.clientX - rect.left, event.clientY - rect.top);
    if (picked) this.pick(picked);
  }

  wheel(event) {
    event.preventDefault();
    const eye = this.camera.eye, radius = Math.hypot(eye.x, eye.y, eye.z);
    const next = Math.max(1.1, Math.min(5.5, radius * Math.exp(event.deltaY * 0.001)));
    const ratio = next / radius;
    this.camera.eye = {x: eye.x * ratio, y: eye.y * ratio, z: eye.z * ratio};
    this.cameraChanged(this.getCamera());
    this.draw();
  }

  pickSurface(x, y) {
    if (!this.hitCells) return null;
    const barycentric = (p, a, b, c) => {
      const d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
      if (Math.abs(d) < 1e-9) return null;
      const u = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / d;
      const v = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / d;
      const w = 1 - u - v;
      return u >= -0.01 && v >= -0.01 && w >= -0.01 ? [u, v, w] : null;
    };
    const hits = [];
    for (const cell of this.hitCells) {
      for (const indices of [[0, 1, 2]]) {
        const weights = barycentric({x, y}, ...indices.map((index) => cell.screen[index]));
        if (!weights) continue;
        const raw = [0, 1, 2].map((axis) => {
          const value=weights.reduce((sum,weight,index)=>sum+weight*(axis<2?
            this.axisCoordinate(cell.raw[indices[index]][axis],axis):cell.raw[indices[index]][axis]),0);
          return axis<2?axisInverse(value,this.data.surf,axis):value;
        });
        hits.push({x: raw[0], y: raw[1], depth: cell.depth});
      }
    }
    hits.sort((a, b) => a.depth - b.depth);
    return hits[0] || null;
  }
}
