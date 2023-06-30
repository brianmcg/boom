import { SCREEN } from 'game/constants/config';
import { TextSprite } from 'game/core/graphics';
import { GAME_FONT } from 'game/constants/assets';
import { FONT_SIZES } from 'game/constants/fonts';
import { RED } from 'game/constants/colors';

const TIME_TO_LIVE = 1500;

const SCALE_INCREMENT = 0.05;

const STATES = {
  GROWING: 'message:growing',
  DISPLAYING: 'message:displaying',
  SHRINKING: 'message:shrinking',
  COMPLETE: 'message:complete',
};

/**
 * Class representing a message sprite.
 * @extends {TextSprite}
 */
class MessageSprite extends TextSprite {
  /**
   * Creates a message sprite.
   * @param  {String} text             The message text.
   * @param  {Number} options.priority The priority of the message.
   */
  constructor(text, { priority = 0 } = {}) {
    super({
      text,
      fontName: GAME_FONT.NAME,
      fontSize: Object.values(FONT_SIZES)[priority],
      color: RED,
      anchor: 0.5,
      x: SCREEN.WIDTH / 2,
      y: SCREEN.HEIGHT / 2,
    });

    this.timer = 0;
    this.scaleAmount = 0;

    this.setScale(this.scaleAmount);
    this.setGrowing();
  }

  /**
   * Add a callback for the on complete event.
   * @param  {Function} callback The callback function.
   */
  onComplete(callback) {
    this.on(STATES.COMPLETE, callback);
  }

  /**
   * Update the sprite.
   * @param  {Number} delta     The time delta.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta = 1, elapsedMS = 1) {
    switch (this.state) {
      case STATES.GROWING:
        this.updateGrowing(delta);
        break;
      case STATES.DISPLAYING:
        this.updateDisplaying(elapsedMS);
        break;
      case STATES.SHRINKING:
        this.updateShrinking(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the sprite in the growing state.
   * @param  {Number} delta     The time delta.
   */
  updateGrowing(delta) {
    this.setScale(this.scaleAmount);

    this.scaleAmount += SCALE_INCREMENT * delta;

    if (this.scaleAmount >= 1) {
      this.scaleAmount = 1;
      this.setDisplaying();
    }
  }

  /**
   * Update the sprite in the displaying state.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  updateDisplaying(elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer >= TIME_TO_LIVE) {
      this.timer = 0;
      this.setShrinking();
    }
  }

  /**
   * Update the sprite in the shrinking state.
   * @param  {Number} delta     The time delta.
   */
  updateShrinking(delta) {
    this.setScale(this.scaleAmount);

    this.scaleAmount -= SCALE_INCREMENT * delta;

    if (this.scaleAmount <= 0) {
      this.scaleAmount = 0;
      this.setComplete();
    }
  }

  /**
   * Set the sprite to the growing state.
   */
  setGrowing() {
    return this.setState(STATES.GROWING);
  }

  /**
   * Set the sprite to the displaying state.
   */
  setDisplaying() {
    const isStateChanged = this.setState(STATES.DISPLAYING);

    if (isStateChanged) {
      this.setScale(1);
    }

    return isStateChanged;
  }

  /**
   * Set the sprite to the shrinking state.
   */
  setShrinking() {
    return this.setState(STATES.SHRINKING);
  }

  /**
   * Set the sprite to the complete state.
   */
  setComplete() {
    const isStateChanged = this.setState(STATES.COMPLETE);

    if (isStateChanged) {
      this.emit(STATES.COMPLETE);
    }

    return isStateChanged;
  }
}

export default MessageSprite;
