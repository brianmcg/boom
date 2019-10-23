import { TIME_STEP } from '~/constants/config';
import Item from '../Item';

const MAX_MOVE_X = 8;

const MAX_MOVE_Y = 4;

const MOVE_AMOUNT_X = 0.4;

const MOVE_AMOUNT_Y = 0.1;

const STATES = {
  FIRING: 'weapon:firing',
  ARMING: 'weapon:arming',
  UNARMING: 'weapon:unarming',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const TYPES = {
  SHOTGUN: 'shotgun',
  CHAINGUN: 'chaingun',
  PISTOL: 'pistol',
};

class Weapon extends Item {
  constructor({ type, player }) {
    super({ type });

    this.offsetX = 0;
    this.offsetY = 64;
    this.player = player;
    this.offsetYDirection = 1;
    this.timer = 0;
    this.waitTime = 300;
    this.power = 2;
    this.equiped = false;

    this.setArming();
  }

  use() {
    if (!this.isDisabled() && !this.isUnarming() && !this.isArming()) {
      this.setFiring();
    }
  }

  update(delta) {
    switch (this.state) {
      case STATES.IDLE: this.updateIdle(delta); break;
      // case STATES.FIRING: this.updateDisabled(); break;
      case STATES.DISABLED: this.updateDisabled(delta); break;
      case STATES.ARMING: this.updateArming(delta); break;
      case STATES.UNARMING: this.updateUnarming(delta); break;
      default: break;
    }
  }

  updateIdle(delta) {
    const { actions, velocity } = this.player;

    // Update x offset
    if (actions.turnLeft) {
      this.offsetX = Math.max(this.offsetX - MOVE_AMOUNT_X * delta, -MAX_MOVE_X);
    } else if (actions.turnRight) {
      this.offsetX = Math.min(this.offsetX + MOVE_AMOUNT_X * delta, MAX_MOVE_X);
    } else if (this.offsetX > 0) {
      this.offsetX = Math.max(this.offsetX - MOVE_AMOUNT_X * delta, 0);
    } else if (this.offsetX < 0) {
      this.offsetX = Math.min(this.offsetX + MOVE_AMOUNT_X * delta, 0);
    }

    // Update y offset
    if (velocity) {
      if (this.offsetYDirection > 0) {
        this.offsetY = Math.min(this.offsetY + MOVE_AMOUNT_Y * delta, MAX_MOVE_Y);
      } else if (this.offsetYDirection < 0) {
        this.offsetY = Math.max(this.offsetY - MOVE_AMOUNT_Y * delta, 0);
      }
    } else if (this.offsetY > 0) {
      this.offsetY = Math.max(this.offsetY - MOVE_AMOUNT_Y * delta, 0);
    }

    if (Math.abs(this.offsetY) === MAX_MOVE_Y || Math.abs(this.offsetY) === 0) {
      this.offsetYDirection *= -1;
    }
  }

  updateDisabled(delta) {
    this.timer += delta * TIME_STEP;

    if (this.timer >= this.waitTime) {
      this.setIdle();
      this.timer = 0;
    }
  }

  updateArming(delta) {
    this.offsetY = Math.max(this.offsetY - MAX_MOVE_X * delta, 0);

    if (this.offsetY === 0) {
      this.setIdle();
    }
  }

  updateUnarming(delta) {
    this.offsetY = Math.min(this.offsetY + MAX_MOVE_X * delta, 64);

    if (this.offsetY === 64) {
      this.player.armNextWeapon();
    }
  }

  setFiring() {
    if (this.setState(STATES.FIRING)) {
      const { player, power } = this;
      player.eyeRotation += power;
      player.world.brightness = power / 10;
    }
  }

  setIdle() {
    this.setState(STATES.IDLE);
  }

  setDisabled() {
    this.setState(STATES.DISABLED);
  }

  setArming() {
    this.setState(STATES.ARMING);
  }

  setUnarming() {
    this.setState(STATES.UNARMING);
  }

  isDisabled() {
    return this.state === STATES.DISABLED;
  }

  isFiring() {
    return this.state === STATES.FIRING;
  }

  isArming() {
    return this.state === STATES.ARMING;
  }

  isUnarming() {
    return this.state === STATES.UNARMING;
  }

  isIdle() {
    return this.state === STATES.IDLE;
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  static get TYPES() {
    return TYPES;
  }
}

export default Weapon;
