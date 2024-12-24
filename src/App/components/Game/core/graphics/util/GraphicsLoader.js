import { Assets } from 'pixi.js';
import GraphicsCache from './GraphicsCache';

export default class GraphicsLoader {
  static async load(src) {
    const assets = await Assets.load(src);

    if (assets.textures) {
      Object.values(assets.textures).forEach(texture =>
        GraphicsCache.addTexture(texture)
      );
    }

    return assets;
  }

  static unload(src = GraphicsLoader.cacheKeys) {
    const keys = Array.isArray(src) ? src : [src];

    return Promise.all(
      keys.reduce(
        (memo, key) =>
          Assets.cache.has(key) ? [...memo, Assets.unload(key)] : memo,
        []
      )
    );
  }

  static get cacheKeys() {
    return [...Assets.cache._cache.keys()];
  }
}
