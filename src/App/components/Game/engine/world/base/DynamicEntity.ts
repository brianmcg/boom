import { DynamicBody, type DynamicBodyOptions } from '@game/core/physics';
import type World from '../World';

export interface DynamicEntityOptions extends DynamicBodyOptions {
  /**
   * Which of the subclass's states the entity starts in. Required, so that
   * `state` is a string from the first frame rather than briefly undefined —
   * every subclass had its own `setIdle()` at the end of its constructor to
   * paper over that gap.
   */
  state: string;
  name?: string;
  scale?: number;
  anchor?: number;
  elavation?: number;
}

/**
 * A moving body that is drawn: it knows which sprite stands for it, where that
 * sprite sits, and how far away the player is.
 *
 * Being *heard* is one level down, on `AbstractDestroyableEntity` and
 * `Projectile` — the only two branches that make a noise. Items and scenery
 * inherit from here and never did.
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

  /**
   * Kept current by {@link update}. The `PositionalAudio` a subclass owns reads
   * it for its falloff, and the POV container sorts sprites by it.
   */
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
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;
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

    super.update(delta);
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
