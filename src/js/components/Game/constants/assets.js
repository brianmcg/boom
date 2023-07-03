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
 * The scene types.
 * @type {Object}
 */
export const SCENE_PATHS = {
  TITLE: 'title',
  WORLD: 'world',
  CREDITS: 'credits',
};

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

export const TITLE_SCENE_ASSETS = {
  sound: {
    name: SCENE_MUSIC.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.TITLE}/${SCENE_MUSIC.FILE}`,
    loop: false,
  },
  graphics: {
    name: SCENE_GRAPHICS.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.TITLE}/${SCENE_GRAPHICS.FILE}`,
  },
};

export const WORLD_SCENE_ASSETS = index => ({
  sound: {
    name: SCENE_MUSIC.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.WORLD}/${index}/${SCENE_MUSIC.FILE}`,
    loop: true,
  },
  graphics: {
    name: SCENE_GRAPHICS.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.WORLD}/${index}/${SCENE_GRAPHICS.FILE}`,
  },
  data: {
    name: SCENE_MAP.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.WORLD}/${index}/${SCENE_MAP.FILE}`,
  },
});

export const CREDITS_SCENE_ASSETS = {
  sound: {
    name: SCENE_MUSIC.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.CREDITS}/${SCENE_MUSIC.FILE}`,
    loop: false,
  },
  graphics: {
    name: SCENE_GRAPHICS.NAME,
    src: `${SCENE_PATH}/${SCENE_PATHS.CREDITS}/${SCENE_GRAPHICS.FILE}`,
  },
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
