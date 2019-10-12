import { DEG } from '~/core/physics';
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
   * @param  {Array}  textureCollection The textures for the sprite.
   */
  constructor(enemy, textureCollection = []) {
    super(textureCollection[ACTIONS.MOVING][0], {
      animationSpeed: 0.125,
      loop: true,
    });

    this.enemy = enemy;
    this.angleTextures = 0;
    this.actionTextures = ACTIONS.MOVING;
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
      this.updateTextures({
        actionTextures: ACTIONS.DYING,
        angleTextures: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isHurt()) {
      this.updateTextures({
        actionTextures: ACTIONS.HURTING,
        angleTextures: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isFiring()) {
      this.updateTextures({
        actionTextures: ACTIONS.SHOOTING,
        angleTextures: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isReady()) {
      this.updateTextures({
        actionTextures: ACTIONS.ATTACKING,
        angleTextures: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isAiming()) {
      this.updateTextures({
        actionTextures: ACTIONS.ATTACKING,
        angleTextures: 0,
        frame: 0,
        loop: false,
      });
    } else if (enemy.isPatrolling() || enemy.isChasing()) {
      this.updateTextures({
        actionTextures: ACTIONS.MOVING,
        angleTextures: Math.floor(enemy.angleDiff / DEG[45]),
        frame: this.currentFrame,
        loop: true,
      });
    } else {
      this.updateTextures({
        actionTextures: ACTIONS.STANDING,
        angleTextures: Math.floor(enemy.angleDiff / DEG[45]),
        frame: 0,
        loop: false,
      });
    }
  }

  updateTextures({
    actionTextures,
    angleTextures,
    frame,
    loop,
  }) {
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
