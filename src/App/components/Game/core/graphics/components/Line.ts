import { WHITE } from '@constants/colors';
import { Graphics, type ColorSource, type PointData } from 'pixi.js';

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

  /**
   * `Partial` because the defaults are exactly that — `{}` with no coordinates
   * — so omitting a point draws to `undefined` rather than to the origin. Every
   * caller passes both in full; preserved as written, see the findings.
   */
  update(
    startPoint: Partial<PointData> = {},
    endPoint: Partial<PointData> = {}
  ) {
    this.clear();
    this.moveTo(startPoint.x!, startPoint.y!);
    this.lineTo(endPoint.x!, endPoint.y!);
    this.stroke({ width: this.thickness, color: this.color });
  }
}
