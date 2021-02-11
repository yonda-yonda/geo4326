export type Point = [number, number, ...number[]];
export type Points = Point[];
export type CutRing = {
  within: Points[];
  outside: Points[];
};
