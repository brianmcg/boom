/**
 * @module  font.
 */

import { SCREEN } from './config';
import { DATA } from './assets';

/**
 * Font sizes.
 * @type {Object}
 */
export const FONT_SIZES = {
  SMALL: `${SCREEN.HEIGHT / 12}px ${DATA.FONT}`,
  MEDIUM: `${SCREEN.HEIGHT / 6}px ${DATA.FONT}`,
  LARGE: `${SCREEN.HEIGHT / 4}px ${DATA.FONT}`,
};
