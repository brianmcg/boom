import { Graph } from '@game/core/ai';
import { TRANSPARENCY } from '@game/core/physics';

export const NODE_WEIGHTS = {
  WALL: 0,
  FREE: 1,
  DYNAMIC_BODY: 20,
  STATIC_BODY: 100,
  TRANSPARENT_CELL: 30,
};

const extrudeGrid = (grid, radius) => {
  const extrudedGrid = [...Array(grid.length)].map(() => Array(grid[0].length));

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      const cell = grid[x][y];

      if (cell === NODE_WEIGHTS.WALL) {
        extrudedGrid[x][y] = NODE_WEIGHTS.WALL;

        for (let i = x - radius; i <= x + radius; i++) {
          for (let j = y - radius; j <= y + radius; j++) {
            const nextCell = grid[i] && grid[i][j];

            if (nextCell || nextCell === 0) {
              extrudedGrid[i][j] = NODE_WEIGHTS.WALL;
            }
          }
        }
      } else if (extrudedGrid[x][y] === undefined) {
        extrudedGrid[x][y] = cell;
      }
    }
  }

  return extrudedGrid;
};

export const createGraphs = (grid = [], radius = 1) => {
  const grids = [
    grid.map(col =>
      col.map(cell => {
        if (
          cell.blocking &&
          !cell.isDoor &&
          !cell.isPushWall &&
          cell.transparency !== TRANSPARENCY.FULL
        ) {
          return NODE_WEIGHTS.WALL;
        }

        if (cell.bodies.some(body => body.blocking && !body.isDynamic)) {
          return NODE_WEIGHTS.STATIC_BODY;
        }

        return NODE_WEIGHTS.FREE;
      })
    ),
    grid.map(col =>
      col.map(cell => {
        if (cell.blocking && cell.transparency) {
          return NODE_WEIGHTS.FREE; // NODE_WEIGHTS.TRANSPARENT_CELL;
        }

        if (cell.blocking && !cell.isDoor && !cell.isPushWall) {
          return NODE_WEIGHTS.WALL;
        }

        if (cell.bodies.some(body => body.blocking && !body.isDynamic)) {
          return NODE_WEIGHTS.STATIC_BODY;
        }

        return NODE_WEIGHTS.FREE;
      })
    ),
  ];

  if (radius > 0) {
    return grids.map(
      g => new Graph(extrudeGrid(g, radius), { diagonal: false })
    );
  }

  return grids.map(g => new Graph(g, { diagonal: false }));
};
