import { Sprite, GraphicsCreator } from '@game/core/graphics';

export default class EntitySprite extends Sprite {
  constructor(texture, { floorOffset = 0, anchor = [0.5, 1] } = {}) {
    super(texture, { anchor });
    this.zOrder = Number.MAX_VALUE;

    if (floorOffset) {
      this.mask = GraphicsCreator.createRectangleSprite({ anchor });
      this.mask.zOrder = Number.MAX_VALUE;
    }
  }
}
