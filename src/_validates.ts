import {
  InvalidNumberError,
  InvalidPointError,
  InvalidPointsError,
  InvalidLinearRingError,
} from "./errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validNumber(v: any): void {
  if (typeof v !== "number" || v - v !== 0) throw new InvalidNumberError();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validPoint(point: any): void {
  try {
    if (!Array.isArray(point)) throw new Error();
    if (point.length < 2) throw new Error();
    point.forEach((v) => {
      validNumber(v);
    });
  } catch {
    throw new InvalidPointError();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validPoints(points: any): void {
  try {
    if (!Array.isArray(points)) throw new Error();
    points.forEach((p) => {
      validPoint(p);
    });
  } catch {
    throw new InvalidPointsError();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validLinearRing(points: any): void {
  try {
    validPoints(points);
    if (
      points.length <= 3 ||
      points[0][0] !== points[points.length - 1][0] ||
      points[0][1] !== points[points.length - 1][1]
    )
      throw new Error();
  } catch {
    throw new InvalidLinearRingError();
  }
}
