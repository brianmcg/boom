/**
 * @module  font.
 */

import { SCREEN } from './config';
import { FONT_TYPES } from './assets';

/**
 * Font sizes.
 * @type {Object}
 */
export const FONT_SIZES = {
  SMALL: `${SCREEN.HEIGHT / 12}px ${FONT_TYPES.MAIN}`,
  MEDIUM: `${SCREEN.HEIGHT / 6}px ${FONT_TYPES.MAIN}`,
  LARGE: `${SCREEN.HEIGHT / 4}px ${FONT_TYPES.MAIN}`,
};
