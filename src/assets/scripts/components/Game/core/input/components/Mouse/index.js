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

    this.element = element;

    document.addEventListener('pointerlockchange', this.onChange.bind(this), false);
    document.addEventListener('mozpointerlockchange', this.onChange.bind(this), false);
    document.addEventListener('webkitpointerlockchange', this.onChange.bind(this), false);

    this.onMove = this.onMove.bind(this);

    this.x = 0;
    this.y = 0;
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
    this.x = e.movementX
      || e.mozMovementX
      || e.webkitMovementX
      || 0;

    this.y = e.movementY
      || e.mozMovementY
      || e.webkitMovementY
      || 0;
  }

  /**
   * Update the mouse.
   */
  update() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Lock the mouse.
   */
  lock() {
    this.element.requestPointerLock();
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
}

export default Mouse;
