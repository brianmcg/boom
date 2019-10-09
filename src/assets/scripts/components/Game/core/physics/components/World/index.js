import { EventEmitter } from '~/core/graphics';

/**
 * Class representing a world.
 */
class World extends EventEmitter {
  /**
   * Creates a world.
   * @param  {Array}  grid The map grid.
   */
  constructor(grid = [[]]) {
    super();
    this.grid = grid;
    this.bodies = {};
    this.updateableIds = [];
    this.grid.forEach(row => row.forEach(sector => this.add(sector)));

    this.width = this.grid.length;
    this.height = this.grid[0].length;
  }

  /**
   * Add a body to the world.
   * @param {Body} body The body to add.
   */
  add(body) {
    if (body.update && typeof body.update === 'function') {
      this.updateableIds.push(body.id);
      body.world = this;
    }

    const sector = this.getSector(body.gridX, body.gridY);

    if (sector !== body) {
      this.getSector(body.gridX, body.gridY).addChildId(body.id);
    }
    this.bodies[body.id] = body;
  }

  /**
   * Remove a body from the world.
   * @param {Body} body The body to remove.
   */
  remove(body) {
    if (body.update) {
      this.updateableIds = this.updateableIds.filter(id => id !== body.id);
    }

    this.getSector(body.gridX, body.gridY).removeChildId(body.id);
    delete this.bodies[body.id];
  }

  /**
   * Update
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    this.updateableIds.forEach(id => this.bodies[id].update(delta));
  }

  /**
   * Get the sector at the given grid coordinates.
   * @param  {Number} x The x grid coordinate.
   * @param  {Number} y The y grid coordinate.
   * @return {Sector}   The sector.
   */
  getSector(x, y) {
    let gridX = x;
    let gridY = y;

    if (x > this.width) {
      gridX = this.width - 1;
    }

    if (x < 0) {
      gridX = 0;
    }

    if (y > this.height - 1) {
      gridY = this.height - 1;
    }

    if (y < 0) {
      gridY = 0;
    }

    return this.grid[gridY][gridX];
  }

  /**
   * Get the sectors surrounding a given body.
   * @param  {Body}   body The body.
   * @return {Array}       The sectors surrounding the body.
   */
  getAdjacentSectors(body, radius = 1) {
    const sectors = [];
    const x = body.gridX;
    const y = body.gridY;

    for (let i = x - radius; i <= x + radius; i += 1) {
      for (let j = y - radius; j <= y + radius; j += 1) {
        sectors.push(this.getSector(i, j));
      }
    }

    return sectors;
  }

  /**
   * Get the bodies surrounding a given body.
   * @param  {Body}   body The body to check.
   * @return {Array}       The bodies surroung the body.
   */
  getAdjacentBodies(body) {
    const sectors = this.getAdjacentSectors(body);

    return sectors.reduce((bodies, sector) => {
      sector.childIds.forEach((id) => {
        if (this.bodies[id] !== body) {
          bodies.push(this.bodies[id]);
        }
      });

      if (sector !== body) {
        bodies.push(sector);
      }

      return bodies;
    }, []);
  }
}

export default World;
