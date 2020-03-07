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
 * Enabled the sound.
 * @type {Boolean}
 */
export const SOUND_ENABLED = false;

/**
 * The size of mao tile.
 * @type {Number}
 */
export const TILE_SIZE = 32;

/**
 * The screen dimensions.
 * @type {Object}
 */
export const SCREEN = {
  WIDTH: 300,
  HEIGHT: 167,
};

/**
 * Debug mode on or off.
 * @type {Boolean}
 */
export const DEBUG = false;

/**
 * The default language to use.
 * @type {String}
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * The players field of view in degrees.
 * @type {Number}
 */
export const FOV = 60;

/**
 * The distance from the player inside which entities should update;
 * @type {Number}
 */
export const UPDATE_DISTANCE = TILE_SIZE * 20;

/**
 * The max distance a sound can travel.
 * @type {Number}
 */
export const MAX_SOUND_DISTANCE = 1000;
