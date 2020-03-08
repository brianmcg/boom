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
   * Update the message.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.timer -= delta * TIME_STEP;

    if (this.timer < 0) {
      this.timer = 0;
    }
  }
}

export default Message;
