const {
  linearInterpolationX,
  linearInterpolationY,
  linearInterpolationPoints,
} = require("../dist/calc.js");

it("linearInterpolationX", () => {
  expect(linearInterpolationX([0, 0], [10, 10], 5)).toBe(5);
  expect(linearInterpolationX([0, 0], [10, 10], 20)).toBe(20);
  expect(linearInterpolationX([0, 0], [10, 0], -5)).toBe(0);
  expect(linearInterpolationX([-10, 0], [10, 10], 5)).toBe(0);
});

it("linearInterpolationY", () => {
  expect(linearInterpolationY([0, 0], [10, 10], 5)).toBe(5);
  expect(linearInterpolationY([0, 0], [10, 10], 20)).toBe(20);
  expect(linearInterpolationY([0, 0], [10, 0], -5)).toBe(0);
  expect(linearInterpolationY([-10, 0], [10, 10], 5)).toBe(7.5);
});

it("linearInterpolationPoints", () => {
  expect(linearInterpolationPoints([0, 0], [10, 10])).toEqual([
    [0, 0],
    [10, 10],
  ]);
  expect(linearInterpolationPoints([0, 0], [1, 1], { partition: 9 })).toEqual([
    [0, 0],
    [0.1, 0.1],
    [0.2, 0.2],
    [0.3, 0.3],
    [0.4, 0.4],
    [0.5, 0.5],
    [0.6, 0.6],
    [0.7, 0.7],
    [0.8, 0.8],
    [0.9, 0.9],
    [1, 1],
  ]);
  expect(
    linearInterpolationPoints([10, 10], [-10, -10], { partition: 4 })
  ).toEqual([
    [10, 10],
    [6, 6],
    [2, 2],
    [-2, -2],
    [-6, -6],
    [-10, -10],
  ]);
});
