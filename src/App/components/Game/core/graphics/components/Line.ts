import { WHITE } from '@constants/colors';
import { Graphics, type ColorSource, type PointData } from 'pixi.js';

/** Shared, because the defaults are never written to and never handed out. */
const ORIGIN: PointData = { x: 0, y: 0 };

export interface LineOptions {
  thickness?: number;
  color?: ColorSource;
  alpha?: number;
}

export default class Line extends Graphics {
  readonly thickness: number;

  readonly color: ColorSource;

  constructor({ thickness = 1, color = WHITE, alpha = 1 }: LineOptions) {
    super();

    this.thickness = thickness;
    this.color = color;

    // Pixi's, so it stays an assignment.
    this.alpha = alpha;

    this.moveTo(0, 0);
    this.lineTo(1, 1);
  }

  update(startPoint: PointData = ORIGIN, endPoint: PointData = ORIGIN) {
    this.clear();
    this.moveTo(startPoint.x, startPoint.y);
    this.lineTo(endPoint.x, endPoint.y);
    this.stroke({ width: this.thickness, color: this.color });
  }
}
