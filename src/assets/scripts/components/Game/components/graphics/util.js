import * as PIXI from 'pixi.js';
import { SCREEN } from './constants';

/**
 * @module util
 */

/**
 * Clear the texture cache.
 */
export const clearCache = () => {
  const { TextureCache } = PIXI.utils;
  Object.keys(TextureCache).forEach((key) => {
    if (TextureCache[key] && !key.includes('font')) {
      TextureCache[key].destroy(true);
    }
  });
};

/**
 * Get the max scale of the canvas that fits window.
 * @return {Number} The maximum scale factor.
 */
export const getMaxScaleFactor = () => {
  const windowWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  const windowHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  const widthRatio = windowWidth / SCREEN.WIDTH;
  const heightRatio = windowHeight / SCREEN.HEIGHT;

  return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
};
