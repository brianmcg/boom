import { Container } from 'game/core/graphics';
import { SCREEN, TIME_STEP } from 'game/constants/config';

const STATIC_INTERVAL = 100;

const PADDING = 8;

const MAX_SCALE = 1.15;

const SCALE_INCREMENT = 0.0075;

const STATES = {
  FADING_IN: 'prompt:fading:in',
  STATIC: 'prompt:static',
  FADING_OUT: 'prompt:fading:out',
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

    this.minHeight = sprite.height;
    this.minWidth = sprite.width;

    this.scaleFactor = 1;
    this.timer = 0;

    this.addChild(sprite);
    this.setFadingIn();

    this.sprite = sprite;
  }

  /**
   * Update the container.
   * @param  {Number} delta     The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.STATIC:
        this.updateStatic(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta);
        break;
      default:
        break;
    }

    this.sprite.setScale(this.scaleFactor);
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  updateFadeEffect(value) {
    super.updateFadeEffect(value);
  }

  /**
   * Update the container in the fading in state.
   * @param  {Number} delta     The delta time.
   */
  updateFadingIn(delta) {
    this.scaleFactor += delta * SCALE_INCREMENT;

    if (this.scaleFactor >= MAX_SCALE) {
      this.scaleFactor = MAX_SCALE;

      this.setStatic();
    }
  }

  /**
   * Update the container in the static state.
   * @param  {Number} delta     The delta time.
   */
  updateStatic(delta) {
    this.timer += delta * TIME_STEP;

    if (this.timer > STATIC_INTERVAL) {
      this.timer = 0;
      this.setFadingOut();
    }
  }

  /**
   * Update the container in the fading out state.
   * @param  {Number} delta     The delta time.
   */
  updateFadingOut(delta) {
    this.scaleFactor -= delta * SCALE_INCREMENT * 1.5;

    if (this.scaleFactor <= 1) {
      this.scaleFactor = 1;

      this.setFadingIn();
    }
  }

  /**
   * Set the container to the fading in state.
   */
  setFadingIn() {
    return this.setState(STATES.FADING_IN);
  }

  /**
   * Set the container to the static state.
   */
  setStatic() {
    return this.setState(STATES.STATIC);
  }

  /**
   * Set the container to the fading out state.
   */
  setFadingOut() {
    return this.setState(STATES.FADING_OUT);
  }

  /**
   * Set the state of the container.
   * @param {String} state The state of the container.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}

export default PromptContainer;
