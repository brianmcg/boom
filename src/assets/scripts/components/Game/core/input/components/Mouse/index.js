/**
 * Class representing a mouse.
 */
class Mouse {
  /**
   * Creates a mouse.
   * @param  {Element} element The canvas element.
   */
  constructor(element) {
    element.requestPointerLock = element.requestPointerLock
      || element.mozRequestPointerLock
      || element.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
      || document.mozExitPointerLock
      || document.webkitExitPointerLock;

    document.addEventListener('pointerlockchange', this.onChange.bind(this), false);
    document.addEventListener('mozpointerlockchange', this.onChange.bind(this), false);
    document.addEventListener('webkitpointerlockchange', this.onChange.bind(this), false);

    this.element = element;
    this.onMove = this.onMove.bind(this);
    this.x = 0;
    this.y = 0;
    this.sensitivity = 0.08;
  }

  /**
   * Handle the change event.
   */
  onChange() {
    if (this.isPointerLocked()) {
      document.addEventListener('mousemove', this.onMove, false);
    } else {
      document.removeEventListener('mousemove', this.onMove, false);
    }
  }

  /**
   * Handle the move event.
   * @param  {Event} e The move event.
   */
  onMove(e) {
    this.x += e.movementX
      || e.mozMovementX
      || e.webkitMovementX
      || 0;
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
      this.element.requestPointerLock();
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
    return document.pointerLockElement === this.element
      || document.mozPointerLockElement === this.element
      || document.webkitPointerLockElement === this.element;
  }

  get changeX() {
    return this.x * this.sensitivity;
  }

  get changeY() {
    return this.y * this.sensitivity;
  }
}

export default Mouse;
