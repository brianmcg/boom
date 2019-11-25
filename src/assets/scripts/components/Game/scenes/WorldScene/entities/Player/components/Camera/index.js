const HEIGHT_INCREMENT = 0.04;

const MAX_HEIGHT = 2;

const ROTATION_VELOCITY = 4;

const MAX_RECOIL = 12;

const MIN_RECOIL = 1;

const RECOIL_FADE = 0.25;

const MAX_SHAKE = 12;

const MIN_SHAKE = 1;

const SHAKE_FADE = 0.25;

/**
 * Class representing a camera.
 */
class Camera {
  /**
   * Creates a camera.
   * @param  {Player} player The player.
   */
  constructor(player) {
    this.player = player;
    this.height = 0;
    this.heightDirection = 1;
    this.rotationY = 0;
    this.rotationX = 0;
    this.shakeDirection = 1;
    this.recoil = 0;
    this.shake = 0;
  }

  /**
   * Updates the camera.
   * @param  {[type]} delta The delta time.
   */
  update(delta) {
    const { velocity, maxVelocity } = this.player;

    if (this.recoil) {
      this.rotationY += this.recoil;
      this.recoil *= RECOIL_FADE;

      if (this.recoil < MIN_RECOIL) {
        this.recoil = 0;
      }
    } else {
      this.rotationY = Math.max(this.rotationY - ROTATION_VELOCITY, 0);
    }

    if (this.shake) {
      this.rotationX += this.shake * this.shakeDirection;
      this.shake *= SHAKE_FADE;

      if (Math.abs(this.shake) > MAX_SHAKE) {
        this.shakeDirection *= -1;
      }
    }

    if (velocity) {
      if (this.heightDirection > 0) {
        this.height = Math.min(
          this.height + HEIGHT_INCREMENT * Math.abs(velocity) * delta,
          MAX_HEIGHT,
        );
      } else if (this.heightDirection < 0) {
        this.height = Math.max(
          this.height - HEIGHT_INCREMENT * Math.abs(velocity) * delta * 2,
          -MAX_HEIGHT,
        );
      }

      if (Math.abs(this.height) === MAX_HEIGHT) {
        this.heightDirection *= -1;
      }
    } else if (this.height > 0) {
      this.height = Math.max(this.height - HEIGHT_INCREMENT * maxVelocity * delta, 0);
    } else if (this.height < 0) {
      this.height = Math.min(this.height + HEIGHT_INCREMENT * maxVelocity * delta, 0);
    }
  }

  jolt(amount) {
    this.rotationX = Math.min(amount, MAX_SHAKE);
  }

  /**
   * Jerk the camera backwards.
   * @param  {Number} amount The amount to jerk it.
   */
  jerkBackward(amount) {
    this.recoil = Math.min(amount, MAX_RECOIL);
  }

  /**
   * Jerk the camera forwards.
   * @param  {Number} amount The amount to jerk it.
   */
  jerkForward(amount) {
    this.rotationY -= Math.min(amount, MAX_RECOIL);
  }
}

export default Camera;

// const { lookDown, lookUp } = this.player.actions;

// Update rotation
// if (lookDown) {
//   this.rotationY = Math.max(this.rotationY - ROTATION_VELOCITY, -MAX_ROTATION);
// } else if (lookUp) {
//   this.rotationY = Math.min(this.rotationY + ROTATION_VELOCITY, MAX_ROTATION);
// } else if (this.rotationY < 0) {
//   this.rotationY = Math.min(this.rotationY + ROTATION_VELOCITY, 0);
// } else if (this.rotationY > 0) {
//   this.rotationY = Math.max(this.rotationY - ROTATION_VELOCITY, 0);
// }
