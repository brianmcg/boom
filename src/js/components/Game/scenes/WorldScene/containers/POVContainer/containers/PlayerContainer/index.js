import { Container } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';
import { GREY } from '@game/constants/colors';
import HUDContainer from './containers/HUDContainer';

const MAX_MOVE_X = SCREEN.WIDTH / 40;

const MAX_MOVE_Y = SCREEN.HEIGHT / 22;

const MOVE_INCREMENT_X = SCREEN.WIDTH / 750;

const MOVE_INCREMENT_Y = SCREEN.HEIGHT / 900;

const CHANGE_INCREMENT = SCREEN.HEIGHT / 20;

const BREATH_MULTIPLIER = SCREEN.HEIGHT / 30;

const ROT_MULTIPLIER = SCREEN.WIDTH / 33;

const STATES = {
  IDLE: 'player:idle',
  UNARMING: 'player:unarming',
  ARMING: 'player:arming',
  DYING: 'player:dying',
};

/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates a PlayerContainer.
   * @param  {Player} player  The player.
   * @param  {Object} sprites The player sprites.
   */
  constructor(player, sprites = {}) {
    super();

    const { weapon, hud } = sprites;

    this.hudContainer = new HUDContainer(player, hud);

    this.addChild(weapon);
    this.addChild(this.hudContainer);
    this.player = player;
    this.sprites = sprites;

    this.weaponCenterX = weapon.x;
    this.weaponCenterY = weapon.y;
    this.weaponHeight = weapon.height;

    this.weaponX = 0;
    this.weaponY = weapon.height;
    this.weaponYDirection = 1;

    player.onChangeWeapon(() => this.setUnarming());
    player.onDying(() => this.setDying());

    this.setArming();

    this.fadeAmount = 0;
  }

  /**
   * Remove the HUD diplay.
   */
  removeHud() {
    this.removeChild(this.hudContainer);
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    const { weapon } = this.sprites;
    const { light, brightness } = this.player.parent;

    let intensity = brightness + light;

    switch (this.state) {
      case STATES.IDLE:
        this.updateIdle(delta);
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

    if (intensity > 1) {
      intensity = 1;
    }

    if (intensity < 0) {
      intensity = 0;
    }

    weapon.x = this.weaponCenterX + this.weaponX;
    weapon.y = this.weaponCenterY + this.weaponY + this.player.breath * BREATH_MULTIPLIER;
    weapon.tint = Math.round(intensity * 255) * GREY;

    super.update(delta, elapsedMS);
  }

  /**
   * Update the container in the idle state.
   * @param  {Number} delta The delta time.
   */
  updateIdle(delta) {
    const { rotateAngle, velocity } = this.player;

    // Update x offset
    if (rotateAngle < 0) {
      this.weaponX = Math.max(this.weaponX + rotateAngle * ROT_MULTIPLIER * delta, -MAX_MOVE_X);
    } else if (rotateAngle > 0) {
      this.weaponX = Math.min(this.weaponX + rotateAngle * ROT_MULTIPLIER * delta, MAX_MOVE_X);
    } else if (this.weaponX > 0) {
      this.weaponX = Math.max(this.weaponX - MOVE_INCREMENT_X * delta, 0);
    } else if (this.weaponX < 0) {
      this.weaponX = Math.min(this.weaponX + MOVE_INCREMENT_X * delta, 0);
    }

    // Update y offset
    if (velocity) {
      if (this.weaponYDirection > 0) {
        this.weaponY = Math.min(this.weaponY + MOVE_INCREMENT_Y * delta, MAX_MOVE_Y);
      } else if (this.weaponYDirection < 0) {
        this.weaponY = Math.max(this.weaponY - MOVE_INCREMENT_Y * delta, 0);
      }
    } else if (this.weaponY > 0) {
      this.weaponY = Math.max(this.weaponY - MOVE_INCREMENT_Y * delta, 0);
    }

    if (Math.abs(this.weaponY) === MAX_MOVE_Y || Math.abs(this.weaponY) === 0) {
      this.weaponYDirection *= -1;
    }
  }

  /**
   * Update the container in teh arming state.
   * @param  {Number} delta The delta time.
   */
  updateArming(delta) {
    this.weaponY -= CHANGE_INCREMENT * delta;

    if (this.weaponY <= 0) {
      this.weaponY = 0;
      this.setIdle();

      if (this.player.weapon.secondary) {
        this.player.weapon.use();
      }
    }
  }

  /**
   * Update the container in the unarming state.
   * @param  {Number} delta The delta time.
   */
  updateUnarming(delta) {
    this.weaponY += CHANGE_INCREMENT * delta;

    if (this.weaponY >= this.weaponHeight) {
      this.weaponY = this.weaponHeight;

      this.setArming();
    }
  }

  /**
   * Update the container in the dead state.
   * @param  {Number} delta The delta time.
   */
  updateDying(delta) {
    this.fadeAmount += delta;

    if (this.fadeAmount > 1) {
      this.fadeAmount = 1;
      this.removeChildren();
    }

    this.fade(this.fadeAmount);

    this.weaponY += CHANGE_INCREMENT * 0.5 * delta;

    if (this.weaponY >= this.weaponHeight) {
      this.weaponY = this.weaponHeight;
    }
  }

  /**
   * Set the idle state.
   * @returns {Boolean} The state changed.
   */
  setIdle() {
    const isStateChanged = this.setState(STATES.IDLE);

    if (isStateChanged) {
      this.player.enableWeaponChange();
      this.player.weapon.setAiming();
    }

    return isStateChanged;
  }

  /**
   * Set the arming state.
   * @returns {Boolean} The state changed.
   */
  setArming() {
    const isStateChanged = !!this.player.weapon && this.setState(STATES.ARMING);

    if (isStateChanged) {
      this.player.weapon.setDisabled();
      this.sprites.weapon.setIdle();
    }

    return isStateChanged;
  }

  /**
   * Set the unarming state.
   * @returns {Boolean} The state changed.
   */
  setUnarming() {
    const isStateChanged = this.setState(STATES.UNARMING);

    if (isStateChanged) {
      this.player.weapon?.setDisabled();
    }

    return isStateChanged;
  }

  /**
   * Set the dead state.
   */
  setDying() {
    return this.setState(STATES.DYING);
  }

  /**
   * Destroy the container.
   * @param  {Object} options The destroy options.
   */
  destroy(options) {
    const { weapon } = this.sprites;

    weapon.removeAllListeners();
    this.removeChild(weapon);
    weapon.destroy();

    this.removeChild(this.hudContainer);
    this.hudContainer.destroy(options);

    super.destroy(options);
  }
}

export default PlayerContainer;
