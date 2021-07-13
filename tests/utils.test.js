const {
  isCcw,
  within,
  intersection,
  selfintersection,
  getCrs,
} = require("../dist/utils.js");
const { InvalidCodeError } = require("../dist/errors.js");

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
      ],
      { includeBorder: true }
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
      ],
      { includeBorder: true }
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
