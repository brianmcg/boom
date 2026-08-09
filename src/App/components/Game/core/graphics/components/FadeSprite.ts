// Imports the module's own barrel rather than the sibling file, which is a
// cycle — index imports FadeSprite, FadeSprite imports index. It resolves only
// because index evaluates Sprite first. Preserved; see the migration findings.
import { Sprite, type SpriteOptions } from '@game/core/graphics';

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
