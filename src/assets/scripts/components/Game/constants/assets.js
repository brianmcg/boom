/**
 * @module  game/constants/assets
 */

/**
 * The path to the game asset directory.
 * @type {String}
 */
export const GAME_PATH = 'assets/data';

/**
 * The path to the scene asset directory.
 * @type {String}
 */
export const SCENE_PATH = `${GAME_PATH}/scenes`;

/**
 * The game sound properties.
 * @type {Object}
 */
export const GAME_SOUNDS = {
  NAME: 'sounds',
  FILE: 'sounds.mp3',
  SPRITE: 'sounds.json',
};

/**
 * The game font.
 * @type {Object}
 */
export const GAME_FONT = {
  NAME: 'font',
  FILE: 'font.xml',
};

/**
 * The game data.
 * @type {String}
 */
export const GAME_DATA = 'data.json';

/**
 * The scene music file name.
 * @type {String}
 */
export const SCENE_MUSIC = {
  NAME: 'music',
  FILE: 'music.weba',
};

/**
 * The scene graphics.
 * @type {String}
 */
export const SCENE_GRAPHICS = 'graphics.json';

/**
 * The scene map file name.
 * @type {String}
 */
export const SCENE_MAP = 'map.json';

/**
 * The scene types.
 * @type {Object}
 */
export const SCENE_TYPES = {
  TITLE: 'title',
  WORLD: 'world',
  CREDITS: 'credits',
};

/**
 * The enemy types.
 * @type {Object}
 */
export const ENEMY_TYPES = {
  GUN: 'gunenemy',
  CHASE: 'chaseenemy',
  PROJECTILE: 'projectileenemy',
};

/**
 * The enemy types.
 * @type {Object}
 */
export const ITEM_TYPES = {
  KEY: 'keyitem',
  AMMO: 'ammoitem',
  HEALTH: 'healthitem',
  WEAPON: 'weaponitem',
};
