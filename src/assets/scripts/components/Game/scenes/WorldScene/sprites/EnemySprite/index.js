import AnimatedEntitySprite from '../AnimatedEntitySprite';

const STATES = {
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
    super(textureCollection[STATES.IDLE].tiles, {
      animationSpeed: 0.15,
    });

    enemy.onIdle(() => this.setAnimation(STATES.IDLE));
    enemy.onAlerted(() => this.setAnimation(STATES.IDLE));
    enemy.onPatrolling(() => this.setAnimation(STATES.MOVING));
    enemy.onChasing(() => this.setAnimation(STATES.MOVING));
    enemy.onAiming(() => this.setAnimation(STATES.AIMING));
    enemy.onAttacking(() => this.setAnimation(STATES.ATTACKING));
    enemy.onHurting(() => this.setAnimation(STATES.HURTING));
    enemy.onDead(() => this.setAnimation(STATES.DEAD));

    this.textureCollection = textureCollection;

    this.onComplete = () => {
      if (enemy.isDead() && enemy.corpseRemains) {
        this.visible = false;
      }
    };
  }

  /**
   * Set the animation.
   * @param {String}  state The animation state
   * @param {Boolean} loop  Should the animation loop.
   */
  setAnimation(state) {
    this.textures = this.textureCollection[state].tiles;
    this.loop = this.textureCollection[state].props.loop;
  }
}

export default EnemySprite;
