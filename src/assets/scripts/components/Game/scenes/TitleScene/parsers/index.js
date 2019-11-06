import LogoSprite from '../sprites/LogoSprite';
import SmokeSprite from '../sprites/SmokeSprite';
import SparksSprite from '../sprites/SparksSprite';

/**
 * @module game/scenes/title-scene/parsers
 */

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.assets  The scene assets.
 * @param  {Array}  options.text    The scene text.
 * @return {Object}                 The parsed scene data.
 */
export const parse = (assets) => {
  const { data, textures } = assets;
  const { animations, images } = data;

  const smokeTextures = animations.smoke.map(image => textures[image]);
  const sparksTextures = animations.sparks.map(image => textures[image]);

  return {
    sprites: {
      background: {
        smoke: new SmokeSprite(smokeTextures),
        sparks: new SparksSprite(sparksTextures),
        logo: new LogoSprite(textures[images.logo]),
      },
    },
  };
};
