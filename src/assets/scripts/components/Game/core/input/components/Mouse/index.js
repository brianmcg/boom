/**
 * Class representing a mouse.
 */
class Mouse {
  /**
   * Creates a mouse.
   * @param  {Element} el The canvas el.
   */
  constructor(el) {
    el.requestPointerLock = el.requestPointerLock
      || el.mozRequestPointerLock
      || el.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
      || document.mozExitPointerLock
      || document.webkitExitPointerLock;

    document.addEventListener('pointerlockchange', () => this.onChange(), false);
    document.addEventListener('mozpointerlockchange', () => this.onChange(), false);
    document.addEventListener('webkitpointerlockchange', () => this.onChange(), false);

    this.x = 0;
    this.y = 0;
    this.held = false;
    this.sensitivity = 0.0004;
    this.el = el;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  /**
   * Handle the change event.
   */
  onChange() {
    if (this.isPointerLocked()) {
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('mousedown', this.onMouseDown, false);
      document.addEventListener('mouseup', this.onMouseUp, false);
    } else {
      document.removeEventListener('mousemove', this.onMouseMove, false);
      document.removeEventListener('mousedown', this.onMouseDown, false);
      document.removeEventListener('mouseup', this.onMouseUp, false);
    }
  }

  /**
   * Handle the move event.
   * @param  {Event} e The move event.
   */
  onMouseMove(e) {
    this.x += e.movementX
      || e.mozMovementX
      || e.webkitMovementX
      || 0;
  }

  /**
   * Handle mouse down event.
   */
  onMouseDown() {
    this.held = true;
  }

  /**
   * Handle mouse up event.
   */
  onMouseUp() {
    this.held = false;
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

  get changeX() {
    return this.x * this.sensitivity;
  }

  get changeY() {
    return this.y * this.sensitivity;
  }

  get buttonHeld() {
    return this.held;
  }
}

export default Mouse;
