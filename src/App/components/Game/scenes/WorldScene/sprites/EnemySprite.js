import AnimatedEntitySprite from './AnimatedEntitySprite';

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

export default class EnemySprite extends AnimatedEntitySprite {
  constructor(textureCollection = [], { enemy, floorOffset } = {}) {
    const { textures } = textureCollection[STATES.IDLE];

    super(textures, { animationSpeed: 0.15, floorOffset });

    enemy.onIdle(() => this.setAnimation(STATES.IDLE));
    enemy.onAlerted(() => this.setAnimation(STATES.IDLE));
    enemy.onEvading(() => this.setAnimation(STATES.MOVING));
    enemy.onChasing(() => this.setAnimation(STATES.MOVING));
    enemy.onRetreating(() => this.setAnimation(STATES.MOVING));
    enemy.onAiming(() => this.setAnimation(STATES.AIMING));
    enemy.onAttacking(() => this.setAnimation(STATES.ATTACKING));
    enemy.onHurting(() => this.setAnimation(STATES.HURTING));
    enemy.onDead(() => this.setAnimation(STATES.DEAD));

    this.textureCollection = textureCollection;

    this.onComplete = () => {
      if (enemy.isDead()) {
        this.isComplete = true;
        this.emit(EVENTS.ANIMATION_COMPLETE);

        if (enemy.explode) {
          enemy.remove();
        }

        if (enemy.ripple) {
          enemy.parent.addEffect({
            x: enemy.x,
            y: enemy.y,
            z: enemy.z,
            sourceId: `${enemy.id}_${enemy.ripple}`,
          });
        }
      }
    };
  }

  setAnimation(state) {
    const { textures, loop } = this.textureCollection[state];

    this.textures = textures;
    this.loop = loop;
    this.play();

    this.emit(EVENTS.ANIMATION_CHANGE);
  }

  onAnimationChange(callback) {
    this.on(EVENTS.ANIMATION_CHANGE, callback);
  }

  onAnimationComplete(callback) {
    this.on(EVENTS.ANIMATION_COMPLETE, callback);
  }
}
