import type { Position } from "geojson";
export type Points = Position[];
export type CutRing = {
  within: Points[];
  outside: Points[];
};
