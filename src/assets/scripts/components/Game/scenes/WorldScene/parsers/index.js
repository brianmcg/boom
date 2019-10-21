import { createWorld } from './bodies';
import { createSprites } from './sprites';

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (resources) => {
  const world = createWorld(resources.data.map);
  const sprites = createSprites(world, resources);

  return { world, sprites };
};
