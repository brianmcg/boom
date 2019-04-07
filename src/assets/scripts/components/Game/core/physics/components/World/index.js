import Sector from '../Sector';

export default class World {
  constructor(grid = [[]]) {
    this.dynamicBodies = [];
    this.staticBodies = [];
    this.dynamicSectors = [];
    this.grid = grid;
    this.grid.forEach(row => row.forEach(sector => this.add(sector)));
  }

  add(body) {
    if (body.update) {
      if (body instanceof Sector) {
        this.dynamicSectors.push(body);
      } else {
        this.dynamicBodies.push(body);
      }
    } else {
      this.staticBodies.push(body);
    }
  }

  remove(body) {
    if (body.update) {
      if (body instanceof Sector) {
        this.dynamicSectors = this.dynamicSectors.filter(dynamicSector => dynamicSector !== body);
      } else {
        this.dynamicBodies = this.dynamicBodies.filter(dynamicBody => dynamicBody !== body);
      }
    } else {
      this.staticBodies = this.staticBodies.filter(staticBody => staticBody !== body);
    }
  }

  update(delta) {
    this.dynamicSectors.forEach(sector => sector.update(delta));
    this.dynamicBodies.forEach(body => body.update(delta, this));
  }

  sector(x, y) {
    return this.grid[y][x];
  }
}
