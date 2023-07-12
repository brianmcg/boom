const textureCache = new Set();
const baseTextureCache = new Set();

export default class CreatedTextureCache {
  static add(texture) {
    if (texture) {
      textureCache.add(texture);

      if (texture.baseTexture) {
        baseTextureCache.add(texture.baseTexture);
      }
    }
  }

  static clear() {
    Array.from(textureCache).forEach(texture => texture.destroy());
    Array.from(baseTextureCache).forEach(texture => texture.destroy());

    textureCache.clear();
    baseTextureCache.clear();
  }
}
