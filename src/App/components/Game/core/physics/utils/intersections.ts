/**
 * Where a line segment crosses a body's box, and whether it crosses at all.
 * Pure geometry: no grid, no cells, no world. `Body` wraps both exports as
 * `intersectsLine` and `getLineIntersection`; the raycaster in `castRay.ts`
 * uses `isLineBodyIntersection` to find the bodies a ray passes through.
 */
import { getDistanceBetween } from './measure';
import type { Line, Intersection } from '../types';
import type Point from '../components/Point';
import type Body from '../components/Body';

/**
 * Where the segment `startPoint`→`endPoint` crosses the segment
 * `edgeStart`→`edgeEnd`, or null if they miss.
 *
 * The two pairs are not interchangeable: `distance` is measured from
 * `startPoint`, so the first pair must be the line being cast and the second
 * the edge being tested against. Both callers pass a box edge as the second.
 */
const getLineLineIntersection = (
  startPoint: Point,
  endPoint: Point,
  edgeStart: Point,
  edgeEnd: Point
): Intersection | null => {
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

  if (edgeStart.x === edgeEnd.x) {
    if (edgeStart.y < edgeEnd.y) {
      if (y >= edgeStart.y && y <= edgeEnd.y) {
        return { x, y, distance: getDistanceBetween(startPoint, { x, y }) };
      }
      return null;
    }

    if (y >= edgeEnd.y && y <= edgeStart.y) {
      return { x, y, distance: getDistanceBetween(startPoint, { x, y }) };
    }

    return null;
  }

  if (edgeStart.y === edgeEnd.y) {
    if (edgeStart.x < edgeEnd.x) {
      if (x >= edgeStart.x && x <= edgeEnd.x) {
        return { x, y, distance: getDistanceBetween(startPoint, { x, y }) };
      }
      return null;
    }

    if (x >= edgeEnd.x && x <= edgeStart.x) {
      return { x, y, distance: getDistanceBetween(startPoint, { x, y }) };
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

export const getLineBodyIntersection = (
  body: Body,
  { startPoint, endPoint }: Line
): Intersection | null => {
  const { topLeft, topRight, bottomRight, bottomLeft } = body.shape.corners();

  return [
    getLineLineIntersection(startPoint, endPoint, topLeft, topRight),
    getLineLineIntersection(startPoint, endPoint, topRight, bottomRight),
    getLineLineIntersection(startPoint, endPoint, bottomRight, bottomLeft),
    getLineLineIntersection(startPoint, endPoint, bottomLeft, topLeft),
  ].reduce<Intersection | null>((memo, intersection) => {
    if (!intersection) {
      return memo;
    }

    if (!memo) {
      return intersection;
    }

    if (intersection.distance < memo.distance) {
      return intersection;
    }

    return memo;
  }, null);
};
