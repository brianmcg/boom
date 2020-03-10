import { Graphics } from 'pixi.js';

/**
 * Class representing a line graphic.
 */
class Line extends Graphics {
  /**
   * [constructor description]
   * @param  {Array}  options.points The line points.
   * @param  {Number} options.width  The line width.
   * @param  {Number} options.color  The line color.
   * @param  {Number} options.alpha  The line alpha value.
   */
  constructor({
    points = [0, 0, 0, 0],
    width = 1,
    color = 0xFFFFFF,
    alpha = 0.15,
  } = {}) {
    super();

    this.alpha = alpha;

    this.lineStyle(width, color);

    this.moveTo(points[0], points[1]);
    this.lineTo(points[2], points[3]);
  }

  /**
   * Update the line points.
   * @param  {Array}  points The new line points.
   */
  updatePoints(points = [0, 0, 0, 0]) {
    this.clear();
    this.moveTo(points[0], points[1]);
    this.lineTo(points[2], points[3]);
  }
}

export default Line;
