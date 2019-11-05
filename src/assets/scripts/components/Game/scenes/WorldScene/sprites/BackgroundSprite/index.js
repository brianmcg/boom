import { Sprite } from '~/core/graphics';

/**
 * Class representing a background sprite.
 * @extends {Sprite}
 */
class BackgroundSprite extends Sprite {
  /**
   * Creates a background sprite.
   */
  constructor(textures, x, y) {
    super();
    this.x = x;
    this.y = y;
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

export default BackgroundSprite;
