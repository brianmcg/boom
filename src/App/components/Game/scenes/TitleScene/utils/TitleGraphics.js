import { GraphicsCache } from '@game/core/graphics';
import { SCREEN } from '@constants/config';
import { BLACK } from '@constants/colors';
import { SceneGraphics } from '../../Scene';
import LogoSprite from '../sprites/LogoSprite';
import SparksSprite from '../sprites/SparksSprite';
import BackgroundContainer from '../containers/BackgroundContainer';
import ForegroundContainer from '../containers/ForegroundContainer';

export default class TitleGraphics extends SceneGraphics {
  static createBackgroundContainer(options) {
    const container = new BackgroundContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createForegroundContainer(options) {
    const container = new ForegroundContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createLogoSprite(options) {
    const sprite = new LogoSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createSparksSprite(options) {
    const sprite = new SparksSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createTitleSprites({ graphics, renderer }) {
    const { data, textures } = graphics;
    const { animations } = data;
    const { light, logo } = textures;
    const sparksTextures = animations.sparks.map(image => textures[image]);

    const logoSprite = TitleGraphics.createLogoSprite({ texture: logo });
    const lightSprite = TitleGraphics.createLogoSprite({ texture: light });

    const maskTexture = TitleGraphics.createMaskTexture({
      renderer,
      texture: logo,
    });

    const maskSprite = TitleGraphics.createLogoSprite({
      texture: maskTexture,
    });

    return {
      background: {
        background: TitleGraphics.createRectangleSprite({
          width: SCREEN.WIDTH,
          height: SCREEN.HEIGHT,
          color: BLACK,
        }),
        sparks: TitleGraphics.createSparksSprite({
          textures: sparksTextures,
        }),
      },
      foreground: {
        logo: logoSprite,
        light: lightSprite,
        mask: maskSprite,
      },
    };
  }
}
