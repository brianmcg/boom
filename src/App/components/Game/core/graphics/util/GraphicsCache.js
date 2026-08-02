const containerCache = [];
const spriteCache = [];
const textureCache = [];
const filterCache = [];

export default class GraphicsCache {
  static addContainer(container) {
    if (container?.destroy) {
      containerCache.push(container);
    }
  }

  static addSprite(sprite) {
    if (sprite?.destroy) {
      spriteCache.push(sprite);
    }
  }

  static addTexture(texture) {
    if (texture?.destroy) {
      textureCache.push(texture);
    }
  }

  static addFilter(filter) {
    if (filter) {
      filterCache.push(filter);
    }
  }

  static clear() {
    containerCache.forEach(container => container.destroy());
    spriteCache.forEach(sprite => sprite.destroy());
    textureCache.forEach(texture => {
      // Destroy the underlying TextureSource / render target too, otherwise the
      // persistent renderer keeps every generated texture's GPU resources alive.
      if (!texture.destroyed) {
        texture.destroy(true);
      }
    });
    filterCache.forEach(filter => filter.destroy());

    containerCache.length = 0;
    spriteCache.length = 0;
    textureCache.length = 0;
    filterCache.length = 0;
  }
}
