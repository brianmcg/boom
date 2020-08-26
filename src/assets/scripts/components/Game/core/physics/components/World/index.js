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

    this.width = this.grid[0].length;
    this.height = this.grid.length;

    this.maxCellY = this.height - 1;
    this.maxCellX = this.width - 1;
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
  update(delta) {
    this.dynamicBodies.forEach(body => body.update(delta));
  }

  /**
   * Add a body to the world.
   * @param {Body} body The body to add.
   */
  add(body) {
    if (!this.bodies[body.id]) {
      const cell = this.getCell(body.gridX, body.gridY);

      if (cell !== body) {
        cell.add(body);
      }

      if (body.update) {
        this.dynamicBodies.push(body);
        body.parent = this;
      }

      this.bodies[body.id] = body;

      body.emitAddedEvent();
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

    body.emitRemovedEvent();
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
    return this.grid[y][x];
  }

  /**
   * Get the cells surrounding a given body.
   * @param  {Body}   body The body.
   * @return {Array}       The cells surrounding the body.
   */
  getAdjacentCells(body, radius = 1) {
    const cells = [];
    const { gridX, gridY } = body;

    for (let i = gridX - radius; i <= gridX + radius; i += 1) {
      for (let j = gridY - radius; j <= gridY + radius; j += 1) {
        cells.push(this.getCell(i, j));
      }
    }

    return cells;
  }

  /**
   * Get the bodies surrounding a given body.
   * @param  {Body}   body The body to check.
   * @return {Array}       The bodies surrounding the body.
   */
  getAdjacentBodies(body) {
    const cells = this.getAdjacentCells(body);

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
