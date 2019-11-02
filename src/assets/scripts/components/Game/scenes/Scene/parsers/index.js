import { Sprite, TextSprite } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/fonts';
import { WHITE, RED } from '~/constants/colors';

/**
 * @module game/scenes/scene/parsers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.assets  The scene assets.
 * @param  {Array}  options.text    The scene text.
 * @return {Object}                 The parsed scene data.
 */
export const parse = (assets, text) => {
  const { data, textures } = assets;
  const { images } = data;

  const labels = text.reduce((memo, key, index) => ({
    ...memo,
    [key]: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: key,
      color: index ? WHITE : RED,
    }),
  }), {});

  const height = labels[Object.keys(labels)[0]].height;

  const icon = new Sprite(textures[images.menu]);

  icon.height = height;
  icon.width = height;

  const menu = { icon, labels };

  return {
    sprites: {
      menu,
    },
  };
};
