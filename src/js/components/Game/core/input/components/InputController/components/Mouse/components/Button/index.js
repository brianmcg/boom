/**
 * Class representing a button.
 */
class Button {
  /**
   * Add a callback for the on down event.
   * @param  {Function} callback The callback.
   */
  onDown(callback) {
    this.downCallback = callback;
  }

  /**
   * Add a callback for the on up event.
   * @param  {Function} callback The callback.
   */
  onUp(callback) {
    this.upCallback = callback;
  }
}

export default Button;
