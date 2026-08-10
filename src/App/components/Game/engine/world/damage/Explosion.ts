import { CELL_SIZE } from '@constants/config';
import { degrees, Point, type Body } from '@game/core/physics';
import { generateId } from '@game/core/utils';
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

export interface ExplosionOptions {
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
 * Not a `Body`, though it does have a position — it is never added to the
 * world, never collides and is never cast against, so all it wanted from
 * `Body` was an id and two numbers.
 */
export default class Explosion {
  /** Keys the explosion effect's sprite, built up front by `WorldGraphics`. */
  readonly id = generateId(this);

  /**
   * Moved onto the source at the start of every {@link run}, and read back by
   * this explosion's own scans, which take it as their source. Mutated rather
   * than replaced, the way `Body.x`/`y` move `Body.pos`.
   */
  readonly pos = new Point(0, 0);

  readonly source: ExplosionSource;

  /** In world units, unlike the option it comes from. */
  readonly range: number;

  readonly power: number;

  readonly flash: number;

  readonly sounds: { explode: string };

  readonly effects: { explode: string };

  /**
   * Null until the first {@link run}, and taken from the source again on every
   * one after that, because a pooled projectile is unparented between shots.
   *
   * Read from outside only by this explosion's own scans, which take the
   * explosion as their source — and they fire from `run`, after it is set.
   */
  parent: World | null = null;

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
  }: ExplosionOptions) {
    this.source = source;
    this.range = range * CELL_SIZE;
    this.sounds = sounds;
    this.power = power;
    this.effects = effects;
    this.flash = flash;

    this.hitScans = ANGLES.map(angle => ({
      hitScan: new HitScan({
        source: this,
        power: this.power,
        range: this.range,
        fade: true,
        fromBlast: true,
        penetration,
      }),
      angle,
    }));
  }

  run() {
    const { source } = this;
    const { parent } = source;

    if (!parent) {
      throw new Error('Cannot detonate an explosion outside a world.');
    }

    this.parent = parent;
    this.pos.x = source.x;
    this.pos.y = source.y;

    const distanceToPlayer = source.getDistanceTo(parent.player.pos);
    const shake = (CELL_SIZE / distanceToPlayer) * (this.power / CELL_SIZE);
    const range = Math.ceil(this.range / CELL_SIZE);
    const exposed: AbstractActor[] = [];

    if (this.range > 0) {
      // A corpse is not solid, so the rays below would pass straight through
      // it. What that costs and how it is undone is the actor's own business.
      parent.getNeighbourBodies(source, range).forEach((body: Body) => {
        if (body instanceof AbstractActor && body.exposeToBlast()) {
          exposed.push(body);
        }
      });

      // Fire rays in all directions.
      this.hitScans.forEach(({ hitScan, angle }) => hitScan.run(angle));

      exposed.forEach(body => body.concealFromBlast());
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
}
