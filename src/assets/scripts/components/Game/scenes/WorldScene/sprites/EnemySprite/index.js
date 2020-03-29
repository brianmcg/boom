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
    super(textureCollection[STATES.IDLE], {
      animationSpeed: 0.15,
    });

    if (enemy.onIdle) enemy.onIdle(() => this.setAnimation(STATES.IDLE));
    if (enemy.onAlerted) enemy.onAlerted(() => this.setAnimation(STATES.IDLE));
    if (enemy.onPatrolling) enemy.onPatrolling(() => this.setAnimation(STATES.MOVING, true));
    if (enemy.onChasing) enemy.onChasing(() => this.setAnimation(STATES.MOVING, true));
    if (enemy.onAiming) enemy.onAiming(() => this.setAnimation(STATES.AIMING));
    if (enemy.onAttacking) enemy.onAttacking(() => this.setAnimation(STATES.ATTACKING));
    if (enemy.onHurting) enemy.onHurting(() => this.setAnimation(STATES.HURTING));
    if (enemy.onDead) enemy.onDead(() => this.setAnimation(STATES.DEAD));

    this.textureCollection = textureCollection;
  }

  /**
   * Set the animation.
   * @param {String}  state The animation state
   * @param {Boolean} loop  Should the animation loop.
   */
  setAnimation(state, loop = false) {
    this.textures = this.textureCollection[state];
    this.loop = loop;
  }
}

export default EnemySprite;
