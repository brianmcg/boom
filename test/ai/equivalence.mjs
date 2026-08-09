// Behavioural-equivalence harness for core/ai: runs the pre-migration JS and
// the live module over identical randomised grids and compares not just the
// path each returns but the whole graph state left behind.
//
// Comparing the graph state and not only the path is the point. A* can reach
// the same path through a different exploration order, so a heap bug that
// reorders the frontier is invisible in the result on most grids and shows up
// as a slightly worse path on a few. Comparing `f`/`g`/`h`/`visited`/`closed`
// and every parent pointer catches it on the first grid instead.
import * as OLD from '@baseline';
import * as NEW from '@live';
import OldHeap from '@baseline-heap';
import NewHeap from '@live-heap';

const mulberry32 = a => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// The values engine actually puts in a grid — see NODE_WEIGHTS in
// engine/utils/createGraphs.js. 0 is a wall; the rest are traversable at
// increasing cost, so paths prefer open floor and route around bodies.
const WEIGHTS = { WALL: 0, FREE: 1, DYNAMIC_BODY: 20, STATIC_BODY: 100 };

// Weighted so most cells are floor: a grid of mostly walls produces trivial
// searches that exercise nothing.
const randomWeight = rnd => {
  const r = rnd();
  if (r < 0.28) return WEIGHTS.WALL;
  if (r < 0.86) return WEIGHTS.FREE;
  if (r < 0.95) return WEIGHTS.DYNAMIC_BODY;
  return WEIGHTS.STATIC_BODY;
};

const makeGrid = (size, rnd) =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => randomWeight(rnd))
  );

const nonWall = (grid, rnd) => {
  for (let tries = 0; tries < 500; tries++) {
    const x = Math.floor(rnd() * grid.length);
    const y = Math.floor(rnd() * grid.length);
    if (grid[x][y] !== WEIGHTS.WALL) return { x, y };
  }
  return null;
};

// Every field cleanNode touches, plus the identity of the parent pointer.
// Read explicitly rather than via Object.keys so that declaring these as real
// class fields — which changes property order but not values — is not itself
// reported as a divergence.
const nodeState = n =>
  [
    n.x,
    n.y,
    n.weight,
    n.f,
    n.g,
    n.h,
    n.visited ? 1 : 0,
    n.closed ? 1 : 0,
    n.parent ? `${n.parent.x},${n.parent.y}` : '-',
  ].join(':');

const graphState = graph =>
  graph.grid.map(col => col.map(nodeState).join('|')).join('\n');

const pathState = path => path.map(n => `${n.x},${n.y}`).join('>');

// Mirrors engine World.findPath: set the heuristic mode, stamp DYNAMIC_BODY
// weights over the cells holding moving bodies, search, then put the original
// weights back. Reproducing the mutate/restore is deliberate — `diagonal` and
// `weight` are written from outside on every single search, so anything that
// made them readonly would be wrong, and this is what proves it.
const runSearch = (M, grid, start, end, diagonal, occupied) => {
  const graph = new M.Graph(grid, { diagonal: false });
  graph.diagonal = diagonal;

  const initialWeights = [];
  for (const { x, y } of occupied) {
    const node = graph.grid[x][y];
    initialWeights.push({ x, y, weight: node.weight });
    node.weight = WEIGHTS.DYNAMIC_BODY;
  }

  const path = M.search(
    graph,
    graph.grid[start.x][start.y],
    graph.grid[end.x][end.y]
  );

  for (const { x, y, weight } of initialWeights)
    graph.grid[x][y].weight = weight;

  return {
    path: pathState(path),
    state: graphState(graph),
    length: path.length,
  };
};

let checked = 0;
let compared = 0;
const failures = [];

const rnd = mulberry32(0x51ed270b);

for (let trial = 0; trial < 400 && failures.length < 5; trial++) {
  const size = 8 + Math.floor(rnd() * 17); // 8..24
  const grid = makeGrid(size, rnd);
  const diagonal = rnd() < 0.5;

  const start = nonWall(grid, rnd);
  const end = nonWall(grid, rnd);
  if (!start || !end) continue;

  const occupied = [];
  const bodies = Math.floor(rnd() * 6);
  for (let i = 0; i < bodies; i++) {
    const c = nonWall(grid, rnd);
    if (c) occupied.push(c);
  }

  const a = runSearch(OLD, grid, start, end, diagonal, occupied);
  const b = runSearch(NEW, grid, start, end, diagonal, occupied);

  checked++;
  compared += a.state.length + a.path.length;

  if (a.path !== b.path) {
    failures.push(
      `grid ${size}x${size} diagonal=${diagonal} ${start.x},${start.y} -> ${end.x},${end.y}\n` +
        `      old path (${a.length}): ${a.path.slice(0, 120)}\n` +
        `      new path (${b.length}): ${b.path.slice(0, 120)}`
    );
  } else if (a.state !== b.state) {
    const i = [...a.state].findIndex((c, k) => c !== b.state[k]);
    failures.push(
      `grid ${size}x${size} diagonal=${diagonal}: same path, divergent graph state at char ${i}\n` +
        `      old: ...${a.state.slice(Math.max(0, i - 40), i + 40)}\n` +
        `      new: ...${b.state.slice(Math.max(0, i - 40), i + 40)}`
    );
  }
}

// The heap is exercised through search above, but only in the orders a grid
// happens to produce. Drive it directly too: it is hand-rolled, and the index
// arithmetic in sinkDown/bubbleUp is the easiest thing here to break by a
// single character.
let heapOps = 0;
const heapRnd = mulberry32(0x2f9a13c4);

for (let trial = 0; trial < 300 && failures.length < 5; trial++) {
  const score = e => e.f;
  const oldHeap = new OldHeap(score);
  const newHeap = new NewHeap(score);

  const n = 1 + Math.floor(heapRnd() * 60);
  const items = Array.from({ length: n }, (_, i) => ({
    id: i,
    f: Math.floor(heapRnd() * 100),
  }));

  for (const item of items) {
    oldHeap.push({ ...item });
    newHeap.push({ ...item });
    heapOps++;
  }

  // Rescore a few, the way astarSearch does when it finds a cheaper route.
  for (let i = 0; i < Math.min(5, n); i++) {
    const k = Math.floor(heapRnd() * oldHeap.content.length);
    const lower = Math.floor(heapRnd() * 100);
    oldHeap.content[k].f = lower;
    newHeap.content[k].f = lower;
    oldHeap.rescoreElement(oldHeap.content[k]);
    newHeap.rescoreElement(newHeap.content[k]);
    heapOps++;
  }

  const drain = h => {
    const out = [];
    while (h.size() > 0) out.push(h.pop().f);
    return out.join(',');
  };

  const a = drain(oldHeap);
  const b = drain(newHeap);

  if (a !== b) {
    failures.push(
      `heap drain order diverged (n=${n})\n      old: ${a}\n      new: ${b}`
    );
  }
}

console.log(`  searches compared: ${checked}`);
console.log(`  heap operations:   ${heapOps}`);
console.log(`  chars compared:    ${compared.toLocaleString()}`);

if (failures.length) {
  console.log(`\n  DIVERGED (${failures.length} shown):\n`);
  for (const f of failures) console.log(`    ${f}\n`);
  process.exit(1);
}

console.log('\n  IDENTICAL');
