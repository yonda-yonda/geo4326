const {
  validLinearRing,
  validPoints,
  validPoint,
  validNumber
} = require("../dist/_validates.js");
const {
  InvalidLinearRingError,
  InvalidPointsError,
  InvalidPointError,
  InvalidNumberError
} = require("../dist/errors.js");

it("valid", () => {
  expect(
    validLinearRing([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ])
  ).toBeUndefined();

  expect(
    validPoints([
      [0, 0],
      [1, 0],
    ])
  ).toBeUndefined();

  expect(
    validPoint(
      [1, 0]
    )
  ).toBeUndefined();

  expect(
    validNumber(
      100
    )
  ).toBeUndefined();
});

it("invalid", () => {
  expect(() => {
    validLinearRing([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, "1"],
    ]);
  }).toThrowError(InvalidLinearRingError);
  expect(() => {
    validLinearRing([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
  }).toThrowError(InvalidLinearRingError);
  expect(() => {
    validLinearRing([
      [0, 0],
      [1, 0],
      [0, 0],
    ]);
  }).toThrowError(InvalidLinearRingError);
  expect(() => {
    validLinearRing(100);
  }).toThrowError(InvalidLinearRingError);

  expect(() => {
    validPoints([
      [0, 0],
      [0, "1"],
    ]);
  }).toThrowError(InvalidPointsError);
  expect(() => {
    validPoints([
      [0, 0],
      [0],
    ]);
  }).toThrowError(InvalidPointsError);
  expect(() => {
    validPoints(100);
  }).toThrowError(InvalidPointsError);

  expect(() => {
    validPoint([0, "1"]);
  }).toThrowError(InvalidPointError);
  expect(() => {
    validPoint([0]);
  }).toThrowError(InvalidPointError);

  expect(() => {
    validNumber("100");
  }).toThrowError(InvalidNumberError);
  expect(() => {
    validNumber(Infinity);
  }).toThrowError(InvalidNumberError);
  expect(() => {
    validNumber(NaN);
  }).toThrowError(InvalidNumberError);
});