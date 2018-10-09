import * as PIXI from 'pixi.js';

/**
 * @module util
 */
export default {
  clearCache() {
    const { TextureCache } = PIXI.utils;
    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key]) {
        TextureCache[key].destroy(true);
      }
    });
  },
  getScale(screen) {
    const widthRatio = window.innerWidth / screen.WIDTH;
    const heightRatio = window.innerHeight / screen.HEIGHT;
    const scaleFactor = Math.floor(Math.min(widthRatio, heightRatio)) || 1;

    return {
      factor: scaleFactor,
      width: screen.WIDTH * scaleFactor,
      height: screen.HEIGHT * scaleFactor,
    };
  },
};
