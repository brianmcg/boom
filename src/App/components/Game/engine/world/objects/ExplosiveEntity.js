import AbstractDestroyableEntity from '../base/AbstractDestroyableEntity';
import Explosion from '../damage/Explosion';

const STATES = {
  IDLE: 'entity:idle',
  EXPLODING: 'entity:exploding',
};

const EXPLODE_EVENT = 'entity:explode';

const EXPLODE_DELAY = 20;

export default class ExplosiveEntity extends AbstractDestroyableEntity {
  constructor({ animated, explosion, ...other }) {
    super({ state: STATES.IDLE, sounds: explosion.sounds, ...other });
    this.animated = animated;

    this.timer = 0;

    this.explosion = new Explosion({ source: this, ...explosion });

    this.onExplode(() => this.explosion.run());
  }

  onExplode(callback) {
    this.on(EXPLODE_EVENT, callback);
  }

  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    // The timer latches as well as counts: reaching the delay is what stops
    // the blast being emitted again on every later frame. There is no third
    // state for "already gone off" because both readers outside this class —
    // the top-down map and the sprite — mean "has begun exploding" and need
    // that to stay true afterwards.
    if (this.isExploding() && this.timer < EXPLODE_DELAY) {
      this.timer += elapsedMS;

      if (this.timer >= EXPLODE_DELAY) {
        this.timer = EXPLODE_DELAY;
        this.emit(EXPLODE_EVENT);
      }
    }
  }

  hurt(amount) {
    if (this.isIdle()) {
      this.health -= amount;

      if (this.health <= 0) {
        this.health = 0;
        this.setExploding();
        this.blocking = false;
      }
    }
  }

  setIdle() {
    return this.setState(STATES.IDLE);
  }

  setExploding() {
    return this.setState(STATES.EXPLODING);
  }

  isIdle() {
    return this.state === STATES.IDLE;
  }

  isExploding() {
    return this.state === STATES.EXPLODING;
  }
}
