# flatten

## cutRingAtAntimeridian

```JavaScript
import { flatten } from "geo4326";
flatten.cutRingAtAntimeridian(
    [
      [-160, 40],
      [175, 40],
      [-175, 35],
      [175, 30],
      [-160, 30],
      [-160, 40],
    ]
)
// {
//   "within": [
//     [
//       [180, 40.0],
//       [175, 40],
//       [180, 37.5],
//       [180, 40.0],
//     ],
//     [
//       [180, 32.5],
//       [175, 30],
//       [180, 30],
//       [180, 32.5],
//     ],
//   ],
//   "outside": [
//     [
//       [-180, 30.0],
//       [-160, 30],
//       [-160, 40],
//       [-180, 40.0],
//       [-180, 37.5],
//       [-175, 35],
//       [-180, 32.5],
//       [-180, 30.0],
//     ],
//   ],
// }
```

#### props

| Name                          | Type                        | Description                                                                                                  |
| ----------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| linearRing                    | [Points](./TYPES.md#points) | **REQUIRED.** Source linear ring. The distance in the longitude between the points must be less than 180deg. |
| options                       | object                      | optional params.                                                                                             |
| options.overflowing           | bool                        | If True, linearRing is right side of the antimeridian. (DEFAULT=false)                                       |
| options.allowSelfintersection | bool                        | If True, allow self-intersection of linearRing. (DEFAULT=false)                                              |

#### return

object([CutRing](./TYPES.md#cutring))

## expandRingAtAntimeridian

```JavaScript
import { flatten } from "geo4326";
flatten.expandRingAtAntimeridian(
    [
      [175, 40],
      [185, 38],
      [185, 35],
      [185, 32],
      [175, 30],
      [185, 30],
      [200, 30],
      [200, 40],
      [185, 40],
      [175, 40],
    ]
)
// [
//   [175, 40],
//   [185, 38],
//   [185, 35],
//   [185, 32],
//   [175, 30],
//   [185, 30],
//   [200, 30],
//   [200, 40],
//   [185, 40],
//   [175, 40],
// ]
```

#### props

| Name       | Type                        | Description                                                                                                  |
| ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** Source linear ring. The distance in the longitude between the points must be less than 180deg. |

#### return

linearRing([Points](./TYPES.md#points))
