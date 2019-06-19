import { FONT_SIZES } from '~/constants/fonts';
import { RED } from '~/constants/colors';
import { Sprite, AnimatedSprite, BitmapText } from '~/core/graphics';

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.assets  The scene assets.
 * @param  {Array}  options.text    The scene text.
 * @return {Object}                 The parsed scene data.
 */
export const parse = ({ assets, text }) => {
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
  const label = new BitmapText({
    font: FONT_SIZES.SMALL,
    text: text.PRESS_SPACE_TO_START,
    color: RED,
  });

  return {
    sprites: {
      background: { smoke, sparks, logo },
      prompt: { label },
    },
  };
};
