const KEYS = {
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

const KEY_CODES = {
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

const held = Object.keys(KEYS).reduce((memo, name) => ({ [name]: false, ...memo }), {});

const pressed = { ...held };

/**
 * Class representing a keyboard.
 */
export default class Keyboard {
  /**
   * The key names.
   */
  static get KEYS() { return KEYS; }

  /**
   * Handle the keydown event
   * @param  {Object} e The keyboard event.
   */
  static onKeyDown(e) {
    pressed[KEY_CODES[e.keyCode]] = true;

    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }

  /**
   * Handle the keyup event
   * @param  {Object} e The keyboard event.
   */
  static onKeyUp(e) {
    held[KEY_CODES[e.keyCode]] = false;

    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    document.addEventListener('keydown', Keyboard.onKeyDown, { once: true });
  }

  /**
   * Reset all the pressed keys to false.
   */
  static resetPressed() {
    Object.keys(pressed).forEach((key) => {
      pressed[key] = false;
    });
  }

  /**
   * Check if a key is pressed.
   * @param  {String}  key The pressed key.
   * @return {Boolean}
   */
  static isPressed(key) {
    return pressed[key];
  }

  /**
   * Check if a key is held down.
   * @param  {String}  key The held key.
   * @return {Boolean}
   */
  static isHeld(key) {
    return held[key];
  }
}

document.addEventListener('keydown', Keyboard.onKeyDown, { once: true });

document.addEventListener('keyup', Keyboard.onKeyUp, false);
