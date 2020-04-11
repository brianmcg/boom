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

    const onMouseMove = (e) => {
      this.x += e.movementX
        || e.mozMovementX
        || e.webkitMovementX
        || 0;
    };

    const onMouseDown = () => {
      this.buttonHeld = true;
    };

    const onMouseUp = () => {
      this.buttonHeld = false;
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

    this.sensitivity = sensitivity;
    this.el = el;

    this.x = 0;
    this.y = 0;
    this.buttonHeld = false;
  }

  /**
   * Update the mouse.
   */
  update() {
    this.x = 0;
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
   * Get the x value.
   * @return {Number} The x value.
   */
  getX() {
    return this.x * this.sensitivity;
  }

  /**
   * Get the y value.
   * @return {Number} The y value.
   */
  getY() {
    return this.y * this.sensitivity;
  }

  /**
   * Check if the button is buttonHeld.
   * @return {Boolean} The result of the check.
   */
  isButtonHeld() {
    return this.buttonHeld;
  }
}

export default Mouse;
