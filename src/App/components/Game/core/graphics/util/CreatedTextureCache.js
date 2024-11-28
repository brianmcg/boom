const textureCache = new Set();

export default class CreatedTextureCache {
  static add(texture) {
    if (texture) {
      textureCache.add(texture);
    }
  }

  static clear() {
    Array.from(textureCache).forEach(texture => texture.destroy());
    textureCache.clear();
  }
}
