/**
 * @module  font.
 */

import { SCREEN } from './config';
import { DATA_TYPES } from './assets';

/**
 * Font sizes.
 * @type {Object}
 */
export const FONT_SIZES = {
  SMALL: `${SCREEN.HEIGHT / 12}px ${DATA_TYPES.FONT}`,
  MEDIUM: `${SCREEN.HEIGHT / 6}px ${DATA_TYPES.FONT}`,
  LARGE: `${SCREEN.HEIGHT / 4}px ${DATA_TYPES.FONT}`,
};
