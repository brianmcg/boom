import { Body } from '@game/core/physics';

export default class Entity extends Body {
  constructor({
    name,
    animationSpeed,
    animated = false,
    scale = 1,
    anchor = 1,
    elavation = 0,
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

    // Height above the floor. Declared on both branches for the same reason.
    this.elavation = elavation;

    this.alwaysRender = alwaysRender;
  }

  /**
   * Where the body appears to be, which is where it is unless a subclass moves
   * it about for effect — see `AbstractEnemy`, whose floating enemies bob.
   * `POVContainer` and `Projectile` want this, never the stored elevation.
   */
  get visualElavation() {
    return this.elavation;
  }
}
