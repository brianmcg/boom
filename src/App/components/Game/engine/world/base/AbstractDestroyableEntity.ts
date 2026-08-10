import type { Sound } from '@game/core/audio';
import PositionalAudio from '../../audio/PositionalAudio';
import DynamicEntity, { type DynamicEntityOptions } from './DynamicEntity';

/**
 * The sounds one entity can make, keyed by the role its map data gives them —
 * `travel`, `pain`, `death`, `explode`. Which keys exist differs per entity
 * type, so this stays an open map rather than a fixed shape.
 *
 * Declared here because this is the larger of the two branches that make a
 * noise; `Projectile` is the other, and will import it from here when it
 * converts. Its real home is beside `PositionalAudio`, once that is
 * TypeScript.
 */
export type Sounds = Record<string, string>;

/**
 * One recorded hit. Hits are collected as they land and applied together on
 * the next update, so that a shotgun blast reads as one wound from the mean
 * direction rather than eight from eight.
 *
 * `HitScan` sends `distance` and `rays` alongside these; `AbstractActor` takes
 * those two off to place its blood spatter and passes the rest up.
 */
export interface Hit {
  damage: number;
  angle: number;
  instantKill?: boolean;
}

/**
 * The effects one entity can show, keyed by the role its map data gives them —
 * `spatter`, `spurt`, `explode`. An open map for the same reason as `Sounds`.
 */
export type Effects = Record<string, string>;

export interface AbstractDestroyableEntityOptions extends DynamicEntityOptions {
  maxHealth?: number;
  health?: number;
  effects?: Effects;
  sounds?: Sounds;
  soundSprite?: Sound;
}

/** An entity with health, which can be hit and eventually killed. */
export default class AbstractDestroyableEntity extends DynamicEntity {
  health: number;

  readonly maxHealth: number;

  readonly effects?: Effects;

  readonly isDestroyable = true;

  /** `Player` adds a name-to-sound entry per weapon, so this is not readonly. */
  sounds: Sounds | null;

  /**
   * Null when the map data supplied no sounds, and null again after destroy,
   * so every use is guarded. Every destroyable entity in the current data has
   * some, but they arrive as data and nothing requires them.
   *
   * Public because `World` collects these to pause and resume the level.
   */
  audio: PositionalAudio | null = null;

  /** Landed but not yet applied — see {@link Hit}. */
  private hits: Hit[] = [];

  constructor({
    maxHealth = 100,
    health,
    effects,
    sounds = {},
    soundSprite,
    ...other
  }: AbstractDestroyableEntityOptions) {
    super(other);

    this.health = health !== undefined ? health : maxHealth;
    this.maxHealth = maxHealth;
    this.effects = effects;
    this.sounds = sounds;

    if (Object.entries(sounds).length) {
      this.audio = new PositionalAudio({ soundSprite, source: this });
    }
  }

  update(delta: number, elapsedMS: number) {
    super.update(delta, elapsedMS);

    // After `super`, which is what refreshes the `distanceToPlayer` the volume
    // is derived from.
    this.audio?.update();

    if (this.hits.length) {
      const totalDamage = this.hits.reduce(
        (memo, { damage }) => memo + damage,
        0
      );
      const instantKill = this.hits.some(h => h.instantKill);

      if (totalDamage) {
        const { length } = this.hits;

        const { x, y } = this.hits.reduce(
          (memo, { angle }) => ({
            x: memo.x + Math.cos(angle),
            y: memo.y + Math.sin(angle),
          }),
          { x: 0, y: 0 }
        );

        const meanAngle = Math.atan2(y / length, x / length);

        this.hurt(totalDamage, meanAngle, instantKill);

        this.hits = [];
      }
    }
  }

  hit(options: Hit) {
    this.hits.push(options);
  }

  /**
   * Optional third parameter because the two callers disagree: {@link update}
   * passes all three, while `AbstractActor` consumes `instantKill` itself and
   * relays only `damage` and `angle`. Nothing is read here — the parameters
   * exist to name the contract subclasses implement.
   */
  hurt(_damage: number, _angle: number, _instantKill?: boolean) {
    if (this.constructor === AbstractDestroyableEntity) {
      throw new TypeError('You have to implement this method.');
    }
  }

  emitSound(name?: string, loop?: boolean) {
    this.audio?.emit(name, loop);
  }

  stopSound(name?: string) {
    this.audio?.stop(name);
  }

  isPlaying(name?: string): boolean {
    return this.audio?.isPlaying(name) ?? false;
  }

  destroy(options?: unknown) {
    this.audio?.destroy();
    this.audio = null;
    this.sounds = null;
    super.destroy(options);
  }
}
