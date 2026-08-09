import { Texture, Sprite, type ColorSource } from 'pixi.js';
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
 * Extends Pixi's `Sprite`, not this module's — so it has no `show`, `hide`,
 * `setState` or listener-clearing `destroy`. See the migration findings.
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
    super({ texture: Texture.WHITE });

    // All Pixi accessors: assignments, never fields.
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alpha = alpha;

    if (color || color === 0) {
      this.tint = color;
    }

    if (anchor) {
      if (Array.isArray(anchor)) {
        this.anchor.set(...anchor);
      } else {
        this.anchor.set(anchor);
      }
    }
  }
}
