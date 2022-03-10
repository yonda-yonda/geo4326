# utils

## area

```JavaScript
import { utils } from "geo4326";
utils.area([
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
  [-10, -10],
])
// 400
```

#### props

| Name       | Type                        | Description               |
| ---------- | --------------------------- | ------------------------- |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

number

## isCcw

```JavaScript
import { utils } from "geo4326";
utils.isCcw([
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
  [-10, -10],
])
// true
```

#### props

| Name       | Type                        | Description               |
| ---------- | --------------------------- | ------------------------- |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

boolean

## within

Winding Number Algorithm

```JavaScript
import { utils } from "geo4326";
utils.within(
  [0, 0],
  [
    [-10, -10],
    [10, -10],
    [10, 10],
    [-10, 10],
    [-10, -10],
  ]
)
// true
```

#### props

| Name                  | Type                            | Description                                                |
| --------------------- | ------------------------------- | ---------------------------------------------------------- |
| point                 | [Position](./TYPES.md#position) | **REQUIRED.** point                                        |
| linearRing            | [Points](./TYPES.md#points)     | **REQUIRED.** linear ring                                  |
| options               | object                          | optional params.                                           |
| options.includeBorder | boolean                         | If true, allow point overlapping the ring. (DEFAULT=false) |

#### return

boolean

## intersection

When line1(p1 -> p2) and line2(p3 -> p4) are crossing or points more than 3 are on a line, return True

```JavaScript
import { utils } from "geo4326";
utils.intersection([0, 0], [10, 10], [1, 8], [9, 2])
// true
```

#### props

| Name | Type                            | Description                        |
| ---- | ------------------------------- | ---------------------------------- |
| p1   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line1. |
| p2   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line1. |
| p3   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line2. |
| p4   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line2. |

#### return

boolean

## selfintersection

not support warp polygon.

```JavaScript
import { utils } from "geo4326";
utils.selfintersection([
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
  [-10, -10],
])
// false
```

#### props

| Name       | Type                        | Description               |
| ---------- | --------------------------- | ------------------------- |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

boolean

## hasSingularity

Check containing singularity point.

```JavaScript
import { utils } from "geo4326";
utils.hasSingularity([
  [-10, -10],
  [10, -10],
  [10, NaN],
  [-10, 10],
  [-10, -10],
])
// true
```

#### props

| Name   | Type                        | Description                  |
| ------ | --------------------------- | ---------------------------- |
| points | [Points](./TYPES.md#points) | **REQUIRED.** checked points |

#### return

boolean

## overlapping

Check whether two linear rings overlap.

```JavaScript
import { utils } from "geo4326";
utils.overlapping([
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
])
// true
```

#### props

| Name | Type                        | Description               |
| ---- | --------------------------- | ------------------------- |
| l1   | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |
| l2   | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

boolean

## enclosing

Check outer linear ring encloses inner linear ring.

```JavaScript
import { utils } from "geo4326";
utils.enclosing([
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
])
// true
```

#### props

| Name  | Type                        | Description               |
| ----- | --------------------------- | ------------------------- |
| inner | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |
| outer | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

boolean
