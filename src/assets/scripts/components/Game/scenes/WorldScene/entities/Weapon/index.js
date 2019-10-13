import { TIME_STEP } from '~/constants/config';
import Item from '../Item';

const MAX_MOVE_X = 8;

const MAX_MOVE_Y = 4;

const MOVE_AMOUNT_X = 0.4;

const MOVE_AMOUNT_Y = 0.1;

const STATES = {
  FIRING: 'weapon:firing',
  WAITING: 'weapon:waiting',
  ARMING: 'weapon:arming',
  UNARMING: 'weapon:unarming',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const EVENTS = {
  FIRE: 'weapon:fire',
};

class Weapon extends Item {
  constructor({ type, player }) {
    super({ type });

    this.offsetX = 0;
    this.offsetY = 0;
    this.player = player;
    this.offsetYDirection = 1;
    this.timer = 0;
    this.waitTime = 100;
    this.power = 4;

    this.setIdle();
  }

  update(delta) {
    const { actions, velocity } = this.player;

    // Update x
    if (actions.turnLeft) {
      this.offsetX = Math.max(this.offsetX - MOVE_AMOUNT_X * delta, -MAX_MOVE_X);
    } else if (actions.turnRight) {
      this.offsetX = Math.min(this.offsetX + MOVE_AMOUNT_X * delta, MAX_MOVE_X);
    } else if (this.offsetX > 0) {
      this.offsetX = Math.max(this.offsetX - MOVE_AMOUNT_X * delta, 0);
    } else if (this.offsetX < 0) {
      this.offsetX = Math.min(this.offsetX + MOVE_AMOUNT_X * delta, 0);
    }

    // Update y
    if (velocity) {
      if (this.offsetYDirection > 0) {
        this.offsetY = Math.min(this.offsetY + MOVE_AMOUNT_Y * delta, MAX_MOVE_Y);
      } else if (this.offsetYDirection < 0) {
        this.offsetY = Math.max(this.offsetY - MOVE_AMOUNT_Y * delta, 0);
      }
    } else if (this.offsetY > 0) {
      this.offsetY = Math.max(this.offsetY - MOVE_AMOUNT_Y * delta, 0);
    }

    // Update direction
    if (Math.abs(this.offsetY) === MAX_MOVE_Y || Math.abs(this.offsetY) === 0) {
      this.offsetYDirection *= -1;
    }

    // Update state
    if (actions.attack) {
      if (!this.isFiring() && !this.isDisabled()) {
        this.player.eyeRotation += this.power;
        this.setFiring();
      }
    }

    if (this.isDisabled()) {
      this.timer += delta * TIME_STEP;

      if (this.timer >= this.waitTime) {
        this.setIdle();
        this.timer = 0;
      }
    }
  }

  setFiring() {
    this.state = STATES.FIRING;
  }

  setIdle() {
    this.state = STATES.IDLE;
  }

  setDisabled() {
    this.state = STATES.DISABLED;
  }

  setArming() {
    this.state = STATES.ARMING;
  }

  setUnarming() {
    this.state = STATES.UNARMING;
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
}

export default Weapon;
