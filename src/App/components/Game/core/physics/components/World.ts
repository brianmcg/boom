import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';
import type Body from './Body';
import type Cell from './Cell';

export interface WorldOptions {
  grid: Cell[][];
  bodies: Body[];
}

/**
 * A fixed grid of cells plus every body standing on it.
 *
 * The world owns the spatial index: bodies are looked up through the cell they
 * occupy rather than by scanning a flat list, which is what keeps collision and
 * raycasting proportional to the neighbourhood instead of the map.
 */
export default class World extends EventEmitter {
  readonly grid: Cell[][];

  /** Every body in the world, keyed by id. */
  bodies: Record<string, Body>;

  /** The subset of bodies currently receiving `update` calls. */
  dynamicBodies: Body[];

  /** Grid dimensions, in cells. */
  readonly width: number;
  readonly length: number;

  /** The tallest cell in the grid, in world units. */
  height: number;

  /** Grid bounds in world units, for clamping positions. */
  readonly maxMapX: number;
  readonly maxMapY: number;

  constructor({ grid, bodies }: WorldOptions) {
    super();

    this.grid = grid;
    this.bodies = {};
    this.dynamicBodies = [];

    this.width = this.grid.length;
    this.length = this.grid[0].length;

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

  update(delta: number, elapsedMS: number) {
    this.dynamicBodies.forEach(body => body.update!(delta, elapsedMS));
  }

  add(body: Body) {
    if (!this.bodies[body.id]) {
      this.getCell(body.gridX, body.gridY)!.add(body);

      if (body.autoPlay) {
        this.startUpdates(body);
      }

      this.bodies[body.id] = body;

      if (body.onAdded) {
        body.onAdded(this);
      }
    }
  }

  remove(body: Body) {
    this.stopUpdates(body);
    this.getCell(body.gridX, body.gridY)!.remove(body);

    if (body.onRemoved) {
      body.onRemoved();
    }

    delete this.bodies[body.id];
  }

  startUpdates(body: Body) {
    if (body.update) {
      this.dynamicBodies.push(body);
    }
  }

  stopUpdates(body: Body) {
    if (body.update) {
      this.dynamicBodies = this.dynamicBodies.filter(d => d.id !== body.id);
    }
  }

  /** Returns null outside the grid — callers on a guarded path may assume non-null. */
  getCell(x: number, y: number): Cell | null {
    if (x >= 0 && x < this.width && y >= 0 && y < this.length) {
      return this.grid[x][y];
    }

    return null;
  }

  setCell(x: number, y: number, cell: Cell) {
    this.grid[x][y] = cell;
  }

  getNeighbourCells(body: Body, radius = 1): Cell[] {
    const cells: Cell[] = [];
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

  /** Every body in the surrounding cells, plus the blocking cells themselves. */
  getNeighbourBodies(body: Body, radius = 1): Body[] {
    const bodies: Body[] = [];
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

  destroy(_options?: unknown) {
    this.removeAllListeners();
    this.grid.forEach(row => row.forEach(cell => cell.destroy()));
  }
}
