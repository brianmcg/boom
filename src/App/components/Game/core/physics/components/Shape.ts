import Point from './Point';

/**
 * An axis-aligned bounding box, positioned by its **top-left** corner — unlike
 * a `Body`, which is positioned by its centre. `Body.shape` does that
 * conversion.
 *
 * Per the module's house style this is a value object, so it takes its numbers
 * positionally rather than an options object.
 *
 * A fresh one is built on every `body.shape` access, which is a lot: the
 * collision resolution in `DynamicBody.update` reads it per body per axis.
 * That was already true when it was an object literal — the class costs the
 * same allocation and gives the box somewhere to keep its own geometry.
 */
export default class Shape {
  x: number;
  y: number;
  width: number;
  length: number;

  constructor(x: number, y: number, width: number, length: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.length = length;
  }

  /** Clockwise from the top-left. */
  corners(): {
    topLeft: Point;
    topRight: Point;
    bottomRight: Point;
    bottomLeft: Point;
  } {
    const { x, y, width, length } = this;

    return {
      topLeft: new Point(x, y),
      topRight: new Point(x + width, y),
      bottomRight: new Point(x + width, y + length),
      bottomLeft: new Point(x, y + length),
    };
  }

  /** Whether the two boxes intersect. Touching edges do not count. */
  overlaps(other: Shape): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.length &&
      this.y + this.length > other.y
    );
  }
}
