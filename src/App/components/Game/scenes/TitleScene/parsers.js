import { SCREEN } from '@constants/config';
import { RED } from '@constants/colors';
import { GraphicsCreator } from '@game/core/graphics';
import LogoSprite from './sprites/LogoSprite';
import SparksSprite from './sprites/SparksSprite';

/**
 * @module game/scenes/title-scene/parsers
 */

/**
 * Parses the loaded scene resources.
 * @param  {Object} options.graphics    The scene graphics.
 * @return {Object}                     The parsed scene data.
 */
export const parse = ({ graphics, renderer }) => {
  const { data, textures } = graphics;
  const { animations } = data;
  const { light, logo } = textures;
  const sparksTextures = animations.sparks.map(image => textures[image]);

  const logoSprite = new LogoSprite(logo);
  const lightSprite = new LogoSprite(light);

  const maskTexture = GraphicsCreator.createMaskTexture({
    renderer,
    texture: logo,
  });

  const maskSprite = new LogoSprite(maskTexture);

  return {
    sprites: {
      background: {
        background: GraphicsCreator.createRectangleSprite({
          width: SCREEN.WIDTH,
          height: SCREEN.HEIGHT,
          color: RED,
          alpha: 0.05,
        }),
        sparks: new SparksSprite(sparksTextures),
      },
      foreground: {
        logo: logoSprite,
        light: lightSprite,
        mask: maskSprite,
      },
    },
  };
};
