import HUDSprite from './HUDSprite';

const STATES = {
  INACTIVE: 'key:inactive',
  EQUIPPING: 'key:equipping',
  USING: 'key:using',
};

const FULL_ROTATION = Math.PI * 2;

const ROTATION_INCREMENT = 0.3;

const SCALE_INCREMENT = 0.075;

export default class HUDKeySprite extends HUDSprite {
  constructor(texture) {
    super(texture);

    this.scaleFactor = 0;

    this.hide();
    this.setInactive();
    this.anchor.set(0.5);
  }

  update(ticker) {
    switch (this.state) {
      case STATES.USING:
        this.updateUsing(ticker.deltaTime);
        break;
      case STATES.EQUIPPING:
        this.updateEquipping(ticker.deltaTime);
        break;
      default:
        break;
    }
  }

  updateUsing(deltaTime) {
    this.rotation += ROTATION_INCREMENT * deltaTime;

    if (this.rotation >= FULL_ROTATION) {
      this.rotation = 0;
      this.setInactive();
    }
  }

  updateEquipping(deltaTime) {
    this.scaleFactor += SCALE_INCREMENT * deltaTime;

    if (this.scaleFactor >= 1) {
      this.scaleFactor = 1;
      this.setInactive();
    }

    this.scale.set(this.scaleFactor);
  }

  setInactive() {
    return this.setState(STATES.INACTIVE);
  }

  setEquipping() {
    const isStateChanged = this.setState(STATES.EQUIPPING);

    if (isStateChanged) {
      this.scaleFactor = 0;
      this.show();
    }

    return isStateChanged;
  }

  setUsing() {
    return this.setState(STATES.USING);
  }

  isInactive() {
    return this.state === STATES.INACTIVE;
  }

  isEquipping() {
    return this.state === STATES.EQUIPPING;
  }

  isUsing() {
    return this.state === STATES.USING;
  }
}
