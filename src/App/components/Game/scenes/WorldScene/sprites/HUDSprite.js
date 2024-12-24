import { Sprite } from '@game/core/graphics';

export default class HUDSprite extends Sprite {
  constructor({ texture, maxScale = 1, anchor } = {}) {
    super({ texture });

    this.maxScale = maxScale;
    this.scale.set(maxScale);

    if (anchor) {
      this.anchor.set(anchor);
    }
  }

  fade(value) {
    this.scale.set((1 - value) * this.maxScale);
  }
}
