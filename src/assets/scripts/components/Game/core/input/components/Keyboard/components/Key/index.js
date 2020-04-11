/**
 * Class representing a keyboard key.
 */
class Key {
  /**
   * Creates key.
   */
  constructor() {
    this.keyDownCallbacks = [];
    this.keyUpCallbacks = [];
  }

  /**
   * Add a callback for key down.
   */
  onKeyDown(callback) {
    this.keyDownCallbacks.push(callback);
  }

  /**
   * Add a callback for key up.
   */
  onKeyUp(callback) {
    this.keyUpCallbacks.push(callback);
  }
}

export default Key;
