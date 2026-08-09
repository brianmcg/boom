export const AXES = {
  X: 'x',
  Y: 'y',
} as const;

export const TRANSPARENCY = {
  PARTIAL: 1,
  FULL: 2,
} as const;

export const FACES = {
  FRONT: 'front',
  LEFT: 'left',
  BACK: 'back',
  RIGHT: 'right',
  OVERLAY: 'overlay',
} as const;

/** The axis a cell is aligned to. Plain (non-door, non-push-wall) cells have none. */
export type Axis = (typeof AXES)[keyof typeof AXES];

/**
 * How far a ray gets through a {@link TransparentCell}. There is no NONE: a
 * cell rays do not pass through is not a `TransparentCell`, so absence is the
 * class and only the degree is a value.
 */
export type Transparency = (typeof TRANSPARENCY)[keyof typeof TRANSPARENCY];

/**
 * Which face of a cell a ray hit. The raycaster names one; what a face looks
 * like — its texture, how tall to draw it, the blood on it — is the game
 * layer's, and is kept there.
 */
export type Face = (typeof FACES)[keyof typeof FACES];
