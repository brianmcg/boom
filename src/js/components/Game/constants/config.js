/**
 * @module  game/constants/config
 */

const URL_PARAMS = new URLSearchParams(window.location.search);

const parseBoolParam = key => {
  const isPresent = URL_PARAMS.has(key);
  const param = URL_PARAMS.get(key);

  return isPresent && param !== 'false';
};

const parseNumParam = (key, fallback = 0) => {
  const num = parseInt(URL_PARAMS.get(key), 10);
  return !Number.isNaN(num) ? num : fallback;
};

/**
 * Debug mode.
 * @type {Number}
 */
export const DEBUG = parseNumParam('debug');

/**
 * The level to load in debug mode.
 * @type {Number}
 */
export const LEVEL = parseNumParam('level', 1);

/**
 * No enemies in the game.
 * @type {Number}
 */
export const ALONE = parseBoolParam('alone');

/**
 * Make player invincible.
 * @type {Boolean}
 */
export const GOD_MODE = parseBoolParam('god');

/**
 * Give player all weapons.
 * @type {Boolean}
 */
export const ALL_WEAPONS = parseBoolParam('allWeapons');

/**
 * Enabled the sounds.
 * @type {Boolean}
 */
export const DISABLE_SOUND = parseBoolParam('disableSound');

/**
 * Display the frames per second on screen.
 * @type {Boolean}
 */
export const SHOW_STATS = parseBoolParam('stats') || Boolean(DEBUG);

/**
 * Enabled the music.
 * @type {Boolean}
 */
export const DISABLE_MUSIC = DISABLE_SOUND || parseBoolParam('disableMusic') || Boolean(DEBUG);

/**
 * The maximum frames per second.
 * @type {Number}
 */
export const MAX_FPS = 60;

/**
 * The volume of the music.
 * @type {Number}
 */
export const MUSIC_VOLUME = 1;

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
export const MOUSE_SENSITIVITY = 0.00125;

/**
 * The number of layers of wall slices to render.
 * @type {Number}
 */
export const WALL_LAYERS = 3;

/**
 * The screen dimensions.
 * @type {Object}
 */
export const SCREEN = { WIDTH: 300, HEIGHT: 128 };

/**
 * The default language to use.
 * @type {String}
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * The players field of view in degrees.
 * @type {Number}
 */
export const FOV = 80;

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

/**
 * The health modifier.
 * @type {Number}
 */
export const HEALTH_MODIFIER = 2;
