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
    this.interactiveChildren = false;
    this.eventMode = 'none';

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

  fade(value) {
    this.scale.set(1 - value);
  }

  destroy(options) {
    this.removeAllListeners();
    super.destroy(options);
  }
}
