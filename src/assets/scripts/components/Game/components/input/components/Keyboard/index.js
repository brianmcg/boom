import { KEY_CODE_MAP, KEY_NAMES } from './constants';

class Keyboard {
  constructor() {
    this.heldDown = Object.keys(KEY_NAMES).reduce((memo, name) => ({ [name]: false, ...memo }), {});
    this.pressed = { ...this.heldDown };
    this.keyNames = KEY_NAMES;

    document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
    document.addEventListener('keyup', this.onKeyUp.bind(this), false);
  }

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

  update() {
    Object.keys(this.pressed).forEach((key) => {
      this.pressed[key] = false;
    });
  }

  isHeld(key) {
    return this.heldDown[key];
  }

  isPressed(key) {
    return this.pressed[key];
  }

  get KEYS() {
    return this.keyNames;
  }
}

export default Keyboard;
