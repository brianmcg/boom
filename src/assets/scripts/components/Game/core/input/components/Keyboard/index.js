import Key from './components/Key';

export const KEYS = {
  ALT: 'ALT',
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
  PERIOD: 'PERIOD',
  COMMA: 'COMMA',
  W: 'W',
  A: 'A',
  S: 'S',
  D: 'D',
  E: 'E',
};

const KEY_CODES = {
  18: KEYS.ALT,
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
  105: KEYS.PG_UP,
  99: KEYS.PG_DOWN,
  97: KEYS.END,
  188: KEYS.COMMA,
  190: KEYS.PERIOD,
  87: KEYS.W,
  83: KEYS.S,
  65: KEYS.A,
  68: KEYS.D,
  69: KEYS.E,
};

/**
 * Class representing a keyboard.
 */
class Keyboard {
  /**
   * Creates a keyboard instance.
   */
  constructor() {
    this.keys = {};

    // On key down, update the pressed and help hashmaps.
    document.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!e.repeat) {
        const key = this.keys[KEY_CODES[e.keyCode]];

        if (key) {
          key.keyDownCallbacks.forEach(callback => callback());
        }
      }
    }, false);

    // On key up, update the held hashmap.
    document.addEventListener('keyup', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const key = this.keys[KEY_CODES[e.keyCode]];

      if (key) {
        key.keyUpCallbacks.forEach(callback => callback());
      }
    }, false);
  }

  /**
   * Add a key.
   * @param {String} name   The name of the key.
   */
  add(name) {
    const key = new Key();

    this.keys[name] = key;

    return key;
  }
}

export default Keyboard;
