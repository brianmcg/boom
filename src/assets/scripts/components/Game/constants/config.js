/**
 * @module  game/constants/config
 */

const urlParams = new URLSearchParams(window.location.search);

/**
 * Debug mode.
 * @type {Number}
 */
export const DEBUG = parseInt(urlParams.get('debug'), 10);

/**
 * The level to load in debug mode.
 * @type {Number}
 */
export const LEVEL = parseInt(urlParams.get('level'), 10);

/**
 * Display the frames per second on screen.
 * @type {Boolean}
 */
export const DISPLAY_FPS = !!parseInt(urlParams.get('fps'), 10) || !!DEBUG || false;

/**
 * Make player invincible.
 * @type {Booelan}
 */
export const GOD_MODE = !!parseInt(urlParams.get('god'), 10) || false;

/**
 * The maximum frames per second.
 * @type {Number}
 */
export const MAX_FPS = 60;

/**
 * Enabled the music.
 * @type {Boolean}
 */
export const DISABLE_MUSIC = !!DEBUG || false;

/**
 * The volume of the music.
 * @type {Number}
 */
export const MUSIC_VOLUME = 1;

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
  // WIDTH: 256,
  // HEIGHT: 144,
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
export const FOV = 90;

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
