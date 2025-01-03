import { GraphicsCache } from '@game/core/graphics';
import { SceneCreator } from '../../Scene';
import BackgroundContainer from '../containers/BackgroundContainer';
import ScrollContainer from '../containers/ScrollContainer';

export default class CreditsSceneCreator extends SceneCreator {
  static createBackgroundContainer(options) {
    const container = new BackgroundContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createScrollContainer(options) {
    const container = new ScrollContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }
}
