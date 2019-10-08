import AbstractEnemy from '../AbstractEnemy';

const STATES = {
  AIMING: 'aim',
  CHASING: 'chase',
  DEAD: 'dead',
  FIRING: 'fire',
  HURT: 'hurt',
  IDLE: 'idle',
  PATROLLING: 'patrol',
  READY: 'ready',
};

class Zombie extends AbstractEnemy {
  constructor(options) {
    super(options);

    this.state = STATES.PATROLLING;
  }

  update(...options) {
    super.update(...options);
  }

  isAiming() {
    return this.state === STATES.AIMING;
  }

  isChasing() {
    return this.state === STATES.CHASING;
  }

  isDead() {
    return this.state === STATES.DEAD;
  }

  isFiring() {
    return this.state === STATES.FIRING;
  }

  isHurt() {
    return this.state === STATES.HURT;
  }

  isIdle() {
    return this.state === STATES.IDLE;
  }

  isPatrolling() {
    return this.state === STATES.PATROLLING;
  }

  isReady() {
    return this.state === STATES.READY;
  }
}

export default Zombie;
