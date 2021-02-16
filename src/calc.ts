import type { Position } from "geojson";
import { validPoint } from "./_validates";
import { Points } from "./types";
import { _eq } from "./utils";

export function linearInterpolationX(
  p1: Position,
  p2: Position,
  y: number
): number {
  validPoint(p1);
  validPoint(p2);
  if (_eq(p1[1], p2[1])) return p1[0];
  return p1[0] + ((y - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]);
}

export function linearInterpolationY(
  p1: Position,
  p2: Position,
  x: number
): number {
  validPoint(p1);
  validPoint(p2);
  if (_eq(p1[0], p2[0])) return p1[1];
  return p1[1] + ((x - p1[0]) * (p2[1] - p1[1])) / (p2[0] - p1[0]);
}

const calcLinearInterpolationPoint = function (
  i: number,
  p1: Position,
  p2: Position,
  partition: number
): Position {
  validPoint(p1);
  validPoint(p2);
  const div = Math.floor(partition);
  if (_eq(p1[0], p2[0])) {
    return [p1[0], p1[1] + (i * (p2[1] - p1[1])) / (div + 1)];
  } else if (_eq(p1[1], p2[1])) {
    return [p1[0] + (i * (p2[0] - p1[0])) / (div + 1), p1[1]];
  }
  const x = p1[0] + (i * (p2[0] - p1[0])) / (div + 1);
  return [x, linearInterpolationY(p1, p2, x)];
};

type linearInterpolationPointsOptions = {
  partition?: number;
};

export function linearInterpolationPoints(
  p1: Position,
  p2: Position,
  userOptions: linearInterpolationPointsOptions = {}
): Points {
  validPoint(p1);
  validPoint(p2);
  const options = Object.assign(
    {
      partition: 0,
    },
    userOptions
  );
  if (options.partition <= 0) return [p1, p2];
  const ret: Points = [];
  for (let i = 0; i < options.partition + 1; i++) {
    ret.push(calcLinearInterpolationPoint(i, p1, p2, options.partition));
  }
  ret.push(p2);

  return ret;
}
