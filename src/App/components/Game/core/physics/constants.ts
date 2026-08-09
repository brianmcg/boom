export const AXES = {
  X: 'x',
  Y: 'y',
} as const;

export const TRANSPARENCY = {
  PARTIAL: 1,
  FULL: 2,
} as const;

/** The axis a cell is aligned to. Plain (non-door, non-push-wall) cells have none. */
export type Axis = (typeof AXES)[keyof typeof AXES];

/**
 * How far a ray gets through a {@link TransparentCell}. There is no NONE: a
 * cell rays do not pass through is not a `TransparentCell`, so absence is the
 * class and only the degree is a value.
 */
export type Transparency = (typeof TRANSPARENCY)[keyof typeof TRANSPARENCY];
