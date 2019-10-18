import { FONT_SIZES } from '~/constants/fonts';
import { RED } from '~/constants/colors';
import { BitmapText } from '~/core/graphics';
import LogoSprite from './sprites/LogoSprite';
import SmokeSprite from './sprites/SmokeSprite';
import SparksSprite from './sprites/SparksSprite';

/**
 * @module game/scenes/title-scene/helpers
 */

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

  const logo = new LogoSprite(textures[images.logo]);
  const smoke = new SmokeSprite(smokeTextures);
  const sparks = new SparksSprite(sparksTextures);

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
