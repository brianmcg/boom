import { SCREEN } from '~/constants/config';
import { TAN, DEG } from '~/core/physics';

const DEFAULT_CENTER_X = SCREEN.WIDTH / 2;

const DEFAULT_CENTER_Y = SCREEN.HEIGHT / 2;

const DEFAULT_DISTANCE = SCREEN.WIDTH / 2 / TAN[DEG[30]];

const MAX_HEIGHT_DIFF = 5;

let yIncrement = 0.06;

class Camera {
  constructor(player) {
    this.player = player;
    this.distance = DEFAULT_DISTANCE;
    this.centerX = DEFAULT_CENTER_X;
    this.centerY = DEFAULT_CENTER_Y;
    this.height = player.height;
  }

  update(delta) {
    const { height, velocity, maxVelocity } = this.player;

    if (velocity) {
      this.height += yIncrement * velocity * delta;

      if ((this.height - height) > MAX_HEIGHT_DIFF) {
        this.height = height + MAX_HEIGHT_DIFF;
        yIncrement *= -1;
      }

      if (this.height < height) {
        this.height = height;
        yIncrement *= -1;
      }
    } else {
      yIncrement = Math.abs(yIncrement);

      this.height -= yIncrement * delta * maxVelocity;

      if (this.height < height) {
        this.height = height;
      }
    }
  }
}

export default Camera;
