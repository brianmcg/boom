/**
 * @module constants
 */

/**
 * The scene states.
 * @type {Object}
 */
export const STATES = {
  LOADING: 'LOADING',
  FADING_IN: 'FADING_IN',
  FADING_OUT: 'FADING_OUT',
  PAUSED: 'PAUSED',
  DEFAULT: 'DEFAULT',
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
};

/**
 * The scene events.
 * @type {Object}
 */
export const EVENTS = {
  SCENE_COMPLETE: 'SCENE_COMPLETE',
  SCENE_RESTART: 'SCENE_RESTART',
  SCENE_QUIT: 'SCENE_QUIT',
};

/**
 * The scene types.
 * @type {Object}
 */
export const TYPES = {
  TITLE: 'title',
  WORLD: 'world',
  CREDITS: 'credits',
};

/**
 * The scene asset file paths.
 * @type {Object}
 */
export const PATHS = {
  SPRITE_SHEET: 'assets/media/spritesheets',
  MAP: 'assets/media/maps',
};

/**
 * Pixel values.
 * @type {Object}
 */
export const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 2,
  MIN_SIZE: 1,
  PAUSE_SIZE: 4,
};
