import { RectangleSprite } from '~/core/graphics';

/**
 * @module game/scenes/scene/containers/loading-container/helpers
 */

/**
 * Create the sprites.
 * @param  {Number} size   The size of each sprite.
 * @param  {Number} number The number of sprites.
 * @return {Array}         An array of sprites.
 */
export const createSprites = (size, number = 0) => (
  [...Array(number)].map(() => new RectangleSprite({
    width: size,
    height: size,
  }))
);
