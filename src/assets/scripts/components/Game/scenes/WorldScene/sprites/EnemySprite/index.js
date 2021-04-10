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

const EVENTS = {
  ANIMATION_CHANGE: 'sprite:animation:change',
  ANIMATION_COMPLETE: 'sprite:animation:complete',
};

/**
 * Class representing an EnemySprite.
 * @extends {AnimatedEntitySprite}
 */
class EnemySprite extends AnimatedEntitySprite {
  /**
   * Creates an EnemySprite.
   * @param  {Array}          textureCollection   The textures for the sprite.
   * @param  {AbstractEnemy}  options.enemy       The enemy the sprite represents.
   * @param  {Number}         options.floorOffset The offset of the floor.
   */
  constructor(textureCollection = [], { enemy, floorOffset }) {
    const { textures } = textureCollection[STATES.IDLE];

    super(textures, { animationSpeed: 0.15, floorOffset });

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
      if (enemy.isDead()) {
        this.isComplete = true;
        this.emit(EVENTS.ANIMATION_COMPLETE);

        if (enemy.explosion) {
          enemy.remove();
        }
      }
    };
  }

  /**
   * Set the animation.
   * @param {String}  state The animation state
   * @param {Boolean} loop  Should the animation loop.
   */
  setAnimation(state) {
    const { textures, loop } = this.textureCollection[state];

    this.textures = textures;
    this.loop = loop;
    this.play();

    this.emit(EVENTS.ANIMATION_CHANGE);
  }

  /**
   * Add a callback for the animation change event.
   * @param  {Function} callback The callback function.
   */
  onAnimationChange(callback) {
    this.on(EVENTS.ANIMATION_CHANGE, callback);
  }

  /**
   * Add a callback for the animation complete event.
   * @param  {Function} callback The callback function.
   */
  onAnimationComplete(callback) {
    this.on(EVENTS.ANIMATION_COMPLETE, callback);
  }
}

export default EnemySprite;
