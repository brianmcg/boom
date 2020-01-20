import { DEG } from 'game/core/physics';

const DEG_360 = DEG[360];

/**
 * Class representing a camera.
 */
class Camera {
  /**
   * Creates a camera.
   * @param  {Player} player The player.
   */
  constructor({
    player,
    heightIncrement,
    maxHeight,
    recoilVelocity,
    maxRecoilAmount,
    minRecoilAmount,
    recoilFade,
    maxShakeAmount,
    minShakeAmount,
    shakeFade,
    maxRotationY,
  }) {
    this.player = player;
    this.heightIncrement = heightIncrement;
    this.maxHeight = maxHeight;
    this.recoilVelocity = recoilVelocity;
    this.maxRecoilAmount = maxRecoilAmount;
    this.minRecoilAmount = minRecoilAmount;
    this.recoilFade = recoilFade;
    this.maxShakeAmount = maxShakeAmount;
    this.minShakeAmount = minShakeAmount;
    this.shakeFade = shakeFade;
    this.maxRotationY = maxRotationY;

    this.height = 0;
    this.heightDirection = 1;
    this.rotationY = 0;
    this.rotationX = 0;
    this.recoilAmount = 0;
    this.recoilDirection = 1;
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
          this.height + this.heightIncrement * Math.abs(velocity) * delta,
          this.maxHeight,
        );
      } else if (this.heightDirection < 0) {
        this.height = Math.max(
          this.height - this.heightIncrement * Math.abs(velocity) * delta * 2,
          -this.maxHeight,
        );
      }

      if (Math.abs(this.height) === this.maxHeight) {
        this.heightDirection *= -1;
      }
    } else if (this.height > 0) {
      this.height = Math.max(this.height - this.heightIncrement * maxVelocity * delta, 0);
    } else if (this.height < 0) {
      this.height = Math.min(this.height + this.heightIncrement * maxVelocity * delta, 0);
    }
  }

  /**
   * Update the rotation according to player actions.
   */
  updateRotation() {
    const { lookDown, lookUp } = this.player.actions;

    if (lookDown) {
      this.rotationY = Math.max(this.rotationY - this.recoilVelocity, -this.maxRotationY);
    } else if (lookUp) {
      this.rotationY = Math.min(this.rotationY + this.recoilVelocity, this.maxRotationY);
    } else if (this.rotationY < 0) {
      this.rotationY = Math.min(this.rotationY + this.recoilVelocity, 0);
    } else if (this.rotationY > 0) {
      this.rotationY = Math.max(this.rotationY - this.recoilVelocity, 0);
    }
  }

  /**
   * Update the recoil effect.
   */
  updateRecoil() {
    if (this.recoilAmount) {
      this.rotationY += this.recoilAmount * this.recoilDirection;
      this.recoilAmount *= this.recoilFade;

      if (this.recoilAmount < this.minRecoilAmount) {
        this.recoilAmount = 0;
      }
    } else if (this.recoilDirection > 0) {
      this.rotationY = Math.max(this.rotationY - this.recoilVelocity, 0);
    } else if (this.recoilDirection < 0) {
      this.rotationY = Math.min(this.rotationY + this.recoilVelocity, 0);
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
        this.shakeEdge *= this.shakeFade;
      }

      if (this.shakeEdge < this.minShakeAmount) {
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
    this.shakeAmount = Math.min(this.maxShakeAmount, amount);
    this.shakeEdge = this.shakeAmount - 1;
  }

  /**
   * Set the recoil amount.
   * @param {Number}  amount       The recoil amount.
   * @param {Boolean} options.down Is the recoil downwards.
   */
  setRecoil(amount, { down } = {}) {
    this.recoilDirection = down ? -1 : 1;
    this.recoilAmount = Math.min(this.maxRecoilAmount, amount);
  }
}

export default Camera;
