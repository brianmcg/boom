# Physics refactor harnesses

`npm run test:physics`

Two suites, both comparing the live `core/physics` module against the last
commit before the TypeScript migration (`0560ed04`). There is no test runner in
this repo and these are not unit tests — they exist because the raycaster has
no other safety net and a silent regression in it is very hard to spot by
playing.

| suite         | asserts                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `equivalence` | the module behaves **identically** to the baseline: ~10k rays across 4 option sets, a 400-step dynamic-body sim, the `degrees` table, the constants, and the own-key shape of every concrete cell type |
| `bugfix`      | the two bugs fixed in `31126d83` are still fixed, checked against independently computed truth rather than against the baseline                                                                        |

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

Two known future divergences, from the encapsulation plan:

- clamping `DynamicBody.velocity` on write rather than at use changes the
  stored value
- moving fields behind accessors renames own keys (`_angle` for `angle`), which
  the cell-shape audit compares — `norm()` in `equivalence.mjs` needs to strip
  the underscore

## Stubs

`stubs/config.js` and `stubs/graphics.js` stand in for `@constants/config` and
the pixi.js `EventEmitter` re-export, so the suites run under plain node with
no browser or renderer. If physics starts using something else from either,
the stub needs the addition.

esbuild resolves the aliases and compiles the TypeScript. It arrives as a Vite
dependency rather than a direct one.
