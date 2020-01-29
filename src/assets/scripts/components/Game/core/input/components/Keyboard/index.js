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
  87: KEYS.PG_UP,
  83: KEYS.PG_DOWN,
  97: KEYS.END,
  188: KEYS.COMMA,
  190: KEYS.PERIOD,
};

/**
 * Class representing a keyboard.
 */
class Keyboard {
  /**
   * Creates a keyboard instance.
   */
  constructor() {
    this.held = Object.keys(KEYS).reduce((memo, name) => ({
      [name]: false,
      ...memo,
    }), {});

    this.pressed = { ...this.held };

    // On key down, update the pressed and help hashmaps.
    document.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!e.repeat) {
        this.pressed[KEY_CODES[e.keyCode]] = true;
        this.held[KEY_CODES[e.keyCode]] = true;
      }
    }, false);

    // On key up, update the held hashmap.
    document.addEventListener('keyup', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.held[KEY_CODES[e.keyCode]] = false;
    }, false);
  }

  /**
   * Reset all the pressed keys to false.
   */
  update() {
    Object.keys(this.pressed).forEach((key) => {
      this.pressed[key] = false;
    });
  }
}

export default Keyboard;
