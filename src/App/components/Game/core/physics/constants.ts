export const AXES = {
  X: 'x',
  Y: 'y',
} as const;

export const TRANSPARENCY = {
  NONE: 0,
  PARTIAL: 1,
  FULL: 2,
} as const;

/** The axis a cell is aligned to. Plain (non-door, non-push-wall) cells have none. */
export type Axis = (typeof AXES)[keyof typeof AXES];

/**
 * How a ray treats a cell it hits: NONE stops the ray, PARTIAL and FULL let it
 * continue into the next wall layer.
 */
export type Transparency = (typeof TRANSPARENCY)[keyof typeof TRANSPARENCY];
