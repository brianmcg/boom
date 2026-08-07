/**
 * Where a line segment crosses a body's box, and whether it crosses at all.
 * Pure geometry: no grid, no cells, no world. `Body` wraps both exports as
 * `intersectsLine` and `getLineIntersection`; the raycaster in `castRay.ts`
 * uses `isLineBodyIntersection` to find the bodies a ray passes through.
 */
import Point, { getDistanceBetween } from '../components/Point';
import type { Line, Intersection } from '../types';
import type Body from '../components/Body';

const getLineLineIntersection = (
  l1p1: Point,
  l1p2: Point,
  l2p1: Point,
  l2p2: Point
): Intersection | null => {
  const a1 = l1p2.y - l1p1.y;
  const b1 = l1p1.x - l1p2.x;
  const c1 = a1 * l1p1.x + b1 * l1p1.y;
  const a2 = l2p2.y - l2p1.y;
  const b2 = l2p1.x - l2p2.x;
  const c2 = a2 * l2p1.x + b2 * l2p1.y;
  const determinant = a1 * b2 - a2 * b1;

  if (determinant === 0) {
    return null;
  }

  const x = (b2 * c1 - b1 * c2) / determinant;
  const y = (a1 * c2 - a2 * c1) / determinant;

  if (l2p1.x === l2p2.x) {
    if (l2p1.y < l2p2.y) {
      if (y >= l2p1.y && y <= l2p2.y) {
        return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
      }
      return null;
    }

    if (y >= l2p2.y && y <= l2p1.y) {
      return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
    }

    return null;
  }

  if (l2p1.y === l2p2.y) {
    if (l2p1.x < l2p2.x) {
      if (x >= l2p1.x && x <= l2p2.x) {
        return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
      }
      return null;
    }

    if (x >= l2p2.x && x <= l2p1.x) {
      return { x, y, distance: getDistanceBetween(l1p1, { x, y }) };
    }

    return null;
  }

  return null;
};

const lineIntersectsLine = (
  l1p1: Point,
  l1p2: Point,
  l2p1: Point,
  l2p2: Point
): boolean => {
  let q =
    (l1p1.y - l2p1.y) * (l2p2.x - l2p1.x) -
    (l1p1.x - l2p1.x) * (l2p2.y - l2p1.y);

  const d =
    (l1p2.x - l1p1.x) * (l2p2.y - l2p1.y) -
    (l1p2.y - l1p1.y) * (l2p2.x - l2p1.x);

  if (d === 0) {
    return false;
  }

  const r = q / d;

  q =
    (l1p1.y - l2p1.y) * (l1p2.x - l1p1.x) -
    (l1p1.x - l2p1.x) * (l1p2.y - l1p1.y);

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
