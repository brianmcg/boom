/**
 * Whether a line segment crosses a body's box, and how far along it does so.
 * Pure geometry: no grid, no cells, no world. `Body` wraps both exports as
 * `intersectsLine` and `getLineIntersectionDistance`; the raycaster in
 * `castRay.ts` uses `isLineBodyIntersection` to find the bodies a ray passes
 * through.
 *
 * These used to return `{ x, y, distance }`. Nothing ever read the
 * coordinates — every consumer sorted, range-checked or faded by distance —
 * so they are locals now. The crossing point is still computed, because the
 * bounds tests need it; it is just no longer carried out of the module.
 */
import type { Line } from '../types';
import Point from '../components/Point';
import type Body from '../components/Body';

/**
 * How far along `startPoint`→`endPoint` it crosses `edgeStart`→`edgeEnd`, or
 * null if they miss.
 *
 * The two pairs are not interchangeable: the distance is measured from
 * `startPoint`, so the first pair must be the line being cast and the second
 * the edge being tested against. Both callers pass a box edge as the second.
 */
const getLineLineIntersection = (
  startPoint: Point,
  endPoint: Point,
  edgeStart: Point,
  edgeEnd: Point
): number | null => {
  const a1 = endPoint.y - startPoint.y;
  const b1 = startPoint.x - endPoint.x;
  const c1 = a1 * startPoint.x + b1 * startPoint.y;
  const a2 = edgeEnd.y - edgeStart.y;
  const b2 = edgeStart.x - edgeEnd.x;
  const c2 = a2 * edgeStart.x + b2 * edgeStart.y;
  const determinant = a1 * b2 - a2 * b1;

  if (determinant === 0) {
    return null;
  }

  const x = (b2 * c1 - b1 * c2) / determinant;
  const y = (a1 * c2 - a2 * c1) / determinant;

  // The crossing has to lie on the segment, not merely on the infinite line
  // through it. Without this a body entirely behind `startPoint` reports a hit,
  // at an unsigned distance, because only the edge was ever bounded — the box
  // 160 units behind you answers "160 units away". `lineIntersectsLine` has
  // always rejected that through its r/s bounds, and the two have to agree.
  //
  // The point is known to be on the line, so bounding its box is exactly the
  // segment test.
  if (
    x < Math.min(startPoint.x, endPoint.x) ||
    x > Math.max(startPoint.x, endPoint.x) ||
    y < Math.min(startPoint.y, endPoint.y) ||
    y > Math.max(startPoint.y, endPoint.y)
  ) {
    return null;
  }

  if (edgeStart.x === edgeEnd.x) {
    if (edgeStart.y < edgeEnd.y) {
      if (y >= edgeStart.y && y <= edgeEnd.y) {
        return startPoint.distanceTo(new Point(x, y));
      }
      return null;
    }

    if (y >= edgeEnd.y && y <= edgeStart.y) {
      return startPoint.distanceTo(new Point(x, y));
    }

    return null;
  }

  if (edgeStart.y === edgeEnd.y) {
    if (edgeStart.x < edgeEnd.x) {
      if (x >= edgeStart.x && x <= edgeEnd.x) {
        return startPoint.distanceTo(new Point(x, y));
      }
      return null;
    }

    if (x >= edgeEnd.x && x <= edgeStart.x) {
      return startPoint.distanceTo(new Point(x, y));
    }

    return null;
  }

  return null;
};

/**
 * Whether the two segments cross. Order-independent, unlike
 * {@link getLineLineIntersection} — it answers yes or no rather than where.
 */
const lineIntersectsLine = (
  startPoint: Point,
  endPoint: Point,
  edgeStart: Point,
  edgeEnd: Point
): boolean => {
  let q =
    (startPoint.y - edgeStart.y) * (edgeEnd.x - edgeStart.x) -
    (startPoint.x - edgeStart.x) * (edgeEnd.y - edgeStart.y);

  const d =
    (endPoint.x - startPoint.x) * (edgeEnd.y - edgeStart.y) -
    (endPoint.y - startPoint.y) * (edgeEnd.x - edgeStart.x);

  if (d === 0) {
    return false;
  }

  const r = q / d;

  q =
    (startPoint.y - edgeStart.y) * (endPoint.x - startPoint.x) -
    (startPoint.x - edgeStart.x) * (endPoint.y - startPoint.y);

  const s = q / d;

  if (r < 0 || r > 1 || s < 0 || s > 1) {
    return false;
  }

  return true;
};

export const isLineBodyIntersection = (
  body: Body,
  { startPoint, endPoint }: Line
): boolean => {
  const { topLeft, topRight, bottomRight, bottomLeft } = body.shape.corners();

  return (
    lineIntersectsLine(startPoint, endPoint, topLeft, topRight) ||
    lineIntersectsLine(startPoint, endPoint, topRight, bottomRight) ||
    lineIntersectsLine(startPoint, endPoint, bottomRight, bottomLeft) ||
    lineIntersectsLine(startPoint, endPoint, bottomLeft, topLeft)
  );
};

/**
 * How far along the line it first crosses the body, or null if it misses.
 *
 * Null and `0` are different answers: `0` is a real crossing, from a line that
 * starts exactly on the body's edge. Callers must test `!== null`, not
 * truthiness.
 */
export const getLineBodyIntersectionDistance = (
  body: Body,
  { startPoint, endPoint }: Line
): number | null => {
  const { topLeft, topRight, bottomRight, bottomLeft } = body.shape.corners();

  const crossings = [
    getLineLineIntersection(startPoint, endPoint, topLeft, topRight),
    getLineLineIntersection(startPoint, endPoint, topRight, bottomRight),
    getLineLineIntersection(startPoint, endPoint, bottomRight, bottomLeft),
    getLineLineIntersection(startPoint, endPoint, bottomLeft, topLeft),
  ].filter(crossing => crossing !== null);

  return crossings.length ? Math.min(...crossings) : null;
};
