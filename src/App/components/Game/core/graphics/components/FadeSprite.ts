import Sprite, { type SpriteOptions } from './Sprite';

export interface FadeSpriteOptions extends SpriteOptions {
  maxScale?: number;
}

export default class FadeSprite extends Sprite {
  readonly maxScale: number;

  constructor({ texture, maxScale = 1 }: FadeSpriteOptions = {}) {
    super({ texture });

    this.maxScale = maxScale;
    this.anchor.set(0.5);
    this.scale.set(maxScale);
  }

  fade(value: number) {
    this.scale.set((1 - value) * this.maxScale);
  }
}
