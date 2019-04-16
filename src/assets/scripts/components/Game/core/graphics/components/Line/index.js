import { Graphics } from 'pixi.js';

export default class Line extends Graphics {
  constructor(options = {}) {
    const {
      points = [0, 0, 0, 0],
      width = 1,
      color = 0xFFFFFF,
      alpha = 0.15,
    } = options;

    super();

    this.alpha = alpha;

    this.lineStyle(width, color);

    this.moveTo(points[0], points[1]);
    this.lineTo(points[2], points[3]);
  }

  updatePoints(points = [0, 0, 0, 0]) {
    this.clear();
    this.moveTo(points[0], points[1]);
    this.lineTo(points[2], points[3]);
  }
}
