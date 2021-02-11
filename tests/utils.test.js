const {
  isCcw,
  within,
  intersection,
  selfintersection,
} = require("../dist/utils.js");

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
});
