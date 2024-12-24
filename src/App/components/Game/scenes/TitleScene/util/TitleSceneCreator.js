import { GraphicsCache } from '@game/core/graphics';
import { SceneCreator } from '../../Scene';

import LogoSprite from '../sprites/LogoSprite';
import SparksSprite from '../sprites/SparksSprite';

import BackgroundContainer from '../containers/BackgroundContainer';
import ForegroundContainer from '../containers/ForegroundContainer';

export default class TitleSceneCreator extends SceneCreator {
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
}
