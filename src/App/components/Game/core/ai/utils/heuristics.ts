const D = 1;
const D2 = Math.sqrt(2);

/**
 * The only thing a heuristic may look at.
 *
 * Narrower than {@link GridNode} on purpose. A* needs its heuristic to be
 * *admissible* — never an overestimate of the remaining cost — and that holds
 * only while the estimate depends on position alone. Taking the whole node
 * would put `weight`, `g` and `h` in reach of a function that must not consult
 * them.
 */
export interface Coordinates {
  x: number;
  y: number;
}

/** An estimate of the cost from `current` to `goal`. */
export type Heuristic = (current: Coordinates, goal: Coordinates) => number;

export const manhattan: Heuristic = (current, goal) => {
  const d1 = Math.abs(goal.x - current.x);
  const d2 = Math.abs(goal.y - current.y);
  return d1 + d2;
};

export const diagonal: Heuristic = (current, goal) => {
  const d1 = Math.abs(goal.x - current.x);
  const d2 = Math.abs(goal.y - current.y);
  return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
};

export const euclidean: Heuristic = (current, goal) => {
  const a = current.x - goal.x;
  const b = current.y - goal.y;

  return Math.sqrt(a * a + b * b);
};
