/**
 * @module game/core/ai/heuristics
 */

/**
 * The manhattan heuristic.
 * @param  {Object} pos0 The first coordinates.
 * @param  {Object} pos1 The second coordinates.
 * @return {Number}      The cost.
 */
export const manhattan = (pos0, pos1) => {
  const d1 = Math.abs(pos1.x - pos0.x);
  const d2 = Math.abs(pos1.y - pos0.y);
  return d1 + d2;
};

/**
 * The diagonal heuristic.
 * @param  {Object} pos0 The first coordinates.
 * @param  {Object} pos1 The second coordinates.
 * @return {Number}      The cost.
 */
export const diagonal = (pos0, pos1) => {
  const D = 1;
  const D2 = Math.sqrt(2);
  const d1 = Math.abs(pos1.x - pos0.x);
  const d2 = Math.abs(pos1.y - pos0.y);
  return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
};
