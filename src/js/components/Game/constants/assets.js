/**
 * @module  game/constants/assets
 */

/**
 * The path to the game asset directory.
 * @type {String}
 */
export const GAME_PATH = 'assets';

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
  FILE: 'sounds.ogg',
  SPRITE: 'sounds.json',
};

/**
 * The game font.
 * @type {Object}
 */
export const GAME_FONT = {
  NAME: 'doom_regular',
  FILE: 'doom_regular.xml',
};

/**
 * The game data.
 * @type {Object}
 */
export const GAME_DATA = {
  NAME: 'data',
  FILE: 'data.json',
};

/**
 * The scene music file name.
 * @type {String}
 */
export const SCENE_MUSIC = {
  NAME: 'music',
  FILE: 'music.mp3',
};

/**
 * The scene graphics.
 * @type {Object}
 */
export const SCENE_GRAPHICS = {
  NAME: 'graphics',
  FILE: 'graphics.json',
};

/**
 * The scene map file name.
 * @type {Object}
 */
export const SCENE_MAP = {
  NAME: 'map',
  FILE: 'map.json',
};

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
  PORTAL: 'portalitem',
};

export const GAME_ASSETS = {
  sound: {
    name: GAME_SOUNDS.NAME,
    src: `${GAME_PATH}/${GAME_SOUNDS.FILE}`,
    spriteSrc: `${GAME_PATH}/${GAME_SOUNDS.SPRITE}`,
  },
  graphics: {
    name: GAME_FONT.NAME,
    src: `${GAME_PATH}/${GAME_FONT.FILE}`,
  },
  data: {
    name: GAME_DATA.NAME,
    src: `${GAME_PATH}/${GAME_DATA.FILE}`,
  },
};
