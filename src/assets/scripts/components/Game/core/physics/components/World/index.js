import { EventEmitter } from 'game/core/graphics';

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
    this.dynamicBodies = [];
    this.grid.forEach(row => row.forEach(sector => this.add(sector)));

    this.width = this.grid[0].length;
    this.height = this.grid.length;

    this.maxSectorX = this.height - 1;
    this.maxSectorY = this.width - 1;
  }

  /**
   * Add a body to the world.
   * @param {Body} body The body to add.
   */
  add(body) {
    if (!this.bodies[body.id]) {
      const sector = this.getSector(body.gridX, body.gridY);

      if (sector !== body) {
        sector.add(body);
      }

      if (body.update) {
        this.dynamicBodies.push(body);
        body.world = this;
      }

      this.bodies[body.id] = body;
    }
  }

  /**
   * Remove a body from the world.
   * @param {Body} body The body to remove.
   */
  remove(body) {
    if (body.update) {
      this.dynamicBodies = this.dynamicBodies.filter(d => d.id !== body.id);
    }

    this.getSector(body.gridX, body.gridY).remove(body);

    delete this.bodies[body.id];
  }

  /**
   * Update
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    this.dynamicBodies.forEach(body => body.update(delta));
  }

  /**
   * Get the sector at the given grid coordinates.
   * @param  {Number} x The x grid coordinate.
   * @param  {Number} y The y grid coordinate.
   * @return {Sector}   The sector.
   */
  getSector(x, y) {
    return this.grid[y][x];
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
      sector.bodies.forEach((sectorBody) => {
        if (sectorBody.id !== body.id) {
          bodies.push(sectorBody);
        }
      });

      if (sector.id !== body.id) {
        bodies.push(sector);
      }

      return bodies;
    }, []);
  }
}

export default World;
