import { createLevel } from './bodies';
import { createSprites } from './sprites';

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (resources) => {
  const level = createLevel(resources.data.map);
  const sprites = createSprites(level, resources);

  return { level, sprites };
};
