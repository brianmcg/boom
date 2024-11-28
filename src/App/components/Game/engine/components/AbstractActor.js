import { degrees } from '@game/core/physics';
import { CELL_SIZE } from '@constants/config';
import AbstractDestroyableEntity from './AbstractDestroyableEntity';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const OFFSET = CELL_SIZE * 0.001;

const SPATTER_DISTANCE = Math.sqrt(
  CELL_SIZE * CELL_SIZE + CELL_SIZE * CELL_SIZE
);

const CELL_CENTER = CELL_SIZE / 4;

export default class AbstractActor extends AbstractDestroyableEntity {
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

  onAdded(parent) {
    super.onAdded(parent);
    this.startCell = this.cell;
  }

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

  isAlive() {
    if (this.constructor === AbstractActor) {
      throw new TypeError('You have to implement this method.');
    }
  }

  face(body) {
    this.angle = this.getAngleTo(body);
  }

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
        }
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

  isArrivedAt(cell) {
    if (!cell) {
      return false;
    }

    return (
      Math.abs(this.x - cell.x) <= CELL_CENTER &&
      Math.abs(this.y - cell.y) <= CELL_CENTER
    );
  }

  spatter() {
    if (this.spatters.length) {
      const randomIndex = Math.floor(Math.random() * this.spatters.length);

      return this.spatters[randomIndex];
    }

    return 0;
  }

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
