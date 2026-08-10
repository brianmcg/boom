import translate from '@util/translate';
import { CELL_SIZE } from '@constants/config';
import { RetractableCell } from '@game/core/physics';
import AbstractActor from '../actors/AbstractActor';
import PositionalAudio from '../../audio/PositionalAudio';

const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
  LOCKED: 'door:locked',
};

const SHAKE_MULTIPLIER = 0.1;

/**
 * A retracting cell with a lock, a timer and a voice.
 *
 * The sliding, its limits and the shape of a half-open door belong to
 * `RetractableCell`. What is left here is what makes it a door: which key card
 * opens it, how long it waits before closing, what it sounds like, and that an
 * opened one stops blocking.
 */
export default class Door extends RetractableCell {
  constructor({
    key,
    interval,
    entrance = false,
    exit = false,
    active = true,
    sounds,
    soundSprite,
    faces = {},
    ...other
  }) {
    super(other);

    this.timer = 0;
    this.keyCard = key;
    this.interval = interval;
    this.active = active;
    this.entrance = entrance;
    this.exit = exit;
    this.isElevator = entrance || exit;

    this.faces = faces;
    this.sounds = sounds;
    this.audio = new PositionalAudio({ soundSprite, source: this });

    this.setClosed();

    // The limits themselves are RetractableCell's; what reaching one means is
    // this class's.
    this.onRetracted(() => this.setOpened());

    this.onReturned(() => {
      if (this.entrance) {
        this.active = false;
      }

      this.setClosed();
    });
  }

  /**
   * Subclass-defined state machine label, and the only way to set it.
   * Returns true only when the state actually changed.
   *
   * The twin of `DynamicEntity.setState`. It lived on a shared cell base until
   * the cell classes split; `PushWall` never called it, so it came here rather
   * than being duplicated again.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  use(user) {
    if (this.active && this.isClosed()) {
      // Asked by capability rather than by class: what a locked door needs is
      // someone carrying key cards, and only the player does. Narrowing to
      // `Player` instead would make a cell in this directory depend on the top
      // of the actor hierarchy — and pull the whole player subtree into the
      // contract suite, which imports this file.
      if (this.keyCard && user?.keyCards) {
        const keyCard = user.keyCards[this.keyCard];

        if (keyCard && keyCard.isEquiped()) {
          if (this.setOpening()) {
            keyCard.use();
          }
        } else {
          user.addMessage(
            translate('world.door.locked', {
              color: translate(`world.color.${this.keyCard}`),
            })
          );
        }
      } else {
        this.setOpening();
      }
    }
  }

  // super.update() comes FIRST: it is what slides the door, and it is also
  // what emits on reaching a limit. `wasOpened` is read before it, so the
  // auto-close timer never ticks on the same frame it was set.
  update(delta, elapsedMS) {
    const wasOpened = this.isOpened();

    super.update(delta, elapsedMS);

    this.distanceToPlayer = this.getDistanceTo(this.parent.player.pos);
    this.audio.update();

    if (wasOpened && this.isOpened()) {
      this.updateOpened(delta, elapsedMS);
    }
  }

  updateOpened(delta, elapsedMS) {
    if (this.timer) {
      this.timer -= elapsedMS;

      if (this.timer <= 0) {
        const blocked =
          this.parent
            .getNeighbourBodies(this)
            .some(body => body instanceof AbstractActor && body.isAlive()) ||
          this.bodies.some(b => b.isDynamic);

        if (!blocked) {
          this.timer = 0;
          this.setClosing();
        } else {
          this.timer = 1;
        }
      }
    }
  }

  setOpening() {
    const isStateChanged = this.setState(STATES.OPENING);

    if (isStateChanged) {
      this.velocity[this.axis] = this.speed;
      this.startUpdates();
      this.emitSound(this.sounds.open);
    }

    return isStateChanged;
  }

  setOpened() {
    const isStateChanged = this.setState(STATES.OPENED);

    if (isStateChanged) {
      const distance = this.distanceToPlayer || CELL_SIZE;
      const shake = (CELL_SIZE / distance) * this.speed * SHAKE_MULTIPLIER;

      this.velocity[this.axis] = 0;
      this.blocking = false;
      this.timer = this.interval;
      this.parent.player.shake(shake);
    }

    return isStateChanged;
  }

  setClosing() {
    const isStateChanged = this.setState(STATES.CLOSING);

    if (isStateChanged) {
      this.velocity[this.axis] = -this.speed * 0.5;
      this.blocking = true;
      this.emitSound(this.sounds.close);
    }

    return isStateChanged;
  }

  setClosed() {
    const isStateChanged = this.setState(STATES.CLOSED);

    if (isStateChanged) {
      this.velocity[this.axis] = 0;
      this.stopUpdates();
    }

    return isStateChanged;
  }

  isOpening() {
    return this.state === STATES.OPENING;
  }

  isOpened() {
    return this.state === STATES.OPENED;
  }

  isClosing() {
    return this.state === STATES.CLOSING;
  }

  isClosed() {
    return this.state === STATES.CLOSED;
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
