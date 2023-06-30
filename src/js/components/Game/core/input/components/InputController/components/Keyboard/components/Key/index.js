/**
 * Class representing a keyboard key.
 */
class Key {
  /**
   * Add a callback for key down.
   */
  onDown(callback) {
    this.downCallback = callback;
  }

  /**
   * Add a callback for key up.
   */
  onUp(callback) {
    this.upCallback = callback;
  }
}

export default Key;
