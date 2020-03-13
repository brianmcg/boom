import { Sprite } from 'game/core/graphics';

const STATES = {
  ACTIVE: 'key:active',
  INACTIVE: 'key:inactive',
};

const FULL_ROTATION = Math.PI * 2;

const ROTATION_INCREMENT = 0.3;

/**
 * Class representing a hud keyCard sprite.
 */
class HudKeySprite extends Sprite {
  /**
   * Creates a hud keyCard sprite
   * @param  {Texture} texture     The sprite texture.
   * @param  {Key}     options.keyCard The keyCard entity.
   */
  constructor(texture, { keyCard } = {}) {
    super(texture);

    this.hide();
    this.anchor.set(0.5);
    this.setInactive();

    keyCard.onEquipEvent(this.show.bind(this));
    keyCard.onUseEvent(this.setActive.bind(this));
  }

  /**
   * Update the sprite.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.rotation += ROTATION_INCREMENT * delta;

    if (this.rotation >= FULL_ROTATION) {
      this.rotation = 0;
      this.setInactive();
    }
  }

  /**
   * Set the state to active.
   * @return {Boolean} State change successfull.
   */
  setActive() {
    return this.setState(STATES.ACTIVE);
  }

  /**
   * Set the state to inactive.
   * @return {Boolean} State change successfull.
   */
  setInactive() {
    return this.setState(STATES.INACTIVE);
  }

  /**
   * Is the state active.
   * @return {Boolean} The state is active.
   */
  isActive() {
    return this.state === STATES.ACTIVE;
  }

  /**
   * Is the state inactive.
   * @return {Boolean} The state is active.
   */
  isInactive() {
    return this.state === STATES.INACTIVE;
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

export default HudKeySprite;
