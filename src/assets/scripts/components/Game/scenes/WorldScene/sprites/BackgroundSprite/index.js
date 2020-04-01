import { Sprite } from 'game/core/graphics';

/**
 * Class representing a background sprite.
 * @extends {Sprite}
 */
class BackgroundSprite extends Sprite {
  /**
   * Creates a background sprite.
   * @param  {Array}  textures The sprite textures.
   * @param  {Number} x        The x cordinate of the sprite.
   * @param  {Number} y        The y coordinate of the sprite.
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
   * @param  {String} name The name of the texture.
   * @param  {Number} x    The x coordinate of the texture.
   * @param  {Number} y    The y coordinate of the texture.
   */
  changeTexture(name, x, y) {
    this.texture = this.textures[name][x][y];
  }
}

export default BackgroundSprite;
