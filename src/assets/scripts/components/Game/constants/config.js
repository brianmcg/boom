/**
 * @module  game/constants/config
 */

/**
 * The maximum frames per second.
 * @type {Number}
 */
export const MAX_FPS = 60;

/**
 * The time step.
 * @type {Number}
 */
export const TIME_STEP = 1000 / MAX_FPS;

/**
 * The number of levels in the game.
 * @type {Number}
 */
export const NUM_LEVELS = 1;

/**
 * Enabled the sound.
 * @type {Boolean}
 */
export const SOUND_ENABLED = true;

/**
 * The size of mao tile.
 * @type {Number}
 */
export const TILE_SIZE = 64;

/**
 * The screen dimensions.
 * @type {Object}
 */
export const SCREEN = { WIDTH: 210, HEIGHT: 90 };

/**
 * Debug mode on or off.
 * @type {Boolean}
 */
export const DEBUG = true;

/**
 * The draw distance.
 * @type {Number}
 */
export const DRAW_DISTANCE = TILE_SIZE * 10;
