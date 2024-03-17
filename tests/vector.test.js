const {
  unit,
  norm,
  add,
  multiple,
  dot,
  cross,
  rodoriguesRotate,
} = require("../dist/vector.js");

it("norm", () => {
  expect(norm({ x: 1, y: 2, z: 2 })).toBe(3);
  expect(norm({ x: 1, y: -2, z: 2 })).toBe(3);
});

it("unit", () => {
  expect(unit({ x: 2, y: 2, z: -2 })).toEqual({
    x: 0.5773502691896258,
    y: 0.5773502691896258,
    z: -0.5773502691896258,
  });
});

it("add", () => {
  expect(add({ x: 2, y: 2, z: -2 }, { x: -2, y: -2, z: 3 })).toEqual({
    x: 0,
    y: 0,
    z: 1,
  });
});

it("multiple", () => {
  expect(multiple({ x: 2, y: 2, z: -2 }, 10)).toEqual({
    x: 20,
    y: 20,
    z: -20,
  });
});

it("dot", () => {
  expect(dot({ x: 1, y: 2, z: 3 }, { x: -1, y: 10, z: 100 })).toBe(319);
});

it("cross", () => {
  expect(cross({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toEqual({
    x: -3,
    y: 6,
    z: -3,
  });
});

it("rodoriguesRotate", () => {
  expect(
    rodoriguesRotate({ x: 1, y: 0, z: 0 }, 180, { x: 2, y: 1, z: 0 })
  ).toEqual({
    x: 2,
    y: -1,
    z: 1.2246467991473532e-16,
  });
});
