import { TIME_STEP } from 'game/constants/config';

const TIME_TO_LIVE = 1500;

/**
 * Class representing a message.
 */
class Message {
  /**
   * Creates a message.
   * @param  {String} text The message text.
   */
  constructor(text) {
    this.text = text;
    this.timer = TIME_TO_LIVE;
  }

  /**
   * Add a callback for when the message expires.
   * @param  {Function} callback The callback.
   */
  onExpired(callback) {
    this.callback = callback;
  }

  /**
   * Update the message.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.timer -= delta * TIME_STEP;

    if (this.timer < 0) {
      this.timer = 0;

      if (this.callback) {
        this.callback();
      }
    }
  }
}

export default Message;
