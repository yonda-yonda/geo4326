import type { Position } from "geojson";
import { Points } from "./types";
import { validPoint, validLinearRing } from "./_validates";
import { InvalidCodeError } from "./errors";
import { EPSILON } from "./constants";
import { epsgIndex } from "./_generated/epsg-index";

export function _eq(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

export function _toRadians(degree: number): number {
  return degree * (Math.PI / 180);
}

export function _area(linearRing: Points): number {
  validLinearRing(linearRing);
  let area = 0.0;
  const length = linearRing.length - 1;
  for (let i = 0; i < length; i++) {
    area =
      area +
      linearRing[i][0] * linearRing[i + 1][1] -
      linearRing[i][1] * linearRing[i + 1][0];
  }

  return area / 2;
}

export function area(linearRing: Points): number {
  return Math.abs(_area(linearRing));
}

export function isCcw(linearRing: Points): boolean {
  return _area(linearRing) >= 0;
}

type withinOptions = {
  includeBorder?: boolean;
};

function _within(
  point: Position,
  linearRing: Points,
  userOptions: withinOptions = {}
): boolean {
  /*
    Winding Number Algorithm
  */
  const options = Object.assign(
    {
      includeBorder: false,
    },
    userOptions
  );
  const [x, y] = point;

  let theta = 0;
  for (let i = 1; i < linearRing.length; i++) {
    let [x1, y1] = linearRing[i - 1];
    let [x2, y2] = linearRing[i];
    x1 -= x;
    y1 -= y;
    x2 -= x;
    y2 -= y;

    const cv = x1 * x2 + y1 * y2;
    const sv = x1 * y2 - x2 * y1;
    if (Math.abs(sv) < EPSILON && cv <= 0) {
      return options.includeBorder;
    }
    theta += Math.atan2(sv, cv);
  }

  return Math.abs(theta) > 1;
}

export function within(
  point: Position,
  linearRing: Points,
  userOptions?: withinOptions
): boolean {
  validPoint(point);
  validLinearRing(linearRing);
  return _within(point, linearRing, userOptions);
}

function _intersection(
  p1: Position,
  p2: Position,
  p3: Position,
  p4: Position
): boolean {
  /*
    When p1 -> p2, p3 -> p4 are crossing || points more than 3 are on a line,
    return True
  */
  if (p1[0] >= p2[0]) {
    if ((p1[0] < p3[0] && p1[0] < p4[0]) || (p2[0] > p3[0] && p2[0] > p4[0]))
      return false;
  } else {
    if ((p2[0] < p3[0] && p2[0] < p4[0]) || (p1[0] > p3[0] && p1[0] > p4[0]))
      return false;
  }

  if (p1[1] >= p2[1]) {
    if ((p1[1] < p3[1] && p1[1] < p4[1]) || (p2[1] > p3[1] && p2[1] > p4[1]))
      return false;
  } else {
    if ((p2[1] < p3[1] && p2[1] < p4[1]) || (p1[1] > p3[1] && p1[1] > p4[1]))
      return false;
  }

  if (
    ((p1[0] - p2[0]) * (p3[1] - p1[1]) + (p1[1] - p2[1]) * (p1[0] - p3[0])) *
      ((p1[0] - p2[0]) * (p4[1] - p1[1]) + (p1[1] - p2[1]) * (p1[0] - p4[0])) >
    0
  )
    return false;

  if (
    ((p3[0] - p4[0]) * (p1[1] - p3[1]) + (p3[1] - p4[1]) * (p3[0] - p1[0])) *
      ((p3[0] - p4[0]) * (p2[1] - p3[1]) + (p3[1] - p4[1]) * (p3[0] - p2[0])) >
    0
  )
    return false;

  return true;
}

export function intersection(
  p1: Position,
  p2: Position,
  p3: Position,
  p4: Position
): boolean {
  validPoint(p1);
  validPoint(p2);
  validPoint(p3);
  validPoint(p4);
  return _intersection(p1, p2, p3, p4);
}

const _checkLinesintersection = (lines: Position[][], start = 0): boolean => {
  if (start + 2 >= lines.length) return false;
  const l1 = lines[start];
  const end = start === 0 ? lines.length - 1 : lines.length;
  for (let i = start + 2; i < end; i++) {
    const l2 = lines[i];
    if (intersection(l1[0], l1[1], l2[0], l2[1])) return true;
  }

  return _checkLinesintersection(lines, start + 1);
};

export function selfintersection(linearRing: Points): boolean {
  /* 
    not support warp polygon.
  */
  validLinearRing(linearRing);

  const ring: number[][] = [];
  for (let i = 0; i < linearRing.length - 1; i++) {
    if (
      linearRing[i][0] !== linearRing[i + 1][0] ||
      linearRing[i][1] !== linearRing[i + 1][1]
    )
      ring.push(linearRing[i]);
  }
  ring.push(linearRing[linearRing.length - 1]);
  if (ring.length < 4) return false;
  if (ring.length === 4)
    return (
      Math.abs(
        ring[0][1] * (ring[1][0] - ring[2][0]) +
          ring[1][1] * (ring[2][0] - ring[0][0]) +
          ring[2][1] * (ring[0][0] - ring[1][0])
      ) < EPSILON
    );

  const lines = [];
  for (let i = 0; i < ring.length - 1; i++) {
    lines.push([ring[i], ring[i + 1]]);
  }

  return _checkLinesintersection(lines);
}

export function getCrs(code: string | number): string {
  const epsgNumber =
    typeof code === "string" && !!/^epsg:/i.exec(code)
      ? Number(code.replace(/^epsg:/i, ""))
      : code;
  if (typeof epsgNumber === "string") return epsgNumber;

  const epsgDef = (epsgIndex as any)[epsgNumber]; // eslint-disable-line
  if (typeof epsgDef === "string") {
    return epsgDef;
  } else {
    throw new InvalidCodeError();
  }
}

export function hasSingularity(points: number[][]): boolean {
  if (Array.isArray(points)) {
    for (let i = 0; i < points.length; i++) {
      if (
        Array.isArray(points[i]) &&
        points[i].some((v) => isNaN(v) || v === Infinity || v === -Infinity)
      )
        return true;
    }
  }
  return false;
}

export function overlapping(l1: Points, l2: Points): boolean {
  // Rareley, intersect of turf.js gets `Unable to complete output ring starting at...` error.
  validLinearRing(l1);
  validLinearRing(l2);

  for (let i = 0; i < l1.length - 1; i++) {
    if (
      _within(l1[i], l2, {
        includeBorder: true,
      })
    )
      return true;
  }
  for (let i = 0; i < l2.length - 1; i++) {
    if (
      _within(l2[i], l1, {
        includeBorder: true,
      })
    )
      return true;
  }
  for (let i = 0; i < l1.length - 1; i++) {
    for (let j = 0; j < l2.length - 1; j++) {
      if (_intersection(l1[i], l1[i + 1], l2[j], l2[j + 1])) return true;
    }
  }

  return false;
}

export function enclosing(inner: Points, outer: Points): boolean {
  // Rareley, booleanCrosses of turf.js gets incorrect.
  validLinearRing(inner);
  validLinearRing(outer);

  for (let i = 0; i < inner.length - 1; i++) {
    if (
      !_within(inner[i], outer, {
        includeBorder: true,
      })
    )
      return false;
  }
  return true;
}
