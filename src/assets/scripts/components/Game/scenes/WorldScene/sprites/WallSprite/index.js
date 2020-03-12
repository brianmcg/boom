import { Sprite } from 'game/core/graphics';

const TYPES = {
  CLEAR: 'clear',
  STAINED: 'stained',
};

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
   * @param  {String}  image  The name of the image.
   * @param  {Number}  offset The index of the slice.
   */
  changeTexture(image, offset, type) {
    // const type = stained ? TYPES.STAINED : TYPES.CLEAR;
    this.texture = this.textures[image][offset][type];
  }
}

export default WallSprite;
