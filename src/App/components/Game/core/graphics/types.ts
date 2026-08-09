/**
 * Shared vocabulary for the graphics module — types belonging to no single
 * file. A type with an obvious owner goes with its owner, the way
 * `core/physics/types.ts` puts it.
 */

/**
 * How a sprite is anchored, in the two shapes the wrappers accept: one number
 * for both axes, or a pair. Pixi's `ObservablePoint.set` takes them
 * positionally, so the pair has to be a tuple rather than `number[]` for the
 * spread at the call sites to typecheck.
 */
export type Anchor = number | [number, number];
