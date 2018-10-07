import { KEY_HASHMAP, KEY_NAMES } from '../../../constants/keys';

class Input {
  constructor() {
    this.keys = Object.keys(KEY_HASHMAP)
      .reduce((memo, key) => (
        Object.assign({}, memo, {
          [KEY_HASHMAP[key]]: false,
        })
      ), {});

    KEY_NAMES.forEach((keyName) => {
      this[keyName] = keyName;
    });

    Object.keys(KEY_HASHMAP).forEach((key) => {
      this[KEY_HASHMAP[key]] = KEY_HASHMAP[key];
    });

    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
  }

  onKey(pressed, event) {
    const state = KEY_HASHMAP[event.keyCode];

    if (!state || !this.isEnabled) {
      return;
    }

    this.keys[state] = pressed;

    if (event.preventDefault) {
      event.preventDefault();
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  isKeyPressed(key) {
    return this.keys[key];
  }

  enable() {
    this.isEnabled = true;
  }

  disabled() {
    this.isEnabled = false;
  }
}

export default Input;
