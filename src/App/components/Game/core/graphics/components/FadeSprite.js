import { Sprite } from '@game/core/graphics';

export default class FadeSprite extends Sprite {
  constructor({ texture, maxScale = 1 } = {}) {
    super({ texture });

    this.maxScale = maxScale;
    this.anchor.set(0.5);
    this.scale.set(maxScale);
  }

  fade(value) {
    this.scale.set((1 - value) * this.maxScale);
  }
}
