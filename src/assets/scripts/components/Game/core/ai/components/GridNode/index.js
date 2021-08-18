const DIAGONAL_LENGTH = Math.sqrt(2);

/**
 * Class representing a grid node.
 */
class GridNode {
  /**
   * Creates a grid node.
   * @param  {Number} x      The x coordinate.
   * @param  {Number} y      The y coordinate.
   * @param  {Number} weight The weight.
   */
  constructor(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  /**
   * Get the cost to move from neighbour.
   * @param  {GrdiNode} neighbour  The neighbour.
   * @return {Number}              The cost.
   */
  getCost(neighbour) {
    // Take diagonal weight into consideration.
    if (neighbour && neighbour.x !== this.x && neighbour.y !== this.y) {
      return this.weight * DIAGONAL_LENGTH;
    }
    return this.weight;
  }

  /**
   * Is this node a wall.
   * @return {Boolean}
   */
  isWall() {
    return this.weight === 0;
  }
}

export default GridNode;
