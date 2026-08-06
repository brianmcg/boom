// The engine's cell subclasses configure the contract that the raycaster in
// core/physics reads: transparency, isDoor, isPushWall, double, reverse,
// closed, edge. Those fields are readonly on the core Cell, so subclasses can
// only set them by passing options through super() — and nothing else in the
// suite covers that, because the other two build core Cells directly.
//
// This suite asserts forward, against what the map data means, rather than
// against the pre-migration baseline.
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

console.log(failed ? '\nRESULT: FAILURES' : '\nRESULT: ALL PASS');
process.exit(failed ? 1 : 0);
