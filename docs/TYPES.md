# types

## Position

Coordinate value, Array of number. ex: [x, y]

## Points

Array of Position.

## CutRing

object

| Name    | Type                          | Description                                            |
| ------- | ----------------------------- | ------------------------------------------------------ |
| within  | [[Points](./TYPES.md#points)] | list of linear ring at left side of the antimeridian.  |
| outside | [[Points](./TYPES.md#points)] | list of linear ring at right side of the antimeridian. |
