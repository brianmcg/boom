const HEIGHT_INCREMENT = 0.04;

const MAX_HEIGHT = 2;

const MAX_ROTATION = 128;

const ROTATION_VELOCITY = 4;

class Eye {
  constructor(player) {
    this.player = player;
    this.height = 0;
    this.heightDirection = 1;
    this.rotation = 0;
  }

  update(delta) {
    const { velocity, maxVelocity } = this.player;
    const { lookDown, lookUp } = this.player.actions;


    // Update rotation
    if (lookDown) {
      this.rotation = Math.max(this.rotation - ROTATION_VELOCITY, -MAX_ROTATION);
    } else if (lookUp) {
      this.rotation = Math.min(this.rotation + ROTATION_VELOCITY, MAX_ROTATION);
    } else if (this.rotation < 0) {
      this.rotation = Math.min(this.rotation + ROTATION_VELOCITY, 0);
    } else if (this.rotation > 0) {
      this.rotation = Math.max(this.rotation - ROTATION_VELOCITY, 0);
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
}

export default Eye;
