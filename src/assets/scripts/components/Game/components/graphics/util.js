import * as PIXI from 'pixi.js';

export default {
  clearCache() {
    const { TextureCache } = PIXI.utils;

    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key]) {
        TextureCache[key].destroy(true);
      }
    });
  },
};
