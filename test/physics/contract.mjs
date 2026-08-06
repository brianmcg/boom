// The invariants core/physics enforces, asserted forward against what they
// are supposed to mean rather than against the pre-migration baseline.
//
// Two things live here. The cell section covers the contract the raycaster
// reads off a cell — transparency, isDoor, isPushWall, double, reverse,
// closed, edge — which is readonly on the core Cell, so subclasses can only
// set it by passing options through super(); neither other suite builds an
// engine cell, so nothing else covers that plumbing. The body section covers
// guarantees the baseline did not make at all, which is exactly why the
// equivalence suite cannot be the thing that checks them.
import { DynamicBody, Point, Shape, World } from '@game/core/physics';
import Cell from '@engine/Cell.js';
import TransparentCell from '@engine/TransparentCell.js';
import Door from '@engine/Door.js';
import PushWall from '@engine/PushWall.js';

const CELL = 32;
const TRANSPARENCY = { NONE: 0, PARTIAL: 1, FULL: 2 };

let failed = false;
const ok = (name, cond, detail) => {
  console.log(
    `${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`
  );
  if (!cond) failed = true;
};

const eq = (name, actual, expected) =>
  ok(name, actual === expected, `expected ${expected}, got ${actual}`);

// Shaped like scenes/WorldScene/utils/WorldBodies.js createCell().
const base = {
  x: CELL * 3 + CELL / 2,
  y: CELL * 4 + CELL / 2,
  width: CELL,
  length: CELL,
  height: CELL,
  blocking: true,
  sides: { front: { name: 'f', height: CELL, spatter: 0 } },
};

const soundSprite = {
  play: () => 1,
  loop: () => {},
  volume: () => {},
  once: () => {},
};
const sounds = { open: 'open', close: 'close' };

// --- plain wall -----------------------------------------------------------
const wall = new Cell({ ...base, closed: true, edge: true, reverse: true });
eq('wall.closed', wall.closed, true);
eq('wall.edge', wall.edge, true);
eq('wall.reverse', wall.reverse, true);
eq('wall.isDoor', wall.isDoor, false);
eq('wall.isPushWall', wall.isPushWall, false);
eq('wall.transparency', wall.transparency, TRANSPARENCY.NONE);

// A map that omits these must yield false, not undefined — every read is a
// truthiness test, but the own-property shape should still be honest.
const bare = new Cell({ ...base });
eq('omitted closed defaults to false', bare.closed, false);
eq('omitted edge defaults to false', bare.edge, false);
eq('omitted reverse defaults to false', bare.reverse, false);

// --- transparent ----------------------------------------------------------
const glass = new TransparentCell({
  ...base,
  transparency: TRANSPARENCY.PARTIAL,
  reverse: true,
});
eq('transparent.transparency', glass.transparency, TRANSPARENCY.PARTIAL);
eq('transparent.reverse', glass.reverse, true);
eq('transparent.isDoor', glass.isDoor, false);
ok('TransparentCell still carries its sides', glass.front?.name === 'f');

// --- door -----------------------------------------------------------------
const door = new Door({
  ...base,
  axis: 'x',
  offset: 0.5,
  double: true,
  reverse: true,
  interval: 500,
  soundSprite,
  sounds,
});
eq('door.isDoor', door.isDoor, true);
eq('door.double', door.double, true);
eq('door.reverse', door.reverse, true);
eq('door.isPushWall', door.isPushWall, false);
ok('door kept its own options', door.interval === 500);

const singleDoor = new Door({ ...base, interval: 500, soundSprite, sounds });
eq('omitted double defaults to false', singleDoor.double, false);
eq('single door is still a door', singleDoor.isDoor, true);

// --- push wall ------------------------------------------------------------
const push = new PushWall({
  ...base,
  axis: 'y',
  offset: 0.1,
  soundSprite,
  sounds,
});
eq('pushWall.isPushWall', push.isPushWall, true);
eq('pushWall.isDoor', push.isDoor, false);

// --- readonly is real -----------------------------------------------------
// TypeScript erases `readonly`, so this documents that the guarantee is a
// compile-time one: at runtime the field is still writable. If that ever
// changes to an accessor without a setter, this flips and the suite says so.
const before = wall.closed;
try {
  wall.closed = !before;
} catch {
  /* a getter-only accessor would throw in strict mode */
}
ok(
  'readonly is compile-time only (runtime write still lands)',
  wall.closed !== before,
  `closed went ${before} -> ${wall.closed}`
);

// --- an opened door still produces a real Shape ---------------------------
// Door.get shape() overrides Body's with its own geometry while the door is
// open, and Door.js is unchecked JavaScript -- so nothing but this notices if
// it goes back to returning an object literal. It would still have x/y/width/
// length, and would still pass every type check, but `shape.corners()` in the
// raycaster would throw at render time.
const openDoor = new Door({
  ...base,
  axis: 'y',
  offset: 1,
  interval: 500,
  soundSprite,
  sounds,
});

openDoor.offset.x = CELL; // fully open, which is what selects the override
openDoor.offset.y = CELL;

ok('an open door has a Shape, not a literal', openDoor.shape instanceof Shape);
ok(
  'and that shape can find its corners',
  typeof openDoor.shape.corners === 'function' &&
    openDoor.shape.corners().topLeft.x === openDoor.shape.x
);
ok('a closed door falls back to Body.shape', door.shape instanceof Shape);

// --- DynamicBody.angle is always in [0, 2pi) ------------------------------
// The raycaster picks its quadrant branch by comparing the angle against
// DEG_90/DEG_180/DEG_270. The baseline let a body's angle drift past 2pi --
// `d.angle += 0.31` forever -- and then stepped the ray the wrong way, because
// 6.3879 fails `angle < PI` while the geometrically identical 0.1047 passes.
const TAU = Math.PI * 2;
const body = new DynamicBody({ x: 100, y: 100, angle: 0.5 });

eq('angle survives an in-range write exactly', body.angle, 0.5);

body.angle = 0.5 + TAU;
ok(
  'an angle a full turn over wraps back',
  Math.abs(body.angle - 0.5) < 1e-12,
  `got ${body.angle}`
);

body.angle = -0.25;
ok(
  'a negative angle wraps up into range',
  Math.abs(body.angle - (TAU - 0.25)) < 1e-12,
  `got ${body.angle}`
);

// The drift the baseline got wrong, reproduced directly.
body.angle = 0.5;
for (let i = 0; i < 40; i++) body.angle = body.angle + 0.31;
ok(
  'repeated turns never leave the range',
  body.angle >= 0 && body.angle < TAU,
  `after 40 turns of 0.31: ${body.angle}`
);

// Normalising must not perturb an angle that is already in range: the obvious
// ((v % TAU) + TAU) % TAU form loses a few bits on every write, which showed
// up as drift across the whole dynamic-body sim.
let exact = true;
for (let i = 0; i < 2000; i++) {
  const v = (i / 2000) * TAU;
  body.angle = v;
  if (body.angle !== v) exact = false;
}
ok('an in-range angle is stored bit-for-bit', exact);

// --- Body's line-intersection API, as HitScan calls it --------------------
// HitScan.js:52 does `body.getLineIntersection({ startPoint, endPoint })` and
// is unchecked JavaScript, so a rename that misses it type-checks, lints and
// builds clean, then throws the first time a hitscan weapon is fired. This is
// the only thing that would notice.
const blocker = new Cell({
  x: CELL * 4 + CELL / 2,
  y: CELL * 4 + CELL / 2,
  width: CELL,
  length: CELL,
  height: CELL,
  blocking: true,
  sides: {},
});

const throughIt = {
  startPoint: new Point(CELL * 2, CELL * 4 + CELL / 2),
  endPoint: new Point(CELL * 6, CELL * 4 + CELL / 2),
};

const pastIt = {
  startPoint: new Point(CELL * 2, CELL * 9),
  endPoint: new Point(CELL * 6, CELL * 9),
};

ok(
  'Body.intersectsLine exists and finds a crossing',
  blocker.intersectsLine(throughIt) === true
);
ok('and reports a miss as false', blocker.intersectsLine(pastIt) === false);

const hit = blocker.getLineIntersection(throughIt);

ok('Body.getLineIntersection exists and returns a hit', hit !== null);
ok(
  'the hit carries a position and a distance',
  typeof hit.x === 'number' &&
    typeof hit.y === 'number' &&
    typeof hit.distance === 'number'
);
eq('and it is the near edge, not the far one', hit.x, CELL * 4);
eq('a miss returns null', blocker.getLineIntersection(pastIt), null);

// --- isFacing reads facingAngle, so a subclass can redirect it ------------
// Player faces where its camera points rather than where its body moves, and
// used to say so by copying the whole of isFacing with viewAngle substituted.
// It now overrides facingAngle alone, so this is the seam that makes that work.
const looker = new DynamicBody({ x: 100, y: 100, angle: 0 });
const ahead = { x: 200, y: 100 };
const behind = { x: 0, y: 100 };

eq('facingAngle defaults to the body angle', looker.facingAngle, looker.angle);
ok('a body faces what is in front of it', looker.isFacing(ahead));
ok('and not what is behind it', !looker.isFacing(behind));

looker.angle = Math.PI; // turn around
ok('turning the body turns what it faces', looker.isFacing(behind));

// What Player does: keep the body angle, redirect only the facing.
class Viewer extends DynamicBody {
  get facingAngle() {
    return 0; // "camera" still pointing along +x
  }
}

const viewer = new Viewer({ x: 100, y: 100, angle: Math.PI });
eq('the override wins over the body angle', viewer.facingAngle, 0);
ok('and isFacing follows the override, not the body', viewer.isFacing(ahead));
ok('so the body angle no longer decides', !viewer.isFacing(behind));

// --- DynamicBody.velocity is clamped where it is used ---------------------
// Deliberately not clamped on write: `velocity` is a plain field, and the limit
// applies to how far a body may travel in one update, not to what a caller may
// ask for. Asserted through update() rather than through the field, since the
// field is not where the guarantee lives.
const VELOCITY_LIMIT = 16; // CELL_SIZE / 2

body.velocity = 999;
eq('velocity stores whatever it is given', body.velocity, 999);

// --- setPos keeps the world's cell index in sync --------------------------
// The world finds bodies through the cell they stand on. setPos used to move a
// body without touching that index, so the body stayed findable at its old
// position and invisible at its new one. It was only safe because its one
// caller happened to add() the body to the world straight afterwards.
const makeGrid = () => {
  const grid = [];
  for (let gx = 0; gx < 4; gx++) {
    const col = [];
    for (let gy = 0; gy < 4; gy++) {
      col.push(
        new Cell({
          x: gx * CELL + CELL / 2,
          y: gy * CELL + CELL / 2,
          width: CELL,
          length: CELL,
          height: CELL,
          blocking: false,
          sides: {},
        })
      );
    }
    grid.push(col);
  }
  return grid;
};

const grid = makeGrid();
const world = new World({ grid, bodies: [] });
const mover = new DynamicBody({ x: CELL / 2, y: CELL / 2, autoPlay: false });
world.add(mover);

const from = grid[0][0];
const to = grid[2][3];

ok('body starts registered on its own cell', from.bodies.includes(mover));

mover.setPos({ x: 2 * CELL + CELL / 2, y: 3 * CELL + CELL / 2 });

ok('setPos registers the body on its new cell', to.bodies.includes(mover));
ok('setPos unregisters it from the old one', !from.bodies.includes(mover));
ok('setPos refreshes the cached cell', mover.cell === to);

// The velocity limit, asserted where it actually applies: a body given an
// absurd velocity may still only travel VELOCITY_LIMIT in one update.
const sprinter = new DynamicBody({
  x: CELL / 2,
  y: 2 * CELL + CELL / 2,
  angle: 0,
  width: 8,
  length: 8,
});
world.add(sprinter);
sprinter.velocity = 9999;

const startX = sprinter.x;
world.update(1, 16);

ok(
  'an absurd velocity still moves the body at most the limit',
  sprinter.x - startX <= VELOCITY_LIMIT,
  `moved ${(sprinter.x - startX).toFixed(2)} of a possible 9999`
);

// Moving within one cell must not churn the index.
const occupants = to.bodies.length;
mover.setPos({ x: 2 * CELL + 1, y: 3 * CELL + 1 });
ok(
  'a move inside one cell leaves the index alone',
  to.bodies.length === occupants
);
ok('and the body is still registered once', to.bodies.includes(mover));

// --- destroy() unsubscribes, and that is the point of it ------------------
// Nulling plain fields never helped the GC — JavaScript collects by
// reachability, so the whole subgraph goes when its owner is dropped. What
// destroy() is actually for is releasing what the GC cannot see: Pixi/Howler
// handles, and listener closures, which capture whatever subscribed.
//
// Cell.destroy() used not to call super.destroy(), so cells kept every
// listener and kept pointing at their World. Nothing else exercises teardown.
const doomed = new World({ grid: makeGrid(), bodies: [] });
const cell = doomed.grid[1][1];
const occupant = new DynamicBody({
  x: CELL + CELL / 2,
  y: CELL + CELL / 2,
  autoPlay: false,
});
doomed.add(occupant);

let cellEvents = 0;
let worldEvents = 0;
cell.on('test', () => (cellEvents += 1));
doomed.on('test', () => (worldEvents += 1));

cell.emit('test');
doomed.emit('test');
ok('listeners fire before teardown', cellEvents === 1 && worldEvents === 1);

doomed.destroy();

cell.emit('test');
doomed.emit('test');
eq('cell listeners are gone after destroy', cellEvents, 1);
eq('world listeners are gone after destroy', worldEvents, 1);

ok('cell drops its back-reference to the world', cell.parent === null);
ok('cell releases the bodies standing on it', cell.bodies.length === 0);

// Bodies are not the core World's to destroy — the engine World destroys the
// player, items, enemies and objects itself. Destroying one directly is what
// exercises Body/DynamicBody.destroy.
let bodyEvents = 0;
occupant.on('test', () => (bodyEvents += 1));
occupant.emit('test');
occupant.destroy();
occupant.emit('test');

eq('body listeners are gone after destroy', bodyEvents, 1);
ok('a destroyed body drops its cell', occupant.cell === null);
ok('a destroyed body drops its parent', occupant.parent === null);
ok(
  'but keeps previousPos, which dies with it',
  occupant.previousPos && typeof occupant.previousPos.x === 'number'
);

// The inert fields are deliberately left alone now: they die with their owner,
// and leaving them be is what lets them be readonly.
ok('grid is left intact rather than emptied', doomed.grid.length === 4);
ok(
  'offset survives teardown',
  cell.offset && typeof cell.offset.x === 'number'
);

console.log(failed ? '\nRESULT: FAILURES' : '\nRESULT: ALL PASS');
process.exit(failed ? 1 : 0);
