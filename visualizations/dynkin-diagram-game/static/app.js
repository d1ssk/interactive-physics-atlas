"use strict";

const DATA = JSON.parse(document.getElementById("application-data").textContent);
const svg = document.getElementById("diagram");
const edgeLayer = document.getElementById("edges");
const nodeLayer = document.getElementById("nodes");
const byId = id => document.getElementById(id);
const LOCALE = new URLSearchParams(window.location.search).get("lang") === "ja" ? "ja" : "en";
const MESSAGES = {
  en: {
    hintMove: "Move mode: drag nodes to arrange the diagram; click a node or bond to select it.",
    hintAdd: "Add mode: click empty space to create a node.",
    hintConnect: "Connect mode: select two nodes. A multiple bond points to the second node.",
    nodeAria: "simple root alpha {number}", componentPrefix: "Component {number}: ", rank: "rank {rank}",
    challengeTitle: "Challenge: build {type}", startBuilding: "Start building", startStatus: "Add a node to begin.",
    invalidTitle: "Not a finite Dynkin diagram", invalidSuffix: " Undo or edit a selected bond.",
    solvedTitle: "{type} solved", solvedStatus: "Correct: the Cartan matrix is equivalent to {type} up to relabeling of simple roots.",
    wrongChallenge: "Valid finite type {name}, but the current challenge asks for {type}.",
    semisimple: "Every connected component is finite type, so this is a semisimple product.",
    connectedFinite: "This is a connected finite crystallographic Dynkin diagram.",
    cycle: "the underlying graph contains a cycle. Every connected finite Dynkin diagram is a tree.",
    degree: "a node has degree greater than three, which does not occur in a finite Dynkin diagram.",
    multiple: "a connected finite Dynkin diagram has at most one multiple bond.",
    triple: "a triple bond occurs only in the rank-two G2 diagram.",
    branchingLaced: "finite diagrams with a branching node are simply laced.",
    branchingCount: "the tree has more than one branching node; finite D and E diagrams have exactly one.",
    multipleMismatch: "the multiple bond position or arrow direction does not match a finite B, C, F, or G diagram.",
    branchMismatch: "the branch lengths do not match any finite D or E diagram.",
    noMatch: "The resulting Cartan matrix does not match a finite type through rank eight.",
    sandbox: "Sandbox", buildType: "Build {type}",
  },
  ja: {
    eyebrow: "インタラクティブ・リー理論", title: "ディンキン図形ビルダー",
    lede: "ノードを1つずつ追加して図形を構成します。エディターは全階数8までの有限結晶型を判定し、対応するカルタン行列を表示します。",
    mode: "モード", move: "移動", addNode: "ノードを追加", connect: "接続", bond: "辺",
    single: "単辺", double: "二重辺", triple: "三重辺", reverse: "矢印を反転", delete: "削除",
    undo: "元に戻す", redo: "やり直す", reset: "リセット",
    emptyHint: "クリックして最初のノードを追加", emptySubhint: "次に「接続」を選び、2つのノードを選択します",
    hintMove: "移動モード：ノードをドラッグして配置し、ノードまたは辺をクリックして選択します。",
    hintAdd: "追加モード：空いている場所をクリックしてノードを作成します。",
    hintConnect: "接続モード：2つのノードを選択します。多重辺の矢印は2番目のノードを指します。",
    classificationLabel: "分類", startBuilding: "構成を始める", startStatus: "まずノードを追加してください。",
    cartanMatrix: "カルタン行列", convention: "\\(A_{ij}=\\langle\\alpha_i,\\alpha_j^\\vee\\rangle\\)。矢印は短いルートを指します。",
    finiteCriterion: "有限型の判定条件", validityHeading: "ディンキン図形が有限型となる条件",
    ruleCartan: "<strong>カルタン行列の成分。</strong>対角成分は2、非対角成分は非正整数で、\\(A_{ij}=0\\) と \\(A_{ji}=0\\) は同値です。単辺、二重辺、三重辺では \\(A_{ij}A_{ji}\\) がそれぞれ1、2、3になります。",
    ruleFinite: "<strong>有限型判定。</strong>\\(D=\\operatorname{diag}(d_i)\\) としたとき \\(DA\\) が対称になる正整数 \\(d_i\\) が存在し、その対称行列が正定値でなければなりません。Pythonカタログはこの完全な代数的条件を使用します。",
    ruleShape: "<strong>図形の形。</strong>各連結成分は \\(A,B,C,D,E,F,G\\) 系列のいずれかの木です。閉路をもたず、多重辺は高々1本で、次数4以上のノードはありません。これらは必要条件ですが、枝の長さと多重辺の位置も有限型と一致する必要があります。",
    ruleDisconnected: "<strong>非連結図形。</strong>すべての連結成分が有限型判定を通る必要があります。その場合、結果は半単純直和を表し、図形とコンパクト群のラベルの積として表示されます。",
    instructionsSummary: "操作方法と有限型の条件",
    instructionControls: "<strong>ノードを追加</strong>で単純ルートを作ります。<strong>接続</strong>で選んだ2ノードを指定した辺で結びます。新しい多重辺は2番目のノードを指します。辺を選択して<strong>矢印を反転</strong>するとルート長の順序を変更できます。",
    instructionTypes: "連結な結果は \\(A_n,B_n,C_n,D_n,E_{6,7,8},F_4,G_2\\) のいずれかでなければなりません。非連結な有限型成分は半単純積として認識されます。構成できる全階数の上限は8です。",
    instructionKeyboard: "キーボード：Deleteで選択対象を削除し、Escapeで選択を解除します。Ctrl/Cmd+Zで元に戻し、Ctrl/Cmd+Shift+Zでやり直します。",
    nodeAria: "単純ルート アルファ {number}", componentPrefix: "成分{number}：", rank: "階数 {rank}",
    challengeTitle: "チャレンジ：{type}を構成", invalidTitle: "有限型ディンキン図形ではありません",
    invalidSuffix: " 元に戻すか、選択した辺を編集してください。", solvedTitle: "{type}を完成",
    solvedStatus: "正解です。単純ルートの番号を付け替えると、カルタン行列は{type}と同値です。",
    wrongChallenge: "有限型{name}ですが、現在のチャレンジは{type}です。",
    semisimple: "すべての連結成分が有限型なので、これは半単純積です。",
    connectedFinite: "連結な有限結晶型ディンキン図形です。",
    cycle: "基礎グラフに閉路があります。連結な有限型ディンキン図形はすべて木です。",
    degree: "次数4以上のノードがあります。有限型ディンキン図形には現れません。",
    multiple: "連結な有限型ディンキン図形に含まれる多重辺は高々1本です。",
    triple: "三重辺が現れるのは階数2のG2図形だけです。",
    branchingLaced: "分岐ノードをもつ有限型図形は単純結合型です。",
    branchingCount: "木に複数の分岐ノードがあります。有限型D、E図形の分岐ノードは1つだけです。",
    multipleMismatch: "多重辺の位置または矢印の向きが有限型B、C、F、G図形と一致しません。",
    branchMismatch: "枝の長さが有限型D、E図形のいずれとも一致しません。",
    noMatch: "得られたカルタン行列は全階数8までの有限型と一致しません。",
    sandbox: "自由編集", buildType: "{type}を構成",
  },
};
const t = (key, values = {}) => Object.entries(values).reduce(
  (message, [name, value]) => message.replaceAll(`{${name}}`, value),
  MESSAGES[LOCALE][key] ?? MESSAGES.en[key] ?? key,
);

function localizeStaticContent() {
  document.documentElement.lang = LOCALE;
  if (LOCALE !== "ja") return;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const message = t(element.dataset.i18n);
    if (element instanceof SVGElement) element.textContent = message;
    else element.innerHTML = message;
  });
  const aria = {
    ".workspace": "ディンキン図形エディター", ".toolbar": "編集ツール",
    '[aria-label="Pointer mode"]': "ポインターモード", '[aria-label="Edit selection"]': "選択対象の編集",
    '[aria-label="Edit history"]': "編集履歴", "#diagram": "編集可能なディンキン図形キャンバス",
    ".results": "分類結果",
  };
  Object.entries(aria).forEach(([selector, label]) => document.querySelector(selector)?.setAttribute("aria-label", label));
  window.MathJax?.typesetPromise?.();
}

let state = {nodes: [], edges: [], nextId: 1};
let mode = "add";
let selected = null;
let connectingFrom = null;
let dragging = null;
let undoStack = [];
let redoStack = [];

const snapshot = () => JSON.stringify(state);
const restore = value => { state = JSON.parse(value); selected = null; connectingFrom = null; };

function commit(change) {
  undoStack.push(snapshot());
  redoStack = [];
  change();
  render();
}

function svgPoint(event) {
  const point = new DOMPoint(event.clientX, event.clientY);
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function nodeById(id) {
  return state.nodes.find(node => node.id === id);
}

function edgeBetween(left, right) {
  return state.edges.find(edge =>
    (edge.source === left && edge.target === right)
    || (edge.source === right && edge.target === left));
}

function setMode(nextMode) {
  mode = nextMode;
  connectingFrom = null;
  document.querySelectorAll("[data-mode]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
  });
  const hints = {move: t("hintMove"), add: t("hintAdd"), connect: t("hintConnect")};
  byId("interaction-hint").textContent = hints[mode];
  render();
}

function addNode(event) {
  if (mode !== "add" || state.nodes.length >= DATA.maxRank) return;
  const point = svgPoint(event);
  commit(() => {
    state.nodes.push({id: state.nextId, x: point.x, y: point.y});
    selected = {kind: "node", id: state.nextId};
    state.nextId += 1;
  });
}

function connectNode(id) {
  if (connectingFrom === null) {
    connectingFrom = id;
    selected = {kind: "node", id};
    render();
    return;
  }
  if (connectingFrom === id) {
    connectingFrom = null;
    render();
    return;
  }
  const source = connectingFrom;
  const target = id;
  const multiplicity = Number(byId("bond-type").value);
  commit(() => {
    const existing = edgeBetween(source, target);
    if (existing) {
      existing.multiplicity = multiplicity;
      existing.arrowToward = multiplicity > 1 ? target : null;
      selected = {kind: "edge", id: existing.id};
    } else {
      const edge = {
        id: `${Math.min(source, target)}-${Math.max(source, target)}`,
        source,
        target,
        multiplicity,
        arrowToward: multiplicity > 1 ? target : null,
      };
      state.edges.push(edge);
      selected = {kind: "edge", id: edge.id};
    }
    connectingFrom = null;
  });
}

function nodePointerDown(event, id) {
  event.stopPropagation();
  if (mode !== "move") return;
  const node = nodeById(id);
  const point = svgPoint(event);
  dragging = {
    id,
    pointerId: event.pointerId,
    offsetX: point.x - node.x,
    offsetY: point.y - node.y,
    before: snapshot(),
    moved: false,
  };
  svg.setPointerCapture(event.pointerId);
}

function nodeClicked(event, id) {
  event.stopPropagation();
  if (dragging?.moved) return;
  if (mode === "connect") {
    connectNode(id);
  } else {
    selected = {kind: "node", id};
    render();
  }
}

function dragNode(event) {
  if (!dragging || event.pointerId !== dragging.pointerId) return;
  const point = svgPoint(event);
  const node = nodeById(dragging.id);
  const nextX = Math.max(28, Math.min(872, point.x - dragging.offsetX));
  const nextY = Math.max(28, Math.min(492, point.y - dragging.offsetY));
  if (Math.hypot(nextX - node.x, nextY - node.y) > 0.5) dragging.moved = true;
  node.x = nextX;
  node.y = nextY;
  const group = nodeLayer.querySelector(`[data-node-id="${node.id}"]`);
  if (group) group.setAttribute("transform", `translate(${node.x} ${node.y})`);
  renderEdges();
}

function finishDrag(event) {
  if (!dragging || event.pointerId !== dragging.pointerId) return;
  if (dragging.moved) {
    undoStack.push(dragging.before);
    redoStack = [];
  }
  svg.releasePointerCapture(event.pointerId);
  dragging = null;
  render();
}

function edgeGeometry(edge) {
  const source = nodeById(edge.source);
  const target = nodeById(edge.target);
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy) || 1;
  return {source, target, ux: dx / length, uy: dy / length, px: -dy / length, py: dx / length};
}

function linePath(geometry, offset = 0) {
  const {source, target, px, py} = geometry;
  return `M ${source.x + px * offset} ${source.y + py * offset} L ${target.x + px * offset} ${target.y + py * offset}`;
}

function arrowPoints(edge, geometry) {
  const towardTarget = edge.arrowToward === edge.target;
  const tipNode = towardTarget ? geometry.target : geometry.source;
  const ux = towardTarget ? geometry.ux : -geometry.ux;
  const uy = towardTarget ? geometry.uy : -geometry.uy;
  const tipX = tipNode.x - ux * 25;
  const tipY = tipNode.y - uy * 25;
  const baseX = tipX - ux * 17;
  const baseY = tipY - uy * 17;
  const px = -uy;
  const py = ux;
  return `${tipX},${tipY} ${baseX + px * 8},${baseY + py * 8} ${baseX - px * 8},${baseY - py * 8}`;
}

function renderEdges() {
  edgeLayer.replaceChildren(...state.edges.map(edge => {
    const geometry = edgeGeometry(edge);
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("edge");
    if (selected?.kind === "edge" && selected.id === edge.id) group.classList.add("selected");
    group.dataset.edgeId = edge.id;
    const offsets = edge.multiplicity === 1 ? [0] : edge.multiplicity === 2 ? [-4, 4] : [-7, 0, 7];
    offsets.forEach(offset => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.classList.add("edge-line");
      path.setAttribute("d", linePath(geometry, offset));
      group.append(path);
    });
    if (edge.multiplicity > 1) {
      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      arrow.classList.add("arrow");
      arrow.setAttribute("points", arrowPoints(edge, geometry));
      group.append(arrow);
    }
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.classList.add("edge-hit");
    hit.setAttribute("d", linePath(geometry));
    hit.addEventListener("click", event => {
      event.stopPropagation();
      selected = {kind: "edge", id: edge.id};
      byId("bond-type").value = String(edge.multiplicity);
      render();
    });
    group.prepend(hit);
    return group;
  }));
}

function renderNodes() {
  nodeLayer.replaceChildren(...state.nodes.map((node, index) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("node");
    if (selected?.kind === "node" && selected.id === node.id) group.classList.add("selected");
    if (connectingFrom === node.id) group.classList.add("connecting");
    group.dataset.nodeId = node.id;
    group.setAttribute("transform", `translate(${node.x} ${node.y})`);
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", t("nodeAria", {number: index + 1}));
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", "21");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dy", ".35em");
    label.textContent = `α${index + 1}`;
    group.append(circle, label);
    group.addEventListener("pointerdown", event => nodePointerDown(event, node.id));
    group.addEventListener("click", event => nodeClicked(event, node.id));
    group.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        nodeClicked(event, node.id);
      }
    });
    return group;
  }));
}

function currentCartan() {
  const indices = new Map(state.nodes.map((node, index) => [node.id, index]));
  const matrix = state.nodes.map((_, row) => state.nodes.map((__, column) => row === column ? 2 : 0));
  state.edges.forEach(edge => {
    const source = indices.get(edge.source);
    const target = indices.get(edge.target);
    if (edge.multiplicity === 1) {
      matrix[source][target] = -1;
      matrix[target][source] = -1;
    } else if (edge.arrowToward === edge.target) {
      matrix[source][target] = -edge.multiplicity;
      matrix[target][source] = -1;
    } else {
      matrix[source][target] = -1;
      matrix[target][source] = -edge.multiplicity;
    }
  });
  return matrix;
}

function components(matrix) {
  const unseen = new Set(matrix.map((_, index) => index));
  const result = [];
  while (unseen.size) {
    const start = Math.min(...unseen);
    unseen.delete(start);
    const queue = [start];
    const component = [];
    while (queue.length) {
      const node = queue.pop();
      component.push(node);
      [...unseen].forEach(other => {
        if (matrix[node][other] !== 0) {
          unseen.delete(other);
          queue.push(other);
        }
      });
    }
    result.push(component.sort((left, right) => left - right));
  }
  return result;
}

function nodeSignature(matrix, node) {
  return matrix[node]
    .map((value, other) => other === node || value === 0 ? null : `${value}:${matrix[other][node]}`)
    .filter(value => value !== null)
    .sort()
    .join("|");
}

function isomorphic(left, right) {
  if (left.length !== right.length) return false;
  const candidates = left.map((_, node) => right
    .map((__, target) => target)
    .filter(target => nodeSignature(left, node) === nodeSignature(right, target)));
  if (candidates.some(values => values.length === 0)) return false;
  const order = left.map((_, index) => index).sort((a, b) => candidates[a].length - candidates[b].length);
  const mapping = new Map();
  const used = new Set();
  function search(position) {
    if (position === order.length) return true;
    const node = order[position];
    for (const target of candidates[node]) {
      if (used.has(target)) continue;
      const consistent = [...mapping].every(([known, mapped]) =>
        left[node][known] === right[target][mapped]
        && left[known][node] === right[mapped][target]);
      if (!consistent) continue;
      mapping.set(node, target);
      used.add(target);
      if (search(position + 1)) return true;
      mapping.delete(node);
      used.delete(target);
    }
    return false;
  }
  return search(0);
}

function classify(matrix) {
  if (!matrix.length) return [];
  const types = [];
  for (const component of components(matrix)) {
    const block = component.map(row => component.map(column => matrix[row][column]));
    const match = DATA.diagrams.find(diagram => diagram.rank === block.length && isomorphic(block, diagram.cartan));
    if (!match) return null;
    types.push(match.name);
  }
  return types;
}

function invalidReason(matrix) {
  const connectedComponents = components(matrix);
  for (const [componentIndex, component] of connectedComponents.entries()) {
    const prefix = connectedComponents.length > 1
      ? t("componentPrefix", {number: componentIndex + 1}) : "";
    const degrees = component.map(node => component.filter(other => matrix[node][other] !== 0).length);
    const edges = [];
    component.forEach((left, leftIndex) => component.slice(leftIndex + 1).forEach(right => {
      if (matrix[left][right] !== 0) {
        edges.push({left, right, multiplicity: Math.max(-matrix[left][right], -matrix[right][left])});
      }
    }));
    if (edges.length >= component.length) {
      return `${prefix}${t("cycle")}`;
    }
    if (Math.max(...degrees) > 3) {
      return `${prefix}${t("degree")}`;
    }
    const multiple = edges.filter(edge => edge.multiplicity > 1);
    if (multiple.length > 1) {
      return `${prefix}${t("multiple")}`;
    }
    if (multiple.some(edge => edge.multiplicity === 3) && component.length !== 2) {
      return `${prefix}${t("triple")}`;
    }
    if (multiple.length && degrees.some(degree => degree === 3)) {
      return `${prefix}${t("branchingLaced")}`;
    }
    if (degrees.filter(degree => degree === 3).length > 1) {
      return `${prefix}${t("branchingCount")}`;
    }
    if (multiple.length) {
      return `${prefix}${t("multipleMismatch")}`;
    }
    if (degrees.includes(3)) {
      return `${prefix}${t("branchMismatch")}`;
    }
  }
  return t("noMatch");
}

function groupNotation(types) {
  const labels = types.map(type => DATA.diagrams.find(diagram => diagram.name === type)?.groupLabel ?? null);
  if (labels.every(label => label === null)) return "";
  return types.map((type, index) => labels[index] ?? type).join(" × ");
}

function renderMatrix(matrix) {
  const target = byId("matrix");
  byId("rank").textContent = t("rank", {rank: matrix.length});
  if (!matrix.length) {
    target.className = "matrix empty";
    target.textContent = "—";
    return;
  }
  target.className = "matrix";
  const rows = matrix.map(row => row.join(" & ")).join(" \\\\ ");
  target.textContent = `\\[A=\\begin{pmatrix}${rows}\\end{pmatrix}\\]`;
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetClear([target]);
    window.MathJax.typesetPromise([target]);
  }
}

function renderClassification(matrix) {
  const card = byId("status-card");
  const title = byId("classification");
  const status = byId("status");
  const groupLabel = byId("group-label");
  const challenge = byId("challenge").value;
  groupLabel.hidden = true;
  groupLabel.textContent = "";
  if (!matrix.length) {
    card.className = "status-card neutral";
    title.textContent = challenge ? t("challengeTitle", {type: challenge}) : t("startBuilding");
    status.textContent = t("startStatus");
    return;
  }
  const types = classify(matrix);
  if (types === null) {
    card.className = "status-card invalid";
    title.textContent = t("invalidTitle");
    status.textContent = `${invalidReason(matrix)}${t("invalidSuffix")}`;
    return;
  }
  const name = types.join(" × ");
  const groups = groupNotation(types);
  if (groups) {
    groupLabel.textContent = groups;
    groupLabel.hidden = false;
  }
  if (challenge && types.length === 1 && types[0] === challenge) {
    card.className = "status-card solved";
    title.textContent = t("solvedTitle", {type: challenge});
    status.textContent = t("solvedStatus", {type: challenge});
  } else {
    card.className = "status-card valid";
    title.textContent = name;
    status.textContent = challenge
      ? t("wrongChallenge", {name, type: challenge})
      : types.length > 1
        ? t("semisimple")
        : t("connectedFinite");
  }
}

function updateControls() {
  const edge = selected?.kind === "edge" ? state.edges.find(item => item.id === selected.id) : null;
  byId("reverse").disabled = !edge || edge.multiplicity === 1;
  byId("delete").disabled = selected === null;
  byId("undo").disabled = undoStack.length === 0;
  byId("redo").disabled = redoStack.length === 0;
  byId("empty-hint").style.display = state.nodes.length ? "none" : "block";
  byId("empty-subhint").style.display = state.nodes.length ? "none" : "block";
}

function render() {
  renderEdges();
  renderNodes();
  const matrix = currentCartan();
  renderMatrix(matrix);
  renderClassification(matrix);
  updateControls();
}

function deleteSelection() {
  if (!selected) return;
  commit(() => {
    if (selected.kind === "node") {
      state.nodes = state.nodes.filter(node => node.id !== selected.id);
      state.edges = state.edges.filter(edge => edge.source !== selected.id && edge.target !== selected.id);
    } else {
      state.edges = state.edges.filter(edge => edge.id !== selected.id);
    }
    selected = null;
  });
}

function reverseArrow() {
  if (selected?.kind !== "edge") return;
  const edge = state.edges.find(item => item.id === selected.id);
  if (!edge || edge.multiplicity === 1) return;
  commit(() => { edge.arrowToward = edge.arrowToward === edge.source ? edge.target : edge.source; });
}

function updateSelectedBond() {
  if (selected?.kind !== "edge") return;
  const edge = state.edges.find(item => item.id === selected.id);
  if (!edge) return;
  const multiplicity = Number(byId("bond-type").value);
  if (multiplicity === edge.multiplicity) return;
  commit(() => {
    edge.multiplicity = multiplicity;
    edge.arrowToward = multiplicity > 1 ? (edge.arrowToward ?? edge.target) : null;
  });
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
  render();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
  render();
}

document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
byId("bond-type").addEventListener("change", updateSelectedBond);
byId("reverse").addEventListener("click", reverseArrow);
byId("delete").addEventListener("click", deleteSelection);
byId("undo").addEventListener("click", undo);
byId("redo").addEventListener("click", redo);
byId("reset").addEventListener("click", () => {
  if (!state.nodes.length) return;
  commit(() => { state = {nodes: [], edges: [], nextId: 1}; selected = null; connectingFrom = null; });
});
byId("challenge").replaceChildren(
  new Option(t("sandbox"), ""),
  ...DATA.diagrams.map(diagram => new Option(t("buildType", {type: diagram.name}), diagram.name)),
);
byId("challenge").addEventListener("change", render);
svg.querySelector(".canvas-background").addEventListener("click", event => {
  selected = null;
  if (mode === "add") addNode(event); else render();
});
svg.addEventListener("pointermove", dragNode);
svg.addEventListener("pointerup", finishDrag);
svg.addEventListener("pointercancel", finishDrag);
document.addEventListener("keydown", event => {
  if (event.target.matches("select, input, textarea")) return;
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelection();
  } else if (event.key === "Escape") {
    selected = null;
    connectingFrom = null;
    render();
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    if (event.shiftKey) redo(); else undo();
  }
});

function installFrameHeightReporter() {
  if (window.parent === window) return;
  let scheduled = false;
  function report() {
    scheduled = false;
    const main = document.querySelector("main");
    const contentBottom = main ? main.getBoundingClientRect().bottom : 0;
    const height = Math.max(contentBottom, document.body.getBoundingClientRect().height);
    const frameHeight = Math.ceil(height);
    try {
      if (window.frameElement) {
        window.frameElement.style.height = `${frameHeight}px`;
        window.frameElement.setAttribute("scrolling", "no");
        window.frameElement.style.overflow = "hidden";
      }
    } catch (_error) {
      // Cross-origin embedding falls back to postMessage.
    }
    window.parent.postMessage({type: "physics-atlas:frame-height", height: frameHeight}, "*");
  }
  function scheduleReport() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(report);
  }
  window.addEventListener("load", scheduleReport);
  window.addEventListener("resize", scheduleReport);
  window.addEventListener("message", event => {
    const expectedOrigin = window.location.origin === "null" || event.origin === window.location.origin;
    if (expectedOrigin && event.data?.type === "physics-atlas:request-frame-height") {
      scheduleReport();
    }
  });
  if ("ResizeObserver" in window) new ResizeObserver(scheduleReport).observe(document.body);
  document.fonts?.ready.then(scheduleReport);
  scheduleReport();
}

localizeStaticContent();
render();
installFrameHeightReporter();
