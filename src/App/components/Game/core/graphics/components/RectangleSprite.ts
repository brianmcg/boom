import { Texture, type ColorSource } from 'pixi.js';
import Sprite from './Sprite';
import type { Anchor } from '../types';

export interface RectangleSpriteOptions {
  color?: ColorSource;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  alpha?: number;
  anchor?: Anchor;
}

/**
 * A flat fill — a background, a mask, a fade over the screen.
 *
 * It draws the global `Texture.WHITE` tinted, which is why nothing may ever
 * destroy its texture: see the note in `GraphicsCreator.createRectangleSprite`.
 *
 * Everything but `x` and `y` is what {@link Sprite} already does, down to the
 * guards — `color` is its `tint`, and the size defaults mean `width` and
 * `height` always pass its `|| === 0` test.
 */
export default class RectangleSprite extends Sprite {
  constructor({
    color,
    x = 0,
    y = 0,
    width = 10,
    height = 10,
    alpha = 1,
    anchor = 0,
  }: RectangleSpriteOptions = {}) {
    super({
      texture: Texture.WHITE,
      width,
      height,
      alpha,
      anchor,
      tint: color,
    });

    // Pixi accessors, and not among the options Sprite takes.
    this.x = x;
    this.y = y;
  }
}
