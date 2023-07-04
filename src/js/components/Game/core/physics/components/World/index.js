import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@game/constants/config';

/**
 * Class representing a world.
 * @extends {EventEmitter}
 */
class World extends EventEmitter {
  /**
   * Creates a world.
   * @param  {Array}  grid    The map grid of the world.
   * @param  {Array}  bodies  The bodies to add to the map.
   */
  constructor(grid = [[]], bodies) {
    super();

    this.grid = grid;
    this.bodies = {};
    this.dynamicBodies = [];

    this.width = this.grid.length;
    this.length = this.grid[0].length;

    this.maxCellX = this.width - 1;
    this.maxCellY = this.length - 1;

    this.maxMapX = this.width * CELL_SIZE - 1;
    this.maxMapY = this.length * CELL_SIZE - 1;

    this.height = grid.reduce((gridMax, col) => {
      const max = col.reduce((colMax, { height }) => (height > colMax ? height : colMax), 0);

      return max > gridMax ? max : gridMax;
    }, 0);

    grid.forEach(col => col.forEach(cell => this.add(cell)));

    bodies.forEach(body => this.add(body));
  }

  /**
   * Update
   * @param  {Number} delta     The delta time value.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
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

      if (body.autoPlay) {
        this.startUpdates(body);
      }

      this.bodies[body.id] = body;

      if (body.onAdded) {
        body.onAdded(this);
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

    if (body.onRemoved) {
      body.onRemoved();
    }

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
      return this.grid[x][y];
    }

    return null;
  }

  /**
   * Set the cell at the given coordinates.
   * @param {Number} x    The x coordinate.
   * @param {Number} y    The y coordinate.
   */
  setCell(x, y, cell) {
    this.grid[x][y] = cell;
  }

  /**
   * Get the cells surrounding a given body.
   * @param  {Body}   body    The body.
   * @param  {Number} radius  The radius of neighbours to return.
   * @return {Array}          The cells surrounding the body.
   */
  getNeighbourCells(body, radius = 1) {
    const cells = [];
    const { gridX, gridY } = body;

    for (let i = gridX - radius; i <= gridX + radius; i++) {
      for (let j = gridY - radius; j <= gridY + radius; j++) {
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
   * @param  {Body}   body    The body.
   * @param  {Number} radius  The radius of neighbours to return.
   * @return {Array}          The neighbouring bodies.
   */
  getNeighbourBodies(body, radius = 1) {
    const bodies = [];
    const { gridX, gridY } = body;

    for (let i = gridX - radius; i <= gridX + radius; i++) {
      for (let j = gridY - radius; j <= gridY + radius; j++) {
        const cell = this.getCell(i, j);

        if (cell) {
          for (let k = 0; k < cell.bodies.length; k++) {
            const cellBody = cell.bodies[k];

            if (cellBody.id !== body.id) {
              bodies.push(cellBody);
            }
          }

          if (cell.id !== body.id && cell.blocking) {
            bodies.push(cell);
          }
        }
      }
    }

    return bodies;
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
