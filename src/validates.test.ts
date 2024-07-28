import {
  validLinearRing,
  validPoints,
  validPoint,
  validNumber,
} from "./_validates";
import {
  InvalidLinearRingError,
  InvalidPointsError,
  InvalidPointError,
  InvalidNumberError,
} from "./errors";

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

  expect(validPoint([1, 0])).toBeUndefined();

  expect(validNumber(100)).toBeUndefined();
});

it("invalid", () => {
  expect(() => {
    validLinearRing([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, "1"],
    ]);
  }).toThrow(InvalidLinearRingError);
  expect(() => {
    validLinearRing([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
  }).toThrow(InvalidLinearRingError);
  expect(() => {
    validLinearRing([
      [0, 0],
      [1, 0],
      [0, 0],
    ]);
  }).toThrow(InvalidLinearRingError);
  expect(() => {
    validLinearRing(100);
  }).toThrow(InvalidLinearRingError);

  expect(() => {
    validPoints([
      [0, 0],
      [0, "1"],
    ]);
  }).toThrow(InvalidPointsError);
  expect(() => {
    validPoints([[0, 0], [0]]);
  }).toThrow(InvalidPointsError);
  expect(() => {
    validPoints(100);
  }).toThrow(InvalidPointsError);

  expect(() => {
    validPoint([0, "1"]);
  }).toThrow(InvalidPointError);
  expect(() => {
    validPoint([0]);
  }).toThrow(InvalidPointError);

  expect(() => {
    validNumber("100");
  }).toThrow(InvalidNumberError);
  expect(() => {
    validNumber(Infinity);
  }).toThrow(InvalidNumberError);
  expect(() => {
    validNumber(NaN);
  }).toThrow(InvalidNumberError);
});
