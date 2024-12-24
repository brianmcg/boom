import { SCREEN } from '@constants/config';
import { BLACK } from '@constants/colors';
import TitleSceneCreator from './util/TitleSceneCreator';

export const parse = ({ graphics, renderer }) => {
  const { data, textures } = graphics;
  const { animations } = data;
  const { light, logo } = textures;
  const sparksTextures = animations.sparks.map(image => textures[image]);

  const logoSprite = TitleSceneCreator.createLogoSprite({ texture: logo });
  const lightSprite = TitleSceneCreator.createLogoSprite({ texture: light });

  const maskTexture = TitleSceneCreator.createMaskTexture({
    renderer,
    texture: logo,
  });

  const maskSprite = TitleSceneCreator.createLogoSprite({
    texture: maskTexture,
  });

  return {
    sprites: {
      background: {
        background: TitleSceneCreator.createRectangleSprite({
          width: SCREEN.WIDTH,
          height: SCREEN.HEIGHT,
          color: BLACK,
        }),
        sparks: TitleSceneCreator.createSparksSprite({
          textures: sparksTextures,
        }),
      },
      foreground: {
        logo: logoSprite,
        light: lightSprite,
        mask: maskSprite,
      },
    },
  };
};
