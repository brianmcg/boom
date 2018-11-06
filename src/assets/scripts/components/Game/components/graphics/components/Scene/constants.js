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
 * Pixel values.
 * @type {Object}
 */
export const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 2,
  MIN_SIZE: 1,
  PAUSE_SIZE: 4,
};
