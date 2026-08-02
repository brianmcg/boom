const D = 1;
const D2 = Math.sqrt(2);

export const manhattan = (current, goal) => {
  const d1 = Math.abs(goal.x - current.x);
  const d2 = Math.abs(goal.y - current.y);
  return d1 + d2;
};

export const diagonal = (current, goal) => {
  const d1 = Math.abs(goal.x - current.x);
  const d2 = Math.abs(goal.y - current.y);
  return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
};

export const euclidean = (current, goal) => {
  const a = current.x - goal.x;
  const b = current.y - goal.y;

  return Math.sqrt(a * a + b * b);
};
