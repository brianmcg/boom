import { Texture, Sprite } from 'pixi.js';

export default class RectangleSprite extends Sprite {
  constructor({
    color,
    x = 0,
    y = 0,
    width = 10,
    height = 10,
    alpha = 1,
    anchor = 0,
  } = {}) {
    super(Texture.WHITE);

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
