import { DEG } from 'game/core/physics';

const DEG_360 = DEG[360];

/**
 * Class representing a camera.
 */
class Camera {
  /**
   * Creates a camera.
   * @param  {Player} options.player          The player.
   * @param  {Number} options.heightIncrement The amount to increment the height by.
   * @param  {Number} options.maxHeight       The maximum height.
   * @param  {Number} options.pitchVelocity   The velocity of the recoil.
   * @param  {Number} options.maxRecoilAmount The maximum recoil amount.
   * @param  {Number} options.minRecoilAmount The minimum recoil amount.
   * @param  {Number} options.recoilFade      The amount by which the recoil effect fades.
   * @param  {Number} options.maxShakeAmount  The maximum shake amount.
   * @param  {Number} options.minShakeAmount  The minimum shake amount.
   * @param  {Number} options.shakeFade       The amount by which the shake effect fades.
   * @param  {Number} options.maxPitch        The maximum y axis rotation.
   */
  constructor({
    player,
    heightIncrement,
    maxHeight,
    pitchVelocity,
    maxRecoilAmount,
    minRecoilAmount,
    recoilFade,
    maxShakeAmount,
    minShakeAmount,
    shakeFade,
    maxPitch,
  }) {
    this.player = player;
    this.heightIncrement = heightIncrement;
    this.maxHeight = maxHeight;
    this.pitchVelocity = pitchVelocity;
    this.maxPitch = maxPitch;
    this.maxRecoilAmount = maxRecoilAmount;
    this.minRecoilAmount = minRecoilAmount;
    this.recoilFade = recoilFade;
    this.maxShakeAmount = maxShakeAmount;
    this.minShakeAmount = minShakeAmount;
    this.shakeFade = shakeFade;

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
  updatePitch() {
    const { lookDown, lookUp } = this.player.actions;

    if (lookDown) {
      this.pitch = Math.max(this.pitch - this.pitchVelocity, -this.maxPitch);
    } else if (lookUp) {
      this.pitch = Math.min(this.pitch + this.pitchVelocity, this.maxPitch);
    } else if (this.pitch < 0) {
      this.pitch = Math.min(this.pitch + this.pitchVelocity, 0);
    } else if (this.pitch > 0) {
      this.pitch = Math.max(this.pitch - this.pitchVelocity, 0);
    }

    if (this.recoilAmount) {
      this.pitch += this.recoilAmount * this.recoilDirection;
      this.recoilAmount *= this.recoilFade;

      if (this.recoilAmount < this.minRecoilAmount) {
        this.recoilAmount = 0;
      }
    } else if (this.recoilDirection > 0) {
      this.pitch = Math.max(this.pitch - this.pitchVelocity, 0);
    } else if (this.recoilDirection < 0) {
      this.pitch = Math.min(this.pitch + this.pitchVelocity, 0);
    }
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
        this.shakeEdge *= this.shakeFade;
      }

      if (this.shakeEdge < this.minShakeAmount) {
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
