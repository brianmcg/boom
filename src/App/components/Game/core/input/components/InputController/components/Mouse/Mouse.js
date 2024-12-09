import { MOUSE_SENSITIVITY } from '@constants/config';
import Button from './components/Button';
import { BUTTON_CODES } from './constants';

export default class Mouse {
  constructor(el, moveSensitivity = MOUSE_SENSITIVITY) {
    const onMouseMove = e => {
      const x =
        moveSensitivity * e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX ||
        0;

      if (this.moveCallback) {
        this.moveCallback(x);
      }
    };

    const onMouseDown = e => {
      const button = this.buttons[BUTTON_CODES[e.button]];

      if (button && button.downCallback) {
        button.downCallback();
      }
    };

    const onMouseUp = e => {
      const button = this.buttons[BUTTON_CODES[e.button]];

      if (button && button.upCallback) {
        button.upCallback();
      }
    };

    const onWheel = e => {
      if (this.wheelCallback) {
        this.wheelCallback(Math.sign(e.deltaY));
      }
    };

    const onChange = () => {
      if (this.isPointerLocked()) {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('wheel', onWheel, false);
      } else {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mousedown', onMouseDown, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('wheel', onWheel, false);
      }
    };

    el.requestPointerLock =
      el.requestPointerLock ||
      el.mozRequestPointerLock ||
      el.webkitRequestPointerLock;

    document.exitPointerLock =
      document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

    document.addEventListener('pointerlockchange', onChange, false);
    document.addEventListener('mozpointerlockchange', onChange, false);
    document.addEventListener('webkitpointerlockchange', onChange, false);

    this.buttons = {};
    this.el = el;
  }

  get(name) {
    if (this.buttons[name]) {
      return this.buttons[name];
    }

    this.buttons[name] = new Button();

    return this.buttons[name];
  }

  onMove(callback) {
    this.moveCallback = callback;
  }

  onWheel(callback) {
    this.wheelCallback = callback;
  }

  lockPointer() {
    if (!this.isPointerLocked()) {
      return this.el.requestPointerLock();
    }

    return Promise.resolve();
  }

  unlockPointer() {
    if (this.isPointerLocked()) {
      document.exitPointerLock();
    }
  }

  isPointerLocked() {
    return (
      document.pointerLockElement === this.el ||
      document.mozPointerLockElement === this.el ||
      document.webkitPointerLockElement === this.el
    );
  }

  removeCallbacks() {
    this.buttons = {};
    delete this.moveCallback;
    delete this.wheelCallback;
  }
}
