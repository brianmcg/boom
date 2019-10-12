import { SCREEN } from '~/constants/config';
import { TAN, DEG } from '~/core/physics';

const DEFAULT_CENTER_X = SCREEN.WIDTH / 2;

const DEFAULT_CENTER_Y = SCREEN.HEIGHT / 2;

const DEFAULT_DISTANCE = SCREEN.WIDTH / 2 / TAN[DEG[30]];

const SHAKE_AMOUNT = 0.05;

const MAX_SHAKE = 5;

/**
 * Class representing a camera.
 */
class Camera {
  /**
   * Creates a camera.
   * @param  {Player} player The game player.
   */
  constructor(player) {
    this.player = player;
    this.distance = DEFAULT_DISTANCE;
    this.centerX = DEFAULT_CENTER_X;
    this.centerY = DEFAULT_CENTER_Y;
    this.height = player.height;

    this.heightOffset = 0;
    this.heightOffsetDirection = 1;
  }

  /**
   * Update the camera.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const {
      height,
      maxHeight,
      velocity,
      maxVelocity,
      zAxis,
    } = this.player;

    const shakeAmount = SHAKE_AMOUNT * delta * height / maxHeight;
    const maxShake = MAX_SHAKE * height / maxHeight;

    if (velocity) {
      if (this.heightOffsetDirection > 0) {
        this.heightOffset = Math.min(
          this.heightOffset + (shakeAmount * Math.abs(velocity)), maxShake,
        );
      } else if (this.heightOffsetDirection < 0) {
        this.heightOffset = Math.max(
          this.heightOffset - (shakeAmount * Math.abs(velocity) * 1.75), 0,
        );
      }
    } else {
      this.heightOffset = Math.max(
        this.heightOffset - (shakeAmount * maxVelocity * 1.75), 0,
      );
    }

    if (this.heightOffset === maxShake || this.heightOffset === 0) {
      this.heightOffsetDirection *= -1;
    }

    this.height = height + this.heightOffset;
    this.centerY = DEFAULT_CENTER_Y + zAxis;
  }
}

export default Camera;
