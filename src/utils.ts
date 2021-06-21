import epsgIndex from "epsg-index/all.json";
import type { Position } from "geojson";
import { Points } from "./types";
import { validPoint, validLinearRing } from "./_validates";
import { InvalidCodeError } from "./errors";
import { EPSILON } from "./constants";

export function _eq(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

export function _toRadians(degree: number): number {
  return degree * (Math.PI / 180);
}

export function isCcw(linearRing: Points): boolean {
  validLinearRing(linearRing);
  let area = 0.0;
  const length = linearRing.length - 1;
  for (let i = 0; i < length; i++) {
    area =
      area +
      linearRing[i][0] * linearRing[i + 1][1] -
      linearRing[i][1] * linearRing[i + 1][0];
  }

  return area >= 0;
}

type withinOptions = {
  includeBorder?: boolean;
};

export function within(
  point: Position,
  linearRing: Points,
  userOptions: withinOptions = {}
): boolean {
  /*
    Winding Number Algorithm
  */
  validPoint(point);
  validLinearRing(linearRing);

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

export function intersection(
  p1: Position,
  p2: Position,
  p3: Position,
  p4: Position
): boolean {
  /*
    When p1 -> p2, p3 -> p4 are crossing || points more than 3 are on a line,
    return True
  */
  validPoint(p1);
  validPoint(p2);
  validPoint(p3);
  validPoint(p4);
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

const _checkLinesintersection = (lines: Position[][], start = 0): boolean => {
  if (start + 2 >= lines.length) return false;

  const l1 = lines[start];
  for (let i = start + 2; i < lines.length; i++) {
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
  if (linearRing.length === 4)
    return (
      Math.abs(
        linearRing[0][1] * (linearRing[1][0] - linearRing[2][0]) +
          linearRing[1][1] * (linearRing[2][0] - linearRing[0][0]) +
          linearRing[2][1] * (linearRing[0][0] - linearRing[1][0])
      ) < EPSILON
    );

  const lines = [];
  for (let i = 0; i < linearRing.length - 2; i++) {
    lines.push([linearRing[i], linearRing[i + 1]]);
  }

  return _checkLinesintersection(lines);
}

export function getCrs(code: string | number): string {
  const epsgNumber =
    typeof code === "string" && !!/^epsg:/i.exec(code)
      ? Number(code.replace(/^epsg:/i, ""))
      : code;
  if (typeof epsgNumber === "string") return epsgNumber;

  try {
    const epsgDef = (epsgIndex as any)[epsgNumber]; // eslint-disable-line
    return epsgDef.proj4; // eslint-disable-line
  } catch {
    throw new InvalidCodeError();
  }
}
