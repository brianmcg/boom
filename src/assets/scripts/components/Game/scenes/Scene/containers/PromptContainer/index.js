import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

const PULSE_INTERVAL = 100;

const PADDING = 8;

const PULSE_MAX_SCALE = 1.15;

const PULSE_INCREMENT = 0.0075;

const FADE_INCREMENT = 0.1;

const STATES = {
  FADING_IN: 'prompt:fading:in',
  GROWING: 'prompt:growing',
  STATIC: 'prompt:static',
  SHRINKING: 'prompt:shrinking',
};

/**
 * Class representing a prompt container.
 */
class PromptContainer extends Container {
  /**
   * Create a prompt container.
   * @param {TextSprite} sprite The prompt text sprite.
   */
  constructor(sprite) {
    super();

    sprite.x = (SCREEN.WIDTH / 2);
    sprite.y = SCREEN.HEIGHT - sprite.height - PADDING;
    sprite.setScale(0);

    this.minHeight = sprite.height;
    this.minWidth = sprite.width;
    this.scaleFactor = 0;
    this.timer = 0;
    this.sprite = sprite;

    this.addChild(sprite);
    this.setFadingIn();
  }

  /**
   * Update the container.
   * @param  {Number} delta   The delta time.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.GROWING:
        this.updateGrowing(delta);
        break;
      case STATES.STATIC:
        this.updateStatic(delta, elapsedMS);
        break;
      case STATES.SHRINKING:
        this.updateShrinking(delta);
        break;
      default:
        break;
    }

    this.sprite.setScale(this.scaleFactor);
  }

  /**
   * Update in the fading in state.
   * @param  {Number} delta The delta time.
   */
  updateFadingIn(delta) {
    this.scaleFactor += FADE_INCREMENT * delta;

    if (this.scaleFactor > 1) {
      this.scaleFactor = 1;

      this.setGrowing();
    }
  }

  /**
   * Update the container in the growing state.
   * @param  {Number} delta     The delta time.
   */
  updateGrowing(delta) {
    this.scaleFactor += delta * PULSE_INCREMENT;

    if (this.scaleFactor >= PULSE_MAX_SCALE) {
      this.scaleFactor = PULSE_MAX_SCALE;

      this.setStatic();
    }
  }

  /**
   * Update the container in the static state.
   * @param  {Number} delta     The delta time.
   */
  updateStatic(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer > PULSE_INTERVAL) {
      this.timer = 0;
      this.setShrinking();
    }
  }

  /**
   * Update the container in the shrinking state.
   * @param  {Number} delta     The delta time.
   */
  updateShrinking(delta) {
    this.scaleFactor -= delta * PULSE_INCREMENT * 1.5;

    if (this.scaleFactor <= 1) {
      this.scaleFactor = 1;

      this.setGrowing();
    }
  }

  /**
   * Set the container to the fading in state.
   */
  setFadingIn() {
    return this.setState(STATES.FADING_IN);
  }


  /**
   * Set the container to the growing state.
   */
  setGrowing() {
    return this.setState(STATES.GROWING);
  }

  /**
   * Set the container to the static state.
   */
  setStatic() {
    return this.setState(STATES.STATIC);
  }

  /**
   * Set the container to the shrinking state.
   */
  setShrinking() {
    return this.setState(STATES.SHRINKING);
  }
}

export default PromptContainer;
