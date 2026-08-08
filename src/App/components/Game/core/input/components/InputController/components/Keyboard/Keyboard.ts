import Binding from '../Binding';
import { KEY_CODES } from './constants';

export default class Keyboard {
  private keys: Record<string, Binding> = {};

  constructor() {
    // On key down, update the pressed and help hashmaps.
    document.addEventListener(
      'keydown',
      e => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.repeat) {
          // An unmapped code has no name, and must not be looked up: indexing
          // with `undefined` reads the property literally named "undefined",
          // which every unmapped key on the keyboard would share.
          const name = KEY_CODES[e.keyCode];

          if (name) {
            const key = this.keys[name];

            if (key && key.downCallback) {
              key.downCallback();
            }
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

        const name = KEY_CODES[e.keyCode];

        if (name) {
          const key = this.keys[name];

          if (key && key.upCallback) {
            key.upCallback();
          }
        }
      },
      false
    );
  }

  get(name: string): Binding {
    if (this.keys[name]) {
      return this.keys[name];
    }

    this.keys[name] = new Binding();

    return this.keys[name];
  }

  removeCallbacks() {
    this.keys = {};
  }
}
