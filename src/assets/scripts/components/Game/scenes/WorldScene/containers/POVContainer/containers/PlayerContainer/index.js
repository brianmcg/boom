import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';
import HUDContainer from './containers/HUDContainer';

const MAX_MOVE_X = SCREEN.WIDTH / 40;

const MAX_MOVE_Y = SCREEN.HEIGHT / 22;

const MOVE_INCREMENT_X = 0.4;

const MOVE_INCREMENT_Y = 0.1;

const CHANGE_INCREMENT = 6;

const STATES = {
  IDLE: 'player:idle',
  UNARMING: 'player:unarming',
  ARMING: 'player:arming',
  FIRING: 'player:firing',
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

    this.addChild(weapon);
    this.addChild(new HUDContainer(player, hud));
    this.player = player;
    this.sprites = sprites;


    this.centerX = weapon.x;
    this.centerY = weapon.y;
    this.weaponHeight = weapon.height;

    this.offsetY = weapon.height;
    this.offsetX = 0;
    this.offsetYDirection = 1;

    player.onChangeWeapon(() => this.setUnarming());

    this.setArming();
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    super.update(delta);

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
      case STATES.FIRING:
        this.updateFiring(delta);
        break;
      default:
        break;
    }

    this.sprites.weapon.x = this.centerX + this.offsetX;
    this.sprites.weapon.y = this.centerY + this.offsetY;
  }

  /**
   * Update the container in the idle state.
   * @param  {Number} delta The delta time.
   */
  updateIdle(delta) {
    const { actions, velocity } = this.player;

    // Update x offset
    if (actions.turnLeft) {
      this.offsetX = Math.max(this.offsetX - MOVE_INCREMENT_X * delta, -MAX_MOVE_X);
    } else if (actions.turnRight) {
      this.offsetX = Math.min(this.offsetX + MOVE_INCREMENT_X * delta, MAX_MOVE_X);
    } else if (this.offsetX > 0) {
      this.offsetX = Math.max(this.offsetX - MOVE_INCREMENT_X * delta, 0);
    } else if (this.offsetX < 0) {
      this.offsetX = Math.min(this.offsetX + MOVE_INCREMENT_X * delta, 0);
    }

    // Update y offset
    if (velocity) {
      if (this.offsetYDirection > 0) {
        this.offsetY = Math.min(this.offsetY + MOVE_INCREMENT_Y * delta, MAX_MOVE_Y);
      } else if (this.offsetYDirection < 0) {
        this.offsetY = Math.max(this.offsetY - MOVE_INCREMENT_Y * delta, 0);
      }
    } else if (this.offsetY > 0) {
      this.offsetY = Math.max(this.offsetY - MOVE_INCREMENT_Y * delta, 0);
    }

    if (Math.abs(this.offsetY) === MAX_MOVE_Y || Math.abs(this.offsetY) === 0) {
      this.offsetYDirection *= -1;
    }
  }

  /**
   * Update the container in teh arming state.
   * @param  {Number} delta The delta time.
   */
  updateArming(delta) {
    this.offsetY -= CHANGE_INCREMENT * delta;

    if (this.offsetY <= 0) {
      this.offsetY = 0;
      this.setIdle();
    }
  }

  /**
   * Update the container in the unarming state.
   * @param  {Number} delta The delta time.
   */
  updateUnarming(delta) {
    this.offsetY += CHANGE_INCREMENT * delta;

    if (this.offsetY >= this.weaponHeight) {
      this.offsetY = this.weaponHeight;

      this.setArming();
    }
  }

  /**
   * Set the idle state.
   * @returns {Boolean} The state changed.
   */
  setIdle() {
    const isStateChanged = this.setState(STATES.IDLE);

    if (isStateChanged) {
      this.player.weapon.setIdle();
    }

    return isStateChanged;
  }

  /**
   * Set the firing state.
   * @returns {Boolean} The state changed.
   */
  setFiring() {
    const isStateChanged = this.setState(STATES.FIRING);

    return isStateChanged;
  }

  /**
   * Set the arming state.
   * @returns {Boolean} The state changed.
   */
  setArming() {
    const isStateChanged = this.setState(STATES.ARMING);

    if (isStateChanged) {
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

    return isStateChanged;
  }
}

export default PlayerContainer;
