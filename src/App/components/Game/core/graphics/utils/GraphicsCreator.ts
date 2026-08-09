import {
  ColorMatrixFilter,
  Texture,
  RenderTexture,
  type Renderer,
  type TextureSource,
} from 'pixi.js';
import { BLACK } from '@constants/colors';
import GraphicsCache from './GraphicsCache';
import RectangleSprite, {
  type RectangleSpriteOptions,
} from '../components/RectangleSprite';
import Sprite, { type SpriteOptions } from '../components/Sprite';
import Container from '../components/Container';
import TextSprite, { type TextSpriteOptions } from '../components/TextSprite';
import FadeSprite, { type FadeSpriteOptions } from '../components/FadeSprite';
import { PixelateFilter } from 'pixi-filters';

/** What `RenderTexture.create` takes, which Pixi does not export by name. */
type RenderTextureOptions = Parameters<typeof RenderTexture.create>[0];

/** What `PixelateFilter` takes. */
type PixelateFilterOptions = ConstructorParameters<typeof PixelateFilter>[0];

export interface MaskTextureOptions {
  renderer: Renderer;
  texture: Texture;
  reverse?: boolean;
}

export default class GraphicsCreator {
  static createFadeSprite(options?: FadeSpriteOptions) {
    const sprite = new FadeSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createSprite(options?: SpriteOptions) {
    const sprite = new Sprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createContainer() {
    const container = new Container();
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPixelateFilter(options?: PixelateFilterOptions) {
    const filter = new PixelateFilter(options);
    GraphicsCache.addFilter(filter);
    return filter;
  }

  static createTextSprite(options: TextSpriteOptions) {
    const sprite = new TextSprite(options);
    GraphicsCache.addSprite(sprite);
    return sprite;
  }

  static createTexture(source: TextureSource, frame: Texture['frame']) {
    const texture = new Texture({ source, frame });

    GraphicsCache.addTexture(texture);

    return texture;
  }

  static createRenderTexture(options: RenderTextureOptions) {
    const texture = RenderTexture.create(options);
    GraphicsCache.addRenderTexture(texture);
    return texture;
  }

  static createRectangleSprite({
    cache = true,
    ...options
  }: RectangleSpriteOptions & { cache?: boolean }) {
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

  static createMaskTexture({
    renderer,
    texture,
    reverse = true,
  }: MaskTextureOptions) {
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

    // Pixi requires the argument; calling it bare passes `undefined`, which
    // `_loadMatrix(matrix, multiply = false)` defaults to exactly this.
    if (reverse) filter.negative(false);

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
