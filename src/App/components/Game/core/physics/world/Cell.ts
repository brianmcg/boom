import { CELL_SIZE } from '@constants/config';
import { AXES } from '../constants';
import type { Axis } from '../constants';
import Point from '../geometry/Point';
import Body, { type BodyOptions } from './Body';

export interface CellOptions extends BodyOptions {
  axis?: Axis;
  /**
   * How far open the cell starts, as a ratio of a cell. Stored as world units
   * on {@link Cell.offset} — the input and the stored value are different units.
   */
  offset?: number;
  reverse?: boolean;
  closed?: boolean;
  edge?: boolean;
  hasOverlay?: boolean;
}

/**
 * One square of the world grid.
 *
 * A cell is a `Body` that never moves and that owns the bodies standing on it.
 * Everything below the `add`/`remove` pair is the contract the raycaster in
 * `utils/castRay.ts` reads; subclasses in the game layer configure those fields
 * rather than inventing their own.
 */
export default class Cell extends Body {
  /** The bodies currently standing on this cell. */
  bodies: Body[];

  /**
   * Which way a sliding cell is aligned. Falsy on a plain cell, which the
   * raycaster reads as a solid, immovable wall.
   */
  axis?: Axis;

  /**
   * How far the cell's surface has moved, in world units.
   *
   * **The two components are different quantities, not one quantity on two
   * axes.** For a cell aligned to `x`:
   *
   * - `offset.y` insets the surface from the cell boundary — where the slab
   *   sits. `castRay` applies it as `horizontalGrid -= offset.y`.
   * - `offset.x` is the gap opened *along* the surface. `castRay` tests a
   *   crossing against it to decide whether the ray passes through the
   *   opening.
   *
   * Swap the components for a cell aligned to `y`.
   *
   * Which one moves separates {@link RetractableCell} from
   * {@link DisplaceableCell}: a door slides the parallel component, opening a
   * gap; a push wall slides the perpendicular one, taking the whole slab with
   * it. The constructor's `offset` option initialises the perpendicular one,
   * which is why a door starts inset half a cell and a push wall starts
   * where it will later slide.
   *
   * A cell that never moves may still carry one: this is where its surface
   * sits, and standing still is not the same as sitting on the boundary.
   */
  offset: Point;

  /**
   * The contract the raycaster reads. Subclasses configure it by passing these
   * through `super()` rather than assigning them afterwards — that is the house
   * style for options, not a restriction.
   *
   * What a cell *is* — a plain wall, one that retracts, one that displaces, one
   * rays pass through — is its class, and the raycaster asks with `instanceof`.
   * Only the settings shared by all four live here.
   */

  /** Inverts which side of the cell the offset is applied from. */
  reverse: boolean;

  /** Renderer hint: this cell has no open face, so nothing behind it is drawn. */
  closed: boolean;

  /** Renderer hint: this cell sits on the edge of the map. */
  edge: boolean;

  /**
   * Whether a second surface is drawn in front of this cell's own face — a door
   * frame, say.
   *
   * A boolean rather than the surface itself, because presence is the only part
   * of it that is geometry: an overlay moves the grid line and the hit distance,
   * and eight sites in `castRay` branch on it. What the overlay *looks like*
   * belongs to whoever draws it.
   */
  hasOverlay: boolean;

  constructor({
    axis,
    offset = 0,
    reverse = false,
    closed = false,
    edge = false,
    hasOverlay = false,
    ...other
  }: CellOptions) {
    super(other);

    this.bodies = [];
    this.axis = axis;
    this.offset = new Point(0, 0);

    this.hasOverlay = hasOverlay;
    this.reverse = reverse;
    this.closed = closed;
    this.edge = edge;

    // The option is a ratio of a cell, and it initialises whichever component
    // is perpendicular to the surface — where the surface sits. A cell with no
    // axis has no surface to place, and keeps both components at zero.
    if (axis === AXES.X) {
      this.offset.y = CELL_SIZE * offset;
    } else if (axis === AXES.Y) {
      this.offset.x = CELL_SIZE * offset;
    }
  }

  add(body: Body) {
    if (body !== this && !this.bodies.includes(body)) {
      this.bodies.push(body);
    }
  }

  remove(body: Body) {
    this.bodies = this.bodies.filter(b => b.id !== body.id);
  }

  destroy(options?: unknown) {
    super.destroy(options);

    this.bodies = [];
  }
}
