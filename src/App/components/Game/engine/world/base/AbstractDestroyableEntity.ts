import DynamicEntity, { type DynamicEntityOptions } from './DynamicEntity';

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
}

/** An entity with health, which can be hit and eventually killed. */
export default class AbstractDestroyableEntity extends DynamicEntity {
  health: number;

  readonly maxHealth: number;

  readonly effects?: Effects;

  readonly isDestroyable = true;

  /** Landed but not yet applied — see {@link Hit}. */
  private hits: Hit[] = [];

  constructor({
    maxHealth = 100,
    health,
    effects,
    ...other
  }: AbstractDestroyableEntityOptions) {
    super(other);

    this.health = health !== undefined ? health : maxHealth;
    this.maxHealth = maxHealth;
    this.effects = effects;
  }

  update(delta: number, elapsedMS: number) {
    super.update(delta, elapsedMS);

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
}
