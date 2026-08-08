---
name: migrate-to-typescript
description: Convert a JavaScript module in src/ to TypeScript. Covers the order to take modules in, separating the conversion from the redesign it provokes, deciding how you will know nothing broke, and the traps that have already cost this repo a bug.
---

# Migrating a module to TypeScript

Written after `core/physics` was converted (15 files, 41 commits). It is one
data point, so prefer the reasoning here to the letter of it, and correct this
file when a run contradicts it.

## Order

Bottom-up by dependency. Converting a module whose dependencies are still
JavaScript means its imports arrive as `any`, so the conversion proves much
less than it appears to.

```
core/physics          done
core/ai, core/input   no inheritance at all — purely mechanical
core/audio            one class extends Howl
core/graphics         seven classes extend Pixi — see the accessor trap below
engine                depends on all of core; inheritance up to 8 levels deep
scenes                depends on engine
```

Size and difficulty do not agree, and neither do size and risk. `core/audio`
is 4 files of Howler wrapper. `core/graphics` is small but carries the worst
trap in the repo. `engine` is 41 files and will be mostly design work.

## The one discipline: convert, then redesign

Writing a type forces you to say what something _is_, so conversion surfaces
design problems. In `core/physics` it surfaced at least six — a base class
carrying members only some subclasses used, two parameters named after the
caller's concepts rather than their own, an interface whose only read field was
one of four.

**Do not fix them while converting.** Keep a list as you hit them and act after.

1. Convert mechanically. No behaviour change, no renames, no restructuring.
   Types describe what the code already does, however wrong that is.
2. Verify (below). Commit.
3. Then take the list one item at a time, each its own commit, each verified.

This is what makes the redesigns safe: the conversion underneath them is
already pinned, so when something breaks there is one change to look at. It
also keeps the commits readable, which matters more than it sounds — the
history is how the next session learns why a shape is the way it is.

When a design question comes up, evaluate it against the code and give a
recommendation with evidence. Do not ratify a proposal because it was
proposed. Several of the physics changes were improved by pushing back, and
one bad idea was dropped only because it was argued down.

## Decide up front how you will know nothing broke

Answer this _before_ converting, and be honest about what the answer covers.

**Does the module need a differential harness?** Two questions:

- Would a regression here be subtly wrong rather than obviously broken?
- Can you produce comparable output cheaply?

`core/physics` was yes and yes — a raycaster drifting in the last bits looks
fine while playing — so it got one: the pre-migration JS extracted from git,
bundled with esbuild, run against the live TS on identical input. See
`test/physics/README.md` for how the three suites divide up and what a
divergence is allowed to be. `npm run test:physics`.

For most modules the answer is no and no, and building one is ceremony.

**Whatever you decide, a green run only proves the suite reached the code.**
This is not a platitude. During the physics work `typecheck`, `lint`, the full
harness, and the production build all passed while every door in the game was
frozen shut, because the harness never constructed a door. Ask specifically:
does my check exercise the thing I changed? If not, say so, and playtest it.

Baseline for any module: `npm run typecheck`, `npm run lint`,
`npx prettier --check src test`, then play the game and exercise what you
touched.

## Traps

**Never turn a property the parent owns into a class-body field.** Under
`useDefineForClassFields: true` — set in `tsconfig.json`, and what the
ECMAScript standard specifies — a field in a class body compiles to
`Object.defineProperty`, not to an assignment. Two ways that bites a subclass:

- a bare `x: number;` defines the property as `undefined`, wiping whatever the
  parent constructor assigned, because subclass fields run _after_ `super()`
  returns
- an initialised `x = 0;` installs a plain data property that **shadows an
  inherited accessor**, so the parent's setter never runs

Either way it is silent — no error, wrong behaviour. Type such a property by
assigning it in the constructor, the way the code already does.

This repo does not use `declare`, deliberately. Needing it means a type is
being stated in the wrong place; declare the field once, on the class that owns
it. The case that can genuinely force the question is a subclass narrowing a
parent's type, and that will not come up before `engine`.

That is not just a house preference. Pixi's own source — 3.4M characters of
TypeScript, readable locally, see below — contains **zero** class-body
`declare`. An entire rendering engine was written without reaching for it.

**`core/graphics` is where the accessor half bites.** All seven classes extend
Pixi, and Pixi's `Container` exposes `x`, `y`, `alpha`, `tint`, `visible`,
`width`, `height`, `angle`, `rotation`, `scale` and `position` as accessors.
The two dozen constructor assignments to those are correct as they stand —
converting any one of them to a typed field stops Pixi's internal update from
firing, and the sprite renders wrong rather than throwing.

**An override that does not call `super`.** The frozen doors above were this:
the engine subclass overrode `update` without chaining, so the physics `update`
that actually moved the cell never ran. The risk goes up sharply when you move
logic between levels of a deep chain, which is most of what converting `engine`
will be. `engine` also dispatches state from `update` to `updateIdle`,
`updateChasing` and so on, roughly nine per enemy — those are dispatch targets,
not overrides, and telling the two apart matters before you move anything.

**Renames do not propagate into modules that are still JavaScript.** Nothing
flags the stale call sites. Grep for them and fix them by hand, in the same
commit.

**Measure before claiming a performance difference.** Reading the code got it
backwards twice in the physics work; a one-minute `node` script settled each.
`new Point()` versus an object literal is noise; accessors and `instanceof` are
not, but the absolute numbers were ~1–2ns and irrelevant at this call volume.

**Union call signatures are the intersection of their members'**, so two
classes in a union must agree on optional parameters — the reason both physics
`update` methods take `_elapsedMS?: number`.

## Conventions

`src/App/components/Game/core/physics/types.ts` is the reference: where a type
lives, how a class is written, what `private` / `protected` / `readonly` each
mean here and when to reach for them, when an accessor is justified, and why
`null` and `undefined` are spelled differently on purpose. Read it before
inventing a convention. Extend it when a module needs one it does not cover.

Imports use the `@game` / `@util` / `@constants` / `@assets` aliases and the
per-subsystem `index` barrels, not relative paths or reaching into
`components/`.

**Where a module wraps a library, take its types from the library.** Pixi and
Howler both ship `.d.ts`. A wrapper passes values straight through, so its
parameter types should _be_ the library's types — `ColorSource`, `Texture`,
`PointData`, `SpriteOptions` and friends are all exported. Hand-writing an
equivalent gives you a type that can silently drift from what the library
accepts. Read the declarations in `node_modules`, not the published docs:
`pixi.js` is pinned to 8.16.0 for a reason (see `CLAUDE.md`) and the docs
describe a later version.

**Pixi's authored TypeScript is on disk, not just its `.d.ts`.** Its sourcemaps
carry `sourcesContent`, so the original `.ts` for 610 modules — 3.4M characters
— can be read without the network, at exactly the pinned version:

```js
JSON.parse(readFileSync('node_modules/pixi.js/lib/<path>.mjs.map'))
  .sourcesContent[0];
```

Generated `.d.ts` shows the contract; this shows the decisions behind it, which
is what to consult when a wrapper needs to mirror how Pixi does something. No
`gh` or GitHub access is needed, and GitHub would in any case show a later
version than the one pinned here.

That applies to the type surface, not to house style. Pixi's own source uses
`_`-prefixed fields and wide `Partial<>` option bags; `types.ts` governs the
code here. The wrappers' existing options-object constructors already match
Pixi v8's own shape, so they should type over cleanly.
