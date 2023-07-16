// {
//   MAX_MOVE_X: 8.4,
//   MAX_MOVE_Y: 6.545454545454546,
//   MOVE_INCREMENT_X: 0.448,
//   MOVE_INCREMENT_Y: 0.16,
//   CHANGE_INCREMENT_Y: 7.2,
//   BREATH_MULTIPLIER: 4.8,
//   ROT_MULTIPLIER: 10.181818181818182,
// }

const MAX_MOVE_X = 1;
const MOVE_INCREMENT_X = 0.05;

const MAX_MOVE_Y = 0.1;
const MOVE_INCREMENT_Y = 0.0025;

const CHANGE_INCREMENT_Y = 0.1;

const ROT_MULTIPLIER = 1.2;

const STATES = {
  AIMING: 'hand:aiming',
  UNARMING: 'hand:unarming',
  ARMING: 'hand:arming',
  DYING: 'hand:dying',
  UNARMED: 'hand:unarmed',
};

const BREATH_INCREMENT = 0.0002;

const BREATH_MULTIPLIER = -2;

const MAX_BREATH_AMOUNT = 0.04;

/**
 * Class representing an map container.
 */
class Hand {
  /**
   * Creates a Hand.
   * @param  {Player} player  The player.
   * @param  {Object} sprites The player sprites.
   */
  constructor(player) {
    this.player = player;

    this.breathDirection = 1;
    this.breath = 0;

    this.rotateX = 0;
    this.moveY = 0;
    this.moveX = 0;
    this.moveYDirection = 1;

    this.state = STATES.AIMING;
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.breath += BREATH_INCREMENT * this.breathDirection * delta;

    if (this.breath >= MAX_BREATH_AMOUNT) {
      this.breath = MAX_BREATH_AMOUNT;
      this.breathDirection *= BREATH_MULTIPLIER;
    } else if (this.breath <= 0) {
      this.breath = 0;
      this.breathDirection /= BREATH_MULTIPLIER;
    }

    switch (this.state) {
      case STATES.AIMING:
        this.updateAiming(delta);
        break;
      case STATES.ARMING:
        this.updateArming(delta);
        break;
      case STATES.UNARMING:
        this.updateUnarming(delta);
        break;
      case STATES.DYING:
        this.updateDying(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the container in the aiming state.
   * @param  {Number} delta The delta time.
   */
  updateAiming(delta) {
    const { rotateAngle, velocity } = this.player;

    // Update x offset
    if (rotateAngle < 0) {
      this.rotateX = Math.max(this.rotateX + rotateAngle * ROT_MULTIPLIER * delta, -MAX_MOVE_X);
    } else if (rotateAngle > 0) {
      this.rotateX = Math.min(this.rotateX + rotateAngle * ROT_MULTIPLIER * delta, MAX_MOVE_X);
    } else if (this.rotateX > 0) {
      this.rotateX = Math.max(this.rotateX - MOVE_INCREMENT_X * delta, 0);
    } else if (this.rotateX < 0) {
      this.rotateX = Math.min(this.rotateX + MOVE_INCREMENT_X * delta, 0);
    }

    // Update y offset
    if (velocity) {
      if (this.moveYDirection > 0) {
        this.moveY = Math.min(this.moveY + MOVE_INCREMENT_Y * delta, MAX_MOVE_Y);
      } else if (this.moveYDirection < 0) {
        this.moveY = Math.max(this.moveY - MOVE_INCREMENT_Y * delta, 0);
      }
    } else if (this.moveY > 0) {
      this.moveY = Math.max(this.moveY - MOVE_INCREMENT_Y * delta, 0);
    }

    if (Math.abs(this.moveY) === MAX_MOVE_Y || Math.abs(this.moveY) === 0) {
      this.moveYDirection *= -1;
    }
  }

  /**
   * Update the container in teh arming state.
   * @param  {Number} delta The delta time.
   */
  updateArming(delta) {
    this.moveY -= CHANGE_INCREMENT_Y * delta;

    if (this.moveY <= 0) {
      this.moveY = 0;
      this.setAiming();

      if (this.player.weapon.secondary) {
        this.player.useWeapon();
      }
    }
  }

  /**
   * Update the container in the unarming state.
   * @param  {Number} delta The delta time.
   */
  updateUnarming(delta) {
    this.moveY += CHANGE_INCREMENT_Y * delta;

    if (this.moveY >= 1) {
      this.moveY = 1;

      if (this.player.weapon) {
        this.setArming();
      } else {
        this.setUnarmed();
      }
    }
  }

  // updateDying(delta) {
  //   this.fadeAmount += delta;

  //   if (this.fadeAmount > 1) {
  //     this.fadeAmount = 1;
  //     this.removeChildren();
  //   }

  //   this.fade(this.fadeAmount);

  //   this.weaponY += CHANGE_INCREMENT * 0.5 * delta;

  //   if (this.weaponY >= this.weaponHeight) {
  //     this.weaponY = this.weaponHeight;
  //   }
  // }

  /**
   * Update the container in the dead state.
   * @param  {Number} delta The delta time.
   */
  updateDying(delta) {
    this.moveY += CHANGE_INCREMENT_Y * 0.5 * delta;

    if (this.moveY >= 1) {
      this.moveY = 1;
    }
  }

  /**
   * Can the weapon be changed.
   * @return {Boolean} Can the weapon be changed.
   */
  canChangeWeapon() {
    return this.state === STATES.AIMING || this.state === STATES.UNARMED;
  }

  /**
   * Set the aiming state.
   * @returns {Boolean} The state changed.
   */
  setAiming() {
    const isStateChanged = this.setState(STATES.AIMING);

    if (isStateChanged) {
      this.player.weapon?.setAiming();
    }

    return isStateChanged;
  }

  /**
   * Set the arming state.
   * @returns {Boolean} The state changed.
   */
  setArming() {
    const isStateChanged = this.setState(STATES.ARMING);

    if (isStateChanged) {
      this.player.emit('player:change:weapon');
    }

    return isStateChanged;
  }

  /**
   * Set the unarming state.
   * @returns {Boolean} The state changed.
   */
  setUnarming() {
    return this.setState(STATES.UNARMING);
  }

  /**
   * Set the dead state.
   */
  setDying() {
    return this.setState(STATES.DYING);
  }

  /**
   * Set the stae to unarmed.
   */
  setUnarmed() {
    return this.setState(STATES.UNARMED);
  }

  /**
   * Set the state.
   * @param {String} state The state to set.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      return true;
    }

    return false;
  }

  get posY() {
    return this.moveY + this.breath;
  }

  get posX() {
    return this.rotateX;
  }
}

export default Hand;
