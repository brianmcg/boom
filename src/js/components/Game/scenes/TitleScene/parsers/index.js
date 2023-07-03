import { SCREEN } from '@game/constants/config';
import { RED } from '@game/constants/colors';
import { RectangleSprite } from '@game/core/graphics';
import LogoSprite from '../sprites/LogoSprite';
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
  const { light, logo, mask } = textures;
  const sparksTextures = animations.sparks.map(image => textures[image]);

  return {
    sprites: {
      background: {
        background: new RectangleSprite({
          width: SCREEN.WIDTH,
          height: SCREEN.HEIGHT,
          color: RED,
          alpha: 0.05,
        }),
        sparks: new SparksSprite(sparksTextures),
      },
      foreground: {
        logo: new LogoSprite(logo),
        light: new LogoSprite(light),
        mask: new LogoSprite(mask),
      },
    },
  };
};
