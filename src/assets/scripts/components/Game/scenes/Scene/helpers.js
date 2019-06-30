import { Sprite, BitmapText } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/fonts';
import { WHITE, RED } from '~/constants/colors';

/**
 * @module game/scenes/scene/helpers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.assets  The scene assets.
 * @param  {Array}  options.text    The scene text.
 * @return {Object}                 The parsed scene data.
 */
export const parse = ({ assets, text }) => {
  const { data, textures } = assets;
  const { images } = data;

  const labels = text.reduce((memo, key, index) => ({
    ...memo,
    [key]: new BitmapText({
      font: FONT_SIZES.SMALL,
      text: key,
      color: index ? WHITE : RED,
    }),
  }), {});

  const icon = new Sprite(textures[images.menu]);

  const menu = { icon, labels };

  return {
    sprites: { menu },
  };
};
