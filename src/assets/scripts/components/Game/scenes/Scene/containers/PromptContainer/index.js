import { Container } from 'game/core/graphics';
import { SCREEN, TIME_STEP } from 'game/constants/config';

const FADE_IN_DIVISOR = 10;

const STATIC_INTERVAL = 750;

const FADE_OUT_DIVISOR = 25;

const PADDING = 8;

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
   * Create a prompt container
   */
  constructor() {
    super();
    this.timer = 0;
    this.alphaValue = 0;
    this.setFadingIn();
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
  }

  /**
   * Update the container in the fading in state.
   * @param  {Number} delta     The delta time.
   */
  updateFadingIn(delta) {
    this.alphaValue += delta / FADE_IN_DIVISOR;

    if (this.alphaValue > 1) {
      this.alphaValue = 1;
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
    this.alphaValue -= delta / FADE_OUT_DIVISOR;

    if (this.alphaValue < 0) {
      this.alphaValue = 0;
      this.setFadingIn();
    }
  }

  /**
   * Animate the container.
   */
  animate() {
    this.alpha = this.alphaValue;
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

  /**
   * Show the container.
   */
  play() {
    this.visible = true;
  }

  /**
   * Handle state change to paused.
   */
  stop() {
    this.visible = false;
  }

  /**
   * Add a child to the container.
   * @param {TextSprite} options.label The label to add.
   */
  addChild({ label }) {
    label.x = (SCREEN.WIDTH / 2) - (label.width / 2);
    label.y = SCREEN.HEIGHT - label.height - PADDING;
    super.addChild(label);
    this.label = label;
  }
}

export default PromptContainer;
