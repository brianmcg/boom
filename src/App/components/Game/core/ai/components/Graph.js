import GridNode from './GridNode';

const cleanNode = node => {
  node.f = 0;
  node.g = 0;
  node.h = 0;
  node.visited = false;
  node.closed = false;
  node.parent = null;
};

export default class Graph {
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

  init() {
    this.dirtyNodes = [];
    for (let i = 0; i < this.nodes.length; i++) {
      cleanNode(this.nodes[i]);
    }
  }

  cleanDirty() {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      cleanNode(this.dirtyNodes[i]);
    }

    this.dirtyNodes = [];
  }

  markDirty(node) {
    this.dirtyNodes.push(node);
  }

  neighbors(node) {
    const result = [];
    const { grid } = this;
    const { x, y } = node;

    const west = grid[x - 1];
    const mid = grid[x];
    const east = grid[x + 1];

    // West
    if (west && west[y]) {
      result.push(west[y]);
    }

    // East
    if (east && east[y]) {
      result.push(east[y]);
    }

    // South
    if (mid && mid[y - 1]) {
      result.push(mid[y - 1]);
    }

    // North
    if (mid && mid[y + 1]) {
      result.push(mid[y + 1]);
    }

    if (this.diagonal) {
      // Southwest
      if (west && west[y - 1]) {
        result.push(west[y - 1]);
      }

      // Southeast
      if (east && east[y - 1]) {
        result.push(east[y - 1]);
      }

      // Northwest
      if (west && west[y + 1]) {
        result.push(west[y + 1]);
      }

      // Northeast
      if (east && east[y + 1]) {
        result.push(east[y + 1]);
      }
    }

    return result;
  }
}
