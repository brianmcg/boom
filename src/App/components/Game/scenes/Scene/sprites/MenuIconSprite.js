import { AnimatedSprite } from '@game/core/graphics';

export default class MenuIconSprite extends AnimatedSprite {
  constructor(textures = [], { size = 1, ...other } = {}) {
    super(textures, { ...other, animationSpeed: 0.2, loop: true, anchor: 0.5 });

    this.scaleRatio = size / this.height;
  }

  setScale(amount = 1) {
    this.scale.set(this.scaleRatio * amount);
  }
}
