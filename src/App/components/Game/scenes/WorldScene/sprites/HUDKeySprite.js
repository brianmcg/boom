import HUDSprite from './HUDSprite';

const STATES = {
  INACTIVE: 'key:inactive',
  EQUIPPING: 'key:equipping',
  USING: 'key:using',
};

const FULL_ROTATION = Math.PI * 2;

const ROTATION_INCREMENT = 0.3;

const SCALE_INCREMENT = 0.075;

/**
 * Class representing a hud keyCard sprite.
 */
export default class HUDKeySprite extends HUDSprite {
  /**
   * Creates a hud keyCard sprite
   * @param  {Texture} texture     The sprite texture.
   */
  constructor(texture) {
    super(texture);

    this.scaleFactor = 0;

    this.hide();
    this.setInactive();
    this.anchor.set(0.5);
  }

  /**
   * Update the sprite.
   * @param  {Number} delta The delta time.
   */
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

  /**
   * Update when in using state.
   * @param  {Number} delta The delta time.
   */
  updateUsing(deltaTime) {
    this.rotation += ROTATION_INCREMENT * deltaTime;

    if (this.rotation >= FULL_ROTATION) {
      this.rotation = 0;
      this.setInactive();
    }
  }

  /**
   * Update when in equipping state.
   * @param  {Number} delta The delta time.
   */
  updateEquipping(deltaTime) {
    this.scaleFactor += SCALE_INCREMENT * deltaTime;

    if (this.scaleFactor >= 1) {
      this.scaleFactor = 1;
      this.setInactive();
    }

    this.scale.set(this.scaleFactor);
  }

  /**
   * Set the state to inactive.
   * @return {Boolean} State change successfull.
   */
  setInactive() {
    return this.setState(STATES.INACTIVE);
  }

  /**
   * Set the state to equipping.
   * @return {Boolean} State change successfull.
   */
  setEquipping() {
    const isStateChanged = this.setState(STATES.EQUIPPING);

    if (isStateChanged) {
      this.scaleFactor = 0;
      this.show();
    }

    return isStateChanged;
  }

  /**
   * Set the state to using.
   * @return {Boolean} State change successfull.
   */
  setUsing() {
    return this.setState(STATES.USING);
  }

  /**
   * Is the state inactive.
   * @return {Boolean} The state is active.
   */
  isInactive() {
    return this.state === STATES.INACTIVE;
  }

  /**
   * Is the state equipping.
   * @return {Boolean} The state is active.
   */
  isEquipping() {
    return this.state === STATES.EQUIPPING;
  }

  /**
   * Is the state using.
   * @return {Boolean} The state is active.
   */
  isUsing() {
    return this.state === STATES.USING;
  }
}
