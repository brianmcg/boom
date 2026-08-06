/**
 * Shared types for the physics module, and the conventions every class in it
 * follows. `Ray` diverged from its neighbours once because none of this was
 * written down.
 *
 * ## How a class is written
 *
 * Constructors take a **single options object**, destructured with defaults,
 * and fields are declared in the **class body** — never as constructor
 * parameter properties, which cannot be used with a destructured options
 * object anyway. Each options interface is exported as `<Class>Options`.
 *
 * The one exception is a **value object** wrapping a single primitive
 * ({@link Point} is the current example), which takes it positionally. An
 * options object for one required value adds nothing. Any further exception
 * belongs in this comment rather than just happening.
 *
 * ## Modifiers
 *
 * Two independent questions, not one scale. `private`/`public` is *who* may
 * touch a field; `readonly` is *when* it may be written. A field can be both,
 * either or neither.
 *
 * **`readonly` means the value is part of what the object is** — change it and
 * you have a different object. `Body.id`, `width`, `length`, `anchor`;
 * `DynamicBody.collisionRadius`; `World.grid` and its dimensions; the whole of
 * `Ray` bar the two fields `continueFrom` rebases.
 *
 * Not "nothing assigns it today". That basis was tried and it churns: it
 * locked `Cell.transparency` because current maps happen not to animate a
 * wall, which is a fact about content rather than about cells. If a field is
 * merely quiet, leave it writable.
 *
 * **`private` means nothing outside the class touches it** — accessor backing
 * fields, and bookkeeping like `DynamicBody.collisions`. Three fields in the
 * module; everything else is public. There is no `protected`: it was down to
 * one field and one method, which does not earn a third thing to remember. Add
 * it back if a class ever genuinely needs a hierarchy-only member.
 *
 * The two stack where both are true, and that is not a third category:
 * `collisions` is private and mutable, `Body.width` is public and readonly, and
 * a field can be both.
 *
 * If a field's visibility feels arbitrary, check whether it should exist at
 * all. `World` used to cache `maxCellX = width - 1` for `getCell`'s bounds
 * check; it was private only because nothing outside asked for cell-space
 * bounds, while the identical fact in world units (`maxMapX`) is public and
 * widely used. The question had no good answer because the field was redundant.
 *
 * **A leading `_` marks an accessor's backing field, nothing else.** It is not
 * a privacy convention — it is forced, because `get angle()` cannot read a
 * field also called `angle`. Private fields without an accessor keep their real
 * names (`collisions`, `maxCellX`). One field in this module is prefixed, and
 * it is the one with an accessor.
 *
 * Relaxing a modifier because a new call site needs the field is these rules
 * working, not a breach of them. Until `engine/` is TypeScript, `checkJs:
 * false` hides the JS call sites, so `private` has to be checked by grepping —
 * exclude `core/ai` and `graph.grid[...]`, since `GridNode` has `weight`,
 * `parent` and `closed` fields whose names collide with these.
 *
 * Two things sit outside all of that:
 *
 * - **Value types**, for an invariant belonging to the value rather than to
 *   the field holding it, so it holds everywhere the value goes — including in
 *   locals no setter could see.
 * - **Accessors**, only where a write must be normalised or clamped, and only
 *   when there is a real defect behind it. `DynamicBody.angle` is the only one:
 *   an un-normalised angle made the raycaster step the wrong way. `velocity`
 *   had one too and lost it — the limit belongs to how far a body may travel in
 *   an update, not to what a caller may ask for, so it stayed at the point of
 *   use. A pair that just reads and writes its own backing field is
 *   indirection, not encapsulation.
 *
 * An invariant a setter cannot actually enforce belongs in a method — see
 * `Body.reindex`, which is not an `x`/`y` setter precisely because
 * `DynamicBody.update` would have to bypass it.
 *
 * ## Absence
 *
 * `null` marks a slot that held a value and was cleared, or a lookup that
 * computed to nothing — `Body.parent` after `destroy()`, `World.getCell()` out
 * of bounds, `getRayCollision()` with no intersection. `undefined` marks
 * something never supplied — a constructor option left off, or a cell face the
 * map data never defined. That is why `Ray.side` is `Side | undefined` rather
 * than `Side | null`: it passes through `Cell.front`/`left`/`back`/`right`
 * unchanged, and those come straight from the map.
 *
 * ## Changing any of this
 *
 * `npm run test:physics` compares the module against the last commit before
 * the TypeScript migration. A refactor must leave it reporting IDENTICAL; a
 * deliberate behaviour change updates the harness in the same commit, with the
 * divergence explained in `test/physics/README.md`.
 */
import type Cell from './components/Cell';

/**
 * Anything with a position in world space. Units are world units, not grid
 * cells.
 *
 * This is the *parameter* type: `Body` and `Cell` carry their own `x`/`y` and
 * are handed to the point helpers directly, so a signature demanding a real
 * {@link Point} would reject them. Fields that hold a position use the `Point`
 * class instead.
 */
export interface PointLike {
  x: number;
  y: number;
}

/** An axis-aligned bounding box, positioned by its top-left corner. */
export interface Shape {
  x: number;
  y: number;
  width: number;
  length: number;
}

/** A line segment, as consumed by the intersection helpers. */
export interface Line {
  startPoint: PointLike;
  endPoint: PointLike;
}

/**
 * One face of a cell: which texture to draw, how tall to draw it, and how much
 * blood has been splattered on it. Absent when the face is never drawn.
 */
export interface Side {
  name: string;
  height: number;
  spatter: number;
}

/** The point at which a ray crossed a line, and how far along the ray it was. */
export interface RayCollision extends PointLike {
  distance: number;
}

/** The raycaster's view of the world: a bounded grid it can look cells up in. */
export interface RaycastableWorld {
  width: number;
  length: number;
  getCell(x: number, y: number): Cell | null;
}

export interface CastRayOptions {
  x: number;
  y: number;
  angle: number;
  world: RaycastableWorld;
  /** Cast from inside a partially-open cell before stepping to the next one. */
  checkInitialCell?: boolean;
  ignoreOverlay?: boolean;
  /** Height of the ray; cells no taller than this are passed straight through. */
  elavation?: number;
  /** Offsets the ray's origin along its own angle, so a body doesn't hit itself. */
  radius?: number;
}
