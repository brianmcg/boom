import { Sprite } from '@game/core/graphics';

/**
 * Class representing an WallSprite.
 * @extends {Sprite}
 */
class WallSprite extends Sprite {
  /**
   * Creates an WallSprite.
   * @param  {Array}  textures The texture slices.
   * @param  {Number} index    The index of the wall sprite.
   */
  constructor(textures, index) {
    super();
    this.x = index;

    this.textures = textures;
    this.zOrder = Number.MAX_VALUE;
  }

  /**
   * Change the xurrent texture.
   * @param  {String}  name  The name of the texture.
   * @param  {Number}  offset The index of the slice.
   */
  changeTexture(name, offset, spatter) {
    this.texture = this.textures[name][offset][spatter];
  }
}

export default WallSprite;
