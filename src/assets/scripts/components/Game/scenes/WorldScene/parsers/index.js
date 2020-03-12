import { createWorld } from './bodies';
import { createSprites } from './sprites';

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.graphics  The scene graphics.
 * @param  {Object} options.data      The scene data.
 * @param  {Object} options.text      The scene text.
 * @return {Object}                   The parsed scene data.
 */
export const parse = ({
  graphics,
  data,
  text,
  renderer,
}) => {
  const world = createWorld({
    data,
    graphics,
  });

  const sprites = createSprites({
    world,
    graphics,
    text,
    renderer,
  });

  return {
    world,
    sprites,
  };
};
