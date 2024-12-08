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

export const DEBUG = parseNumParam('debug');

export const LEVEL = parseNumParam('level', 1);

export const ALONE = parseBoolParam('alone');

export const GOD_MODE = parseBoolParam('god');

export const ALL_WEAPONS =
  parseBoolParam('allWeapons') || parseBoolParam('level');

export const DISABLE_SOUND = parseBoolParam('disableSound');

export const SHOW_STATS = parseNumParam('stats') || DEBUG;

export const DISABLE_MUSIC =
  DISABLE_SOUND || parseBoolParam('disableMusic') || Boolean(DEBUG);

export const MAX_FPS = 60;

export const MUSIC_VOLUME = 1;

export const DIFFICULTY = 0;

export const CELL_SIZE = 32;

export const MOUSE_SENSITIVITY = 0.00125;

export const WALL_LAYERS = 3;

export const WIDTH = 16;

export const HEIGHT = 9;

export const RESOLUTION = 24;

export const SCREEN = {
  WIDTH: WIDTH * RESOLUTION,
  HEIGHT: HEIGHT * RESOLUTION,
};

export const SCREEN_PADDING = SCREEN.HEIGHT / 20;

export const DEFAULT_LANGUAGE = 'en';

export const FOV = 90;

export const UPDATE_DISTANCE = CELL_SIZE * 20;

export const MAX_SOUND_DISTANCE = CELL_SIZE * 16;

export const HEALTH_MODIFIER = 2;
