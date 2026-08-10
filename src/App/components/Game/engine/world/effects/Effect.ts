import { Point } from '@game/core/physics';
import type World from '../World';

export interface EffectOptions {
  /** Which sprite draws this puff, and the key the world removes it by. */
  sourceId: string;
  x: number;
  y: number;
  parent: World;
  elavation?: number;
  scale?: number;
}

/**
 * A one-shot puff at a place in the world — blood spurt, bullet impact,
 * explosion, a smoke puff from a {@link Tail}.
 *
 * Not a `Body`: it stands nowhere on the grid, collides with nothing and is
 * never updated. It carries only what the renderer needs to draw it once and
 * the world needs to take it away again.
 */
export default class Effect {
  /**
   * An effect has a world position without being a Body, which is why the
   * measuring methods take a Point rather than anything body-shaped.
   */
  readonly pos: Point;

  readonly sourceId: string;

  elavation: number;

  scale: number;

  /** Null once the sprite has finished playing and given the effect back. */
  parent: World | null;

  constructor({
    sourceId,
    x,
    y,
    elavation = 0,
    parent,
    scale = 1,
  }: EffectOptions) {
    this.pos = new Point(x, y);
    this.elavation = elavation;
    this.sourceId = sourceId;
    this.parent = parent;
    this.scale = scale;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.removeEffect(this);
      this.parent = null;
    }
  }
}
