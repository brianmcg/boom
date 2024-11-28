import AbstractDestroyableEntity from './AbstractDestroyableEntity';
import Explosion from './Explosion';

const EXPLODE_EVENT = 'entity:explode';

const EXPLODE_DELAY = 20;

export default class ExplosiveEntity extends AbstractDestroyableEntity {
  constructor({ animated, explosion, ...other }) {
    super({ sounds: explosion.sounds, ...other });
    this.animated = animated;

    this.isExploding = false;
    this.timer = 0;

    this.explosion = new Explosion({ source: this, ...explosion });

    this.onExplode(() => this.explosion.run());
  }

  onExplode(callback) {
    this.on(EXPLODE_EVENT, callback);
  }

  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (this.isExploding && this.timer < EXPLODE_DELAY) {
      this.timer += elapsedMS;

      if (this.timer >= EXPLODE_DELAY) {
        this.timer = EXPLODE_DELAY;
        this.emit(EXPLODE_EVENT);
      }
    }
  }

  hurt(amount) {
    if (!this.isExploding) {
      this.health -= amount;

      if (this.health <= 0) {
        this.health = 0;
        this.isExploding = true;
        this.blocking = false;
      }
    }
  }
}
