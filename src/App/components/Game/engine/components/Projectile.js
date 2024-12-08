import { Body, degrees } from '@game/core/physics';
import { CELL_SIZE } from '@constants/config';
import DynamicEntity from './DynamicEntity';
import Explosion from './Explosion';

const STATES = {
  IDLE: 'projectile:idle',
  TRAVELLING: 'projectile:travelling',
  COLLIDING: 'projectile:colliding',
};

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

export default class Projectile extends DynamicEntity {
  constructor({
    width = CELL_SIZE / 4,
    height = CELL_SIZE / 4,
    length = CELL_SIZE / 4,
    speed = 0,
    source,
    weight = 0,
    queue,
    explosion,
    elavation = 0,
    ...other
  }) {
    super({
      width,
      height,
      length,
      blocking: false,
      weight,
      ...other,
    });

    this.source = source;
    this.velocity = speed * CELL_SIZE;
    this.queue = queue;
    this.baseElavation = elavation * CELL_SIZE;

    this.timer = 0;

    if (explosion) {
      this.explosion = new Explosion({ source: this, ...explosion });
    }

    this.addTrackedCollision({
      type: Body,
      onStart: body => this.handleCollision(body),
    });

    this.setIdle();
  }

  onAdded(parent) {
    super.onAdded(parent);

    const { x, y } = this.source;
    const cell = parent.getCell(this.gridX, this.gridY);

    if (cell.blocking && this.isBodyCollision(cell)) {
      this.x = x;
      this.y = y;
    }

    this.setTravelling();
    this.emitSound(this.sounds.travel);
  }

  handleCollision(body) {
    if (body.blocking && this.setColliding() && !body.edge) {
      if (body.isDestroyable) {
        const angle = (body.getAngleTo(this) + DEG_180) % DEG_360;

        body.hit({ damage: this.damage, angle });
      }

      if (this.explosion) {
        this.explosion.run();
      }
    }
  }

  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.TRAVELLING:
        this.updateTravalling(delta, elapsedMS);
        break;
      case STATES.EXPLODING:
        this.updateColliding();
        break;
      default:
        break;
    }
  }

  updateTravalling(delta, elapsedMS) {
    super.update(delta, elapsedMS);
  }

  updateColliding() {
    this.removeFromParent();
    this.queue.push(this);
    this.setIdle();
  }

  set({ angle = 0, damage = 0, offset = 0 }) {
    const { x, y, elavation, elavationOffset = 0, width } = this.source;

    const distance = Math.sqrt(width * width + width * width) + 1;

    this.x = x + Math.cos(angle + offset) * distance;
    this.y = y + Math.sin(angle + offset) * distance;
    this.z = this.baseElavation + elavation + elavationOffset;

    this.angle = angle;
    this.damage = damage;
  }

  setTravelling() {
    return this.setState(STATES.TRAVELLING);
  }

  setIdle() {
    return this.setState(STATES.IDLE);
  }

  setColliding() {
    const isStateChanged = this.setState(STATES.EXPLODING);

    if (isStateChanged) {
      this.stop();

      if (this.sounds?.impact) {
        this.emitSound(this.sounds.impact);
      }
    }

    return isStateChanged;
  }

  destroy() {
    this.explosion.destroy();
    this.source = null;
    this.explosion = null;
  }
}
