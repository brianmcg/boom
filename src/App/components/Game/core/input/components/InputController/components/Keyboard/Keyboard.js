import Key from './components/Key';
import { KEY_CODES } from './constants';

/**
 * Class representing a keyboard.
 */
export default class Keyboard {
  /**
   * Creates a keyboard instance.
   */
  constructor() {
    this.keys = {};

    // On key down, update the pressed and help hashmaps.
    document.addEventListener(
      'keydown',
      e => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.repeat) {
          const key = this.keys[KEY_CODES[e.keyCode]];

          if (key && key.downCallback) {
            key.downCallback();
          }
        }
      },
      false
    );

    // On key up, update the held hashmap.
    document.addEventListener(
      'keyup',
      e => {
        e.preventDefault();
        e.stopPropagation();

        const key = this.keys[KEY_CODES[e.keyCode]];

        if (key && key.upCallback) {
          key.upCallback();
        }
      },
      false
    );
  }

  /**
   * Get a key.
   * @param  {String} name The name of the key.
   * @return {Key}         The key.
   */
  get(name) {
    if (this.keys[name]) {
      return this.keys[name];
    }

    this.keys[name] = new Key();

    return this.keys[name];
  }

  /**
   * Remove all callbacks.
   */
  removeCallbacks() {
    this.keys = {};
  }
}
