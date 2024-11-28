import { Sprite } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

export default class LogoSprite extends Sprite {
  constructor(texture) {
    super(texture);

    this.maxScale = (SCREEN.HEIGHT * 0.6) / this.height;
    this.anchor.set(0.5);
    this.scale.set(this.maxScale);
  }

  fade(value) {
    this.scale.set((1 - value) * this.maxScale);
  }
}
