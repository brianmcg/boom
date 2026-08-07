// Behavioural-equivalence harness: builds the same world twice, once from the
// pre-migration JS physics module and once from the migrated TS one, then
// compares every field of every ray and every step of a dynamic-body sim.
import * as OLD from '@baseline';
import * as NEW from '@game/core/physics';

const CELL_SIZE = 32;
const SIZE = 24;

// The baseline's World takes (grid, bodies); the live one takes an options
// object. This is a signature change, not a behavioural one — everything the
// harness compares is downstream of construction.
const makeWorld = (M, grid, bodies) =>
  M === OLD ? new M.World(grid, bodies) : new M.World({ grid, bodies });

// isDoor/isPushWall were renamed to retracts/displaces: they name what `offset`
// does to the geometry (surface retracts leaving a gap / surface translates
// whole) rather than the game object built from it. The baseline still has the
// old names, so set and read them under whichever name the module uses.
const RENAMED = { isDoor: 'retracts', isPushWall: 'displaces' };

const setRetracts = (M, cell) => {
  if (M === OLD) cell.isDoor = true;
  else cell.retracts = true;
};

const setDisplaces = (M, cell) => {
  if (M === OLD) cell.isPushWall = true;
  else cell.displaces = true;
};

const retracts = cell => cell.retracts ?? cell.isDoor;
const displaces = cell => cell.displaces ?? cell.isPushWall;

const mulberry32 = a => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const side = (gx, gy, face) => ({
  name: `s_${gx}_${gy}_${face}`,
  height: CELL_SIZE,
  spatter: 0,
});

const addSides = (cell, gx, gy) => {
  cell.front = side(gx, gy, 'front');
  cell.left = side(gx, gy, 'left');
  cell.back = side(gx, gy, 'back');
  cell.right = side(gx, gy, 'right');
};

// Mirrors what the engine's Cell/Door/PushWall/TransparentCell subclasses do:
// construct a core cell, then assign the game-layer properties on top.
const makeCell = (M, gx, gy, rnd) => {
  const { Cell, DynamicCell, AXES } = M;
  const isEdge = gx === 0 || gy === 0 || gx === SIZE - 1 || gy === SIZE - 1;

  const base = {
    x: gx * CELL_SIZE + CELL_SIZE / 2,
    y: gy * CELL_SIZE + CELL_SIZE / 2,
    width: CELL_SIZE,
    length: CELL_SIZE,
    height: CELL_SIZE,
  };

  if (isEdge) {
    const cell = new Cell({ ...base, blocking: true });
    addSides(cell, gx, gy);
    cell.edge = true;
    return cell;
  }

  const kind = Math.floor(rnd() * 12);
  const axis = rnd() < 0.5 ? AXES.X : AXES.Y;

  switch (kind) {
    case 5: {
      // Plain solid wall: the game layer sets no flags at all, so this is the
      // cell whose defaults changed from undefined to false/0.
      const cell = new Cell({ ...base, blocking: true });
      addSides(cell, gx, gy);
      return cell;
    }
    case 6:
    case 9: {
      // Door, parked part-way open.
      const cell = new DynamicCell({
        ...base,
        blocking: true,
        speed: 0.2,
        axis,
      });
      addSides(cell, gx, gy);
      setRetracts(M, cell);
      cell.double = kind === 9;
      cell.reverse = rnd() < 0.5;
      const open = rnd() * CELL_SIZE;
      if (axis === AXES.X) cell.offset.y = open;
      else cell.offset.x = open;
      if (rnd() < 0.5) cell.overlay = side(gx, gy, 'overlay');
      return cell;
    }
    case 7: {
      // Push wall, mid-slide.
      const cell = new Cell({ ...base, blocking: true, axis });
      addSides(cell, gx, gy);
      setDisplaces(M, cell);
      const open = rnd() * CELL_SIZE;
      if (axis === AXES.X) cell.offset.y = open || 1;
      else cell.offset.x = open || 1;
      return cell;
    }
    case 8: {
      // Transparent cell (grate / window).
      const cell = new Cell({ ...base, blocking: true, axis });
      addSides(cell, gx, gy);
      cell.transparency = rnd() < 0.5 ? 1 : 2;
      cell.reverse = rnd() < 0.5;
      if (rnd() < 0.5) cell.offset.y = rnd() * CELL_SIZE;
      if (rnd() < 0.5) cell.offset.x = rnd() * CELL_SIZE;
      return cell;
    }
    default: {
      const cell = new Cell({ ...base, blocking: false });
      addSides(cell, gx, gy);
      cell.closed = rnd() < 0.3;
      return cell;
    }
  }
};

const buildWorld = M => {
  const { Body, DynamicBody } = M;
  const rnd = mulberry32(0xc0ffee);

  const grid = [];
  for (let gx = 0; gx < SIZE; gx++) {
    const col = [];
    for (let gy = 0; gy < SIZE; gy++) col.push(makeCell(M, gx, gy, rnd));
    grid.push(col);
  }

  const open = [];
  for (let gx = 1; gx < SIZE - 1; gx++)
    for (let gy = 1; gy < SIZE - 1; gy++)
      if (!grid[gx][gy].blocking) open.push([gx, gy]);

  const bodies = [];
  const dynamic = [];

  for (let i = 0; i < 60; i++) {
    const [gx, gy] = open[Math.floor(rnd() * open.length)];
    bodies.push(
      new Body({
        x: gx * CELL_SIZE + CELL_SIZE / 2,
        y: gy * CELL_SIZE + CELL_SIZE / 2,
        width: 12,
        length: 12,
        height: 20,
        blocking: true,
      })
    );
  }

  for (let i = 0; i < 20; i++) {
    const [gx, gy] = open[Math.floor(rnd() * open.length)];
    const d = new DynamicBody({
      x: gx * CELL_SIZE + CELL_SIZE / 2,
      y: gy * CELL_SIZE + CELL_SIZE / 2,
      width: 14,
      length: 14,
      height: 24,
      blocking: true,
      angle: rnd() * Math.PI * 2,
    });
    d.velocity = 0.5 + rnd() * 2;
    dynamic.push(d);
    bodies.push(d);
  }

  return { world: makeWorld(M, grid, bodies), open, dynamic };
};

// --- serialisation -------------------------------------------------------

const sideKey = s => {
  if (s === undefined) return 'undefined';
  if (s === null) return 'null';
  if (s === false) return 'false';
  if (s === true) return 'true';
  return `side:${s.name}`;
};

const serRay = ray => ({
  // isHorizontal is now always present as a boolean; it used to be omitted
  // entirely on the vertical branch. Compare truthiness, and drop it from the
  // key set so the rest of the shape is still compared exactly.
  keys: Object.keys(ray)
    .filter(k => k !== 'isHorizontal')
    .sort()
    .join(','),
  isHorizontal: Boolean(ray.isHorizontal),
  sp: [ray.startPoint.x, ray.startPoint.y],
  ep: [ray.endPoint.x, ray.endPoint.y],
  distance: ray.distance,
  angle: ray.angle,
  side: sideKey(ray.side),
  // isOverlay deliberately changed from `Side | false | undefined` to a plain
  // boolean, so compare truthiness. Every consumer only ever used it that way;
  // the overlay object itself is read from cell.overlay.
  isOverlay: Boolean(ray.isOverlay),
  cell: ray.cell ? ray.cell.id : 'null',
  bodies: Object.keys(ray.encounteredBodies).sort().join(','),
});

// isOverlay must now be a real boolean on every ray, and it must still be TRUE
// exactly when the hit cell carries an overlay that wasn't ignored.
const auditIsOverlay = M => {
  const { world, open } = buildWorld(M);
  let count = 0;
  const badType = [];
  const badValue = [];

  for (let i = 0; i < open.length; i += 5) {
    const [gx, gy] = open[i];
    const x = gx * CELL_SIZE + CELL_SIZE / 2;
    const y = gy * CELL_SIZE + CELL_SIZE / 2;
    for (let a = 0; a < 360; a += 3) {
      for (const ignoreOverlay of [true, false]) {
        for (const ray of M.castRay({
          x,
          y,
          angle: M.degrees(a),
          world,
          ignoreOverlay,
        })) {
          count++;
          if (typeof ray.isOverlay !== 'boolean')
            badType.push(typeof ray.isOverlay);
          // The contract change: isHorizontal is now an own property on every
          // ray, not just the ones hit on a horizontal grid line. That its
          // truthiness still matches the old module is proved by the exact
          // castRay comparison above, over every ray in the fixture.
          if (typeof ray.isHorizontal !== 'boolean')
            badType.push(typeof ray.isHorizontal);
          if (!Object.prototype.hasOwnProperty.call(ray, 'isHorizontal'))
            badValue.push('isHorizontal-absent');
          const expected = !ignoreOverlay && !!ray.cell.overlay;
          if (expected && !ray.isOverlay) badValue.push('isOverlay-missed');
        }
      }
    }
  }
  return { count, badType: badType.length, badValue: badValue.length };
};

const OPTION_SETS = [
  {},
  { ignoreOverlay: false },
  { checkInitialCell: true, ignoreOverlay: false, radius: 4 },
  { checkInitialCell: true, elavation: 16, radius: 2 },
];

const runRays = M => {
  const { world, open } = buildWorld(M);
  const { castRay, degrees } = M;
  const out = [];

  const spots = [];
  for (let i = 0; i < open.length; i += 7) spots.push(open[i]);

  for (const [gx, gy] of spots) {
    const x = gx * CELL_SIZE + CELL_SIZE / 2;
    const y = gy * CELL_SIZE + CELL_SIZE / 2;

    for (let a = 0; a < 72; a++) {
      const angle = degrees(a * 5);
      for (const opts of OPTION_SETS) {
        const rays = castRay({ x, y, angle, world, ...opts });
        out.push(rays.map(serRay));
      }
    }
  }

  return out;
};

const runSim = M => {
  const { world, dynamic } = buildWorld(M);
  const trace = [];

  for (let step = 0; step < 400; step++) {
    world.update(1, 16);
    if (step % 20 === 0) {
      trace.push(
        dynamic.map(d => [
          d.x,
          d.y,
          d.angle,
          d.cell ? d.cell.id : 'null',
          d.gridX,
          d.gridY,
        ])
      );
    }
    // Deliberately NOT normalised, so the turn drifts past 2π. Neither module
    // normalises on assignment, so both take the same wrong quadrant branch on
    // a drifted angle and still agree — which is what makes this a faithful
    // comparison. The invariant is the caller's, and `engine/` keeps it; see
    // the note on DynamicBody.angle.
    if (step % 37 === 0) {
      dynamic.forEach(d => (d.angle += 0.31));
    }
  }

  return trace;
};

// --- compare -------------------------------------------------------------

const a = JSON.stringify(runRays(OLD));
const b = JSON.stringify(runRays(NEW));

const simA = JSON.stringify(runSim(OLD));
const simB = JSON.stringify(runSim(NEW));

const degA = [...Array(361).keys()].map(i => OLD.degrees(i)).join(',');
const degB = [...Array(361).keys()].map(i => NEW.degrees(i)).join(',');

let failed = false;

// Both modules are bundled into one file, so esbuild renames the second copy of
// each class (Cell -> Cell2). Body ids are built from constructor.name, so undo
// that purely-lexical suffix before comparing.
const norm = s =>
  String(s).replace(/\b(DynamicBody|DynamicCell|Body|Cell)2_/g, '$1_');

const check = (name, xRaw, yRaw) => {
  const x = norm(xRaw);
  const y = norm(yRaw);
  if (x === y) {
    console.log(`PASS  ${name}  (${x.length} chars compared)`);
    return;
  }
  failed = true;
  console.log(`FAIL  ${name}`);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] !== y[i]) {
      console.log(`  first divergence at char ${i}`);
      console.log(`  old: ...${x.slice(Math.max(0, i - 120), i + 200)}`);
      console.log(`  new: ...${y.slice(Math.max(0, i - 120), i + 200)}`);
      break;
    }
  }
};

check('castRay output', a, b);
check('dynamic body sim', simA, simB);
check('degrees table', degA, degB);

// Constants must keep their exact runtime shape.
check(
  'AXES/TRANSPARENCY',
  JSON.stringify([OLD.AXES, OLD.TRANSPARENCY]),
  JSON.stringify([NEW.AXES, NEW.TRANSPARENCY])
);

// Own-key delta: hoisting the cell contract onto core Cell may only ADD keys,
// and every added key must hold a falsy value on a cell the game layer left alone.
const sample = M => {
  const { world } = buildWorld(M);
  const seen = {};
  for (const col of world.grid)
    for (const cell of col) {
      const kind = retracts(cell)
        ? 'door'
        : displaces(cell)
          ? 'pushWall'
          : cell.transparency
            ? 'transparent'
            : cell.blocking
              ? 'wall'
              : 'floor';
      seen[kind] ||= cell;
    }
  return seen;
};

const oldCells = sample(OLD);
const newCells = sample(NEW);

for (const kind of Object.keys(oldCells)) {
  // Map the baseline's key names through the rename before diffing, so the
  // deliberate isDoor -> retracts / isPushWall -> displaces rename does not read
  // as a lost key plus a truthy added one. Everything else still diffs by name.
  const o = Object.keys(oldCells[kind]).map(k => RENAMED[k] ?? k);
  const n = Object.keys(newCells[kind]);
  const lost = o.filter(k => !n.includes(k));
  const added = n.filter(k => !o.includes(k));
  const changed = Object.keys(oldCells[kind]).filter(
    k =>
      norm(JSON.stringify(oldCells[kind][k])) !==
      norm(JSON.stringify(newCells[kind][RENAMED[k] ?? k]))
  );
  const truthyAdded = added.filter(k => newCells[kind][k]);

  if (lost.length || truthyAdded.length || changed.length) {
    failed = true;
    console.log(
      `FAIL  cell shape (${kind})  lost=[${lost}] truthyAdded=[${truthyAdded}] changed=[${changed}]`
    );
  } else {
    console.log(`PASS  cell shape (${kind})  added falsy keys: [${added}]`);
  }
}

const audit = auditIsOverlay(NEW);
if (audit.badType === 0 && audit.badValue === 0) {
  console.log(
    `PASS  isOverlay + isHorizontal are own boolean properties on all ${audit.count} rays; isOverlay set whenever the hit cell has a live overlay`
  );
} else {
  failed = true;
  console.log(
    `FAIL  isOverlay audit: ${audit.badType} non-boolean, ${audit.badValue} missed overlays of ${audit.count}`
  );
}

console.log(failed ? '\nRESULT: DIVERGENCE' : '\nRESULT: IDENTICAL');
process.exit(failed ? 1 : 0);
