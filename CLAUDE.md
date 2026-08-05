# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Boom is a raycasting first-person shooter (Wolfenstein/Doom-style) built with [PixiJS](https://pixijs.com/) v8 for rendering and [Howler.js](https://howlerjs.com/) for audio, using [vanjs-core](https://vanjs.org/) for the minimal DOM shell around the canvas. There is no framework (React/Vue) — the whole app is hand-rolled JS classes.

## Commands

```bash
nvm use          # Node v22.11.0 (see .nvmrc)
npm install
npm run dev       # Vite dev server
npm run build     # rm -rf dist && vite build
npm run preview   # preview the production build
npm run lint      # eslint ./src
npm run typecheck # tsc --noEmit (checks .ts files only — see "TypeScript" below)
npm run format    # prettier --write ./src
npm run deploy    # scripts/deploy.sh — rsyncs dist/ to a remote host over ssh/scp (requires the `bm` ssh alias)
```

There is no test suite/runner configured in this repo.

### Debug URL params (read in `src/constants/config.js`)

Useful when running `npm run dev` and opening the app in a browser:
- `?debug=1` — enables debug mode (skips title screen straight into the world scene, exposes `window.app`)
- `?debug=2` — debug mode + top-down map view instead of first-person POV
- `?level=N` — start on a specific level index (also implies `allWeapons`)
- `?god=true` — god mode
- `?allWeapons=true` — start with all weapons
- `?stats=1` — show FPS/perf stats panel
- `?disableSound=true` / `?disableMusic=true`

## Architecture

### Layered structure

```
src/App                          — vanjs shell: Home screen, Spinner, Stats, and the Game
src/App/components/Game
  ├─ core/                       — engine-agnostic subsystems, each with its own index.js barrel
  │   ├─ physics/                — grid-based World/Cell/Body + AABB-ish DynamicBody, raycasting (castRay)
  │   ├─ graphics/                — thin wrapper over PixiJS primitives (Sprite, AnimatedSprite, Container, etc.) + GraphicsLoader/Cache/Creator
  │   ├─ audio/                   — Howler-based SoundLoader + SoundSpriteController (sprite-sheet style sound atlas)
  │   ├─ input/                   — InputController wrapping Keyboard + Mouse (pointer lock), state-scoped key/mouse bindings
  │   └─ ai/                      — A* pathfinding (Graph/GridNode/BinaryHeap + astarSearch), used for enemy navigation
  ├─ engine/                      — game-specific domain layer built on top of core/physics
  │   ├─ components/World/        — World extends core physics World; owns entities, effects, lighting, pathfinding graphs
  │   ├─ components/Entity.js      — base renderable Body subclass (name/animation/scale)
  │   ├─ components/AbstractActor.js, AbstractDestroyableEntity.js — shared actor behavior (health, hurt, blood spatter/stains, elevation)
  │   ├─ components/Player/        — player-specific input→action mapping, weapons, camera, HUD state
  │   ├─ components/*Enemy.js       — GunEnemy, ChaseEnemy, ProjectileEnemy, Arachnacopter, Arachnatron (AI-driven actors)
  │   └─ components/*Item.js, Door.js, PushWall.js, Projectile.js, Explosion.js, etc. — other entity types
  └─ scenes/                      — presentation layer (PixiJS containers) driven by a small state machine
      ├─ Scene/                    — base class: fade in/out, pause/menu state machine, sound/menu wiring
      ├─ TitleScene/, CreditsScene/ — simple animated scenes
      └─ WorldScene/                — the actual gameplay scene
          ├─ parsers/               — turns loaded map JSON + graphics atlas into engine World + Pixi sprites (bodies.js, sprites.js)
          ├─ containers/POVContainer/ — first-person raycasted view (wall/floor/ceiling rendering, HUD, weapon sprite)
          └─ utils/WorldGraphics.js  — builds the Pixi container trees for POV vs. top-down (map) view
```

### Control flow

`main.js` → `App` (vanjs root) owns `Home`, `Spinner`, `Stats`, and `Game`. `Game` owns a single PixiJS `Application` and swaps `Scene` instances (`TitleScene` → `WorldScene` → `CreditsScene`, keyed by `SCENE_TYPES` in `src/constants/assets.js`) onto its stage. `Game.showScene()` unloads the previous scene's assets, loads the new scene's assets via `Loader`, then calls `scene.create(...)`.

Each `Scene` is itself a small state machine (`STATES` in `scenes/Scene/constants.js`: `LOADING → FADING_IN → RUNNING ⇄ PAUSED/PROMPTING → FADING_OUT → STOPPED`), driving pixelated fade transitions and pause menu. `WorldScene` extends this with review-screen states (`ADDING_REVIEW`/`DISPLAYING_REVIEW`/`REMOVING_REVIEW`) shown when the player reaches an exit.

### Assets and data-driven levels

Game/scene assets are declared as data in `src/constants/assets.js` and physically served from `public/wad/` (named after Doom's WAD format): per-scene `graphics.json`/`graphics.png` (texture atlas), `music.mp3`, and — for world scenes — `map.json` (grid layout, entity placement, waypoints) plus a top-level `wad/data.json` (level list, per-scene text/props) and `wad/sounds.ogg`/`sounds.json` (a Howler sound sprite atlas shared game-wide). Levels are purely data: adding/editing a level means editing `public/wad/scenes/world/<n>/map.json` (and matching graphics/music), not writing code. `WorldScene/parsers/{bodies,sprites}.js` are the two places that interpret that map JSON into live `engine` entities and Pixi sprites respectively.

### Physics/world model

The world is a 2D grid of cells (`CELL_SIZE` = 32 units). `core/physics/components/World` holds the grid and all `Body`/`DynamicBody` instances; `engine/components/World/World` (game layer) extends it with player/enemies/items, lighting (flash/pickup light), floor stains, secrets, and per-enemy-radius pathfinding graphs (`core/ai`). Rendering in `WorldScene`'s POV container is done via raycasting (`core/physics` `castRay`/`degrees` helpers) rather than a WebGL 3D pipeline — walls/floor/ceiling are drawn as vertical strips per ray.

### Path aliases (vite.config.js)

```
@assets    → /src/assets
@util      → /src/util
@constants → /src/constants
@game      → /src/App/components/Game
```
Always use these aliases for cross-directory imports instead of relative `../../..` paths — this is the existing convention throughout `src/`.

### Barrel exports

Each `core/*` subsystem and `engine/` exposes a single `index.js` that re-exports its public components (e.g. `@game/core/physics` exports `Body`, `World`, `Cell`, `castRay`, etc.). Import from these barrels rather than reaching into `components/` directly.

### Memory management convention

Classes with a long lifetime (`Scene`, `World`, entities) implement an explicit `destroy()` that nulls out references and calls `destroy()` on owned children/PixiJS objects — several past commits are specifically about fixing leaks here ("Updated memory management", "Fixed destroy scene bug"). When adding new stateful fields to these classes, wire them into the corresponding `destroy()`.

### i18n

`src/util/translate` picks `en`/`fr` (`src/util/translate/en.js`/`fr.js`) based on `navigator.language`, falling back to `DEFAULT_LANGUAGE` (`en`). Strings support `{KEY}`-style placeholders via the `keys` option (camelCase key → `CONSTANT_CASE` placeholder).

### TypeScript

The project is TypeScript-*capable* but not TypeScript-*converted*: the entire `src/` tree is still plain JS and stays that way unless a file is deliberately migrated. Vite (esbuild) compiles `.ts` transparently, so a new `.ts` module can be dropped anywhere in `src/` and imported from existing JS with no build changes.

- `tsconfig.json` sets `allowJs: true` + `checkJs: false` — existing `.js` files are resolved and compiled but never type-checked, so `npm run typecheck` reports only on `.ts`/`.d.ts` files. Untyped JS imports come through as `any`.
- New `.ts` files are checked under `strict` (plus `noUnusedLocals`/`noUnusedParameters`). Path aliases mirror `vite.config.js` under `compilerOptions.paths`.
- To opt a single JS file into checking, add `// @ts-check` at the top of it rather than flipping `checkJs` globally.
- ESLint applies `typescript-eslint` recommended rules to `**/*.ts` only; JS linting is unchanged.
- `src/vite-env.d.ts` pulls in Vite's ambient types (asset imports, `import.meta.env`).

## Code style

- Prettier config (`.prettierrc`): single quotes, semicolons, 2-space indent, `arrowParens: avoid`, `printWidth: 80`.
- ESLint: `@eslint/js` recommended rules against browser globals, plus `typescript-eslint` recommended for `**/*.ts` (`eslint.config.js`). Run `npm run lint` before committing.
