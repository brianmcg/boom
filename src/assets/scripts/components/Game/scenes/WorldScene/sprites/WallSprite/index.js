import { Sprite } from '~/core/graphics';

/**
 * Class representing an WallSprite.
 * @extends {Sprite}
 */
class WallSprite extends Sprite {
  /**
   * Creates an WallSprite.
   * @param  {Array} textures The texture slices.
   */
  constructor(textures) {
    super();
    this.textures = textures;
    this.zIndex = Number.MAX_VALUE;
  }

  /**
   * Change the xurrent texture.
   * @param  {String}  image  The name of the image.
   * @param  {Number}  offset The index of the slice.
   */
  changeTexture(image, offset) {
    this.texture = this.textures[image][offset];
  }
}

export default WallSprite;
