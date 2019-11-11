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
  SMALL: `${SCREEN.HEIGHT / 14}px ${GAME_FONT.NAME}`,
  MEDIUM: `${SCREEN.HEIGHT / 10}px ${GAME_FONT.NAME}`,
  LARGE: `${SCREEN.HEIGHT / 4}px ${GAME_FONT.NAME}`,
};
