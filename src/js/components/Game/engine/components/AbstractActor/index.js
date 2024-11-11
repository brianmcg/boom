import { degrees } from '@game/core/physics';
import { CELL_SIZE } from '@game/constants/config';
import AbstractDestroyableEntity from '../AbstractDestroyableEntity';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const OFFSET = CELL_SIZE * 0.001;

const SPATTER_DISTANCE = Math.sqrt(
  CELL_SIZE * CELL_SIZE + CELL_SIZE * CELL_SIZE,
);

const CELL_CENTER = CELL_SIZE / 4;

/**
 * Abstract class representing an actor.
 * @extends {AbstractDestroyableEntity}
 */
class AbstractActor extends AbstractDestroyableEntity {
  /**
   * Creates an abstract actor.
   * @param  {Number}  options.x            The x coordinate of the actor.
   * @param  {Number}  options.y            The y coordinate of the actor.
   * @param  {Number}  options.z            The z coordinate of the actor.
   * @param  {Number}  options.width        The width of the actor.
   * @param  {Number}  options.height       The length of the actor.
   * @param  {Number}  options.height       The height of the actor.
   * @param  {Boolean} options.blocking     The blocking value of the actor.
   * @param  {Number}  options.anchor       The anchor of the actor.
   * @param  {Number}  options.angle        The angle of the actor.
   * @param  {Number}  options.weight       The weight of the actor.
   * @param  {Number}  options.autoPlay     The autopPlay value of the actor.
   * @param  {String}  options.name         The name of the actor.
   * @param  {Object}  options.sounds       The actor sounds.
   * @param  {Object}  options.soundSprite  The actor sound sprite.
   * @param  {Number}  options.scale        The actor scale.
   * @param  {Object}  options.tail         The actor tail.
   * @param  {Number}  options.health       The current health of the actor.
   * @param  {Number}  options.maxHealth    The maximum health of the actor.
   * @param  {Object}  options.effects      The effects of the actor.
   * @param  {Number}  options.speed        The speed of the actor.
   * @param  {Number}  options.acceleration The acceleration of the actor.
   * @param  {Array}   options.spatters     The spatter values of the actor.
   * @param  {String}  options.bloodColor   The blood color of the actor.
   */
  constructor({ speed, acceleration, spatters, bloodColor, ...other }) {
    super(other);

    if (this.constructor === AbstractActor) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.speed = speed * CELL_SIZE;
    this.acceleration = acceleration * CELL_SIZE;
    this.spatters = spatters;
    this.bloodColor = bloodColor;

    this.isActor = true;
    this.standingOn = [];

    this.addTrackedCollision({
      type: AbstractActor,
      onStart: body => {
        if (body.isProne) {
          this.standingOn.push(body);
        }
      },
      onComplete: body => {
        if (body.isProne) {
          this.standingOn = this.standingOn.filter(b => b.id !== body.id);
        }
      },
    });
  }

  /**
   * Called when body is added to world.
   * @param  {World} parent  The world that the body was added to.
   */
  onAdded(parent) {
    super.onAdded(parent);
    this.startCell = this.cell;
  }

  /**
   * Update the actor.
   * @param  {Number} delta     The time delta.
   * @param  {Number} elapsedMS The elsapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    // Update elavation.
    if (this.isAlive() && this.standingOn.length) {
      this.z = this.standingOn.reduce((maxElavation, body) => {
        const distance = this.getDistanceTo(body);
        const { proneHeight, width } = body;
        const elavation = (proneHeight * Math.abs(width - distance)) / width;
        return elavation > maxElavation ? elavation : maxElavation;
      }, 0);
    } else if (!this.isBoss) {
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

  /**
   * Add a hit to the actor.
   * @param {Number}  options.damage       The damage of the hit.
   * @param {Number}  options.angle        The angle of the hit.
   * @param {Array}   options.rays         The ray sections.
   * @param {Object}  options.point        The point of the collision.
   * @param {Boolean} options.instantKill  The hit instantly kills.
   */
  hit({ rays, point, ...options }) {
    super.hit(options);

    if (point && rays) {
      const {
        side,
        cell,
        distance: sectionDistance,
        encounteredBodies,
      } = rays.reduce(
        (memo, ray) => {
          if (ray.distance > point.distance) {
            if (ray.distance < memo.distance) {
              return ray;
            }
            return memo;
          }
          return memo;
        },
        {
          side: {},
          distance: Number.MAX_VALUE,
        },
      );

      const nearest = Object.values(encounteredBodies)
        .sort((a, b) => {
          if (!b.blocking) {
            return 1;
          }

          const distanceA = a.getDistanceTo(cell);
          const distanceB = b.getDistanceTo(cell);

          if (distanceA < distanceB) {
            return 1;
          }

          if (distanceA > distanceB) {
            return -1;
          }

          return 0;
        })
        .pop();

      if (
        this.spatter &&
        nearest?.id === this.id &&
        side &&
        !side.spatter &&
        sectionDistance - point.distance < SPATTER_DISTANCE
      ) {
        const spatter = this.spatter();

        side.spatter = spatter;

        if (cell.overlay) {
          cell.overlay.spatter = spatter;
        }
      }
    }
  }

  /**
   * Hurt the actor.
   * @param  {Number}  damage       The amount to hurt the actor.
   * @param  {Number}  angle        The angle the damage came from.
   */
  hurt(damage, angle) {
    if (this.health > 0) {
      const originAngle = (angle + DEG_180) % DEG_360;
      const sourceId = this.effects.spurt
        ? `${this.id}_${this.effects.spurt}`
        : null;

      if (sourceId) {
        this.parent.addEffect({
          x: this.x + Math.cos(originAngle) * (this.width + OFFSET),
          y: this.y + Math.sin(originAngle) * (this.length + OFFSET),
          sourceId,
        });
      }
    }

    super.hurt(damage, angle);
  }

  /**
   * Check if actor has arrived at a cell.
   * @param  {Cell}     cell The cell to check.
   * @return {Boolean}
   */
  isArrivedAt(cell) {
    if (!cell) {
      return false;
    }

    return (
      Math.abs(this.x - cell.x) <= CELL_CENTER &&
      Math.abs(this.y - cell.y) <= CELL_CENTER
    );
  }

  /**
   * Get the type of effects spatter.
   * @return {Number} The type of effects spatter.
   */
  spatter() {
    if (this.spatters.length) {
      const randomIndex = Math.floor(Math.random() * this.spatters.length);

      return this.spatters[randomIndex];
    }

    return 0;
  }

  /**
   * Stain the floor of the parent.
   * @param  {Number} radius The radius of the stain.
   */
  stain(radius) {
    const { x, y, parent, bloodColor } = this;

    if (bloodColor) {
      for (let i = Math.round(x - radius); i < x + radius; i++) {
        for (let j = Math.round(y - radius); j < y + radius; j++) {
          if (this.getDistanceTo({ x: i, y: j }) < radius) {
            parent.stains[i][j] = bloodColor;
          }
        }
      }
    }
  }
}

export default AbstractActor;
