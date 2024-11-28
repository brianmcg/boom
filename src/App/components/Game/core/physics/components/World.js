import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';

export default class World extends EventEmitter {
  constructor(grid, bodies) {
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
      const max = col.reduce(
        (colMax, { height }) => (height > colMax ? height : colMax),
        0
      );

      return max > gridMax ? max : gridMax;
    }, 0);

    grid.forEach(col => col.forEach(cell => this.add(cell)));

    bodies.forEach(body => this.add(body));
  }

  update(delta, elapsedMS) {
    this.dynamicBodies.forEach(body => body.update(delta, elapsedMS));
  }

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

  remove(body) {
    this.stopUpdates(body);
    this.getCell(body.gridX, body.gridY).remove(body);

    if (body.onRemoved) {
      body.onRemoved();
    }

    delete this.bodies[body.id];
  }

  startUpdates(body) {
    if (body.update) {
      this.dynamicBodies.push(body);
    }
  }

  stopUpdates(body) {
    if (body.update) {
      this.dynamicBodies = this.dynamicBodies.filter(d => d.id !== body.id);
    }
  }

  getCell(x, y) {
    if (x >= 0 && x <= this.maxCellX && y >= 0 && y <= this.maxCellY) {
      return this.grid[x][y];
    }

    return null;
  }

  setCell(x, y, cell) {
    this.grid[x][y] = cell;
  }

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

  destroy() {
    this.removeAllListeners();
    this.grid.forEach(col => col.forEach(cell => cell.destroy()));
    Object.values(this.bodies).forEach(body => body.destroy());
  }
}
