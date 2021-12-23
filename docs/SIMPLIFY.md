# utils

## rdp

Ramer–Douglas–Peucker Algorithm

```JavaScript
import { simplify } from "geo4326";
simplify.rdp([
    [0, 30],
    [1, 30.5],
    [4, 30],
    [6, 30.2],
    [8, 30.1],
    [9, 30.15],
    [12, 29.5],
    [40, 40],
    [23, 40],
    [27, 55],
    [25, 54],
    [20, 57],
    [0, 52],
    [-24, 53],
    [-24, 50],
    [-24, 47],
    [-24, 44],
    [-24, 41],
    [-24, 38],
    [0, 30]
], {
    area: true,
    limit: 10
})
// [
//     [0, 30],
//     [12, 29.5],
//     [40, 40],
//     [23, 40],
//     [27, 55],
//     [20, 57],
//     [0, 52],
//     [-24, 53],
//     [-24, 38],
//     [0, 30]
// ]
```

#### props

| Name              | Type                        | Description                                                                            |
| ----------------- | --------------------------- | -------------------------------------------------------------------------------------- |
| linearRing        | [Points](./TYPES.md#points) | **REQUIRED.** linear ring                                                              |
| options           | object                      | optional params.                                                                       |
| options.area      | boolean                     | If true, use area of triangles to determine. Otherwise, perpendicular. (DEFAULT=false) |
| options.threshold | boolean                     | threshold value(DEFAULT=0.001)                                                         |
| options.limit     | number                      | If given, ring is simplified until number of points under limit.                       |

#### return

[Points](./TYPES.md#points)

## vw

Visvalingam–Whyatt Algorithm

```JavaScript
import { simplify } from "geo4326";
simplify.vw([
    [0, 30],
    [1, 30.5],
    [4, 30],
    [6, 30.2],
    [8, 30.1],
    [9, 30.15],
    [12, 29.5],
    [40, 40],
    [23, 40],
    [27, 55],
    [25, 54],
    [20, 57],
    [0, 52],
    [-24, 53],
    [-24, 50],
    [-24, 47],
    [-24, 44],
    [-24, 41],
    [-24, 38],
    [0, 30]
], {
    limit: 10
})
// [
//   [0, 30],
//   [12, 29.5],
//   [40, 40],
//   [23, 40],
//   [27, 55],
//   [20, 57],
//   [0, 52],
//   [-24, 53],
//   [-24, 38],
//   [0, 30]
// ]
```

#### props

| Name              | Type                        | Description                                                                                  |
| ----------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| linearRing        | [Points](./TYPES.md#points) | **REQUIRED.** linear ring                                                                    |
| options           | object                      | optional params.                                                                             |
| options.rate      | boolean                     | If true, area of smallest triangle is compared to "threshold \* whole area". (DEFAULT=false) |
| options.threshold | boolean                     | threshold value(DEFAULT=0.001)                                                               |
| options.limit     | number                      | If given, ring is simplified until number of points under limit.                             |

#### return

[Points](./TYPES.md#points)
