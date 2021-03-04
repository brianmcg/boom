import { CELL_SIZE } from 'game/constants/config';
import AbstractDestroyableEntity from '../AbstractDestroyableEntity';

/**
 * Abstract class representing an actor.
 * @extends {AbstractDestroyableEntity}
 */
class AbstractActor extends AbstractDestroyableEntity {
  /**
   * Creates an abstract actor.
   * @param  {Number}  options.x         The x coordinate of the character.
   * @param  {Number}  options.y         The y coordinate of the character
   * @param  {Number}  options.width     The width of the character.
   * @param  {Number}  options.height    The height of the character.
   * @param  {Number}  options.angle     The angle of the character.
   * @param  {Boolean} options.blocking  Is the dynamic entity blocking.
   * @param  {String}  options.texture   The texture of the actor.
   * @param  {Number}  options.health    The current health of the actor.
   * @param  {Number}  options.maxHealth The maximum health of the actor.
   */
  constructor({ speed, acceleration, ...other }) {
    super(other);

    if (this.constructor === AbstractActor) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.speed = speed * CELL_SIZE;
    this.acceleration = acceleration * CELL_SIZE;

    this.isActor = true;
    this.standingOn = [];

    this.addTrackedCollision({
      type: AbstractActor,
      onStart: (body) => {
        if (body.isProne) {
          this.standingOn.push(body);
        }
      },
      onComplete: (body) => {
        if (body.isProne) {
          this.standingOn = this.standingOn.filter(b => b.id !== body.id);
        }
      },
    });
  }

  /**
   * Update the actor.
   * @param  {Number} delta     The time delta.
   * @param  {Number} elapsedMS The elsapsed time.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    // Update elavation.
    if (this.isAlive() && this.standingOn.length) {
      this.z = this.standingOn.reduce((maxElavation, body) => {
        const distance = this.getDistanceTo(body);
        const { proneHeight, width } = body;
        const elavation = proneHeight * Math.abs(width - distance) / width;
        return elavation > maxElavation ? elavation : maxElavation;
      }, 0);
    } else {
      this.z = 0;
    }
  }

  /**
   * Is the enemy alive.
   * @return {Boolean}
   */
  isAlive() {
    if (this.constructor === AbstractActor) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Set the actor angle to face a body.
   * @param  {Body} body The body to face.
   */
  face(body) {
    this.angle = this.getAngleTo(body);
  }
}

export default AbstractActor;
