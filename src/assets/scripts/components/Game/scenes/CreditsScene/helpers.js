import { AnimatedSprite, BitmapText, Sprite } from '~/core/graphics';
import { CREDITS } from './constants';
import { FONT_SIZES } from '~/constants/font';
import { RED, WHITE } from '~/constants/colors';

/**
 * @module helpers
 */

/**
 * Create the scene sprites.
 * @param  {Object} resources The loaded resources.
 * @return {Object}           The scene sprites.
 */
export const createSprites = (resources) => {
  const { data, textures } = resources.scene;
  const { animations, sprites } = data;
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

  const message = new Sprite(textures[sprites.end]);

  const text = new BitmapText({
    font: FONT_SIZES.SMALL,
    text: 'Press space to continue',
    color: RED,
  });

  return {
    backgroundSprites: { smoke },
    scrollSprites: { credits, message },
    promptSprites: { text },
  };
};
