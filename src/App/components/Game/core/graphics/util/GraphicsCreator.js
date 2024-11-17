import {
  Texture,
  RenderTexture,
  ColorMatrixFilter,
  Container,
  Sprite,
} from 'pixi.js';
import CreatedTextureCache from './CreatedTextureCache';
import RectangleSprite from '../components/RectangleSprite';
import { BLACK } from '@constants/colors';

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
  static createTexture(source, frame) {
    const texture = new Texture({ source, frame });
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

  static createMaskTexture({ renderer, sprite }) {
    const filter = new ColorMatrixFilter();
    const maskContainer = new Container();

    const maskBackground = new Sprite({
      texture: Texture.WHITE,
      width: sprite.width,
      height: sprite.height,
    });

    const maskForeground = new Sprite(sprite.texture);
    maskForeground.tint = BLACK;

    const renderTexture = RenderTexture.create({
      width: sprite.width,
      height: sprite.height,
    });

    maskContainer.addChild(maskBackground);
    maskContainer.addChild(maskForeground);

    filter.negative();
    maskContainer.filters = [filter];

    renderer.render({
      container: maskContainer,
      target: renderTexture,
    });

    CreatedTextureCache.add(renderTexture);

    return renderTexture;
  }

  /**
   * Clear the created graphics from the cache.
   */
  static clear() {
    CreatedTextureCache.clear();
  }
}
