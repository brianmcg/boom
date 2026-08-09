import { DynamicBody, type DynamicBodyOptions } from '@game/core/physics';
import type { Sound } from '@game/core/audio';
import PositionalAudio from '../../audio/PositionalAudio';
import type World from '../World';

/**
 * The sounds one entity can make, keyed by the role its map data gives them —
 * `travel`, `pain`, `death`, `open`. Which keys exist differs per entity type,
 * so this stays an open map rather than a fixed shape.
 */
export type Sounds = Record<string, string>;

export interface DynamicEntityOptions extends DynamicBodyOptions {
  /**
   * Which of the subclass's states the entity starts in. Required, so that
   * `state` is a string from the first frame rather than briefly undefined —
   * every subclass had its own `setIdle()` at the end of its constructor to
   * paper over that gap.
   */
  state: string;
  name?: string;
  sounds?: Sounds;
  soundSprite?: Sound;
  scale?: number;
  anchor?: number;
  elavation?: number;
}

/**
 * A moving body that is drawn and heard: it knows which sprite stands for it,
 * how far away the player is, and how to make a noise at the volume that
 * distance earns.
 */
export default class DynamicEntity extends DynamicBody {
  /** Which sprite the renderer draws for this entity. */
  name?: string;

  scale: number;

  /**
   * Where the sprite sits vertically, read only by POVContainer. Declared on
   * both this and Entity because they are sibling branches of Body, and
   * everything drawn as a sprite comes from one or the other.
   */
  anchor: number;

  /** Height above the floor. Declared on both branches for the same reason. */
  elavation: number;

  sounds: Sounds | null;

  /** Kept current by {@link update}; `PositionalAudio` reads it for its falloff. */
  distanceToPlayer: number;

  /**
   * Subclass-defined state machine label. Seeded from the constructor, and
   * changed only through {@link setState} thereafter.
   *
   * Lived on the core `Body` until physics stopped knowing about it — nothing
   * there ever read it. It is duplicated on `Door` because that branch needs
   * one too, and the two meet no lower than `Body`.
   */
  state: string;

  /**
   * Most entities have no sounds at all — every ammo, health, key and weapon
   * pickup, and the explosive barrel — and the rest release theirs on destroy,
   * so every use is guarded.
   */
  private audio: PositionalAudio | null = null;

  /**
   * Narrower than `DynamicBody.parent`, which is the physics `World`.
   * {@link update} reads the player's position off it, and a player is the
   * game layer's business. Subclasses want far more of it than that.
   *
   * `declare` rather than a redeclaration: it retypes the inherited field
   * without emitting one, which under `useDefineForClassFields` would define a
   * second property over the parent's. Type-only, so physics is not imported
   * back into at runtime.
   */
  declare parent: World | null;

  constructor({
    state,
    name,
    sounds = {},
    soundSprite,
    scale = 1,
    anchor = 1,
    elavation = 0,
    ...other
  }: DynamicEntityOptions) {
    super(other);

    this.state = state;
    this.scale = scale;
    this.anchor = anchor;
    this.elavation = elavation;
    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;

    if (Object.entries(sounds).length) {
      this.audio = new PositionalAudio({ soundSprite, source: this });
    }
  }

  /** Returns true only when the state actually changed. */
  setState(state: string): boolean {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  update(delta: number, _elapsedMS?: number) {
    this.distanceToPlayer = this.getDistanceTo(this.parent!.player.pos);
    this.audio?.update();

    super.update(delta);
  }

  emitSound(name?: string, loop?: boolean) {
    this.audio?.emit(name, loop);
  }

  stopSound(name?: string) {
    this.audio?.stop(name);
  }

  play() {
    this.audio?.play();
  }

  pause() {
    this.audio?.pause();
  }

  stop() {
    this.audio?.stopAll();
  }

  isPlaying(name?: string): boolean {
    return this.audio?.isPlaying(name) ?? false;
  }

  destroy(options?: unknown) {
    this.audio?.destroy();
    this.audio = null;
    this.sounds = null;
    super.destroy(options);
  }

  /**
   * Where the body appears to be, which is where it is unless a subclass moves
   * it about for effect — see `AbstractEnemy`, whose floating enemies bob.
   * `POVContainer` and `Projectile` want this, never the stored elevation.
   */
  get visualElavation(): number {
    return this.elavation;
  }
}
