/**
 * @module constants
 */

/**
 * The names of the keys.
 * @type {Object}
 */
export const KEYS = {
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
export const KEY_CODES = {
  37: KEYS.LEFT_ARROW,
  39: KEYS.RIGHT_ARROW,
  38: KEYS.UP_ARROW,
  40: KEYS.DOWN_ARROW,
  32: KEYS.SPACE,
  17: KEYS.CTRL,
  16: KEYS.SHIFT,
  27: KEYS.ESC,
  13: KEYS.ENTER,
  49: KEYS.NUM_1,
  50: KEYS.NUM_2,
  51: KEYS.NUM_3,
  52: KEYS.NUM_4,
  87: KEYS.PG_UP,
  83: KEYS.PG_DOWN,
  97: KEYS.END,
};
