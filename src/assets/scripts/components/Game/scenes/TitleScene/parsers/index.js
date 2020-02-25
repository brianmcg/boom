import { SCREEN } from 'game/constants/config';
import { BLACK } from 'game/constants/colors';
import { RectangleSprite } from 'game/core/graphics';
import LogoSprite from '../sprites/LogoSprite';
import SmokeSprite from '../sprites/SmokeSprite';

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
  const logoTextures = animations.logo.map(image => textures[image]);

  return {
    sprites: {
      background: {
        background: new RectangleSprite({
          width: SCREEN.WIDTH,
          height: SCREEN.HEIGHT,
          color: BLACK,
        }),
        smoke: new SmokeSprite(smokeTextures),
      },
      foreground: {
        logo: new LogoSprite(logoTextures),
      },
    },
  };
};
