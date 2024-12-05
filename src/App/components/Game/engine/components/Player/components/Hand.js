import { EventEmitter } from '@game/core/graphics';

const MAX_MOVE_X = 1;
const MOVE_INCREMENT_X = 0.05;

const MAX_MOVE_Y = 0.1;
const MOVE_INCREMENT_Y = 0.0025;

const CHANGE_INCREMENT_Y = 0.1;

const ROTATE_MULTIPLIER = 1.2;

const BREATH_INCREMENT = 0.0006;
const BREATH_MULTIPLIER = -2;
const MAX_BREATH_AMOUNT = 0.05;

const STATES = {
  AIMING: 'hand:aiming',
  UNARMING: 'hand:unarming',
  ARMING: 'hand:arming',
  DYING: 'hand:dying',
  UNARMED: 'hand:unarmed',
};

const EVENTS = {
  ARMING: 'hand:arming',
  UNARMING: 'hand:unarming',
  AIMING: 'hand:aiming',
};

export default class Hand extends EventEmitter {
  constructor(player) {
    super();

    this.player = player;
    this.breathDirection = 1;
    this.breath = 0;
    this.rotateX = 0;
    this.moveY = 1;
    this.moveX = 0;
    this.moveYDirection = 1;
    this.state = STATES.UNARMED;
    this.weapon = null;
  }

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
      default:
        break;
    }
  }

  updateAiming(delta) {
    const { rotateAngle, velocity } = this.player;

    // Update x offset
    if (rotateAngle < 0) {
      this.rotateX = Math.max(
        this.rotateX + rotateAngle * ROTATE_MULTIPLIER * delta,
        -MAX_MOVE_X
      );
    } else if (rotateAngle > 0) {
      this.rotateX = Math.min(
        this.rotateX + rotateAngle * ROTATE_MULTIPLIER * delta,
        MAX_MOVE_X
      );
    } else if (this.rotateX > 0) {
      this.rotateX = Math.max(this.rotateX - MOVE_INCREMENT_X * delta, 0);
    } else if (this.rotateX < 0) {
      this.rotateX = Math.min(this.rotateX + MOVE_INCREMENT_X * delta, 0);
    }

    // Update y offset
    if (velocity) {
      if (this.moveYDirection > 0) {
        this.moveY = Math.min(
          this.moveY + MOVE_INCREMENT_Y * delta,
          MAX_MOVE_Y
        );
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

  updateArming(delta) {
    const changeIncrement =
      this.player.weapon.type === 3
        ? CHANGE_INCREMENT_Y * 4
        : CHANGE_INCREMENT_Y;
    this.moveY -= changeIncrement * delta;

    if (this.moveY <= 0) {
      this.moveY = 0;
      this.setAiming();
    }
  }

  updateUnarming(delta) {
    // const changeIncrement =
    //   this.player.weapon.type === 3
    //     ? CHANGE_INCREMENT_Y * 4
    //     : CHANGE_INCREMENT_Y;

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

  onArming(callback) {
    this.on(EVENTS.ARMING, callback);
  }

  onUnarming(callback) {
    this.on(EVENTS.UNARMING, callback);
  }

  onAiming(callback) {
    this.on(EVENTS.AIMING, callback);
  }

  canChangeWeapon() {
    return this.state === STATES.AIMING || this.state === STATES.UNARMED;
  }

  canUseWeapon() {
    return this.state === STATES.AIMING;
  }

  setAiming() {
    const isStateChanged = this.setState(STATES.AIMING);

    if (isStateChanged) {
      this.emit(EVENTS.AIMING);
    }

    return isStateChanged;
  }

  setArming() {
    const isStateChanged = this.setState(STATES.ARMING);

    if (isStateChanged) {
      this.emit(EVENTS.ARMING);
    }

    return isStateChanged;
  }

  setUnarming() {
    if (this.setState(STATES.UNARMING)) {
      this.emit(EVENTS.UNARMING);

      return true;
    }

    return false;
  }

  setDying() {
    return this.setState(STATES.DYING);
  }

  setUnarmed() {
    return this.setState(STATES.UNARMED);
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;
      return true;
    }

    return false;
  }

  destroy() {
    this.removeAllListeners();
  }

  get posY() {
    return this.moveY + this.breath;
  }

  get posX() {
    return this.rotateX;
  }
}
