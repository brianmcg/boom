/**
 * @module helpers
 */

/**
 * Get the max scale of the canvas that fits window.
 * @param  {Number} width  The given width.
 * @param  {Number} height The given height.
 * @return {Number} The maximum scale factor.
 */
export const getMaxScale = (width = 320, height = 180) => {
  const windowWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  const windowHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  const widthRatio = windowWidth / width;
  const heightRatio = windowHeight / height;

  return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
};
