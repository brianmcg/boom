/**
 * @module  game/constants/fonts
 */

import { SCREEN } from './config';
import { GAME_FONT } from './assets';

/**
 * Font sizes.
 * @type {Object}
 */
export const FONT_SIZES = {
  SMALL: `${SCREEN.HEIGHT / 18}px ${GAME_FONT.NAME}`,
  MEDIUM: `${SCREEN.HEIGHT / 12}px ${GAME_FONT.NAME}`,
  LARGE: `${SCREEN.HEIGHT / 6}px ${GAME_FONT.NAME}`,
};
