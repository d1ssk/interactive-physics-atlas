"use strict";

(function exposePoyntingCircuitPhysics(root) {
  const CONSTANTS = Object.freeze({
    vacuumPermittivity: 8.8541878128e-12,
    vacuumPermeability: 1.25663706212e-6,
  });

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function complex(real = 0, imaginary = 0) {
    return {real, imaginary};
  }

  function complexAdd(left, right) {
    return complex(left.real + right.real, left.imaginary + right.imaginary);
  }

  function complexSubtract(left, right) {
    return complex(left.real - right.real, left.imaginary - right.imaginary);
  }

  function complexMultiply(left, right) {
    return complex(
      left.real * right.real - left.imaginary * right.imaginary,
      left.real * right.imaginary + left.imaginary * right.real,
    );
  }

  function complexDivide(left, right) {
    const denominator = Math.max(
      right.real * right.real + right.imaginary * right.imaginary,
      Number.EPSILON,
    );
    return complex(
      (left.real * right.real + left.imaginary * right.imaginary) / denominator,
      (left.imaginary * right.real - left.real * right.imaginary) / denominator,
    );
  }

  function complexMagnitude(value) {
    return Math.hypot(value.real, value.imaginary);
  }

  function realAtPhase(value, phaseRadians) {
    return value.real * Math.cos(phaseRadians) - value.imaginary * Math.sin(phaseRadians);
  }

  function quadraticPoint(start, control, end, parameter) {
    const complement = 1 - parameter;
    return {
      x: complement * complement * start.x
        + 2 * complement * parameter * control.x
        + parameter * parameter * end.x,
      y: complement * complement * start.y
        + 2 * complement * parameter * control.y
        + parameter * parameter * end.y,
    };
  }

  function sampleQuadratic(start, control, end, subdivisions = 48) {
    const points = [];
    const count = Math.max(2, Math.floor(subdivisions));
    for (let index = 0; index <= count; index += 1) {
      points.push(quadraticPoint(start, control, end, index / count));
    }
    return points;
  }

  function cubicPoint(start, control1, control2, end, parameter) {
    const complement = 1 - parameter;
    return {
      x: complement ** 3 * start.x
        + 3 * complement ** 2 * parameter * control1.x
        + 3 * complement * parameter ** 2 * control2.x
        + parameter ** 3 * end.x,
      y: complement ** 3 * start.y
        + 3 * complement ** 2 * parameter * control1.y
        + 3 * complement * parameter ** 2 * control2.y
        + parameter ** 3 * end.y,
    };
  }

  function cubicTangent(start, control1, control2, end, parameter) {
    const complement = 1 - parameter;
    return {
      x: 3 * complement ** 2 * (control1.x - start.x)
        + 6 * complement * parameter * (control2.x - control1.x)
        + 3 * parameter ** 2 * (end.x - control2.x),
      y: 3 * complement ** 2 * (control1.y - start.y)
        + 6 * complement * parameter * (control2.y - control1.y)
        + 3 * parameter ** 2 * (end.y - control2.y),
    };
  }

  function sampleCubic(start, control1, control2, end, subdivisions = 64) {
    const points = [];
    const count = Math.max(3, Math.floor(subdivisions));
    for (let index = 0; index <= count; index += 1) {
      points.push(cubicPoint(start, control1, control2, end, index / count));
    }
    return points;
  }

  function defaultGeometry() {
    return {
      sourceX: 0.16,
      sourceY: 0.5,
      sourceLength: 0.28,
      loadElementLength: 0.115,
      loadCount: 1,
      loads: [
        {x: 0.84, y: 0.5},
        {x: 0.84, y: 0.31},
      ],
      topControl1: {x: 0.36, y: 0.76},
      topControl2: {x: 0.64, y: 0.76},
      middleControl1: {x: 0.84, y: 0.43},
      middleControl2: {x: 0.84, y: 0.38},
      bottomControl1: {x: 0.36, y: 0.24},
      bottomControl2: {x: 0.64, y: 0.24},
    };
  }

  function circuitEndpoints(geometry) {
    const sourceHalfLength = geometry.sourceLength / 2;
    const loadHalfLength = geometry.loadElementLength / 2;
    const loadCount = clamp(Math.round(geometry.loadCount ?? 1), 1, 2);
    const loadElements = geometry.loads.slice(0, loadCount).map(load => ({
      center: {...load},
      top: {x: load.x, y: load.y + loadHalfLength},
      bottom: {x: load.x, y: load.y - loadHalfLength},
    }));
    return {
      sourceTop: {x: geometry.sourceX, y: geometry.sourceY + sourceHalfLength},
      sourceBottom: {x: geometry.sourceX, y: geometry.sourceY - sourceHalfLength},
      loadElements,
      loadTop: loadElements[0].top,
      loadBottom: loadElements.at(-1).bottom,
    };
  }

  function circuitPaths(geometry, subdivisions = 52) {
    const {sourceTop, sourceBottom, loadElements, loadTop, loadBottom}
      = circuitEndpoints(geometry);
    const middleControl1 = loadElements.length === 2
      ? {x: loadElements[0].bottom.x, y: geometry.middleControl1.y}
      : null;
    const middleControl2 = loadElements.length === 2
      ? {x: loadElements[1].top.x, y: geometry.middleControl2.y}
      : null;
    const middle = loadElements.length === 2
      ? sampleCubic(
        loadElements[0].bottom,
        middleControl1,
        middleControl2,
        loadElements[1].top,
        subdivisions,
      )
      : [];
    return {
      top: sampleCubic(
        sourceTop,
        geometry.topControl1,
        geometry.topControl2,
        loadTop,
        subdivisions,
      ),
      bottom: sampleCubic(
        sourceBottom,
        geometry.bottomControl1,
        geometry.bottomControl2,
        loadBottom,
        subdivisions,
      ),
      middle,
      middleControl1,
      middleControl2,
      sourceTop,
      sourceBottom,
      loadElements,
      loadTop,
      loadBottom,
    };
  }

  function appendSegments(segments, points) {
    for (let index = 0; index < points.length - 1; index += 1) {
      segments.push({start: points[index], end: points[index + 1]});
    }
  }

  function circuitSegments(geometry, subdivisions = 52) {
    const paths = circuitPaths(geometry, subdivisions);
    const segments = [];
    appendSegments(segments, paths.top);
    segments.push({start: paths.loadElements[0].top, end: paths.loadElements[0].bottom});
    if (paths.loadElements.length === 2) {
      appendSegments(segments, paths.middle);
      segments.push({start: paths.loadElements[1].top, end: paths.loadElements[1].bottom});
    }
    appendSegments(segments, [...paths.bottom].reverse());
    segments.push({start: paths.sourceBottom, end: paths.sourceTop});
    return segments;
  }

  function magneticFieldZ(x, y, segments, current = 1, softening = 0.018) {
    let field = 0;
    const softeningSquared = softening * softening;
    for (const segment of segments) {
      const deltaX = segment.end.x - segment.start.x;
      const deltaY = segment.end.y - segment.start.y;
      const middleX = 0.5 * (segment.start.x + segment.end.x);
      const middleY = 0.5 * (segment.start.y + segment.end.y);
      const offsetX = x - middleX;
      const offsetY = y - middleY;
      const radiusSquared = offsetX * offsetX + offsetY * offsetY + softeningSquared;
      field += (deltaX * offsetY - deltaY * offsetX)
        / (4 * Math.PI * radiusSquared ** 1.5);
    }
    return current * field;
  }

  function poyntingVector(electricX, electricY, magneticH_z) {
    return {
      x: electricY * magneticH_z,
      y: -electricX * magneticH_z,
    };
  }

  function instantaneousField(electricX, electricY, magneticHPerAmp, currentPhasor, phase) {
    const sampledElectricX = realAtPhase(electricX, phase);
    const sampledElectricY = realAtPhase(electricY, phase);
    const magneticH = magneticHPerAmp * realAtPhase(currentPhasor, phase);
    return {
      electricX: sampledElectricX,
      electricY: sampledElectricY,
      magneticH,
      poynting: poyntingVector(sampledElectricX, sampledElectricY, magneticH),
    };
  }

  function averagePoyntingVector(electricX, electricY, magneticHPerAmp, currentPhasor) {
    const electricYCurrentConjugate = electricY.real * currentPhasor.real
      + electricY.imaginary * currentPhasor.imaginary;
    const electricXCurrentConjugate = electricX.real * currentPhasor.real
      + electricX.imaginary * currentPhasor.imaginary;
    return {
      x: 0.5 * magneticHPerAmp * electricYCurrentConjugate,
      y: -0.5 * magneticHPerAmp * electricXCurrentConjugate,
    };
  }

  function rectangularInwardFlux(
    samplePoynting,
    center,
    halfWidth,
    halfHeight,
    samples = 24,
  ) {
    let outwardFlux = 0;
    for (let index = 0; index < samples; index += 1) {
      const fraction = (index + 0.5) / samples;
      const x = center.x - halfWidth + 2 * halfWidth * fraction;
      const y = center.y - halfHeight + 2 * halfHeight * fraction;
      const points = [
        [center.x - halfWidth, y, -1, 0, 2 * halfHeight / samples],
        [center.x + halfWidth, y, 1, 0, 2 * halfHeight / samples],
        [x, center.y - halfHeight, 0, -1, 2 * halfWidth / samples],
        [x, center.y + halfHeight, 0, 1, 2 * halfWidth / samples],
      ];
      for (const [sampleX, sampleY, normalX, normalY, length] of points) {
        const poynting = samplePoynting(sampleX, sampleY);
        outwardFlux += (poynting.x * normalX + poynting.y * normalY) * length;
      }
    }
    return -outwardFlux;
  }

  function componentImpedance(component, frequencyHz) {
    const angularFrequency = 2 * Math.PI * Math.max(frequencyHz, Number.EPSILON);
    if (component.type === "c") {
      const capacitance = Math.max(component.capacitance, Number.EPSILON) * 1e-6;
      return {
        real: 0,
        imaginary: -1 / (angularFrequency * capacitance),
      };
    }
    if (component.type === "l") {
      const inductance = Math.max(component.inductance, 0) * 1e-3;
      return {
        real: 0,
        imaginary: angularFrequency * inductance,
      };
    }
    return {real: Math.max(component.resistance, Number.EPSILON), imaginary: 0};
  }

  function seriesResponse(components, frequencyHz, voltagePeak) {
    const impedances = components.map(component => componentImpedance(component, frequencyHz));
    const total = impedances.reduce((sum, value) => ({
      real: sum.real + value.real,
      imaginary: sum.imaginary + value.imaginary,
    }), {real: 0, imaginary: 0});
    const magnitude = Math.max(Math.hypot(total.real, total.imaginary), Number.EPSILON);
    const currentPeak = voltagePeak / magnitude;
    const currentPhase = -Math.atan2(total.imaginary, total.real);
    const currentRmsSquared = 0.5 * currentPeak ** 2;
    return {
      impedance: total,
      componentImpedances: impedances,
      magnitude,
      currentPeak,
      currentPhase,
      powerFactor: Math.cos(currentPhase),
      averagePower: 0.5 * voltagePeak * currentPeak * Math.cos(currentPhase),
      componentAveragePowers: impedances.map(value => currentRmsSquared * value.real),
      componentReactivePowers: impedances.map(value => currentRmsSquared * value.imaginary),
    };
  }

  function circuitPhasors(parameters) {
    const sourceVoltage = complex(parameters.voltage, 0);
    if (parameters.mode === "dc") {
      const impedances = parameters.components.map(component => complex(
        Math.max(component.resistance, Number.EPSILON),
        0,
      ));
      const totalResistance = impedances.reduce((sum, value) => sum + value.real, 0);
      const current = complex(parameters.voltage / totalResistance, 0);
      const componentVoltages = impedances.map(value => complexMultiply(current, value));
      const nodeVoltages = [sourceVoltage];
      for (const voltage of componentVoltages) {
        nodeVoltages.push(complexSubtract(nodeVoltages.at(-1), voltage));
      }
      return {
        valid: true,
        sourceVoltage,
        current,
        impedance: complex(totalResistance, 0),
        componentImpedances: impedances,
        componentVoltages,
        nodeVoltages,
      };
    }

    const impedances = parameters.components.map(component => (
      componentImpedance(component, parameters.frequency)
    ));
    const total = impedances.reduce(complexAdd, complex());
    const valid = complexMagnitude(total) > 1e-6;
    const current = valid ? complexDivide(sourceVoltage, total) : complex();
    const componentVoltages = impedances.map(value => complexMultiply(current, value));
    const nodeVoltages = [sourceVoltage];
    for (const voltage of componentVoltages) {
      nodeVoltages.push(complexSubtract(nodeVoltages.at(-1), voltage));
    }
    return {
      valid,
      sourceVoltage,
      current,
      impedance: total,
      componentImpedances: impedances,
      componentVoltages,
      nodeVoltages,
    };
  }

  function circuitState(parameters, phaseRadians = 0) {
    const phasors = circuitPhasors(parameters);
    const phase = parameters.mode === "dc" ? 0 : phaseRadians;
    const voltage = realAtPhase(phasors.sourceVoltage, phase);
    const current = realAtPhase(phasors.current, phase);
    const currentPeak = complexMagnitude(phasors.current);
    const currentPhase = Math.atan2(phasors.current.imaginary, phasors.current.real);
    const componentVoltages = phasors.componentVoltages.map(value => realAtPhase(value, phase));
    const componentInstantaneousPowers = componentVoltages.map(value => value * current);
    const rmsFactor = parameters.mode === "dc" ? 1 : 0.5;
    const currentRmsSquared = rmsFactor * currentPeak ** 2;
    const componentAveragePowers = phasors.componentImpedances.map(
      value => currentRmsSquared * value.real,
    );
    const componentReactivePowers = phasors.componentImpedances.map(
      value => currentRmsSquared * value.imaginary,
    );
    const averagePower = componentAveragePowers.reduce((sum, value) => sum + value, 0);
    return {
      valid: phasors.valid,
      phasors,
      voltage,
      current,
      currentPeak,
      currentPhase,
      instantaneousPower: voltage * current,
      averagePower,
      powerFactor: complexMagnitude(phasors.impedance) > Number.EPSILON
        ? phasors.impedance.real / complexMagnitude(phasors.impedance)
        : 0,
      impedance: phasors.impedance,
      impedanceMagnitude: complexMagnitude(phasors.impedance),
      componentVoltages,
      componentInstantaneousPowers,
      componentAveragePowers,
      componentReactivePowers,
    };
  }

  function paintDisk(fixed, values, kinds, width, height, x, y, radius, value, kind) {
    const centerColumn = Math.round(x * (width - 1));
    const centerRow = Math.round(y * (height - 1));
    const radiusColumns = Math.max(1, Math.ceil(radius * (width - 1)));
    const radiusRows = Math.max(1, Math.ceil(radius * (height - 1)));
    for (let row = centerRow - radiusRows; row <= centerRow + radiusRows; row += 1) {
      if (row < 0 || row >= height) continue;
      for (let column = centerColumn - radiusColumns;
        column <= centerColumn + radiusColumns;
        column += 1) {
        if (column < 0 || column >= width) continue;
        const deltaX = column / (width - 1) - x;
        const deltaY = row / (height - 1) - y;
        if (deltaX * deltaX + deltaY * deltaY > radius * radius) continue;
        const index = row * width + column;
        fixed[index] = 1;
        values[index] = value;
        kinds[index] = kind;
      }
    }
  }

  function rasterizeConductors(geometry, width, height, wireRadius, nodePotentials = null) {
    const size = width * height;
    const fixed = new Uint8Array(size);
    const values = new Float64Array(size);
    const kinds = new Uint8Array(size);
    const paths = circuitPaths(geometry, 120);
    const loadCount = paths.loadElements.length;
    const conductorPotentials = nodePotentials ?? Array.from(
      {length: loadCount + 1},
      (_, index) => 0.5 - index / loadCount,
    );
    if (conductorPotentials.length !== loadCount + 1) {
      throw new Error("nodePotentials must contain one value for every circuit node");
    }
    for (const point of paths.top) {
      paintDisk(
        fixed,
        values,
        kinds,
        width,
        height,
        point.x,
        point.y,
        wireRadius,
        conductorPotentials[0],
        1,
      );
    }
    for (const point of paths.bottom) {
      paintDisk(
        fixed,
        values,
        kinds,
        width,
        height,
        point.x,
        point.y,
        wireRadius,
        conductorPotentials.at(-1),
        2,
      );
    }
    for (const point of paths.middle) {
      paintDisk(
        fixed,
        values,
        kinds,
        width,
        height,
        point.x,
        point.y,
        wireRadius,
        conductorPotentials[1],
        5,
      );
    }
    const elementSamples = 100;
    for (let index = 0; index <= elementSamples; index += 1) {
      const fraction = index / elementSamples;
      const sourceValue = conductorPotentials.at(-1)
        + fraction * (conductorPotentials[0] - conductorPotentials.at(-1));
      const sourceY = paths.sourceBottom.y
        + fraction * (paths.sourceTop.y - paths.sourceBottom.y);
      paintDisk(
        fixed,
        values,
        kinds,
        width,
        height,
        geometry.sourceX,
        sourceY,
        wireRadius * 1.65,
        sourceValue,
        3,
      );
      for (let loadIndex = 0; loadIndex < paths.loadElements.length; loadIndex += 1) {
        const load = paths.loadElements[loadIndex];
        const topValue = conductorPotentials[loadIndex];
        const bottomValue = conductorPotentials[loadIndex + 1];
        const loadValue = topValue + fraction * (bottomValue - topValue);
        const loadY = load.top.y + fraction * (load.bottom.y - load.top.y);
        paintDisk(
          fixed,
          values,
          kinds,
          width,
          height,
          load.center.x,
          loadY,
          wireRadius * 1.65,
          loadValue,
          4,
        );
      }
    }
    return {fixed, values, kinds};
  }

  function solvePotential(geometry, options = {}) {
    const width = options.width ?? 83;
    const height = options.height ?? 57;
    const iterations = options.iterations ?? 520;
    const tolerance = options.tolerance ?? 1e-5;
    const relaxation = options.relaxation ?? 1.78;
    const wireRadius = options.wireRadius ?? 0.015;
    const conductors = rasterizeConductors(
      geometry,
      width,
      height,
      wireRadius,
      options.nodePotentials,
    );
    const potential = new Float64Array(width * height);
    const fixedValues = [...conductors.values].filter((_, index) => conductors.fixed[index]);
    const minimumFixed = Math.min(...fixedValues);
    const maximumFixed = Math.max(...fixedValues);
    const initialValue = 0.5 * (minimumFixed + maximumFixed);
    for (let row = 0; row < height; row += 1) {
      for (let column = 0; column < width; column += 1) {
        const index = row * width + column;
        potential[index] = conductors.fixed[index] ? conductors.values[index] : initialValue;
      }
    }

    let completedIterations = 0;
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      let maximumChange = 0;
      for (let row = 1; row < height - 1; row += 1) {
        for (let column = 1; column < width - 1; column += 1) {
          const index = row * width + column;
          if (conductors.fixed[index]) continue;
          const average = 0.25 * (
            potential[index - 1]
            + potential[index + 1]
            + potential[index - width]
            + potential[index + width]
          );
          const update = relaxation * (average - potential[index]);
          potential[index] += update;
          maximumChange = Math.max(maximumChange, Math.abs(update));
        }
      }
      for (let column = 0; column < width; column += 1) {
        potential[column] = potential[width + column];
        potential[(height - 1) * width + column] = potential[(height - 2) * width + column];
      }
      for (let row = 0; row < height; row += 1) {
        potential[row * width] = potential[row * width + 1];
        potential[row * width + width - 1] = potential[row * width + width - 2];
      }
      completedIterations = iteration + 1;
      if (maximumChange < tolerance && iteration > 40) break;
    }

    const electricX = new Float64Array(width * height);
    const electricY = new Float64Array(width * height);
    const spacingX = 1 / (width - 1);
    const spacingY = 1 / (height - 1);
    for (let row = 0; row < height; row += 1) {
      const lower = Math.max(0, row - 1);
      const upper = Math.min(height - 1, row + 1);
      for (let column = 0; column < width; column += 1) {
        const left = Math.max(0, column - 1);
        const right = Math.min(width - 1, column + 1);
        const index = row * width + column;
        electricX[index] = -(
          potential[row * width + right] - potential[row * width + left]
        ) / ((right - left) * spacingX);
        electricY[index] = -(
          potential[upper * width + column] - potential[lower * width + column]
        ) / ((upper - lower) * spacingY);
      }
    }
    return {
      width,
      height,
      potential,
      electricX,
      electricY,
      conductorKinds: conductors.kinds,
      completedIterations,
    };
  }

  function solveFieldBasis(geometry, options = {}) {
    const independentNodeCount = clamp(Math.round(geometry.loadCount ?? 1), 1, 2);
    const solutions = [];
    let completedIterations = 0;
    for (let nodeIndex = 0; nodeIndex < independentNodeCount; nodeIndex += 1) {
      const nodePotentials = Array(independentNodeCount + 1).fill(0);
      nodePotentials[nodeIndex] = 1;
      const solution = solvePotential(geometry, {...options, nodePotentials});
      completedIterations += solution.completedIterations;
      solutions.push(solution);
    }
    return {
      width: solutions[0].width,
      height: solutions[0].height,
      independentNodeCount,
      solutions,
      conductorKinds: solutions[0].conductorKinds,
      completedIterations,
    };
  }

  function combineFieldBasis(basis, nodeVoltagePhasors) {
    if (nodeVoltagePhasors.length !== basis.independentNodeCount + 1) {
      throw new Error("nodeVoltagePhasors do not match the solved field basis");
    }
    const size = basis.width * basis.height;
    const potentialReal = new Float64Array(size);
    const potentialImaginary = new Float64Array(size);
    const electricXReal = new Float64Array(size);
    const electricXImaginary = new Float64Array(size);
    const electricYReal = new Float64Array(size);
    const electricYImaginary = new Float64Array(size);
    for (let nodeIndex = 0; nodeIndex < basis.independentNodeCount; nodeIndex += 1) {
      const coefficient = nodeVoltagePhasors[nodeIndex];
      const solution = basis.solutions[nodeIndex];
      for (let index = 0; index < size; index += 1) {
        potentialReal[index] += coefficient.real * solution.potential[index];
        potentialImaginary[index] += coefficient.imaginary * solution.potential[index];
        electricXReal[index] += coefficient.real * solution.electricX[index];
        electricXImaginary[index] += coefficient.imaginary * solution.electricX[index];
        electricYReal[index] += coefficient.real * solution.electricY[index];
        electricYImaginary[index] += coefficient.imaginary * solution.electricY[index];
      }
    }
    return {
      width: basis.width,
      height: basis.height,
      potentialReal,
      potentialImaginary,
      electricXReal,
      electricXImaginary,
      electricYReal,
      electricYImaginary,
    };
  }

  function bilinearSample(values, width, height, x, y) {
    const gridX = clamp(x, 0, 1) * (width - 1);
    const gridY = clamp(y, 0, 1) * (height - 1);
    const left = Math.floor(gridX);
    const lower = Math.floor(gridY);
    const right = Math.min(width - 1, left + 1);
    const upper = Math.min(height - 1, lower + 1);
    const fractionX = gridX - left;
    const fractionY = gridY - lower;
    const lowValue = values[lower * width + left] * (1 - fractionX)
      + values[lower * width + right] * fractionX;
    const highValue = values[upper * width + left] * (1 - fractionX)
      + values[upper * width + right] * fractionX;
    return lowValue * (1 - fractionY) + highValue * fractionY;
  }

  function sampleElectricField(solution, x, y) {
    return {
      x: bilinearSample(solution.electricX, solution.width, solution.height, x, y),
      y: bilinearSample(solution.electricY, solution.width, solution.height, x, y),
    };
  }

  root.PoyntingCircuitPhysics = Object.freeze({
    CONSTANTS,
    averagePoyntingVector,
    bilinearSample,
    circuitPhasors,
    circuitEndpoints,
    circuitPaths,
    circuitSegments,
    circuitState,
    cubicPoint,
    cubicTangent,
    defaultGeometry,
    componentImpedance,
    combineFieldBasis,
    complex,
    complexAdd,
    complexDivide,
    complexMagnitude,
    complexMultiply,
    complexSubtract,
    magneticFieldZ,
    instantaneousField,
    poyntingVector,
    quadraticPoint,
    realAtPhase,
    rectangularInwardFlux,
    sampleElectricField,
    sampleCubic,
    sampleQuadratic,
    seriesResponse,
    solveFieldBasis,
    solvePotential,
  });
}(typeof window === "undefined" ? globalThis : window));
