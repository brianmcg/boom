import type { Container, Filter, RenderTexture, Texture } from 'pixi.js';

const containerCache: Container[] = [];
const spriteCache: Container[] = [];
const textureCache: Texture[] = [];
const renderTextureCache: RenderTexture[] = [];
const filterCache: Filter[] = [];

export default class GraphicsCache {
  static addContainer(container?: Container) {
    if (container?.destroy) {
      containerCache.push(container);
    }
  }

  static addSprite(sprite?: Container) {
    if (sprite?.destroy) {
      spriteCache.push(sprite);
    }
  }

  /**
   * A texture that frames a source it did not create — an atlas page, or
   * another texture's render target. The view is ours to destroy; the source
   * belongs to whoever made it. The world scene registers tens of thousands of
   * these, all framing a handful of atlas pages.
   */
  static addTexture(texture?: Texture) {
    if (texture?.destroy) {
      textureCache.push(texture);
    }
  }

  /**
   * A texture that created its own source — a render target. Nothing else holds
   * that source, so this is the only thing that can free the GPU memory.
   */
  static addRenderTexture(texture?: RenderTexture) {
    if (texture?.destroy) {
      renderTextureCache.push(texture);
    }
  }

  static addFilter(filter?: Filter) {
    if (filter) {
      filterCache.push(filter);
    }
  }

  static clear() {
    containerCache.forEach(container => container.destroy());
    spriteCache.forEach(sprite => sprite.destroy());

    // Views only. Freeing the source here would destroy an atlas page shared by
    // every other frame cut from it — and `Assets.unload()` already owns those.
    textureCache.forEach(texture => {
      if (!texture.destroyed) {
        texture.destroy();
      }
    });

    // Source included: these are the GPU render targets this app allocated, and
    // nothing else will release them.
    //
    // This is the line that pixi 8.17 turned into a crash — a destroyed source
    // emits `change`, and from 8.17 `BindGroup.onResourceChange` destroys the
    // whole bind group holding it rather than clearing one slot. pixi is pinned
    // to 8.16 for that reason; read the note in CLAUDE.md before bumping.
    renderTextureCache.forEach(texture => {
      if (!texture.destroyed) {
        texture.destroy(true);
      }
    });

    filterCache.forEach(filter => filter.destroy());

    containerCache.length = 0;
    spriteCache.length = 0;
    textureCache.length = 0;
    renderTextureCache.length = 0;
    filterCache.length = 0;
  }
}
