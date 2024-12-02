import { SCREEN } from '@constants/config';
import { BLACK } from '@constants/colors';
import { GraphicsCreator } from '@game/core/graphics';
import LogoSprite from './sprites/LogoSprite';
import SparksSprite from './sprites/SparksSprite';

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
          color: BLACK,
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
