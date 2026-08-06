# Physics refactor harnesses

`npm run test:physics`

Three suites over the live `core/physics` module, two of them comparing it
against the last commit before the TypeScript migration (`0560ed04`). There is
no test runner in this repo and these are not unit tests — they exist because
the raycaster has no other safety net and a silent regression in it is very
hard to spot by playing.

| suite           | asserts                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `equivalence`   | the module behaves **identically** to the baseline: ~10k rays across 4 option sets, a 400-step dynamic-body sim, the `degrees` table, the constants, and the own-key shape of every concrete cell type  |
| `bugfix`        | the two bugs fixed in `31126d83` are still fixed, checked against independently computed truth rather than against the baseline                                                                         |
| `cell-contract` | the engine's cell subclasses (`Cell`, `TransparentCell`, `Door`, `PushWall`) configure the contract the raycaster reads — `transparency`, `isDoor`, `isPushWall`, `double`, `reverse`, `closed`, `edge` |

Run one with `npm run test:physics <suite>`.

`cell-contract` exists because those seven fields are `readonly` on the core
`Cell`, which means a subclass can only set them by passing options through
`super()` — and neither other suite covers that, since both build core `Cell`s
directly. It asserts forward against what the map data means rather than
against the baseline, so it needs no baseline at all.

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

**`DynamicBody.angle` is normalised on write.** The baseline let a body's angle
drift past 2π and then chose the wrong quadrant branch in the raycaster:
`6.3879` fails `angle < DEG_180` while the geometrically identical `0.1047`
passes, so the ray stepped toward `-y` when it should have stepped toward
`+y`. The sim now normalises when it turns a body, which is what every real
caller in `engine/` already does; `contract` asserts the guarantee, including
that an in-range angle is stored bit-for-bit — the obvious
`((v % TAU) + TAU) % TAU` form is _not_ the identity and perturbed every angle
in the sim.

Still to come, when `Body.x`/`y` move behind accessors: own keys get renamed
(`_x` for `x`), which the cell-shape audit compares, so `norm()` in
`equivalence.mjs` will need to strip the underscore.

## Stubs

`stubs/config.js` and `stubs/graphics.js` stand in for `@constants/config` and
the pixi.js `EventEmitter` re-export, so the suites run under plain node with
no browser or renderer. If physics starts using something else from either,
the stub needs the addition.

esbuild resolves the aliases and compiles the TypeScript. It arrives as a Vite
dependency rather than a direct one.
