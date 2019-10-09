import { SCREEN } from '~/constants/config';
import { TAN, DEG } from '~/core/physics';

const DEFAULT_CENTER_X = SCREEN.WIDTH / 2;

const DEFAULT_CENTER_Y = SCREEN.HEIGHT / 2;

const DEFAULT_DISTANCE = SCREEN.WIDTH / 2 / TAN[DEG[30]];

const SHAKE_AMOUNT = 0.06;

const MAX_SHAKE = 5;

class Camera {
  constructor(player) {
    this.player = player;
    this.distance = DEFAULT_DISTANCE;
    this.centerX = DEFAULT_CENTER_X;
    this.centerY = DEFAULT_CENTER_Y;
    this.height = player.height;

    this.offsetY = 0;
    this.shakeDirection = 1;
  }

  update(delta) {
    const {
      height,
      velocity,
      maxVelocity,
      yAngle,
    } = this.player;

    this.centerY = DEFAULT_CENTER_Y + yAngle;

    if (velocity) {
      if (this.shakeDirection > 0) {
        this.offsetY = Math.min(this.offsetY + (SHAKE_AMOUNT * delta * velocity), MAX_SHAKE);
      } else if (this.shakeDirection < 0) {
        this.offsetY = Math.max(this.offsetY - (SHAKE_AMOUNT * delta * velocity), 0);
      }
    } else {
      this.offsetY = Math.max(this.offsetY - (SHAKE_AMOUNT * delta * maxVelocity), 0);
    }

    if (this.offsetY === MAX_SHAKE || this.offsetY === 0) {
      this.shakeDirection *= -1;
    }

    this.height = height + this.offsetY;
  }
}

export default Camera;
