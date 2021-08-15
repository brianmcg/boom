import { EventEmitter } from 'game/core/graphics';
import { CELL_SIZE } from 'game/constants/config';
import { search, Graph } from 'game/core/ai';

/**
 * Class representing a world.
 */
class World extends EventEmitter {
  /**
   * Creates a world.
   * @param  {Array}  grid    The map grid of the world.
   */
  constructor(grid = [[]], bodies) {
    super();

    this.grid = grid;
    this.bodies = {};
    this.dynamicBodies = [];

    this.width = this.grid[0].length;
    this.length = this.grid.length;

    this.maxCellX = this.width - 1;
    this.maxCellY = this.length - 1;

    this.maxMapX = (this.width * CELL_SIZE) - 1;
    this.maxMapY = (this.length * CELL_SIZE) - 1;

    this.height = grid.reduce((gridMax, row) => {
      const max = row.reduce((rowMax, {
        height,
      }) => (height > rowMax ? height : rowMax), 0);

      return max > gridMax ? max : gridMax;
    }, 0);

    grid.forEach(row => row.forEach(cell => this.add(cell)));

    bodies.forEach(body => this.add(body));

    this.graph = new Graph(grid.map(row => row.map((cell) => {
      if (cell.blocking && !cell.isDoor) {
        return 0;
      }

      if (cell.bodies.some(body => body.blocking && !body.isDynamic)) {
        return 100;
      }

      return 1;
    })), {
      diagonal: true,
    });
  }

  /**
   * Update
   * @param  {Number} delta The delta time value.
   */
  update(delta, elapsedMS) {
    this.dynamicBodies.forEach(body => body.update(delta, elapsedMS));
  }

  /**
   * Find a path between two cells.
   * @param  {Cell} from The starting cell.
   * @param  {Cell} to   The destination cell.
   * @return {Array}     A list of cells.
   */
  findPath(from, to) {
    const start = this.graph.grid[from.gridY][from.gridX];
    const end = this.graph.grid[to.gridY][to.gridX];

    return search(this.graph, start, end).map(node => this.getCell(node.y, node.x));
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
      return this.grid[y][x];
    }

    return null;
  }

  /**
   * Set the cell at the given coordinates.
   * @param {Number} x    The x coordinate.
   * @param {Number} y    The y coordinate.
   */
  setCell(x, y, cell) {
    this.grid[y][x] = cell;
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
