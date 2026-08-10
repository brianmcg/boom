/**
 * Shared types for the physics module, and the conventions every class in it
 * follows. `Ray` diverged from its neighbours once because none of this was
 * written down.
 *
 * ## Where things live
 *
 * `components/` holds the classes, `utils/` the free functions, and each owns
 * the types that describe it: `BodyOptions` with `Body`, `CastRayOptions` with
 * `castRay`, `UpdatableBody` with the `World` field it types.
 *
 * **This file is not "the types folder".** It holds the shared vocabulary that
 * belongs to no single file, which is now `Line` alone. A type with an obvious
 * owner goes with its owner, so that changing one and not the other is hard.
 *
 * `Side` and `Sides` used to live here and no longer belong to the module at
 * all: a face's texture, height and blood are the game layer's, and physics
 * only ever named which face was hit. `Face` is what is left, and it is derived
 * from `FACES` in `constants.ts` like the two below.
 *
 * `Axis` and `Transparency` stay in `constants.ts` for the strongest version of
 * that: they are *derived* from `AXES` and `TRANSPARENCY` by indexed access, so
 * adding a member to the constant widens the type on its own. Split them and
 * whoever edits the constant no longer sees that a type follows from it.
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
 * touch a member; `readonly` is *when* it may be written. A member can be both,
 * either or neither.
 *
 * **The visibility rules below cover methods and accessors, not just fields.**
 * Every example here happens to be a field, which reads as if they were a
 * field-only convention — they are not. `private helper()` and
 * `protected hook()` are as ordinary as the field forms, and ask the same
 * question: does anything outside the class call this?
 *
 * `readonly` is the one exception: fields only. On a method it is a compile
 * error, not a subtly different meaning. Worth saying because Java's `final`
 * *does* apply to methods, where it seals them against overriding —
 * TypeScript has no equivalent of that at all.
 *
 * Accessors take visibility too, and may differ between the halves in one
 * direction only: a getter must be at least as accessible as its setter. So
 * public-read/private-write is available; the reverse is a compile error.
 *
 * All of this is erased at build time, so it constrains only this module.
 * `engine/` is unchecked JavaScript and can read and write a `private` field
 * freely — it stays an ordinary own property at runtime. Real enforcement
 * needs JavaScript's `#name`, which is not an own key and throws on outside
 * access; nothing here uses it, and adopting it would break any engine or
 * harness code reaching in.
 *
 * **`readonly` means the value is part of what the object is** — change it and
 * you have a different object. `Body.id`, `width`, `length`, `pos`;
 * `DynamicBody.collisionRadius`; `World.grid` and its dimensions; the whole of
 * `Ray` bar the two fields `continueFrom` rebases.
 *
 * Not "nothing assigns it today". That basis was tried and it churns: it
 * locked what is now `TransparentCell.transparency` because current maps happen
 * not to animate a wall, which is a fact about content rather than about cells.
 * If a field is merely quiet, leave it writable.
 *
 * **`private` means nothing outside the class touches it** — bookkeeping like
 * `DynamicBody.collisions`, `trackedCollisions` and `previousPos`, and helpers
 * only the class itself calls, like `DynamicBody.isCollisionTracked` and
 * `DisplaceableCell.takeNextCell`.
 *
 * A private helper asked exactly once, from the constructor, is not earning the
 * name — `Cell.isHorizontal`/`isVertical` were two of those, and reading as
 * general questions about a cell while being one line of construction logic is
 * what got them inlined.
 *
 * **`protected` means the class and its subclasses, and nothing else.** Reach
 * for it whenever that is the real audience: something the hierarchy needs and
 * callers do not. Two members qualify today —
 *
 * - `Body.reindex` — called by `setPos`, overridden by `DynamicBody`.
 * - `DynamicBody.facingAngle` — exists so `Player` can point `isFacing` at its
 *   camera rather than its body.
 *
 * An earlier version of this note told you not to use `protected` at all, on
 * the grounds that too few members qualified to earn a third modifier. That was
 * the wrong test. Pick the modifier that describes the member's real audience;
 * how many others happen to share it is not the question.
 *
 * A third qualified and then left the module entirely. `Body.state`/`setState`
 * were `protected` because only subclasses touched them — and *every* subclass
 * that did was in `engine/`, while physics never read a state at all. Marking
 * the audience correctly is what made it obvious the member was in the wrong
 * layer. They live on `DynamicEntity` and `DynamicCell` now.
 *
 * Public is what is left over — the module's actual surface, not a default.
 *
 * Visibility and `readonly` stack where both are true, and that is not a third
 * category: `collisions` is private and mutable, `Body.width` is public and
 * readonly, and a field can be both.
 *
 * If a field's visibility feels arbitrary, check whether it should exist at
 * all. `World` used to cache `maxCellX = width - 1` for `getCell`'s bounds
 * check; it was private only because nothing outside asked for cell-space
 * bounds, while the identical fact in world units (`maxMapX`) is public and
 * widely used. The question had no good answer because the field was redundant.
 *
 * **No field in this module is `_`-prefixed.** The prefix is only ever forced,
 * when an accessor cannot read a field of its own name — and the one accessor
 * pair here does not have that problem, because `x`/`y` are backed by `pos`,
 * which is a better name than `_x` would have been. If you find yourself
 * reaching for `_`, check whether the backing field wants a real name first.
 *
 * Relaxing a modifier because a new call site needs the field is these rules
 * working, not a breach of them. Until `engine/` is TypeScript, `checkJs:
 * false` hides the JS call sites, so `private` has to be checked by grepping —
 * exclude `core/ai` and `graph.grid[...]`, since `GridNode` has `weight`,
 * `parent` and `closed` fields whose names collide with these.
 *
 * **Accessors are for hiding a representation, not for enforcing an
 * invariant.** `Body.x`/`y` are the module's only ones: the position lives in
 * a `Point` at `Body.pos`, and the accessors keep the ~200 `body.x` call sites
 * in unchecked JavaScript working unchanged. They add no rule — they read and
 * write `pos.x` and nothing else. That is the legitimate use.
 *
 * An accessor added to *enforce* something is the suspicious kind, and both
 * attempts were removed:
 *
 * - `DynamicBody.velocity` — the limit belongs to how far a body may travel in
 *   one update, not to what a caller may ask for, so it stayed at the point of
 *   use in `update`.
 * - `DynamicBody.angle` — normalisation has to survive the raw arithmetic
 *   `engine/` does on the number, and a setter guards only assignment to one
 *   field. It belongs in an `Angle` **value type**, which carries the invariant
 *   everywhere the value goes, including into locals no setter could see. That
 *   needs `engine/` to be TypeScript first; until then the invariant stays with
 *   the callers, which is where it already was.
 *
 * `Body.pos` is that same idea working: an invariant belonging to the *value*
 * wants a value type. A position is a `Point`, so nothing loose can be passed
 * where one belongs — and `getDistanceTo(body.pos)` says what it means, which
 * `getDistanceTo(body)` never did.
 *
 * An invariant a setter cannot actually enforce belongs in a method — see
 * `Body.reindex`, which is deliberately not folded into the `x`/`y` setters,
 * because `DynamicBody.update` moves one axis at a time and would have to
 * bypass it.
 *
 * ## Absence
 *
 * `null` marks a slot that held a value and was cleared, or a lookup that
 * computed to nothing — `Body.parent` after `destroy()`,
 * `getLineShapeIntersectionDistance()` with no crossing. `undefined` marks
 * something never supplied — a constructor option left off, or a cell face the
 * map data never defined.
 *
 * A lookup that *cannot* compute to nothing should not offer the case at all.
 * `World.getCell` was the counter-example: nullable for out of bounds, which
 * only the two neighbour scans ever hit, and only because they walked a square
 * off the edge of the grid and dropped what came back. They clip now and it
 * throws, so nine call sites stopped dismissing a null that could not arrive.

 * `Ray` used to be the example here, carrying `Side | undefined` straight from
 * the map. It names a `Face` now and the absent case moved out with the rest of
 * the face data: whether a level drew that face is a question for whoever holds
 * the textures.
 *
 * Where the absent case shares a type with a real one, `null` is what keeps
 * them apart, and callers must test for it rather than for truthiness.
 * `getLineShapeIntersectionDistance()` is the live example: `0` is a real
 * crossing, from a line starting on the body's edge, so `if (distance)` drops a
 * point-blank hit. `contract` pins that distinction because both callers are
 * unchecked JavaScript.
 *
 * ## Changing any of this
 *
 * `npm run test:physics` compares the module against the last commit before
 * the TypeScript migration. A refactor must leave it reporting IDENTICAL; a
 * deliberate behaviour change updates the harness in the same commit, with the
 * divergence explained in `test/physics/README.md`.
 */
import type Point from './geometry/Point';

/** A line segment, between two positions. */
export interface Line {
  startPoint: Point;
  endPoint: Point;
}
