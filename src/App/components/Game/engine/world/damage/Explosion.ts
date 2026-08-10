import { CELL_SIZE } from '@constants/config';
import { Body, degrees, type BodyOptions } from '@game/core/physics';
import AbstractActor from '../actors/AbstractActor';
import HitScan, { type Penetration } from './HitScan';
import type World from '../World';

const SPREAD = 24;

const INCREMENT = 360 / 24;

const ANGLES = [...Array(SPREAD).keys()].map(i => degrees(i * INCREMENT));

/**
 * What a blast needs from the thing that goes off: a body to stand where it
 * stands, the world to go off in, and a voice — the bang is emitted by the
 * source rather than by the explosion.
 *
 * Structural rather than `ExplosiveEntity | Projectile`, because `Projectile`
 * imports this module and naming it here would be a cycle. It extends `Body`
 * because `getNeighbourBodies` is handed the source directly, so a bare shape
 * would not do.
 */
export interface ExplosionSource extends Body {
  elavation: number;
  parent: World | null;
  emitSound(name?: string, loop?: boolean): void;
}

/**
 * `isDead` is declared on `Player` and on `AbstractEnemy` rather than on the
 * `AbstractActor` they share, and both are still JavaScript. Asking for the
 * method by name narrows without importing `AbstractEnemy`, which imports this
 * module.
 */
interface Killable {
  isDead(): boolean;
}

const isKillableActor = (body: Body): body is AbstractActor & Killable =>
  body instanceof AbstractActor && 'isDead' in body;

export interface ExplosionOptions extends BodyOptions {
  source: ExplosionSource;
  /** In cells. Zero means noise, light and shake but no damage. */
  range: number;
  power: number;
  flash: number;
  sounds: { explode: string };
  effects: { explode: string };
  penetration?: Penetration;
}

/**
 * A blast at a point: a fan of hit scans in every direction, plus the effect,
 * the flash, the shake and the bang.
 *
 * A `Body` for its id, which keys the explosion effect, and for the position
 * the scans are cast from — never something that stands in the world.
 */
export default class Explosion extends Body {
  /** Null once destroyed. */
  source: ExplosionSource | null;

  /** In world units, unlike the option it comes from. */
  readonly range: number;

  readonly power: number;

  readonly flash: number;

  readonly sounds: { explode: string };

  readonly effects: { explode: string };

  /**
   * Taken from the source at construction and again on every {@link run},
   * because a pooled projectile is unparented between shots.
   */
  parent: World | null;

  /** Read by `HitScan`, to spare a boss the damage of its own explosion. */
  readonly isExplosion = true;

  /** One scan per angle in the fan, reused on every run. */
  private readonly hitScans: { hitScan: HitScan; angle: number }[];

  constructor({
    source,
    range,
    sounds,
    power,
    effects,
    flash,
    penetration,
    ...other
  }: ExplosionOptions) {
    super(other);

    this.source = source;
    this.range = range * CELL_SIZE;
    this.sounds = sounds;
    this.power = power;
    this.effects = effects;
    this.parent = source.parent;
    this.flash = flash;

    this.hitScans = ANGLES.map(angle => ({
      hitScan: new HitScan({
        source: this,
        power: this.power,
        range: this.range,
        fade: true,
        penetration,
      }),
      angle,
    }));
  }

  run() {
    const source = this.source!;

    this.parent = source.parent;
    this.x = source.x;
    this.y = source.y;

    const parent = this.parent!;

    const distanceToPlayer = source.getDistanceTo(parent.player.pos);
    const shake = (CELL_SIZE / distanceToPlayer) * (this.power / CELL_SIZE);
    const range = Math.ceil(this.range / CELL_SIZE);
    const deadBodies: AbstractActor[] = [];

    if (this.range > 0) {
      // Make dead bodies collideable and updateable for this frame,
      // so that an explosion will apply a force to them.
      parent.getNeighbourBodies(source, range).forEach((body: Body) => {
        if (isKillableActor(body) && body.isDead()) {
          body.startUpdates();
          body.blocking = true;
          deadBodies.push(body);
        }
      });

      // Fire rays in all directions.
      this.hitScans.forEach(({ hitScan, angle }) => hitScan.run(angle));

      // Stop dead bodies from colliding.
      deadBodies.forEach(body => {
        body.blocking = false;
      });
    }

    parent.addEffect({
      x: source.x,
      y: source.y,
      elavation: source.elavation,
      sourceId: `${this.id}_${this.effects.explode}`,
    });

    parent.addFlashLight(this.flash);

    parent.addShake(shake);

    source.emitSound(this.sounds.explode);
  }

  destroy() {
    super.destroy();
    this.hitScans.forEach(({ hitScan }) => hitScan.destroy());
    this.source = null;
  }
}
