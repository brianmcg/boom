import { AnimatedSprite, BitmapText } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/font';
import { RED, WHITE } from '~/constants/colors';
import { CREDITS, TEXT } from './constants';

/**
 * @module helpers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (resources) => {
  const { data, textures } = resources;
  const { animations } = data;
  const smokeTextures = animations.smoke.map(image => textures[image]);

  const smoke = new AnimatedSprite(smokeTextures, {
    animationSpeed: 0.2,
    tint: RED,
    loop: true,
    alpha: 0.75,
  });

  const credits = CREDITS.reduce((memo, credit) => {
    const key = new BitmapText({
      font: FONT_SIZES.MEDIUM,
      text: credit.key,
      color: RED,
    });

    const values = credit.values.map(value => new BitmapText({
      font: FONT_SIZES.SMALL,
      text: value,
      color: WHITE,
    }));

    memo.push([key, ...values]);

    return memo;
  }, []);

  const message = new BitmapText({
    font: FONT_SIZES.LARGE,
    text: TEXT.END,
    color: WHITE,
  });

  const text = new BitmapText({
    font: FONT_SIZES.SMALL,
    text: TEXT.CONTINUE,
    color: RED,
  });

  return {
    sprites: {
      background: { smoke },
      scroll: { credits, message },
      prompt: { text },
    },
  };
};
