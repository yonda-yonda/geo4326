import type { Position } from "geojson";
import { Points } from "./types";
import {
  InvalidPointError,
  InvalidPointsError,
  InvalidLinearRingError,
} from "./errors";

export function validPoint(point: Position): void {
  if (!Array.isArray(point)) throw new InvalidPointError();
  if (point.length < 2) throw new InvalidPointError();
  point.forEach((v) => {
    if (typeof v !== "number") throw new InvalidPointError();
  });
}

export function validPoints(points: Points): void {
  if (!Array.isArray(points)) throw new InvalidPointsError();
  try {
    points.forEach((p) => {
      validPoint(p);
    });
  } catch {
    throw new InvalidPointsError();
  }
}

export function validLinearRing(points: Points): void {
  validPoints(points);
  if (
    points.length <= 3 ||
    points[0][0] !== points[points.length - 1][0] ||
    points[0][1] !== points[points.length - 1][1]
  )
    throw new InvalidLinearRingError();
}
