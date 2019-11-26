import { DEG } from 'game/core/physics';

const HEIGHT_INCREMENT = 0.04;
const MAX_HEIGHT = 2;

const ROTATION_VELOCITY = 4;

const MAX_RECOIL_AMOUNT = 12;
const MIN_RECOIL_AMOUNT = 1;
const RECOIL_FADE = 0.2;

const MAX_SHAKE_AMOUNT = 10;
const MIN_SHAKE_AMOUNT = 1;
const SHAKE_FADE = 0.65;

const MAX_ROTATION = 120;

const DEG_360 = DEG[360];

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

    this.recoilAmount = 0;

    this.shakeDirection = 1;
    this.shakeAmount = 0;
    this.shakeEdge = 0;
  }

  /**
   * Updates the camera.
   * @param  {[type]} delta The delta time.
   */
  update(delta) {
    this.updateHeight(delta);
    this.updateRotation(delta);
    this.updateRecoil(delta);
    this.updateShake(delta);
  }

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
  updateRotation() {
    const { lookDown, lookUp } = this.player.actions;

    if (lookDown) {
      this.rotationY = Math.max(this.rotationY - ROTATION_VELOCITY, -MAX_ROTATION);
    } else if (lookUp) {
      this.rotationY = Math.min(this.rotationY + ROTATION_VELOCITY, MAX_ROTATION);
    } else if (this.rotationY < 0) {
      this.rotationY = Math.min(this.rotationY + ROTATION_VELOCITY, 0);
    } else if (this.rotationY > 0) {
      this.rotationY = Math.max(this.rotationY - ROTATION_VELOCITY, 0);
    }
  }

  /**
   * Update the recoil effect.
   */
  updateRecoil() {
    if (this.recoilAmount) {
      this.rotationY += this.recoilAmount;
      this.recoilAmount *= RECOIL_FADE;

      if (this.recoilAmount < MIN_RECOIL_AMOUNT) {
        this.recoilAmount = 0;
      }
    } else {
      this.rotationY = Math.max(this.rotationY - ROTATION_VELOCITY, 0);
    }
  }

  /**
   * Update the shake effect.
   */
  updateShake() {
    if (this.shakeAmount) {
      this.rotationX = (this.rotationX + this.shakeAmount * this.shakeDirection) % DEG_360;

      if (this.shakeDirection === 1 && this.rotationX > this.shakeEdge) {
        this.shakeDirection = -1;
      } else if (this.shakeDirection === -1 && this.rotationX < -this.shakeEdge) {
        this.shakeDirection = 1;
        this.shakeEdge *= SHAKE_FADE;
      }

      if (this.shakeEdge < MIN_SHAKE_AMOUNT) {
        this.shakeDirection = 1;
        this.shakeEdge = 0;
        this.rotationX = 0;
        this.shakeAmount = 0;
      }
    }
  }

  /**
   * Set shake amount.
   * @param {Number} amount The amount to shake.
   */
  setShake(amount) {
    this.shakeAmount = Math.min(MAX_SHAKE_AMOUNT, amount);
    this.shakeEdge = this.shakeAmount - 1;
  }

  /**
   * Set the recoil amount.
   * @param  {Number} amount The amount to recoil.
   */
  setRecoil(amount) {
    this.recoilAmount = Math.min(MAX_RECOIL_AMOUNT, amount);
  }
}

export default Camera;
