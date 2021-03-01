
import { MOUSE_SENSITIVITY } from 'game/constants/config';
import Button from './components/Button';

export const BUTTONS = {
  LEFT: 'LEFT',
  MIDDLE: 'MIDDLE',
  RIGHT: 'RIGHT',
};

const BUTTON_CODES = {
  0: BUTTONS.LEFT,
  1: BUTTONS.MIDDLE,
  2: BUTTONS.RIGHT,
};

const MOVE_MULTIPLIER = 0.0025;

/**
 * Class representing a mouse.
 */
class Mouse {
  /**
   * Creates a mouse.
   * @param  {Element} options.el               The canvas element.
   * @param  {Number} options.moveSensitivity   The mouse moveSensitivity.
   */
  constructor(el, moveSensitivity = MOUSE_SENSITIVITY) {
    const moveMultiplier = MOVE_MULTIPLIER * moveSensitivity;

    const onMouseMove = (e) => {
      const x = moveMultiplier * e.movementX
        || e.mozMovementX
        || e.webkitMovementX
        || 0;

      if (this.moveCallback) {
        this.moveCallback(x);
      }
    };

    const onMouseDown = (e) => {
      const button = this.buttons[BUTTON_CODES[e.button]];

      if (button && button.downCallback) {
        button.downCallback();
      }
    };

    const onMouseUp = (e) => {
      const button = this.buttons[BUTTON_CODES[e.button]];

      if (button && button.upCallback) {
        button.upCallback();
      }
    };

    const onWheel = (e) => {
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

    el.requestPointerLock = el.requestPointerLock
      || el.mozRequestPointerLock
      || el.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
      || document.mozExitPointerLock
      || document.webkitExitPointerLock;

    document.addEventListener('pointerlockchange', onChange, false);
    document.addEventListener('mozpointerlockchange', onChange, false);
    document.addEventListener('webkitpointerlockchange', onChange, false);

    this.buttons = {};
    this.el = el;
  }

  /**
   * Get a button.
   * @param  {String} name The name of the button.
   * @return {Key}         The button.
   */
  get(name) {
    if (this.buttons[name]) {
      return this.buttons[name];
    }

    this.buttons[name] = new Button();

    return this.buttons[name];
  }

  /**
   * Add a callback to the move event.
   * @param  {Function} callback The callback.
   */
  onMove(callback) {
    this.moveCallback = callback;
  }

  /**
   * Add a callback to the wheel event.
   * @param  {Function} callback The callback.
   */
  onWheel(callback) {
    this.wheelCallback = callback;
  }

  /**
   * Lock the mouse pointer.
   */
  lockPointer() {
    if (!this.isPointerLocked()) {
      this.el.requestPointerLock();
    }
  }

  /**
   * Unlock the mouse pointer.
   */
  unlockPointer() {
    if (this.isPointerLocked()) {
      document.exitPointerLock();
    }
  }

  /**
   * Is the mouse pointer locked.
   * @return {Boolean}
   */
  isPointerLocked() {
    return document.pointerLockElement === this.el
      || document.mozPointerLockElement === this.el
      || document.webkitPointerLockElement === this.el;
  }

  /**
   * Remove all callbacks.
   */
  removeCallbacks() {
    this.buttons = {};
    delete this.moveCallback;
  }
}

export default Mouse;
