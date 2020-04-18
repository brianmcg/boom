import Button from './components/Button';

/**
 * Class representing a mouse.
 */
class Mouse {
  /**
   * [constructor description]
   * @param  {Element} options.el          The canvas element.
   * @param  {Number} options.sensitivity  The mouse sensitivity.
   */
  constructor({ el, sensitivity = 0.0004 }) {
    el.requestPointerLock = el.requestPointerLock
      || el.mozRequestPointerLock
      || el.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
      || document.mozExitPointerLock
      || document.webkitExitPointerLock;

    this.el = el;
    this.mouseMoveCallback = null;
    this.mouseDownCallback = null;
    this.mouseUpCallback = null;

    const onMouseMove = (e) => {
      const x = sensitivity * e.movementX
        || e.mozMovementX
        || e.webkitMovementX
        || 0;

      // this.mouseMoveCallbacks.forEach(callback => callback(x, null));
    };

    const onMouseDown = () => {
      if (this.mouseDownCallback) {
        this.mouseDownCallback();
      }
    };

    const onMouseUp = () => {
      if (this.mouseUpCallback) {
        this.mouseUpCallback();
      }
    };

    const onChange = () => {
      if (this.isPointerLocked()) {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
      } else {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mousedown', onMouseDown, false);
        document.removeEventListener('mouseup', onMouseUp, false);
      }
    };

    document.addEventListener('pointerlockchange', onChange, false);
    document.addEventListener('mozpointerlockchange', onChange, false);
    document.addEventListener('webkitpointerlockchange', onChange, false);
  }

  /**
   * Add a callback to the mouse move event.
   * @param  {Function} callback The callback.
   */
  onMouseMove(callback) {
    this.mouseMoveCallback = callback;
  }

  /**
   * Add a callback to the mouse down event.
   * @param  {Function} callback The callback.
   */
  onMouseDown(callback) {
    this.mouseDownCallback = callback;
  }

  /**
   * Add a callback to the mouse up event.
   * @param  {Function} callback The callback.
   */
  onMouseUp(callback) {
    this.mouseUpCallback = callback;
  }

  /**
   * Remove all callbacks.
   */
  removeButtons() {
    this.mouseMoveCallbacks = null;
    this.mouseDownCallbacks = null;
    this.mouseUpCallbacks = null;
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
}

export default Mouse;
