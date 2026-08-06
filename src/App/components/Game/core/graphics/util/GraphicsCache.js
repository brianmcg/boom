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
      // Deliberately NOT `destroy(true)`. Destroying a TextureSource makes it
      // emit `change`, and `BindGroup.onResourceChange` reacts by destroying
      // every bind group holding it — including ones owned by shaders that
      // outlive the scene, which are then dead for the rest of the session and
      // throw on the next render (`getResource(0)` off a nulled bind group).
      //
      // Freeing the sources was added to fix a GPU leak; it traded a leak for
      // a crash. The leak is worth attacking from the other end — this app
      // generates tens of thousands of textures per level, which is the real
      // problem.
      if (!texture.destroyed) {
        texture.destroy();
      }
    });

    filterCache.forEach(filter => filter.destroy());

    containerCache.length = 0;
    spriteCache.length = 0;
    textureCache.length = 0;
    filterCache.length = 0;
  }
}
