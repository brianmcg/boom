import { SCREEN } from '@constants/config';
import {
  BitmapText,
  type ColorSource,
  type DestroyOptions,
  type TextStyleOptions,
} from 'pixi.js';
import type { Anchor } from '../types';

export interface TextSpriteOptions {
  text?: string;
  fontFamily?: TextStyleOptions['fontFamily'];
  fontSize?: TextStyleOptions['fontSize'];
  color?: ColorSource;
  x?: number;
  y?: number;
  alpha?: number;
  anchor?: Anchor;
  maxWidth?: number;
}

export default class TextSprite extends BitmapText {
  /** Not a Pixi member, and read nowhere — see the migration findings. */
  maxWidth: number;

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
  }: TextSpriteOptions) {
    super({ text: text.toUpperCase(), style: { fontFamily, fontSize } });

    // x, y, alpha, tint, interactiveChildren and eventMode are all Pixi's;
    // assigning is what runs their setters.
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

  fade(value: number) {
    this.scale.set(1 - value);
  }

  destroy(options?: DestroyOptions) {
    this.removeAllListeners();
    super.destroy(options);
  }
}
