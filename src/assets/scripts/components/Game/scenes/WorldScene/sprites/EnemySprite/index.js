import { DEG } from 'game/core/physics';
import AnimatedEntitySprite from '../AnimatedEntitySprite';

const ACTIONS = {
  ATTACKING: 'attacking',
  DYING: 'dying',
  HURTING: 'hurting',
  MOVING: 'moving',
  SHOOTING: 'shooting',
  STANDING: 'standing',
};

/**
 * Class representing an EnemySprite.
 * @extends {AnimatedEntitySprite}
 */
class EnemySprite extends AnimatedEntitySprite {
  /**
   * Creates an EnemySprite.
   * @param  {Enemy}  enemy             The enemy.
   * @param  {Array}  textureCollection The textures for the sprite.
   */
  constructor(enemy, textureCollection = []) {
    super(textureCollection[ACTIONS.MOVING][0], {
      animationSpeed: 0.125,
      loop: true,
    });

    this.enemy = enemy;
    this.angleId = 0;
    this.actionId = ACTIONS.MOVING;
    this.textureCollection = textureCollection;
  }

  /**
   * Animate the sprite.
   */
  animate() {
    const { enemy } = this;

    if (enemy.isDead()) {
      this.updateTextures({
        actionId: ACTIONS.DYING,
        angleId: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isHurt()) {
      this.updateTextures({
        actionId: ACTIONS.HURTING,
        angleId: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isAttacking()) {
      this.updateTextures({
        actionId: ACTIONS.SHOOTING,
        angleId: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isReady()) {
      this.updateTextures({
        actionId: ACTIONS.ATTACKING,
        angleId: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isAiming()) {
      this.updateTextures({
        actionId: ACTIONS.ATTACKING,
        angleId: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isPatrolling() || enemy.isChasing()) {
      this.updateTextures({
        actionId: ACTIONS.MOVING,
        angleId: Math.floor(enemy.angleDiff / DEG[45]),
        frame: this.currentFrame,
        loop: true,
      });
    } else {
      this.updateTextures({
        actionId: ACTIONS.STANDING,
        angleId: Math.floor(enemy.angleDiff / DEG[45]),
        frame: 0,
        loop: false,
      });
    }
  }

  /**
   * Update the sprite textures.
   * @param  {String}   options.actionId The id of the action.
   * @param  {String}   options.angleId  The id of the angle.
   * @param  {Number}   options.frame    The frame number.
   * @param  {Boolean}  options.loop     The loop options.
   */
  updateTextures({
    actionId,
    angleId,
    frame,
    loop,
  }) {
    if (this.actionId !== actionId || this.angleId !== angleId) {
      this.loop = loop;
      this.angleId = angleId;
      this.actionId = actionId;
      this.textures = this.textureCollection[actionId][angleId];
      this.texture = this.textures[frame];
      this.gotoAndPlay(frame);
    }
  }
}

export default EnemySprite;
