import { AnimatedSprite } from 'game/core/graphics';
import { TIME_STEP, SCREEN } from 'game/constants/config';

const INTERVAL = 5000;

const SCALE_INCREMENT = 0.075;

const STATES = {
  FADING_IN: 'logo:fading:in',
  STATIC: 'logo:static',
};

/**
 * Class representing a logo sprite.
 */
class LogoSprite extends AnimatedSprite {
  /**
   * Creates a logo sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.25,
      loop: true,
    });

    this.scaleFactor = 0;
    this.height /= this.height / (SCREEN.HEIGHT / 2);
    this.width /= this.height / (SCREEN.HEIGHT / 2);
    this.scale.x = this.scaleFactor;
    this.scale.y = this.scaleFactor;
    this.timer = 0;
    this.onLoop = this.handleOnLoop.bind(this);
    this.anchor.set(0.5);
    this.setFadinIn();
  }

  /**
   * Handle the on loop event.
   */
  handleOnLoop() {
    this.isInterval = true;
  }

  /**
   * Update the sprite.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.STATIC:
        this.updateStatic(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the spritein the fading in state.
   * @param  {Number} delta The delta time.
   */
  updateFadingIn(delta) {
    this.scaleFactor += SCALE_INCREMENT * delta;

    if (this.scaleFactor >= 1) {
      this.scaleFactor = 1;
      this.setStatic();
    }

    this.scale.x = this.scaleFactor;
    this.scale.y = this.scaleFactor;
  }

  /**
   * Update the sprite in the static state.
   * @param  {Number} delta The delta time.
   */
  updateStatic(delta) {
    if (this.isInterval) {
      this.timer += delta * TIME_STEP;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.isInterval = false;
      }
    } else {
      super.update(delta);
    }
  }

  /**
   * Set the sprite to the fading in state.
   * @return {Boolean} State change successful.
   */
  setFadinIn() {
    return this.setState(STATES.FADING_IN);
  }

  /**
   * Set the state to the static state.
   * @return {Boolean} State change successful.
   */
  setStatic() {
    return this.setState(STATES.STATIC);
  }

  /**
   * Set the state.
   * @param {String}   state The new state.
   * @return {Boolean}       State change successful.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  /**
   * Play the sprite.
   */
  play() {
    this.visible = true;
  }

  /**
   * Stop the sprite.
   */
  stop() {
    this.visible = false;
  }
}

export default LogoSprite;
