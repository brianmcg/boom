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
 * ## What a field's modifier means
 *
 * Every field sits in exactly one of these. The modifier is a claim about the
 * field, so pick the tier by naming the invariant in a sentence — if the
 * sentence is "it stores the value", it is the first or last.
 *
 * 1. `readonly` — fixed when the object is built. Note this forces the value
 *    through the constructor: a subclass cannot assign a base class's
 *    `readonly`, which is why `Cell`'s whole contract (`isDoor`, `closed`, …)
 *    arrives as options rather than being set by `Door` and friends.
 * 2. **A value type** — when the invariant belongs to the value itself rather
 *    than to the field holding it, so it holds everywhere the value goes,
 *    including in locals no setter could see.
 * 3. `private` + accessor — when a write has to touch *other* state, or must
 *    be normalised or clamped. `DynamicBody.angle` and `velocity` are the two.
 * 4. Plain public — a free value with no invariant. Most of `Body`.
 *
 * An accessor pair that only reads and writes its own backing field is not
 * encapsulation, it is indirection; prefer 1 or 4. And an invariant a setter
 * cannot actually enforce belongs in a method instead — see `Body.reindex`,
 * which is not an `x`/`y` setter precisely because `DynamicBody.update` would
 * have to bypass it.
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
