import { AnimatedSprite } from 'game/core/graphics';

/**
 * Class representing a bullet sprite.
 */
class BulletSprite extends AnimatedSprite {
  /**
   * Creates a bullet sprite.
   * @param  {Array}  textures       The animation textures.
   * @param  {World}  options.world  The world.
   * @param  {Bullet} options.bullet The bullet.
   */
  constructor(textures, { world, bullet }) {
    super(textures, {
      animationSpeed: 0.04,
    });

    this.zOrder = Number.MAX_VALUE;

    this.onComplete = () => {
      this.parent.removeChild(this);
      this.gotoAndStop(0);
      world.bullets = world.bullets.filter(({ index }) => index !== bullet.index);
      world.player.bullets.push(bullet);
    };
  }
}

export default BulletSprite;
