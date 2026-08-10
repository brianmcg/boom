let idCount = 0;

/**
 * A unique name for one object, of the form `ClassName_7`.
 *
 * One counter for everything that asks, which is what lets ids from different
 * hierarchies share a namespace without colliding — `WorldGraphics` builds its
 * sprite map from body ids and explosion ids together, keyed by string.
 *
 * Lived on `Body` until `Explosion` and `HitScan` wanted one. Neither is a
 * body — neither stands in the world, occupies a cell or collides — and
 * extending one just to be named is what moved this out. Identity is not
 * physics' business.
 */
export const generateId = (instance: object): string => {
  idCount += 1;

  return `${instance.constructor.name}_${idCount}`;
};
