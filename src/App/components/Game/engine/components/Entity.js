import { Body } from '@game/core/physics';

export default class Entity extends Body {
  constructor({
    name,
    animationSpeed,
    animated = false,
    scale = 1,
    anchor = 1,
    alwaysRender,
    ...other
  }) {
    super(other);

    this.animationSpeed = animationSpeed;
    this.name = name;
    this.animated = animated;
    this.scale = scale;

    // Where the sprite sits vertically, read only by POVContainer. Declared on
    // both this and DynamicEntity because they are sibling branches of Body,
    // and everything drawn as a sprite comes from one or the other.
    this.anchor = anchor;

    this.alwaysRender = alwaysRender;
  }
}
