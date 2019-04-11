/**
 * Class representing a world.
 */
export default class World {
  /**
   * Creates a world.
   * @param  {Array}  grid The map grid.
   */
  constructor(grid = [[]]) {
    this.grid = grid;
    this.bodies = {};
    this.updateableIds = [];
    this.grid.forEach(row => row.forEach(sector => this.add(sector)));
  }

  /**
   * Add a body to the world.
   * @param {Body} body The body to add.
   */
  add(body) {
    if (body.update && typeof body.update === 'function') {
      this.updateableIds.push(body.id);
    }

    this.sector(body.gridX, body.gridY).addChildId(body.id);
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

    this.sector(body.gridX, body.gridY).removeChildId(body.id);
    this.bodies = this.bodies.filter(thisBody => thisBody !== body);
  }

  /**
   * Update
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    this.updateableIds.forEach(id => this.bodies[id].update(delta, this));
  }

  /**
   * Get the sector at the given grid coordinates.
   * @param  {Number} x The x grid coordinate.
   * @param  {Number} y The y grid coordinate.
   * @return {Sector}   The sector.
   */
  sector(x, y) {
    return this.grid[y][x];
  }

  /**
   * Get the sectors surrounding a given body.
   * @param  {Body}   body The body.
   * @return {Array}       The sectors surrounding the body.
   */
  adjacentSectors(body) {
    const sectors = [];
    const x = body.gridX;
    const y = body.gridY;

    for (let i = x - 1; i <= x + 1; i += 1) {
      for (let j = y - 1; j <= y + 1; j += 1) {
        const sector = this.sector(i, j);

        if (sector !== body) {
          sectors.push(sector);
        }
      }
    }

    return sectors;
  }

  /**
   * Get the bodies surrounding a given body.
   * @param  {Body}   body The body to check.
   * @return {Array}       The bodies surroung the body.
   */
  adjacentBodies(body) {
    const sectors = this.adjacentSectors(body);

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
