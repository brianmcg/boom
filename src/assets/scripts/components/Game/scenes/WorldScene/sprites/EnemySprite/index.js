import AnimatedEntitySprite from '../AnimatedEntitySprite';

const ACTIONS = {
  IDLE: 'idle',
  MOVING: 'moving',
  AIMING: 'aiming',
  ATTACKING: 'attacking',
  HURTING: 'hurting',
  DYING: 'dying',
  DEAD: 'dead',
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
    super(textureCollection[ACTIONS.IDLE], {
      animationSpeed: 0.125,
      loop: true,
    });

    this.enemy = enemy;
    this.actionId = ACTIONS.IDLE;
    this.textureCollection = textureCollection;
  }

  /**
   * Animate the sprite.
   */
  animate() {
    const { enemy } = this;

    if (enemy.isIdle()) {
      this.updateTextures({ actionId: ACTIONS.IDLE });
    } else if (enemy.isMoving()) {
      this.updateTextures({ actionId: ACTIONS.MOVING, loop: true });
    } else if (enemy.isAiming()) {
      this.updateTextures({ actionId: ACTIONS.AIMING });
    } else if (enemy.isAttacking()) {
      this.updateTextures({ actionId: ACTIONS.ATTACKING });
    } else if (enemy.isHurting()) {
      this.updateTextures({ actionId: ACTIONS.HURTING });
    } else {
      this.updateTextures({ actionId: ACTIONS.DEAD });
    }
  }

  /**
   * Update the sprite textures.
   * @param  {String}   options.actionId The id of the action.
   * @param  {Boolean}  options.loop     The loop options.
   */
  updateTextures({ actionId, loop }) {
    if (this.actionId !== actionId) {
      this.loop = loop;
      this.actionId = actionId;
      this.textures = this.textureCollection[this.actionId];
      this.texture = this.textures[0];
      this.gotoAndPlay(0);
    }
  }
}

export default EnemySprite;
