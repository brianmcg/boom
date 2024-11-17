import { Graphics } from 'pixi.js';

/**
 * Class representing a line.
 */
export default class Line extends Graphics {
  /**
   * @param  {Number} options.thickness The thickness of the line.
   * @param  {Number} options.color     The color of the line.
   * @param  {Number} options.alpha     The alpha of the line.
   */
  constructor({ thickness = 1, color = 0x000000, alpha = 1 }) {
    super();

    this.thickness = thickness;
    this.color = color;

    this.lineStyle(thickness, color);

    this.alpha = alpha;

    this.moveTo(0, 0);
    this.lineTo(1, 1);
  }

  /**
   * @param  {Object} options.startPoint  The start point.
   * @param  {Object} options.endPoint    The end point.
   */
  update(startPoint = {}, endPoint = {}) {
    this.clear();

    this.lineStyle(this.thickness, this.color);

    this.moveTo(startPoint.x, startPoint.y);
    this.lineTo(endPoint.x, endPoint.y);
  }
}
