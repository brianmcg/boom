/**
 * @module  game/constants/config
 */

/**
 * Debug mode on or off.
 * @type {Boolean}
 */
export const DEBUG = false;

/**
 * The maximum frames per second.
 * @type {Number}
 */
export const MAX_FPS = 60;

/**
 * Enabled the music.
 * @type {Boolean}
 */
export const DISABLE_MUSIC = DEBUG || false;

/**
 * The volume of the music.
 * @type {Number}
 */
export const MUSIC_VOLUME = 0.2;

/**
 * Enabled the sounds.
 * @type {Boolean}
 */
export const DISABLE_SOUNDS = false;

/**
 * The difficulty level.
 * @type {Number}
 */
export const DIFFICULTY = 0;

/**
 * The size of mao tile.
 * @type {Number}
 */
export const CELL_SIZE = 32;

/**
 * The sensitivity of the mouse movement.
 * @type {Number}
 */
export const MOUSE_SENSITIVITY = 0.5;

/**
 * The number of layers of wall slices to render.
 * @type {Number}
 */
export const WALL_LAYERS = 3;

/**
 * The screen dimensions.
 * @type {Object}
 */
export const SCREEN = {
  WIDTH: 224,
  HEIGHT: 126,
};

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
export const UPDATE_DISTANCE = CELL_SIZE * 20;

/**
 * The max distance a sound can travel.
 * @type {Number}
 */
export const MAX_SOUND_DISTANCE = CELL_SIZE * 16;
