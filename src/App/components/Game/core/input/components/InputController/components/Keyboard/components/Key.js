/**
 * Class representing a keyboard key.
 */
export default class Key {
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
