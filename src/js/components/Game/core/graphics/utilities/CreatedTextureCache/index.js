const textureCache = new Set();
const baseTextureCache = new Set();

/**
 * A cache for holding created textures.
 */
export default class CreatedTextureCache {
  /**
   * Add a texture.
   * @param {PIXI.Texture} textureThe texture to add.
   */
  static add(texture) {
    if (texture) {
      textureCache.add(texture);

      if (texture.baseTexture) {
        baseTextureCache.add(texture.baseTexture);
      }
    }
  }

  /**
   * Clear the textures from the cache.
   */
  static clear() {
    Array.from(textureCache).forEach(texture => texture.destroy());
    Array.from(baseTextureCache).forEach(texture => texture.destroy());

    textureCache.clear();
    baseTextureCache.clear();
  }
}
