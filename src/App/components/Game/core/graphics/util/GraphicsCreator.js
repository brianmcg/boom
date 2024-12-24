import { ColorMatrixFilter, Texture, RenderTexture } from 'pixi.js';
import { BLACK } from '@constants/colors';
import GraphicsCache from './GraphicsCache';
import RectangleSprite from '../components/RectangleSprite';
import Sprite from '../components/Sprite';
import Container from '../components/Container';
import TextSprite from '../components/TextSprite';
import { PixelateFilter } from 'pixi-filters';

export default class GraphicsCreator {
  static createContainer(options) {
    const container = new Container(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPixelateFilter(options) {
    const filter = new PixelateFilter(options);
    GraphicsCache.addFilter(filter);
    return filter;
  }

  static createTextSprite(options) {
    const sprite = new TextSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createTexture(source, frame) {
    const texture = new Texture({ source, frame });
    GraphicsCache.addTexture(texture);
    return texture;
  }

  static createRenderTexture(options) {
    const texture = RenderTexture.create(options);
    GraphicsCache.addTexture(texture);
    return texture;
  }

  static createRectangleSprite(options) {
    const sprite = new RectangleSprite(options);
    GraphicsCache.addSprite(sprite);
    GraphicsCache.addTexture(sprite.texture);
    return sprite;
  }

  static createMaskTexture({ renderer, texture, reverse = true }) {
    const filter = new ColorMatrixFilter();
    const maskContainer = new Container();

    const maskBackground = new Sprite({
      texture: Texture.WHITE,
    });

    const maskForeground = new Sprite({ texture });
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

    maskContainer.filters = [];
    filter.destroy();
    maskContainer.destroy({ texture: true });
    maskBackground.destroy({ texture: true });
    maskForeground.destroy({ texture: true });

    GraphicsCache.addTexture(renderTexture);

    return renderTexture;
  }
}
