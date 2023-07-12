import { Texture, RenderTexture } from '../../pixi';
import CreatedTextureCache from '../CreatedTextureCache';
import RectangleSprite from '../../components/RectangleSprite';

export default class GraphicsCreator {
  static createTexture(baseTexture, frame) {
    const texture = new Texture(baseTexture, frame);
    CreatedTextureCache.add(texture);
    return texture;
  }

  static createRenderTexture(options) {
    const texture = RenderTexture.create(options);
    CreatedTextureCache.add(texture);
    return texture;
  }

  static createRectangleSprite(options) {
    const sprite = new RectangleSprite(options);
    CreatedTextureCache.add(sprite.texture);
    return sprite;
  }

  static clear() {
    CreatedTextureCache.clear();
  }
}
