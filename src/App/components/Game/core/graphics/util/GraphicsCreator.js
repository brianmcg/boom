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

export default class GraphicsCreator {
  static createTexture(source, frame) {
    const texture = new Texture({ source, frame });
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

  static createMaskTexture({ renderer, texture, reverse = true }) {
    const filter = new ColorMatrixFilter();
    const maskContainer = new Container();

    const maskBackground = new Sprite({
      texture: Texture.WHITE,
      width: texture.width,
      height: texture.height,
    });

    const maskForeground = new Sprite(texture);
    maskForeground.tint = BLACK;

    const renderTexture = RenderTexture.create({
      width: texture.frame.width,
      height: texture.frame.height,
    });

    maskContainer.addChild(maskBackground);
    maskContainer.addChild(maskForeground);

    if (reverse) filter.negative();

    maskContainer.filters = [filter];

    renderer.render({
      container: maskContainer,
      target: renderTexture,
    });

    maskContainer.destroy({ texture: true });
    maskBackground.destroy({ texture: true });
    maskForeground.destroy({ texture: true });

    CreatedTextureCache.add(renderTexture);

    return renderTexture;
  }

  static clear() {
    CreatedTextureCache.clear();
  }
}
