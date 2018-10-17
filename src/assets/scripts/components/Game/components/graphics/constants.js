/**
 * @module constants.
 */


/**
 * The screen dimensions.
 * @type {Object}
 */
export const SCREEN = { WIDTH: 320, HEIGHT: 200 };

/**
 * The hex value for white.
 * @type {Number}
 */
export const WHITE = 0xffffff;

/**
 * The hex value for black.
 * @type {Number}
 */
export const BLACK = 0x000000;

/**
 * The font sizes.
 * @type {Object}
 */
export const FONT_SIZE = {
  SMALL: `${SCREEN.HEIGHT / 15}px font`,
  MEDIUM: `${SCREEN.HEIGHT / 10}px font`,
  LARGE: `${SCREEN.HEIGHT / 5}px font`,
};
