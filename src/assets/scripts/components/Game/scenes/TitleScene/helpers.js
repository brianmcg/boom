import { FONT_SIZES } from '~/constants/font';
import { RED } from '~/constants/colors';
import { Sprite, AnimatedSprite, BitmapText } from '~/core/graphics';

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
  const { animations, images } = data;
  const smokeTextures = animations.smoke.map(image => textures[image]);
  const sparksTextures = animations.sparks.map(image => textures[image]);
  const logo = new Sprite(textures[images.logo]);
  const smoke = new AnimatedSprite(smokeTextures, {
    animationSpeed: 0.2,
    tint: RED,
    loop: true,
    alpha: 0.75,
  });
  const sparks = new AnimatedSprite(sparksTextures, {
    animationSpeed: 0.4,
    loop: true,
  });
  const text = new BitmapText({
    font: FONT_SIZES.SMALL,
    text: 'Press space to start',
    color: RED,
  });

  return {
    sprites: {
      background: { smoke, sparks, logo },
      prompt: { text },
    },
  };
};
