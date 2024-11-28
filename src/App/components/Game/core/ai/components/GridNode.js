const DIAGONAL_LENGTH = Math.sqrt(2);

export default class GridNode {
  constructor(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  getCost(neighbour) {
    // Take diagonal weight into consideration.
    if (neighbour && neighbour.x !== this.x && neighbour.y !== this.y) {
      return this.weight * DIAGONAL_LENGTH;
    }
    return this.weight;
  }

  isWall() {
    return this.weight === 0;
  }
}
