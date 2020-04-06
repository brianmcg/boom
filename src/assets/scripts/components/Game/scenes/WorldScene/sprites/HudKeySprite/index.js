import HUDSprite from '../HUDSprite';

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
class HUDKeySprite extends HUDSprite {
  /**
   * Creates a hud keyCard sprite
   * @param  {Texture} texture     The sprite texture.
   */
  constructor(texture) {
    super(texture);

    this.scaleFactor = 0;

    this.hide();
    this.setInactive();
  }

  /**
   * Update the sprite.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.USING:
        this.updateUsing(delta);
        break;
      case STATES.EQUIPPING:
        this.updateEquipping(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update when in using state.
   * @param  {Number} delta The delta time.
   */
  updateUsing(delta) {
    this.rotation += ROTATION_INCREMENT * delta;

    if (this.rotation >= FULL_ROTATION) {
      this.rotation = 0;
      this.setInactive();
    }
  }

  /**
   * Update when in equipping state.
   * @param  {Number} delta The delta time.
   */
  updateEquipping(delta) {
    this.scaleFactor += SCALE_INCREMENT * delta;

    if (this.scaleFactor >= 1) {
      this.scaleFactor = 1;
      this.setInactive();
    }

    this.setScale(this.scaleFactor);
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
    const stateChange = this.setState(STATES.EQUIPPING);

    if (stateChange) {
      this.scaleFactor = 0;
      this.show();
    }

    return stateChange;
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

  /**
   * Set the sprite state
   * @param {String} state The state to set.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}

export default HUDKeySprite;
