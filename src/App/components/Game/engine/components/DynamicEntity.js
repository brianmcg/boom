import { DynamicBody } from '@game/core/physics';
import { SoundSpriteController } from '@game/core/audio';
import { MAX_SOUND_DISTANCE } from '@constants/config';

const TAIL_INTERVAL = 25;

export default class DynamicEntity extends DynamicBody {
  constructor({
    name,
    sounds = {},
    soundSprite,
    scale = 1,
    anchor = 1,
    elavation = 0,
    tail,
    ...other
  }) {
    super(other);

    this.scale = scale;

    // Where the sprite sits vertically, read only by POVContainer. Declared on
    // both this and Entity because they are sibling branches of Body, and
    // everything drawn as a sprite comes from one or the other.
    this.anchor = anchor;

    // Height above the floor. Declared on both branches for the same reason.
    this.elavation = elavation;

    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;

    if (tail) {
      this.tail = {
        name: tail.effects.smoke,
        ids: [...Array(tail.length).keys()].map(
          i => `${this.id}_${tail.effects.smoke}_${i}`
        ),
      };

      this.tailTimer = 0;

      this.tailId = 0;
    }

    if (Object.entries(sounds).length) {
      this.soundController = new SoundSpriteController({ soundSprite });
    }
  }

  /**
   * Subclass-defined state machine label, and the only way to set it.
   * Returns true only when the state actually changed.
   *
   * Lived on the core `Body` until physics stopped knowing about it — nothing
   * there ever read it. It is duplicated on `DynamicCell` because Door needs it
   * on the cell branch, and the two branches meet no lower than `Body`.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  update(delta, elapsedMS) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player.pos);

    const volume =
      this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    if (this.soundController) {
      this.soundController.update(volume);
    }

    if (this.velocity && this.tail) {
      this.tailTimer += elapsedMS;

      if (this.tailTimer >= TAIL_INTERVAL) {
        this.parent.addEffect({
          x: this.x,
          y: this.y,
          elavation: this.elavation,
          sourceId: this.tail.ids[this.tailId],
          scale: Math.random() * 0.5 + 0.5,
        });

        this.tailTimer = 0;
        this.tailId += 1;

        if (this.tailId >= this.tail.ids.length) {
          this.tailId = 0;
        }
      }
    }

    super.update(delta);
  }

  emitSound(name, loop) {
    if (name && this.soundController) {
      const volume =
        this.distanceToPlayer > MAX_SOUND_DISTANCE
          ? 0
          : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

      this.soundController.emitSound(name, volume, loop);
    }
  }

  stopSound(name) {
    if (this.soundController) {
      this.soundController.stopSound(name);
    }
  }

  play() {
    if (this.soundController) {
      this.soundController.play();
    }
  }

  pause() {
    if (this.soundController) {
      this.soundController.pause();
    }
  }

  stop() {
    if (this.soundController) {
      this.soundController.stop();
    }
  }

  isPlaying(name) {
    if (this.soundController) {
      return this.soundController.isPlaying(name);
    }

    return false;
  }

  destroy(options) {
    if (this.soundController) {
      this.soundController.destroy();
      this.soundController = null;
    }
    this.sounds = null;
    super.destroy(options);
  }

  /**
   * Where the body appears to be, which is where it is unless a subclass moves
   * it about for effect — see `AbstractEnemy`, whose floating enemies bob.
   * `POVContainer` and `Projectile` want this, never the stored elevation.
   */
  get visualElavation() {
    return this.elavation;
  }
}
