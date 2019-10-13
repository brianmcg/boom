const MAX_MOVE_X = 8;
const MAX_MOVE_Y = 4;
const MOVE_AMOUNT_X = 0.4;
const MOVE_AMOUNT_Y = 0.1;

class Weapon {
  constructor({ type, player }) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.player = player;
    this.yDirection = 1;
  }

  update(delta) {
    const { actions, velocity } = this.player;

    if (actions.turnLeft) {
      this.x = Math.max(this.x - MOVE_AMOUNT_X * delta, -MAX_MOVE_X);
    } else if (actions.turnRight) {
      this.x = Math.min(this.x + MOVE_AMOUNT_X * delta, MAX_MOVE_X);
    } else if (this.x > 0) {
      this.x = Math.max(this.x - MOVE_AMOUNT_X * delta, 0);
    } else if (this.x < 0) {
      this.x = Math.min(this.x + MOVE_AMOUNT_X * delta, 0);
    }

    const absVelocity = Math.abs(velocity);

    if (absVelocity) {
      if (this.yDirection > 0) {
        this.y = Math.min(this.y + MOVE_AMOUNT_Y * delta, MAX_MOVE_Y);
      } else if (this.yDirection < 0) {
        this.y = Math.max(this.y - MOVE_AMOUNT_Y * delta, 0);
      }
    } else if (this.y > 0) {
      this.y = Math.max(this.y - MOVE_AMOUNT_Y * delta, 0);
    }

    if (Math.abs(this.y) === MAX_MOVE_Y || Math.abs(this.y) === 0) {
      this.yDirection *= -1;
    }
  }
}

export default Weapon;
