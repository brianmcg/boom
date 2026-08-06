import { Assets } from 'pixi.js';

export default class GraphicsLoader {
  static async load(src) {
    // Deliberately not registered with GraphicsCache. Textures that come out of
    // Assets belong to Assets, and `unload()` below is how they are released —
    // destroying their TextureSource behind its back both warns and leaves
    // Assets holding freed handles. Only textures this app creates itself
    // (render targets, generated masks) are the cache's to destroy.
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
