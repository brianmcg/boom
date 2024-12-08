export default class Effect {
  constructor({ sourceId, type, x, y, z = 0, parent, scale = 1 }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.sourceId = sourceId;
    this.parent = parent;
    this.type = type;
    this.scale = scale;
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
