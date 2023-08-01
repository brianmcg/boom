/**
 * @module  game/constants/assets
 */

const GAME_PATH = 'assets';

const GAME_SOUNDS = {
  FILE: 'sounds.ogg',
  SPRITE: 'sounds.json',
};

const GAME_DATA = 'data.json';

const SCENE_MUSIC = 'music.mp3';

const SCENE_GRAPHICS = 'graphics.json';

const SCENE_MAP = 'map.json';

const SCENE_PATH = `${GAME_PATH}/scenes`;

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
 * The game font.
 * @type {Object}
 */
export const GAME_FONT = {
  NAME: 'DoomRegular',
  FILE: 'doom_regular.xml',
};

/**
 * The enemy types.
 * @type {Object}
 */
export const ENEMY_TYPES = {
  GUN: 'gunenemy',
  CHASE: 'chaseenemy',
  PROJECTILE: 'projectileenemy',
  ARACHNACOPTER: 'arachnacopter',
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
    src: `${SCENE_PATH}/${SCENE_TYPES.TITLE}/${SCENE_MUSIC}`,
    loop: false,
  },
  graphics: `${SCENE_PATH}/${SCENE_TYPES.TITLE}/${SCENE_GRAPHICS}`,
};

export const WORLD_SCENE_ASSETS = index => ({
  sound: {
    src: `${SCENE_PATH}/${SCENE_TYPES.WORLD}/${index}/${SCENE_MUSIC}`,
    loop: true,
  },
  graphics: `${SCENE_PATH}/${SCENE_TYPES.WORLD}/${index}/${SCENE_GRAPHICS}`,
  data: `${SCENE_PATH}/${SCENE_TYPES.WORLD}/${index}/${SCENE_MAP}`,
});

export const CREDITS_SCENE_ASSETS = {
  sound: {
    src: `${SCENE_PATH}/${SCENE_TYPES.CREDITS}/${SCENE_MUSIC}`,
    loop: false,
  },
  graphics: `${SCENE_PATH}/${SCENE_TYPES.CREDITS}/${SCENE_GRAPHICS}`,
};

export const GAME_ASSETS = {
  sound: {
    src: `${GAME_PATH}/${GAME_SOUNDS.FILE}`,
    spriteSrc: `${GAME_PATH}/${GAME_SOUNDS.SPRITE}`,
  },
  graphics: `${GAME_PATH}/${GAME_FONT.FILE}`,
  data: `${GAME_PATH}/${GAME_DATA}`,
};

export const WEAPON_TYPES = {
  MELEE: 0,
  BULLET: 1,
  PROJECTILE: 2,
  SECONDARY: 3,
};
