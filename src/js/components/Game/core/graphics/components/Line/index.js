import { Graphics } from '../../pixi';

class Line extends Graphics {
  constructor({
    thickness = 1,
    color = 0x000000,
    alpha = 1,
  }) {
    super();

    this.thickness = thickness;
    this.color = color;

    this.lineStyle(thickness, color);

    this.alpha = alpha;

    this.moveTo(0, 0);
    this.lineTo(1, 1);
  }

  update(startPoint, endPoint) {
    this.clear();

    this.lineStyle(this.thickness, this.color);

    this.moveTo(startPoint.x, startPoint.y);
    this.lineTo(endPoint.x, endPoint.y);
  }
}

export default Line;
