import { Texture, RenderTexture } from '../../pixi';
import CreatedTextureCache from '../CreatedTextureCache';
import RectangleSprite from '../../components/RectangleSprite';

/**
 * A helper class for creating graphics.
 */
export default class GraphicsCreator {
  /**
   * Create a texture.
   * @param  {PIXI.BaseTexture} baseTexture The base texture.
   * @param  {PIXI.Rectangle}   frame       The frame.
   * @return {PIXI.Texture}                 The created texture.
   */
  static createTexture(baseTexture, frame) {
    const texture = new Texture(baseTexture, frame);
    CreatedTextureCache.add(texture);
    return texture;
  }

  /**
   * Create a render texture.
   * @param  {Object}             options   The render texture options.
   * @return {PIXI.RenderTexture}           The created render texture.
   */
  static createRenderTexture(options) {
    const texture = RenderTexture.create(options);
    CreatedTextureCache.add(texture);
    return texture;
  }

  /**
   * Create a rectangle sprite.
   * @param  {Object}           options   The base texture.
   * @return {RectangleSprite}            The created rectangle sprite..
   */
  static createRectangleSprite(options) {
    const sprite = new RectangleSprite(options);
    CreatedTextureCache.add(sprite.texture);
    return sprite;
  }

  /**
   * Clear the created graphics from the cache.
   */
  static clear() {
    CreatedTextureCache.clear();
  }
}
