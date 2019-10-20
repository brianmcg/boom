import { AnimatedSprite, BitmapText } from '~/core/graphics';
import { FONT_SIZES } from '~/constants/fonts';
import { RED, WHITE } from '~/constants/colors';

/**
 * @module game/scenes/credits-scene/parsers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.assets  The scene assets.
 * @param  {Array}  options.text    The scene text.
 * @return {Object}                 The parsed scene data.
 */
export const parse = ({ assets, text }) => {
  const { data, textures } = assets;
  const { animations } = data;
  const smokeTextures = animations.smoke.map(image => textures[image]);

  const smoke = new AnimatedSprite(smokeTextures, {
    animationSpeed: 0.2,
    tint: RED,
    loop: true,
    alpha: 0.75,
  });

  const credits = text.credits.reduce((memo, credit) => {
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

  const end = new BitmapText({
    font: FONT_SIZES.LARGE,
    text: text.end,
    color: WHITE,
  });

  const label = new BitmapText({
    font: FONT_SIZES.SMALL,
    text: text.continue,
    color: RED,
  });

  return {
    sprites: {
      background: {
        smoke,
      },
      scroll: {
        credits,
        end,
      },
      prompt: {
        label,
      },
    },
  };
};
