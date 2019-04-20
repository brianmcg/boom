import { Sprite } from '~/core/graphics';

/**
 * Class representing a background sprite.
 * @extends {Sprite}
 */
export default class BackgroundSprite extends Sprite {
  /**
   * Creates a background sprite.
   * @return {[type]}          [description]
   */
  constructor(textures) {
    super();
    this.textures = textures;
    this.texture = textures[Object.keys(textures)[0]][0][0];
  }

  /**
   * Change the sprite texture.
   * @param  {String} key  The key the texture.
   * @param  {Number} x    The x coordinate of the texture.
   * @param  {Number} y    The y coordinate of the texture.
   */
  changeTexture(key, x, y) {
    this.texture = this.textures[key][x][y];
  }
}
