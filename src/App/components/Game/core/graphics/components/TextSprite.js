import { SCREEN } from '@constants/config';
import { BitmapText } from 'pixi.js';

export default class TextSprite extends BitmapText {
  constructor({
    text = '',
    fontFamily,
    fontSize,
    color,
    x = 0,
    y = 0,
    alpha = 1,
    anchor,
    maxWidth = SCREEN.WIDTH,
  }) {
    super({ text: text.toUpperCase(), style: { fontFamily, fontSize } });

    this.x = x;
    this.y = y;
    this.alpha = alpha;
    this.maxWidth = maxWidth;

    if (color || color === 0) {
      this.tint = color;
    }

    if (anchor) {
      this.anchor.set(anchor);
    }
  }

  fade(value) {
    this.scale.set(1 - value);
  }

  destroy(options = {}) {
    super.destroy({ ...options, texture: true });
  }
}
