import { EventEmitter } from 'game/core/graphics';

/**
 * Class representing a world.
 */
class World extends EventEmitter {
  /**
   * Creates a world.
   * @param  {Array}  grid    The map grid of the world.
   */
  constructor(grid = [[]]) {
    super();

    this.grid = grid;
    this.bodies = {};
    this.dynamicBodies = [];

    this.width = this.grid[0].length;
    this.length = this.grid.length;

    this.maxCellY = this.length - 1;
    this.maxCellX = this.width - 1;

    this.height = grid.reduce((gridMax, row) => {
      const max = row.reduce((rowMax, {
        height,
      }) => (height > rowMax ? height : rowMax), 0);

      return max > gridMax ? max : gridMax;
    }, 0);
  }

  /**
   * Initialize the world.
   */
  initialize() {
    this.grid.forEach(row => row.forEach(cell => this.add(cell)));
  }

  /**
   * Update
   * @param  {Number} delta The delta time value.
   */
  update(delta, elapsedMS) {
    this.dynamicBodies.forEach(body => body.update(delta, elapsedMS));
  }

  /**
   * Add a body to the world.
   * @param {Body} body The body to add.
   */
  add(body) {
    if (!this.bodies[body.id]) {
      this.getCell(body.gridX, body.gridY).add(body);
      this.startUpdates(body);
      this.bodies[body.id] = body;

      if (body.initialize) {
        body.initialize(this);
      }
    }
  }

  /**
   * Remove a body from the world.
   * @param {Body} body The body to remove.
   */
  remove(body) {
    this.stopUpdates(body);
    this.getCell(body.gridX, body.gridY).remove(body);

    delete this.bodies[body.id];
  }

  /**
   * Start updating this body.
   * @param  {Body} body The body to stop updating.
   */
  startUpdates(body) {
    if (body.update) {
      this.dynamicBodies.push(body);
    }
  }

  /**
   * Stop updating this body.
   * @param  {Body} body The body to stop updating.
   */
  stopUpdates(body) {
    if (body.update) {
      this.dynamicBodies = this.dynamicBodies.filter(d => d.id !== body.id);
    }
  }

  /**
   * Get the cell at the given grid coordinates.
   * @param  {Number} x The x grid coordinate.
   * @param  {Number} y The y grid coordinate.
   * @return {Cell}   The cell.
   */
  getCell(x, y) {
    if (x >= 0 && x <= this.maxCellX && y >= 0 && y <= this.maxCellY) {
      return this.grid[y][x];
    }

    return null;
  }

  /**
   * Get the cells surrounding a given body.
   * @param  {Body}   body  The body.
   * @param  {Number} range The range of cells.
   * @return {Array}        The cells surrounding the body.
   */
  getAdjacentCells(body, radius = 1) {
    const cells = [];
    const { gridX, gridY } = body;

    for (let i = gridX - radius; i <= gridX + radius; i += 1) {
      for (let j = gridY - radius; j <= gridY + radius; j += 1) {
        const cell = this.getCell(i, j);

        if (cell) {
          cells.push(cell);
        }
      }
    }

    return cells;
  }

  /**
   * Get the bodies surrounding a given body.
   * @param  {Body}   body The body to check.
   * @return {Array}       The bodies surrounding the body.
   */
  getAdjacentBodies(body, radius = 1) {
    const cells = this.getAdjacentCells(body, radius);

    return cells.reduce((bodies, cell) => {
      cell.bodies.forEach((cellBody) => {
        if (cellBody.id !== body.id) {
          bodies.push(cellBody);
        }
      });

      if (cell.id !== body.id && cell.blocking) {
        bodies.push(cell);
      }

      return bodies;
    }, []);
  }

  /**
   * Destroy the world.
   */
  destroy() {
    this.removeAllListeners();
    Object.values(this.bodies).forEach(body => body.destroy());
  }
}

export default World;
