import GridNode from '../GridNode';

const cleanNode = node => {
  node.f = 0;
  node.g = 0;
  node.h = 0;
  node.visited = false;
  node.closed = false;
  node.parent = null;
};

/**
 * Class representing a graph memory structure.
 */
class Graph {
  /**
   * Creates a graph.
   * @param {Array} gridIn 2D array of input weights.
   * @param {Object} [options]
   * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed.
   */
  constructor(gridIn, options = {}) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (let x = 0; x < gridIn.length; x++) {
      this.grid[x] = [];

      for (let y = 0, row = gridIn[x]; y < row.length; y++) {
        const node = new GridNode(x, y, row[y]);
        this.grid[x][y] = node;
        this.nodes.push(node);
      }
    }
    this.init();
  }

  /**
   * Initialize the graph.
   */
  init() {
    this.dirtyNodes = [];
    for (let i = 0; i < this.nodes.length; i++) {
      cleanNode(this.nodes[i]);
    }
  }

  /**
   * Clean dirty nodes.
   */
  cleanDirty() {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
  }

  /**
   * Mark a node as dirty.
   * @param  {GrdiNode} node The node to mark.
   */
  markDirty(node) {
    this.dirtyNodes.push(node);
  }

  /**
   * Get the neighbours of a node.
   * @param  {GrdiNode} node The node.
   * @return {Array}         The neighbouring nodes.
   */
  neighbors(node) {
    const ret = [];
    const { grid } = this;
    const { x, y } = node;

    // West
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y]);
    }

    // East
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y]);
    }

    // South
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1]);
    }

    // North
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1]);
    }

    if (this.diagonal) {
      // Southwest
      if (grid[x - 1] && grid[x - 1][y - 1]) {
        ret.push(grid[x - 1][y - 1]);
      }

      // Southeast
      if (grid[x + 1] && grid[x + 1][y - 1]) {
        ret.push(grid[x + 1][y - 1]);
      }

      // Northwest
      if (grid[x - 1] && grid[x - 1][y + 1]) {
        ret.push(grid[x - 1][y + 1]);
      }

      // Northeast
      if (grid[x + 1] && grid[x + 1][y + 1]) {
        ret.push(grid[x + 1][y + 1]);
      }
    }

    return ret;
  }
}

export default Graph;
