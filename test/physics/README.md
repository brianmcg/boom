# Physics refactor harnesses

`npm run test:physics`

Three suites over the live `core/physics` module, two of them comparing it
against the last commit before the TypeScript migration (`0560ed04`). There is
no test runner in this repo and these are not unit tests — they exist because
the raycaster has no other safety net and a silent regression in it is very
hard to spot by playing.

| suite         | asserts                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `equivalence` | the module behaves **identically** to the baseline: ~10k rays across 4 option sets, a 400-step dynamic-body sim, the `degrees` table, the constants, and the own-key shape of every concrete cell type |
| `bugfix`      | the two bugs fixed in `31126d83` are still fixed, checked against independently computed truth rather than against the baseline                                                                        |
| `contract`    | what the module is supposed to guarantee, asserted forward rather than against the baseline: the cell contract the raycaster reads, and the body guarantees the baseline never made                    |

Run one with `npm run test:physics <suite>`.

`contract` exists for the things `equivalence` structurally cannot check.

Some are guarantees the baseline **got wrong**, so "same as before" is the
wrong question — `DynamicBody.angle`, and the null-versus-zero distinction in
`getLineIntersectionDistance`.

The rest is plumbing neither other suite reaches. Every cell subclass is
unchecked JavaScript and sets the raycaster's contract by passing options
through `super()`, while `equivalence` and `bugfix` both build core `Cell`s
directly — so a subclass that stopped forwarding `sides`, or `Door.get shape()`
going back to an object literal, would fail nothing else. Same for
`Body.getLineIntersectionDistance`, whose only real caller is `HitScan.js`.

The baseline is extracted from git at run time, so no copy of the deleted
JavaScript lives in the tree. `BASELINE_SHA` in `run.mjs` pins it.

## When equivalence is allowed to fail

`equivalence` is a **refactor** guard. It answers "did this change behaviour?",
and the expected answer is no for anything that claims to be a refactor. It is
not a specification — the baseline has no authority beyond being what shipped.

So when a change deliberately alters behaviour, the harness has to be updated
deliberately, in the same commit, with the divergence explained. What must not
happen is advancing `BASELINE_SHA` to make a red run go green: that pins the
oracle to the very change you were trying to check.

### Divergences accepted so far

**None.** `equivalence` currently reports IDENTICAL with no allowances.

One was accepted and then withdrawn. `4bef6dca` gave `DynamicBody.angle` a
normalising setter, which the baseline had no equivalent of, so the sim had to
normalise its turns for the two to agree. The setter has since been removed:
the invariant has to survive the raw arithmetic `engine/` does on the number,
so it belongs in an `Angle` value type once `engine/` is TypeScript, not in a
setter on one field. The sim's turn went back to `d.angle += 0.31`, drifting
past 2π exactly as it always did — which is the stronger comparison, since both
modules now have to agree on a drifted angle too.

The bug that episode found is real and still worth knowing: `6.3879` fails
`angle < DEG_180` while the geometrically identical `0.1047` passes, so an
angle that drifts out of `[0, 2π)` makes the ray step toward `-y` instead of
`+y`. Every writer in `engine/` normalises, and `AbstractEnemy.js:500` was
fixed to join them. `contract` now asserts the _absence_ of normalisation on
the field, so a setter reappearing without the value-type plan being finished
shows up as a failure.

### Behaviour changes equivalence cannot see

IDENTICAL means "unchanged on what this exercises", not "unchanged". The gap is
worth knowing about, and there is one instance of it.

`getLineBodyIntersectionDistance` used to bound its crossing to the box's edges
but not to the line segment, so a body entirely behind `startPoint` reported a
hit at an unsigned distance. `equivalence` never noticed because `castRay` only calls the
boolean sibling `isLineBodyIntersection`; `bugfix` never noticed because every
probe in it spans its body. Fixing it moved neither suite. `contract` now pins
it, with a 240-probe sweep asserting that "whether" and "where" agree both when
a segment reaches the box and when it stops short.

The lesson generalises: before trusting a green run, check that the suite
actually reaches the code you changed.

### Renames the harness carries shims for

Not divergences — the baseline behaves the same, it just spells things
differently, so the harness translates rather than accepting a difference.

| baseline                             | live                                     | shim                                                            |
| ------------------------------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `new World(grid, bodies)`            | `new World({ grid, bodies })`            | `makeWorld` in `equivalence.mjs` and `bugfix.mjs`               |
| `isRayCollision`                     | `intersectsLine`                         | `intersects` in `bugfix.mjs`                                    |
| `getRayCollision` → `{x,y,distance}` | `getLineIntersectionDistance` → `number` | `distanceOf` in `bugfix.mjs`                                    |
| `isDoor` / `isPushWall`              | `retracts` / `displaces`                 | `setRetracts` / `setDisplaces` / `RENAMED` in `equivalence.mjs` |
| own `x` / `y` fields                 | `pos: Point` behind `x`/`y` accessors    | `logicalShape` in `equivalence.mjs`, `toLine` in `bugfix.mjs`   |

`distanceOf` is the one that changes shape rather than just spelling: nothing
ever read the crossing's coordinates, so the live module returns a bare
distance and the shim reduces the baseline's record to `hit.distance`. Bug 1's
assertion that the near edge sits at `y = by - length/2` became the equivalent
distance assertion — the probe runs straight up the centre line, so the
distance travelled _is_ the edge's offset.

The `retracts`/`displaces` one needs care in two places, because the cell-shape
audit compares own keys by name. `makeCell` sets the flag under the name that module knows,
and the audit maps the baseline's key names through `RENAMED` before diffing —
otherwise a pure rename reads as a lost key plus a truthy added one. The audit
keeps its teeth either way: a door still reports `displaces` as an added falsy
key, and a push wall still reports `retracts`.

The `pos` one is the change this file used to predict. `x` and `y` are
accessors on `Body.prototype` now, so they are no longer own keys and `pos` is
one instead — which the cell-shape audit reads as two keys lost and a truthy
one added. `logicalShape` projects both modules into the same shape before
diffing: it drops `pos` and reads `x`/`y` explicitly, which works on either.
Every other field still diffs by name.

`toLine` is the other half. The live module's positions really are `Point`s
now, and `getLineLineIntersection` calls `startPoint.distanceTo(...)` on one,
so a bare `{ x, y }` throws rather than quietly working. The baseline predates
the class, so it can only take literals. Every probe in `bugfix` writes
literals and `toLine` converts them per module.

## Stubs

`stubs/config.js` and `stubs/graphics.js` stand in for `@constants/config` and
the pixi.js `EventEmitter` re-export, so the suites run under plain node with
no browser or renderer. If physics starts using something else from either,
the stub needs the addition.

esbuild resolves the aliases and compiles the TypeScript. It arrives as a Vite
dependency rather than a direct one.
