const { validLinearRing } = require("../dist/_validates.js");
const { InvalidLinearRingError } = require("../dist/errors.js");

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
});

it("invalid", () => {
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
});
