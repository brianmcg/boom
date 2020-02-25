import LogoSprite from '../sprites/LogoSprite';
import SmokeSprite from '../sprites/SmokeSprite';
import SparksSprite from '../sprites/SparksSprite';

/**
 * @module game/scenes/title-scene/parsers
 */

/**
 * Parses the loaded scene resources.
 * @param  {Object} options.graphics    The scene graphics.
 * @return {Object}                     The parsed scene data.
 */
export const parse = ({ graphics }) => {
  const { data, textures } = graphics;
  const { animations } = data;

  const smokeTextures = animations.smoke.map(image => textures[image]);
  const sparksTextures = animations.sparks.map(image => textures[image]);
  const logoTextures = animations.logo.map(image => textures[image]);

  return {
    sprites: {
      background: {
        smoke: new SmokeSprite(smokeTextures, { alpha: 0.8 }),
        sparks: new SparksSprite(sparksTextures),
      },
      foreground: {
        logo: new LogoSprite(logoTextures),
      },
    },
  };
};
