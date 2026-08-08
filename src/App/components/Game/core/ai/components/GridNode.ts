const DIAGONAL_LENGTH = Math.sqrt(2);

/**
 * One cell of a {@link Graph}: where it is, what it costs to enter, and the
 * A* bookkeeping for the search currently running over it.
 *
 * The search fields are declared here rather than being attached from outside.
 * `Graph.init()` still resets them before every search — this only moves the
 * point at which they first exist, from the first `init()` to construction,
 * which `Graph`'s constructor calls anyway.
 */
export default class GridNode {
  readonly x: number;
  readonly y: number;

  /**
   * Cost to enter this cell; `0` means impassable.
   *
   * Not `readonly`. Engine rewrites it around every search — `World.findPath`
   * stamps `DYNAMIC_BODY` over the cells holding moving bodies so paths route
   * around them, then restores the map's own weights afterwards.
   */
  weight: number;

  /** Total estimated cost through this node, `g + h`. What the heap sorts on. */
  f = 0;

  /** Cost of the cheapest route from the start found so far. */
  g = 0;

  /** Heuristic estimate of the cost remaining to the goal. */
  h = 0;

  /** Whether any route here has been found yet, so `g` means something. */
  visited = false;

  /** Whether this node has been expanded and needs no further consideration. */
  closed = false;

  /** The node this was reached from; `pathTo` walks these back to the start. */
  parent: GridNode | null = null;

  constructor(x: number, y: number, weight: number) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  getCost(neighbour: GridNode | null): number {
    // Take diagonal weight into consideration.
    if (neighbour && neighbour.x !== this.x && neighbour.y !== this.y) {
      return this.weight * DIAGONAL_LENGTH;
    }

    return this.weight;
  }

  isWall(): boolean {
    return this.weight === 0;
  }
}
