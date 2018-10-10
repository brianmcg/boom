import * as PIXI from 'pixi.js';

/**
 * @module util
 */

/**
 * Clear the texture cache.
 */
export const clearCache = () => {
  const { TextureCache } = PIXI.utils;
  Object.keys(TextureCache).forEach((key) => {
    if (TextureCache[key]) {
      TextureCache[key].destroy(true);
    }
  });
};

/**
 * Get the max scale of the canvas that fits window.
 * @return {Number} The maximum scale factor.
 */
export const getMaxScaleFactor = (screenWidth, screenHeight) => {
  const windowWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  const windowHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  const widthRatio = windowWidth / screenWidth;
  const heightRatio = windowHeight / screenHeight;

  return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
};
