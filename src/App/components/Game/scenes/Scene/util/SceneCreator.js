import { GraphicsCreator, GraphicsCache } from '@game/core/graphics';
import MainContainer from '../containers/MainContainer';
import MenuContainer from '../containers/MenuContainer';
import PromptContainer from '../containers/PromptContainer';
import MenuIconSprite from '../sprites/MenuIconSprite';

export default class SceneCreator extends GraphicsCreator {
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
}
