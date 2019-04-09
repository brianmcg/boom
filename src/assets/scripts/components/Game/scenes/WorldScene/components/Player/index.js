import Character from '../Character';
import { TILE_SIZE } from '~/constants/config';
import { DEG } from '~/core/physics';

export default class Player extends Character {
  constructor(options = {}) {
    const {
      maxVelocity = TILE_SIZE / 16,
      maxRotVelocity = DEG[2],
      acceleration = TILE_SIZE / 256,
      rotAcceleration = 2,
      ...otherOptions
    } = options;

    super(otherOptions);

    this.maxVelocity = maxVelocity;
    this.maxRotVelocity = maxRotVelocity;
    this.acceleration = acceleration;
    this.rotAcceleration = rotAcceleration;
  }

  update(delta, world) {
    if (this.actions.isMovingForward) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (this.actions.isMovingBackward) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = Math.max(0, this.velocity - this.acceleration);
    }

    if (this.actions.isTurningLeft) {
      this.rotVelocity = Math.max(
        this.rotVelocity - this.rotAcceleration,
        this.maxRotVelocity * -1,
      );
    } else if (this.actions.isTurningRight) {
      this.rotVelocity = Math.min(this.rotVelocity + this.rotAcceleration, this.maxRotVelocity);
    } else {
      this.rotVelocity = 0;
    }

    super.update(delta, world);

    Object.keys(this.actions).forEach((key) => {
      this.actions[key] = false;
    });
  }
}
