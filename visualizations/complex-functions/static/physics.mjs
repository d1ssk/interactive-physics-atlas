/**
 * Mathematical kernel for the complex-function workbench.
 *
 * This module intentionally has no DOM dependencies.  The expression parser,
 * branch tracking and contour integration can therefore be tested without a
 * browser and later promoted independently of the experimental UI.
 */

export const TAU = 2 * Math.PI;

export function complex(re = 0, im = 0) {
  return {
    re: Object.is(re, -0) ? 0 : re,
    im: Object.is(im, -0) ? 0 : im,
  };
}

export const C_ZERO = complex(0, 0);
export const C_ONE = complex(1, 0);
export const C_I = complex(0, 1);

export class ExpressionError extends SyntaxError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ExpressionError";
    this.code = code;
    this.details = details;
  }
}

function expressionError(code, message, details = {}) {
  return new ExpressionError(code, message, details);
}

export function isFiniteComplex(value) {
  return Number.isFinite(value.re) && Number.isFinite(value.im);
}

export function add(a, b) {
  return complex(a.re + b.re, a.im + b.im);
}

export function subtract(a, b) {
  return complex(a.re - b.re, a.im - b.im);
}

export function negate(value) {
  return complex(-value.re, -value.im);
}

export function multiply(a, b) {
  return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

export function scale(value, factor) {
  return complex(value.re * factor, value.im * factor);
}

export function divide(a, b) {
  const denominator = b.re * b.re + b.im * b.im;
  if (denominator === 0) return complex(Number.NaN, Number.NaN);
  return complex(
    (a.re * b.re + a.im * b.im) / denominator,
    (a.im * b.re - a.re * b.im) / denominator,
  );
}

export function conjugate(value) {
  return complex(value.re, -value.im);
}

export function magnitude(value) {
  return Math.hypot(value.re, value.im);
}

export function phase(value) {
  return Math.atan2(value.im, value.re);
}

export function fromPolar(radius, angle) {
  return complex(radius * Math.cos(angle), radius * Math.sin(angle));
}

export function exponential(value) {
  return fromPolar(Math.exp(value.re), value.im);
}

function normalizeAngleDelta(delta) {
  let result = delta;
  while (result > Math.PI) result -= TAU;
  while (result <= -Math.PI) result += TAU;
  return result;
}

/**
 * Return an argument on a selected sheet and optionally continue it along a
 * sampled path.  Each multivalued syntax node owns an independent state.
 */
export function continuedArgument(value, nodeId, options = {}) {
  const raw = phase(value);
  const defaultBranchIndex = Number.isInteger(options.branchIndex) ? options.branchIndex : 0;
  const branchOverride = options.branchOffsets?.get(nodeId);
  const branchIndex = Number.isInteger(branchOverride) ? branchOverride : defaultBranchIndex;
  const states = options.continuationState;
  if (!states) return raw + branchIndex * TAU;

  const previous = states.get(nodeId);
  if (!previous) {
    const initial = raw + branchIndex * TAU;
    states.set(nodeId, {raw, unwrapped: initial});
    return initial;
  }

  const unwrapped = previous.unwrapped + normalizeAngleDelta(raw - previous.raw);
  states.set(nodeId, {raw, unwrapped});
  return unwrapped;
}

export function logarithm(value, nodeId = "log", options = {}) {
  const radius = magnitude(value);
  if (radius === 0) return complex(Number.NEGATIVE_INFINITY, Number.NaN);
  return complex(Math.log(radius), continuedArgument(value, nodeId, options));
}

export function squareRoot(value, nodeId = "sqrt", options = {}) {
  const radius = magnitude(value);
  if (radius === 0) return C_ZERO;
  return fromPolar(Math.sqrt(radius), continuedArgument(value, nodeId, options) / 2);
}

export function power(base, exponent, nodeId = "power", options = {}) {
  if (exponent.im === 0 && Number.isInteger(exponent.re)) {
    let result = C_ONE;
    let factor = base;
    let remaining = Math.abs(exponent.re);
    while (remaining > 0) {
      if (remaining % 2 === 1) result = multiply(result, factor);
      factor = multiply(factor, factor);
      remaining = Math.floor(remaining / 2);
    }
    return exponent.re < 0 ? divide(C_ONE, result) : result;
  }
  if (magnitude(base) === 0) {
    if (exponent.im === 0 && exponent.re > 0) return C_ZERO;
    if (exponent.re === 0 && exponent.im === 0) return C_ONE;
    return complex(Number.NaN, Number.NaN);
  }
  const logBase = complex(
    Math.log(magnitude(base)),
    continuedArgument(base, nodeId, options),
  );
  return exponential(multiply(exponent, logBase));
}

export function sine(value) {
  return complex(
    Math.sin(value.re) * Math.cosh(value.im),
    Math.cos(value.re) * Math.sinh(value.im),
  );
}

export function cosine(value) {
  return complex(
    Math.cos(value.re) * Math.cosh(value.im),
    -Math.sin(value.re) * Math.sinh(value.im),
  );
}

export function tangent(value) {
  return divide(sine(value), cosine(value));
}

export function hyperbolicSine(value) {
  return complex(
    Math.sinh(value.re) * Math.cos(value.im),
    Math.cosh(value.re) * Math.sin(value.im),
  );
}

export function hyperbolicCosine(value) {
  return complex(
    Math.cosh(value.re) * Math.cos(value.im),
    Math.sinh(value.re) * Math.sin(value.im),
  );
}

const FUNCTION_NAMES = new Set([
  "sqrt",
  "log",
  "exp",
  "sin",
  "cos",
  "tan",
  "sinh",
  "cosh",
  "conj",
  "abs",
  "arg",
  "re",
  "im",
  "pow",
]);

const CONSTANT_NAMES = new Set(["i", "pi", "e"]);
const VARIABLE_NAMES = new Set(["z", "zbar", "x", "y"]);

function canonicalizeSource(source) {
  return source
    .replaceAll("−", "-")
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("π", "pi")
    .replace(/\\bar\s*\{\s*z\s*\}/giu, "zbar")
    .replace(/z[\u0304\u0305]/gu, "zbar")
    .replace(/\bbar\s*\(\s*z\s*\)/giu, "conj(z)");
}

function tokenize(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    const whitespace = rest.match(/^\s+/u);
    if (whitespace) {
      index += whitespace[0].length;
      continue;
    }

    const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/iu);
    if (number) {
      tokens.push({type: "number", value: Number(number[0]), position: index});
      index += number[0].length;
      continue;
    }

    const identifier = rest.match(/^[a-zA-Z_][a-zA-Z_0-9]*/u);
    if (identifier) {
      tokens.push({type: "identifier", value: identifier[0].toLowerCase(), position: index});
      index += identifier[0].length;
      continue;
    }

    const character = source[index];
    if ("+-*/^(),".includes(character)) {
      tokens.push({type: character, value: character, position: index});
      index += 1;
      continue;
    }
    throw expressionError(
      "unrecognized-character",
      `Cannot parse “${character}” at position ${index + 1}.`,
      {character, position: index + 1},
    );
  }
  tokens.push({type: "eof", value: "", position: source.length});
  return tokens;
}

function endsAtom(token) {
  return token.type === "number" || token.type === "identifier" || token.type === ")";
}

function startsAtom(token) {
  return token.type === "number" || token.type === "identifier" || token.type === "(";
}

/** Insert multiplication in familiar inputs such as 2z and (z-1)(z+1). */
function addImplicitMultiplication(tokens) {
  const result = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    const next = tokens[index + 1];
    result.push(current);
    if (!next || next.type === "eof") continue;
    const isFunctionCall =
      current.type === "identifier" && FUNCTION_NAMES.has(current.value) && next.type === "(";
    if (endsAtom(current) && startsAtom(next) && !isFunctionCall) {
      result.push({type: "*", value: "*", position: next.position});
    }
  }
  return result;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
    this.nextNodeId = 1;
    this.variables = new Set();
  }

  peek() {
    return this.tokens[this.index];
  }

  consume(type) {
    const token = this.peek();
    if (token.type !== type) {
      const found = token.type === "eof" ? "the end of the expression" : `“${token.value}”`;
      throw expressionError(
        "expected-token",
        `Expected ${type} at position ${token.position + 1}, but found ${found}.`,
        {expected: type, found: token.value, atEnd: token.type === "eof", position: token.position + 1},
      );
    }
    this.index += 1;
    return token;
  }

  node(kind, fields = {}) {
    const result = {kind, id: this.nextNodeId, ...fields};
    this.nextNodeId += 1;
    return result;
  }

  parse() {
    const expression = this.parseAdditive();
    this.consume("eof");
    return expression;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.peek().type === "+" || this.peek().type === "-") {
      const operator = this.peek().type;
      this.index += 1;
      left = this.node("binary", {operator, left, right: this.parseMultiplicative()});
    }
    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();
    while (this.peek().type === "*" || this.peek().type === "/") {
      const operator = this.peek().type;
      this.index += 1;
      left = this.node("binary", {operator, left, right: this.parseUnary()});
    }
    return left;
  }

  // Unary signs bind less tightly than powers: -z^2 means -(z^2).
  parseUnary() {
    if (this.peek().type === "+" || this.peek().type === "-") {
      const operator = this.peek().type;
      this.index += 1;
      return this.node("unary", {operator, operand: this.parseUnary()});
    }
    return this.parsePower();
  }

  // Powers are right associative: z^2^3 means z^(2^3).
  parsePower() {
    let left = this.parsePrimary();
    if (this.peek().type === "^") {
      this.index += 1;
      left = this.node("binary", {operator: "^", left, right: this.parseUnary()});
    }
    return left;
  }

  parsePrimary() {
    const token = this.peek();
    if (token.type === "number") {
      this.index += 1;
      return this.node("literal", {value: complex(token.value, 0)});
    }

    if (token.type === "identifier") {
      this.index += 1;
      const name = token.value;
      if (this.peek().type === "(") {
        if (!FUNCTION_NAMES.has(name)) {
          throw expressionError("unknown-function", `Unknown function “${name}”.`, {name});
        }
        this.index += 1;
        const args = [];
        if (this.peek().type !== ")") {
          args.push(this.parseAdditive());
          while (this.peek().type === ",") {
            this.index += 1;
            args.push(this.parseAdditive());
          }
        }
        this.consume(")");
        return this.node("call", {name, args});
      }
      if (CONSTANT_NAMES.has(name)) return this.node("constant", {name});
      if (VARIABLE_NAMES.has(name)) {
        this.variables.add(name);
        return this.node("variable", {name});
      }
      throw expressionError("unknown-symbol", `Unknown symbol “${name}”.`, {name});
    }

    if (token.type === "(") {
      this.index += 1;
      const expression = this.parseAdditive();
      this.consume(")");
      return expression;
    }
    const found = token.type === "eof" ? "the end of the expression" : `“${token.value}”`;
    throw expressionError(
      "expected-value",
      `Expected a value before ${found} at position ${token.position + 1}.`,
      {found: token.value, atEnd: token.type === "eof", position: token.position + 1},
    );
  }
}

function evaluateCall(node, args, options) {
  if (node.name === "sqrt") {
    return requireArity(node, args, 1, () => squareRoot(args[0], `sqrt:${node.id}`, options));
  }
  if (node.name === "log") {
    return requireArity(node, args, 1, () => logarithm(args[0], `log:${node.id}`, options));
  }
  if (node.name === "exp") return requireArity(node, args, 1, () => exponential(args[0]));
  if (node.name === "sin") return requireArity(node, args, 1, () => sine(args[0]));
  if (node.name === "cos") return requireArity(node, args, 1, () => cosine(args[0]));
  if (node.name === "tan") return requireArity(node, args, 1, () => tangent(args[0]));
  if (node.name === "sinh") return requireArity(node, args, 1, () => hyperbolicSine(args[0]));
  if (node.name === "cosh") return requireArity(node, args, 1, () => hyperbolicCosine(args[0]));
  if (node.name === "conj") return requireArity(node, args, 1, () => conjugate(args[0]));
  if (node.name === "abs") return requireArity(node, args, 1, () => complex(magnitude(args[0]), 0));
  if (node.name === "arg") return requireArity(node, args, 1, () => complex(phase(args[0]), 0));
  if (node.name === "re") return requireArity(node, args, 1, () => complex(args[0].re, 0));
  if (node.name === "im") return requireArity(node, args, 1, () => complex(args[0].im, 0));
  if (node.name === "pow") {
    return requireArity(node, args, 2, () => power(args[0], args[1], `pow:${node.id}`, options));
  }
  throw new RangeError(`Unknown function: ${node.name}`);
}

function requireArity(node, args, expected, operation) {
  if (args.length !== expected) {
    throw expressionError(
      "wrong-arity",
      `${node.name} takes ${expected} argument${expected === 1 ? "" : "s"}.`,
      {name: node.name, expected},
    );
  }
  return operation();
}

function evaluateNode(node, environment, options) {
  if (node.kind === "literal") return node.value;
  if (node.kind === "constant") {
    if (node.name === "i") return C_I;
    if (node.name === "pi") return complex(Math.PI, 0);
    return complex(Math.E, 0);
  }
  if (node.kind === "variable") return environment[node.name];
  if (node.kind === "unary") {
    const value = evaluateNode(node.operand, environment, options);
    return node.operator === "-" ? negate(value) : value;
  }
  if (node.kind === "binary") {
    const left = evaluateNode(node.left, environment, options);
    const right = evaluateNode(node.right, environment, options);
    if (node.operator === "+") return add(left, right);
    if (node.operator === "-") return subtract(left, right);
    if (node.operator === "*") return multiply(left, right);
    if (node.operator === "/") return divide(left, right);
    return power(left, right, `power:${node.id}`, options);
  }
  const args = node.args.map((argument) => evaluateNode(argument, environment, options));
  return evaluateCall(node, args, options);
}

const MODE_VARIABLES = {
  holomorphic: new Set(["z"]),
  xy: new Set(["x", "y"]),
  zbar: new Set(["z", "zbar"]),
};

/**
 * Parse and compile a user expression.  "holomorphic" means that only z may
 * be referenced; global holomorphicity is deliberately not claimed because
 * poles, branch points, log and sqrt remain allowed experiments.
 */
export function compileExpression(source, mode = "holomorphic") {
  if (!MODE_VARIABLES[mode]) throw new RangeError(`Unknown expression mode: ${mode}`);
  const canonical = canonicalizeSource(source.trim());
  if (!canonical) throw expressionError("empty-expression", "Enter an expression.");
  const parser = new Parser(addImplicitMultiplication(tokenize(canonical)));
  const ast = parser.parse();
  const allowed = MODE_VARIABLES[mode];
  const invalidVariables = [...parser.variables].filter((variable) => !allowed.has(variable));
  if (invalidVariables.length) {
    throw expressionError(
      "invalid-variables",
      `${invalidVariables.join(", ")} cannot be used in this input mode. Choose another input form.`,
      {variables: invalidVariables},
    );
  }

  return {
    source: canonical,
    mode,
    variables: new Set(parser.variables),
    evaluateAt(z, options = {}) {
      const environment = {
        z,
        zbar: conjugate(z),
        x: complex(z.re, 0),
        y: complex(z.im, 0),
      };
      return evaluateNode(ast, environment, options);
    },
  };
}

export function createContinuationState() {
  return new Map();
}

export function continuationSummary(states) {
  const nodes = [...states.entries()].map(([id, state]) => ({
    id,
    argument: state.unwrapped,
    turns: Math.round((state.unwrapped - state.raw) / TAU),
  }));
  return {
    nodes,
    maximumTurns: nodes.reduce((maximum, node) => Math.max(maximum, Math.abs(node.turns)), 0),
  };
}

/**
 * Convert pathwise unwrapped arguments into the sheet coordinates needed to
 * draw the same analytic branch over the base plane.  The sign is determined
 * by the direction in which the principal argument jumped at a cut.
 */
export function branchOffsetsFromContinuation(states) {
  return new Map(
    [...states.entries()].map(([id, state]) => [
      id,
      Math.round((state.unwrapped - state.raw) / TAU),
    ]),
  );
}

export function trapezoidContribution(z0, z1, f0, f1) {
  return multiply(scale(add(f0, f1), 0.5), subtract(z1, z0));
}

/** Integrate samples in order, continuing every multivalued node along them. */
export function integratePolyline(points, compiled, {branchIndex = 0} = {}) {
  const continuationState = createContinuationState();
  if (points.length === 0) {
    return {integral: C_ZERO, values: [], continuationState};
  }

  const values = [];
  let integral = C_ZERO;
  for (let index = 0; index < points.length; index += 1) {
    const value = compiled.evaluateAt(points[index], {branchIndex, continuationState});
    values.push(value);
    if (index > 0 && isFiniteComplex(value) && isFiniteComplex(values[index - 1])) {
      integral = add(
        integral,
        trapezoidContribution(points[index - 1], points[index], values[index - 1], value),
      );
    }
  }
  return {integral, values, continuationState};
}

export function relativeComplexDistance(a, b, floor = 1e-12) {
  return magnitude(subtract(a, b)) / Math.max(magnitude(a), magnitude(b), floor);
}
