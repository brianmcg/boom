export default class World {
  constructor(grid = [[]]) {
    this.grid = grid;
    this.bodies = {};
    this.updateableIds = [];
    this.grid.forEach(row => row.forEach(sector => this.add(sector)));
  }

  add(body) {
    this.bodies[body.id] = body;

    if (body.update && typeof body.update === 'function') {
      this.updateableIds.push(body.id);
    }
  }

  remove(body) {
    this.bodies = this.bodies.filter(thisBody => thisBody !== body);

    if (body.update) {
      this.updateableIds = this.updateableIds.filter(id => id !== body.id);
    }
  }

  update(delta) {
    this.updateableIds.forEach(id => this.bodies[id].update(delta, this));
  }

  sector(x, y) {
    return this.grid[y][x];
  }

  adjacentSectors(body) {
    const sectors = [];
    const x = body.gridX;
    const y = body.gridY;

    for (let i = x - 1; i <= x + 1; i += 1) {
      for (let j = y - 1; j <= y + 1; j += 1) {
        const sector = this.sector(i, j);

        if (sector !== body) {
          sectors.push(sector);
        }
      }
    }

    return sectors;
  }

  adjacentBodies(body) {
    const sectors = this.adjacentSectors(body);

    return sectors.reduce((bodies, sector) => {
      sector.childIds.forEach((id) => {
        if (this.bodies[id] !== body) {
          bodies.push(this.bodies[id]);
        }
      });

      if (sector !== body) {
        bodies.push(sector);
      }

      return bodies;
    }, []);
  }
}
