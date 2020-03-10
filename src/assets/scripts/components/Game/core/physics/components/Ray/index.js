/**
 * Class representing a ray.
 */
class Ray {
  /**
   * Creates a ray.
   * @param  {Point}  start  The start point.
   * @param  {Point}  end    The end point.
   * @param  {Number} length The length.
   */
  constructor({
    startPoint,
    endPoint,
    length,
  }) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.length = length;
  }
}

export default Ray;
