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
import { DynamicBody } from '@game/core/physics';
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

// --- DynamicBody.velocity is clamped on write ------------------------------
// It used to be clamped at the point of use, so the stored value and the value
// that actually moved the body were different numbers.
const VELOCITY_LIMIT = 16; // CELL_SIZE / 2

body.velocity = 4;
eq('velocity under the limit is untouched', body.velocity, 4);

body.velocity = 999;
eq('velocity over the limit is clamped', body.velocity, VELOCITY_LIMIT);

body.velocity = -3;
eq('negative velocity is left alone (bodies reverse)', body.velocity, -3);

console.log(failed ? '\nRESULT: FAILURES' : '\nRESULT: ALL PASS');
process.exit(failed ? 1 : 0);
