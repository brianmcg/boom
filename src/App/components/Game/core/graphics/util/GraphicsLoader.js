import { Assets } from 'pixi.js';

export default class GraphicsLoader {
  static load(src) {
    return Assets.load(src);
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
