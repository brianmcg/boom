import { GraphicsCreator, GraphicsCache } from '@game/core/graphics';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { RED, BLACK } from '@constants/colors';
import { SCREEN } from '@constants/config';
import MainContainer from '../containers/MainContainer';
import MenuContainer from '../containers/MenuContainer';
import PromptContainer from '../containers/PromptContainer';
import MenuIconSprite from '../sprites/MenuIconSprite';

export default class SceneGraphics extends GraphicsCreator {
  static createMenuIconSprite(options) {
    const sprite = new MenuIconSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createMainContainer(options) {
    const container = new MainContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createMenuContainer(options) {
    const container = new MenuContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPromptContainer(options) {
    const container = new PromptContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPromptSprite(text) {
    return SceneGraphics.createTextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.SMALL,
      text,
      color: RED,
      anchor: 0.5,
    });
  }

  static createMenuSprites(menu, textures, animations) {
    const background = SceneGraphics.createRectangleSprite({
      width: SCREEN.WIDTH * 1.5,
      height: SCREEN.HEIGHT * 1.5,
      color: BLACK,
      alpha: 0.75,
    });

    const labels = Object.entries(menu).reduce(
      (memo, [key, value]) => ({
        ...memo,
        [key]: SceneGraphics.createTextSprite({
          fontFamily: GAME_FONT.NAME,
          fontSize: FONT_SIZES.SMALL,
          text: value,
          anchor: [0, 0.5],
        }),
      }),
      {}
    );

    const icon = SceneGraphics.createMenuIconSprite({
      textures: animations.skull.map(image => textures[image]),
      size: Object.values(labels)[0].height,
    });

    return { icon, labels, background };
  }

  static createSceneSprites({ graphics, text }) {
    const { data, textures } = graphics;
    const { animations } = data;

    return {
      menu: SceneGraphics.createMenuSprites(text.menu, textures, animations),
      prompt: SceneGraphics.createPromptSprite(text.prompt),
    };
  }
}
