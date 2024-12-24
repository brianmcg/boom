import { AnimatedSprite } from '@game/core/graphics';

export default class MenuIconSprite extends AnimatedSprite {
  constructor({ textures = [], size = 1, ...other } = {}) {
    super({ textures, ...other, animationSpeed: 0.2, loop: true });

    this.scaleRatio = size / this.height;

    this.height *= this.scaleRatio;
    this.width *= this.scaleRatio;
    this.anchor.set(0, 0.5);
  }

  // setScale(amount = 1) {
  //   this.scale.set(this.scaleRatio * amount);
  // }
}
