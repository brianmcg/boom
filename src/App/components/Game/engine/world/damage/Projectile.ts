import { Body, Cell, degrees } from '@game/core/physics';
import type { Sound } from '@game/core/audio';
import { CELL_SIZE } from '@constants/config';
import DynamicEntity, {
  type DynamicEntityOptions,
} from '../base/DynamicEntity';
import AbstractDestroyableEntity, {
  type Sounds,
} from '../base/AbstractDestroyableEntity';
import PositionalAudio from '../../audio/PositionalAudio';
import Tail, { type TailOptions } from '../effects/Tail';
import Explosion, { type ExplosionOptions } from './Explosion';
import type World from '../World';

const STATES = {
  IDLE: 'projectile:idle',
  TRAVELLING: 'projectile:travelling',
  COLLIDING: 'projectile:colliding',
};

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

/** How a weapon aims one shot from the pool. */
export interface ProjectileShot {
  angle?: number;
  damage?: number;
  /** Fans pellets apart, for a weapon that fires more than one. */
  offset?: number;
}

export interface ProjectileOptions extends Omit<DynamicEntityOptions, 'state'> {
  /** Whatever fired the shot, which is the player or an enemy. */
  source: DynamicEntity;
  /** The pool this returns itself to once it has hit something. */
  queue: Projectile[];
  /** In cells per frame. */
  speed?: number;
  /** In cells, added to the source's own elevation by {@link Projectile.set}. */
  elavation?: number;
  tail?: Omit<TailOptions, 'source'>;
  explosion?: Omit<ExplosionOptions, 'source'>;
  sounds?: Sounds;
  soundSprite?: Sound;
}

/**
 * A shot that travels: it moves under its own velocity until it touches
 * anything blocking, damages what it hit, sets off its explosion, and goes
 * back into the pool it came from.
 *
 * Pooled rather than created per shot — a weapon builds its whole set up
 * front, and `queue` is where a spent one waits.
 */
export default class Projectile extends DynamicEntity {
  /** Null once destroyed. */
  source: DynamicEntity | null;

  queue: Projectile[];

  /** In world units, unlike the option it comes from. */
  readonly baseElavation: number;

  /**
   * Set by {@link set} before the projectile is ever added to the world, so
   * the zero is never the value that lands.
   */
  damage = 0;

  // Audio is not inherited: the two branches that make a noise are the
  // destroyable entities and these, and they meet no lower than
  // `DynamicEntity`, most of whose subclasses are silent.
  sounds: Sounds | null;

  audio: PositionalAudio | null;

  tail?: Tail;

  explosion?: Explosion;

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
    tail,
    sounds = {},
    soundSprite,
    ...other
  }: ProjectileOptions) {
    super({
      state: STATES.IDLE,
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

    this.sounds = sounds;

    this.audio = Object.entries(sounds).length
      ? new PositionalAudio({ soundSprite, source: this })
      : null;

    if (tail) {
      this.tail = new Tail({ source: this, ...tail });
    }

    if (explosion) {
      this.explosion = new Explosion({ source: this, ...explosion });
    }

    this.addTrackedCollision({
      type: Body,
      onStart: body => this.handleCollision(body),
    });
  }

  onAdded(parent: World) {
    super.onAdded(parent);

    const { x, y } = this.source!;
    const cell = parent.getCell(this.gridX, this.gridY)!;

    if (cell.blocking && this.isBodyCollision(cell)) {
      this.x = x;
      this.y = y;
    }

    this.setTravelling();
    this.emitSound(this.sounds?.travel);
  }

  handleCollision(body: Body) {
    if (
      body.blocking &&
      this.setColliding() &&
      !(body instanceof Cell && body.edge)
    ) {
      if (body instanceof AbstractDestroyableEntity) {
        const angle = (body.getAngleTo(this.pos) + DEG_180) % DEG_360;

        body.hit({ damage: this.damage, angle });
      }

      if (this.explosion) {
        this.explosion.run();
      }
    }
  }

  update(delta: number, elapsedMS: number) {
    switch (this.state) {
      case STATES.TRAVELLING:
        this.updateTravalling(delta, elapsedMS);
        break;
      case STATES.COLLIDING:
        this.updateColliding();
        break;
      default:
        break;
    }
  }

  updateTravalling(delta: number, elapsedMS: number) {
    // Before the move, so a puff lands where the projectile was at the start
    // of the frame.
    this.tail?.update(elapsedMS);

    super.update(delta, elapsedMS);

    // After it, which is what refreshes the `distanceToPlayer` the volume is
    // derived from.
    this.audio?.update();
  }

  updateColliding() {
    this.removeFromParent();
    this.queue.push(this);
    this.setIdle();
  }

  set({ angle = 0, damage = 0, offset = 0 }: ProjectileShot) {
    const { x, y, visualElavation, width } = this.source!;

    const distance = Math.sqrt(width * width + width * width) + 1;

    this.x = x + Math.cos(angle + offset) * distance;
    this.y = y + Math.sin(angle + offset) * distance;
    this.elavation = this.baseElavation + visualElavation;

    this.angle = angle;
    this.damage = damage;
  }

  setTravelling(): boolean {
    return this.setState(STATES.TRAVELLING);
  }

  setIdle(): boolean {
    return this.setState(STATES.IDLE);
  }

  setColliding(): boolean {
    const isStateChanged = this.setState(STATES.COLLIDING);

    if (isStateChanged) {
      // Silences the looping travel sound before the impact one lands.
      this.audio?.stopAll();

      if (this.sounds?.impact) {
        this.emitSound(this.sounds.impact);
      }
    }

    return isStateChanged;
  }

  /**
   * `Explosion.run` calls this on whatever it was given as a source, which is
   * either a destroyable entity or one of these.
   */
  emitSound(name?: string, loop?: boolean) {
    this.audio?.emit(name, loop);
  }

  destroy() {
    this.audio?.destroy();
    this.audio = null;
    this.sounds = null;
    super.destroy();
    this.source = null;
    this.explosion = undefined;
  }
}
