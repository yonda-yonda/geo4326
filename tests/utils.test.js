const {
  area,
  isCcw,
  within,
  intersection,
  selfintersection,
  getCrs,
  hasSingularity,
  overlapping,
  enclosing,
} = require("../dist/utils.js");
const {
  InvalidCodeError
} = require("../dist/errors.js");

it("area", () => {
  expect(
    area([
      [-10, -10],
      [10, -10],
      [10, 10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBe(400);
  expect(
    area([
      [-10, -10],
      [-10, 10],
      [10, 10],
      [10, -10],
      [-10, -10],
    ])
  ).toBe(400);
  expect(
    area([
      [0, 0],
      [6, 0],
      [3, 4],
      [0, 0],
    ])
  ).toBe(12);
});

it("isCcw", () => {
  expect(
    isCcw([
      [-10, -10],
      [10, -10],
      [10, 10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBeTruthy();
  expect(
    isCcw([
      [-10, -10],
      [-10, 10],
      [10, 10],
      [10, -10],
      [-10, -10],
    ])
  ).toBeFalsy();
  expect(
    isCcw([
      [170, -10],
      [-170, -10],
      [-170, 10],
      [170, 10],
      [170, -10],
    ])
  ).toBeFalsy();
});

it("within", () => {
  expect(
    within(
      [0, 0],
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ]
    )
  ).toBeTruthy();

  expect(
    within(
      [0, 100],
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ]
    )
  ).toBeFalsy();

  expect(
    within(
      [-10, -10],
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ]
    )
  ).toBeFalsy();

  expect(
    within(
      [-10, -10],
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ], {
        includeBorder: true
      }
    )
  ).toBeTruthy();

  expect(
    within(
      [0, -10],
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ]
    )
  ).toBeFalsy();

  expect(
    within(
      [0, -10],
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ], {
        includeBorder: true
      }
    )
  ).toBeTruthy();

  expect(
    within(
      [0, 0],
      [
        [170, -10],
        [-170, -10],
        [-170, 10],
        [170, 10],
        [170, -10],
      ]
    )
  ).toBeTruthy();

  expect(
    within(
      [180, 0],
      [
        [170, -10],
        [-170, -10],
        [-170, 10],
        [170, 10],
        [170, -10],
      ]
    )
  ).toBeFalsy();

  expect(
    within(
      [-180, 0],
      [
        [170, -10],
        [-170, -10],
        [-170, 10],
        [170, 10],
        [170, -10],
      ]
    )
  ).toBeFalsy();
});

it("intersection", () => {
  expect(intersection([0, 0], [10, 10], [1, 8], [9, 2])).toBeTruthy();

  expect(intersection([0, 0], [10, 10], [1, 8], [-9, 2])).toBeFalsy();

  expect(intersection([0, 0], [10, 10], [1, 8], [5, 5])).toBeTruthy();

  expect(intersection([0, 0], [10, 10], [1, 8], [4, 5])).toBeFalsy();

  expect(intersection([0, 0], [10, 10], [2, 2], [5, 5])).toBeTruthy();

  expect(intersection([0, 0], [10, 10], [-2, -2], [5, 5])).toBeTruthy();
});

it("selfintersection", () => {
  expect(
    selfintersection([
      [-10, -10],
      [10, -10],
      [10, 10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBeFalsy();

  expect(
    selfintersection([
      [-10, -10],
      [-10, 10],
      [10, 10],
      [10, -10],
      [-10, -10],
    ])
  ).toBeFalsy();

  expect(
    selfintersection([
      [-10, -10],
      [10, -10],
      [10, 10],
      [0, 10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBeFalsy();

  expect(
    selfintersection([
      [-10, -10],
      [10, -10],
      [10, 10],
      [0, -10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBeTruthy();

  expect(
    selfintersection([
      [-10, -10],
      [10, -10],
      [20, -10],
      [-10, -10],
    ])
  ).toBeTruthy();

  expect(
    selfintersection([
      [-10, -10],
      [10, -10],
      [-15, 0],
      [10, 10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBeTruthy();

  expect(
    selfintersection([
      [-10, -10],
      [10, -10],
      [10, 10],
      [10, 10],
      [-10, 10],
      [-10, -10],
    ])
  ).toBeFalsy();
});

it("getCrs", () => {
  expect(getCrs(4326)).toBe("+proj=longlat +datum=WGS84 +no_defs");
  expect(getCrs("EPSG:3031")).toBe(
    "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
  );
  expect(getCrs("epsg:3031")).toBe(
    "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
  );
  expect(getCrs("epsg3031")).toBe("epsg3031");

  expect(() => {
    getCrs("epsg:1");
  }).toThrowError(InvalidCodeError);
});

it("hasSingularity", () => {
  expect(hasSingularity([
    [10, 10],
    [NaN, 1]
  ])).toBeTruthy();
  expect(hasSingularity([
    [10, 10],
    [0, 1]
  ])).toBeFalsy();
  expect(hasSingularity([
    [Infinity, 10],
    [0, 1]
  ])).toBeTruthy();
  expect(hasSingularity([
    [-100, -Infinity],
    [0, 1]
  ])).toBeTruthy();
});

it("overlapping", () => {
  expect(overlapping([
    [175.0, 1.0],
    [190.0, 1.0],
    [190.0, 10.0],
    [175.0, 10.0],
    [175.0, 1.0],
  ], [
    [170.0, 0.0],
    [180.0, 0.0],
    [180.0, 5.0],
    [170.0, 5.0],
    [170.0, 0.0],
  ])).toBeTruthy();
  expect(overlapping([
    [180.0, 5.0],
    [185.0, 5.0],
    [185.0, 10.0],
    [180.0, 10.0],
    [180.0, 5.0],
  ], [
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ])).toBeTruthy();
  expect(overlapping([
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ], [
    [70.0, 0.0],
    [80.0, 0.0],
    [80.0, 5.0],
    [70.0, 5.0],
    [70.0, 0.0],
  ])).toBeFalsy();
  expect(overlapping([
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ], [
    [160.0, -10.0],
    [170.0, -10.0],
    [170.0, 0.0],
    [160.0, 0.0],
    [160.0, -10.0],
  ])).toBeTruthy();
});

it("enclosing", () => {
  expect(enclosing([
    [180.0, 5.0],
    [185.0, 5.0],
    [185.0, 10.0],
    [180.0, 10.0],
    [180.0, 5.0],
  ], [
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ])).toBeTruthy();
  expect(enclosing([
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ], [
    [180.0, 5.0],
    [185.0, 5.0],
    [185.0, 10.0],
    [180.0, 10.0],
    [180.0, 5.0],
  ])).toBeFalsy();
  expect(enclosing([
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ], [
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ])).toBeTruthy();
  expect(enclosing([
    [160.0, -10.0],
    [170.0, -10.0],
    [170.0, 0.0],
    [160.0, 0.0],
    [160.0, -10.0],
  ], [
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ])).toBeFalsy();
  expect(enclosing([
    [0.0, 0.0],
    [10.0, 0.0],
    [10.0, 10.0],
    [0.0, 10.0],
    [0.0, 0.0],
  ], [
    [170.0, 0.0],
    [190.0, 0.0],
    [190.0, 10.0],
    [170.0, 10.0],
    [170.0, 0.0],
  ])).toBeFalsy();
});