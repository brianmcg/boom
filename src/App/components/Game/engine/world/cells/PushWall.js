import translate from '@util/translate';
import { CELL_SIZE } from '@constants/config';
import { AXES, DisplaceableCell } from '@game/core/physics';
import PositionalAudio from '../../audio/PositionalAudio';

const SHAKE_MULTIPLIER = 0.2;

/**
 * A displacing cell the player can shove, and the secret behind it.
 *
 * Sliding, swapping grid places with the cell ahead and stopping against an
 * obstruction all belong to `DisplaceableCell`. What is left here is the push
 * itself: which way it was shoved from, the noise it makes, and the message.
 */
export default class PushWall extends DisplaceableCell {
  constructor({ sounds, soundSprite, faces = {}, ...other }) {
    super(other);

    this.faces = faces;

    this.sounds = sounds;
    this.audio = new PositionalAudio({ soundSprite, source: this });

    // Stopping is DisplaceableCell's; the noise it makes about it is not.
    this.onBlocked(() => {
      const shake =
        (CELL_SIZE / this.distanceToPlayer) * this.speed * SHAKE_MULTIPLIER;

      this.parent.player.shake(shake);
      this.stopSound(this.sounds.move);
      this.emitSound(this.sounds.stop);
      this.isOpened = true;
    });
  }

  use(user) {
    if (this.axis === AXES.X) {
      this.direction.x = 0;
      this.direction.y = Math.sign(user.gridY - this.gridY);
    } else {
      this.direction.x = Math.sign(user.gridX - this.gridX);
      this.direction.y = 0;
    }

    if (!this.isPushed && this.canMove()) {
      this.isPushed = true;
      this.distanceToPlayer = this.getDistanceTo(user.pos);
      this.emitSound(this.sounds.start);
      this.emitSound(this.sounds.move, true);

      const shake =
        (CELL_SIZE / this.distanceToPlayer) * this.speed * SHAKE_MULTIPLIER;

      this.parent.player.shake(shake);
      this.velocity[this.slideAxis] = this.speed;
      this.startUpdates();

      user.addMessage(translate('world.wall.secret'));
    }
  }

  // super.update() slides by the velocity and hands over the grid square,
  // and emits when the next one will not take it.
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    this.distanceToPlayer = this.getDistanceTo(this.parent.player.pos);
    this.audio.update();
  }

  emitSound(name, loop) {
    this.audio.emit(name, loop);
  }

  stopSound(name) {
    this.audio.stop(name);
  }

  isPlaying(name) {
    return this.audio.isPlaying(name);
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.stopAll();
  }

  startUpdates() {
    super.startUpdates();
    this.distanceToPlayer = this.getDistanceTo(this.parent.player.pos);
  }

  destroy(options) {
    this.audio.destroy();
    this.audio = null;
    this.sounds = null;
    this.parent = null;
    super.destroy(options);
  }
}
