import { Assets } from 'pixi.js';

export default class GraphicsLoader {
  static async load(src: string | string[]) {
    // Deliberately not registered with GraphicsCache. Textures that come out of
    // Assets belong to Assets, and `unload()` below is how they are released —
    // destroying their TextureSource behind its back both warns and leaves
    // Assets holding freed handles. Only textures this app creates itself
    // (render targets, generated masks) are the cache's to destroy.
    return Assets.load(src);
  }

  static unload(src: string | string[] = GraphicsLoader.cacheKeys) {
    const keys = Array.isArray(src) ? src : [src];

    return Promise.all(
      keys.reduce<Promise<void>[]>(
        (memo, key) =>
          Assets.cache.has(key) ? [...memo, Assets.unload(key)] : memo,
        []
      )
    );
  }

  /**
   * Pixi's `Cache` has no public way to enumerate what it holds — only `has`,
   * `get`, `set`, `remove` and `reset` — so this reaches for the private map
   * through element access, which is how TypeScript allows saying so out loud.
   */
  static get cacheKeys(): string[] {
    return [...Assets.cache['_cache'].keys()];
  }
}
