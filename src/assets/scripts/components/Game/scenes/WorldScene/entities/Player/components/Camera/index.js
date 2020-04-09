import { DEG } from 'game/core/physics';

const DEG_360 = DEG[360];

const HEIGHT_INCREMENT = 0.04;
const MAX_HEIGHT = 1;
const PITCH_VELOCITY = 4;
const MAX_RECOIL = 196;
const MIN_RECOIL = 1;
const RECOIL_FADE = 0.25;

const SHAKE_MULTIPLIER = 0.25;
const SHAKE_FADE_MULTIPLIER = 0.1625;
const MAX_SHAKE = DEG[2];
const MIN_SHAKE = DEG[1] * SHAKE_MULTIPLIER;
const SHAKE_FADE = DEG[1] * SHAKE_FADE_MULTIPLIER;
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
    this.shakeEdge = 0;
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
    const { velocity, maxVelocity } = this.player;

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

    // NOTE: Keeping commented code here for future pitch work.
    // const { lookDown, lookUp } = this.player.actions;

    // if (lookDown) {
    //   this.pitch = Math.max(this.pitch - PITCH_VELOCITY, -MAX_PITCH);
    // } else if (lookUp) {
    //   this.pitch = Math.min(this.pitch + PITCH_VELOCITY, MAX_PITCH);
    // } else if (this.pitch < 0) {
    //   this.pitch = Math.min(this.pitch + PITCH_VELOCITY, 0);
    // } else if (this.pitch > 0) {
    //   this.pitch = Math.max(this.pitch - PITCH_VELOCITY, 0);
    // }
  }

  /**
   * Update the shake effect.
   */
  updateYaw() {
    if (this.shakeAmount) {
      this.angle = (this.angle + this.shakeAmount * this.shakeDirection) % DEG_360;

      if (this.shakeDirection === 1 && this.angle > this.shakeEdge) {
        this.shakeDirection = -1;
      } else if (this.shakeDirection === -1 && this.angle < -this.shakeEdge) {
        this.shakeDirection = 1;
        this.shakeEdge *= SHAKE_FADE;
      }

      if (this.shakeEdge < MIN_SHAKE) {
        this.shakeDirection = 1;
        this.shakeEdge = 0;
        this.angle = 0;
        this.shakeAmount = 0;
      }
    }
  }

  /**
   * Set shake amount.
   * @param {Number} amount The amount to shake.
   */
  setShake(amount) {
    this.shakeAmount = Math.min(MAX_SHAKE, DEG[amount] * SHAKE_MULTIPLIER);
    this.shakeEdge = this.shakeAmount - DEG[1] * SHAKE_MULTIPLIER;
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
