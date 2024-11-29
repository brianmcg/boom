import { Body } from '@game/core/physics';

export default class Entity extends Body {
  constructor({
    name,
    animationSpeed,
    animated = false,
    scale = 1,
    alwaysRender,
    ...other
  }) {
    super(other);

    this.animationSpeed = animationSpeed;
    this.name = name;
    this.animated = animated;
    this.scale = scale;
    this.alwaysRender = alwaysRender;
  }
}
