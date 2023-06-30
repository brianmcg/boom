import { degrees } from '@game/core/physics';

const DEG_360 = degrees(360);
const HEIGHT_INCREMENT = 0.04;
const MAX_HEIGHT = 1;
const PITCH_VELOCITY = 4;
const MAX_RECOIL = 196;
const MIN_RECOIL = 1;
const RECOIL_FADE = 0.2;
const SHAKE_FADE = 0.55;
const MIN_SHAKE = degrees(1) * 0.1;
const MAX_SHAKE = degrees(10);
const SHAKE_MULTIPLIER = 10;

/**
 * Class representing a camera.
 */
class Camera {
  /**
   * Creates a camera.
   * @param  {Player} player  The player.
   */
  constructor(player) {
    this.player = player;
    this.height = 0;
    this.heightDirection = 1;
    this.pitch = 0;
    this.angle = 0;
    this.recoilAmount = 0;
    this.recoilDirection = 1;
    this.shakeDirection = 1;
    this.shakeAmount = 0;
    this.shakeAngle = 0;
    this.maxPitch = 192;
  }

  /**
   * Updates the camera.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.updateHeight(delta);
    this.updatePitch(delta);
    this.updateYaw(delta);
  }

  /**
   * Update the camera height.
   * @param  {Number} delta The delta time.
   */
  updateHeight(delta) {
    const { velocity, speed } = this.player;

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
      this.height = Math.max(this.height - HEIGHT_INCREMENT * speed * delta, 0);
    } else if (this.height < 0) {
      this.height = Math.min(this.height + HEIGHT_INCREMENT * speed * delta, 0);
    }
  }

  /**
   * Update the rotation according to player actions.
   */
  updatePitch() {
    if (this.recoilAmount) {
      this.pitch += this.recoilAmount * this.recoilDirection;
      this.recoilAmount *= RECOIL_FADE;

      if (this.recoilAmount < MIN_RECOIL) {
        this.recoilAmount = 0;
      }
    } else if (this.recoilDirection > 0) {
      this.pitch = Math.max(this.pitch - PITCH_VELOCITY, 0);
    } else if (this.recoilDirection < 0) {
      this.pitch = Math.min(this.pitch + PITCH_VELOCITY, 0);
    }
  }

  /**
   * Update the shake effect.
   */
  updateYaw(delta) {
    if (this.shakeAmount) {
      if (this.shakeDirection > 0) {
        this.shakeAngle += this.shakeAmount * delta;

        if (this.shakeAngle >= this.shakeAmount) {
          this.shakeDirection *= -1;
          this.shakeAmount *= SHAKE_FADE;
        }
      } else if (this.shakeDirection < 0) {
        this.shakeAngle -= this.shakeAmount * delta;

        if (this.shakeAngle <= -this.shakeAmount) {
          this.shakeAmount *= SHAKE_FADE;
          this.shakeDirection *= -1;
        }
      }

      if (this.shakeAmount < MIN_SHAKE) {
        this.shakeAmount = 0;
        this.shakeAngle = 0;
      }
    } else {
      this.shakeAngle = 0;
    }

    this.angle = (this.shakeAngle - this.player.moveAngle + DEG_360) % DEG_360;
  }

  /**
   * Set shake amount.
   * @param {Number} amount The amount to shake.
   */
  setShake(amount, { direction = 1 } = {}) {
    const shakeAngle = degrees(Math.round(amount * SHAKE_MULTIPLIER));
    this.shakeDirection = direction;
    this.shakeAmount = Math.min(MAX_SHAKE, shakeAngle * SHAKE_FADE);
  }

  /**
   * Set the recoil amount.
   * @param {Number}  amount       The recoil amount.
   * @param {Boolean} options.down Is the recoil downwards.
   */
  setRecoil(amount, { direction = 1 } = {}) {
    this.recoilDirection = direction;
    this.recoilAmount = Math.min(MAX_RECOIL, amount);
  }
}

export default Camera;
