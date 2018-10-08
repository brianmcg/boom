import { KEY_CODE_MAP } from './constants';

class Input {
  constructor() {
    this.downKeys = Object.keys(KEY_CODE_MAP)
      .reduce((memo, key) => (
        Object.assign({}, memo, {
          [KEY_CODE_MAP[key]]: false,
        })
      ), {});

    this.pressedKeys = { ...this.downKeys };

    this.KEYS = {};

    Object.keys(KEY_CODE_MAP).forEach((key) => {
      this.KEYS[KEY_CODE_MAP[key]] = KEY_CODE_MAP[key];
    });

    document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
  }

  onKeyUp(e) {
    const state = KEY_CODE_MAP[e.keyCode];

    if (!state || !this.enabled) {
      return;
    }

    this.downKeys[state] = false;

    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
  }

  onKeyDown(e) {
    const state = KEY_CODE_MAP[e.keyCode];

    this.pressedKeys[state] = true;

    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }
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
