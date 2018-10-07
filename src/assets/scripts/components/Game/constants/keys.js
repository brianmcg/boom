/**
 * @module keys
 */

const LEFT_ARROW = 'LEFT_ARROW';

const RIGHT_ARROW = 'RIGHT_ARROW';

const UP_ARROW = 'UP_ARROW';

const DOWN_ARROW = 'DOWN_ARROW';

const SPACE = 'SPACE';

const CTRL = 'CTRL';

const SHIFT = 'SHIFT';

const ESC = 'ESC';

const ENTER = 'ENTER';

const NUM_1 = 'NUM_1';

const NUM_2 = 'NUM_2';

const NUM_3 = 'NUM_3';

const NUM_4 = 'NUM_4';

const PG_UP = 'PG_UP';

const PG_DOWN = 'PG_DOWN';

const END = 'END';

/**
 * A hashmap of key codes to names.
 * @type {Object}
 */
export const KEY_HASHMAP = {
  37: LEFT_ARROW,
  39: RIGHT_ARROW,
  38: UP_ARROW,
  40: DOWN_ARROW,
  32: SPACE,
  17: CTRL,
  16: SHIFT,
  27: ESC,
  13: ENTER,
  49: NUM_1,
  50: NUM_2,
  51: NUM_3,
  52: NUM_4,
  87: PG_UP,
  83: PG_DOWN,
  97: END,
};

/**
 * An array of the key names.
 * @type {Array}
 */
export const KEY_NAMES = Object.keys(KEY_HASHMAP).map(key => KEY_HASHMAP[key]);
