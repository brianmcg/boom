import { WHITE } from '@constants/colors';
import { Graphics } from 'pixi.js';

export default class Line extends Graphics {
  constructor({ thickness = 1, color = WHITE, alpha = 1 }) {
    super();

    this.thickness = thickness;
    this.color = color;
    this.alpha = alpha;

    this.moveTo(0, 0);
    this.lineTo(1, 1);
  }

  update(startPoint = {}, endPoint = {}) {
    this.clear();
    this.moveTo(startPoint.x, startPoint.y);
    this.lineTo(endPoint.x, endPoint.y);
    this.stroke({ width: this.thickness, color: this.color });
  }
}
