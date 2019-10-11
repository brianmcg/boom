import { DEG } from '~/core/physics';
import AnimatedEntitySprite from '../AnimatedEntitySprite';

const ANIMATIONS = {
  ATTACKING: 'attacking',
  DYING: 'dying',
  HURTING: 'hurting',
  MOVING: 'moving',
  SHOOTING: 'shooting',
  STANDING: 'standing',
};

// const STATES = {
//   AIMING: 'aim',
//   CHASING: 'chase',
//   DEAD: 'dead',
//   FIRING: 'fire',
//   HURT: 'hurt',
//   IDLE: 'idle',
//   PATROLLING: 'patrol',
//   READY: 'ready',
// };

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
    super(textureCollection[MANIMATIONS.OVING][0], {
      animationSpeed: 0.125,
      loop: true,
    });

    this.enemy = enemy;
    this.angleTextures = 0;
    this.actionTextures = ANIMATIONS.MOVING;
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

    if (enemy.isDead()) {
      this.loop = false;
      this.updateTextures(ANIMATIONS.DYING, 0, 0);
    } else if (enemy.isHurt()) {
      this.loop = false;
      this.updateTextures(ANIMATIONS.HURTING, 0, 0);
    } else if (enemy.isFiring()) {
      this.loop = false;
      this.updateTextures(ANIMATIONS.SHOOTING, 0, 0);
    } else if (enemy.isReady()) {
      this.loop = false;
      this.updateTextures(ANIMATIONS.ATTACKING, 0, 0);
    } else if (enemy.isAiming()) {
      this.loop = false;
      this.updateTextures(ANIMATIONS.ATTACKING, 0, 0);
    } else if (enemy.isPatrolling() || enemy.isChasing()) {
      this.loop = true;
      this.updateTextures(ANIMATIONS.MOVING, Math.floor(enemy.angleDiff / DEG[45]), this.currentFrame);
    } else {
      this.loop = false;
      this.updateTextures(ANIMATIONS.STANDING, Math.floor(enemy.angleDiff / DEG[45]), 0);
    }
  }

  updateTextures(actionTextures, angleTextures, frame, loop) {
    if (this.actionTextures !== actionTextures || this.angleTextures !== angleTextures) {
      this.loop = loop;
      this.angleTextures = angleTextures;
      this.actionTextures = actionTextures;
      this.textures = this.textureCollection[actionTextures][angleTextures];
      this.texture = this.textures[frame];
      this.gotoAndPlay(frame);
    }
  }
}

export default EnemySprite;
