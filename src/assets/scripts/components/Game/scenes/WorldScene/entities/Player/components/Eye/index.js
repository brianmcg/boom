const EYE_HEIGHT_INCREMENT = 0.04;

const MAX_EYE_HEIGHT_OFFSET = 2;

const MAX_EYE_ROTATION_VELOCITY = 128;

const EYE_ROTATION_VELOCITY = 4;

class Eye {
  constructor(player) {
    this.player = player;

    this.eyeHeightOffset = 0;
    this.eyeHeightOffsetDirection = 1;

    this.eyeRotation = 0;
    this.eyeRotationVelocity = EYE_ROTATION_VELOCITY;
    this.maxEyeRotationVelocity = MAX_EYE_ROTATION_VELOCITY;
  }

  update(delta) {
    const { velocity } = this.player;
    const { lookDown, lookUp } = this.player.actions;

    if (lookDown) {
      this.eyeRotation = Math.max(
        this.eyeRotation - this.eyeRotationVelocity,
        -this.maxEyeRotationVelocity,
      );
    } else if (lookUp) {
      this.eyeRotation = Math.min(
        this.eyeRotation + this.eyeRotationVelocity,
        this.maxEyeRotationVelocity,
      );
    } else if (this.eyeRotation < 0) {
      this.eyeRotation = Math.min(this.eyeRotation + this.eyeRotationVelocity, 0);
    } else if (this.eyeRotation > 0) {
      this.eyeRotation = Math.max(this.eyeRotation - this.eyeRotationVelocity, 0);
    }

    if (velocity) {
      if (this.eyeHeightOffsetDirection > 0) {
        this.eyeHeightOffset = Math.min(
          this.eyeHeightOffset + EYE_HEIGHT_INCREMENT * Math.abs(velocity) * delta,
          MAX_EYE_HEIGHT_OFFSET,
        );
      } else if (this.eyeHeightOffsetDirection < 0) {
        this.eyeHeightOffset = Math.max(
          this.eyeHeightOffset - EYE_HEIGHT_INCREMENT * Math.abs(velocity) * delta * 2,
          -MAX_EYE_HEIGHT_OFFSET,
        );
      }

      if (Math.abs(this.eyeHeightOffset) === MAX_EYE_HEIGHT_OFFSET) {
        this.eyeHeightOffsetDirection *= -1;
      }
    } else if (this.eyeHeightOffset > 0) {
      this.eyeHeightOffset = Math.max(
        this.eyeHeightOffset - EYE_HEIGHT_INCREMENT * this.maxVelocity * delta,
        0,
      );
    } else if (this.eyeHeightOffset < 0) {
      this.eyeHeightOffset = Math.min(
        this.eyeHeightOffset + EYE_HEIGHT_INCREMENT * this.maxVelocity * delta,
        0,
      );
    }
  }
}

export default Eye;
