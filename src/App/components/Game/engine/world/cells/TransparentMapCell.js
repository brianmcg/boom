import { TransparentCell } from '@game/core/physics';

/**
 * A square of the map that rays pass through — a grate, a window.
 *
 * Physics owns how far a ray gets through it; this owns what it looks like,
 * like every other cell in this layer. The twin of {@link MapCell}, for the
 * cells the map marks transparent.
 */
export default class TransparentMapCell extends TransparentCell {
  constructor({ faces = {}, ...other }) {
    super(other);

    this.faces = faces;
  }
}
