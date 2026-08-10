import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';
import DynamicBody from './DynamicBody';
import DynamicCell from './DynamicCell';
import type Body from './Body';
import type Cell from './Cell';

export interface WorldOptions {
  grid: Cell[][];
  bodies: Body[];
}

/**
 * The two branches that move. Everything in the codebase with an `update`
 * descends from one of these and nothing else.
 *
 * This used to be `Body & { update(...) }` with a duck-type check, because
 * physics `DynamicCell` had no `update` of its own — its game-layer subclasses
 * supplied it, so the hierarchy could not be trusted to answer. Now that a
 * `DynamicCell` slides itself, both branches really do carry the method and
 * `instanceof` can ask the question directly.
 *
 * `autoPlay` comes along for free: both classes declare it as a real field, so
 * neither it nor `update` needs declaring on `Body`.
 */
type UpdatableBody = DynamicBody | DynamicCell;

const isUpdatable = (body: Body): body is UpdatableBody =>
  body instanceof DynamicBody || body instanceof DynamicCell;

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
  updatableBodies: UpdatableBody[];

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
    this.updatableBodies = [];

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
    this.updatableBodies.forEach(body => body.update(delta, elapsedMS));
  }

  add(body: Body) {
    if (!this.bodies[body.id]) {
      // Narrowed once and held, so the ordering below stays exactly as it was:
      // register for updates, record the body, then hand it its world.
      const updatable = isUpdatable(body) ? body : null;

      this.getCell(body.gridX, body.gridY).add(body);

      if (updatable?.autoPlay) {
        this.startUpdates(updatable);
      }

      this.bodies[body.id] = body;

      updatable?.onAdded(this);
    }
  }

  remove(body: Body) {
    this.stopUpdates(body);
    this.getCell(body.gridX, body.gridY).remove(body);

    if (isUpdatable(body)) {
      body.onRemoved();
    }

    delete this.bodies[body.id];
  }

  /**
   * Idempotent. Callers reach for this whenever a body needs to be running —
   * a door opening, a hit landing on a corpse that had settled — without
   * knowing whether it already is, and a second push would have it updated
   * twice a frame.
   */
  startUpdates(body: Body) {
    if (isUpdatable(body) && !this.updatableBodies.includes(body)) {
      this.updatableBodies.push(body);
    }
  }

  stopUpdates(body: Body) {
    if (isUpdatable(body)) {
      this.updatableBodies = this.updatableBodies.filter(d => d.id !== body.id);
    }
  }

  /**
   * Throws off the grid, rather than returning null for callers to dismiss.
   *
   * Every caller works from a coordinate already known to be on the grid — a
   * body's own position, a clamped scan, a step the raycaster has just
   * bounds-checked. The nullable version existed for the two scans below,
   * which used it to reject coordinates they had generated out of range; they
   * clamp now, so nothing wants the null.
   */
  getCell(x: number, y: number): Cell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.length) {
      throw new RangeError(`No cell at ${x}, ${y}`);
    }

    return this.grid[x][y];
  }

  setCell(x: number, y: number, cell: Cell) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.length) {
      throw new RangeError(`No cell at ${x}, ${y}`);
    }

    this.grid[x][y] = cell;
  }

  /** The square of cells around a body, clipped to the grid. */
  getNeighbourCells(body: Body, radius = 1): Cell[] {
    const cells: Cell[] = [];
    const { minX, maxX, minY, maxY } = this.getNeighbourBounds(body, radius);

    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        cells.push(this.getCell(i, j));
      }
    }

    return cells;
  }

  /** Every body in the surrounding cells, plus the blocking cells themselves. */
  getNeighbourBodies(body: Body, radius = 1): Body[] {
    const bodies: Body[] = [];
    const { minX, maxX, minY, maxY } = this.getNeighbourBounds(body, radius);

    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const cell = this.getCell(i, j);

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

    return bodies;
  }

  /**
   * The square around a body clipped to the grid, so the two scans above ask
   * only for cells that exist. They used to walk the unclipped square and drop
   * whatever came back null, which is the whole reason {@link getCell} was
   * nullable.
   */
  private getNeighbourBounds(body: Body, radius: number) {
    const { gridX, gridY } = body;

    return {
      minX: Math.max(gridX - radius, 0),
      maxX: Math.min(gridX + radius, this.width - 1),
      minY: Math.max(gridY - radius, 0),
      maxY: Math.min(gridY + radius, this.length - 1),
    };
  }

  destroy(_options?: unknown) {
    this.removeAllListeners();
    this.grid.forEach(row => row.forEach(cell => cell.destroy()));
  }
}
