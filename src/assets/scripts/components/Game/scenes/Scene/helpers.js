import { Sprite } from '~/core/graphics';

/**
 * @module helpers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (assets) => {
  const { data, textures } = assets;
  const { sprites } = data;

  return {
    sprites: {
      menu: {
        icon: new Sprite(textures[sprites.menu]),
      },
    },
  };
};
