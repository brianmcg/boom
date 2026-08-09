import { Point } from '@game/core/physics';

export default class Effect {
  constructor({ sourceId, type, x, y, elavation = 0, parent, scale = 1 }) {
    // An effect has a world position without being a Body, which is why the
    // measuring methods take a Point rather than anything body-shaped.
    this.pos = new Point(x, y);
    this.elavation = elavation;
    this.sourceId = sourceId;
    this.parent = parent;
    this.type = type;
    this.scale = scale;
  }

  /** Delegate to `pos`, so every existing `effect.x` read keeps working. */
  get x() {
    return this.pos.x;
  }

  set x(value) {
    this.pos.x = value;
  }

  get y() {
    return this.pos.y;
  }

  set y(value) {
    this.pos.y = value;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.removeEffect(this);
      this.parent = null;
    }
  }

  destroy() {
    this.removeFromParent();
  }
}
