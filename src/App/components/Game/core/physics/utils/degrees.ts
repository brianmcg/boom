/**
 * Degrees to radians, precomputed.
 *
 * Its own module so it can sit below everything else: `Point` and the
 * raycaster both need it, and routing it through either of them would put a
 * cycle between the two.
 */
const DEGREES = [...Array(361).keys()].map(
  degrees => (degrees * Math.PI) / 180
);

export const degrees = (value: number): number => DEGREES[value];

export const DEG_90 = degrees(90);
export const DEG_180 = degrees(180);
export const DEG_270 = degrees(270);
export const DEG_360 = degrees(360);
