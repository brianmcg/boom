/**
 * Class representing a mouse.
 */
class Mouse {
  /**
   * [constructor description]
   * @param  {Element} options.el          The canvas element.
   * @param  {Number} options.sensitivity  The mouse sensitivity.
   */
  constructor({ el, sensitivity = 0.0002 }) {
    el.requestPointerLock = el.requestPointerLock
      || el.mozRequestPointerLock
      || el.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
      || document.mozExitPointerLock
      || document.webkitExitPointerLock;

    this.el = el;
    this.mouseMoveCallbacks = [];
    this.mouseDownCallbacks = [];
    this.mouseUpCallbacks = [];

    const onMouseMove = (e) => {
      const x = sensitivity * e.movementX
        || e.mozMovementX
        || e.webkitMovementX
        || 0;

      this.mouseMoveCallbacks.forEach(callback => callback(x, null));
    };

    const onMouseDown = () => {
      this.buttonHeld = true;
      this.mouseDownCallbacks.forEach(callback => callback());
    };

    const onMouseUp = () => {
      this.buttonHeld = false;
      this.mouseUpCallbacks.forEach(callback => callback());
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
    this.mouseMoveCallbacks.push(callback);
  }

  /**
   * Add a callback to the mouse down event.
   * @param  {Function} callback The callback.
   */
  onMouseDown(callback) {
    this.mouseDownCallbacks.push(callback);
  }

  /**
   * Add a callback to the mouse up event.
   * @param  {Function} callback The callback.
   */
  onMouseUp(callback) {
    this.mouseUpCallbacks.push(callback);
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
