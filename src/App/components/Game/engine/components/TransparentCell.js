import { TransparentCell as PhysicsTransparentCell } from '@game/core/physics';

/**
 * A cell rays pass through — a grate, a window.
 *
 * Physics owns how far a ray gets through it; this owns what it looks like,
 * like every other cell in this layer.
 */
export default class TransparentCell extends PhysicsTransparentCell {
  constructor({ faces = {}, ...other }) {
    super(other);

    this.faces = faces;
  }
}
