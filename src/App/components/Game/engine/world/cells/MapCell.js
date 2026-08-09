import { Cell } from '@game/core/physics';

/**
 * A plain square of the map — a solid wall, or open floor.
 *
 * Physics knows a cell as geometry and names which face a ray hit; what that
 * face looks like is here, the way an `Entity` holds the `name` that tells the
 * renderer which sprite to draw.
 */
export default class MapCell extends Cell {
  constructor({ faces = {}, ...other }) {
    super(other);

    this.faces = faces;
  }
}
