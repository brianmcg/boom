import { AnimatedSprite, TextSprite } from 'game/core/graphics';
import { GAME_FONT } from 'game/constants/assets';
import { FONT_SIZES } from 'game/constants/fonts';
import { RED, WHITE } from 'game/constants/colors';

/**
 * @module game/scenes/credits-scene/parsers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.graphics  The scene graphics.
 * @param  {Array}  options.text      The scene text.
 * @return {Object}                   The parsed scene data.
 */
export const parse = ({ graphics, text }) => {
  const { data, textures } = graphics;
  const { animations } = data;
  const smokeTextures = animations.smoke.map(image => textures[image]);

  const smoke = new AnimatedSprite(smokeTextures, {
    animationSpeed: 0.2,
    loop: true,
    alpha: 0.5,
  });

  const credits = text.credits.reduce((memo, credit) => {
    const key = new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: credit.key,
      color: RED,
      anchor: 0.5,
    });

    const values = credit.values.map(value => new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.SMALL,
      text: value,
      color: WHITE,
      anchor: 0.5,
    }));

    memo.push([key, ...values]);

    return memo;
  }, []);

  const end = new TextSprite({
    fontName: GAME_FONT.NAME,
    fontSize: FONT_SIZES.LARGE,
    text: text.end,
    color: WHITE,
    anchor: 0.5,
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
    },
  };
};
