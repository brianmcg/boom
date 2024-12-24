import { GraphicsCache } from '@game/core/graphics';
import { SceneCreator } from '../../Scene';
import TopDownContainer from '../containers/TopDownContainer';
import MessageSprite from '../sprites/MessageSprite';
import ReviewContainer, { StatContainer } from '../containers/ReviewContainer';

import POVContainer, {
  OuterContainer,
  InnerContainer,
  MapContainer,
  PlayerContainer,
  HUDContainer,
} from '../containers/POVContainer';

import WallSprite from '../sprites/WallSprite';
import EntitySprite from '../sprites/EntitySprite';
import AnimatedEntitySprite from '../sprites/AnimatedEntitySprite';
import BackgroundSprite from '../sprites/BackgroundSprite';
import EnemySprite from '../sprites/EnemySprite';
import WeaponSprite from '../sprites/WeaponSprite';
import HUDKeySprite from '../sprites/HUDKeySprite';
import HUDSprite from '../sprites/HUDSprite';
import EffectSprite from '../sprites/EffectSprite';
import ExplosiveEntitySprite from '../sprites/ExplosiveEntitySprite';
import ProjectileSprite from '../sprites/ProjectileSprite';

export default class WorldSceneCreator extends SceneCreator {
  static createWallSprite(options) {
    const container = new WallSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createEntitySprite(options) {
    const container = new EntitySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createAnimatedEntitySprite(options) {
    const container = new AnimatedEntitySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createBackgroundParticle(options) {
    return new BackgroundSprite(options);
  }

  static createEnemySprite(options) {
    const container = new EnemySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createWeaponSprite(options) {
    const container = new WeaponSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createHUDKeySprite(options) {
    const container = new HUDKeySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createHUDSprite(options) {
    const container = new HUDSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createEffectSprite(options) {
    const container = new EffectSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createExplosiveEntitySprite(options) {
    const container = new ExplosiveEntitySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createProjectileSprite(options) {
    const container = new ProjectileSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createReviewContainer(options) {
    const container = new ReviewContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPOVContainer(options) {
    const container = new POVContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createTopDownContainer(options) {
    const container = new TopDownContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createStatContainer(options) {
    const container = new StatContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createOuterContainer(options) {
    const container = new OuterContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createInnerContainer(options) {
    const container = new InnerContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createMapContainer(options) {
    const container = new MapContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPlayerContainer(options) {
    const container = new PlayerContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createHUDContainer(options) {
    const container = new HUDContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createMessageSprite(options) {
    const sprite = new MessageSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }
}
