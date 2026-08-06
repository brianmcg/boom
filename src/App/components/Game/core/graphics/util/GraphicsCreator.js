import { ColorMatrixFilter, Texture, RenderTexture } from 'pixi.js';
import { BLACK } from '@constants/colors';
import GraphicsCache from './GraphicsCache';
import RectangleSprite from '../components/RectangleSprite';
import Sprite from '../components/Sprite';
import Container from '../components/Container';
import TextSprite from '../components/TextSprite';
import FadeSprite from '../components/FadeSprite';
import { PixelateFilter } from 'pixi-filters';

export default class GraphicsCreator {
  static createFadeSprite(options) {
    const sprite = new FadeSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createSprite(options) {
    const sprite = new Sprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

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
    GraphicsCache.addRenderTexture(texture);
    return texture;
  }

  static createRectangleSprite({ cache = true, ...options }) {
    const sprite = new RectangleSprite(options);

    if (cache) {
      // The sprite is ours to destroy; its texture is not. A RectangleSprite
      // draws the global `Texture.WHITE`, shared by every rectangle in the
      // game, and the cache destroys what it holds with `destroy(true)` —
      // which would take the singleton's source with it, for good. It is never
      // recreated, so the next scene to bind it renders a null resource.
      GraphicsCache.addSprite(sprite);
    }

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

    // Sprites only, never their textures: maskBackground holds the global
    // Texture.WHITE that every RectangleSprite shares, and maskForeground holds
    // a texture from the loaded atlas that the caller is still drawing.
    // Destroying either frees it for the whole application — Texture.WHITE is a
    // singleton and is never recreated — and the next thing to bind it renders
    // a null resource. Only renderTexture is ours, and GraphicsCache owns it.
    maskContainer.destroy();
    maskBackground.destroy();
    maskForeground.destroy();

    GraphicsCache.addRenderTexture(renderTexture);

    return renderTexture;
  }
}
