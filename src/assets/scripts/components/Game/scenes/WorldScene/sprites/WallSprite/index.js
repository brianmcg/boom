import { Sprite } from '~/core/graphics';

/**
 * Class representing an WallSprite.
 * @extends {Sprite}
 */
export default class WallSprite extends Sprite {
  /**
   * Creates an WallSprite.
   * @param  {Array} textures The texture slices.
   */
  constructor(textures) {
    super();
    this.textures = textures;
  }

  /**
   * Change the xurrent texture.
   * @param  {String}  image  The name of the image.
   * @param  {Number}  offset The index of the slice.
   * @return {undefined}
   */
  changeTexture(image, offset = 0) {
    this.texture = this.textures[image][offset];
  }
}
