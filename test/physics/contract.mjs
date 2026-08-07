// The invariants core/physics enforces, asserted forward against what they
// are supposed to mean rather than against the pre-migration baseline.
//
// Two things live here. The cell section covers the contract the raycaster
// reads off a cell — transparency, retracts, displaces, double, reverse,
// closed, edge, and the sides — which subclasses can only set by passing
// options through super(); every subclass that does so is unchecked
// JavaScript, so nothing else covers that plumbing. The body section covers
// guarantees the baseline did not make at all, which is exactly why the
// equivalence suite cannot be the thing that checks them.
import {
  Cell,
  DynamicBody,
  DynamicCell,
  Point,
  Shape,
  World,
} from '@game/core/physics';
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
eq('wall.retracts', wall.retracts, false);
eq('wall.displaces', wall.displaces, false);
eq('wall.transparency', wall.transparency, TRANSPARENCY.NONE);

// A map that omits these must yield false, not undefined — every read is a
// truthiness test, but the own-property shape should still be honest.
const bare = new Cell({ ...base });
eq('omitted closed defaults to false', bare.closed, false);
eq('omitted edge defaults to false', bare.edge, false);
eq('omitted reverse defaults to false', bare.reverse, false);

// The sides moved off the engine subclass and onto Cell itself. Every caller
// that supplies them is unchecked JavaScript, so a face that silently stopped
// arriving would render as a blank wall rather than fail anything.
ok('a plain cell carries the side it was given', wall.front?.name === 'f');
eq('a face the map omitted is undefined', wall.back, undefined);
eq(
  'sides omitted entirely leaves every face undefined',
  new Cell({ ...base, sides: undefined }).front,
  undefined
);

// --- transparent ----------------------------------------------------------
const glass = new TransparentCell({
  ...base,
  transparency: TRANSPARENCY.PARTIAL,
  reverse: true,
});
eq('transparent.transparency', glass.transparency, TRANSPARENCY.PARTIAL);
eq('transparent.reverse', glass.reverse, true);
eq('transparent.retracts', glass.retracts, false);
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
eq('door.retracts', door.retracts, true);
eq('door.double', door.double, true);
eq('door.reverse', door.reverse, true);
eq('door.displaces', door.displaces, false);
ok('door kept its own options', door.interval === 500);

const singleDoor = new Door({ ...base, interval: 500, soundSprite, sounds });
eq('omitted double defaults to false', singleDoor.double, false);
eq('single door is still a door', singleDoor.retracts, true);

// --- push wall ------------------------------------------------------------
const push = new PushWall({
  ...base,
  axis: 'y',
  offset: 0.1,
  soundSprite,
  sounds,
});
eq('pushWall.displaces', push.displaces, true);
eq('pushWall.retracts', push.retracts, false);

// --- DynamicCell slides by its velocity -----------------------------------
// Physics owns the movement; Door and PushWall own what reaching a limit
// means. `equivalence` cannot see any of this: the DynamicCells it builds are
// never registered for updates, so `world.update` never calls their `update`.
const slider = new DynamicCell({ ...base, axis: 'x', speed: 0.5 });

eq('a new cell is stationary on x', slider.velocity.x, 0);
eq('and on y', slider.velocity.y, 0);

slider.update(1);
eq('a zero velocity leaves the offset alone', slider.offset.y, 0);

slider.velocity.y = 4;
slider.update(1);
eq('the offset advances by velocity * delta', slider.offset.y, 4);

slider.update(0.5);
eq('and scales with delta', slider.offset.y, 6);

slider.velocity.y = -6;
slider.update(1);
eq('a negative velocity closes', slider.offset.y, 0);

slider.velocity.x = 3;
slider.velocity.y = 0;
slider.update(1);
ok(
  'the two axes move independently',
  slider.offset.x === 3 && slider.offset.y === 0,
  `x=${slider.offset.x}, y=${slider.offset.y}`
);

// Nothing here clamps: a door stopping at CELL_SIZE is Door's rule, not this
// class's, and physics must not quietly enforce it.
slider.velocity.x = CELL * 10;
slider.update(1);
ok(
  'physics does not clamp — overrun is the subclass’s to catch',
  slider.offset.x > CELL,
  `offset.x=${slider.offset.x}`
);

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

// --- DynamicBody.angle is a plain field ------------------------------------
// The raycaster needs the angle within [0, 2pi) -- it picks its quadrant by
// comparing against DEG_90/DEG_180/DEG_270, and 6.3879 fails `angle < PI`
// while the geometrically identical 0.1047 passes, so a drifted angle steps
// the ray toward -y instead of +y.
//
// That invariant is the CALLER's, not the field's. A normalising setter lived
// here briefly and was removed: the same invariant has to hold through the raw
// arithmetic engine/ does on the number, which a setter on one field cannot
// reach. It belongs in an Angle value type, once engine/ is TypeScript.
//
// So these assert the absence of normalisation. If a setter comes back without
// that plan being finished, this section says so.
const TAU = Math.PI * 2;
const body = new DynamicBody({ x: 100, y: 100, angle: 0.5 });

eq('angle survives an in-range write exactly', body.angle, 0.5);

body.angle = 0.5 + TAU;
eq('an out-of-range angle is stored as given', body.angle, 0.5 + TAU);

body.angle = -0.25;
eq('a negative angle is stored as given', body.angle, -0.25);

// Whatever normalises, wherever it ends up living, must not perturb an angle
// already in range: the obvious ((v % TAU) + TAU) % TAU form loses a few bits
// on every write, which showed up as drift across the whole sim.
const wrap = v => {
  const w = v % TAU;
  return w < 0 ? w + TAU : w;
};

let exact = true;
for (let i = 0; i < 2000; i++) {
  const v = (i / 2000) * TAU;
  if (wrap(v) !== v) exact = false;
}
ok('the wrap engine/ uses is exact for in-range angles', exact);
ok('and still brings a drifted angle back', wrap(0.5 + TAU) - 0.5 < 1e-12);
ok('and a negative one', Math.abs(wrap(-0.25) - (TAU - 0.25)) < 1e-12);

// --- Body's line-intersection API, as HitScan calls it --------------------
// HitScan.js does `body.getLineIntersectionDistance({ startPoint, endPoint })`
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

const hit = blocker.getLineIntersectionDistance(throughIt);

ok('Body.getLineIntersectionDistance exists and returns a hit', hit !== null);
ok('the hit is a bare distance', typeof hit === 'number');
// The ray starts at CELL * 2 and the blocker's near face is at CELL * 4.
eq('and it is the near edge, not the far one', hit, CELL * 2);
eq('a miss returns null', blocker.getLineIntersectionDistance(pastIt), null);

// null and 0 are different answers, and this is the distinction that breaks if
// a caller writes `if (distance)`. A line starting exactly on the near face has
// travelled nothing and still hit. HitScan.js is unchecked JavaScript, so this
// is the only thing standing between that and a silently dropped point-blank
// shot.
const onTheEdge = {
  startPoint: new Point(CELL * 4, CELL * 4 + CELL / 2),
  endPoint: new Point(CELL * 6, CELL * 4 + CELL / 2),
};

eq(
  'a line starting on the edge hits at distance 0',
  blocker.getLineIntersectionDistance(onTheEdge),
  0
);
ok(
  'and 0 is distinguishable from a miss',
  blocker.getLineIntersectionDistance(onTheEdge) !== null &&
    blocker.getLineIntersectionDistance(pastIt) === null
);

// The crossing has to lie on the SEGMENT, not on the infinite line through it.
// Only the box's own edges were bounded, so a body entirely behind startPoint
// reported a hit at an unsigned distance — the box 160 units behind you
// answering "160 units away".
//
// Nothing else notices. castRay only ever calls the boolean sibling, so
// `equivalence` is silent, and every probe in `bugfix` spans its body, so that
// is silent too. This section is the only thing pinning it.
const behindIt = {
  startPoint: new Point(CELL * 6, CELL * 4 + CELL / 2),
  endPoint: new Point(CELL * 8, CELL * 4 + CELL / 2),
};

eq(
  'a body behind the segment is not a hit',
  blocker.getLineIntersectionDistance(behindIt),
  null
);
ok(
  'and the boolean sibling agrees',
  blocker.intersectsLine(behindIt) === false
);

// The real invariant: one answers "whether", the other "where", and they must
// never disagree. Probed all round the box, with a segment that reaches it and
// one that stops short — the stopping-short half is what the bug got wrong.
let disagreements = 0;
let stoppedShort = 0;

for (let a = 0; a < 360; a += 3) {
  const rad = (a * Math.PI) / 180;
  const far = new Point(
    blocker.x + Math.cos(rad) * 90,
    blocker.y + Math.sin(rad) * 90
  );

  const probes = [
    // stops well outside the box: both must say no
    {
      startPoint: far,
      endPoint: new Point(
        blocker.x + Math.cos(rad) * 40,
        blocker.y + Math.sin(rad) * 40
      ),
      expected: false,
    },
    // runs to the centre: both must say yes
    {
      startPoint: far,
      endPoint: new Point(blocker.x, blocker.y),
      expected: true,
    },
  ];

  for (const { startPoint, endPoint, expected } of probes) {
    const line = { startPoint, endPoint };
    const bool = blocker.intersectsLine(line);
    const found = blocker.getLineIntersectionDistance(line) !== null;

    if (bool !== found || bool !== expected) disagreements++;
    else if (!expected) stoppedShort++;
  }
}

ok(
  'whether and where agree on 240 probes around the box',
  disagreements === 0,
  `${disagreements} disagreements; ${stoppedShort} probes correctly stopped short`
);

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

// Park it: this world gets ticked repeatedly below, and a body still moving at
// the limit walks off a 4x4 grid in seven frames, whereupon getCell returns
// null and its next update throws.
sprinter.velocity = 0;

// --- a real engine cell, driven through a real world tick -----------------
// Doors once shipped completely frozen while every check here passed. Engine
// DynamicCell.update overrode its parent without calling super, so the chain
// stopped one level short of the physics update that does the sliding — and
// nothing drove a real engine cell through a real tick to notice.
//
// `equivalence` builds DynamicCells but never registers them, so world.update
// never calls them. The Door assertions higher up only read fields off one.
// This is the section that fails if any override in the chain stops chaining.
//
// Physics World has no player; the engine path reads two things off one.
world.player = { pos: new Point(0, 0), shake: () => {} };

const slidingDoor = new Door({
  x: CELL + CELL / 2,
  y: CELL + CELL / 2,
  width: CELL,
  length: CELL,
  height: CELL,
  blocking: true,
  sides: {},
  axis: 'x',
  speed: 0.25, // 8 world units per frame, so four frames to open
  interval: 1000,
  soundSprite,
  sounds,
});

const doorAxis = slidingDoor.axis;

world.setCell(1, 1, slidingDoor);
world.add(slidingDoor);

eq('a closed door is stationary', slidingDoor.velocity[doorAxis], 0);

slidingDoor.use();

ok(
  'using a door registers it for updates',
  world.updatableBodies.includes(slidingDoor)
);
ok('and gives it a velocity', slidingDoor.velocity[doorAxis] > 0);

const beforeTick = slidingDoor.offset[doorAxis];
world.update(1, 16);

ok(
  'a world tick actually slides the door',
  slidingDoor.offset[doorAxis] > beforeTick,
  `offset.${doorAxis} went ${beforeTick} -> ${slidingDoor.offset[doorAxis]}`
);

// Run it to completion: the door must stop exactly at CELL, not overshoot.
for (let i = 0; i < 10; i++) world.update(1, 16);

eq('and stops at exactly one cell', slidingDoor.offset[doorAxis], CELL);
ok('reporting itself opened', slidingDoor.isOpened());
eq('with the velocity zeroed', slidingDoor.velocity[doorAxis], 0);

// PushWall takes the other branch of the same chain.
// Placed with room behind it: `canMove` looks at the cell it would move INTO,
// and getCell returns null off the edge of the 4x4 grid.
const secret = new PushWall({
  x: 2 * CELL + CELL / 2,
  y: 2 * CELL + CELL / 2,
  width: CELL,
  length: CELL,
  height: CELL,
  blocking: true,
  sides: {},
  axis: 'x',
  speed: 0.25,
  soundSprite,
  sounds,
});

world.setCell(2, 2, secret);
world.add(secret);

// Pushed from the far side, so it travels toward grid row 1.
secret.use({
  gridX: 2,
  gridY: 3,
  pos: new Point(2 * CELL + CELL / 2, 3 * CELL + CELL / 2),
  addMessage: () => {},
});

const pushAxis = secret.slideAxis;
const pushedFrom = secret.offset[pushAxis];
world.update(1, 16);

ok(
  'a world tick actually slides a push wall',
  secret.offset[pushAxis] > pushedFrom,
  `offset.${pushAxis} went ${pushedFrom} -> ${secret.offset[pushAxis]}`
);

// isUpdatable narrowed from "has an update method" to "is a DynamicBody or a
// DynamicCell" — which is what let `update` and `autoPlay` come off Body. The
// two tests agree on everything in the codebase, since nothing outside those
// two branches has an update, but the new rule is stricter. Record it, so the
// day someone bolts an update onto a plain Cell and wonders why it never runs,
// this says why.
const bolted = new Cell({ ...base });
bolted.update = () => {};
world.startUpdates(bolted);

ok(
  'an update bolted onto a plain cell does not make it updatable',
  !world.updatableBodies.includes(bolted)
);
ok(
  'while both real branches are',
  world.updatableBodies.includes(slidingDoor) &&
    world.updatableBodies.includes(secret),
  'an opened door stays registered for its auto-close timer; only setClosed unregisters'
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
// listener. Nothing else exercises teardown.
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

// This used to read "cell drops its back-reference to the world". A static
// cell has no such reference now: `parent` lives on DynamicBody and
// DynamicCell, the only two things that ever look outward. So the guarantee
// became a stronger one — there is nothing to drop.
eq('a static cell holds no world reference at all', cell.parent, undefined);
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
