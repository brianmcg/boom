import type DynamicEntity from '../base/DynamicEntity';

/** How long between puffs, in milliseconds. */
const INTERVAL = 25;

export interface TailOptions {
  source: DynamicEntity;
  effects: { smoke: string };
  /** How many puffs the trail cycles through before reusing the first. */
  length: number;
}

/**
 * A trail of smoke puffs dropped behind something that moves — every
 * projectile, and the lost soul.
 *
 * Composed rather than inherited, for the same reason as `PositionalAudio`:
 * the two things that own one are a `Projectile` and an `AbstractEnemy`, which
 * meet no lower than `DynamicEntity` — and putting it there gave the field and
 * a per-frame branch to every item, the barrel, the player and a dozen enemies
 * that never leave a trail.
 *
 * It reads position and velocity off its source rather than being told, so
 * there is nothing to keep in step.
 *
 * The puffs themselves belong to the world: it holds a fixed ring of ids and
 * hands them to `addEffect` in turn, so a trail of `length` puffs reuses the
 * oldest rather than allocating. `WorldGraphics` builds one sprite per id up
 * front from {@link name} and {@link ids}.
 */
export default class Tail {
  /** The effect name every puff is drawn with. */
  readonly name: string;

  /** One id per puff, reused in order. */
  readonly ids: string[];

  private readonly source: DynamicEntity;

  private timer = 0;

  private index = 0;

  constructor({ source, effects, length }: TailOptions) {
    this.source = source;
    this.name = effects.smoke;
    this.ids = [...Array(length).keys()].map(
      i => `${source.id}_${effects.smoke}_${i}`
    );
  }

  /**
   * Call before the source moves, so a puff is dropped where it was at the
   * start of the frame rather than where it ends up.
   *
   * Nothing is dropped while stationary — a soul that stops chasing stops
   * smoking.
   */
  update(elapsedMS: number) {
    const { source } = this;

    if (!source.velocity) {
      return;
    }

    this.timer += elapsedMS;

    if (this.timer >= INTERVAL) {
      if (!source.parent) {
        throw new Error('Cannot leave a trail outside a world.');
      }

      source.parent.addEffect({
        x: source.x,
        y: source.y,
        elavation: source.elavation,
        sourceId: this.ids[this.index],
        scale: Math.random() * 0.5 + 0.5,
      });

      this.timer = 0;
      this.index += 1;

      if (this.index >= this.ids.length) {
        this.index = 0;
      }
    }
  }
}
