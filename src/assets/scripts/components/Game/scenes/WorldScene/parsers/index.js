import { createWorld } from './bodies';
import { createSprites } from './sprites';

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.graphics  The scene graphics.
 * @param  {Object} options.data      The scene data.
 * @param  {Object} options.text      The scene text.
 * @param  {Player} options.player    The player.
 * @param  {Object} options.stats     The world stats.
 * @return {Object}                   The parsed scene data.
 */
export const parse = ({
  graphics,
  data,
  text,
  player,
  stats,
}) => {
  const world = createWorld(data, stats, player);
  const sprites = createSprites(world, graphics, text);

  return {
    world,
    sprites,
  };
};
