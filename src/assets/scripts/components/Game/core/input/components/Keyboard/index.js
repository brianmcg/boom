import { KEY_CODES, KEYS } from './constants';

const heldDown = Object.keys(KEYS).reduce((memo, name) => ({ [name]: false, ...memo }), {});

const pressed = { ...heldDown };

/**
 * Class representing a keyboard.
 */
class Keyboard {
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
    heldDown[KEY_CODES[e.keyCode]] = false;

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
  static isHeldDown(key) {
    return heldDown[key];
  }

  /**
   * The key names constant.
   */
  static get KEYS() {
    return KEYS;
  }
}

document.addEventListener('keydown', Keyboard.onKeyDown, { once: true });
document.addEventListener('keyup', Keyboard.onKeyUp, false);

export default Keyboard;
