import { SCREEN } from '@constants/config';
import { TextSprite } from '@game/core/graphics';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { RED } from '@constants/colors';

const TIME_TO_LIVE = 1500;

const SCALE_INCREMENT = 0.05;

const STATES = {
  GROWING: 'message:growing',
  DISPLAYING: 'message:displaying',
  SHRINKING: 'message:shrinking',
  COMPLETE: 'message:complete',
};

export default class MessageSprite extends TextSprite {
  constructor(text, { priority = 0 } = {}) {
    super({
      text,
      fontFamily: GAME_FONT.NAME,
      fontSize: Object.values(FONT_SIZES)[priority],
      color: RED,
      anchor: 0.5,
      x: SCREEN.WIDTH / 2,
      y: SCREEN.HEIGHT / 2,
    });

    this.timer = 0;
    this.scaleAmount = 0;

    this.scale.set(this.scaleAmount);
    this.setGrowing();
  }

  fade(value) {
    const scale = (1 - value) * this.scaleAmount;

    this.scale.set(scale);

    if (this.isShrinking() && scale === 0) {
      this.visible = false;
    }
  }

  onComplete(callback) {
    this.on(STATES.COMPLETE, callback);
  }

  update(ticker) {
    switch (this.state) {
      case STATES.GROWING:
        this.updateGrowing(ticker.deltaTime);
        break;
      case STATES.DISPLAYING:
        this.updateDisplaying(ticker.elapsedMS);
        break;
      case STATES.SHRINKING:
        this.updateShrinking(ticker.deltaTime);
        break;
      default:
        break;
    }
  }

  updateGrowing(deltaTime) {
    this.scale.set(this.scaleAmount);

    this.scaleAmount += SCALE_INCREMENT * deltaTime;

    if (this.scaleAmount >= 1) {
      this.scaleAmount = 1;
      this.setDisplaying();
    }
  }

  updateDisplaying(elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer >= TIME_TO_LIVE) {
      this.timer = 0;
      this.setShrinking();
    }
  }

  updateShrinking(deltaTime) {
    this.scale.set(this.scaleAmount);

    this.scaleAmount -= SCALE_INCREMENT * deltaTime;

    if (this.scaleAmount <= 0) {
      this.scaleAmount = 0;
      this.setComplete();
    }
  }

  isShrinking() {
    return this.state === STATES.SHRINKING;
  }

  isGrowing() {
    this.state === STATES.GROWING;
  }

  isDisplaying() {
    this.state === STATES.DISPLAYING;
  }

  setGrowing() {
    return this.setState(STATES.GROWING);
  }

  setDisplaying() {
    const isStateChanged = this.setState(STATES.DISPLAYING);

    if (isStateChanged) {
      this.scale.set(1);
    }

    return isStateChanged;
  }

  setShrinking() {
    return this.setState(STATES.SHRINKING);
  }

  setComplete() {
    const isStateChanged = this.setState(STATES.COMPLETE);

    if (isStateChanged) {
      this.emit(STATES.COMPLETE);
    }

    return isStateChanged;
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}
