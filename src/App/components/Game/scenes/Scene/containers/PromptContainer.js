import { Container } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

const PULSE_INTERVAL = 100;

const PADDING = 8;

const PULSE_MAX_SCALE = 1.15;

const PULSE_INCREMENT = 0.0075;

const FADE_INCREMENT = 0.1;

const SHAKE_FADE = 0.55;

const MIN_SHAKE = 0.1;

const MAX_SHAKE = 8;

const SHAKE_AMOUNT = 4;

const STATES = {
  FADING_IN: 'prompt:fading:in',
  GROWING: 'prompt:growing',
  STATIC: 'prompt:static',
  SHRINKING: 'prompt:shrinking',
};

export default class PromptContainer extends Container {
  constructor(sprite, sound) {
    super();

    sprite.x = SCREEN.WIDTH / 2;
    sprite.y = SCREEN.HEIGHT - sprite.height - PADDING;
    sprite.scale.set(0);

    this.minHeight = sprite.height;
    this.minWidth = sprite.width;
    this.sprite = sprite;
    this.sound = sound;

    this.scaleFactor = 0;
    this.timer = 0;
    this.shakeDirection = 1;
    this.shakeValue = 0;
    this.shakeAmount = 0;

    this.addChild(sprite);
    this.setFadingIn();
  }

  update(ticker) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(ticker.deltaTime);
        break;
      case STATES.GROWING:
        this.updateGrowing(ticker.deltaTime);
        break;
      case STATES.STATIC:
        this.updateStatic(ticker.elapsedMS);
        break;
      case STATES.SHRINKING:
        this.updateShrinking(ticker.deltaTime);
        break;
      default:
        break;
    }

    this.sprite.scale.set(this.scaleFactor);

    // Update screen shake.
    if (this.shakeValue) {
      if (this.shakeDirection > 0) {
        this.shakeAmount += this.shakeValue * ticker.deltaTime;

        if (this.shakeAmount >= this.shakeValue) {
          this.shakeValue *= SHAKE_FADE;
          this.shakeDirection *= -1;
        }
      } else if (this.shakeDirection < 0) {
        this.shakeAmount -= this.shakeValue * ticker.deltaTime;

        if (this.shakeAmount <= -this.shakeValue) {
          this.shakeValue *= SHAKE_FADE;
          this.shakeDirection *= -1;
        }
      }

      if (this.shakeValue < MIN_SHAKE) {
        this.shakeValue = 0;
        this.shakeAmount = 0;
      }
    }

    if (this.parent) {
      this.parent.moveX(this.shakeAmount);
    }
  }

  updateFadingIn(deltaTime) {
    this.scaleFactor += FADE_INCREMENT * deltaTime;

    if (this.scaleFactor > 1) {
      this.scaleFactor = 1;

      this.parent.soundController.emitSound(this.sound);

      this.shakeParent(SHAKE_AMOUNT);

      this.setStatic();
    }
  }

  updateGrowing(deltaTime) {
    this.scaleFactor += deltaTime * PULSE_INCREMENT;

    if (this.scaleFactor >= PULSE_MAX_SCALE) {
      this.scaleFactor = PULSE_MAX_SCALE;

      this.setStatic();
    }
  }

  updateStatic(elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer > PULSE_INTERVAL) {
      this.timer = 0;
      this.setShrinking();
    }
  }

  updateShrinking(deltaTime) {
    this.scaleFactor -= deltaTime * PULSE_INCREMENT * 1.5;

    if (this.scaleFactor <= 1) {
      this.scaleFactor = 1;

      this.setGrowing();
    }
  }

  shakeParent(amount, { direction = 1 } = {}) {
    this.shakeDirection = direction;
    this.shakeValue = Math.min(MAX_SHAKE, amount * SHAKE_FADE);
  }

  setFadingIn() {
    return this.setState(STATES.FADING_IN);
  }

  setGrowing() {
    return this.setState(STATES.GROWING);
  }

  setStatic() {
    return this.setState(STATES.STATIC);
  }

  setShrinking() {
    return this.setState(STATES.SHRINKING);
  }
}
