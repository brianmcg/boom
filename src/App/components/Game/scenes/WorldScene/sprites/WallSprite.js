import { Sprite } from '@game/core/graphics';

export default class WallSprite extends Sprite {
  constructor(textures, index) {
    super();
    this.x = index;

    this.textures = textures;
    this.zOrder = Number.MAX_VALUE;
    this.roundPixels = true;
  }

  changeTexture(name, offset, spatter) {
    this.texture = this.textures[name][offset][spatter];
  }
}
