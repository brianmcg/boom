import { Sprite, TextSprite, RectangleSprite } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/fonts';
import { WHITE, RED, BLACK } from '~/constants/colors';
import { SCREEN } from '~/constants/config';

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

  const background = new RectangleSprite({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    color: BLACK,
    alpha: 0.8,
  });

  const labels = text.reduce((memo, key, index) => ({
    ...memo,
    [key]: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: key,
      color: index ? WHITE : RED,
    }),
  }), {});

  const iconHeight = labels[Object.keys(labels)[0]].height;

  const icon = new Sprite(textures[images.menu]);

  icon.height = iconHeight;
  icon.width = iconHeight;

  const menu = {
    icon,
    labels,
    background,
  };

  return {
    sprites: {
      menu,
    },
  };
};
