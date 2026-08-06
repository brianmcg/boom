// Proves the two bug fixes: each case is run against the pre-fix module (OLD)
// and the fixed one (NEW), and checked against independently computed truth.
import * as OLD from '@baseline';
import * as NEW from '@game/core/physics';

const CELL = 32;

// The baseline's World takes (grid, bodies); the live one takes an options
// object. A signature change, not a behavioural one.
const makeWorld = (M, grid, bodies) =>
  M === OLD ? new M.World(grid, bodies) : new M.World({ grid, bodies });

// Same story for the two line-intersection methods. The baseline called them
// isRayCollision/getRayCollision, back when only the raycaster used them; they
// are lineIntersectsBody/getLineBodyIntersection now, exposed on Body as
// intersectsLine/getLineIntersection. Renames, not behaviour.
const intersects = (body, line) =>
  body.intersectsLine ? body.intersectsLine(line) : body.isRayCollision(line);

const intersection = (body, line) =>
  body.getLineIntersection
    ? body.getLineIntersection(line)
    : body.getRayCollision(line);

let failed = false;
const ok = (name, cond, detail) => {
  console.log(
    `${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`
  );
  if (!cond) failed = true;
};

// ---------------------------------------------------------------------------
// Bug 1: getRayCollision used `width` where `length` belongs, so on a body
// whose length differs from its width three of the four edges were tested at
// the wrong y. Ground truth: the box is centred on (bx, by).
// ---------------------------------------------------------------------------
const W = 40; // wide
const L = 8; // shallow
const bx = 320;
const by = 320;

const makeBody = M =>
  new M.Body({ x: bx, y: by, width: W, length: L, height: 32 });

// A ray travelling +y up the box's centre line must hit the near long edge at
// y = by - L/2. With the bug it looks for that edge at by - W/2 instead.
const startPoint = { x: bx, y: by - 100 };
const endPoint = { x: bx, y: by + 100 };

const oldHit = intersection(makeBody(OLD), { startPoint, endPoint });
const newHit = intersection(makeBody(NEW), { startPoint, endPoint });

const expectedY = by - L / 2;
ok(
  'bug1: hits the near edge at y = by - length/2',
  newHit && Math.abs(newHit.y - expectedY) < 1e-9,
  `expected y=${expectedY}, new=${newHit && newHit.y}, old=${oldHit && oldHit.y}`
);
// A discriminating ray: horizontal, at a y that is outside the box by length
// but inside the phantom box the bug extended to y + width. The body is not
// there, so the correct answer is "no hit".
const phantomY = by + (L / 2 + W / 2) / 2; // between by+4 (real edge) and by+20
const phantomSp = { x: bx - 100, y: phantomY };
const phantomEp = { x: bx + 100, y: phantomY };
const oldPhantom = intersection(makeBody(OLD), {
  startPoint: phantomSp,
  endPoint: phantomEp,
});
const newPhantom = intersection(makeBody(NEW), {
  startPoint: phantomSp,
  endPoint: phantomEp,
});

ok(
  'bug1: old module reported a phantom hit below the body',
  !!oldPhantom,
  `y=${phantomY}, body spans y ${by - L / 2}..${by + L / 2}, old hit=${JSON.stringify(oldPhantom)}`
);
ok(
  'bug1: fixed module correctly reports no hit there',
  newPhantom === null,
  `got ${JSON.stringify(newPhantom)}`
);
ok(
  'bug1: reported distance matches the corrected hit point',
  newHit && Math.abs(newHit.distance - (expectedY - startPoint.y)) < 1e-9,
  `expected ${expectedY - startPoint.y}, got ${newHit && newHit.distance}`
);

// getRayCollision must now agree with isRayCollision, which always used length.
// Probe a band that is inside the box by width but outside it by length: the
// buggy version reports a hit there, isRayCollision does not.
let agree = true;
let disagreeOld = 0;
for (let dy = -W; dy <= W; dy += 1) {
  const sp = { x: bx - 100, y: by + dy };
  const ep = { x: bx + 100, y: by + dy };
  const b = makeBody(NEW);
  const hit = !!intersection(b, { startPoint: sp, endPoint: ep });
  const isHit = intersects(b, { startPoint: sp, endPoint: ep });
  if (hit !== isHit) agree = false;

  const ob = makeBody(OLD);
  if (
    !!intersection(ob, { startPoint: sp, endPoint: ep }) !==
    intersects(ob, { startPoint: sp, endPoint: ep })
  )
    disagreeOld++;
}
ok(
  'bug1: getRayCollision now agrees with isRayCollision on every probe',
  agree,
  `old disagreed on ${disagreeOld} of 81 probes`
);

// Square bodies must be completely unaffected — this is what ships today.
let squareSame = true;
for (let a = 0; a < 360; a += 3) {
  const ang = (a * Math.PI) / 180;
  const sp = { x: bx + Math.cos(ang) * 90, y: by + Math.sin(ang) * 90 };
  const ep = { x: bx - Math.cos(ang) * 90, y: by - Math.sin(ang) * 90 };
  const mk = M => new M.Body({ x: bx, y: by, width: 24, length: 24 });
  const o = intersection(mk(OLD), { startPoint: sp, endPoint: ep });
  const n = intersection(mk(NEW), { startPoint: sp, endPoint: ep });
  if (JSON.stringify(o) !== JSON.stringify(n)) squareSame = false;
}
ok('bug1: square bodies byte-identical to before (120 angles)', squareSame);

// ---------------------------------------------------------------------------
// Bug 2: a ray that leaves the grid on both axes fell through to the vertical
// branch with `verticalCell` never assigned, throwing a TypeError.
// Build a world whose perimeter has a hole and fire straight out of it.
// ---------------------------------------------------------------------------
const buildLeakyWorld = M => {
  const { Cell } = M;
  const N = 8;
  const grid = [];
  for (let gx = 0; gx < N; gx++) {
    const col = [];
    for (let gy = 0; gy < N; gy++) {
      const edge = gx === 0 || gy === 0 || gx === N - 1 || gy === N - 1;
      // Leave the entire far column and far row non-blocking so a ray aimed
      // into the corner escapes on both axes.
      const solid = edge && !(gx === N - 1 || gy === N - 1);
      const c = new Cell({
        x: gx * CELL + CELL / 2,
        y: gy * CELL + CELL / 2,
        width: CELL,
        length: CELL,
        height: CELL,
        blocking: solid,
      });
      c.front = { name: 'f', height: CELL, spatter: 0 };
      c.left = c.back = c.right = c.front;
      col.push(c);
    }
    grid.push(col);
  }
  return makeWorld(M, grid, []);
};

const fireOutOfBounds = M => {
  const world = buildLeakyWorld(M);
  const N = 8;
  // Stand in the outermost cell and aim diagonally out of the corner.
  const x = (N - 1) * CELL + CELL / 2;
  const y = (N - 1) * CELL + CELL / 2;
  try {
    const rays = M.castRay({ x, y, angle: M.degrees(45), world });
    const last = rays[rays.length - 1];
    return {
      threw: false,
      layers: rays.length,
      distance: last.distance,
      hasCell: !!last.cell,
      cellId: last.cell && last.cell.id,
    };
  } catch (e) {
    return { threw: true, error: `${e.name}: ${e.message}` };
  }
};

const oldOut = fireOutOfBounds(OLD);
const newOut = fireOutOfBounds(NEW);

ok(
  'bug2: old module threw on a ray leaving the grid on both axes',
  oldOut.threw,
  oldOut.threw ? oldOut.error : 'did NOT throw — test case is not triggering'
);
ok('bug2: fixed module does not throw', !newOut.threw, JSON.stringify(newOut));
ok(
  'bug2: the returned ray names a real cell',
  !newOut.threw && newOut.hasCell,
  `cell=${newOut.cellId}`
);
ok(
  'bug2: distance is MAX_VALUE, so it renders as nothing',
  !newOut.threw && newOut.distance === Number.MAX_VALUE
);
ok(
  'bug2: castRay stopped after one layer (did not loop on a transparent cell)',
  !newOut.threw && newOut.layers === 1,
  `layers=${newOut.layers}`
);

// Sweep the whole leaky perimeter: nothing may throw from any angle.
let threwCount = 0;
let oldThrewCount = 0;
for (const M of [OLD, NEW]) {
  const world = buildLeakyWorld(M);
  for (let gx = 1; gx < 7; gx++)
    for (let gy = 1; gy < 7; gy++)
      for (let a = 0; a < 360; a += 5) {
        try {
          M.castRay({
            x: gx * CELL + CELL / 2,
            y: gy * CELL + CELL / 2,
            angle: M.degrees(a),
            world,
          });
        } catch {
          if (M === NEW) threwCount++;
          else oldThrewCount++;
        }
      }
}
ok(
  'bug2: full sweep of the leaky map throws nowhere',
  threwCount === 0,
  `new threw ${threwCount} times, old threw ${oldThrewCount} of 2592 casts`
);

console.log(failed ? '\nRESULT: FAILURES' : '\nRESULT: ALL PASS');
process.exit(failed ? 1 : 0);
