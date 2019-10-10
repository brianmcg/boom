import { DEG } from '~/core/physics';
import AnimatedEntitySprite from '../AnimatedEntitySprite';

const ATTACKING = 'attacking';

const DYING = 'dying';

const HURTING = 'hurting';

const MOVING = 'moving';

const SHOOTING = 'shooting';

const STANDING = 'standing';

/**
 * Class representing an EnemySprite.
 * @extends {PIXI.extras.AnimatedSprite}
 */
class EnemySprite extends AnimatedEntitySprite {
  /**
   * Creates an EnemySprite.
   * @param  {Array}  textureCollection The textures for the sprite.
   */
  constructor(enemy, textureCollection = []) {
    super(textureCollection[MOVING][0], {
      animationSpeed: 0.125,
      loop: true,
    });

    this.enemy = enemy;
    this.currentAngleTextures = 0;
    this.currentActionTextures = MOVING;
    this.textureCollection = textureCollection;
  }

  /**
   * Update the animation.
   * @param  {Enemy}  enemy  The enemy entity.
   * @param  {Player} player The player entity.
   * @return {undefined}
   */
  animate() {
    const { enemy } = this;
    const { player } = enemy.world;

    let newAngleTextures;
    let newActionTextures;
    let newAngle;
    let frame;
    let loop;

    if (enemy.isDead()) {
      newActionTextures = DYING;
      frame = 0;
      loop = false;
      newAngleTextures = 0;
    } else if (enemy.isHurt()) {
      newActionTextures = HURTING;
      frame = 0;
      loop = false;
      newAngleTextures = 0;
    } else if (enemy.isFiring()) {
      newActionTextures = SHOOTING;
      loop = false;
      frame = 0;
      newAngleTextures = 0;
    } else if (enemy.isReady()) {
      newActionTextures = ATTACKING;
      loop = false;
      frame = 0;
      newAngleTextures = 0;
    } else if (enemy.isAiming()) {
      newActionTextures = ATTACKING;
      loop = false;
      frame = 0;
      newAngleTextures = 0;
    } else if (enemy.isPatrolling() || enemy.isChasing()) {
      newActionTextures = MOVING;
      loop = true;
      frame = this.currentFrame;
      newAngle = enemy.angle - player.angle + DEG[203];
      if (newAngle < 0) {
        newAngle += DEG[360];
      }
      if (newAngle >= DEG[360]) {
        newAngle -= DEG[360];
      }
      newAngleTextures = Math.floor(newAngle / DEG[45]);
    } else {
      newActionTextures = STANDING;
      loop = false;
      frame = 0;
      newAngle = enemy.angle - player.angle + DEG[203];
      if (newAngle < 0) {
        newAngle += DEG[360];
      }
      if (newAngle >= DEG[360]) {
        newAngle -= DEG[360];
      }
      newAngleTextures = Math.floor(newAngle / DEG[45]);
    }

    if (this.currentActionTextures !== newActionTextures
      || this.currentAngleTextures !== newAngleTextures
    ) {
      this.currentAngleTextures = newAngleTextures;
      this.currentActionTextures = newActionTextures;
      this.textures = this.textureCollection[newActionTextures][newAngleTextures];
      this.texture = this.textures[frame];
      this.loop = loop;
      this.gotoAndPlay(frame);
    }
  }
}

export default EnemySprite;
