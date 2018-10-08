import { KEY_HASHMAP, KEY_NAMES } from '../../../constants/keys';

class Input {
  constructor() {
    this.downKeys = Object.keys(KEY_HASHMAP)
      .reduce((memo, key) => (
        Object.assign({}, memo, {
          [KEY_HASHMAP[key]]: false,
        })
      ), {});

    this.pressedKeys = { ...this.downKeys };

    KEY_NAMES.forEach((keyName) => {
      this[keyName] = keyName;
    });

    Object.keys(KEY_HASHMAP).forEach((key) => {
      this[KEY_HASHMAP[key]] = KEY_HASHMAP[key];
    });

    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
    document.addEventListener('keydown', this.onKeyOnce.bind(this), { once: true });
  }

  onKeyOnce(event) {
    const state = KEY_HASHMAP[event.keyCode];

    this.pressedKeys[state] = true;

    if (event.preventDefault) {
      event.preventDefault();
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  onKey(pressed, event) {
    const state = KEY_HASHMAP[event.keyCode];

    if (!state || !this.enabled) {
      return;
    }

    if (!pressed) {
      document.addEventListener('keydown', this.onKeyOnce.bind(this), { once: true });
    }

    if (event.preventDefault) {
      event.preventDefault();
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    }

    this.downKeys[state] = pressed;
  }

  update() {
    Object.keys(this.pressedKeys).forEach((key) => {
      this.pressedKeys[key] = false;
    });
  }

  isKeyDown(key) {
    return this.downKeys[key];
  }

  isKeyPressed(key) {
    return this.pressedKeys[key];
  }
}

export default Input;
