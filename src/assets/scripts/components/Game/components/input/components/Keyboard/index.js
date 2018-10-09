import { KEY_CODE_MAP, KEY_NAMES } from './constants';

/**
 * Class representing a keyboard.
 */
class Keyboard {
  /**
   * Create a keyboard.
   */
  constructor() {
    this.heldDown = Object.keys(KEY_NAMES).reduce((memo, name) => ({ [name]: false, ...memo }), {});
    this.pressed = { ...this.heldDown };
    this.keyNames = KEY_NAMES;

    document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
    document.addEventListener('keyup', this.onKeyUp.bind(this), false);
  }

  /**
   * Handle the keydown event
   * @param  {Object} e The keyboard event.
   */
  onKeyDown(e) {
    const state = KEY_CODE_MAP[e.keyCode];

    this.pressed[state] = true;

    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }
  }

  /**
   * Handle the keyup event
   * @param  {Object} e The keyboard event.
   */
  onKeyUp(e) {
    const state = KEY_CODE_MAP[e.keyCode];

    this.heldDown[state] = false;

    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
  }

  /**
   * Reset all the pressed keys to false.
   */
  resetPressed() {
    Object.keys(this.pressed).forEach((key) => {
      this.pressed[key] = false;
    });
  }

  /**
   * Check if a key is pressed.
   * @param  {String}  key The pressed key.
   * @return {Boolean}
   */
  isPressed(key) {
    return this.pressed[key];
  }

  /**
   * Check if a key is held down.
   * @param  {String}  key The held key.
   * @return {Boolean}
   */
  isHeldDown(key) {
    return this.heldDown[key];
  }

  /**
   * The key names constant.
   */
  static get KEYS() {
    return KEY_NAMES;
  }
}

export default Keyboard;
