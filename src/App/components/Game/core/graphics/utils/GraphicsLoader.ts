import { Assets } from 'pixi.js';

/**
 * What this module has loaded and not yet unloaded.
 *
 * Only the sources handed to {@link GraphicsLoader.load} — never the atlas
 * frames and font variants Pixi derives from them, which is the point:
 * `Cache.remove` drops every key associated with a source, so releasing the
 * source releases the rest. Naming the derived keys instead means iterating a
 * list that goes stale as you unload it, each already-removed key logging
 * `[Assets] Asset id … was not found in the Cache`.
 *
 * The same shape as `SoundLoader`'s cache, and the reason nothing here has to
 * ask Pixi what it is holding.
 */
const cache = new Set<string>();

export default class GraphicsLoader {
  static async load(src: string | string[]) {
    // Deliberately not registered with GraphicsCache. Textures that come out of
    // Assets belong to Assets, and `unload()` below is how they are released —
    // destroying their TextureSource behind its back both warns and leaves
    // Assets holding freed handles. Only textures this app creates itself
    // (render targets, generated masks) are the cache's to destroy.
    const assets = await Assets.load(src);

    (Array.isArray(src) ? src : [src]).forEach(key => cache.add(key));

    return assets;
  }

  /**
   * Unloads one source, or everything still loaded.
   *
   * A scene names its own graphics on the way out, which is what keeps the
   * game-wide assets — the bitmap font — loaded across scene changes. Only
   * `Game.exit` calls this bare, and only then does the default take the lot.
   */
  static unload(src: string | string[] = [...cache]) {
    const keys = Array.isArray(src) ? src : [src];

    return Promise.all(
      keys.reduce<Promise<void>[]>((memo, key) => {
        if (!cache.has(key)) {
          return memo;
        }

        cache.delete(key);

        return [...memo, Assets.unload(key)];
      }, [])
    );
  }
}
