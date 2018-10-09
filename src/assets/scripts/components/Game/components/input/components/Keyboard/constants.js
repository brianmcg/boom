/**
 * @module constants
 */

/**
 * The names of the keys.
 * @type {Object}
 */
export const KEY_NAMES = {
  LEFT_ARROW: 'LEFT_ARROW',
  RIGHT_ARROW: 'RIGHT_ARROW',
  UP_ARROW: 'UP_ARROW',
  DOWN_ARROW: 'DOWN_ARROW',
  SPACE: 'SPACE',
  CTRL: 'CTRL',
  SHIFT: 'SHIFT',
  ESC: 'ESC',
  ENTER: 'ENTER',
  NUM_1: 'NUM_1',
  NUM_2: 'NUM_2',
  NUM_3: 'NUM_3',
  NUM_4: 'NUM_4',
  PG_UP: 'PG_UP',
  PG_DOWN: 'PG_DOWN',
  END: 'END',
};

/**
 * A hashmap of key codes to key names.
 * @type {Object}
 */
export const KEY_CODE_MAP = {
  37: KEY_NAMES.LEFT_ARROW,
  39: KEY_NAMES.RIGHT_ARROW,
  38: KEY_NAMES.UP_ARROW,
  40: KEY_NAMES.DOWN_ARROW,
  32: KEY_NAMES.SPACE,
  17: KEY_NAMES.CTRL,
  16: KEY_NAMES.SHIFT,
  27: KEY_NAMES.ESC,
  13: KEY_NAMES.ENTER,
  49: KEY_NAMES.NUM_1,
  50: KEY_NAMES.NUM_2,
  51: KEY_NAMES.NUM_3,
  52: KEY_NAMES.NUM_4,
  87: KEY_NAMES.PG_UP,
  83: KEY_NAMES.PG_DOWN,
  97: KEY_NAMES.END,
};
